// =============================================================
// FILE: src/components/blocks/admin-section/business-operations/store-type/UpdateStoreTypeForm.tsx
// FINAL — Form + JSON mode (same pattern as SEO/Attribute)
// - df used as required root (NOT rendered as a tab)
// - First active tab = first UI language (multiLang excluding df)
// - Uses: useFormI18nScaffold + AdminI18nJsonPanel + i18nFormAdapter
// - JSON includes: name, description, additional_charge_name
// - Init: data -> RHF (root -> df + firstUILangId) + translations -> other langs
// - Mode switch to JSON: rebuild from getValues snapshot (timing-safe)
// =============================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Info } from 'lucide-react';

import CloudIcon from '@/assets/icons/CloudIcon';
import multiLang from '@/components/molecules/multiLang.json';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import Cancel from '@/components/blocks/custom-icons/Cancel';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';
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

import GlobalImageLoader from '@/lib/imageLoader';
import { useStoreTypeUpdateMutation } from '@/modules/admin-section/business-operations/store-type/store-type.action';
import {
  StoreTypeFormData,
  storeTypeSchema,
} from '@/modules/admin-section/business-operations/store-type/store-type.schema';
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


interface Option {
  id: number;
  value: number;
  label: string;
}

const I18N_FIELDS = ['name', 'description', 'additional_charge_name'] as const;
const VALID_CHARGE_TYPES = ['fixed', 'percentage'] as const;

function normalizeStr(v: any) {
  return String(v ?? '').trim();
}

function normalizeChargeType(v: any): '' | 'fixed' | 'percentage' {
  const s = normalizeStr(v).toLowerCase();
  if (s === 'fixed') return 'fixed';
  if (s === 'percentage' || s === 'percent' || s === '%') return 'percentage';
  return '';
}

