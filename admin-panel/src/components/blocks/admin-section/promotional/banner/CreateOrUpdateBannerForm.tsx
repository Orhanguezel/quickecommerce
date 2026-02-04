//===============================================
// File: src/components/blocks/admin-section/promotional/banner/CreateOrUpdateBannerForm.tsx
// FINAL — Standard Form + I18n JSON Scaffold (DF contract + deterministic init)
// - Schema requires: title_df (min 2) => hidden register + dfSync
// - Root language dynamic (firstUILangId), df excluded
// - DB -> form: root -> df + firstUILangId, translations -> other langs
// - JSON mode supported: AdminI18nJsonPanel
// - Submit payload: root from df (fallback firstUILangId) + translations exclude firstUILangId
// - Keeps legacy translations[] + translations_json together
// - Whole-form watch YASAK: scaffold watches only i18n fields + extra fields (colors, type, theme_name, redirect_url)
// - Uses existing actions/hooks unchanged
//===============================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import multiLang from '@/components/molecules/multiLang.json';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';

import {
  Button,
  Card,
  CardContent,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
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

import CloudIcon from '@/assets/icons/CloudIcon';
import Cancel from '@/components/blocks/custom-icons/Cancel';
import {
  useBannerStoreMutation,
  useBannerUpdateMutation,
} from '@/modules/admin-section/promotional/banner/banner.action';

import GlobalImageLoader from '@/lib/imageLoader';
import {
  BannerFormData,
  bannerSchema,
} from '@/modules/admin-section/promotional/banner/banner.schema';

import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { HexColorPicker } from 'react-colorful';
import { Controller, useForm } from 'react-hook-form';

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

const DiscountTypeList = [
  { label: 'Banner Section One', value: 'banner_one' },
  { label: 'Banner Section Two', value: 'banner_two' },
  { label: 'Banner Section Three', value: 'banner_three' },
];

const Themelist = [
  { label: 'Default', value: 'default' },
  { label: 'Theme One', value: 'theme_one' },
  { label: 'Theme Two', value: 'theme_two' },
];

// ✅ JSON'a dahil edeceğimiz i18n alanlar
const I18N_FIELDS = ['title', 'sub_title', 'button_text', 'description'] as const;

function safeStr(x: any) {
  return String(x ?? '').trim();
}

function hasAnyI18nValueBanner(v: any, langId: string) {
  const title = safeStr(v?.[`title_${langId}`]);
  const st = safeStr(v?.[`sub_title_${langId}`]);
  const bt = safeStr(v?.[`button_text_${langId}`]);
  const desc = safeStr(v?.[`description_${langId}`]);
  return !!(title || st || bt || desc);
}

// redirect_url schema refine: only valid URL or empty
function safeUrl(v: any) {
  const s = safeStr(v);
  return s;
}

export default function CreateOrUpdateBannerForm({ data }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const allLangs = useMemo(() => multiLang as Array<{ id: string; label: string }>, []);

  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const editRow = data?.data ?? data ?? null;

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  // ✅ image state (typed)
  const [lastSelectedLogo, setLastSelectedLogo] = useState<UploadedImage | undefined>(undefined);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
    getValues,
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      // DF contract
      title_df: '',
      sub_title_df: '',
      button_text_df: '',
      description_df: '',

      // non-i18n
      redirect_url: '',
      type: '',
      theme_name: editRow?.theme_name ?? 'default',

      // colors (same defaults as your old form)
      title_color: '#ff6133',
      sub_title_color: '#ffe933',
      description_color: '#1beb11',
      button_text_color: '#ffff',
      button_color: '#1153eb',
      button_hover_color: '#0a3eb5',
      background_color: '#0a3eb5',
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<BannerFormData>(setValue), [setValue]);

  // ✅ Scaffold + dfSync (React #185 safe: no whole-form watch)
  const i18n = useFormI18nScaffold<BannerFormData>({
    languages: allLangs,
    excludeLangIds: ['df'],
    fields: [...I18N_FIELDS],
    control: control as any,
    getValues,
    setValueAny,
    extraWatchNames: [
      'type',
      'theme_name',
      'redirect_url',
      'title_color',
      'sub_title_color',
      'description_color',
      'button_text_color',
      'button_color',
      'button_hover_color',
      'background_color',
    ],
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: 'title_df', srcField: (l) => `title_${l}`, validate: true },
        { dfField: 'sub_title_df', srcField: (l) => `sub_title_${l}` },
        { dfField: 'button_text_df', srcField: (l) => `button_text_${l}` },
        { dfField: 'description_df', srcField: (l) => `description_${l}` },
      ],
    },
  });

  const { uiLangs, firstUILangId, translationsJson, handleTranslationsJsonChange, rebuildJsonNow } =
    i18n;

  // ---------------------------------------------
  // CSS vars (color preview) - no whole watch usage
  // We read from getValues snapshot periodically via scaffold triggers,
  // but simplest: watch only the exact fields you already had (OK).
  // ---------------------------------------------
  const titleColor = (control as any)._formValues?.title_color ?? getValues()?.title_color;
  const subTitleColor =
    (control as any)._formValues?.sub_title_color ?? getValues()?.sub_title_color;
  const descriptionColor =
    (control as any)._formValues?.description_color ?? getValues()?.description_color;
  const buttonTextColor =
    (control as any)._formValues?.button_text_color ?? getValues()?.button_text_color;
  const buttonColor = (control as any)._formValues?.button_color ?? getValues()?.button_color;
  const buttonHoverColor =
    (control as any)._formValues?.button_hover_color ?? getValues()?.button_hover_color;
  const backgroundColor =
    (control as any)._formValues?.background_color ?? getValues()?.background_color;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--title-color', titleColor || '#000000');
    root.style.setProperty('--sub-title-color', subTitleColor || '#000000');
    root.style.setProperty('--description-color', descriptionColor || '#000000');
    root.style.setProperty('--button-text-color', buttonTextColor || '#ffffff');
    root.style.setProperty('--button-color', buttonColor || '#1153eb');
    root.style.setProperty('--button-hover-color', buttonHoverColor || '#0d47a1');
    root.style.setProperty('--background-color', backgroundColor || '#0a3eb5');
  }, [
    titleColor,
    subTitleColor,
    descriptionColor,
    buttonTextColor,
    buttonColor,
    buttonHoverColor,
    backgroundColor,
  ]);

  const handleColorChange = (color: string, colorField: keyof BannerFormData | string) => {
    setValueAny(String(colorField), color, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleSelectItem = (value: string, inputType: keyof BannerFormData | string) => {
    setValueAny(String(inputType), value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleSaveLogo = (images: UploadedImage[]) => {
    const first = images?.[0];
    if (!first) return false;

    setLastSelectedLogo(first);

    const dimensions = first.dimensions ?? '';
    const parts = String(dimensions)
      .split(' x ')
      .map((s) => parseInt(s.trim(), 10));
    const width = parts?.[0] ?? 0;
    const height = parts?.[1] ?? 0;
    const aspectRatio = height ? width / height : 0;

    if (Math.abs(aspectRatio - 1 / 1) < 0.01) {
      setLogoErrorMessage('');
      return true;
    }
    setLogoErrorMessage('Image must have a 1:1 aspect ratio.');
    return false;
  };

  const removeLogo = () => {
    setLastSelectedLogo(undefined);
    setLogoErrorMessage('');
  };

  // ✅ JSON normalize: accept either root {lang:{...}} or single-lang blocks (panel handles perLanguage)
  const normalizeJsonForForm = (json: any) => {
    const next = safeObject(json);
    return ensureLangKeys(next, uiLangs);
  };

  // ✅ JSON panel change -> scaffold (scaffold already applies to form)
  const onJsonChange = (next: any) => {
    const normalized = normalizeJsonForForm(next);
    handleTranslationsJsonChange(normalized);
  };

  // ✅ DB -> form init + JSON init (deterministic)
  useEffect(() => {
    // create
    if (!editRow) {
      rebuildJsonNow();
      return;
    }

    // root -> DF
    setValueAny('title_df', editRow?.title ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('sub_title_df', editRow?.sub_title ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('button_text_df', editRow?.button_text ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('description_df', editRow?.description ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // root -> firstUILangId
    setValueAny(`title_${firstUILangId}`, editRow?.title ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny(`sub_title_${firstUILangId}`, editRow?.sub_title ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny(`button_text_${firstUILangId}`, editRow?.button_text ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny(`description_${firstUILangId}`, editRow?.description ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // non-i18n
    setValueAny('redirect_url', editRow?.redirect_url ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('type', editRow?.type ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('theme_name', editRow?.theme_name ?? 'default', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // colors
    setValueAny('title_color', editRow?.title_color ?? '#000000', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('sub_title_color', editRow?.sub_title_color ?? '#000000', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('description_color', editRow?.description_color ?? '#000000', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('button_text_color', editRow?.button_text_color ?? '#ffffff', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('button_color', editRow?.button_color ?? '#1153eb', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('button_hover_color', editRow?.button_hover_color ?? '#0d47a1', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('background_color', editRow?.background_color ?? '#0a3eb5', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // translations (legacy object map)
    const trObj =
      editRow?.translations && typeof editRow.translations === 'object' ? editRow.translations : {};

    Object.keys(trObj).forEach((langId) => {
      const tr = (trObj as any)?.[langId];
      if (!tr) return;
      setValueAny(`title_${langId}`, tr?.title ?? '', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setValueAny(`sub_title_${langId}`, tr?.sub_title ?? '', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setValueAny(`button_text_${langId}`, tr?.button_text ?? '', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setValueAny(`description_${langId}`, tr?.description ?? '', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    });

    // thumbnail image preview (fix UploadedImage.url required)
    if (editRow?.thumbnail_image) {
      setLastSelectedLogo({
        image_id: editRow.thumbnail_image,
        img_url: editRow?.thumbnail_image_url ?? '/images/no-image.png',
        url: editRow?.thumbnail_image_url ?? '/images/no-image.png', // ✅ required by UploadedImage
        file: undefined as any, // legacy: no File in edit mode
        name: 'thumbnail_image',
        dimensions: editRow?.thumbnail_image_dimensions,
      });
    } else {
      setLastSelectedLogo(undefined);
    }
    setLogoErrorMessage('');

    // JSON init:
    // If backend provides translations_json (optional), use it; else rebuild from flat values
    const dbJson = editRow?.translations_json;
    if (dbJson && typeof dbJson === 'object') {
      onJsonChange(dbJson);
    } else {
      rebuildJsonNow();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRow?.id, firstUILangId]);

  // ✅ Mode sync: JSON moduna geçince rebuild (watch yok)
  useEffect(() => {
    if (viewMode !== 'json') return;
    rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Hooks (unchanged)
  const storeHook = useBannerStoreMutation();
  const updateHook = useBannerUpdateMutation();
  const isSaving = !!storeHook?.isPending || !!updateHook?.isPending;

  const onSubmit = async (values: BannerFormData) => {
    const v: any = values as any;

    // ✅ root must come from DF (schema contract)
    const rootTitle = safeStr(v?.title_df) || safeStr(v?.[`title_${firstUILangId}`]);
    const rootSubTitle = safeStr(v?.sub_title_df) || safeStr(v?.[`sub_title_${firstUILangId}`]);
    const rootButtonText =
      safeStr(v?.button_text_df) || safeStr(v?.[`button_text_${firstUILangId}`]);
    const rootDesc = safeStr(v?.description_df) || safeStr(v?.[`description_${firstUILangId}`]);

    const defaultData: any = {
      title: rootTitle,
      sub_title: rootSubTitle,
      button_text: rootButtonText,
      description: rootDesc,

      // keep df (harmless)
      title_df: v?.title_df,
      sub_title_df: v?.sub_title_df,
      button_text_df: v?.button_text_df,
      description_df: v?.description_df,

      redirect_url: safeUrl(v?.redirect_url),
      type: v?.type ?? '',
      theme_name: v?.theme_name ?? 'default',

      title_color: v?.title_color,
      sub_title_color: v?.sub_title_color,
      description_color: v?.description_color,
      button_text_color: v?.button_text_color,
      button_color: v?.button_color,
      button_hover_color: v?.button_hover_color,
      background_color: v?.background_color,
    };

    // legacy translations[]
    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== firstUILangId)
      .filter((lang) => hasAnyI18nValueBanner(v, lang.id))
      .map((lang) => ({
        language_code: lang.id,
        title: safeStr(v?.[`title_${lang.id}`]),
        sub_title: safeStr(v?.[`sub_title_${lang.id}`]),
        button_text: safeStr(v?.[`button_text_${lang.id}`]),
        description: safeStr(v?.[`description_${lang.id}`]),
      }));

    // translations_json (standard)
    const built = buildI18nJsonFromFlatValues({
      values: v,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });
    const translations_json = ensureLangKeys(built, uiLangs);

    const payload: any = {
      ...defaultData,
      translations,
      translations_json,
      thumbnail_image: lastSelectedLogo?.image_id ?? '',
      id: editRow?.id ?? 0,
    };

    try {
      if ((editRow?.id ?? 0) > 0) {
        await updateHook.mutateAsync(payload as any);
      } else {
        await storeHook.mutateAsync(payload as any);
        reset();
        setLastSelectedLogo(undefined);
      }
      dispatch(setRefetch(true));
    } catch (e) {
      console.error('Banner submit failed:', e);
    }
  };

  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={String(lastSelectedLogo?.name ?? 'thumbnail_image')}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded object-contain"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-4 text-blue-500 text-sm font-medium p-1">
              {t('common.drag_and_drop')}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ DF hidden fields required by schema */}
        <input type="hidden" {...register('title_df' as any)} />
        <input type="hidden" {...register('sub_title_df' as any)} />
        <input type="hidden" {...register('button_text_df' as any)} />
        <input type="hidden" {...register('description_df' as any)} />

        {/* ✅ Header toggle (Form / JSON) */}
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {editRow?.id ? t('button.update_banner') : t('button.add_banner')}
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

        {viewMode === 'json' ? (
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Banner Translations JSON"
                languages={uiLangs}
                value={translationsJson}
                onChange={onJsonChange}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    Alanlar: <code>title</code>, <code>sub_title</code>, <code>button_text</code>,{' '}
                    <code>description</code>.
                  </span>
                }
                height={420}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-4">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* LEFT */}
                        <div className="space-y-4 mt-1">
                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>Theme Name</span>
                            </p>
                            <Controller
                              control={control}
                              name="theme_name"
                              render={({ field }) => (
                                <AppSelect
                                  value={String(field.value ?? '')}
                                  onSelect={(value) => field.onChange(value)}
                                  groups={Themelist}
                                  hideNone
                                />
                              )}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">{t('label.type')}</p>
                            <Controller
                              control={control}
                              name="type"
                              render={({ field }) => (
                                <AppSelect
                                  value={String(field.value ?? '')}
                                  onSelect={(value) => {
                                    field.onChange(value);
                                    handleSelectItem(String(value), 'type');
                                  }}
                                  groups={DiscountTypeList}
                                />
                              )}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>
                                {t('label.title')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                              </span>
                            </p>
                            <Input
                              id={`title_${lang.id}`}
                              {...register(`title_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t('place_holder.enter_title')}
                            />
                            {(errors as any)?.[`title_${lang.id}`]?.message ? (
                              <p className="text-red-500 text-sm mt-1">
                                {String((errors as any)[`title_${lang.id}`]?.message)}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>
                                {t('label.description')} (
                                {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                              </span>
                            </p>
                            <Textarea
                              id={`description_${lang.id}`}
                              {...register(`description_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t('place_holder.enter_description')}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>
                                {t('label.button_text')} (
                                {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                              </span>
                            </p>
                            <Input
                              id={`button_text_${lang.id}`}
                              {...register(`button_text_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t('place_holder.enter_button_text')}
                            />
                            {(errors as any)?.[`button_text_${lang.id}`]?.message ? (
                              <p className="text-red-500 text-sm mt-1">
                                {String((errors as any)[`button_text_${lang.id}`]?.message)}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>
                                {t('label.sub_title')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)}
                                )
                              </span>
                            </p>
                            <Input
                              id={`sub_title_${lang.id}`}
                              {...register(`sub_title_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t('place_holder.enter_sub_title')}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>{t('label.redirect_url')}</span>
                            </p>
                            <Input
                              id="redirect_url"
                              {...register('redirect_url' as any)}
                              className="app-input"
                              placeholder={t('place_holder.enter_redirect_url')}
                            />
                            {(errors as any)?.redirect_url?.message ? (
                              <p className="text-red-500 text-sm mt-1">
                                {String((errors as any)?.redirect_url?.message)}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {/* RIGHT */}
                        <div className="space-y-4">
                          <div className="flex flex-col md:flex-row items-start gap-4">
                            <div>
                              <div className="text-sm font-medium flex items-center gap-2 mb-1">
                                <span>{t('label.thumbnail')}</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-custom-dark-blue w-96">
                                      <p className="p-1 text-sm font-medium">
                                        {t('tooltip.aspect_ratio_1_1')}
                                      </p>
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
                                    usageType="banner"
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
                                  {errorLogoMessage ? (
                                    <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Colors */}
                          <Card className="border-none shadow-none">
                            <CardContent className="p-0">
                              <h3 className="text-base font-medium mb-2">
                                {t('label.banner_color')}
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* title_color */}
                                <div className="grid grid-cols-4 md:grid-cols-8 items-center">
                                  <p className="col-span-3 text-sm font-medium mb-1">
                                    {t('label.title_color')}
                                  </p>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button className="w-12 h-10 rounded-md border dynamic-title-color" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56 p-4 flex flex-col items-center gap-2">
                                      <HexColorPicker
                                        color={safeStr(getValues()?.title_color) || '#000000'}
                                        onChange={(color) =>
                                          handleColorChange(color, 'title_color')
                                        }
                                      />
                                      <Input
                                        type="text"
                                        value={safeStr(getValues()?.title_color)}
                                        onChange={(e) =>
                                          handleColorChange(e.target.value, 'title_color')
                                        }
                                        className="app-input w-full"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                {/* description_color */}
                                <div className="grid grid-cols-4 md:grid-cols-8 items-center">
                                  <p className="col-span-3 text-sm font-medium mb-1">
                                    {t('label.description_color')}
                                  </p>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button className="w-12 h-10 rounded-md border dynamic-description-color" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56 p-4 flex flex-col items-center gap-2">
                                      <HexColorPicker
                                        color={safeStr(getValues()?.description_color) || '#000000'}
                                        onChange={(color) =>
                                          handleColorChange(color, 'description_color')
                                        }
                                      />
                                      <Input
                                        type="text"
                                        value={safeStr(getValues()?.description_color)}
                                        onChange={(e) =>
                                          handleColorChange(e.target.value, 'description_color')
                                        }
                                        className="app-input w-full"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                {/* button_text_color */}
                                <div className="grid grid-cols-4 md:grid-cols-8 items-center">
                                  <p className="col-span-3 text-sm font-medium mb-1">
                                    {t('label.button_text_color')}
                                  </p>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button className="w-12 h-10 rounded-md border dynamic-button-text-color" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56 p-4 flex flex-col items-center gap-2">
                                      <HexColorPicker
                                        color={safeStr(getValues()?.button_text_color) || '#ffffff'}
                                        onChange={(color) =>
                                          handleColorChange(color, 'button_text_color')
                                        }
                                      />
                                      <Input
                                        type="text"
                                        value={safeStr(getValues()?.button_text_color)}
                                        onChange={(e) =>
                                          handleColorChange(e.target.value, 'button_text_color')
                                        }
                                        className="app-input w-full"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                {/* button_color */}
                                <div className="grid grid-cols-4 md:grid-cols-8 items-center">
                                  <p className="col-span-3 text-sm font-medium mb-1">
                                    {t('label.button_color')}
                                  </p>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button className="w-12 h-10 rounded-md border dynamic-button-color" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56 p-4 flex flex-col items-center gap-2">
                                      <HexColorPicker
                                        color={safeStr(getValues()?.button_color) || '#1153eb'}
                                        onChange={(color) =>
                                          handleColorChange(color, 'button_color')
                                        }
                                      />
                                      <Input
                                        type="text"
                                        value={safeStr(getValues()?.button_color)}
                                        onChange={(e) =>
                                          handleColorChange(e.target.value, 'button_color')
                                        }
                                        className="app-input w-full"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                {/* button_hover_color */}
                                <div className="grid grid-cols-4 md:grid-cols-8 items-center">
                                  <p className="col-span-3 text-sm font-medium mb-1">
                                    {t('label.button_hover_color')}
                                  </p>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button className="w-12 h-10 rounded-md border dynamic-button-hover-color" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56 p-4 flex flex-col items-center gap-2">
                                      <HexColorPicker
                                        color={
                                          safeStr(getValues()?.button_hover_color) || '#0d47a1'
                                        }
                                        onChange={(color) =>
                                          handleColorChange(color, 'button_hover_color')
                                        }
                                      />
                                      <Input
                                        type="text"
                                        value={safeStr(getValues()?.button_hover_color)}
                                        onChange={(e) =>
                                          handleColorChange(e.target.value, 'button_hover_color')
                                        }
                                        className="app-input w-full"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                {/* background_color */}
                                <div className="grid grid-cols-4 md:grid-cols-8 items-center">
                                  <p className="col-span-3 text-sm font-medium mb-1">
                                    {t('label.bg_color')}
                                  </p>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button className="w-12 h-10 rounded-md border dynamic-background-color" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56 p-4 flex flex-col items-center gap-2">
                                      <HexColorPicker
                                        color={safeStr(getValues()?.background_color) || '#0a3eb5'}
                                        onChange={(color) =>
                                          handleColorChange(color, 'background_color')
                                        }
                                      />
                                      <Input
                                        type="text"
                                        value={safeStr(getValues()?.background_color)}
                                        onChange={(e) =>
                                          handleColorChange(e.target.value, 'background_color')
                                        }
                                        className="app-input w-full"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
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
            UpdateData={editRow?.id ? editRow : null}
            IsLoading={isSaving}
            AddLabel={t('button.add_banner')}
            UpdateLabel={t('button.update_banner')}
          />
        </Card>
      </form>
    </div>
  );
}
