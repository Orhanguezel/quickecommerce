// =============================================================
// FILE: src/lib/json/AdminI18nJsonPanel.tsx
// FINAL — stable tabs + safe active sync + predictable behavior (hardened)
// =============================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AdminJsonEditor } from './JsonEditor';
import type { LangDef } from './types';

type Props = {
  label?: React.ReactNode;
  languages: LangDef[];
  value: unknown; // root i18n json: { tr: {...}, en: {...} }
  onChange: (next: any) => void;
  disabled?: boolean;
  helperText?: React.ReactNode;
  height?: number;

  /** true: her dil ayrı JSON (tr/en) | false: tek JSON (root) */
  perLanguage?: boolean;

  /** true: "ALL" tabı göster */
  showAllTab?: boolean;

  /** initial tab id (prop sonradan değişirse active güncellenir) */
  initialActiveId?: string;
};

type Tab = { id: string; label: string };

function isObject(v: unknown): v is Record<string, any> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function uniqTabs(languages: LangDef[]) {
  const seen = new Set<string>();
  const out: Tab[] = [];
  for (const l of languages ?? []) {
    const id = String(l?.id ?? '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, label: l?.label ?? id });
  }
  return out;
}

export const AdminI18nJsonPanel: React.FC<Props> = ({
  label,
  languages,
  value,
  onChange,
  disabled,
  helperText,
  height = 360,
  perLanguage = true,
  showAllTab = false,
  initialActiveId,
}) => {
  const safeObj = useMemo<Record<string, any>>(() => (isObject(value) ? value : {}), [value]);

  const tabs = useMemo<Tab[]>(() => {
    const base = uniqTabs(languages);

    // perLanguage=false ise root edit var; ALL tab UX olarak gereksiz
    if (!perLanguage) return base.length ? base : [];

    return showAllTab ? [{ id: '__all__', label: 'All' }, ...base] : base;
  }, [languages, showAllTab, perLanguage]);

  const fallbackActive = useMemo(() => {
    if (perLanguage && showAllTab) return '__all__';
    const first = (languages ?? []).find((x) => !!x?.id)?.id;
    return first ? String(first) : '__all__';
  }, [languages, perLanguage, showAllTab]);

  const resolveActive = (candidate?: string) => {
    const id = String(candidate ?? '').trim();
    if (!id) return fallbackActive;

    const exists =
      tabs.some((t) => t.id === id) || (perLanguage && showAllTab && id === '__all__');

    return exists ? id : fallbackActive;
  };

  const [active, setActive] = useState<string>(() => resolveActive(initialActiveId));

  // initialActiveId değişirse active'i güncelle (invalid ise fallback)
  useEffect(() => {
    if (!initialActiveId) return;
    setActive(resolveActive(initialActiveId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialActiveId]);

  // tabs/languages değişirse active geçerli mi kontrol et
  useEffect(() => {
    setActive((cur) => resolveActive(cur));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, fallbackActive, perLanguage, showAllTab]);

  const currentValue = useMemo(() => {
    if (!perLanguage) return safeObj;
    if (active === '__all__') return safeObj;

    const v = safeObj?.[active];
    return isObject(v) ? v : {};
  }, [safeObj, perLanguage, active]);

  const handleChange = (next: any) => {
    // root edit
    if (!perLanguage || active === '__all__') {
      onChange(isObject(next) ? next : {});
      return;
    }

    // active lang edit
    const merged: Record<string, any> = { ...safeObj };
    merged[active] = isObject(next) ? next : {};
    onChange(merged);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
      {(label || tabs.length > 0) && (
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</div>

          {tabs.length > 0 && (
            <div className="inline-flex flex-wrap gap-2">
              {tabs.map((t) => {
                const isActive = active === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActive(t.id)}
                    disabled={disabled}
                    className={[
                      'px-3 py-1.5 text-sm font-medium rounded-md border transition',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
                      disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800',
                    ].join(' ')}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <AdminJsonEditor
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        helperText={helperText}
        height={height}
      />
    </div>
  );
};
