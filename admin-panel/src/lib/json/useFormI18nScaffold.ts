// =============================================================
// FILE: src/lib/json/useFormI18nScaffold.ts
// FINAL — FormI18nScaffold (hook) + deterministic deps (hardened)
// =============================================================

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { applyI18nJsonToFlatForm, buildI18nJsonFromFlatValues } from './i18nFormAdapter';
import { ensureLangKeys } from './i18nNormalize';
import type { LangDef } from './types';

type DfSyncPair = {
  dfField: string;
  srcField: (firstUILangId: string) => string;
  validate?: boolean;
};

function safeStr(x: any) {
  return String(x ?? '').trim();
}

function stableSig(v: any) {
  if (Array.isArray(v)) {
    let out = '';
    for (let i = 0; i < v.length; i++) {
      const x = v[i];
      out += i ? '\u0001' : '';
      if (x === undefined) out += '∅';
      else if (x === null) out += '∅n';
      else if (typeof x === 'string') out += x;
      else if (typeof x === 'number' || typeof x === 'boolean') out += String(x);
      else {
        try {
          out += JSON.stringify(x);
        } catch {
          out += '[unserializable]';
        }
      }
    }
    return out;
  }

  if (v && typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return '[unserializable]';
    }
  }

  return String(v ?? '');
}

export function useFormI18nScaffold<TFormValues extends Record<string, any>>(args: {
  languages: LangDef[];
  excludeLangIds?: string[];
  fields: string[];

  control: any;
  getValues: () => any;
  setValueAny: (name: string, value: any, options?: any) => void;

  extraWatchNames?: string[];
  keyOf?: (field: string, langId: string) => string;

  dfSync?: {
    enabled: boolean;
    pairs: DfSyncPair[];
  };

  syncFromForm?: boolean; // default true
  markDirtyOnJsonApply?: boolean; // default true
}) {
  const {
    languages,
    excludeLangIds = [],
    fields,
    control,
    getValues,
    setValueAny,
    extraWatchNames = [],
    keyOf = (field, langId) => `${field}_${langId}`,
    dfSync,
    syncFromForm = true,
    markDirtyOnJsonApply = true,
  } = args;

  const uiLangs = useMemo(() => {
    const base = Array.isArray(languages) ? languages : [];
    const allValid = base.filter((l) => !!l?.id);
    const excluded = new Set((excludeLangIds ?? []).map((x) => String(x)));
    const filtered = allValid.filter((l) => !excluded.has(String(l.id)));
    return filtered.length > 0 ? filtered : allValid;
  }, [languages, excludeLangIds]);

  const firstUILangId = useMemo(() => uiLangs?.[0]?.id ?? 'tr', [uiLangs]);

  const [translationsJson, setTranslationsJson] = useState<any>({});
  const applyingJsonRef = useRef(false);
  const syncingFromFormRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastJsonStrRef = useRef<string>('');

  const watchNames = useMemo(() => {
    const names: string[] = [];

    for (const lang of uiLangs) {
      for (const f of fields) names.push(keyOf(f, lang.id));
    }
    for (const x of extraWatchNames) names.push(x);

    return Array.from(new Set(names));
  }, [uiLangs, fields, keyOf, extraWatchNames]);

  const watched = useWatch({ control, name: watchNames as any });
  const watchedSig = useMemo(() => stableSig(watched), [watched]);

  const dfSrcNames = useMemo(() => {
    if (!dfSync?.enabled) return [];
    const pairs = Array.isArray(dfSync.pairs) ? dfSync.pairs : [];
    return pairs.map((p) => p.srcField(firstUILangId));
  }, [dfSync?.enabled, dfSync?.pairs, firstUILangId]);

  const dfSrcValues = useWatch({ control, name: dfSrcNames as any });
  const dfSrcSig = useMemo(() => stableSig(dfSrcValues), [dfSrcValues]);

  useEffect(() => {
    if (!dfSync?.enabled) return;

    const cur = getValues() as any;
    const pairs = Array.isArray(dfSync.pairs) ? dfSync.pairs : [];

    for (const p of pairs) {
      const srcKey = p.srcField(firstUILangId);
      const next = safeStr(cur?.[srcKey]);
      const now = safeStr(cur?.[p.dfField]);

      if (now !== next) {
        setValueAny(p.dfField, next, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: p.validate ?? false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dfSync?.enabled, firstUILangId, dfSrcSig]);

  const applyJsonToForm = (json: any, opts?: { markDirty?: boolean }) => {
    applyingJsonRef.current = true;

    const safe = ensureLangKeys(json, uiLangs);
    const md = opts?.markDirty ?? markDirtyOnJsonApply;

    applyI18nJsonToFlatForm<TFormValues>({
      json: safe,
      languages: uiLangs,
      fields: [...fields],
      setValue: ((name: any, value: any) =>
        setValueAny(String(name), value, {
          shouldDirty: md,
          shouldTouch: md,
          shouldValidate: md,
        })) as any,
      keyOf,
    });

    queueMicrotask(() => {
      applyingJsonRef.current = false;
    });
  };

  const handleTranslationsJsonChange = (next: any) => {
    const safeNext = ensureLangKeys(next, uiLangs);
    const nextStr = JSON.stringify(safeNext);

    lastJsonStrRef.current = nextStr;
    setTranslationsJson(safeNext);
    applyJsonToForm(safeNext, { markDirty: true });
  };

  const rebuildJsonNow = () => {
    const snap = getValues() as any;

    const built = buildI18nJsonFromFlatValues({
      values: snap,
      languages: uiLangs,
      fields: [...fields],
      keyOf,
      skipEmpty: false,
    });

    const safeBuilt = ensureLangKeys(built, uiLangs);
    const nextStr = JSON.stringify(safeBuilt);

    if (nextStr !== lastJsonStrRef.current) {
      lastJsonStrRef.current = nextStr;
      setTranslationsJson(safeBuilt);
    }
  };

  useEffect(() => {
    if (!syncFromForm) return;
    if (applyingJsonRef.current) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      if (!syncFromForm) return;
      if (applyingJsonRef.current) return;
      if (syncingFromFormRef.current) return;

      syncingFromFormRef.current = true;
      try {
        rebuildJsonNow();
      } finally {
        queueMicrotask(() => {
          syncingFromFormRef.current = false;
        });
      }
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncFromForm, firstUILangId, watchedSig]);

  return {
    uiLangs,
    firstUILangId,
    translationsJson,
    setTranslationsJson,
    applyJsonToForm,
    handleTranslationsJsonChange,
    rebuildJsonNow,
  };
}
