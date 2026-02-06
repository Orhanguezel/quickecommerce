// =============================================================
// File: src/components/blocks/admin-section/pages/PagesForm.tsx
// FINAL — PagesForm (DF + JSON) SAME STANDARD (Department/Notice)
// Fixes:
// - Robust entity shape: data?.data?.data ?? data?.data ?? data
// - Init uses reset(next) (no timing bugs / no empty form)
// - Tabs controlled (Radix defaultValue bug) + forceMount
// - JSON/Form toggle always visible
// - JSON <-> Form bridge: handleTranslationsJsonChange + applyI18nJsonToFlatForm + df mirror
// - meta_keywords normalize everywhere
// =============================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AppSelect } from '@/components/blocks/common';
import TiptapEditor from '@/components/blocks/common/TiptapField';
import { SubmitButton } from '@/components/blocks/shared';
import multiLang from '@/components/molecules/multiLang.json';

import {
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { TagsInput } from '@/components/ui/tags-input';

import { usePageStoreMutation, usePageUpdateMutation } from '@/modules/admin-section/pages/pages.action';
import { PagesFormData, pagesSchema } from '@/modules/admin-section/pages/pages.schema';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

// JSON scaffold stack (standard) — TEK IMPORT
import {
  AdminI18nJsonPanel,
  buildI18nJsonFromFlatValues,
  applyI18nJsonToFlatForm,
  makeRHFSetValueAny,
  safeObject,
  ensureLangKeys,
  useFormI18nScaffold,
  initI18nFlatFormFromEntity,
} from '@/lib/json';
import type { LangKeys, ViewMode, LangType } from '@/lib/json';

function safeStr(v: unknown) {
  return String(v ?? '').trim();
}

function metaKeywordsToArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => safeStr(x)).filter(Boolean);
  const s = safeStr(v);
  if (!s) return [];
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

function metaKeywordsToString(arr: unknown): string {
  const a = Array.isArray(arr) ? (arr as unknown[]) : [];
  return a.map((x) => safeStr(x)).filter(Boolean).join(', ');
}

const I18N_FIELDS = ['title', 'content', 'meta_title', 'meta_description', 'meta_keywords'] as const;

function getEntityFromProps(data: any) {
  // Senin query yapın bazen data.data.data bazen data.data bazen direkt entity
  const e = (data?.data?.data ?? data?.data ?? data) as any;
  // bazı endpointler {data:{...}} diye bir kat daha koyuyor
  const maybeNested = e?.data && (e.data.title || e.data.id) ? e.data : e;
  return maybeNested;
}

