// =============================================================
// FILE: src/lib/json/types.ts
// FINAL — shared types (single source of truth)
// =============================================================

export type LangDef = { id: string; label?: string };

export type LangKeys = keyof IntlMessages['lang'];
export type ViewMode = 'form' | 'json';

export type LangType = { id: string; label: string };