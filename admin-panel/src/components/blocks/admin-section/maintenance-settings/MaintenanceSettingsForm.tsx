// =============================================================
// FILE: src/components/blocks/admin-section/maintenance-settings/MaintenanceSettingsForm.tsx
// FINAL — Maintenance Settings (Form + JSON) — JSON Scaffold STANDARD
//
// FIX (CRITICAL):
// - Backend helper createOrUpdateTranslation expects translations[*].language_code
// - DO NOT use bracket-notation in object keys. Send REAL JSON array: translations: [{...}, ...]
// - IMPORTANT: Build translations from RHF FORM values (NOT JSON state)
// - multipart MUST be false so request is application/json (Laravel parses nested arrays correctly)
// - Dates: send "YYYY-MM-DD" or null
// =============================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValid } from 'date-fns';
import { Info } from 'lucide-react';

import multiLang from '@/components/molecules/multiLang.json';
import { SubmitButton } from '@/components/blocks/shared';
import CustomSingleDatePicker from '@/components/blocks/common/CustomSingleDatePicker';
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
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';

import CloudIcon from '@/assets/icons/CloudIcon';
import GlobalImageLoader from '@/lib/imageLoader';

import {
  useMaintenanceSettingsQuery,
  useMaintenanceSettingsStoreMutation,
} from '@/modules/admin-section/maintenance-settings/maintenance-settings.action';

import {
  MaintenanceSettingsFormData,
  maintenanceSettingsSchema,
} from '@/modules/admin-section/maintenance-settings/maintenance-settings.schema';

import Cancel from '../../custom-icons/Cancel';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';

import {
  AdminI18nJsonPanel,
  makeRHFSetValueAny,
  safeObject,
  ensureLangKeys,
  useFormI18nScaffold,
  initI18nFlatFormFromEntity,
} from '@/lib/json';
import type { ViewMode } from '@/lib/json';

const I18N_FIELDS = ['title', 'description'] as const;
const DF_LANG = 'df';

function safeStr(v: any) {
  return String(v ?? '');
}
function safeTrim(v: any) {
  return String(v ?? '').trim();
}

function buildUiLangs(raw: any[]) {
  const arr = Array.isArray(raw) ? raw : [];
  const ui = arr.filter((l: any) => {
    const id = String(l?.id ?? '');
    const label = String(l?.label ?? '');
    if (!id) return false;
    if (id === 'df') return false;
    if (label.toLowerCase() === 'default') return false;
    return true;
  });
  const firstId = ui?.[0]?.id ? String(ui[0].id) : 'tr';
  return { uiLangs: ui, firstUILangId: firstId };
}

function is1to1Image(img?: UploadedImage | null) {
  const dimensions = safeTrim((img as any)?.dimensions);
  if (!dimensions) return true;
  const [w, h] = dimensions.split(' x ').map((x) => parseInt(x.trim(), 10));
  if (!w || !h) return true;
  return Math.abs(w / h - 1) < 0.01;
}

function toYmd(v: any): string | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  if (!isValid(d)) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function patchJsonNonEmpty(base: any, patch: any) {
  const out: any = { ...(base ?? {}) };
  if (!patch || typeof patch !== 'object') return out;

  for (const langKey of Object.keys(patch)) {
    const pLang = patch[langKey];
    if (!pLang || typeof pLang !== 'object') continue;

    out[langKey] = { ...(out[langKey] ?? {}) };
    for (const fieldKey of Object.keys(pLang)) {
      const v = pLang[fieldKey];
      if (typeof v === 'string') {
        // keep "non-empty patch only" behavior for init
        if (v.trim().length > 0) out[langKey][fieldKey] = v;
      } else if (v !== null && v !== undefined) {
        out[langKey][fieldKey] = v;
      }
    }
  }
  return out;
}

function normalizeMaintenanceTranslations(raw: any) {
  if (!Array.isArray(raw)) return raw;

  const acc: Record<string, { title: string; description: string }> = {};

  for (const item of raw) {
    const lang = item?.language_code || item?.language || item?.lang;
    if (!lang) continue;

    const title = item?.title ?? item?.com_maintenance_title ?? '';
    const description = item?.description ?? item?.com_maintenance_description ?? '';

    if (!acc[lang]) acc[lang] = { title: '', description: '' };
    if (safeTrim(title).length) acc[lang].title = String(title);
    if (safeTrim(description).length) acc[lang].description = String(description);
  }

  return Object.keys(acc).map((language) => ({
    language,
    ...acc[language],
  }));
}

