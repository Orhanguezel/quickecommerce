// ===============================================
// File: src/components/blocks/admin-section/tag/TagForm.tsx
// FINAL — Tag Form (Form + JSON) — SAME PATTERN as other DF+JSON forms
// - Schema requires: name_df (min 2) => hidden register + dfSync (useFormI18nScaffold)
// - Root language dynamic (firstUILangId), df excluded from tabs
// - Order is global (render once) + stored in JSON under _meta.order
// - JSON -> form uses scaffold handler + sets order from _meta
// - Form -> JSON rebuild on JSON mode enter (no drift)
// ===============================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import multiLang from '@/components/molecules/multiLang.json';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import { SubmitButton } from '@/components/blocks/shared';
import { useTagStoreMutation, useTagUpdateMutation } from '@/modules/admin-section/tag/tag.action';
import { TagFormData, tagSchema } from '@/modules/admin-section/tag/tag.schema';

import {
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
} from '@/components/ui';

// JSON scaffold stack (standard)
import {
  AdminI18nJsonPanel,
  buildI18nJsonFromFlatValues,
  applyI18nJsonToFlatForm,
  makeRHFSetValueAny, safeObject,
  ensureLangKeys,
  useFormI18nScaffold,
  initI18nFlatFormFromEntity,
} from '@/lib/json';
import type {  LangKeys, ViewMode, LangType} from '@/lib/json';


// i18n json fields
const I18N_FIELDS = ['name'] as const;

function safeStr(v: any) {
  return String(v ?? '').trim();
}

/**
 * JSON format (Tag):
 * {
 *   "_meta": { "order": "1" },
 *   "tr": { "name": "..." },
 *   "en": { "name": "..." }
 * }
 */
type TagTranslationsJson = {
  _meta?: { order?: number | string };
  [langId: string]: any;
};

function normalizeTagJson(json: any, uiLangs: Array<{ id: string }>) {
  const src = safeObject(json);
  const out: TagTranslationsJson = {};

  const meta = safeObject((src as any)._meta);
  out._meta = { order: meta?.order ?? '' };

  for (const lang of uiLangs) {
    const row = safeObject((src as any)[lang.id]);
    out[lang.id] = { name: safeStr(row?.name) };
  }

  // preserve other unknown keys (optional)
  for (const k of Object.keys(src)) {
    if (k === '_meta') continue;
    if (k in out) continue;
    const v = (src as any)[k];
    if (v && typeof v === 'object') out[k] = v;
  }

  return out;
}