export default function PagesForm({ data }: any) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';

  const entity = useMemo(() => getEntityFromProps(data), [data]);
  const editId = entity?.id;

  const allLangs = useMemo(
    () => (Array.isArray(multiLang) ? (multiLang as LangType[]) : []),
    [],
  );

  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [activeLangId, setActiveLangId] = useState<string>(''); // ✅ controlled tabs

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
    control,
  } = useForm<PagesFormData>({
    resolver: zodResolver(pagesSchema),
    shouldUnregister: false,
    defaultValues: {
      title_df: '',
      content_df: '',
      meta_title_df: '',
      meta_description_df: '',
      meta_keywords_df: [],
      status: '',
      theme_name: '',
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<PagesFormData>(setValue), [setValue]);

  const Themelist = [
    { label: t('label.default_theme'), value: 'default' },
    { label: t('label.theme_one'), value: 'theme_one' },
    { label: t('label.theme_two'), value: 'theme_two' },
  ];

  const statuslist = [
    { label: t('label.draft'), value: 'draft' },
    { label: t('label.publish'), value: 'publish' },
  ];

  // ✅ Scaffold (df UI’da görünmez)
  const i18n = useFormI18nScaffold<PagesFormData>({
    languages: allLangs,
    excludeLangIds: ['df'],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: 'title_df', srcField: (l) => `title_${l}`, validate: true },
        { dfField: 'content_df', srcField: (l) => `content_${l}` },
        { dfField: 'meta_title_df', srcField: (l) => `meta_title_${l}` },
        { dfField: 'meta_description_df', srcField: (l) => `meta_description_${l}` },
        { dfField: 'meta_keywords_df', srcField: (l) => `meta_keywords_${l}` }, // array
      ],
    },
    extraWatchNames: ['status', 'theme_name'],
  });

  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    setTranslationsJson,
    handleTranslationsJsonChange,
  } = i18n;

  // ✅ firstUILangId gelince aktif tab set et (açılışta boş görünmesin)
  useEffect(() => {
    if (!firstUILangId) return;
    setActiveLangId((prev) => prev || firstUILangId);
  }, [firstUILangId]);

  // ✅ tab unmount olsa bile alanlar RHF’de kayıtlı kalsın
  useEffect(() => {
    if (!uiLangs?.length) return;
    uiLangs.forEach((l) => {
      register(`title_${l.id}` as any);
      register(`content_${l.id}` as any);
      register(`meta_title_${l.id}` as any);
      register(`meta_description_${l.id}` as any);
      register(`meta_keywords_${l.id}` as any);
    });
  }, [uiLangs, register]);

  const buildJsonFromValues = (values: any) => {
    const built = buildI18nJsonFromFlatValues({
      values: safeObject(values),
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });

    const normalized = ensureLangKeys(safeObject(built), uiLangs as any);

    // meta_keywords always array in json
    uiLangs.forEach((l) => {
      const mk = (normalized as any)?.[l.id]?.meta_keywords;
      (normalized as any)[l.id] = {
        ...(normalized as any)[l.id],
        meta_keywords: metaKeywordsToArray(mk),
      };
    });

    return normalized;
  };

  // ✅ JSON -> Form bridge (kritik)
  const applyJsonToForm = (nextAny: any) => {
    const next = ensureLangKeys(safeObject(nextAny), uiLangs as any);

    // meta_keywords normalize
    uiLangs.forEach((l) => {
      const mk = (next as any)?.[l.id]?.meta_keywords;
      (next as any)[l.id] = {
        ...(next as any)[l.id],
        meta_keywords: metaKeywordsToArray(mk),
      };
    });

    handleTranslationsJsonChange(next);

    applyI18nJsonToFlatForm<PagesFormData>({
      json: next,
      languages: uiLangs as any,
      fields: [...I18N_FIELDS],
      setValue: setValueAny,
      keyOf: (field, langId) => `${field}_${langId}`,
    });

    // df mirror immediately (first UI lang)
    const b = (next as any)?.[firstUILangId] ?? {};
    setValueAny('title_df', safeStr(b.title), { shouldDirty: true, shouldValidate: true });
    setValueAny('content_df', safeStr(b.content), { shouldDirty: true });
    setValueAny('meta_title_df', safeStr(b.meta_title), { shouldDirty: true });
    setValueAny('meta_description_df', safeStr(b.meta_description), { shouldDirty: true });
    setValueAny('meta_keywords_df', metaKeywordsToArray(b.meta_keywords), { shouldDirty: true });

    setTranslationsJson(next);
  };

  // ✅ INIT: reset(next) ile deterministik init (boş form biter)
  useEffect(() => {
    if (!firstUILangId) return;
    if (!uiLangs?.length) return;

    // CREATE
    if (!editId) {
      const next: any = {
        title_df: '',
        content_df: '',
        meta_title_df: '',
        meta_description_df: '',
        meta_keywords_df: [],
        status: '',
        theme_name: '',
      };

      uiLangs.forEach((l) => {
        next[`title_${l.id}`] = '';
        next[`content_${l.id}`] = '';
        next[`meta_title_${l.id}`] = '';
        next[`meta_description_${l.id}`] = '';
        next[`meta_keywords_${l.id}`] = [];
      });

      reset(next, { keepDirty: false });

      // JSON init
      setTranslationsJson(buildJsonFromValues(next));
      return;
    }

    // EDIT base
    const baseNext: any = {
      title_df: safeStr(entity?.title),
      content_df: safeStr(entity?.content),
      meta_title_df: safeStr(entity?.meta_title),
      meta_description_df: safeStr(entity?.meta_description),
      meta_keywords_df: metaKeywordsToArray(entity?.meta_keywords),
      status: safeStr(entity?.status),
      theme_name: safeStr(entity?.theme_name),
    };

    // prefill all langs empty
    uiLangs.forEach((l) => {
      baseNext[`title_${l.id}`] = '';
      baseNext[`content_${l.id}`] = '';
      baseNext[`meta_title_${l.id}`] = '';
      baseNext[`meta_description_${l.id}`] = '';
      baseNext[`meta_keywords_${l.id}`] = [];
    });

    // first ui lang mirrors df
    baseNext[`title_${firstUILangId}`] = baseNext.title_df || '';
    baseNext[`content_${firstUILangId}`] = baseNext.content_df || '';
    baseNext[`meta_title_${firstUILangId}`] = baseNext.meta_title_df || '';
    baseNext[`meta_description_${firstUILangId}`] = baseNext.meta_description_df || '';
    baseNext[`meta_keywords_${firstUILangId}`] = baseNext.meta_keywords_df || [];

    reset(baseNext, { keepDirty: false });

    // normalize translations (array | object-map)
    const raw = entity?.translations;
    const normalizedTranslations = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object'
        ? Object.keys(raw).map((langId) => ({
            language_code: langId,
            title: raw?.[langId]?.title ?? '',
            content: raw?.[langId]?.content ?? '',
            meta_title: raw?.[langId]?.meta_title ?? '',
            meta_description: raw?.[langId]?.meta_description ?? '',
            meta_keywords: raw?.[langId]?.meta_keywords ?? '',
          }))
        : [];

    const normalizedEntity = { ...entity, translations: normalizedTranslations };

    initI18nFlatFormFromEntity({
      editData: normalizedEntity,
      firstUILangId,
      uiLangs,
      i18nFields: I18N_FIELDS,
      setValueAny,
      entityFieldMap: {
        title: 'title',
        content: 'content',
        meta_title: 'meta_title',
        meta_description: 'meta_description',
        meta_keywords: 'meta_keywords',
      },
      after: () => {
        // meta_keywords string -> array safety in RHF
        uiLangs.forEach((l) => {
          const key = `meta_keywords_${l.id}`;
          const v = (getValues() as any)?.[key];
          setValueAny(key as any, metaKeywordsToArray(v), { shouldDirty: false });
        });

        // JSON init priority
        const dbJson = entity?.translations_json;
        if (dbJson && typeof dbJson === 'object') {
          applyJsonToForm(dbJson);
        } else {
          const snap = getValues();
          setTranslationsJson(buildJsonFromValues(snap));
        }
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, firstUILangId, uiLangs?.length]);

  // JSON mode enter: snapshot from current form
  useEffect(() => {
    if (viewMode !== 'json') return;
    const snap = getValues();
    setTranslationsJson(buildJsonFromValues(snap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const { mutate: pageStore, isPending: isPendingCreate } = usePageStoreMutation();
  const { mutate: pageUpdate, isPending: isPendingUpdate } = usePageUpdateMutation();

  const onSubmit = async (values: PagesFormData) => {
    const translations_json = buildJsonFromValues(values);
    setTranslationsJson(translations_json);

    const defaultData: any = {
      id: editId,
      title: safeStr(values.title_df),
      content: safeStr(values.content_df),
      meta_title: safeStr(values.meta_title_df),
      meta_description: safeStr(values.meta_description_df),
      meta_keywords: metaKeywordsToString((values as any).meta_keywords_df),
      theme_name: safeStr(values.theme_name),
      status: safeStr(values.status),
    };

    const translations = (uiLangs ?? [])
      .filter((lang) => safeStr((values as any)[`title_${lang.id}`]))
      .map((lang) => ({
        language_code: lang.id,
        title: safeStr((values as any)[`title_${lang.id}`]),
        content: safeStr((values as any)[`content_${lang.id}`]),
        meta_title: safeStr((values as any)[`meta_title_${lang.id}`]),
        meta_description: safeStr((values as any)[`meta_description_${lang.id}`]),
        meta_keywords: metaKeywordsToString((values as any)[`meta_keywords_${lang.id}`]),
      }));

    const submissionData: any = {
      ...defaultData,
      translations,
      translations_json, // ✅ bunun için uğraşıyoruz
    };

    if (editId) return pageUpdate(submissionData, { onSuccess: () => reset(), onError: () => {} });
    return pageStore(submissionData, { onSuccess: () => reset() });
  };

  const jsonValue = useMemo(() => {
    return ensureLangKeys(safeObject(translationsJson), uiLangs as any);
  }, [translationsJson, uiLangs]);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* df hidden schema contract */}
        <input type="hidden" {...register('title_df' as any)} />
        <input type="hidden" {...register('content_df' as any)} />
        <input type="hidden" {...register('meta_title_df' as any)} />
        <input type="hidden" {...register('meta_description_df' as any)} />
        <input type="hidden" {...register('meta_keywords_df' as any)} />

        {/* Toggle Form/JSON — always visible */}
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {editId ? t('button.update_page') : t('button.add_page')}
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

        {(errors as any)?.title_df?.message ? (
          <Card className="mt-4">
            <CardContent className="p-3">
              <p className="text-red-600 text-sm">{String((errors as any).title_df.message)}</p>
            </CardContent>
          </Card>
        ) : null}

        {viewMode === 'json' ? (
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Pages JSON"
                languages={uiLangs}
                value={jsonValue}
                onChange={applyJsonToForm}
                perLanguage
                showAllTab
                helperText={
                  <span>
                    Alanlar: <code>title</code>, <code>content</code>, <code>meta_title</code>,{' '}
                    <code>meta_description</code>, <code>meta_keywords</code> (array)
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4">
            {/* GLOBAL */}
            <Card>
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">{t('label.theme_name')}</p>
                  <Controller
                    control={control}
                    name="theme_name"
                    render={({ field }) => (
                      <AppSelect
                        value={String(field.value ?? '')}
                        onSelect={(value) => field.onChange(String(value ?? ''))}
                        groups={Themelist}
                        hideNone
                      />
                    )}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">{t('label.status')}</p>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <AppSelect
                        value={String(field.value ?? '')}
                        onSelect={(value) => field.onChange(String(value ?? ''))}
                        groups={statuslist}
                        hideNone
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* i18n Tabs — CONTROLLED + forceMount */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <Tabs
                  value={activeLangId || firstUILangId || (uiLangs?.[0]?.id ?? '')}
                  onValueChange={setActiveLangId}
                  className="col-span-2"
                >
                  <TabsList dir="ltr" className="flex justify-start bg-white dark:bg-[#1f2937]">
                    {uiLangs.map((lang) => (
                      <TabsTrigger key={lang.id} value={lang.id}>
                        {lang.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div dir="ltr">
                    {uiLangs.map((lang) => (
                      <TabsContent key={lang.id} value={lang.id} forceMount>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>
                                  {t('label.title')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                </span>
                              </p>
                              <Input
                                id={`title_${lang.id}`}
                                {...register(`title_${lang.id}` as keyof PagesFormData)}
                                className="app-input"
                                placeholder={t('place_holder.enter_title')}
                              />
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>
                                  {t('label.content')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                </span>
                              </p>
                              <Controller
                                control={control}
                                name={`content_${lang.id}` as any}
                                render={({ field }) => (
                                  <TiptapEditor value={String(field.value ?? '')} onChange={field.onChange} />
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>
                                  {t('label.meta_title')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                </span>
                              </p>
                              <Input
                                id={`meta_title_${lang.id}`}
                                {...register(`meta_title_${lang.id}` as keyof PagesFormData)}
                                className="app-input"
                                placeholder={t('place_holder.enter_meta_title')}
                              />
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>
                                  {t('label.meta_description')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                </span>
                              </p>
                              <Input
                                id={`meta_description_${lang.id}`}
                                {...register(`meta_description_${lang.id}` as keyof PagesFormData)}
                                className="app-input"
                                placeholder={t('place_holder.enter_meta_description')}
                              />
                            </div>

                            <div>
                              <div className="text-sm font-medium flex items-center gap-2">
                                <span>
                                  {t('label.meta_keywords')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                </span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      align="center"
                                      sideOffset={4}
                                      avoidCollisions={false}
                                      className="bg-custom-dark-blue dark:bg-white max-w-sm"
                                    >
                                      <p className="p-1 text-sm font-medium">{t('tooltip.enter_meta_key')}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>

                              <Controller
                                name={`meta_keywords_${lang.id}` as any}
                                control={control}
                                render={({ field }) => (
                                  <TagsInput
                                    value={(Array.isArray(field.value) ? field.value : []) as string[]}
                                    onChange={(val) => field.onChange(val)}
                                    placeholder={`${t('place_holder.enter_meta_key')} ${t(
                                      `lang.${lang.id}` as `lang.${LangKeys}`,
                                    )}`}
                                    label={t('meta.keywords_title')}
                                    className="app-input"
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Save */}
        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={data}
            IsLoading={editId ? isPendingUpdate : isPendingCreate}
            AddLabel={t('button.add_page')}
            UpdateLabel={t('button.update_page')}
          />
        </Card>
      </form>
    </div>
  );
}
