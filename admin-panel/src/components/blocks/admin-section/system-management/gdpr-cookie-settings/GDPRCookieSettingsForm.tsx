// =============================================================
// FILE: src/components/blocks/admin-section/system-management/gdpr-cookie-settings/GDPRCookieSettingsForm.tsx
// FINAL — JSON panel standard + nested steps adapter + firstLang default
// - firstLangId = multiLang[0].id (no *_df)
// - JSON <-> Form sync (custom adapter because nested + steps)
// - JSON mode: rebuild JSON from current form snapshot when switching
// - Steps: onBoardSteps is source-of-truth for steps per language
// - Avoid RHF type friction: setValueAny helper
// =============================================================

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import multiLang from '@/components/molecules/multiLang.json';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import CustomSingleDatePicker from '@/components/blocks/common/CustomSingleDatePicker';
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

import {
  useGDPRCookieSettingsQuery,
  useGDPRCookieSettingsStoreMutation,
} from '@/modules/admin-section/system-management/page-settings/gdpr-cookie-settings/gdpr-cookie-settings.action';
import { GDPRCookieSettingsSchema } from '@/modules/admin-section/system-management/page-settings/gdpr-cookie-settings/gdpr-cookie-settings.schema';

import { zodResolver } from '@hookform/resolvers/zod';
import { format, isValid } from 'date-fns';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import CardSkletonLoader from '@/components/molecules/CardSkletonLoader';

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

type ToggleState = {
  com_gdpr_enable_disable: string; // "on" | ""
  com_gdpr_can_reject_all: string; // "on" | ""
};

// Form values pratik: mevcut modülde çok alan var, minimal kırılma için Record
type GDPRCookieSettingsFormData = Record<string, any>;

type OnBoardStep = {
  titles: Record<string, string>;
  subtitles: Record<string, string>;
  req_status: Record<string, string>;
  image: string;
};

const emptyStep = (): OnBoardStep => ({
  titles: {},
  subtitles: {},
  req_status: {},
  image: '',
});

