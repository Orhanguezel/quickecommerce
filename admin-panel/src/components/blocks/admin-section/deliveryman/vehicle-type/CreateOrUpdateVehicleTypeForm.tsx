// =============================================================
// FILE: src/components/blocks/admin-section/deliveryman/vehicle-type/CreateOrUpdateVehicleTypeForm.tsx
// FINAL — VehicleType Form (DF + JSON Scaffold) — LOCKED PATTERN (WORKING)
// - Only allowed helpers used
// - Tabs: controlled, NO auto-reset on every uiLangs change (fix TR/EN tab)
// - Edit init waits for uiLangs + firstUILangId (fix "static/no update")
// - Select: uncontrolled-safe (key + onSelect normalize + field.onChange + setValueAny)
// - Mutations: uses your react-query hooks (mutateAsync fallback to mutate)
// =============================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import multiLang from '@/components/molecules/multiLang.json';
import { AppSelect } from '@/components/blocks/common';
import {
  Button,
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
  useVehicleTypeStoreMutation,
  useVehicleTypeUpdateMutation,
} from '@/modules/admin-section/vehicle-type/vehicle-type.action';
import {
  VehicleTypeFormData,
  vehicleTypeSchema,
} from '@/modules/admin-section/vehicle-type/vehicle-type.schema';

import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { toast } from 'react-toastify';

// ✅ allowed helpers only
import { AdminI18nJsonPanel } from '@/lib/json/AdminI18nJsonPanel';
import { makeRHFSetValueAny, safeObject } from '@/lib/json/rhf';
import { ensureLangKeys } from '@/lib/json/i18nNormalize';
import { useFormI18nScaffold } from '@/lib/json/useFormI18nScaffold';
import { initI18nFlatFormFromEntity } from '@/lib/json/i18nFormInit';

type LangType = { id: string; label?: string };
type LangKeys = keyof IntlMessages['lang'];
type ViewMode = 'form' | 'json';

const I18N_FIELDS = ['name', 'description'] as const;

const StatusList = [
  { label: 'Active', value: '1' },
  { label: 'Inactive', value: '0' },
];

