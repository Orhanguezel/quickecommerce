// =============================================================
// FILE: src/lib/json/i18nFormInit.ts
// FINAL — deterministic DB -> Form initializer (hardened, no-break)
// - validateFields optional, defaults to ["name"]
// =============================================================

import { normalizeTranslationsMap } from './i18nNormalize';

type SetValueAny = (name: string, value: any, options?: any) => void;

export function initI18nFlatFormFromEntity(args: {
  editData: any;
  firstUILangId: string;
  uiLangs: Array<{ id: string }>;
  i18nFields: readonly string[];
  setValueAny: SetValueAny;

  statusKey?: string; // default "status"
  entityFieldMap?: Partial<Record<string, string>>;
  validateFields?: readonly string[]; // default ["name"]
  after?: () => void;
}) {
  const {
    editData,
    firstUILangId,
    uiLangs,
    i18nFields,
    setValueAny,
    statusKey = 'status',
    entityFieldMap,
    validateFields = ['name'],
    after,
  } = args;

  if (!editData) {
    after?.();
    return;
  }

  const shouldValidateField = (f: string) => (validateFields ?? []).includes(f);

  const getEntityVal = (field: string) => {
    const key = entityFieldMap?.[field] ?? field;
    const v = editData?.[key];
    return v ?? '';
  };

  // 1) Root/default -> first UI language
  for (const f of i18nFields) {
    setValueAny(`${f}_${firstUILangId}`, getEntityVal(f), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: shouldValidateField(f),
    });
  }

  // 2) status (varsa)
  const st = editData?.[statusKey];
  if (st !== undefined && st !== null) {
    setValueAny(statusKey, String(st), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }

  // 3) translations -> flat fields
  const trMap = normalizeTranslationsMap(editData?.translations, i18nFields);

  for (const langId of Object.keys(trMap)) {
    const block = trMap[langId] || {};
    for (const f of i18nFields) {
      setValueAny(`${f}_${langId}`, block?.[f] ?? '', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: shouldValidateField(f),
      });
    }
  }

  after?.();
}
