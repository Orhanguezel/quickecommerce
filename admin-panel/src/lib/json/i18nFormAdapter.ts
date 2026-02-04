// ===============================================
// FILE: src/lib/json/i18nFormAdapter.ts
// FINAL — TS strict friendly adapter typings (hardened)
// ===============================================

import type { UseFormSetValue } from 'react-hook-form';
import type { LangDef } from './types';

type KeyOfFn = (field: string, langId: string) => string;

function isObject(v: unknown): v is Record<string, any> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function uniqLangs(langs: LangDef[]) {
  const seen = new Set<string>();
  const out: LangDef[] = [];
  for (const l of langs ?? []) {
    const id = String(l?.id ?? '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, label: l?.label });
  }
  return out;
}

export function applyI18nJsonToFlatForm<TFieldValues extends Record<string, any>>(args: {
  json: unknown;
  languages: LangDef[];
  fields: string[];
  setValue: UseFormSetValue<TFieldValues>;
  keyOf?: KeyOfFn;
  setValueOptions?: Parameters<UseFormSetValue<TFieldValues>>[2];
}) {
  const {
    json,
    languages,
    fields,
    setValue,
    keyOf = (field, langId) => `${field}_${langId}`,
    setValueOptions,
  } = args;

  const obj = isObject(json) ? (json as any) : {};
  const langs = uniqLangs(languages);

  for (const lang of langs) {
    const block = obj?.[lang.id];
    if (!isObject(block)) continue;

    for (const field of fields ?? []) {
      const v = (block as any)[field];
      if (v === undefined) continue;

      setValue(keyOf(field, lang.id) as any, v as any, setValueOptions);
    }
  }
}

export function buildI18nJsonFromFlatValues(args: {
  values: Record<string, any>;
  languages: LangDef[];
  fields: string[];
  keyOf?: KeyOfFn;
  skipEmpty?: boolean;
}) {
  const {
    values,
    languages,
    fields,
    keyOf = (field, langId) => `${field}_${langId}`,
    skipEmpty = true,
  } = args;

  const out: Record<string, any> = {};
  const langs = uniqLangs(languages);

  for (const lang of langs) {
    const block: Record<string, any> = {};
    for (const field of fields ?? []) {
      const key = keyOf(field, lang.id);
      const v = (values as any)?.[key];

      if (skipEmpty) {
        if (v === undefined || v === null) continue;
        if (typeof v === 'string' && v.trim() === '') continue;
        if (Array.isArray(v) && v.length === 0) continue;
      }

      block[field] = v;
    }
    if (Object.keys(block).length > 0) out[lang.id] = block;
  }

  return out;
}
