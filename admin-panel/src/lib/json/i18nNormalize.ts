//==============================================================//
// FILE: src/lib/json/i18nNormalize.ts
// FINAL — helpers for i18n normalization (hardened)
// - normalizeTranslationsMap supports multiple backend shapes
// - ensureLangKeys: always returns {langId:{}} for every ui lang
//============================================================================//

import { safeObject } from './rhf';

/**
 * Normalize backend translations to:
 * { [langId]: { field: value } }
 */
export function normalizeTranslationsMap(
  raw: any,
  fields: readonly string[],
): Record<string, Record<string, any>> {
  const out: Record<string, Record<string, any>> = {};
  if (!raw) return out;

  // Case A: array of translations rows
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const lang = item?.language_code || item?.language || item?.lang;
      if (!lang) continue;

      const block: Record<string, any> = {};
      for (const f of fields) {
        // backend may use different keys; we only pick requested fields
        block[f] = item?.[f] ?? '';
      }
      out[String(lang)] = block;
    }
    return out;
  }

  // Case B: object keyed by language
  const src = safeObject(raw);
  for (const langId of Object.keys(src)) {
    const val = (src as any)[langId];
    const block: Record<string, any> = {};

    // sometimes backend sends: { tr: [{...}] }
    if (Array.isArray(val)) {
      const first = val[0] ?? {};
      for (const f of fields) block[f] = (first as any)?.[f] ?? '';
      out[langId] = block;
      continue;
    }

    // typical: { tr: { name:"..." } }
    if (val && typeof val === 'object') {
      for (const f of fields) block[f] = (val as any)?.[f] ?? '';
      out[langId] = block;
    }
  }

  return out;
}

/**
 * Ensure all language keys exist in json:
 * - returns a new object (shallow clone)
 * - guarantees out[langId] is a plain object
 */
export function ensureLangKeys(json: any, langs: Array<{ id: string }>) {
  const base = safeObject(json);
  const out: Record<string, any> = { ...base };

  for (const l of langs ?? []) {
    const id = l?.id;
    if (!id) continue;
    const cur = out[id];
    out[id] = cur && typeof cur === 'object' && !Array.isArray(cur) ? cur : {};
  }

  return out;
}