export default function TagForm({ data }: any) {
  const t = useTranslations();

  const allLangs = useMemo(() => (Array.isArray(multiLang) ? (multiLang as any[]) : []), []);

  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  // robust editData
  const editData = (data?.data ?? data?.tag ?? data) as any;

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
    getValues,
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      order: '',
      name_df: '', // DF contract
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<TagFormData>(setValue), [setValue]);

  // ✅ Scaffold (same as other DF forms)
  const i18n = useFormI18nScaffold<TagFormData>({
    languages: allLangs,
    excludeLangIds: ['df'],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    dfSync: {
      enabled: true,
      pairs: [{ dfField: 'name_df', srcField: (l) => `name_${l}`, validate: true }],
    },
    extraWatchNames: ['order'], // keep in sync context; no UI drift
  });

  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    handleTranslationsJsonChange: handleI18nJsonChange,
    rebuildJsonNow,
  } = i18n;

  // -----------------------------
  // JSON helpers: merge _meta.order with scaffold json
  // -----------------------------
  const buildFullJsonFromFormSnapshot = (values: any): TagTranslationsJson => {
    const v = safeObject(values);
    const order = v?.order ?? '';

    const builtLangJson = buildI18nJsonFromFlatValues({
      values: v,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });

    return normalizeTagJson({ _meta: { order }, ...(builtLangJson as any) }, uiLangs);
  };

  const applyFullJsonToForm = (nextAny: any) => {
    const normalized = normalizeTagJson(nextAny, uiLangs);

    // 1) order from _meta
    setValueAny('order', String(normalized?._meta?.order ?? ''), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    // 2) i18n languages -> scaffold handler (also applies to flat form)
    // strip _meta before passing
    const { _meta, ...langJson } = normalized as any;

    handleI18nJsonChange(langJson);

    // extra safety (same imports/pattern as your other forms):
    applyI18nJsonToFlatForm<TagFormData>({
      json: langJson,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      setValue: setValueAny,
      keyOf: (field, langId) => `${field}_${langId}`,
    });
  };

  // -----------------------------
  // Init (editData -> form + JSON)
  // -----------------------------
  useEffect(() => {
    // CREATE
    if (!editData || !editData?.id) {
      rebuildJsonNow(); // scaffold creates translationsJson from current RHF snapshot
      return;
    }

    // root -> df + firstUILangId
    const rootName = safeStr(editData?.name);
    setValueAny('name_df', rootName, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
    setValueAny(`name_${firstUILangId}` as any, rootName, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // order
    setValueAny('order', String(editData?.order ?? ''), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // translations
    const trObj = editData?.translations;

    if (trObj && typeof trObj === 'object' && !Array.isArray(trObj)) {
      Object.keys(trObj).forEach((langId) => {
        if (!langId || langId === 'df') return;
        const trn = trObj?.[langId];
        if (!trn) return;
        setValueAny(`name_${langId}` as any, safeStr(trn?.name), {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      });
    } else if (Array.isArray(trObj)) {
      trObj.forEach((trn: any) => {
        const langId = trn?.language_code ?? trn?.language;
        if (!langId || langId === 'df') return;
        setValueAny(`name_${langId}` as any, safeStr(trn?.name), {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      });
    }

    // JSON init priority:
    const dbJson = editData?.translations_json;
    if (dbJson && typeof dbJson === 'object') {
      applyFullJsonToForm(dbJson);
    } else {
      // rebuild from current form snapshot
      rebuildJsonNow();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, firstUILangId]);

  // ✅ When switching to JSON mode: rebuild from latest form snapshot (same pattern)
  useEffect(() => {
    if (viewMode !== 'json') return;
    rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // -----------------------------
  // Submit
  // -----------------------------
  const { mutate: tagStore, isPending: isPendingCreate } = useTagStoreMutation();
  const { mutate: tagUpdate, isPending: isPendingUpdate } = useTagUpdateMutation();

  const onSubmit = async (values: TagFormData) => {
    const orderValue =
      values?.order === '' || values?.order === null || values?.order === undefined
        ? ''
        : Number(values.order);

    // ✅ root must come from DF (schema contract) + fallback firstUILangId
    const rootName =
      safeStr((values as any).name_df) || safeStr((values as any)[`name_${firstUILangId}`]);

    const defaultData: any = {
      name: rootName,
      order: orderValue,
      name_df: (values as any).name_df,
    };

    // legacy translations[]: exclude firstUILangId
    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== firstUILangId)
      .map((lang) => ({
        language_code: lang.id,
        name: safeStr((values as any)[`name_${lang.id}`]),
      }))
      .filter((row) => row.name.length > 0);

    // translations_json: ALWAYS rebuild from snapshot (no drift)
    const translations_json = buildFullJsonFromFormSnapshot(values as any);

    const submissionData: any = {
      ...defaultData,
      id: editData?.id,
      translations,
      translations_json,
    };

    const onOk = () => reset();

    if (editData?.id > 0) return tagUpdate(submissionData, { onSuccess: onOk });
    return tagStore(submissionData, { onSuccess: onOk });
  };

  // -----------------------------
  // Render
  // -----------------------------
  const fullJsonValue = useMemo(() => {
    // show JSON that includes _meta.order + languages (scaffold part)
    const order = (getValues() as any)?.order ?? '';
    return normalizeTagJson({ _meta: { order }, ...(translationsJson as any) }, uiLangs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationsJson, uiLangs, viewMode]);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ DF hidden required by schema */}
        <input type="hidden" {...register('name_df' as any)} />

        {/* Toggle header */}
        <Card className="mt-2">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {editData?.id > 0 ? t('button.update_tag') : t('button.add_tag')}
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

        {/* DF error surface (same as other forms) */}
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
                label="Tag JSON"
                languages={uiLangs}
                value={fullJsonValue}
                onChange={applyFullJsonToForm}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    JSON format: <code>{'{ _meta: { order }, tr: { name }, en: { name } }'}</code>
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4">
            {/* Order global */}
            <Card className="mb-4">
              <CardContent className="p-2 md:p-6">
                <p className="text-sm font-medium mb-1">{t('label.order')}</p>
                <Input
                  type="number"
                  id="order"
                  min={0}
                  {...register('order' as keyof TagFormData)}
                  className="app-input"
                  placeholder={t('place_holder.enter_value') ?? 'Enter value'}
                />
                {errors?.order && (
                  <p className="text-red-500 text-sm mt-1">{(errors as any)?.order?.message}</p>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue={firstUILangId} className="col-span-2">
              <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                {uiLangs.map((lang) => (
                  <TabsTrigger key={lang.id} value={lang.id}>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div dir={dir} className="grid grid-cols-1">
                {uiLangs.map((lang) => (
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
                        placeholder={t('place_holder.enter_value') ?? 'Enter value'}
                      />

                      {(errors as any)?.[`name_${lang.id}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {(errors as any)?.[`name_${lang.id}`]?.message}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        )}

        <div className="mt-4">
          <SubmitButton
            UpdateData={data}
            IsLoading={editData?.id > 0 ? isPendingUpdate : isPendingCreate}
            AddLabel={t('button.add_tag')}
            UpdateLabel={t('button.update_tag')}
          />
        </div>
      </form>
    </div>
  );
}
