// ===============================================
// File: src/components/blocks/admin-section/products/author/CreateOrUpdateAuthorForm.tsx
// FINAL — Author Form (DF + JSON) — SAME PATTERN as TagForm
// - Schema requires: name_df (min 2) => hidden register + dfSync (useFormI18nScaffold)
// - Root language dynamic: firstUILangId = first language in multiLang (excluding df)
// - Tabs exclude df; defaultValue = firstUILangId
// - JSON toggle (Form/JSON) same style as TagForm
// - JSON contains ONLY i18n fields: name + bio
// - Global fields: born_date, death_date, profile_image (NOT language-dependent) => always visible
// - Submit: root name from name_df (fallback firstUILangId); root bio from bio_<firstUILangId> (fallback bio)
// - translations exclude firstUILangId; include {name,bio}; skip empty rows
// ===============================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import CloudIcon from '@/assets/icons/CloudIcon';
import multiLang from '@/components/molecules/multiLang.json';
import { SubmitButton } from '@/components/blocks/shared';
import CustomSingleDatePicker from '@/components/blocks/common/CustomSingleDatePicker';
import Cancel from '@/components/blocks/custom-icons/Cancel';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';
import TiptapEditor from '@/components/blocks/common/TiptapField';

import {
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';

import GlobalImageLoader from '@/lib/imageLoader';
import {
  useAuthorStoreMutation,
  useAuthorUpdateMutation,
} from '@/modules/admin-section/author/author.action';
import { AuthorFormData, authorSchema } from '@/modules/admin-section/author/author.schema';

import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';

import { format, parse } from 'date-fns';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { AdminI18nJsonPanel } from '@/lib/json/AdminI18nJsonPanel';
import { applyI18nJsonToFlatForm } from '@/lib/json/i18nFormAdapter';
import { makeRHFSetValueAny, safeObject } from '@/lib/json/rhf';
import { useFormI18nScaffold } from '@/lib/json/useFormI18nScaffold';

type LangKeys = keyof IntlMessages['lang'];
type ViewMode = 'form' | 'json';

// i18n json fields (ONLY these go to JSON)
const I18N_FIELDS = ['name', 'bio'] as const;

function safeStr(v: any) {
  return String(v ?? '').trim();
}

export default function CreateOrUpdateAuthorForm({ data }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const allLangs = useMemo(
    () => (Array.isArray(multiLang) ? (multiLang as Array<{ id: string; label: string }>) : []),
    [],
  );

  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  // robust editData
  const editData = (data?.data ?? data?.author ?? data) as any;

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
    getValues,
  } = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      // DF contract
      name_df: '',
      // i18n flat fields will be created by RHF dynamically via register()
      // globals
      born_date: '',
      death_date: '',
      // optional legacy
      bio: '',
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<AuthorFormData>(setValue), [setValue]);

  // ✅ Scaffold (same pattern as TagForm)
  const i18n = useFormI18nScaffold<AuthorFormData>({
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
    // only global fields (not per-language) need extra watch; keep deterministic
    extraWatchNames: ['born_date', 'death_date'],
  });

  const { uiLangs, firstUILangId, translationsJson, handleTranslationsJsonChange, rebuildJsonNow } =
    i18n;

  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>('');

  // -----------------------------
  // Init (editData -> form + json)
  // -----------------------------
  useEffect(() => {
    // CREATE
    if (!editData || !editData?.id) {
      return;
    }

    // 1) root -> df + firstUILangId
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

    // 2) GLOBAL fields
    setValueAny('born_date', editData?.born_date ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('death_date', editData?.death_date ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // root bio (legacy root field) -> put into first language bio as default
    const rootBio = safeStr(editData?.bio);
    if (rootBio) {
      setValueAny(`bio_${firstUILangId}` as any, rootBio, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setValueAny('bio' as any, rootBio, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }

    // 3) translations (object OR array) — include name + bio
    const trObj = editData?.translations;

    if (trObj && typeof trObj === 'object' && !Array.isArray(trObj)) {
      Object.keys(trObj).forEach((langId) => {
        if (!langId || langId === 'df') return;
        const trn = trObj?.[langId];
        if (!trn) return;

        if (trn?.name != null) {
          setValueAny(`name_${langId}` as any, safeStr(trn?.name), {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
        }
        if (trn?.bio != null) {
          setValueAny(`bio_${langId}` as any, safeStr(trn?.bio), {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
        }
      });
    } else if (Array.isArray(trObj)) {
      trObj.forEach((trn: any) => {
        const langId = trn?.language_code ?? trn?.language;
        if (!langId || langId === 'df') return;

        if (trn?.name != null) {
          setValueAny(`name_${langId}` as any, safeStr(trn?.name), {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
        }
        if (trn?.bio != null) {
          setValueAny(`bio_${langId}` as any, safeStr(trn?.bio), {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
        }
      });
    }

    // 4) image (GLOBAL)
    if (editData?.profile_image) {
      setLastSelectedLogo({
        image_id: editData?.profile_image ?? '',
        img_url: editData?.profile_image_url ?? '/images/no-image.png',
        name: 'profile image',
      });
      setLogoErrorMessage('');
    }

    // 5) JSON init priority: translations_json (ONLY i18n fields)
    const dbJson = editData?.translations_json;
    if (dbJson && typeof dbJson === 'object') {
      const normalized = safeObject(dbJson);
      handleTranslationsJsonChange(normalized);
      applyI18nJsonToFlatForm<AuthorFormData>({
        json: normalized,
        languages: uiLangs,
        fields: [...I18N_FIELDS],
        setValue: setValueAny,
        keyOf: (field, langId) => `${field}_${langId}`,
      });
    } else {
      rebuildJsonNow();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, firstUILangId]);

  // ✅ When entering JSON mode: rebuild from latest RHF snapshot (no drift)
  useEffect(() => {
    if (viewMode !== 'json') return;
    rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // -----------------------------
  // Image handlers (GLOBAL)
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

  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={String(lastSelectedLogo?.name ?? 'profile')}
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

  // -----------------------------
  // Submit
  // -----------------------------
  const { mutate: authorStore, isPending: isAuthorStorePending } = useAuthorStoreMutation();
  const { mutate: authorUpdate, isPending: isAuthorUpdatePending } = useAuthorUpdateMutation();

  const onSubmit = async (values: AuthorFormData) => {
    const v: any = values as any;

    // ✅ root name from df (contract) + fallback
    const rootName = safeStr(v?.name_df) || safeStr(v?.[`name_${firstUILangId}`]);

    // ✅ root bio from first language bio (since bio is i18n now)
    const rootBio = safeStr(v?.[`bio_${firstUILangId}`]) || safeStr(v?.bio);

    const defaultData: any = {
      name: rootName,
      bio: rootBio, // root bio still exists in API (backward friendly)
      born_date: v?.born_date,
      death_date: v?.death_date,
      name_df: v?.name_df,
    };

    // translations exclude firstUILangId; include name + bio; skip empty rows
    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== firstUILangId)
      .map((lang) => ({
        language_code: lang.id,
        name: safeStr(v?.[`name_${lang.id}`]),
        bio: safeStr(v?.[`bio_${lang.id}`]),
      }))
      .filter((row) => row.name.length > 0 || row.bio.length > 0);

    // translations_json: ONLY i18n fields (name+bio) from scaffold
    const translations_json = safeObject(translationsJson);

    const submissionData: any = {
      ...defaultData,
      id: editData?.id ?? 0,
      profile_image: lastSelectedLogo ? lastSelectedLogo?.image_id : '',
      translations,
      translations_json,
    };

    const onOk = () => {
      reset();
      dispatch(setRefetch(true));
    };

    if (editData?.id > 0) return authorUpdate(submissionData, { onSuccess: onOk });
    return authorStore(submissionData, { onSuccess: onOk });
  };

  // -----------------------------
  // Render
  // -----------------------------
  const isEdit = !!(editData?.id && editData?.id > 0);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* DF hidden required by schema */}
        <input type="hidden" {...register('name_df' as any)} />

        {/* Toggle header (same as TagForm) */}
        <Card className="mt-2">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {isEdit ? t('button.update_author') : t('button.add_author')}
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
        {(errors as any)?.name_df?.message ? (
          <Card className="mt-4">
            <CardContent className="p-3">
              <p className="text-red-600 text-sm">{String((errors as any)?.name_df?.message)}</p>
            </CardContent>
          </Card>
        ) : null}

        {/* ✅ GLOBAL AREA: always visible regardless of selected language */}
        {viewMode === 'form' ? (
          <div className="mt-4 grid lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-2 md:p-6">
                <p className="text-sm font-medium mb-1">{t('label.born_date')}</p>
                <Controller
                  name="born_date"
                  control={control}
                  render={({ field }) => (
                    <CustomSingleDatePicker
                      label=""
                      selectedDate={
                        field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : null
                      }
                      onChange={(date) => {
                        if (date) field.onChange(format(date, 'yyyy-MM-dd'));
                        else field.onChange('');
                      }}
                      maxDate={new Date()}
                    />
                  )}
                />
                {errors.born_date?.message ? (
                  <p className="text-red-500 text-sm mt-1">{String(errors.born_date.message)}</p>
                ) : null}

                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">{t('label.death_date')}</p>
                  <Controller
                    name="death_date"
                    control={control}
                    render={({ field }) => (
                      <CustomSingleDatePicker
                        label=""
                        selectedDate={
                          field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : null
                        }
                        onChange={(date) => {
                          if (date) field.onChange(format(date, 'yyyy-MM-dd'));
                          else field.onChange('');
                        }}
                        maxDate={new Date()}
                      />
                    )}
                  />
                  {errors.death_date?.message ? (
                    <p className="text-red-500 text-sm mt-1">{String(errors.death_date.message)}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2 md:p-6">
                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>{t('label.profile_image')}</span>
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
                      usageType="author"
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
              </CardContent>
            </Card>
          </div>
        ) : null}

        {viewMode === 'json' ? (
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Author JSON"
                languages={uiLangs}
                value={translationsJson} // ONLY name+bio (scaffold fields)
                onChange={(next: any) => {
                  const normalized = safeObject(next);

                  // scaffold handler (dfSync + updates translationsJson)
                  handleTranslationsJsonChange(normalized);

                  // safety: also apply to flat RHF fields (name_<lang>, bio_<lang>)
                  applyI18nJsonToFlatForm<AuthorFormData>({
                    json: normalized,
                    languages: uiLangs,
                    fields: [...I18N_FIELDS],
                    setValue: setValueAny,
                    keyOf: (field, langId) => `${field}_${langId}`,
                  });
                }}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    JSON format: <code>{'{ tr: { name, bio }, en: { name, bio } }'}</code>
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4">
            <Tabs defaultValue={firstUILangId} className="col-span-2">
              <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                {uiLangs.map((lang) => (
                  <TabsTrigger key={lang.id} value={lang.id}>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div dir={dir} className="grid grid-cols-1 gap-4">
                {uiLangs.map((lang) => (
                  <TabsContent key={lang.id} value={lang.id}>
                    <Card className="mt-2">
                      <CardContent className="p-2 md:p-6">
                        {/* NAME (i18n) */}
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
                            placeholder={t('place_holder.enter_name')}
                          />

                          {(errors as any)?.[`name_${lang.id}`]?.message ? (
                            <p className="text-red-500 text-sm mt-1">
                              {String((errors as any)?.[`name_${lang.id}`]?.message)}
                            </p>
                          ) : null}
                        </div>

                        {/* BIO (i18n) */}
                        <div className="mb-2">
                          <p className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>
                              {t('label.bio')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </span>
                          </p>

                          <Controller
                            control={control}
                            name={`bio_${lang.id}` as any}
                            render={({ field }) => (
                              <TiptapEditor value={field.value || ''} onChange={field.onChange} />
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        )}

        <div className="col-span-2 mt-10">
          <SubmitButton
            UpdateData={data}
            IsLoading={isEdit ? isAuthorUpdatePending : isAuthorStorePending}
            AddLabel={t('button.add_author')}
            UpdateLabel={t('button.update_author')}
          />
        </div>
      </form>
    </div>
  );
}