export default function MaintenanceSettingsForm() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const multiLangData = useMemo(() => (Array.isArray(multiLang) ? (multiLang as any[]) : []), []);
  const { uiLangs } = useMemo(() => buildUiLangs(multiLangData), [multiLangData]);

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  const {
    control,
    register,
    setValue,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<MaintenanceSettingsFormData>({
    resolver: zodResolver(maintenanceSettingsSchema),
    shouldUnregister: false,
    defaultValues: {
      title_df: '',
      description_df: '',
      start_date: null as any,
      end_date: null as any,
      ...uiLangs.reduce((acc: any, l: any) => {
        acc[`title_${l.id}`] = '';
        acc[`description_${l.id}`] = '';
        return acc;
      }, {}),
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<MaintenanceSettingsFormData>(setValue), [setValue]);

  const i18n = useFormI18nScaffold<MaintenanceSettingsFormData>({
    languages: multiLangData,
    excludeLangIds: [DF_LANG],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: 'title_df', srcField: (l) => `title_${l}`, validate: true },
        { dfField: 'description_df', srcField: (l) => `description_${l}`, validate: true },
      ],
    },
    extraWatchNames: ['start_date', 'end_date'],
  });

  const {
    uiLangs: scaffoldUiLangs,
    firstUILangId: scaffoldFirstId,
    translationsJson,
    setTranslationsJson,
    applyJsonToForm,
    handleTranslationsJsonChange,
    rebuildJsonNow,
  } = i18n;

  const handleMaintenanceJsonChange = (next: any) => {
    const safe = ensureLangKeys(safeObject(next), scaffoldUiLangs);
    const base =
      safe?.[scaffoldFirstId] && typeof safe[scaffoldFirstId] === 'object'
        ? safe[scaffoldFirstId]
        : {};

    const out: Record<string, any> = { ...safe };
    for (const lang of scaffoldUiLangs) {
      const cur =
        safe?.[lang.id] && typeof safe[lang.id] === 'object' ? safe[lang.id] : {};
      const merged: Record<string, any> = { ...cur };
      for (const f of I18N_FIELDS) {
        const v = merged[f];
        if (
          v === undefined ||
          v === null ||
          (typeof v === 'string' && v.trim() === '')
        ) {
          merged[f] = (base as any)?.[f] ?? '';
        }
      }
      out[lang.id] = merged;
    }

    handleTranslationsJsonChange(out);
  };

  const [activeLangId, setActiveLangId] = useState<string>(() => scaffoldFirstId);
  useEffect(() => {
    setActiveLangId((cur) =>
      scaffoldUiLangs.some((l: any) => String(l.id) === String(cur)) ? cur : scaffoldFirstId,
    );
  }, [scaffoldFirstId, scaffoldUiLangs]);

  useEffect(() => {
    for (const l of scaffoldUiLangs) {
      register(`title_${l.id}` as any);
      register(`description_${l.id}` as any);
    }
  }, [scaffoldUiLangs, register]);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const [lastSelectedLogo, setLastSelectedLogo] = useState<UploadedImage | null>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>('');
  const [maintenanceMode, setMaintenanceMode] = useState<string>('');

  const { maintenanceSettingsData, refetch } = useMaintenanceSettingsQuery({});
  const queryData = useMemo(() => (maintenanceSettingsData as any) || {}, [maintenanceSettingsData]);
  const message = queryData?.message;

  useEffect(() => {
    if (isInitialLoading) {
      refetch().finally(() => setIsInitialLoading(false));
    } else {
      setIsFetchingData(true);
      refetch().finally(() => setIsFetchingData(false));
    }
  }, [isInitialLoading, refetch]);

  useEffect(() => {
    if (!message) return;

    const normalizedMessage = {
      ...message,
      translations: normalizeMaintenanceTranslations(message?.translations),
    };

    const startRaw = message?.com_maintenance_start_date;
    const endRaw = message?.com_maintenance_end_date;
    setMaintenanceMode(message?.com_maintenance_mode || '');

    setValueAny('start_date', startRaw ? new Date(startRaw) : null, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('end_date', endRaw ? new Date(endRaw) : null, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    if (message?.com_maintenance_image) {
      const img: UploadedImage = {
        image_id: String(message?.com_maintenance_image ?? ''),
        img_url: message?.com_maintenance_image_url ?? '/images/no-image.png',
        url: message?.com_maintenance_image_url ?? '/images/no-image.png',
        name: 'logo',
      } as any;
      setLastSelectedLogo(img);
      setLogoErrorMessage(is1to1Image(img) ? '' : 'Image must have a 1:1 aspect ratio.');
    } else {
      setLastSelectedLogo(null);
      setLogoErrorMessage('');
    }

    initI18nFlatFormFromEntity({
      editData: normalizedMessage,
      firstUILangId: scaffoldFirstId,
      uiLangs: scaffoldUiLangs,
      i18nFields: I18N_FIELDS,
      setValueAny,
      entityFieldMap: {
        title: 'com_maintenance_title',
        description: 'com_maintenance_description',
      },
      validateFields: ['title', 'description'],
      after: () => {
        rebuildJsonNow();

        const base = ensureLangKeys(translationsJson, scaffoldUiLangs);
        const dbJson = message?.translations_json;
        if (dbJson && typeof dbJson === 'object') {
          const patched = patchJsonNonEmpty(base, dbJson);
          const safePatched = ensureLangKeys(patched, scaffoldUiLangs);
          setTranslationsJson(safePatched);
          applyJsonToForm(safePatched, { markDirty: false });
          rebuildJsonNow();
        }

        const preferred = scaffoldUiLangs.some((l: any) => String(l.id) === String(locale))
          ? locale
          : scaffoldFirstId;
        setActiveLangId(preferred);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, scaffoldFirstId, scaffoldUiLangs.length]);

  useEffect(() => {
    if (viewMode !== 'json') return;
    rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handleSaveLogo = (images: UploadedImage[]) => {
    const first = images?.[0];
    if (!first) {
      setLastSelectedLogo(null);
      setLogoErrorMessage('');
      return;
    }
    setLastSelectedLogo({
      ...first,
      image_id: String(first.image_id ?? (first as any).id ?? ''),
    });
    setLogoErrorMessage(is1to1Image(first) ? '' : 'Image must have a 1:1 aspect ratio.');
  };

  const removeLogo = () => {
    setLastSelectedLogo(null);
    setLogoErrorMessage('');
  };

  const { mutate: MaintenanceSettingsStore, isPending } = useMaintenanceSettingsStoreMutation();

  const onSubmit = async (values: MaintenanceSettingsFormData) => {
    if (lastSelectedLogo && !is1to1Image(lastSelectedLogo)) {
      setLogoErrorMessage('Image must have a 1:1 aspect ratio.');
    }

    const v = safeObject(values);

    const rootTitle =
      safeTrim((v as any).title_df) || safeTrim((v as any)[`title_${scaffoldFirstId}`]);
    const rootDesc =
      safeTrim((v as any).description_df) || safeTrim((v as any)[`description_${scaffoldFirstId}`]);

    // ✅ translations: build from JSON snapshot (single source of truth)
    const jsonSource = ensureLangKeys(translationsJson, scaffoldUiLangs);
    const translations = (scaffoldUiLangs ?? [])
      .filter((lang: any) => String(lang.id) !== String(scaffoldFirstId))
      .map((lang: any) => {
        const langId = String(lang.id);
        const block = safeObject((jsonSource as any)?.[langId]);
        return {
          language_code: langId,
          com_maintenance_title: safeStr(block?.title),
          com_maintenance_description: safeStr(block?.description),
        };
      })
      // only send non-empty; backend deletes empty anyway
      .filter(
        (row: any) =>
          safeTrim(row.com_maintenance_title).length > 0 ||
          safeTrim(row.com_maintenance_description).length > 0,
      );

    // debug once:
    // console.log('SUBMIT translations (JSON array):', translations);

    const submissionData: any = {
      id: queryData?.id ? queryData.id : 0,

      com_maintenance_title: rootTitle,
      com_maintenance_description: rootDesc,

      com_maintenance_mode: maintenanceMode,
      com_maintenance_start_date: toYmd((v as any).start_date),
      com_maintenance_end_date: toYmd((v as any).end_date),

      com_maintenance_image: safeStr(lastSelectedLogo?.image_id ?? ''),

      // ✅ CRITICAL: real array
      translations,

      // ✅ CRITICAL: force JSON transport
      multipart: false,
    };

    return MaintenanceSettingsStore(submissionData, {
      onSuccess: () => refetch(),
    });
  };

  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-48 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={(lastSelectedLogo?.img_url as any) || '/images/no-image.png'}
            alt={(lastSelectedLogo?.name as string) || 'logo'}
            fill
            sizes="192px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="py-2 absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="w-48 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-2 text-blue-500 text-xs font-medium">{t('common.drag_and_drop')}</p>
          </div>
        </div>
      )}
    </div>
  );

  if (isInitialLoading) return <CardSkletonLoader />;

  return (
    <div dir={dir}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register('title_df' as any)} />
        <input type="hidden" {...register('description_df' as any)} />

        <Card className="mt-2">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('label.maintenance_settings') ?? 'Maintenance Settings'}
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

        {viewMode === 'json' ? (
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Maintenance JSON"
                languages={scaffoldUiLangs}
                value={translationsJson}
                onChange={handleMaintenanceJsonChange}
                perLanguage
                showAllTab
                helperText={
                  <span>
                    JSON format: <code>{`{ tr:{title,description}, en:{title,description} }`}</code>
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 mb-6">
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">Maintenance Start Time</p>
                  <Controller
                    name="start_date"
                    control={control}
                    render={({ field }) => {
                      let selected: Date | null = null;
                      if (field.value) {
                        const parsed = new Date(field.value as any);
                        selected = isValid(parsed) ? parsed : null;
                      }
                      return (
                        <CustomSingleDatePicker
                          label=""
                          selectedDate={selected}
                          onChange={(date) => field.onChange(date)}
                        />
                      );
                    }}
                  />
                  {(errors as any)?.start_date?.message ? (
                    <p className="text-red-500 text-sm mt-1">
                      {String((errors as any).start_date.message)}
                    </p>
                  ) : null}
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">Maintenance End Time</p>
                  <Controller
                    name="end_date"
                    control={control}
                    render={({ field }) => {
                      let selected: Date | null = null;
                      if (field.value) {
                        const parsed = new Date(field.value as any);
                        selected = isValid(parsed) ? parsed : null;
                      }
                      return (
                        <CustomSingleDatePicker
                          label=""
                          selectedDate={selected}
                          onChange={(date) => field.onChange(date)}
                        />
                      );
                    }}
                  />
                  {(errors as any)?.end_date?.message ? (
                    <p className="text-red-500 text-sm mt-1">
                      {String((errors as any).end_date.message)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 items-center">
                <p className="text-sm font-medium mb-1">Maintenance Mode</p>
                <Switch
                  dir="ltr"
                  checked={maintenanceMode === 'on'}
                  onCheckedChange={() =>
                    setMaintenanceMode((prev) => (prev === 'on' ? '' : 'on'))
                  }
                />
              </div>

              <div className="mb-8">
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
                  <div className="relative w-48">
                    <PhotoUploadModal
                      trigger={triggerLogo}
                      isMultiple={false}
                      onSave={handleSaveLogo as any}
                      usageType="maintenance_settings"
                      selectedImage={lastSelectedLogo ?? undefined}
                    />
                    {lastSelectedLogo?.image_id ? (
                      <Cancel
                        customClass="absolute top-0 right-0 m-1"
                        onClick={(event: { stopPropagation: () => void }) => {
                          event.stopPropagation();
                          removeLogo();
                        }}
                      />
                    ) : null}
                    {errorLogoMessage ? (
                      <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <Tabs value={activeLangId} onValueChange={setActiveLangId}>
                <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                  {scaffoldUiLangs.map((lang: any) => (
                    <TabsTrigger key={lang.id} value={lang.id}>
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div dir={dir}>
                  {scaffoldUiLangs.map((lang: any) => (
                    <TabsContent key={lang.id} value={lang.id}>
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Title ({lang.label})</span>
                        </div>
                        <Input
                          id={`title_${lang.id}`}
                          {...register(`title_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Description ({lang.label})</span>
                        </div>
                        <Textarea
                          id={`description_${lang.id}`}
                          {...register(`description_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
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
          <SubmitButton IsLoading={isPending || isFetchingData} AddLabel="Save Changes" />
        </Card>
      </form>
    </div>
  );
}
