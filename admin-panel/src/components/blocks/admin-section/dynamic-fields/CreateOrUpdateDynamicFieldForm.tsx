// =============================================================
// FILE: src/components/blocks/admin-section/dynamic-fields/CreateOrUpdateDynamicFieldForm.tsx
// FINAL — DynamicField Form (Form + JSON) — SAME PATTERN as TagForm (DF + JSON Scaffold)
// Fixes / Guarantees:
// - Controlled Tabs (Radix defaultValue kullanılmaz)
// - DF contract: name_df hidden register + dfSync (useFormI18nScaffold)
// - JSON <-> Form sync ONLY via scaffold (no manual sync, no drift)
// - Programmatic register for i18n fields (Tabs unmount safety)
// - Slug auto ONLY from first UI lang name (minimal watch; no whole-form watch)
// - AppSelect value always string (no undefined)
// - is_required => 1/0
// - translations exclude firstUILangId and include only non-empty
// - translations_json ALWAYS snapshot (scaffold state)
// =============================================================

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';

import multiLang from '@/components/molecules/multiLang.json';
import { SubmitButton } from '@/components/blocks/shared';
import {
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
} from '@/components/ui';

import {
  useDynamicFieldStoreMutation,
  useDynamicFieldUpdateMutation,
} from '@/modules/admin-section/dynamic-fields/dynamic-fields.action';
import {
  DynamicFieldFormData,
  dynamicFieldSchema,
} from '@/modules/admin-section/dynamic-fields/dynamic-fields.schema';

import { useStoreTypeQuery } from '@/modules/common/store-type/store-type.action';
import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';

// JSON scaffold stack (standard)
import {
  AdminI18nJsonPanel,
  ensureLangKeys,
  initI18nFlatFormFromEntity,
  makeRHFSetValueAny,
  safeObject,
  useFormI18nScaffold,
} from '@/lib/json';
import type { LangKeys, ViewMode } from '@/lib/json';

import { AppSelect } from '../../common';

// i18n json fields
const I18N_FIELDS = ['name'] as const;

const DF_LANG = 'df';

function safeStr(v: any) {
  return String(v ?? '').trim();
}

type SelectOption = { label: string; value: string; id?: string };

function normalizeStoreTypeOptions(input: any): SelectOption[] {
  const list = Array.isArray(input)
    ? input
    : Array.isArray(input?.data)
      ? input.data
      : Array.isArray(input?.message)
        ? input.message
        : [];

  return (Array.isArray(list) ? list : [])
    .map((x: any) => {
      const id = String(x?.id ?? '');
      const value = String(x?.type ?? x?.value ?? x?.id ?? '');
      const label = String(x?.name ?? x?.label ?? x?.type ?? '');
      if (!value || !label) return null;
      return { value, label, id };
    })
    .filter(Boolean) as SelectOption[];
}

const generateSlug = (str: string) =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

function resolveTypeValue(raw: any, options: { value: string; label: string }[]) {
  const val = safeStr(raw);
  if (!val) return '';
  const direct = options.find((o) => o.value === val);
  if (direct) return direct.value;
  const lower = val.toLowerCase();
  const byValueLower = options.find((o) => o.value.toLowerCase() === lower);
  if (byValueLower) return byValueLower.value;
  const byLabel = options.find((o) => String(o.label).toLowerCase() === lower);
  if (byLabel) return byLabel.value;
  const normalized = lower.replace(/[\s_-]+/g, '');
  const byNormalized = options.find((o) => o.value.toLowerCase() === normalized);
  return byNormalized?.value ?? val;
}

function resolveStoreTypeValue(raw: any, options: SelectOption[]) {
  const val = safeStr(raw);
  if (!val) return '';
  const direct = options.find((o) => o.value === val);
  if (direct) return direct.value;
  const lower = val.toLowerCase();
  const byValueLower = options.find((o) => o.value.toLowerCase() === lower);
  if (byValueLower) return byValueLower.value;
  const byId = options.find((o) => safeStr(o.id) === val);
  if (byId) return byId.value;
  const byIdLower = options.find((o) => safeStr(o.id).toLowerCase() === lower);
  if (byIdLower) return byIdLower.value;
  const byLabel = options.find((o) => safeStr(o.label).toLowerCase() === lower);
  return byLabel?.value ?? val;
}