const FuelTypeList = [
  { label: 'Electric', value: 'electric' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Petrol', value: 'petrol' },
  { label: 'Diesel', value: 'diesel' },
];

function safeStr(x: unknown) {
  return String(x ?? '').trim();
}

function hasAnyI18nValue(values: any, langId: string) {
  const n = safeStr(values?.[`name_${langId}`]);
  const d = safeStr(values?.[`description_${langId}`]);
  return !!(n || d);
}

function extractSelectValue(v: any) {
  return String(v?.value ?? v ?? '');
}

function pickActiveLangId(params: {
  locale: string;
  uiLangs: LangType[];
  firstUILangId: string;
  values?: any;
}) {
  const { locale, uiLangs, firstUILangId, values } = params;

  // 1) locale varsa
  if (uiLangs.some((l) => l.id === locale)) return locale;

  // 2) içerik olan ilk dil
  const firstWithContent =
    uiLangs.find((l) => {
      const n = safeStr(values?.[`name_${l.id}`]);
      const d = safeStr(values?.[`description_${l.id}`]);
      return !!(n || d);
    })?.id ?? '';

  // 3) fallback
  return firstWithContent || firstUILangId;
}

export default function CreateOrUpdateVehicleTypeForm({ data }: { data?: any }) {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const languages = useMemo(() => (Array.isArray(multiLang) ? (multiLang as LangType[]) : []), []);

  // ✅ robust editData
  const editData = (data?.data ?? data?.vehicleType ?? data) as any;

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  // used only to remount AppSelect when we do reset()
  const [selectNonce, setSelectNonce] = useState(0);

  const {
    control,
    register,
    setValue,
    reset,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<VehicleTypeFormData>({
    resolver: zodResolver(vehicleTypeSchema),
    defaultValues: {
      // DF
      name_df: '',
      description_df: '',

      // globals
      status: '',
      fuel_type: '',
      speed_range: '',
      max_distance: '',
      extra_charge: '',
      average_fuel_cost: '',
      capacity: '',
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<VehicleTypeFormData>(setValue), [setValue]);

  const { uiLangs, firstUILangId, translationsJson, handleTranslationsJsonChange, rebuildJsonNow } =
    useFormI18nScaffold<VehicleTypeFormData>({
      languages,
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
          { dfField: 'description_df', srcField: (l) => `description_${l}` },
        ],
      },
      extraWatchNames: [
        'status',
        'fuel_type',
        'speed_range',
        'max_distance',
        'extra_charge',
        'average_fuel_cost',
        'capacity',
      ],
    });

  // ✅ controlled tabs — IMPORTANT:
  // - only fix if invalid (do NOT override user's click)
  const [activeLangId, setActiveLangId] = useState<string>('');

  useEffect(() => {
    if (!uiLangs?.length || !firstUILangId) return;

    setActiveLangId((prev) => {
      const prevValid = prev && uiLangs.some((l) => l.id === prev);
      if (prevValid) return prev;

      const snapshot = getValues() as any;
      return pickActiveLangId({
        locale,
        uiLangs,
        firstUILangId,
        values: snapshot,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLangs?.length, firstUILangId]);

  // ✅ deterministic init — waits uiLangs + firstUILangId
  useEffect(() => {
    if (!uiLangs?.length || !firstUILangId) return;

    // CREATE
    if (!editData || !editData?.id) {
      reset({
        name_df: '',
        description_df: '',
        status: '',
        fuel_type: '',
        speed_range: '',
        max_distance: '',
        extra_charge: '',
        average_fuel_cost: '',
        capacity: '',
      } as any);

      setSelectNonce((n) => n + 1);

      const snapshot = getValues() as any;
      setActiveLangId(pickActiveLangId({ locale, uiLangs, firstUILangId, values: snapshot }));

      rebuildJsonNow();
      return;
    }

    // EDIT
    const sr = String(editData?.speed_range) !== 'null' ? String(editData?.speed_range ?? '') : '';

    // 1) globals -> reset (shouldDirty false)
    reset(
      {
        name_df: '',
        description_df: '',

        status: String(editData?.status ?? ''),
        fuel_type: String(editData?.fuel_type ?? ''),
        speed_range: sr,
        max_distance: String(editData?.max_distance ?? ''),
        extra_charge: String(editData?.extra_charge ?? ''),
        average_fuel_cost: String(editData?.average_fuel_cost ?? ''),
        capacity: String(editData?.capacity ?? ''),
      } as any,
      { keepDefaultValues: true },
    );

    setSelectNonce((n) => n + 1);

    // 2) i18n init via helper
    initI18nFlatFormFromEntity({
      editData,
      firstUILangId,
      uiLangs,
      i18nFields: I18N_FIELDS,
      setValueAny,
      after: rebuildJsonNow,
    });

    // 3) choose tab after init
    const snapshot = getValues() as any;
    setActiveLangId(pickActiveLangId({ locale, uiLangs, firstUILangId, values: snapshot }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, uiLangs?.length, firstUILangId]);

  // ✅ JSON mode snapshot
  useEffect(() => {
    if (viewMode === 'json') rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const storeHook = useVehicleTypeStoreMutation() as any;
  const updateHook = useVehicleTypeUpdateMutation() as any;

  const isSaving = !!storeHook?.isPending || !!updateHook?.isPending;

  const callMutateAsync = (hook: any, payload: any) => {
    if (hook?.mutateAsync) return hook.mutateAsync(payload);
    return new Promise((resolve, reject) =>
      hook.mutate(payload, { onSuccess: resolve, onError: reject }),
    );
  };

  const onSubmit = async (values: VehicleTypeFormData) => {
    // business rules
    if (!safeStr(values.status) || values.status === 'undefined') {
      toast.error('The Status field must be Active or Inactive.');
      return;
    }
    if (!safeStr(values.fuel_type) || values.fuel_type === 'undefined') {
      toast.error('The Vehicle fuel type must be petrol, diesel, electric, hybrid etc.');
      return;
    }

    // root from DF
    const v: any = values;
    const rootName = safeStr(v.name_df) || safeStr(v?.[`name_${firstUILangId}`]);
    const rootDesc = safeStr(v.description_df) || safeStr(v?.[`description_${firstUILangId}`]);

    if (!rootName) {
      toast.error('Name is required.');
      return;
    }

    const payload: any = {
      // update needs id (your service likely uses it)
      ...(editData?.id ? { id: String(editData.id) } : {}),

      // root fields
      name: rootName,
      description: rootDesc,

      // globals
      status: String(values.status ?? ''),
      fuel_type: String(values.fuel_type ?? ''),
      speed_range: String(values.speed_range ?? ''),

      capacity: safeStr(values.capacity) ? Number(values.capacity) : undefined,
      max_distance: safeStr(values.max_distance) ? Number(values.max_distance) : undefined,
      extra_charge: safeStr(values.extra_charge) ? Number(values.extra_charge) : undefined,
      average_fuel_cost: safeStr(values.average_fuel_cost)
        ? Number(values.average_fuel_cost)
        : undefined,

      // translations[]
      translations: (uiLangs ?? [])
        .filter((lang) => lang.id !== firstUILangId)
        .filter((lang) => hasAnyI18nValue(values as any, lang.id))
        .map((lang) => ({
          language_code: lang.id,
          name: safeStr((values as any)[`name_${lang.id}`]),
          description: safeStr((values as any)[`description_${lang.id}`]),
        })),

      // translations_json snapshot
      translations_json: ensureLangKeys(safeObject(translationsJson), uiLangs),
    };

    try {
      if (editData?.id) {
        await callMutateAsync(updateHook, payload);
      } else {
        await callMutateAsync(storeHook, payload);
      }

      // your mutation already redirects onSuccess, but refetch flag still ok
      dispatch(setRefetch(true));
    } catch (e) {
      console.error('VehicleType submit failed:', e);
    }
  };

  return (
    <div className="pb-24">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ DF hidden register */}
        <input type="hidden" {...register('name_df' as any)} />
        <input type="hidden" {...register('description_df' as any)} />

        {/* Header */}
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {editData?.id ? t('button.update_vehicle_type') : t('button.add_vehicle_type')}
            </div>

            <div className="flex items-center gap-2">
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

              <Button type="submit" variant="outline" className="app-button" disabled={isSaving}>
                {isSaving
                  ? (t('common.loading') ?? 'Saving...')
                  : editData?.id
                    ? t('button.update_vehicle_type')
                    : t('button.add_vehicle_type')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {viewMode === 'json' ? (
          <Card className="rounded-lg border-none mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Vehicle Type JSON"
                languages={uiLangs}
                value={ensureLangKeys(safeObject(translationsJson), uiLangs)}
                onChange={handleTranslationsJsonChange}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    Alanlar: <code>name</code>, <code>description</code>.
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* I18N */}
            <Card className="mt-4">
              <CardContent className="p-2 md:p-6">
                <h1 className="text-lg md:text-2xl font-medium mb-4">
                  {t('label.basic_information')}
                </h1>

                <Tabs value={activeLangId} onValueChange={(v) => setActiveLangId(String(v))}>
                  <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                    {uiLangs.map((lang) => (
                      <TabsTrigger key={lang.id} value={lang.id}>
                        {lang.label ?? lang.id}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div dir={dir}>
                    {uiLangs.map((lang) => (
                      <TabsContent key={lang.id} value={lang.id}>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t('label.title')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </p>
                            <Input
                              id={`name_${lang.id}`}
                              {...register(`name_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t('place_holder.enter_name')}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t('label.description')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)}
                              )
                            </p>
                            <Textarea
                              id={`description_${lang.id}`}
                              {...register(`description_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t('place_holder.enter_description')}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>

                {(errors as any)?.name_df?.message ? (
                  <p className="text-red-500 text-sm mt-3">
                    {String((errors as any)?.name_df?.message)}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            {/* GLOBAL */}
            <Card className="mt-4">
              <CardContent className="p-2 md:p-6">
                <h1 className="text-lg md:text-2xl font-medium mb-4">
                  {t('label.vehicle_specification')}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.status')}</p>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <AppSelect
                          key={`status-${selectNonce}-${String(field.value ?? '')}`}
                          value={String(field.value ?? '')}
                          onSelect={(raw) => {
                            const next = extractSelectValue(raw);
                            field.onChange(next);
                            setValueAny('status', next, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            });
                          }}
                          groups={StatusList}
                          hideNone
                        />
                      )}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.fuel_type')}</p>
                    <Controller
                      control={control}
                      name="fuel_type"
                      render={({ field }) => (
                        <AppSelect
                          key={`fuel-${selectNonce}-${String(field.value ?? '')}`}
                          value={String(field.value ?? '')}
                          onSelect={(raw) => {
                            const next = extractSelectValue(raw);
                            field.onChange(next);
                            setValueAny('fuel_type', next, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            });
                          }}
                          groups={FuelTypeList}
                          hideNone
                        />
                      )}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.speed_range')}</p>
                    <Input
                      id="speed_range"
                      type="text"
                      {...register('speed_range' as any)}
                      className="app-input"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.max_distance')}</p>
                    <Input
                      id="max_distance"
                      type="number"
                      {...register('max_distance' as any)}
                      className="app-input"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.extra_charge')}</p>
                    <Input
                      id="extra_charge"
                      type="number"
                      {...register('extra_charge' as any)}
                      className="app-input"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.average_fuel_cost')}</p>
                    <Input
                      id="average_fuel_cost"
                      type="number"
                      {...register('average_fuel_cost' as any)}
                      className="app-input"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.capacity')}</p>
                    <Input
                      id="capacity"
                      type="number"
                      {...register('capacity' as any)}
                      className="app-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sticky footer save */}
            <div className="fixed left-0 right-0 bottom-0 z-50 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-gray-700">
              <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-end">
                <Button type="submit" variant="outline" className="app-button" disabled={isSaving}>
                  {isSaving
                    ? (t('common.loading') ?? 'Saving...')
                    : editData?.id
                      ? t('button.update_vehicle_type')
                      : t('button.add_vehicle_type')}
                </Button>
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
