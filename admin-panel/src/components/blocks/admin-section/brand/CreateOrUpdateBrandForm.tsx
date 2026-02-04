// ===============================================
// File: src/components/blocks/admin-section/brand/CreateOrUpdateBrandForm.tsx
// FINAL — Standard Form + I18n JSON Scaffold (DF contract)
// - Schema requires: brand_name_df (min 2) => hidden register + dfSync
// - df is NOT rendered as a tab
// - First active tab = first UI language (multiLang excluding df)
// - Uses: useFormI18nScaffold + AdminI18nJsonPanel + i18nFormAdapter helpers
// - JSON fields: brand_name, meta_title, meta_description
// - DB -> form: root -> df + firstUILangId, translations -> other langs
// - JSON init: translations_json (if exists) else rebuildJsonNow()
// - Submit payload: root from df (fallback firstUILangId) + translations exclude firstUILangId
//   + translations_json built from form snapshot (ensureLangKeys)
// - NOTE: brandSchema has (logo/brand_logo) as File optional; this UI uses PhotoUploadModal (image_id),
//         so we DO NOT bind File inputs to RHF; we send image_id in payload.
// ===============================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import CloudIcon from '@/assets/icons/CloudIcon';
import multiLang from '@/components/molecules/multiLang.json';
import { SubmitButton } from '@/components/blocks/shared';
import Cancel from '../../custom-icons/Cancel';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';