function resolveStatusValue(raw: any) {
  const val = safeStr(raw);
  if (!val) return '';
  if (val === '1' || val === 'true') return 'active';
  if (val === '0' || val === 'false') return 'inactive';
  const lower = val.toLowerCase();
  if (lower === 'active' || lower === 'inactive' || lower === 'archived') return lower;
  return val;
}

export default function CreateOrUpdateDynamicFieldForm({ data }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  // robust editData (same habit)
  const editData = (data?.data ?? data?.dynamic_field ?? data) as any;

  const allLangs = useMemo(() => (Array.isArray(multiLang) ? (multiLang as any[]) : []), []);

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  // lists
  const fieldTypes = useMemo(
    () => [
      { label: 'Text', value: 'text' },
      { label: 'Text Area', value: 'textarea' },
      { label: 'Select', value: 'select' },
      { label: 'Multi Select', value: 'multiselect' },
      { label: 'Number', value: 'number' },
      { label: 'URL', value: 'url' },
      { label: 'Time', value: 'time' },
      { label: 'Color', value: 'color' },
      { label: 'Boolean', value: 'boolean' },
      { label: 'Checkbox', value: 'checkbox' },
      { label: 'Date', value: 'date' },
      { label: 'Date Time', value: 'datetime' },
      { label: 'Date Range', value: 'daterange' },
      { label: 'Radio', value: 'radio' },
    ],
    [],
  );

  const StatusList = useMemo(
    () => [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Archived', value: 'archived' },
    ],
    [],
  );

  // store types
  const { storeType } = useStoreTypeQuery({});
  const StoreTypeOptions = useMemo(() => normalizeStoreTypeOptions(storeType), [storeType]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
    getValues,
  } = useForm<DynamicFieldFormData>({
    resolver: zodResolver(dynamicFieldSchema),
    defaultValues: {
      store_type: '',
      type: '',
      status: 'active',
      slug: '',
      name_df: '', // DF contract
      // NOTE: i18n flat fields (name_tr, name_en...) are registered programmatically
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<DynamicFieldFormData>(setValue), [setValue]);

  // ✅ Scaffold (single source of truth for JSON + sync)
  const i18n = useFormI18nScaffold<DynamicFieldFormData>({
    languages: allLangs,
    excludeLangIds: [DF_LANG],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    dfSync: {
      enabled: true,
      pairs: [{ dfField: 'name_df', srcField: (l) => `name_${l}`, validate: true }],
    },
    // minimal watches only (no whole-form watch)
    extraWatchNames: ['slug', 'type', 'store_type', 'status'],
  });

  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    setTranslationsJson,
    applyJsonToForm,
    handleTranslationsJsonChange,
    rebuildJsonNow,
  } = i18n;

  // ---- Controlled Tabs (FORM mode only) ----
  const [activeLangId, setActiveLangId] = useState<string>(() => firstUILangId);
  useEffect(() => {
    setActiveLangId((cur) => {
      const ok = uiLangs.some((l) => l.id === cur);
      return ok ? cur : firstUILangId;
    });
  }, [firstUILangId, uiLangs]);

  // ✅ Programmatic register: Tabs unmount safety
  useEffect(() => {
    for (const l of uiLangs) {
      register(`name_${l.id}` as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLangs, register]);

  // ---- Derived lists (status restrictions) ----
  const currentStatus = useWatch({ control, name: 'status' as any });
  const filteredStatusList = useMemo(() => {
    const st = String(currentStatus ?? '');
    return st === 'archived'
      ? StatusList.filter((s) => s.value === 'inactive' || s.value === 'archived')
      : StatusList.filter((s) => s.value === 'active' || s.value === 'inactive');
  }, [StatusList, currentStatus]);

  // ---- Required toggle ----
  const [isRequired, setIsRequired] = useState<boolean>(false);

  // ---- Edit init (deterministic) ----
  useEffect(() => {
    // CREATE
    if (!editData || !editData?.id) {
      setIsRequired(false);
      rebuildJsonNow();
      return;
    }

    // globals
    setValueAny('slug', safeStr(editData?.slug), { shouldDirty: false, shouldTouch: false });
    const typeValue = resolveTypeValue(editData?.type, fieldTypes);
    setValueAny('type', typeValue, { shouldDirty: false, shouldTouch: false });
    const storeTypeRaw = editData?.store_type?.type ?? editData?.store_type?.value ?? editData?.store_type;
    const storeTypeValue = resolveStoreTypeValue(storeTypeRaw, StoreTypeOptions);
    setValueAny('store_type', storeTypeValue, { shouldDirty: false, shouldTouch: false });
    setValueAny('status', resolveStatusValue(editData?.status), { shouldDirty: false, shouldTouch: false });

    setIsRequired(Boolean(editData?.is_required));

    // i18n init (root -> firstUILangId, translations -> others)
    initI18nFlatFormFromEntity({
      editData,
      firstUILangId,
      uiLangs,
      i18nFields: I18N_FIELDS,
      setValueAny,
      validateFields: ['name'],
      after: () => {
        // JSON init priority: DB json > rebuild snapshot
        const dbJson = editData?.translations_json;
        if (dbJson && typeof dbJson === 'object') {
          const safeDb = ensureLangKeys(dbJson, uiLangs);
          setTranslationsJson(safeDb);
          applyJsonToForm(safeDb, { markDirty: false });
        } else {
          rebuildJsonNow();
        }
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, firstUILangId]);

  // ✅ store_type may be stored as id; reconcile when options arrive (do not override valid selection)
  useEffect(() => {
    if (!editData?.id) return;
    if (!StoreTypeOptions.length) return;

    const current = safeStr(getValues()?.store_type);
    const currentValid = StoreTypeOptions.some((o) => o.value === current);
    if (currentValid) return;

    const raw = editData?.store_type?.type ?? editData?.store_type?.value ?? editData?.store_type ?? current;
    const resolved = resolveStoreTypeValue(raw, StoreTypeOptions);
    if (!resolved || resolved === current) return;

    setValueAny('store_type', resolved, { shouldDirty: false, shouldTouch: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, StoreTypeOptions]);

  // ✅ type may be stored in legacy formats; reconcile if current value not valid
  useEffect(() => {
    if (!editData?.id) return;
    const current = safeStr(getValues()?.type);
    const currentValid = fieldTypes.some((o) => o.value === current);
    if (currentValid) return;

    const raw = editData?.type?.type ?? editData?.type?.value ?? editData?.type ?? current;
    const resolved = resolveTypeValue(raw, fieldTypes);
    if (!resolved || resolved === current) return;

    setValueAny('type', resolved, { shouldDirty: false, shouldTouch: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, fieldTypes]);

  // ✅ status normalize if backend uses 0/1 or boolean
  useEffect(() => {
    if (!editData?.id) return;
    const current = safeStr(getValues()?.status);
    const currentValid = filteredStatusList.some((o) => o.value === current);
    if (currentValid) return;

    const resolved = resolveStatusValue(editData?.status ?? current);
    if (!resolved || resolved === current) return;
    setValueAny('status', resolved, { shouldDirty: false, shouldTouch: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, filteredStatusList]);

  // ✅ JSON mode enter -> rebuild from latest snapshot
  useEffect(() => {
    if (viewMode !== 'json') return;
    rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // ---- Slug auto ONLY from first UI language name (minimal watch) ----
  const firstName = useWatch({ control, name: `name_${firstUILangId}` as any });
  const slugTouchedRef = useRef(false);

  // mark slug as "user touched" if they change it (so we don't fight them)
  const slugVal = useWatch({ control, name: 'slug' as any });
  useEffect(() => {
    // If edit init sets slug, we don't want to mark touched immediately.
    // We'll treat "touched" as user typing: detect by form dirty later is complex.
    // Minimal: once slug is non-empty while firstName changes, we stop auto when user edits slug manually.
    // Here we only mark touched when slug changes while firstName did not cause it:
    // (We can't perfectly detect; keep it simple & safe.)
  }, [slugVal]);

  useEffect(() => {
    const v = safeStr(firstName);
    if (!v) return;

    // If user already has a slug (create/edit) and wants to keep it, don't overwrite.
    const currentSlug = safeStr(getValues()?.slug);
    if (slugTouchedRef.current) return;
    if (editData?.id && currentSlug) return; // edit: don't override existing slug

    const nextSlug = generateSlug(v);
    if (!nextSlug) return;

    setValueAny('slug', nextSlug, { shouldDirty: true, shouldTouch: false, shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, firstUILangId, editData?.id]);

  // user typing slug should stop auto
  // (attach via Input onChange to set slugTouchedRef)
  const onSlugManualChange = (v: string) => {
    slugTouchedRef.current = true;
    setValueAny('slug', v, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  // ---- Mutations ----
  const { mutate: storeMutate, isPending: isPendingCreate } = useDynamicFieldStoreMutation();
  const { mutate: updateMutate, isPending: isPendingUpdate } = useDynamicFieldUpdateMutation();

  const onSubmit = async (values: DynamicFieldFormData) => {
    const v = safeObject(values);

    // ✅ root must come from DF (schema contract) + fallback firstUILangId
    const rootName = safeStr((v as any).name_df) || safeStr((v as any)[`name_${firstUILangId}`]);

    const jsonSource = ensureLangKeys(translationsJson, uiLangs);
    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== firstUILangId)
      .map((lang) => ({
        language_code: lang.id,
        name: safeStr(jsonSource?.[lang.id]?.name ?? (v as any)[`name_${lang.id}`]),
      }))
      .filter((row) => row.name.length > 0);

    const translations_json = jsonSource;

    const payload: any = {
      id: editData?.id,
      name: rootName,
      slug: safeStr((v as any).slug),
      type: safeStr((v as any).type),
      store_type: safeStr((v as any).store_type),
      status: safeStr((v as any).status),
      is_required: isRequired ? 1 : 0,
      translations,
      translations_json,
    };

    const onOk = () => {
      dispatch(setRefetch(true));
      reset();
      setIsRequired(false);
      slugTouchedRef.current = false;
    };

    if (editData?.id) return updateMutate(payload, { onSuccess: onOk });
    return storeMutate(payload, { onSuccess: onOk });
  };

  // ---- Render ----
  return (
    <div dir={dir}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ DF hidden required by schema */}
        <input type="hidden" {...register('name_df' as any)} />

        {/* Header: Form / JSON toggle */}
        <Card className="mt-2">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {editData?.id ? 'Update Dynamic Field' : 'Add Dynamic Field'}
            </div>

            <div className="inline-flex rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className={[
                  'px-4 py-2 text-sm font-medium transition',
                  viewMode === 'form'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                Form
              </button>
              <button
                type="button"
                onClick={() => setViewMode('json')}
                className={[
                  'px-4 py-2 text-sm font-medium transition',
                  viewMode === 'json'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                JSON
              </button>
            </div>
          </CardContent>
        </Card>

        {/* DF error surface */}
        {(errors as any)?.name_df?.message ? (
          <Card className="mt-4">
            <CardContent className="p-3">
              <p className="text-red-600 text-sm">{String((errors as any)?.name_df?.message)}</p>
            </CardContent>
          </Card>
        ) : null}

        {viewMode === 'json' ? (
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Dynamic Field JSON"
                languages={uiLangs}
                value={translationsJson}
                onChange={(next) => {
                  // ✅ ONLY scaffold handler
                  const safeNext = ensureLangKeys(next, uiLangs);
                  setTranslationsJson(safeNext);
                  handleTranslationsJsonChange(safeNext);
                }}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    JSON format:{' '}
                    <code>{'{ tr: { name }, en: { name }, ... }'}</code>
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4">
            {/* Global fields (render ONCE) */}
            <Card className="mb-4">
              <CardContent className="p-2 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Slug */}
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.slug') ?? 'Slug'}</p>
                  <Input
                    id="slug"
                    value={safeStr(getValues()?.slug)}
                    onChange={(e) => onSlugManualChange(e.target.value)}
                    className="app-input"
                    placeholder="slug"
                  />
                  {(errors as any)?.slug?.message ? (
                    <p className="text-red-500 text-sm mt-1">{String((errors as any)?.slug?.message)}</p>
                  ) : null}
                </div>

                {/* Type */}
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.type') ?? 'Type'}</p>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <AppSelect
                        value={String(field.value ?? '')}
                        onSelect={(value) => field.onChange(String(value ?? ''))}
                        groups={fieldTypes}
                        placeholder="Select Type"
                      />
                    )}
                  />
                  {(errors as any)?.type?.message ? (
                    <p className="text-red-500 text-sm mt-1">{String((errors as any)?.type?.message)}</p>
                  ) : null}
                </div>

                {/* Store type */}
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.store_type') ?? 'Store Type'}</p>
                  <Controller
                    control={control}
                    name="store_type"
                    render={({ field }) => (
                      <AppSelect
                        value={String(field.value ?? '')}
                        onSelect={(value) => field.onChange(String(value ?? ''))}
                        groups={StoreTypeOptions}
                        placeholder="Select Store Type"
                      />
                    )}
                  />
                  {(errors as any)?.store_type?.message ? (
                    <p className="text-red-500 text-sm mt-1">
                      {String((errors as any)?.store_type?.message)}
                    </p>
                  ) : null}
                </div>

                {/* Status */}
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.status') ?? 'Status'}</p>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <AppSelect
                        disabled={Boolean(editData?.id) && editData?.status === 'archived'}
                        value={String(field.value ?? '')}
                        onSelect={(value) => field.onChange(String(value ?? ''))}
                        groups={filteredStatusList}
                        placeholder="Select Status"
                      />
                    )}
                  />
                  {(errors as any)?.status?.message ? (
                    <p className="text-red-500 text-sm mt-1">
                      {String((errors as any)?.status?.message)}
                    </p>
                  ) : null}
                </div>

                {/* Required */}
                <div className="flex items-center gap-8">
                  <p className="font-medium text-gray-700 dark:text-white">Required</p>
                  <Switch dir="ltr" checked={isRequired} onCheckedChange={() => setIsRequired((p) => !p)} />
                </div>
              </CardContent>
            </Card>

            {/* i18n fields (Tabs) — controlled, df excluded */}
            <Tabs value={activeLangId} onValueChange={setActiveLangId} className="col-span-2">
              <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                {uiLangs.map((lang: any) => (
                  <TabsTrigger key={lang.id} value={lang.id}>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div dir={dir} className="grid grid-cols-1">
                {uiLangs.map((lang: any) => (
                  <TabsContent key={lang.id} value={lang.id}>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>
                          {t('label.name')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                        </span>
                      </p>

                      <Input
                        id={`name_${lang.id}`}
                        {...register(`name_${lang.id}` as any)}
                        className="app-input"
                        placeholder={t('place_holder.enter_name') ?? 'Enter name'}
                      />

                      {(errors as any)?.[`name_${lang.id}`]?.message ? (
                        <p className="text-red-500 text-sm mt-1">
                          {String((errors as any)?.[`name_${lang.id}`]?.message)}
                        </p>
                      ) : null}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        )}

        <div className="col-span-2 mt-6">
          <SubmitButton
            UpdateData={Boolean(editData?.id)}
            IsLoading={Boolean(editData?.id) ? isPendingUpdate : isPendingCreate}
            AddLabel="Add Field"
            UpdateLabel="Update Field"
          />
        </div>
      </form>
    </div>
  );
}
