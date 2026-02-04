// =============================================================
// FILE: src/components/blocks/admin-section/seo-settings/SEOSettingsForm.tsx
// FINAL — minimal fix (meta_tag persist + no init timing bug)
// Fixes:
// - normalizeJsonForForm: always sets meta_tag for every language (fallback [])
// - Init: build JSON from getValues() (NOT watch timing)
// - Submit: translations_json always normalized before sending
// =============================================================

'use client';

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
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';

import CloudIcon from '@/assets/icons/CloudIcon';
import { TagsInput } from '@/components/ui/tags-input';
import GlobalImageLoader from '@/lib/imageLoader';
import {
  useSEOSettingsQuery,
  useSEOSettingsStoreMutation,
} from '@/modules/admin-section/seo-settings/seo-settings.action';
import {
  SEOSettingsFormData,
  seoSettingsSchema,
} from '@/modules/admin-section/seo-settings/seo-settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import Cancel from '../../custom-icons/Cancel';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';
import CardSkletonLoader from '@/components/molecules/CardSkletonLoader';

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


// ✅ Bu formda JSON’a dahil edeceğimiz alanlar
const I18N_FIELDS = [
  'meta_title',
  'meta_description',
  'og_title',
  'og_description',
  'meta_tag',
] as const;


const SEOSettingsForm = () => {
  const t = useTranslations();

  const multiLangData = useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  // ✅ İlk dil aktif olsun
  const firstLangId = multiLangData?.[0]?.id ?? 'tr';

  // ✅ getValues eklendi (init timing fix)
  const { watch, getValues, control, register, setValue, handleSubmit } =
    useForm<SEOSettingsFormData>({
      resolver: zodResolver(seoSettingsSchema),
    });

  const [viewMode, setViewMode] = useState<ViewMode>('form'); // ✅ default form
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>('');

  const [translationsJson, setTranslationsJson] = useState<any>({});

  const { seoSettingsData, refetch } = useSEOSettingsQuery({});
  const QuerySEOSettingsData = useMemo(() => (seoSettingsData as any) || [], [seoSettingsData]);

  // -------------------------------------------
  // Helpers
  // -------------------------------------------
  const hasNonEmptyObject = (v: any) => !!v && typeof v === 'object' && Object.keys(v).length > 0;

  const normalizeMetaTag = (v: any) => {
    if (Array.isArray(v))
      return v
        .map(String)
        .map((x) => x.trim())
        .filter(Boolean);
    if (typeof v === 'string') {
      return v
        .split(',')
        .map((x) => String(x).trim())
        .filter(Boolean);
    }
    return [];
  };

  /**
   * ✅ CRITICAL FIX:
   * Normalize JSON for this form.
   * - No mutation
   * - ALWAYS ensures meta_tag exists as string[] for every language
   */
  const normalizeJsonForForm = (json: any) => {
    const out: any = {};
    const srcRoot = json && typeof json === 'object' ? json : {};

    for (const lang of multiLangData) {
      const src = srcRoot?.[lang.id];
      const obj: any = src && typeof src === 'object' ? { ...src } : {};

      // ALWAYS set meta_tag (even if missing in incoming json)
      obj.meta_tag = normalizeMetaTag(obj.meta_tag);

      out[lang.id] = obj;
    }

    // preserve other root-level object keys (optional)
    for (const k of Object.keys(srcRoot)) {
      if (k in out) continue;
      const v = (srcRoot as any)[k];
      if (v && typeof v === 'object') out[k] = v;
    }

    return out;
  };

  const handleTranslationsJsonChange = (next: any) => {
    const normalized = normalizeJsonForForm(next);
    setTranslationsJson(normalized);

    // JSON -> Form
    applyI18nJsonToFlatForm({
      json: normalized,
      languages: multiLangData,
      fields: [...I18N_FIELDS],
      setValue,
      keyOf: (field, langId) => `${field}_${langId}`,
    });
  };

  // -------------------------------------------
  // Init: DB -> form + JSON
  // -------------------------------------------
  useEffect(() => {
    const SEOSettingsMessage = QuerySEOSettingsData?.message;
    if (!SEOSettingsMessage) return;

    // “Default” (com_*) artık ilk dile yazılır (tr)
    setValue(
      `meta_title_${firstLangId}` as keyof SEOSettingsFormData,
      SEOSettingsMessage?.com_meta_title ?? '',
    );
    setValue(
      `meta_description_${firstLangId}` as keyof SEOSettingsFormData,
      SEOSettingsMessage?.com_meta_description ?? '',
    );
    setValue('canonical_url', SEOSettingsMessage?.com_canonical_url ?? '');
    setValue(
      `og_title_${firstLangId}` as keyof SEOSettingsFormData,
      SEOSettingsMessage?.com_og_title ?? '',
    );
    setValue(
      `og_description_${firstLangId}` as keyof SEOSettingsFormData,
      SEOSettingsMessage?.com_og_description ?? '',
    );
    setValue(
      `meta_tag_${firstLangId}` as keyof SEOSettingsFormData,
      normalizeMetaTag(SEOSettingsMessage?.com_meta_tags ?? ''),
    );

    // Translations (backend)
    SEOSettingsMessage?.translations?.forEach((translation: any) => {
      const langId = translation.language || translation.language_code;
      if (!langId) return;

      setValue(
        `meta_title_${langId}` as keyof SEOSettingsFormData,
        translation.com_meta_title ?? '',
      );
      setValue(
        `meta_description_${langId}` as keyof SEOSettingsFormData,
        translation.com_meta_description ?? '',
      );
      setValue(`og_title_${langId}` as keyof SEOSettingsFormData, translation.com_og_title ?? '');
      setValue(
        `og_description_${langId}` as keyof SEOSettingsFormData,
        translation.com_og_description ?? '',
      );
      setValue(
        `meta_tag_${langId}` as keyof SEOSettingsFormData,
        normalizeMetaTag(translation?.com_meta_tags ?? ''),
      );
    });

    // OG image
    if (SEOSettingsMessage?.com_og_image) {
      setLastSelectedLogo({
        image_id: SEOSettingsMessage?.com_og_image ?? '',
        img_url: SEOSettingsMessage?.com_og_image_url ?? '/images/no-image.png',
        name: 'logo',
      });
    } else {
      setLastSelectedLogo(null);
    }
    setLogoErrorMessage('');

    // ✅ JSON init (FIXED):
    // 1) if backend has translations_json -> normalize + apply
    // 2) else build from getValues() (NOT watch timing)
    const dbJson = SEOSettingsMessage?.translations_json;
    if (dbJson && typeof dbJson === 'object') {
      handleTranslationsJsonChange(dbJson);
    } else {
      const current = getValues() as any; // ✅ timing-safe snapshot
      const built = buildI18nJsonFromFlatValues({
        values: current,
        languages: multiLangData,
        fields: [...I18N_FIELDS],
        keyOf: (field, langId) => `${field}_${langId}`,
        skipEmpty: true,
      });
      setTranslationsJson(normalizeJsonForForm(built));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [QuerySEOSettingsData, setValue, firstLangId]);

  // -------------------------------------------
  // Mode sync: when switching to JSON, rebuild from form
  // (so JSON panel reflects latest edits in form mode)
  // -------------------------------------------
  useEffect(() => {
    if (viewMode !== 'json') return;

    // ✅ use getValues (NOT watch) to avoid missing arrays
    const current = getValues() as any;
    const built = buildI18nJsonFromFlatValues({
      values: current,
      languages: multiLangData,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: true,
    });
    setTranslationsJson(normalizeJsonForForm(built));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handleSaveLogo = (images: UploadedImage[]) => {
    setLastSelectedLogo(images[0]);

    const dimensions = images[0].dimensions ?? '';
    const [width, height] = dimensions.split(' x ').map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width / height;

    if (Math.abs(aspectRatio - 1 / 1) < 0.01) {
      setLogoErrorMessage('');
      return true;
    } else {
      setLogoErrorMessage('Image must have a 1:1 aspect ratio.');
      return false;
    }
  };

  const removeLogo = () => {
    setLastSelectedLogo(null);
    setLogoErrorMessage('');
  };

  const { mutate: SEOSettingsStore, isPending } = useSEOSettingsStoreMutation();

  const onSubmit = async (values: SEOSettingsFormData) => {
    const defaultData = {
      com_meta_title: (values as any)[`meta_title_${firstLangId}`] ?? '',
      com_meta_description: (values as any)[`meta_description_${firstLangId}`] ?? '',
      com_canonical_url: values.canonical_url,
      com_og_title: (values as any)[`og_title_${firstLangId}`] ?? '',
      com_og_description: (values as any)[`og_description_${firstLangId}`] ?? '',
      com_meta_tags: ((((values as any)[`meta_tag_${firstLangId}`] || []) as string[]) || []).join(
        ', ',
      ),
    };

    const translations = multiLangData
      .filter((lang) => (values as any)[`meta_title_${lang.id}`])
      .map((lang) => ({
        language_code: lang.id,
        com_meta_title: (values as any)[`meta_title_${lang.id}`],
        com_meta_description: (values as any)[`meta_description_${lang.id}`],
        com_og_title: (values as any)[`og_title_${lang.id}`],
        com_og_description: (values as any)[`og_description_${lang.id}`],
        com_meta_tags: ((((values as any)[`meta_tag_${lang.id}`] || []) as string[]) || []).join(
          ', ',
        ),
      }));

    const hasJson = hasNonEmptyObject(translationsJson);

    // ✅ CRITICAL FIX: always normalize before submit (meta_tag keys never drop)
    const translations_json = normalizeJsonForForm(
      hasJson
        ? translationsJson
        : buildI18nJsonFromFlatValues({
            values: values as any,
            languages: multiLangData,
            fields: [...I18N_FIELDS],
            keyOf: (field, langId) => `${field}_${langId}`,
            skipEmpty: true,
          }),
    );

    const submissionData: any = {
      ...defaultData,
      id: QuerySEOSettingsData?.id ? QuerySEOSettingsData?.id : 0,
      com_og_image: lastSelectedLogo ? lastSelectedLogo?.image_id : '',
      translations,
      translations_json,
      multipart: true,
    };

    return SEOSettingsStore(submissionData as any, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={lastSelectedLogo?.name as string}
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
        <div className=" w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-2 text-blue-500 text-xs font-medium">{t('common.drag_and_drop')}</p>
          </div>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (isInitialLoading) {
      refetch().finally(() => setIsInitialLoading(false));
    } else {
      setIsFetchingData(true);
      refetch().finally(() => setIsFetchingData(false));
    }
  }, [isInitialLoading, refetch]);

  // ✅ Header toggle UI
  const ModeToggle = (
    <div className="mb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t?.('label.seo_settings') ?? 'SEO Settings'}
        </div>

        <div className="inline-flex rounded-md border bg-white dark:bg-[#1f2937] overflow-hidden">
          <button
            type="button"
            onClick={() => setViewMode('form')}
            className={`px-4 py-2 text-sm font-medium transition ${
              viewMode === 'form'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            Form
          </button>
          <button
            type="button"
            onClick={() => setViewMode('json')}
            className={`px-4 py-2 text-sm font-medium transition ${
              viewMode === 'json'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            JSON
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {isInitialLoading ? (
        <CardSkletonLoader />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {ModeToggle}

          {viewMode === 'json' ? (
            <Card className="mt-2">
              <CardContent className="p-2 md:p-6">
                <AdminI18nJsonPanel
                  label="Translations JSON"
                  languages={multiLangData}
                  value={translationsJson}
                  onChange={handleTranslationsJsonChange}
                  perLanguage={true}
                  showAllTab={true}
                  helperText={
                    <span>
                      Her tab sadece o dilin JSON’unu düzenler. <code>meta_tag</code> alanı array
                      olmalı (örn: ["tag1","tag2"]).
                    </span>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-2">
              <CardContent className="p-2 md:p-6">
                <Tabs defaultValue={firstLangId} className="">
                  <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                    {multiLangData.map((lang) => (
                      <TabsTrigger key={lang.id} value={lang.id}>
                        {lang.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div dir={dir} className="">
                    <div>
                      {multiLangData.map((lang) => (
                        <TabsContent key={lang.id} value={lang.id}>
                          <div>
                            <div className="mb-4">
                              <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>Meta Tags ({lang.label})</span>
                                <div>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-custom-dark-blue">
                                        <p className="p-1 text-sm font-medium">
                                          Please provide meta tags{' '}
                                          <span>
                                            {lang.label !== 'Default' && `in ${lang.label}`}
                                          </span>
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>

                              <Controller
                                name={`meta_tag_${lang.id}` as keyof SEOSettingsFormData}
                                control={control}
                                render={({ field }) => (
                                  <TagsInput
                                    {...field}
                                    value={Array.isArray(field.value) ? field.value : []}
                                    onChange={(newValue: string[]) => field.onChange(newValue)}
                                    placeholder={`Enter meta tags for ${lang.label}`}
                                    className="app-input "
                                  />
                                )}
                              />
                            </div>

                            <div className="mb-4">
                              <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>Meta Title ({lang.label})</span>
                                <div>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-custom-dark-blue">
                                        <p className="p-1 text-sm font-medium">
                                          Please provide meta title{' '}
                                          <span>
                                            {lang.label !== 'Default' && `in ${lang.label}`}
                                          </span>
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>

                              <Input
                                id={`meta_title_${lang.id}`}
                                {...register(`meta_title_${lang.id}` as keyof SEOSettingsFormData)}
                                className="app-input"
                                placeholder="Enter value"
                              />
                            </div>

                            <div className="mb-4">
                              <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>Meta Description ({lang.label})</span>
                                <div>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-custom-dark-blue">
                                        <p className="p-1 text-sm font-medium">
                                          Please provide meta description{' '}
                                          <span>
                                            {lang.label !== 'Default' && `in ${lang.label}`}
                                          </span>
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>

                              <Textarea
                                id={`meta_description_${lang.id}`}
                                {...register(
                                  `meta_description_${lang.id}` as keyof SEOSettingsFormData,
                                )}
                                className="app-input"
                                placeholder="Enter value"
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>OG Title ({lang.label})</span>
                              <div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-custom-dark-blue">
                                      <p className="p-1 text-sm font-medium">
                                        Please provide OG title{' '}
                                        <span>
                                          {lang.label !== 'Default' && `in ${lang.label}`}
                                        </span>
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>

                            <Input
                              id={`og_title_${lang.id}`}
                              {...register(`og_title_${lang.id}` as keyof SEOSettingsFormData)}
                              className="app-input"
                              placeholder="Enter value"
                            />
                          </div>

                          <div className="mb-4">
                            <div className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>OG Description ({lang.label})</span>
                              <div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-custom-dark-blue">
                                      <p className="p-1 text-sm font-medium">
                                        Please provide OG description{' '}
                                        <span>
                                          {lang.label !== 'Default' && `in ${lang.label}`}
                                        </span>
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>

                            <Textarea
                              id={`og_description_${lang.id}`}
                              {...register(
                                `og_description_${lang.id}` as keyof SEOSettingsFormData,
                              )}
                              className="app-input"
                              placeholder="Enter value"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>Canonical URL</span>
                            </p>
                            <Input
                              id="canonical_url"
                              {...register('canonical_url' as keyof SEOSettingsFormData)}
                              className="app-input"
                              placeholder="Enter value"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium my-2">OG Image</p>
                            <div className="relative">
                              <div className="relative w-32">
                                <PhotoUploadModal
                                  trigger={triggerLogo}
                                  isMultiple={false}
                                  onSave={handleSaveLogo}
                                  usageType="seo_settings"
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
                              </div>

                              {errorLogoMessage && (
                                <p className=" text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </div>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          )}

          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton IsLoading={isPending} AddLabel="Save Changes" />
          </Card>
        </form>
      )}
    </div>
  );
};

export default SEOSettingsForm;