function normalizeImageId(v: any): number | null {
  if (typeof v === 'number' && Number.isInteger(v) && v > 0) return v;
  const s = normalizeStr(v);
  if (!s) return null;
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * StoreType JSON normalize:
 * - ensures every UI lang exists
 * - ensures name/description/additional_charge_name exist as string
 */
function normalizeStoreTypeJson(json: any, uiLangs: Array<{ id: string }>) {
  const out: any = {};
  const srcRoot = safeObject(json);

  for (const lang of uiLangs) {
    const src = safeObject((srcRoot as any)?.[lang.id]);
    out[lang.id] = {
      ...src,
      name: normalizeStr(src?.name),
      description: normalizeStr(src?.description),
      additional_charge_name: normalizeStr(src?.additional_charge_name),
    };
  }

  // preserve other root keys (optional)
  for (const k of Object.keys(srcRoot)) {
    if (k in out) continue;
    const v = (srcRoot as any)[k];
    if (v && typeof v === 'object') out[k] = v;
  }

  return out;
}

const UpdateStoreTypeForm = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const multiLangData = useMemo(() => (Array.isArray(multiLang) ? (multiLang as any[]) : []), []);

  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    reset,
    control,
  } = useForm<StoreTypeFormData>({
    resolver: zodResolver(storeTypeSchema),
    defaultValues: {
      name_df: '',
      description_df: '',
      additional_charge_name_df: '',
      additional_charge_amount: '',
      additional_charge_type: '',
      additional_charge_commission: '',
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<StoreTypeFormData>(setValue), [setValue]);

  const checkedValue = watch();
  const watchedChargeType = watch('additional_charge_type');
  const watchedChargeAmount = watch('additional_charge_amount');

  // Scaffold (df excluded, first tab = first UI lang)
  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    setTranslationsJson,
    rebuildJsonNow,
    handleTranslationsJsonChange: scaffoldHandleJsonChange,
  } = useFormI18nScaffold<StoreTypeFormData>({
    languages: multiLangData,
    excludeLangIds: ['df'],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: 'name_df', srcField: (l) => `name_${l}`, validate: true },
        {
          dfField: 'description_df',
          srcField: (l) => `description_${l}`,
          validate: false,
        },
        {
          dfField: 'additional_charge_name_df',
          srcField: (l) => `additional_charge_name_${l}`,
          validate: false,
        },
      ],
    },
  });

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  const [lastSelectedImages, setLastSelectedImages] = useState<any>(null);
  const [errorImagesMessage, setImagesErrorMessage] = useState<string>('');

  // kept (not used in UI now, but original state preserved)
  const [selectedProducts, setSelectedProducts] = useState<Option[]>([]);

  const [isFeature, setIsFeature] = useState(false);

  const DiscountTypeList = [
    { label: 'Percent (%)', value: 'percentage' },
    { label: 'Fixed ($)', value: 'fixed' },
  ];

  // -----------------------------
  // JSON change wrapper (normalize + apply + scaffold)
  // -----------------------------
  const handleTranslationsJsonChange = (next: any) => {
    const normalized = normalizeStoreTypeJson(next, uiLangs);

    setTranslationsJson(normalized);

    // JSON -> Form
    applyI18nJsonToFlatForm<StoreTypeFormData>({
      json: normalized,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      setValue,
      keyOf: (field, langId) => `${field}_${langId}`,
    });

    scaffoldHandleJsonChange(normalized);
  };

  // -----------------------------
  // Init: data -> RHF + image + feature + JSON
  // -----------------------------
  useEffect(() => {
    if (!data) return;

    setSelectedProducts(data?.products ?? []);
    setIsFeature(data?.additional_charge_enable_disable == 1);

    // root -> df (required)
    setValueAny('name_df', data?.name ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
    setValueAny('description_df', data?.description ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('additional_charge_name_df', data?.additional_charge_name ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // root -> first UI language (SEO pattern)
    setValueAny(`name_${firstUILangId}`, data?.name ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny(`description_${firstUILangId}`, data?.description ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny(`additional_charge_name_${firstUILangId}`, data?.additional_charge_name ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // numbers & type (non-i18n)
    const normalizedType = normalizeChargeType(data?.additional_charge_type);
    const normalizedAmount = normalizeStr(data?.additional_charge_amount);
    const normalizedCommission = normalizeStr(data?.additional_charge_commission);

    setValueAny('additional_charge_amount', normalizedAmount || '0', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('additional_charge_type', normalizedType, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValueAny('additional_charge_commission', normalizedCommission || '0', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // translations:
    const tr = data?.translations;

    if (Array.isArray(tr)) {
      tr.forEach((row: any) => {
        const langId = row?.language || row?.language_code;
        if (!langId || langId === 'df') return;

        setValueAny(`name_${langId}`, row?.name ?? '', {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
        setValueAny(`description_${langId}`, row?.description ?? '', {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
        setValueAny(`additional_charge_name_${langId}`, row?.additional_charge_name ?? '', {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      });
    } else if (tr && typeof tr === 'object') {
      Object.keys(tr).forEach((langId) => {
        if (!langId || langId === 'df') return;
        const row = tr[langId];

        setValueAny(`name_${langId}`, row?.name ?? '', {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
        setValueAny(`description_${langId}`, row?.description ?? '', {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
        setValueAny(`additional_charge_name_${langId}`, row?.additional_charge_name ?? '', {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      });
    }

    // image
    if (data?.image) {
      setLastSelectedImages({
        image_id: data?.image ?? '',
        img_url: data?.image_url ?? '/images/no-image.png',
        name: 'cover image',
      });
    } else {
      setLastSelectedImages(null);
    }
    setImagesErrorMessage('');

    // JSON init after setValue settle
    requestAnimationFrame(() => {
      rebuildJsonNow();
      setTranslationsJson((prev: any) => normalizeStoreTypeJson(prev, uiLangs));
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, firstUILangId]);

  useEffect(() => {
    if (!data?.id) return;
    const currentType = normalizeChargeType(getValues('additional_charge_type'));
    if (!currentType) {
      const fallbackType = normalizeChargeType(data?.additional_charge_type);
      if (fallbackType) {
        setValueAny('additional_charge_type', fallbackType, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    }
  }, [data?.id, data?.additional_charge_type, getValues, setValueAny, watchedChargeType]);

  useEffect(() => {
    if (!data?.id) return;
    const currentAmount = normalizeStr(getValues('additional_charge_amount'));
    if (!currentAmount) {
      const fallbackAmount = normalizeStr(data?.additional_charge_amount);
      setValueAny('additional_charge_amount', fallbackAmount || '0', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [data?.id, data?.additional_charge_amount, getValues, setValueAny, watchedChargeAmount]);

  // Mode sync: when entering JSON, rebuild from latest form edits
  useEffect(() => {
    if (viewMode !== 'json') return;
    rebuildJsonNow();
    setTranslationsJson((prev: any) => normalizeStoreTypeJson(prev, uiLangs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // -----------------------------
  // Image handlers
  // -----------------------------
  const handleSaveImages = (images: UploadedImage[]) => {
    setLastSelectedImages(images[0]);

    const dimensions = images[0].dimensions ?? '';
    const [width, height] = dimensions.split(' x ').map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width / height;

    if (Math.abs(aspectRatio - 4 / 1) < 0.01) {
      setImagesErrorMessage('');
      return true;
    }
    setImagesErrorMessage('Image must have a 4:1 aspect ratio.');
    return false;
  };

  const removePreview = () => {
    setLastSelectedImages(null);
    setImagesErrorMessage('');
  };

  const handleToggleStatus = () => {
    setIsFeature((s) => !s);
  };

  const handleSelectItem = (value: any, inputType: any) => {
    setValueAny(String(inputType), value);
    setValueAny('additional_charge_amount', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const { mutate: StoreTypeUpdate, isPending: isStoreTypeUpdatePending } =
    useStoreTypeUpdateMutation();

  const onSubmit = async (values: StoreTypeFormData) => {
    const safeType =
      normalizeChargeType(values.additional_charge_type) ||
      normalizeChargeType(data?.additional_charge_type);
    const safeAmountRaw = normalizeStr(values.additional_charge_amount);
    const safeAmount = safeAmountRaw ? Number(safeAmountRaw) : 0;
    const safeCommissionRaw = normalizeStr(values.additional_charge_commission);
    const safeCommission = safeCommissionRaw ? Number(safeCommissionRaw) : 0;

    const safeImageId = normalizeImageId(lastSelectedImages?.image_id);

    const defaultData = {
      name: values.name_df,
      description: values.description_df,
      additional_charge_name: values.additional_charge_name_df,
      additional_charge_amount: Number.isFinite(safeAmount) ? Math.trunc(safeAmount) : 0,
      additional_charge_type: safeType || null,
      additional_charge_commission: Number.isFinite(safeCommission) ? safeCommission : 0,
      image: safeImageId,
    };

    const translations = uiLangs
      .filter((lang) => lang?.id && lang.id !== firstUILangId)
      .map((lang) => ({
        language_code: lang.id,
        name: normalizeStr((values as any)[`name_${lang.id}`]),
        description: normalizeStr((values as any)[`description_${lang.id}`]),
        additional_charge_name: normalizeStr((values as any)[`additional_charge_name_${lang.id}`]),
      }))
      .filter((row) => row.name.length > 0);

    const submissionData = {
      ...defaultData,
      id: !data ? 0 : data.id,
      additional_charge_enable_disable: isFeature ? 1 : 0,
      translations,
      // if backend supports later:
      // translations_json: normalizeStoreTypeJson(translationsJson, uiLangs),
    };

    if (!data) return;

    return StoreTypeUpdate(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          reset();
          dispatch(setRefetch(true));
        },
      },
    );
  };

  // -----------------------------
  // UI helpers
  // -----------------------------
  const ModeToggle = (
    <div className="mb-3 mt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t('common.store_type') ?? 'Store Type'}
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

  const trigger = (
    <div className="hover:cursor-pointer">
      {lastSelectedImages?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedImages?.img_url}
            alt={lastSelectedImages?.name as string}
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
        <div className="border-2 h-32 w-32 border-dashed border-blue-500 p-2 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
          <div className="flex flex-col items-center justify-center mt-2">
            <CloudIcon />
            <p className="mt-2 text-blue-500 text-sm font-medium">{t('common.drag_and_drop')}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* hidden df fields (schema uyumu + dfSync hedefi) */}
        <input type="hidden" {...register('name_df')} />
        <input type="hidden" {...register('description_df')} />
        <input type="hidden" {...register('additional_charge_name_df')} />

        {ModeToggle}

        {viewMode === 'json' ? (
          <Card className="mt-2">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Translations JSON"
                languages={uiLangs}
                value={normalizeStoreTypeJson(translationsJson, uiLangs)}
                onChange={handleTranslationsJsonChange}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    Her tab sadece o dilin JSON’unu düzenler. <code>name</code>,{' '}
                    <code>description</code>, <code>additional_charge_name</code> string olmalı.
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4">
            <Tabs defaultValue={firstUILangId}>
              <TabsList dir={dir} className="flex justify-start bg-white p-2">
                {uiLangs.map((lang) => (
                  <TabsTrigger key={lang.id} value={lang.id}>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div dir={dir}>
                {uiLangs.map((lang) => (
                  <TabsContent key={lang.id} value={lang.id}>
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-2 md:p-6 space-y-2">
                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>
                                {t('common.store_type_name')} ({lang.label})
                              </span>
                            </p>
                            <Input
                              id={`name_${lang.id}`}
                              {...register(`name_${lang.id}` as keyof StoreTypeFormData)}
                              className="app-input"
                              placeholder={t('place_holder.enter_name')}
                            />
                            {errors[`name_${lang.id}` as keyof StoreTypeFormData] && (
                              <p className="text-red-500 text-sm mt-1">
                                {(errors as any)[`name_${lang.id}`]?.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>
                                {t('common.description')} ({lang.label})
                              </span>
                            </p>
                            <Textarea
                              id={`description_${lang.id}`}
                              {...register(`description_${lang.id}` as keyof StoreTypeFormData)}
                              className="app-input"
                              placeholder={t('place_holder.enter_description')}
                            />
                          </div>

                          <div className="flex gap-4">
                            <div>
                              <div className="text-sm font-medium flex items-center gap-2 mb-2">
                                <span>{t('common.store_type_logo')}</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-custom-dark-blue w-96">
                                      <p className="p-1 text-sm font-medium">
                                        {t('tooltip.aspect_ratio_4_1')}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>

                              <div className="relative w-32">
                                <PhotoUploadModal
                                  trigger={trigger}
                                  isMultiple={false}
                                  onSave={handleSaveImages}
                                  usageType="store"
                                  selectedImage={lastSelectedImages}
                                />
                                {lastSelectedImages?.image_id && (
                                  <Cancel
                                    customClass="absolute top-0 right-0 m-1"
                                    onClick={(event: { stopPropagation: () => void }) => {
                                      event.stopPropagation();
                                      removePreview();
                                    }}
                                  />
                                )}
                              </div>

                              {errorImagesMessage && (
                                <p className="text-red-500 text-sm mt-2">{errorImagesMessage}</p>
                              )}
                            </div>
                          </div>
                        </Card>

                        <Card className="p-2 md:p-6 space-y-2">
                          <div className="my-4 grid grid-cols-4 md:grid-cols-8 items-center">
                            <p className="col-span-3 text-sm font-medium mb-1">
                              {t('common.additional_charge_enable')}
                            </p>
                            <Switch
                              dir="ltr"
                              checked={isFeature}
                              onCheckedChange={handleToggleStatus}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>
                                {t('common.additional_charge_name')} ({lang.label})
                              </span>
                            </p>
                            <Input
                              id={`additional_charge_name_${lang.id}`}
                              {...register(
                                `additional_charge_name_${lang.id}` as keyof StoreTypeFormData,
                              )}
                              className="app-input"
                              placeholder={t('place_holder.enter_name')}
                            />
                            {errors[
                              `additional_charge_name_${lang.id}` as keyof StoreTypeFormData
                            ] && (
                              <p className="text-red-500 text-sm mt-1">
                                {(errors as any)[`additional_charge_name_${lang.id}`]?.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t('common.additional_charge_type')}
                            </p>

                            <Controller
                              control={control}
                              name="additional_charge_type"
                              render={({ field }) => (
                                <AppSelect
                                  value={
                                    normalizeChargeType(field.value) ||
                                    normalizeChargeType(data?.additional_charge_type) ||
                                    ''
                                  }
                                  onSelect={(value) => {
                                    const normalized = normalizeChargeType(value);
                                    field.onChange(normalized);
                                    handleSelectItem(normalized, 'additional_charge_type');
                                  }}
                                  groups={DiscountTypeList}
                                  hideNone
                                />
                              )}
                            />

                            {errors['additional_charge_type' as keyof StoreTypeFormData] && (
                              <p className="text-red-500 text-sm mt-1">
                                {(errors as any)['additional_charge_type']?.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t('common.additional_charge_amount')}
                              {checkedValue.additional_charge_type
                                ? ` ( ${
                                    checkedValue.additional_charge_type === 'percentage' ? '%' : '$'
                                  } )`
                                : ''}
                            </p>

                            <Input
                              type="number"
                              min={0}
                              id="additional_charge_amount"
                              disabled={checkedValue.additional_charge_type === ''}
                              {...register('additional_charge_amount', {
                                validate: (value) => {
                                  const numericValue = Number(value ?? 0);
                                  if (
                                    checkedValue.additional_charge_type === 'percentage' &&
                                    numericValue > 100
                                  ) {
                                    return 'Percent additional_charge_amount cannot exceed 100';
                                  }
                                  return true;
                                },
                              })}
                              className="app-input"
                              placeholder={t('place_holder.enter_discount')}
                              onFocus={(e) => {
                                if (e.target.value === '0') e.target.value = '';
                              }}
                              onChange={(e) => {
                                const numericValue = Number(e.target.value);
                                if (
                                  checkedValue.additional_charge_type === 'percentage' &&
                                  numericValue > 100
                                ) {
                                  e.target.value = '100';
                                }
                                register('additional_charge_amount').onChange(e);
                              }}
                            />

                            {errors['additional_charge_amount' as keyof StoreTypeFormData] && (
                              <p className="text-red-500 text-sm mt-1">
                                {(errors as any)['additional_charge_amount']?.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t('common.admin_additional_charge')} (%)
                            </p>

                            <Input
                              type="number"
                              min={0}
                              id="additional_charge_commission"
                              {...register('additional_charge_commission', {
                                validate: (value) => {
                                  const numericValue = Number(value ?? 0);
                                  if (numericValue > 100) {
                                    return 'Percent admin additional charge commission cannot exceed 100';
                                  }
                                  return true;
                                },
                              })}
                              className="app-input"
                              placeholder={t('place_holder.enter_discount')}
                              onFocus={(e) => {
                                if (e.target.value === '0') e.target.value = '';
                              }}
                              onChange={(e) => {
                                const numericValue = Number(e.target.value);
                                if (numericValue > 100) e.target.value = '100';
                                register('additional_charge_commission').onChange(e);
                              }}
                            />

                            {errors['additional_charge_commission' as keyof StoreTypeFormData] && (
                              <p className="text-red-500 text-sm mt-1">
                                {(errors as any)['additional_charge_commission']?.message}
                              </p>
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        )}

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={data}
            IsLoading={isStoreTypeUpdatePending}
            UpdateLabel={t('button.update')}
          />
        </Card>
      </form>
    </div>
  );
};

export default UpdateStoreTypeForm;
