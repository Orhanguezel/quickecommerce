// ===============================================
// File: src/components/blocks/admin-section/blog/category/BlogCategoryForm.tsx
// FINAL — Standard Form + I18n JSON (shared helpers + deterministic init)
// - Uses: AdminI18nJsonPanel, i18nFormAdapter, i18nNormalize, rhf.ts
// - Uses: useFormI18nScaffold (single-source scaffold)
// - Deterministic init: initI18nFlatFormFromEntity (DB -> Form)
// - Fixes React #185: DO NOT watch whole form object
// - Fixes submit: schema requires name_df => hidden register + scaffold dfSync
// - Uses existing actions/hooks unchanged
//
// NOT (standart kural):
// 1) Whole-form watch YASAK. Sadece i18n alanları + extra alanlar izlenir.
// 2) df gibi required hidden alanlar UI'nın ilk diliyle sync edilir.
// 3) JSON sync getValues snapshot üzerinden yapılır; state sadece değişince güncellenir.
// ===============================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import multiLang from '@/components/molecules/multiLang.json';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import {
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/components/ui';

import {
  useBlogCategoryStoreMutation,
  useBlogCategoryUpdateMutation,
} from '@/modules/admin-section/blog/blog-category/blog-category.action';
import {
  BlogCategoryFormData,
  blogCategorySchema,
} from '@/modules/admin-section/blog/blog-category/blog-category.schema';

import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

// JSON scaffold stack (standard)
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

const I18N_FIELDS = ['name', 'meta_title', 'meta_description'] as const;

function safeStr(x: any) {
  return String(x ?? '').trim();
}

function hasAnyI18nValue(v: any, langId: string) {
  const name = safeStr(v?.[`name_${langId}`]);
  const mt = safeStr(v?.[`meta_title_${langId}`]);
  const md = safeStr(v?.[`meta_description_${langId}`]);
  return !!(name || mt || md);
}

