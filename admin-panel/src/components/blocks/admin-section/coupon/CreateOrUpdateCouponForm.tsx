// ===============================================
// File: src/components/blocks/admin-section/coupon/CreateOrUpdateCouponForm.tsx
// FINAL — Standard Form + I18n JSON Scaffold (DF contract) — SAME PATTERN
// - Schema requires: title_df (min 2) => hidden register + dfSync
// - Root language dynamic (firstUILangId), df excluded
// - DB -> form: root -> df + firstUILangId, translations -> other langs
// - JSON init: translations_json (if exists) else rebuildJsonNow()
// - JSON mode: rebuildJsonNow() (no whole-form watch)
// - Submit payload: root from df (fallback firstUILangId) + translations exclude firstUILangId
// - JSON panel only shows i18n fields: title, description
// - Global fields: image + background_image are NOT language dependent => always visible
// - ✅ SubmitButton visible in BOTH form & json modes
// ===============================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import CloudIcon from '@/assets/icons/CloudIcon';
import multiLang from '@/components/molecules/multiLang.json';
import Cancel from '@/components/blocks/custom-icons/Cancel';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';
import TiptapEditor from '@/components/blocks/common/TiptapField';

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

import Image from 'next/image';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import GlobalImageLoader from '@/lib/imageLoader';
import { SubmitButton } from '@/components/blocks/shared/SubmitButton';

import {
  useCouponStoreMutation,
  useCouponUpdateMutation,
} from '@/modules/admin-section/coupon/coupon.action';
import { CouponFormData, couponSchema } from '@/modules/admin-section/coupon/coupon.schema';

import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';

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

const I18N_FIELDS = ['title', 'description'] as const;

function safeStr(x: any) {
  return String(x ?? '').trim();
}

function hasAnyI18nValueCoupon(v: any, langId: string) {
  const t = safeStr(v?.[`title_${langId}`]);
  const d = safeStr(v?.[`description_${langId}`]);
  return !!(t || d);
}

