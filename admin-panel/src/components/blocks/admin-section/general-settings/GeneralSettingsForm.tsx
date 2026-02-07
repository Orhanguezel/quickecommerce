// ===============================================
// File: src/components/blocks/admin-section/general-settings/GeneralSettingsForm.tsx
// FINAL — Standard Form + I18n JSON (shared helpers + deterministic init)
// - Uses: AdminI18nJsonPanel, i18nFormAdapter, i18nNormalize, rhf.ts
// - Uses: useFormI18nScaffold (single-source scaffold)
// - Fixes React #185: DO NOT watch whole form object
// - Fixes submit: schema requires *_df => hidden register + scaffold dfSync
// - Uses existing actions/hooks unchanged
// ===============================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Loader from '@/components/molecules/Loader';
import multiLang from '@/components/molecules/multiLang.json';
import { SubmitButton } from '@/components/blocks/shared';
import Cancel from '@/components/blocks/custom-icons/Cancel';
import CardSkletonLoader from '@/components/molecules/CardSkletonLoader';

import {
  Card,
  CardContent,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';

import {
  useGeneralSettingsQuery,
  useGeneralSettingsStoreMutation,
} from '@/modules/admin-section/general-settings/general-settings.action';
import {
  GeneralSettingsFormData,
  generalSettingsSchema,
} from '@/modules/admin-section/general-settings/general-settings.schema';

import CloudIcon from '@/assets/icons/CloudIcon';
import GlobalImageLoader from '@/lib/imageLoader';
import { useGeneralQuery } from '@/modules/common/com/com.action';

import { Info } from 'lucide-react';
import moment from 'moment-timezone';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import PhotoUploadModal, { type UploadedImage } from '../../shared/PhotoUploadModal';
import { AppSearchSelect } from '../../common/AppSearchSelect';

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
  normalizeTranslationsMap,
} from '@/lib/json';
import type { LangKeys, ViewMode, LangType } from '@/lib/json';

type ToggleState = {
  emailVerification: string;
  loginOTP: string;
  maintenanceMode: string;
};

const I18N_FIELDS = [
  'title',
  'sub_title',
  'contact_number',
  'street_address',
  'footer_copyright',
] as const;

function safeStr(x: any) {
  return String(x ?? '').trim();
}

function hasAnyI18nValue(v: any, langId: string) {
  for (const f of I18N_FIELDS) {
    if (safeStr(v?.[`${f}_${langId}`])) return true;
  }
  return false;
}

function isSquare(img?: UploadedImage) {
  const dims = img?.dimensions ?? '';
  const [w, h] = dims.split(' x ').map((d) => parseInt(d.trim(), 10));
  const ar = w && h ? w / h : 0;
  return Math.abs(ar - 1) < 0.01;
}