export default function BlogCategoryForm({ data }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const allLangs = useMemo(() => multiLang as Array<{ id: string; label: string }>, []);

  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const editData = data?.data ?? data?.category ?? data;

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
    getValues,
  } = useForm<BlogCategoryFormData>({
    resolver: zodResolver(blogCategorySchema),
    defaultValues: {
      status:
        editData?.status !== undefined && editData?.status !== null
          ? (String(editData.status) as any)
          : ('' as any),
      name_df: '',
      meta_title_df: '',
      meta_description_df: '',
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<BlogCategoryFormData>(setValue), [setValue]);

  // ✅ Scaffold (tek kaynak)
  const i18n = useFormI18nScaffold<BlogCategoryFormData>({
    languages: allLangs,
    excludeLangIds: ['df'],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    extraWatchNames: ['status'],
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: 'name_df', srcField: (l) => `name_${l}`, validate: true },
        { dfField: 'meta_title_df', srcField: (l) => `meta_title_${l}` },
        { dfField: 'meta_description_df', srcField: (l) => `meta_description_${l}` },
      ],
    },
  });

  const { uiLangs, firstUILangId, translationsJson, handleTranslationsJsonChange, rebuildJsonNow } =
    i18n;

  const statuslist = [
    { label: t('label.active'), value: '1' },
    { label: t('label.inactive'), value: '0' },
  ];

  // -----------------------------
  // Init (DB -> Form) + JSON init (deterministic helper)
  // -----------------------------
  useEffect(() => {
    // Create
    if (!editData) {
      rebuildJsonNow();
      return;
    }

    initI18nFlatFormFromEntity({
      editData,
      firstUILangId,
      uiLangs,
      i18nFields: I18N_FIELDS,
      setValueAny,
      statusKey: 'status',
      after: rebuildJsonNow,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, firstUILangId]);

  // Hooks (unchanged)
  const storeHook = useBlogCategoryStoreMutation();
  const updateHook = useBlogCategoryUpdateMutation();
  const isSaving = !!storeHook?.isPending || !!updateHook?.isPending;

  const onSubmit = async (values: BlogCategoryFormData) => {
    const v: any = values as any;

    const rootName = safeStr(v?.name_df);
    const rootMetaTitle = safeStr(v?.meta_title_df);
    const rootMetaDesc = safeStr(v?.meta_description_df);

    const fallbackLang = uiLangs.find((l) => hasAnyI18nValue(v, l.id))?.id ?? firstUILangId;

    const finalName = rootName || safeStr(v?.[`name_${fallbackLang}`]);
    const finalMetaTitle = rootMetaTitle || safeStr(v?.[`meta_title_${fallbackLang}`]);
    const finalMetaDesc = rootMetaDesc || safeStr(v?.[`meta_description_${fallbackLang}`]);

    const defaultData: any = {
      name: finalName,
      meta_title: finalMetaTitle,
      meta_description: finalMetaDesc,
      status: v?.status ?? '',
      // keep df too (harmless)
      name_df: v?.name_df,
      meta_title_df: v?.meta_title_df,
      meta_description_df: v?.meta_description_df,
    };

    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== firstUILangId)
      .filter((lang) => hasAnyI18nValue(v, lang.id))
      .map((lang) => ({
        language_code: lang.id,
        name: safeStr(v?.[`name_${lang.id}`]),
        meta_title: safeStr(v?.[`meta_title_${lang.id}`]),
        meta_description: safeStr(v?.[`meta_description_${lang.id}`]),
      }));

    // translations_json (standard)
    const builtJson = buildI18nJsonFromFlatValues({
      values: v,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });

    const payload: any = {
      ...defaultData,
      translations,
      translations_json: ensureLangKeys(builtJson, uiLangs),
    };

    try {
      if (editData?.id > 0) {
        await updateHook.mutateAsync({ ...payload, id: editData.id } as any);
      } else {
        await storeHook.mutateAsync(payload as any);
        reset();
      }
      dispatch(setRefetch(true));
      // toast + router.push already in action onSuccess
    } catch (e) {
      console.error('BlogCategory submit failed:', e);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Hidden df fields required by schema (standard) */}
        <input type="hidden" {...register('name_df' as any)} />
        <input type="hidden" {...register('meta_title_df' as any)} />
        <input type="hidden" {...register('meta_description_df' as any)} />

        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {editData?.id > 0 ? t('button.update_blog_category') : t('button.add_blog_category')}
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

        {(errors as any)?.name_df?.message ? (
          <Card className="mt-4">
            <CardContent className="p-3">
              <p className="text-red-600 text-sm">{String((errors as any)?.name_df?.message)}</p>
            </CardContent>
          </Card>
        ) : null}

        {viewMode === 'json' ? (
          <Card className="rounded-lg border-none mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Blog Category JSON"
                languages={uiLangs}
                value={translationsJson}
                onChange={handleTranslationsJsonChange}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    Alanlar: <code>name</code>, <code>meta_title</code>,{' '}
                    <code>meta_description</code>.
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-lg border-none mt-4">
            <CardContent className="p-2 md:p-6">
              <Tabs defaultValue={firstUILangId} className="col-span-2">
                <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                  {uiLangs.map((lang) => (
                    <TabsTrigger key={lang.id} value={lang.id}>
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div dir={dir}>
                  {uiLangs.map((lang) => (
                    <TabsContent key={lang.id} value={lang.id}>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t('label.title')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                          </span>
                        </p>
                        <Input
                          id={`name_${lang.id}`}
                          {...register(`name_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>{t('label.status')}</span>
                        </p>
                        <Controller
                          control={control}
                          name={'status' as any}
                          render={({ field }) => (
                            <AppSelect
                              value={String(field.value ?? '')}
                              onSelect={(value) => field.onChange(String(value))}
                              groups={statuslist}
                              hideNone
                            />
                          )}
                        />
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">
                          {t('label.meta_title')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                        </p>
                        <Input
                          id={`meta_title_${lang.id}`}
                          {...register(`meta_title_${lang.id}` as any)}
                          className="app-input"
                          placeholder={t('place_holder.enter_meta_title')}
                        />
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">
                          {t('label.meta_description')} (
                          {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                        </p>
                        <Textarea
                          id={`meta_description_${lang.id}`}
                          {...register(`meta_description_${lang.id}` as any)}
                          className="app-input"
                          placeholder={t('place_holder.enter_meta_description')}
                        />
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={editData?.id ? editData : null}
            IsLoading={isSaving}
            AddLabel={t('button.add_blog_category')}
            UpdateLabel={t('button.update_blog_category')}
          />
        </Card>
      </form>
    </div>
  );
}
