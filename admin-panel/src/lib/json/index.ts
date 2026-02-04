// =============================================================
// FILE: src/lib/json/index.ts
// FINAL — barrel exports (no type ambiguity)
// =============================================================

export * from './AdminI18nJsonPanel';
export * from './useFormI18nScaffold';
export * from './i18nFormInit';
export * from './i18nNormalize';
export * from './i18nFormAdapter';
export * from './rhf';

// types: single source
export type { LangDef, LangKeys, ViewMode, LangType } from './types';