import {
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';

import GlobalImageLoader from '@/lib/imageLoader';
import Image from 'next/image';
import { Info } from 'lucide-react';

import {
  useBrandStoreMutation,
  useBrandUpdateMutation,
} from '@/modules/admin-section/brand/brand.action';
import { BrandFormData, brandSchema } from '@/modules/admin-section/brand/brand.schema';
import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';

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


const I18N_FIELDS = ['brand_name', 'meta_title', 'meta_description'] as const;

function safeStr(v: any) {
  return String(v ?? '').trim();
}

function hasAnyI18nValue(values: any, langId: string) {
  return Boolean(
    safeStr(values?.[`brand_name_${langId}`]) ||
    safeStr(values?.[`meta_title_${langId}`]) ||
    safeStr(values?.[`meta_description_${langId}`]),
  );
}

function normalizeBrandJson(json: any, uiLangs: Array<{ id: string; label?: string }>) {
  const srcRoot = safeObject(json);
  const out: any = {};

  for (const lang of uiLangs) {
    const src = safeObject((srcRoot as any)?.[lang.id]);
    out[lang.id] = {
      brand_name: safeStr(src.brand_name),
      meta_title: safeStr(src.meta_title),
      meta_description: safeStr(src.meta_description),
    };
  }

  return out;
}

export default function CreateOrUpdateBrandForm({ data }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const allLangs = useMemo(() => (Array.isArray(multiLang) ? (multiLang as any[]) : []), []);

  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  // ⚠️ mevcut backend response: { data: {...} }
  const editData = data?.data;

  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
    getValues,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      // scalar
      display_order: editData?.display_order != null ? String(editData.display_order) : '',

      // DF contract required
      brand_name_df: '',
      meta_title_df: '',
      meta_description_df: '',
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<BrandFormData>(setValue), [setValue]);

  // ✅ Scaffold
  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    setTranslationsJson,
    handleTranslationsJsonChange,
    rebuildJsonNow,
  } = useFormI18nScaffold<BrandFormData>({
    languages: allLangs,
    excludeLangIds: ['df'],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    extraWatchNames: ['display_order'],
    dfSync: {
      enabled: true,
      pairs: [
        {
          dfField: 'brand_name_df',
          srcField: (l) => `brand_name_${l}`,
          validate: true,
        },
        { dfField: 'meta_title_df', srcField: (l) => `meta_title_${l}` },
        {
          dfField: 'meta_description_df',
          srcField: (l) => `meta_description_${l}`,
        },
      ],
    },
  });

  // -----------------------------
  // JSON change
  // -----------------------------
  const onJsonChange = (next: any) => {
    const normalized = normalizeBrandJson(next, uiLangs);
    setTranslationsJson(normalized);

    // Scaffold handler (keeps internal state consistent)
    handleTranslationsJsonChange(normalized);

    // Extra explicit apply (safe + deterministic)
    applyI18nJsonToFlatForm<BrandFormData>({
      json: normalized,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      setValue: setValueAny as any,
      keyOf: (field, langId) => `${field}_${langId}`,
    });
  };

  // -----------------------------
  // Init: data -> form + logo + JSON
  // -----------------------------
  useEffect(() => {
    // CREATE
    if (!editData) {
      rebuildJsonNow();
      return;
    }

    // 1) root -> DF contract
    setValueAny('brand_name_df', editData?.brand_name ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
    setValueAny('meta_title_df', editData?.meta_title ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('meta_description_df', editData?.meta_description ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // 2) root -> first UI lang (visible tabs)
    setValueAny(`brand_name_${firstUILangId}` as any, editData?.brand_name ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny(`meta_title_${firstUILangId}` as any, editData?.meta_title ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny(`meta_description_${firstUILangId}` as any, editData?.meta_description ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // 3) scalar fields
    setValueAny('display_order', String(editData?.display_order ?? ''), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // 4) translations map
    const trMap = safeObject(editData?.translations);
    Object.keys(trMap).forEach((langId) => {
      const row = trMap[langId];
      if (!row) return;

      setValueAny(`brand_name_${langId}` as any, row?.brand_name ?? '', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setValueAny(`meta_title_${langId}` as any, row?.meta_title ?? '', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setValueAny(`meta_description_${langId}` as any, row?.meta_description ?? '', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    });

    // 5) logo state
    if (editData?.brand_logo) {
      setLastSelectedLogo({
        image_id: editData?.brand_logo ?? '',
        img_url: editData?.brand_logo_url ?? '/images/no-image.png',
        name: 'logo',
      });
      setLogoErrorMessage('');
    } else {
      setLastSelectedLogo(null);
      setLogoErrorMessage('');
    }

    // 6) JSON init: DB json > else rebuild from flat snapshot
    const dbJson = editData?.translations_json;
    if (dbJson && typeof dbJson === 'object') {
      onJsonChange(dbJson);
    } else {
      rebuildJsonNow();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, firstUILangId]);

  // When entering JSON mode: rebuild from latest form snapshot
  useEffect(() => {
    if (viewMode !== 'json') return;
    rebuildJsonNow();
    setTranslationsJson((prev: any) => normalizeBrandJson(prev, uiLangs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // -----------------------------
  // Logo handlers
  // -----------------------------
  const handleSaveLogo = (images: UploadedImage[]) => {
    const img = images?.[0];
    if (!img) return false;

    setLastSelectedLogo(img);

    const dimensions = img.dimensions ?? '';
    const [width, height] = dimensions.split(' x ').map((d) => parseInt(String(d).trim(), 10));
    const aspectRatio = width && height ? width / height : 0;

    if (aspectRatio && Math.abs(aspectRatio - 1) < 0.01) {
      setLogoErrorMessage('');
      return true;
    }

    setLogoErrorMessage('Image must have a 1:1 aspect ratio.');
    return false;
  };

  const removeLogo = () => {
    setLastSelectedLogo(null);
    setLogoErrorMessage('');
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const { mutate: brandStore, isPending } = useBrandStoreMutation();
  const { mutate: brandUpdate, isPending: isUpdating } = useBrandUpdateMutation();

  const onSubmit = async (values: BrandFormData) => {
    const v: any = values as any;

    const display_order = v.display_order === '' ? v.display_order : Number(v.display_order);

    // root fields (DF contract, with fallback)
    const rootBrandName = safeStr(v.brand_name_df) || safeStr(v[`brand_name_${firstUILangId}`]);
    const rootMetaTitle = safeStr(v.meta_title_df) || safeStr(v[`meta_title_${firstUILangId}`]);
    const rootMetaDesc =
      safeStr(v.meta_description_df) || safeStr(v[`meta_description_${firstUILangId}`]);

    const defaultData = {
      brand_name: rootBrandName,
      meta_title: rootMetaTitle,
      meta_description: rootMetaDesc,
      display_order,

      // keep df
      brand_name_df: v.brand_name_df,
      meta_title_df: v.meta_title_df,
      meta_description_df: v.meta_description_df,
    };

    // legacy translations payload (exclude firstUILangId)
    const translations = (uiLangs ?? [])
      .filter((lang) => lang?.id && lang.id !== firstUILangId)
      .filter((lang) => hasAnyI18nValue(v, lang.id))
      .map((lang) => ({
        language_code: lang.id,
        brand_name: v[`brand_name_${lang.id}`] ?? '',
        meta_title: v[`meta_title_${lang.id}`] ?? '',
        meta_description: v[`meta_description_${lang.id}`] ?? '',
      }));

    // translations_json (deterministic)
    const builtJson = buildI18nJsonFromFlatValues({
      values: v,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });

    const translations_json = ensureLangKeys(normalizeBrandJson(builtJson, uiLangs), uiLangs);

    const submissionData: any = {
      ...defaultData,
      id: editData?.id,

      // PhotoUploadModal -> image_id (NOT File)
      brand_logo: lastSelectedLogo ? lastSelectedLogo.image_id : '',

      translations,
      translations_json,
    };

    const onOk = () => {
      dispatch(setRefetch(true));
      reset();
    };

    if (editData?.id) return brandUpdate(submissionData, { onSuccess: onOk });
    return brandStore(submissionData, { onSuccess: onOk });
  };

  // -----------------------------
  // UI bits
  // -----------------------------
  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo.img_url}
            alt={String(lastSelectedLogo.name ?? 'logo')}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="py-2 absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-2 text-blue-500 text-xs font-medium">{t('common.drag_and_drop')}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ DF hidden fields required by schema */}
        <input type="hidden" {...register('brand_name_df' as any)} />
        <input type="hidden" {...register('meta_title_df' as any)} />
        <input type="hidden" {...register('meta_description_df' as any)} />

        {/* Header toggle (Form / JSON) */}
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {editData?.id ? t('button.update_brand') : t('button.add_brand')}
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

        {/* Show df error (required) */}
        {(errors as any)?.brand_name_df?.message ? (
          <Card className="mt-4">
            <CardContent className="p-3">
              <p className="text-red-600 text-sm">
                {String((errors as any)?.brand_name_df?.message)}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {viewMode === 'json' ? (
          <Card className="rounded-lg border-none mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Translations JSON"
                languages={uiLangs}
                value={ensureLangKeys(normalizeBrandJson(translationsJson, uiLangs), uiLangs)}
                onChange={onJsonChange}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    Alanlar: <code>brand_name</code>, <code>meta_title</code>,{' '}
                    <code>meta_description</code>.
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div>
            <Tabs defaultValue={firstUILangId} className="col-span-2 mt-4">
              <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                {uiLangs.map((lang) => (
                  <TabsTrigger key={lang.id} value={lang.id}>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div dir={dir} className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">
                {uiLangs.map((lang) => (
                  <TabsContent key={lang.id} value={lang.id} className="lg:col-span-2">
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>
                          {t('label.name')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                        </span>
                      </p>
                      <Input
                        id={`brand_name_${lang.id}`}
                        {...register(`brand_name_${lang.id}` as any)}
                        className="app-input"
                        placeholder={t('place_holder.enter_name')}
                      />
                      {(errors as any)?.[`brand_name_${lang.id}`]?.message ? (
                        <p className="text-red-500 text-sm mt-1">
                          {String((errors as any)?.[`brand_name_${lang.id}`]?.message)}
                        </p>
                      ) : null}
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
                        {t('label.meta_description')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                      </p>
                      <Textarea
                        id={`meta_description_${lang.id}`}
                        {...register(`meta_description_${lang.id}` as any)}
                        className="app-input"
                        placeholder={t('place_holder.enter_meta_description')}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">{t('label.order')}</p>
                      <Input
                        type="number"
                        min={0}
                        id="display_order"
                        {...register('display_order' as any)}
                        className="app-input"
                        placeholder={t('place_holder.enter_display_order')}
                      />
                    </div>
                  </TabsContent>
                ))}

                {/* Logo card column (shared across tabs) */}
                <div className="mt-2">
                  <div className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span>{t('label.logo')}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-custom-dark-blue w-96">
                          <p className="p-1 text-sm font-medium">{t('tooltip.aspect_ratio_1_1')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="relative flex align-start gap-4">
                    <div className="relative w-32">
                      <PhotoUploadModal
                        trigger={triggerLogo}
                        isMultiple={false}
                        onSave={handleSaveLogo}
                        usageType="brand"
                        selectedImage={lastSelectedLogo}
                      />
                      {lastSelectedLogo?.image_id && (
                        <Cancel
                          customClass="absolute top-0 right-0 m-1"
                          onClick={(event: { stopPropagation: () => void }) => {
                            event.stopPropagation();
                            removeLogo();
                          }}
                        />
                      )}
                      {errorLogoMessage && (
                        <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
        )}

        <div className="col-span-2 mt-10">
          <SubmitButton
            UpdateData={data}
            IsLoading={isPending || isUpdating}
            AddLabel={t('button.add_brand')}
            UpdateLabel={t('button.update_brand')}
          />
        </div>
      </form>
    </div>
  );
}