export default function GeneralSettingsForm({ data }: any) {
  const t = useTranslations();
  const localeMain = useLocale();

  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const allLangs = useMemo(() => multiLang as Array<{ id: string; label: string }>, []);

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  const timeZoneList = useMemo(
    () =>
      moment.tz.names().map((zone) => ({
        label: zone.replace(/_/g, ' '),
        value: zone,
      })),
    [],
  );

  const {
    register,
    control,
    setValue,
    getValues,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      // df required (hidden)
      title_df: '',
      sub_title_df: '',
      contact_number_df: '',
      street_address_df: '',
      footer_copyright_df: '',

      // GLOBAL
      website_url: '',
      email: '',
      com_site_time_zone: '',

      // file fields (schema)
      com_site_logo: undefined,
      com_site_favicon: undefined,
    } as any,
  });

  const setValueAny = useMemo(
    () => makeRHFSetValueAny<GeneralSettingsFormData>(setValue),
    [setValue],
  );

  // ✅ Scaffold (tek kaynak)
  const i18n = useFormI18nScaffold<GeneralSettingsFormData>({
    languages: allLangs,
    excludeLangIds: ['df'], // ✅ df UI’da gizli
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    extraWatchNames: ['website_url', 'email', 'com_site_time_zone'], // whole-form yok
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: 'title_df', srcField: (l) => `title_${l}`, validate: true },
        { dfField: 'sub_title_df', srcField: (l) => `sub_title_${l}` },
        { dfField: 'contact_number_df', srcField: (l) => `contact_number_${l}` },
        { dfField: 'street_address_df', srcField: (l) => `street_address_${l}` },
        { dfField: 'footer_copyright_df', srcField: (l) => `footer_copyright_${l}` },
      ],
    },
  });

  const { uiLangs, firstUILangId, translationsJson, handleTranslationsJsonChange, rebuildJsonNow } =
    i18n;

  // ✅ Images state (DB preview objeleri file/url olmadan gelebilir; PhotoUploadModal type’ı artık ok)
  const [logoMain, setLogoMain] = useState<UploadedImage | undefined>(undefined);
  const [logoWhite, setLogoWhite] = useState<UploadedImage | undefined>(undefined);
  const [favicon, setFavicon] = useState<UploadedImage | undefined>(undefined);

  const [errLogoMain, setErrLogoMain] = useState('');
  const [errLogoWhite, setErrLogoWhite] = useState('');
  const [errFavicon, setErrFavicon] = useState('');

  const [toggles, setToggles] = useState<ToggleState>({
    emailVerification: '',
    loginOTP: '',
    maintenanceMode: '',
  });

  const { refetch: generalRefetch } = useGeneralQuery({ language: localeMain });

  const { generalSettingsData, refetch, isPending: isQuerying } = useGeneralSettingsQuery({});

  const rootData = useMemo(() => (generalSettingsData as any) || {}, [generalSettingsData]);

  const msg = rootData?.message ?? null;

  // -----------------------------
  // Init (DB -> Form) + rebuildJsonNow (deterministic)
  // -----------------------------
  useEffect(() => {
    if (!msg) return;

    // 1) Root -> firstUILangId
    setValueAny(`title_${firstUILangId}`, msg?.com_site_title ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
    setValueAny(`sub_title_${firstUILangId}`, msg?.com_site_subtitle ?? '', {
      shouldDirty: false,
      shouldTouch: false,
    });
    setValueAny(`contact_number_${firstUILangId}`, msg?.com_site_contact_number ?? '', {
      shouldDirty: false,
      shouldTouch: false,
    });
    setValueAny(`street_address_${firstUILangId}`, msg?.com_site_full_address ?? '', {
      shouldDirty: false,
      shouldTouch: false,
    });
    setValueAny(`footer_copyright_${firstUILangId}`, msg?.com_site_footer_copyright ?? '', {
      shouldDirty: false,
      shouldTouch: false,
    });

    // 2) Global fields
    setValueAny('website_url', msg?.com_site_website_url ?? '', {
      shouldDirty: false,
      shouldTouch: false,
    });
    setValueAny('email', msg?.com_site_email ?? '', {
      shouldDirty: false,
      shouldTouch: false,
    });
    setValueAny('com_site_time_zone', msg?.com_site_time_zone ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });

    // 3) translations -> normalizeTranslationsMap (field isimlerini eşle)
    const rawArr = Array.isArray(msg?.translations) ? msg.translations : [];
    const mapped = rawArr.map((tr: any) => ({
      language_code: tr?.language_code ?? tr?.language ?? tr?.language_code ?? tr?.language,
      title: tr?.com_site_title ?? '',
      sub_title: tr?.com_site_subtitle ?? '',
      contact_number: tr?.com_site_contact_number ?? '',
      street_address: tr?.com_site_full_address ?? '',
      footer_copyright: tr?.com_site_footer_copyright ?? '',
    }));

    const trMap = normalizeTranslationsMap(mapped, I18N_FIELDS);

    for (const langId of Object.keys(trMap)) {
      const block = trMap[langId] ?? {};
      for (const f of I18N_FIELDS) {
        setValueAny(`${f}_${langId}`, block?.[f] ?? '', {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: f === 'title',
        });
      }
    }

    // 4) Images preview
    setLogoMain(
      msg?.com_site_logo
        ? {
            image_id: msg.com_site_logo,
            img_url: msg?.com_site_logo_image_url ?? '/images/no-image.png',
            url: msg?.com_site_logo_image_url ?? '/images/no-image.png', // 👈 hack
            file: undefined as any,
            name: 'com_site_logo',
            dimensions: msg?.com_site_logo_dimensions,
          }
        : undefined,
    );

    setLogoWhite(
      msg?.com_site_white_logo
        ? {
            image_id: msg.com_site_white_logo,
            img_url: msg?.com_site_white_logo_image_url ?? '/images/no-image.png',
            url: msg?.com_site_white_logo_image_url ?? '/images/no-image.png', // 👈 hack
            file: undefined as any,
            name: 'com_site_white_logo',
            dimensions: msg?.com_site_white_logo_dimensions,
          }
        : undefined,
    );

    setFavicon(
      msg?.com_site_favicon
        ? {
            image_id: msg.com_site_favicon,
            img_url: msg?.com_site_favicon_image_url ?? '/images/no-image.png',
            url: msg?.com_site_favicon_image_url ?? '/images/no-image.png', // 👈 hack
            file: undefined as any,
            name: 'com_site_favicon',
            dimensions: msg?.com_site_favicon_dimensions,
          }
        : undefined,
    );

    // 5) Toggles
    setToggles({
      emailVerification: msg?.com_user_email_verification || '',
      loginOTP: msg?.com_user_login_otp || '',
      maintenanceMode: msg?.com_maintenance_mode || '',
    });

    setErrLogoMain('');
    setErrLogoWhite('');
    setErrFavicon('');

    // ✅ init bittikten sonra json mutlaka rebuild
    rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg, firstUILangId]);

  // -----------------------------
  // Toggles
  // -----------------------------
  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => {
      const next = { ...prev };

      if (property === 'emailVerification') {
        next.emailVerification = prev.emailVerification === 'on' ? '' : 'on';
        if (next.emailVerification === 'on') next.loginOTP = '';
      } else if (property === 'loginOTP') {
        next.loginOTP = prev.loginOTP === 'on' ? '' : 'on';
        if (next.loginOTP === 'on') next.emailVerification = '';
      } else {
        next[property] = prev[property] === 'on' ? '' : 'on';
      }

      return next;
    });
  };

  // -----------------------------
  // Upload handlers (square + optional RHF file validation)
  // -----------------------------
  const onSaveMainLogo = (images: UploadedImage[]) => {
    const img = images?.[0];
    setLogoMain(img);

    if (!img) {
      setErrLogoMain('');
      setValueAny('com_site_logo', undefined, { shouldDirty: true, shouldValidate: true });
      return true;
    }

    if (!isSquare(img)) {
      setErrLogoMain('Image must have a 1:1 aspect ratio.');
      return false;
    }

    // schema file validate gerekiyorsa (upload seçildiğinde file var)
    if (img.file) {
      setValueAny('com_site_logo', img.file as any, { shouldDirty: true, shouldValidate: true });
    }

    setErrLogoMain('');
    return true;
  };

  const onSaveWhiteLogo = (images: UploadedImage[]) => {
    const img = images?.[0];
    setLogoWhite(img);

    if (!img) {
      setErrLogoWhite('');
      return true;
    }

    if (!isSquare(img)) {
      setErrLogoWhite('Image must have a 1:1 aspect ratio.');
      return false;
    }

    setErrLogoWhite('');
    return true;
  };

  const onSaveFavicon = (images: UploadedImage[]) => {
    const img = images?.[0];
    setFavicon(img);

    if (!img) {
      setErrFavicon('');
      setValueAny('com_site_favicon', undefined, { shouldDirty: true, shouldValidate: true });
      return true;
    }

    if (!isSquare(img)) {
      setErrFavicon('Image must have a 1:1 aspect ratio.');
      return false;
    }

    if (img.file) {
      setValueAny('com_site_favicon', img.file as any, { shouldDirty: true, shouldValidate: true });
    }

    setErrFavicon('');
    return true;
  };

  const triggerBox = (img?: UploadedImage) => (
    <div className="hover:cursor-pointer">
      {img?.img_url ? (
        <div className="relative w-32 h-32 group border dark:border-gray-500 rounded flex items-center justify-center">
          <Image
            loader={GlobalImageLoader}
            src={img.img_url}
            alt={String(img?.name ?? 'image')}
            width={128}
            height={128}
            className="object-contain max-w-full max-h-full"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] py-2 border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="border-2 w-32 h-32 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <CloudIcon />
          <p className="mt-2 text-blue-500 text-xs font-medium">{t('common.drag_and_drop')}</p>
        </div>
      )}
    </div>
  );

  // -----------------------------
  // Submit (df fallback + translations + translations_json)
  // -----------------------------
  const { mutate: GeneralSettingsStore, isPending } = useGeneralSettingsStoreMutation();

  const onSubmit = async (values: GeneralSettingsFormData) => {
    const v: any = values as any;

    // root values MUST come from df (schema-required)
    const root = {
      com_site_title: safeStr(v?.title_df) || safeStr(v?.[`title_${firstUILangId}`]),
      com_site_subtitle: safeStr(v?.sub_title_df) || safeStr(v?.[`sub_title_${firstUILangId}`]),
      com_site_contact_number:
        safeStr(v?.contact_number_df) || safeStr(v?.[`contact_number_${firstUILangId}`]),
      com_site_full_address:
        safeStr(v?.street_address_df) || safeStr(v?.[`street_address_${firstUILangId}`]),
      com_site_footer_copyright:
        safeStr(v?.footer_copyright_df) || safeStr(v?.[`footer_copyright_${firstUILangId}`]),

      // GLOBAL
      com_site_website_url: safeStr(v?.website_url),
      com_site_email: safeStr(v?.email),
      com_site_time_zone: safeStr(v?.com_site_time_zone),

      // toggles
      com_user_email_verification: toggles.emailVerification,
      com_user_login_otp: toggles.loginOTP,
      com_maintenance_mode: toggles.maintenanceMode,
    };

    const translations = (uiLangs ?? [])
      .filter((l) => l.id !== firstUILangId)
      .filter((l) => hasAnyI18nValue(v, l.id))
      .map((l) => ({
        language_code: l.id,
        com_site_title: safeStr(v?.[`title_${l.id}`]),
        com_site_subtitle: safeStr(v?.[`sub_title_${l.id}`]),
        com_site_contact_number: safeStr(v?.[`contact_number_${l.id}`]),
        com_site_full_address: safeStr(v?.[`street_address_${l.id}`]),
        com_site_footer_copyright: safeStr(v?.[`footer_copyright_${l.id}`]),
      }));

    const builtJson = buildI18nJsonFromFlatValues({
      values: v,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });

    const submissionData: any = {
      ...root,
      id: rootData?.id ? rootData.id : 0,

      // backend image_id
      com_site_logo: logoMain?.image_id ?? '',
      com_site_white_logo: logoWhite?.image_id ?? '',
      com_site_favicon: favicon?.image_id ?? '',

      translations,
      translations_json: ensureLangKeys(builtJson, uiLangs),
      multipart: true,
    };

    return GeneralSettingsStore(submissionData, {
      onSuccess: () => {
        refetch();
        generalRefetch();
      },
    });
  };

  if (isQuerying) return <CardSkletonLoader />;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ df hidden register (schema-required) */}
        <input type="hidden" {...register('title_df' as any)} />
        <input type="hidden" {...register('sub_title_df' as any)} />
        <input type="hidden" {...register('contact_number_df' as any)} />
        <input type="hidden" {...register('street_address_df' as any)} />
        <input type="hidden" {...register('footer_copyright_df' as any)} />

        {/* ✅ file fields exist in RHF */}
        <Controller name="com_site_logo" control={control} render={() => <></>} />
        <Controller name="com_site_favicon" control={control} render={() => <></>} />

        {/* Header: Form/JSON toggle */}
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('label.general_settings')}
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

        {/* GLOBAL */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">{t('label.website_url')}</p>
                <Input
                  {...register('website_url' as any)}
                  className="app-input"
                  placeholder={t('place_holder.enter_value')}
                />
                {(errors as any)?.website_url?.message ? (
                  <p className="text-red-500 text-sm mt-1">
                    {String((errors as any)?.website_url?.message)}
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-sm font-medium mb-1">{t('label.email')}</p>
                <Input
                  {...register('email' as any)}
                  className="app-input"
                  placeholder={t('place_holder.enter_value')}
                />
                {(errors as any)?.email?.message ? (
                  <p className="text-red-500 text-sm mt-1">
                    {String((errors as any)?.email?.message)}
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-sm font-medium mb-1">{t('label.com_site_time_zone')}</p>
                <Controller
                  control={control}
                  name="com_site_time_zone"
                  render={({ field }) => (
                    <AppSearchSelect
                      value={String(field.value ?? '')}
                      onSelect={(value) => field.onChange(value)}
                      groups={timeZoneList}
                      hideNone
                    />
                  )}
                />
                {(errors as any)?.com_site_time_zone?.message ? (
                  <p className="text-red-500 text-sm mt-1">
                    {String((errors as any)?.com_site_time_zone?.message)}
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* JSON view */}
        {viewMode === 'json' ? (
          <Card className="rounded-lg border-none mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="General Settings JSON"
                languages={uiLangs}
                value={ensureLangKeys(translationsJson, uiLangs)}
                onChange={handleTranslationsJsonChange}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    Alanlar: <code>title</code>, <code>sub_title</code>, <code>contact_number</code>
                    , <code>street_address</code>, <code>footer_copyright</code>.
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          // FORM view
          <Card className="mt-4">
            <CardContent className="p-2 md:p-4 lg:p-4">
              <Tabs defaultValue={firstUILangId}>
                <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                  {uiLangs.map((lang) => (
                    <TabsTrigger key={lang.id} value={lang.id}>
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div dir={dir} className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
                  {/* Left i18n fields */}
                  <div>
                    {uiLangs.map((lang) => (
                      <TabsContent key={lang.id} value={lang.id}>
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>{t('label.title')} ({lang.label})</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-custom-dark-blue dark:bg-white max-w-sm">
                                  <p className="p-1 text-sm">{t('tooltip.site_title_localized')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Input
                            {...register(`title_${lang.id}` as any)}
                            className="app-input"
                            placeholder={t('place_holder.enter_value')}
                          />
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1">{t('label.sub_title')} ({lang.label})</div>
                          <Input
                            {...register(`sub_title_${lang.id}` as any)}
                            className="app-input"
                            placeholder={t('place_holder.enter_value')}
                          />
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1">
                            {t('label.contact_number')} ({lang.label})
                          </div>
                          <Input
                            {...register(`contact_number_${lang.id}` as any)}
                            className="app-input"
                            placeholder={t('place_holder.enter_value')}
                          />
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1">{t('label.address')} ({lang.label})</div>
                          <Input
                            {...register(`street_address_${lang.id}` as any)}
                            className="app-input"
                            placeholder={t('place_holder.enter_value')}
                          />
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1">
                            {t('label.footer_copyright')} ({lang.label})
                          </div>
                          <Input
                            {...register(`footer_copyright_${lang.id}` as any)}
                            className="app-input"
                            placeholder={t('place_holder.enter_value')}
                          />
                        </div>
                      </TabsContent>
                    ))}
                  </div>

                  {/* Right: media + toggles */}
                  <div className="mt-2">
                    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
                      {/* Primary logo */}
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2 mb-1">
                          <span>{t('label.primary_logo')}</span>
                        </div>
                        <div className="relative w-32">
                          <PhotoUploadModal
                            trigger={triggerBox(logoMain)}
                            isMultiple={false}
                            onSave={onSaveMainLogo}
                            usageType="general_settings"
                            selectedImage={logoMain}
                          />
                          {logoMain?.image_id && (
                            <Cancel
                              customClass="absolute top-0 right-0 m-1"
                              onClick={(e: { stopPropagation: () => void }) => {
                                e.stopPropagation();
                                setLogoMain(undefined);
                                setErrLogoMain('');
                                setValueAny('com_site_logo', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                            />
                          )}
                          {errLogoMain ? (
                            <p className="text-red-500 text-sm mt-1">{errLogoMain}</p>
                          ) : null}
                        </div>
                      </div>

                      {/* Light logo */}
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2 mb-1">
                          <span>{t('label.light_mode_logo')}</span>
                        </div>
                        <div className="relative w-32">
                          <PhotoUploadModal
                            trigger={triggerBox(logoWhite)}
                            isMultiple={false}
                            onSave={onSaveWhiteLogo}
                            usageType="general_settings"
                            selectedImage={logoWhite}
                          />
                          {logoWhite?.image_id && (
                            <Cancel
                              customClass="absolute top-0 right-0 m-1"
                              onClick={(e: { stopPropagation: () => void }) => {
                                e.stopPropagation();
                                setLogoWhite(undefined);
                                setErrLogoWhite('');
                              }}
                            />
                          )}
                          {errLogoWhite ? (
                            <p className="text-red-500 text-sm mt-1">{errLogoWhite}</p>
                          ) : null}
                        </div>
                      </div>

                      {/* Favicon */}
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2 mb-1">
                          <span>{t('label.favicon')}</span>
                        </div>
                        <div className="relative w-32">
                          <PhotoUploadModal
                            trigger={triggerBox(favicon)}
                            isMultiple={false}
                            onSave={onSaveFavicon}
                            usageType="general_settings"
                            selectedImage={favicon}
                          />
                          {favicon?.image_id && (
                            <Cancel
                              customClass="absolute top-0 right-0 m-1"
                              onClick={(e: { stopPropagation: () => void }) => {
                                e.stopPropagation();
                                setFavicon(undefined);
                                setErrFavicon('');
                                setValueAny('com_site_favicon', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                            />
                          )}
                          {errFavicon ? (
                            <p className="text-red-500 text-sm mt-1">{errFavicon}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4">
                        <p className="text-sm font-medium mb-1">{t('label.email_verification')}</p>
                        <Switch
                          dir="ltr"
                          checked={toggles.emailVerification === 'on'}
                          onCheckedChange={() => handleToggle('emailVerification')}
                        />
                      </div>

                      <div className="my-4 grid grid-cols-2 lg:grid-cols-4">
                        <p className="text-sm font-medium mb-1">{t('label.login_otp')}</p>
                        <Switch
                          dir="ltr"
                          checked={toggles.loginOTP === 'on'}
                          onCheckedChange={() => handleToggle('loginOTP')}
                        />
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4">
                        <p className="text-sm font-medium mb-1">{t('label.maintenance_mode')}</p>
                        <Switch
                          dir="ltr"
                          checked={toggles.maintenanceMode === 'on'}
                          onCheckedChange={() => handleToggle('maintenanceMode')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton IsLoading={isPending} AddLabel={t('button.save_changes')} />
        </Card>
      </form>
    </div>
  );
}