const GDPRCookieSettingsForm = ({ data }: any) => {
  const t = useTranslations();

  const multiLangData = useMemo(() => multiLang as Array<{ id: string; label: string }>, []);

  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const firstLangId = multiLangData?.[0]?.id ?? 'tr';

  const StatusList = useMemo(
    () => [
      { label: 'Required', value: 'required' },
      { label: 'Optional', value: 'optional' },
    ],
    [],
  );

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  const [toggles, setToggles] = useState<ToggleState>({
    com_gdpr_enable_disable: '',
    com_gdpr_can_reject_all: '',
  });

  const { control, register, setValue, handleSubmit, getValues, watch } =
    useForm<GDPRCookieSettingsFormData>({
      resolver: zodResolver(GDPRCookieSettingsSchema as any),
    });

  const setValueAny = useMemo(
    () => makeRHFSetValueAny<GDPRCookieSettingsFormData>(setValue),
    [setValue],
  );

  const { GDPRCookieSettings, refetch, isPending } = useGDPRCookieSettingsQuery({});
  const QueryGDPRCookieData = useMemo(
    () => (GDPRCookieSettings as any)?.data || [],
    [GDPRCookieSettings],
  );

  const GDPRBasicSectionData = QueryGDPRCookieData?.content?.gdpr_basic_section;
  const GDPRMoreInfoSectionData = QueryGDPRCookieData?.content?.gdpr_more_info_section;

  const [onBoardSteps, setOnBoardSteps] = useState<OnBoardStep[]>([]);

  // ✅ JSON state
  const [translationsJson, setTranslationsJson] = useState<any>({});
  const initSigRef = useRef<string>('');

  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => ({
      ...prev,
      [property]: prev[property] === 'on' ? '' : 'on',
    }));
  };

  const handleAddOnBoardStep = () => {
    setOnBoardSteps((prev) => [...prev, emptyStep()]);
  };

  const handleDeleteOnBoardStep = (index: number) => {
    setOnBoardSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeOnBoardStep = (
    index: number,
    field: 'titles' | 'subtitles' | 'req_status' | 'image',
    langId: string,
    value: any,
  ) => {
    setOnBoardSteps((prev) => {
      const next = [...prev];
      const row = next[index] ?? emptyStep();

      if (field === 'titles' || field === 'subtitles' || field === 'req_status') {
        (row as any)[field] = {
          ...(row as any)[field],
          [langId]: String(value ?? ''),
        };
      } else {
        (row as any)[field] = String(value ?? '');
      }

      next[index] = row;
      return next;
    });
  };

  // =============================================================
  // JSON <-> Form adapter (nested + steps)
  // =============================================================
  const normalizeTranslationsJson = (json: any) => {
    const out: any = safeObject(json);

    for (const lang of multiLangData) {
      const langObj = out?.[lang.id];
      if (!langObj || typeof langObj !== 'object') continue;

      const basic = (langObj as any).gdpr_basic_section;
      const more = (langObj as any).gdpr_more_info_section;

      // ensure nested objects
      if (!basic || typeof basic !== 'object') (langObj as any).gdpr_basic_section = {};
      if (!more || typeof more !== 'object') (langObj as any).gdpr_more_info_section = {};

      const moreObj = (langObj as any).gdpr_more_info_section;
      if (!Array.isArray(moreObj.steps)) moreObj.steps = [];
    }

    return out;
  };

  const applyTranslationsJsonToForm = (json: any) => {
    const obj = normalizeTranslationsJson(json);

    // flat fields
    for (const lang of multiLangData) {
      const langObj = obj?.[lang.id];
      if (!langObj || typeof langObj !== 'object') continue;

      const basic = (langObj as any).gdpr_basic_section ?? {};
      const more = (langObj as any).gdpr_more_info_section ?? {};

      setValueAny(`com_gdpr_title_${lang.id}`, basic.com_gdpr_title ?? '');
      setValueAny(`com_gdpr_message_${lang.id}`, basic.com_gdpr_message ?? '');
      setValueAny(`com_gdpr_more_info_label_${lang.id}`, basic.com_gdpr_more_info_label ?? '');
      setValueAny(`com_gdpr_accept_label_${lang.id}`, basic.com_gdpr_accept_label ?? '');
      setValueAny(`com_gdpr_decline_label_${lang.id}`, basic.com_gdpr_decline_label ?? '');
      setValueAny(`com_gdpr_manage_label_${lang.id}`, basic.com_gdpr_manage_label ?? '');
      setValueAny(`com_gdpr_manage_title_${lang.id}`, basic.com_gdpr_manage_title ?? '');

      setValueAny(`section_title_${lang.id}`, more.section_title ?? '');
      setValueAny(`section_details_${lang.id}`, more.section_details ?? '');
    }

    // steps aggregate
    const aggregated: OnBoardStep[] = [];
    for (const lang of multiLangData) {
      const steps = obj?.[lang.id]?.gdpr_more_info_section?.steps;
      if (!Array.isArray(steps)) continue;

      steps.forEach((step: any, index: number) => {
        if (!aggregated[index]) aggregated[index] = emptyStep();

        aggregated[index].titles[lang.id] = step?.title ?? '';
        aggregated[index].subtitles[lang.id] = step?.descriptions ?? '';
        aggregated[index].req_status[lang.id] = step?.req_status ?? '';
      });
    }
    setOnBoardSteps(aggregated.length > 0 ? aggregated : []);
  };

  const buildTranslationsJsonFromForm = (values?: any) => {
    const v = values ?? getValues();
    const out: any = {};

    for (const lang of multiLangData) {
      out[lang.id] = {
        gdpr_basic_section: {
          com_gdpr_title: v?.[`com_gdpr_title_${lang.id}`] ?? '',
          com_gdpr_message: v?.[`com_gdpr_message_${lang.id}`] ?? '',
          com_gdpr_more_info_label: v?.[`com_gdpr_more_info_label_${lang.id}`] ?? '',
          com_gdpr_accept_label: v?.[`com_gdpr_accept_label_${lang.id}`] ?? '',
          com_gdpr_decline_label: v?.[`com_gdpr_decline_label_${lang.id}`] ?? '',
          com_gdpr_manage_label: v?.[`com_gdpr_manage_label_${lang.id}`] ?? '',
          com_gdpr_manage_title: v?.[`com_gdpr_manage_title_${lang.id}`] ?? '',
        },
        gdpr_more_info_section: {
          section_title: v?.[`section_title_${lang.id}`] ?? '',
          section_details: v?.[`section_details_${lang.id}`] ?? '',
          steps: (onBoardSteps || []).map((s) => ({
            title: s?.titles?.[lang.id] ?? s?.titles?.[firstLangId] ?? '',
            descriptions: s?.subtitles?.[lang.id] ?? s?.subtitles?.[firstLangId] ?? '',
            req_status: s?.req_status?.[lang.id] ?? s?.req_status?.[firstLangId] ?? '',
          })),
        },
      };
    }

    return normalizeTranslationsJson(out);
  };

  const handleTranslationsJsonChange = (next: any) => {
    const normalized = normalizeTranslationsJson(next);
    setTranslationsJson(normalized);
    applyTranslationsJsonToForm(normalized);
  };

  // =============================================================
  // DB -> Form init
  // =============================================================
  useEffect(() => {
    const sig = JSON.stringify({
      id: QueryGDPRCookieData?.id ?? '',
      content: QueryGDPRCookieData?.content ?? null,
      translations: QueryGDPRCookieData?.translations ?? null,
      translations_json: QueryGDPRCookieData?.translations_json ?? null,
      firstLangId,
    });
    if (initSigRef.current === sig) return;
    initSigRef.current = sig;

    // defaults
    if (GDPRBasicSectionData) {
      setValueAny(`com_gdpr_title_${firstLangId}`, GDPRBasicSectionData?.com_gdpr_title ?? '');
      setValueAny(`com_gdpr_message_${firstLangId}`, GDPRBasicSectionData?.com_gdpr_message ?? '');
      setValueAny(
        `com_gdpr_more_info_label_${firstLangId}`,
        GDPRBasicSectionData?.com_gdpr_more_info_label ?? '',
      );

      setValueAny('com_gdpr_more_info_link', GDPRBasicSectionData?.com_gdpr_more_info_link ?? '');

      setValueAny(
        `com_gdpr_accept_label_${firstLangId}`,
        GDPRBasicSectionData?.com_gdpr_accept_label ?? '',
      );
      setValueAny(
        `com_gdpr_decline_label_${firstLangId}`,
        GDPRBasicSectionData?.com_gdpr_decline_label ?? '',
      );
      setValueAny(
        `com_gdpr_manage_label_${firstLangId}`,
        GDPRBasicSectionData?.com_gdpr_manage_label ?? '',
      );
      setValueAny(
        `com_gdpr_manage_title_${firstLangId}`,
        GDPRBasicSectionData?.com_gdpr_manage_title ?? '',
      );

      setValueAny('com_gdpr_expire_date', GDPRBasicSectionData?.com_gdpr_expire_date ?? '');
      setValueAny('com_gdpr_show_delay', GDPRBasicSectionData?.com_gdpr_show_delay ?? '');

      setToggles({
        com_gdpr_enable_disable: GDPRBasicSectionData?.com_gdpr_enable_disable || '',
        com_gdpr_can_reject_all: GDPRBasicSectionData?.com_gdpr_can_reject_all || '',
      });
    }

    if (GDPRMoreInfoSectionData) {
      setValueAny(`section_title_${firstLangId}`, GDPRMoreInfoSectionData?.section_title ?? '');
      setValueAny(`section_details_${firstLangId}`, GDPRMoreInfoSectionData?.section_details ?? '');

      const steps = Array.isArray(GDPRMoreInfoSectionData?.steps)
        ? GDPRMoreInfoSectionData.steps
        : [];

      if (steps.length > 0) {
        const baseSteps: OnBoardStep[] = steps.map((s: any) => ({
          titles: { [firstLangId]: s?.title ?? '' },
          subtitles: { [firstLangId]: s?.descriptions ?? '' },
          req_status: { [firstLangId]: s?.req_status ?? '' },
          image: '',
        }));
        setOnBoardSteps(baseSteps);
      } else {
        setOnBoardSteps([]);
      }
    }

    // translations object
    if (QueryGDPRCookieData?.translations && typeof QueryGDPRCookieData.translations === 'object') {
      const aggregated: OnBoardStep[] = [];

      Object.keys(QueryGDPRCookieData.translations).forEach((language) => {
        const translation = QueryGDPRCookieData.translations?.[language];
        const basicT = translation?.content?.gdpr_basic_section;
        const moreT = translation?.content?.gdpr_more_info_section;

        if (basicT) {
          setValueAny(`com_gdpr_title_${language}`, basicT?.com_gdpr_title ?? '');
          setValueAny(`com_gdpr_message_${language}`, basicT?.com_gdpr_message ?? '');
          setValueAny(
            `com_gdpr_more_info_label_${language}`,
            basicT?.com_gdpr_more_info_label ?? '',
          );
          setValueAny(`com_gdpr_accept_label_${language}`, basicT?.com_gdpr_accept_label ?? '');
          setValueAny(`com_gdpr_decline_label_${language}`, basicT?.com_gdpr_decline_label ?? '');
          setValueAny(`com_gdpr_manage_label_${language}`, basicT?.com_gdpr_manage_label ?? '');
          setValueAny(`com_gdpr_manage_title_${language}`, basicT?.com_gdpr_manage_title ?? '');
        }

        if (moreT) {
          setValueAny(`section_title_${language}`, moreT?.section_title ?? '');
          setValueAny(`section_details_${language}`, moreT?.section_details ?? '');

          const steps = Array.isArray(moreT?.steps) ? moreT.steps : [];
          steps.forEach((step: any, index: number) => {
            if (!aggregated[index]) aggregated[index] = emptyStep();
            aggregated[index].titles[language] = step?.title ?? '';
            aggregated[index].subtitles[language] = step?.descriptions ?? '';
            aggregated[index].req_status[language] = step?.req_status ?? '';
          });
        }
      });

      if (aggregated.length > 0) {
        setOnBoardSteps((prev) => {
          if (!prev || prev.length === 0) return aggregated;

          const merged = [...prev];
          aggregated.forEach((row, i) => {
            merged[i] = merged[i] || emptyStep();
            merged[i].titles = { ...(merged[i].titles || {}), ...(row.titles || {}) };
            merged[i].subtitles = { ...(merged[i].subtitles || {}), ...(row.subtitles || {}) };
            merged[i].req_status = { ...(merged[i].req_status || {}), ...(row.req_status || {}) };
          });
          return merged;
        });
      }
    }

    // JSON init:
    // backend varsa prefer et; yoksa formdan üret
    const dbJson = QueryGDPRCookieData?.translations_json;
    if (dbJson && typeof dbJson === 'object') {
      handleTranslationsJsonChange(dbJson);
    } else {
      const built = buildTranslationsJsonFromForm(getValues());
      setTranslationsJson(built);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [QueryGDPRCookieData, GDPRBasicSectionData, GDPRMoreInfoSectionData, firstLangId]);

  // ✅ switching to JSON: rebuild from current form snapshot
  useEffect(() => {
    if (viewMode !== 'json') return;
    const snapshot = watch?.() ?? getValues?.();
    setTranslationsJson(buildTranslationsJsonFromForm(snapshot));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // =============================================================
  // SUBMIT
  // =============================================================
  const { mutate: GDPRStore, isPending: isUpdating } = useGDPRCookieSettingsStoreMutation();

  const onSubmit = async (values: GDPRCookieSettingsFormData) => {
    const gdpr_basic_section = {
      com_gdpr_title: values?.[`com_gdpr_title_${firstLangId}`] ?? '',
      com_gdpr_message: values?.[`com_gdpr_message_${firstLangId}`] ?? '',
      com_gdpr_more_info_label: values?.[`com_gdpr_more_info_label_${firstLangId}`] ?? '',
      com_gdpr_more_info_link: values?.com_gdpr_more_info_link ?? '',
      com_gdpr_accept_label: values?.[`com_gdpr_accept_label_${firstLangId}`] ?? '',
      com_gdpr_decline_label: values?.[`com_gdpr_decline_label_${firstLangId}`] ?? '',
      com_gdpr_manage_label: values?.[`com_gdpr_manage_label_${firstLangId}`] ?? '',
      com_gdpr_manage_title: values?.[`com_gdpr_manage_title_${firstLangId}`] ?? '',
      com_gdpr_expire_date: values?.com_gdpr_expire_date ?? '',
      com_gdpr_show_delay: values?.com_gdpr_show_delay ?? '',
      com_gdpr_enable_disable: toggles.com_gdpr_enable_disable,
      com_gdpr_can_reject_all: toggles.com_gdpr_can_reject_all,
    };

    const gdpr_more_info_section = {
      section_title: values?.[`section_title_${firstLangId}`] ?? '',
      section_details: values?.[`section_details_${firstLangId}`] ?? '',
      steps: (onBoardSteps || []).map((s) => ({
        title: s?.titles?.[firstLangId] ?? '',
        descriptions: s?.subtitles?.[firstLangId] ?? '',
        req_status: s?.req_status?.[firstLangId] ?? '',
      })),
    };

    // legacy translations[] (backend bekliyorsa)
    const translations = (multiLangData || []).map((lang) => ({
      language_code: lang.id,
      content: {
        gdpr_basic_section: {
          com_gdpr_title: values?.[`com_gdpr_title_${lang.id}`] ?? '',
          com_gdpr_message: values?.[`com_gdpr_message_${lang.id}`] ?? '',
          com_gdpr_more_info_label: values?.[`com_gdpr_more_info_label_${lang.id}`] ?? '',
          com_gdpr_more_info_link: values?.com_gdpr_more_info_link ?? '',
          com_gdpr_accept_label: values?.[`com_gdpr_accept_label_${lang.id}`] ?? '',
          com_gdpr_decline_label: values?.[`com_gdpr_decline_label_${lang.id}`] ?? '',
          com_gdpr_manage_label: values?.[`com_gdpr_manage_label_${lang.id}`] ?? '',
          com_gdpr_manage_title: values?.[`com_gdpr_manage_title_${lang.id}`] ?? '',
          com_gdpr_expire_date: values?.com_gdpr_expire_date ?? '',
          com_gdpr_show_delay: values?.com_gdpr_show_delay ?? '',
        },
        gdpr_more_info_section: {
          section_title: values?.[`section_title_${lang.id}`] ?? '',
          section_details: values?.[`section_details_${lang.id}`] ?? '',
          steps: (onBoardSteps || []).map((s) => ({
            title: s?.titles?.[lang.id] ?? s?.titles?.[firstLangId] ?? '',
            descriptions: s?.subtitles?.[lang.id] ?? s?.subtitles?.[firstLangId] ?? '',
            req_status: s?.req_status?.[lang.id] ?? s?.req_status?.[firstLangId] ?? '',
          })),
        },
      },
    }));

    const content = { gdpr_basic_section, gdpr_more_info_section };

    const translations_json =
      translationsJson && typeof translationsJson === 'object'
        ? translationsJson
        : buildTranslationsJsonFromForm(values);

    const submissionData: any = {
      id: QueryGDPRCookieData?.id ? QueryGDPRCookieData?.id : 0,
      content,
      translations,
      translations_json, // backend desteklerse kaydeder; desteklemezse ignore
    };

    return GDPRStore(submissionData, {
      onSuccess: () => refetch(),
    });
  };

  // =============================================================
  // RENDER
  // =============================================================
  const HeaderToggle = (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        GDPR Cookie Settings
      </h1>

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
    </div>
  );

  return (
    <div>
      {isPending ? (
        <CardSkletonLoader />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <Card className="mt-4">
            <CardContent className="p-4">{HeaderToggle}</CardContent>
          </Card>

          {/* JSON MODE */}
          {viewMode === 'json' ? (
            <Card className="mt-4">
              <CardContent className="p-4 md:p-6">
                <AdminI18nJsonPanel
                  label="Translations JSON"
                  languages={multiLangData}
                  value={translationsJson}
                  onChange={handleTranslationsJsonChange}
                  perLanguage={true}
                  showAllTab={true}
                  helperText={
                    <span>
                      Her tab sadece o dilin JSON’unu düzenler. <code>gdpr_basic_section</code> ve{' '}
                      <code>gdpr_more_info_section.steps</code> (array) desteklenir.
                    </span>
                  }
                  height={420}
                />
              </CardContent>
            </Card>
          ) : (
            // FORM MODE
            <div>
              <Tabs defaultValue={firstLangId} className="">
                {/* Language tabs header */}
                <Card className="mt-4">
                  <CardContent className="p-0 md:p-4">
                    <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                      {multiLangData.map((lang) => (
                        <TabsTrigger key={lang.id} value={lang.id}>
                          {lang.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </CardContent>
                </Card>

                {/* GDPR Compliance Settings */}
                <Card className="mt-4">
                  <CardContent className="p-2 md:p-6">
                    <div dir={dir}>
                      <h1 className="text-lg font-medium mb-4">GDPR Compliance Settings</h1>

                      {multiLangData.map((lang) => (
                        <TabsContent key={lang.id} value={lang.id}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
                            <div className="space-y-4">
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1">Title ({lang.label})</p>
                                <Input
                                  id={`com_gdpr_title_${lang.id}`}
                                  {...register(`com_gdpr_title_${lang.id}`)}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1">Message ({lang.label})</p>
                                <Textarea
                                  id={`com_gdpr_message_${lang.id}`}
                                  {...register(`com_gdpr_message_${lang.id}`)}
                                  className="app-input min-h-[200px]"
                                  placeholder="Enter value"
                                />
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1">Expire Date</p>

                                <Controller
                                  name="com_gdpr_expire_date"
                                  control={control}
                                  defaultValue={GDPRBasicSectionData?.com_gdpr_expire_date ?? ''}
                                  render={({ field }) => {
                                    let selectedDate: Date | null = null;

                                    if (field.value) {
                                      const parsed = new Date(field.value);
                                      selectedDate = isValid(parsed) ? parsed : null;
                                    }

                                    return (
                                      <CustomSingleDatePicker
                                        label=""
                                        selectedDate={selectedDate}
                                        onChange={(date) => {
                                          if (date) field.onChange(format(date, 'yyyy-MM-dd'));
                                          else field.onChange('');
                                        }}
                                      />
                                    );
                                  }}
                                />
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1">Show Delay</p>
                                <Input
                                  type="number"
                                  id="com_gdpr_show_delay"
                                  {...register('com_gdpr_show_delay')}
                                  className="app-input"
                                  min={0}
                                  placeholder="Enter value"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-4 pb-4 md:pb-0">
                                <p className="col-span-2 text-sm font-medium mb-1">
                                  GDPR Enable/Disable
                                </p>
                                <Switch
                                  dir="ltr"
                                  checked={toggles.com_gdpr_enable_disable === 'on'}
                                  onCheckedChange={() => handleToggle('com_gdpr_enable_disable')}
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1">
                                  More Info Label ({lang.label})
                                </p>
                                <Input
                                  id={`com_gdpr_more_info_label_${lang.id}`}
                                  {...register(`com_gdpr_more_info_label_${lang.id}`)}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1">More Info Link</p>
                                <Input
                                  id="com_gdpr_more_info_link"
                                  {...register('com_gdpr_more_info_link')}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1">
                                  Accept Label ({lang.label})
                                </p>
                                <Input
                                  id={`com_gdpr_accept_label_${lang.id}`}
                                  {...register(`com_gdpr_accept_label_${lang.id}`)}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1">
                                  Decline Label ({lang.label})
                                </p>
                                <Input
                                  id={`com_gdpr_decline_label_${lang.id}`}
                                  {...register(`com_gdpr_decline_label_${lang.id}`)}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1">
                                  Manage Label ({lang.label})
                                </p>
                                <Input
                                  id={`com_gdpr_manage_label_${lang.id}`}
                                  {...register(`com_gdpr_manage_label_${lang.id}`)}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1">
                                  Manage Title ({lang.label})
                                </p>
                                <Input
                                  id={`com_gdpr_manage_title_${lang.id}`}
                                  {...register(`com_gdpr_manage_title_${lang.id}`)}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-4 pb-4 md:pb-0">
                                <p className="col-span-2 text-sm font-medium mb-1">
                                  GDPR Can Reject All
                                </p>
                                <Switch
                                  dir="ltr"
                                  checked={toggles.com_gdpr_can_reject_all === 'on'}
                                  onCheckedChange={() => handleToggle('com_gdpr_can_reject_all')}
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* GDPR Data Protection Section */}
                <Card className="mt-4">
                  <CardContent className="p-2 md:p-6">
                    <div dir={dir}>
                      <h1 className="text-lg md:text-2xl font-medium mb-4">
                        GDPR Data Protection Section
                      </h1>

                      {multiLangData.map((lang) => (
                        <TabsContent key={lang.id} value={lang.id}>
                          <div className="mb-4">
                            <div className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>Title ({lang.label})</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-custom-dark-blue">
                                    <p className="p-1 text-sm font-medium">
                                      Please provide title{' '}
                                      <span>{lang.label !== 'Default' && `in ${lang.label}`}</span>
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Input
                              id={`section_title_${lang.id}`}
                              {...register(`section_title_${lang.id}`)}
                              className="app-input"
                              placeholder="Enter value"
                            />
                          </div>

                          <div className="mb-4">
                            <div className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>Description ({lang.label})</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-custom-dark-blue">
                                    <p className="p-1 text-sm font-medium">
                                      Please provide description{' '}
                                      <span>{lang.label !== 'Default' && `in ${lang.label}`}</span>
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Textarea
                              id={`section_details_${lang.id}`}
                              {...register(`section_details_${lang.id}`)}
                              className="app-input"
                              placeholder="Enter value"
                            />
                          </div>

                          <div className="w-full text-sm font-semibold flex items-center justify-between">
                            <h1 className="text-lg font-medium mb-0 md:mb-4">
                              Data Protection Steps
                            </h1>
                            <button
                              type="button"
                              onClick={handleAddOnBoardStep}
                              className="flex items-center bg-blue-50 border border-blue-500 text-blue-600 text-sm font-semibold px-3 py-2 rounded hover:bg-blue-600 hover:text-white transition"
                            >
                              Add more
                            </button>
                          </div>

                          <div>
                            {onBoardSteps.map((value, index) => (
                              <div
                                key={`${index}`}
                                className="my-4 flex items-end w-full gap-4 border-t md:border-0 pt-4 md:pt-0"
                              >
                                <div className="grid grid-cols-1 w-full gap-2 mr-0 md:mr-6">
                                  <div className="w-full">
                                    <p className="text-sm font-medium mb-1">Title</p>
                                    <Input
                                      type="text"
                                      value={value?.titles?.[lang.id] || ''}
                                      onChange={(e) =>
                                        handleChangeOnBoardStep(
                                          index,
                                          'titles',
                                          lang.id,
                                          e.target.value,
                                        )
                                      }
                                      className="app-input"
                                      placeholder="Enter value"
                                    />
                                  </div>

                                  <div className="col-span-2">
                                    <p className="text-sm font-medium mb-1">Message</p>
                                    <Textarea
                                      value={value?.subtitles?.[lang.id] || ''}
                                      onChange={(e) =>
                                        handleChangeOnBoardStep(
                                          index,
                                          'subtitles',
                                          lang.id,
                                          e.target.value,
                                        )
                                      }
                                      className="app-input"
                                      placeholder="Enter value"
                                    />
                                  </div>

                                  <div className="col-span-2">
                                    <p className="text-sm font-medium mb-1">Status</p>
                                    <AppSelect
                                      value={value?.req_status?.[lang.id] || ''}
                                      onSelect={(v) =>
                                        handleChangeOnBoardStep(index, 'req_status', lang.id, v)
                                      }
                                      groups={StatusList}
                                      hideNone
                                    />
                                  </div>
                                </div>

                                {index === 0 ? (
                                  <span className="flex items-center cursor-not-allowed bg-slate-500 text-slate-200 text-sm font-semibold px-3 py-2 rounded">
                                    Default
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOnBoardStep(index)}
                                    className="bg-red-600 text-white text-sm font-semibold px-3 py-2 rounded hover:bg-red-700 transition"
                                  >
                                    Close
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Tabs>
            </div>
          )}

          {/* Save */}
          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton IsLoading={isUpdating} AddLabel="Save Changes" />
          </Card>
        </form>
      )}
    </div>
  );
};

export default GDPRCookieSettingsForm;