const CreateOrUpdateCouponForm = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const allLangs = useMemo(
    () => (Array.isArray(multiLang) ? (multiLang as Array<{ id: string; label: string }>) : []),
    [],
  );

  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
    getValues,
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      // DF contract (schema)
      title_df: '',
      description_df: '',
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<CouponFormData>(setValue), [setValue]);

  // ✅ Scaffold + dfSync (same pattern)
  const i18n = useFormI18nScaffold<CouponFormData>({
    languages: allLangs,
    excludeLangIds: ['df'],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    extraWatchNames: [], // deterministic
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: 'title_df', srcField: (l) => `title_${l}`, validate: true },
        { dfField: 'description_df', srcField: (l) => `description_${l}` },
      ],
    },
  });

  const { uiLangs, firstUILangId, translationsJson, handleTranslationsJsonChange, rebuildJsonNow } =
    i18n;

  // global (non-i18n) images
  const [lastSelectedBackground, setLastSelectedBackground] = useState<any>(null); // background_image
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null); // image
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>('');

  // ✅ JSON -> form (standard)
  const onJsonChange = (next: any) => {
    const safeNext = safeObject(next);

    // scaffold state
    handleTranslationsJsonChange(safeNext);

    // explicit adapter apply (extra safety)
    applyI18nJsonToFlatForm<CouponFormData>({
      json: safeNext,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      setValue: setValueAny,
      keyOf: (field, langId) => `${field}_${langId}`,
    });
  };

  // ✅ DB -> form init + JSON init (deterministic)
  useEffect(() => {
    // CREATE
    if (!data || !data?.id) {
      rebuildJsonNow();
      setLastSelectedBackground(null);
      setLastSelectedLogo(null);
      setLogoErrorMessage('');
      return;
    }

    // root -> DF
    setValueAny('title_df', data?.title ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('description_df', data?.description ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // root -> firstUILangId
    setValueAny(`title_${firstUILangId}` as any, data?.title ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny(`description_${firstUILangId}` as any, data?.description ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // translations (map)
    const trMap = safeObject(data?.translations);
    Object.keys(trMap).forEach((langId) => {
      if (!langId || langId === 'df') return;
      const trn = trMap?.[langId];
      if (!trn) return;

      setValueAny(`title_${langId}` as any, trn?.title ?? '', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setValueAny(`description_${langId}` as any, trn?.description ?? '', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    });

    // images (global)
    if (data?.background_image) {
      setLastSelectedBackground({
        image_id: data?.background_image,
        img_url: data?.background_image_url ?? '/images/no-image.png',
        name: 'background_image',
      });
    } else {
      setLastSelectedBackground(null);
    }

    if (data?.image) {
      setLastSelectedLogo({
        image_id: data?.image,
        img_url: data?.image_url ?? '/images/no-image.png',
        name: 'image',
      });
    } else {
      setLastSelectedLogo(null);
    }
    setLogoErrorMessage('');

    // JSON init
    const dbJson = data?.translations_json;
    if (dbJson && typeof dbJson === 'object') {
      onJsonChange(dbJson);
    } else {
      rebuildJsonNow();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, firstUILangId]);

  // ✅ JSON moduna geçince rebuild (watch yok)
  useEffect(() => {
    if (viewMode !== 'json') return;
    rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // -----------------------------
  // Image handlers (global)
  // -----------------------------
  const handleSaveLogo = (images: UploadedImage[]) => {
    setLastSelectedLogo(images?.[0] ?? null);

    const dimensions = images?.[0]?.dimensions ?? '';
    const [width, height] = String(dimensions)
      .split(' x ')
      .map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width && height ? width / height : 0;

    if (Math.abs(aspectRatio - 1) < 0.01) {
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

  const handleSaveBackground = (images: UploadedImage[]) => {
    setLastSelectedBackground(images?.[0] ?? null);
    return true; // no ratio constraint by default
  };

  const removeBackground = () => {
    setLastSelectedBackground(null);
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const { mutate: couponStore, isPending } = useCouponStoreMutation();
  const { mutate: couponUpdate, isPending: isUpdating } = useCouponUpdateMutation();

  const onSubmit = async (values: CouponFormData) => {
    const v: any = values as any;

    // ✅ root must come from DF (schema contract)
    const rootTitle = safeStr(v?.title_df) || safeStr(v?.[`title_${firstUILangId}`]);
    const rootDesc = safeStr(v?.description_df) || safeStr(v?.[`description_${firstUILangId}`]);

    const defaultData = {
      title: rootTitle,
      description: rootDesc,

      // keep df too (harmless)
      title_df: v?.title_df,
      description_df: v?.description_df,
    };

    // legacy translations[] (exclude firstUILangId)
    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== firstUILangId)
      .filter((lang) => hasAnyI18nValueCoupon(v, lang.id))
      .map((lang) => ({
        language_code: lang.id,
        title: safeStr(v?.[`title_${lang.id}`]),
        description: safeStr(v?.[`description_${lang.id}`]),
      }));

    // ✅ translations_json standard (always build from flat snapshot)
    const builtJson = buildI18nJsonFromFlatValues({
      values: v,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });
    const translations_json = ensureLangKeys(builtJson, uiLangs);

    const submissionData: any = {
      ...defaultData,
      id: data?.id,
      translations,
      translations_json,
      background_image: lastSelectedBackground?.image_id ?? '',
      image: lastSelectedLogo?.image_id ?? '',
    };

    const onOk = () => {
      reset();
      dispatch(setRefetch(true));
    };

    if (data?.id > 0) return couponUpdate(submissionData, { onSuccess: onOk });
    return couponStore(submissionData, { onSuccess: onOk });
  };

  // -----------------------------
  // UI triggers
  // -----------------------------
  const triggerThumb = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={String(lastSelectedLogo?.name ?? 'image')}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <CloudIcon />
          <p className="mt-4 text-blue-500 text-sm font-medium p-1">{t('common.drag_and_drop')}</p>
        </div>
      )}
    </div>
  );

  const triggerBg = (
    <div className="hover:cursor-pointer">
      {lastSelectedBackground?.img_url ? (
        <div className="relative w-48 h-28 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedBackground?.img_url}
            alt={String(lastSelectedBackground?.name ?? 'background')}
            fill
            sizes="192px"
            className="w-full h-full border dark:border-gray-500 rounded object-cover"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="w-48 h-28 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <CloudIcon />
          <p className="mt-2 text-blue-500 text-sm font-medium p-1">{t('common.drag_and_drop')}</p>
        </div>
      )}
    </div>
  );

  const isEdit = !!(data?.id && data?.id > 0);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ DF hidden fields required by schema */}
        <input type="hidden" {...register('title_df' as any)} />
        <input type="hidden" {...register('description_df' as any)} />

        {/* Header toggle (Form / JSON) — same style */}
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {isEdit ? t('button.update_coupon') : t('button.add_coupon')}
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
        {(errors as any)?.title_df?.message ? (
          <Card className="mt-4">
            <CardContent className="p-3">
              <p className="text-red-600 text-sm">{String((errors as any)?.title_df?.message)}</p>
            </CardContent>
          </Card>
        ) : null}

        {/* ✅ GLOBAL images (non-i18n) — always visible in FORM mode */}
        {viewMode === 'form' ? (
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Background image */}
                <div>
                  <div className="text-sm font-medium flex items-center gap-2 mb-2">
                    <span>{t('label.background_image') ?? 'Background image'}</span>
                  </div>

                  <div className="relative">
                    <PhotoUploadModal
                      trigger={triggerBg}
                      isMultiple={false}
                      onSave={handleSaveBackground}
                      usageType="coupon"
                      selectedImage={lastSelectedBackground}
                    />
                    {lastSelectedBackground?.image_id && (
                      <Cancel
                        customClass="absolute top-0 right-0 m-1"
                        onClick={(e: { stopPropagation: () => void }) => {
                          e.stopPropagation();
                          removeBackground();
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Thumbnail image (1:1) */}
                <div>
                  <div className="text-sm font-medium flex items-center gap-2 mb-2">
                    <span>{t('label.thumbnail')}</span>
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

                  <div className="relative w-32">
                    <PhotoUploadModal
                      trigger={triggerThumb}
                      isMultiple={false}
                      onSave={handleSaveLogo}
                      usageType="coupon"
                      selectedImage={lastSelectedLogo}
                    />
                    {lastSelectedLogo?.image_id && (
                      <Cancel
                        customClass="absolute top-0 right-0 m-1"
                        onClick={(e: { stopPropagation: () => void }) => {
                          e.stopPropagation();
                          removeLogo();
                        }}
                      />
                    )}
                  </div>

                  {errorLogoMessage ? (
                    <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* CONTENT: JSON or FORM */}
        {viewMode === 'json' ? (
          <Card className="rounded-lg border-none mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Translations JSON"
                languages={uiLangs}
                value={translationsJson}
                onChange={onJsonChange}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    Alanlar: <code>title</code>, <code>description</code>.
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={firstUILangId} className="col-span-2 mt-4">
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
                  <Card className="mt-4">
                    <CardContent className="p-2 md:p-6">
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t('label.title')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                          </span>
                        </div>

                        <Input
                          id={`title_${lang.id}`}
                          {...register(`title_${lang.id}` as any)}
                          className="app-input"
                          placeholder={t('place_holder.enter_value') ?? 'Enter value'}
                        />
                        {(errors as any)?.[`title_${lang.id}`]?.message ? (
                          <p className="text-red-500 text-sm mt-1">
                            {String((errors as any)[`title_${lang.id}`]?.message)}
                          </p>
                        ) : null}
                      </div>

                      <div className="mb-2">
                        <p className="text-sm font-medium mb-1">
                          {t('label.description')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                        </p>

                        <Controller
                          control={control}
                          name={`description_${lang.id}` as any}
                          render={({ field }) => (
                            <TiptapEditor
                              value={typeof field.value === 'string' ? field.value : ''}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        )}

        {/* ✅ SUBMIT — always visible (Form + JSON) */}
        <div className="col-span-2 mt-10">
          <SubmitButton
            UpdateData={data}
            IsLoading={isPending || isUpdating}
            AddLabel={t('button.add_coupon')}
            UpdateLabel={t('button.update_coupon')}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateOrUpdateCouponForm;
