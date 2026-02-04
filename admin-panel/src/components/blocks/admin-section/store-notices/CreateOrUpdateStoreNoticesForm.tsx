// =============================================================
// File: src/components/blocks/admin-section/store-notices/CreateOrUpdateStoreNoticesForm.tsx
// FINAL — EXACT DF + JSON scaffold stack + FIX tab/unmount value loss (Department’ta çözdüğümüz gibi)
// Rules:
// - ✅ df UI’da görünmez (excludeLangIds:['df'])
// - ✅ shouldUnregister:false
// - ✅ programmatic register ALL lang fields (NO hidden duplicate inputs)
// - ✅ JSON <-> Form bridge: handleTranslationsJsonChange + applyI18nJsonToFlatForm
// - ✅ translations_json always ensureLangKeys()
// - ✅ JSON snapshot submit values’den (no drift)
// - ✅ watch() tüm form yok; sadece gerekli alanlar useWatch ile
// =============================================================

'use client';

import multiLang from '@/components/molecules/multiLang.json';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import {
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/components/ui';

import { useAppDispatch } from '@/redux/hooks';
import { setRefetch } from '@/redux/slices/refetchSlice';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { useSellerStoreQuery } from '@/modules/admin-section/seller-store/seller-store.action';
import { useSellerQuery } from '@/modules/admin-section/seller/seller.action';
import {
  useNoticeStoreMutation,
  useNoticeUpdateMutation,
} from '@/modules/admin-section/store-notices/store-notices.action';
import {
  NoticeFormData,
  noticeSchema,
} from '@/modules/admin-section/store-notices/store-notices.schema';

import { toast } from 'react-toastify';
import CustomSingleDatePicker from '../../common/CustomSingleDatePicker';
import { format, parse, startOfDay } from 'date-fns';

// ✅ JSON scaffold stack (standard) — tek import bloğu
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

const TypeList = [
  { label: 'General', value: 'general' },
  { label: 'Specific Store', value: 'specific_store' },
  { label: 'Specific Seller', value: 'specific_seller' },
];

const PriorityList = [
  { label: 'Low', value: 'low' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
];

const I18N_FIELDS = ['title', 'message'] as const;

function safeStr(v: unknown) {
  return String(v ?? '').trim();
}

// Backend bazen "2026-01-01 00:00:00" gibi geliyor → yyyy-MM-dd’e çevir
function toYmd(dateString: string) {
  const s = safeStr(dateString);
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const head = s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

function hasAnyI18nValue(values: any, langId: string) {
  const title = safeStr(values?.[`title_${langId}`]);
  const message = safeStr(values?.[`message_${langId}`]);
  return !!(title || message);
}

const CreateOrUpdateStoreNoticesForm = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const allLangs = useMemo(() => (Array.isArray(multiLang) ? (multiLang as any[]) : []), []);
  const editData = data;

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
    control,
  } = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    shouldUnregister: false,
    defaultValues: {
      title_df: '',
      message_df: '',
      type: '',
      priority: '',
      active_date: '',
      expire_date: '',
      store_id: '',
      seller_id: '',
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<NoticeFormData>(setValue), [setValue]);

  // ✅ scaffold: df UI’da yok
  const i18n = useFormI18nScaffold<NoticeFormData>({
    languages: allLangs as LangType[],
    excludeLangIds: ['df'],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: 'title_df', srcField: (l) => `title_${l}`, validate: true },
        { dfField: 'message_df', srcField: (l) => `message_${l}` },
      ],
    },
    extraWatchNames: ['type', 'priority', 'active_date', 'expire_date', 'store_id', 'seller_id'],
  });

  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    setTranslationsJson,
    handleTranslationsJsonChange,
    rebuildJsonNow,
  } = i18n;

  // ✅ CRITICAL: register ALL language fields programmatically (hidden input yok)
  useEffect(() => {
    for (const l of uiLangs as any[]) {
      register(`title_${l.id}` as any);
      register(`message_${l.id}` as any);
    }
  }, [uiLangs, register]);

  // ✅ minimal watch (tüm form watch() yok)
  const watchedType = useWatch({ control, name: 'type' as any }) as string;
  const watchedSellerId = useWatch({ control, name: 'seller_id' as any }) as string;
  const watchedActiveDate = useWatch({ control, name: 'active_date' as any }) as string;

  // queries
  const { sellerList } = useSellerQuery({});
  const { sellerStoreList } = useSellerStoreQuery({ seller_id: watchedSellerId });

  const sellerData = (sellerList as any) || [];
  const sellerStoreData = (sellerStoreList as any) || [];

  // -----------------------------
  // JSON helpers (Department’ta çözdüğümüz gibi)
  // -----------------------------
  const buildJsonFromSubmittedValues = (values: any) => {
    const built = buildI18nJsonFromFlatValues({
      values: safeObject(values),
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });
    return ensureLangKeys(safeObject(built), uiLangs as any);
  };

  const applyJsonToForm = (nextAny: any) => {
    const next = ensureLangKeys(safeObject(nextAny), uiLangs as any);

    // 1) scaffold state + internal sync
    handleTranslationsJsonChange(next);

    // 2) flat field safety
    applyI18nJsonToFlatForm<NoticeFormData>({
      json: next,
      languages: uiLangs as any,
      fields: [...I18N_FIELDS],
      setValue: setValueAny,
      keyOf: (field, langId) => `${field}_${langId}`,
    });

    // 3) keep JSON state stable
    setTranslationsJson(next);
  };

  // -----------------------------
  // Init (editData -> form)
  // -----------------------------
  useEffect(() => {
    // CREATE
    if (!editData?.id) {
      setValueAny('type', '', { shouldDirty: false });
      setValueAny('priority', '', { shouldDirty: false });
      setValueAny('seller_id', '', { shouldDirty: false });
      setValueAny('store_id', '', { shouldDirty: false });
      setValueAny('active_date', '', { shouldDirty: false });
      setValueAny('expire_date', '', { shouldDirty: false });
      setValueAny('title_df', '', { shouldDirty: false, shouldValidate: true });
      setValueAny('message_df', '', { shouldDirty: false });

      rebuildJsonNow();
      return;
    }

    // base
    setValueAny('type', safeStr(editData?.type), { shouldDirty: false });
    setValueAny('priority', safeStr(editData?.priority), { shouldDirty: false });
    setValueAny('seller_id', editData?.seller_id ? String(editData.seller_id) : '', {
      shouldDirty: false,
    });
    setValueAny('store_id', editData?.store_id ? String(editData.store_id) : '', {
      shouldDirty: false,
    });

    setValueAny('active_date', editData?.active_date ? toYmd(editData.active_date) : '', {
      shouldDirty: false,
    });
    setValueAny('expire_date', editData?.expire_date ? toYmd(editData.expire_date) : '', {
      shouldDirty: false,
    });

    // translations normalize (array|object-map)
    const raw = editData?.translations;
    const normalizedTranslations = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object'
        ? Object.keys(raw).map((lang) => ({
            language_code: lang,
            title: raw?.[lang]?.title ?? '',
            message: raw?.[lang]?.message ?? '',
          }))
        : [];

    const normalizedEditData = { ...editData, translations: normalizedTranslations };

    // init i18n flat form
    initI18nFlatFormFromEntity({
      editData: normalizedEditData,
      firstUILangId,
      uiLangs,
      i18nFields: I18N_FIELDS,
      setValueAny,
      entityFieldMap: { title: 'title', message: 'message' },
      after: () => {
        // df root
        setValueAny('title_df', safeStr(editData?.title), { shouldDirty: false, shouldValidate: true });
        setValueAny('message_df', safeStr(editData?.message), { shouldDirty: false });

        // JSON init priority
        const dbJson = editData?.translations_json;
        if (dbJson && typeof dbJson === 'object') {
          applyJsonToForm(dbJson);
        } else {
          const snap = getValues();
          setTranslationsJson(buildJsonFromSubmittedValues(snap));
        }
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, firstUILangId]);

  // JSON mode enter: rebuild from snapshot (no drift)
  useEffect(() => {
    if (viewMode !== 'json') return;
    const snap = getValues();
    setTranslationsJson(buildJsonFromSubmittedValues(snap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handleSelectItem = (value: string, inputType: keyof NoticeFormData) => {
    setValueAny(inputType as any, value as any, { shouldDirty: true, shouldValidate: true });

    if (inputType === 'type') {
      setValueAny('store_id', '', { shouldDirty: true, shouldValidate: false });
      setValueAny('seller_id', '', { shouldDirty: true, shouldValidate: false });
    }
  };

  const { mutate: NoticeStore, isPending: isStorePending } = useNoticeStoreMutation();
  const { mutate: NoticeUpdate, isPending: isUpdatePending } = useNoticeUpdateMutation();

  const onSubmit = async (values: NoticeFormData) => {
    // rules
    if (!safeStr(values.title_df)) return toast.error('Title is required');

    if (values.type === 'specific_store' && !safeStr(values.store_id)) {
      return toast.error('Please Select Specific Store');
    }
    if (values.type === 'specific_seller' && !safeStr(values.seller_id)) {
      return toast.error('Please Select Specific Seller');
    }

    // root fields (df)
    const rootTitle = safeStr(values.title_df);
    const rootMessage = safeStr(values.message_df);

    const fallbackLang =
      uiLangs.find((l) => hasAnyI18nValue(values, l.id))?.id ?? firstUILangId;

    const finalTitle = rootTitle || safeStr((values as any)[`title_${fallbackLang}`]);
    const finalMessage = rootMessage || safeStr((values as any)[`message_${fallbackLang}`]);

    // translations (uiLangs; boşları at)
    const translations = (uiLangs ?? [])
      .filter((lang) => hasAnyI18nValue(values, lang.id))
      .map((lang) => ({
        language_code: lang.id,
        title: safeStr((values as any)[`title_${lang.id}`]),
        message: safeStr((values as any)[`message_${lang.id}`]),
      }));

    // translations_json — ALWAYS from submitted values
    const translations_json = buildJsonFromSubmittedValues(values);
    setTranslationsJson(translations_json);

    const submissionData: any = {
      ...values,
      id: editData?.id ? editData.id : '',
      title: finalTitle,
      message: finalMessage,
      translations,
      translations_json,
    };

    if (editData?.id) {
      return NoticeUpdate(submissionData, {
        onSuccess: () => {
          reset();
          dispatch(setRefetch(true));
        },
      });
    }

    return NoticeStore(submissionData, {
      onSuccess: () => {
        reset();
        dispatch(setRefetch(true));
      },
    });
  };

  // expire_date minDate (hooks dışı)
  const parsedStartDate = watchedActiveDate
    ? startOfDay(parse(watchedActiveDate, 'yyyy-MM-dd', new Date()))
    : null;

  const today = startOfDay(new Date());
  const minDate = parsedStartDate && parsedStartDate > today ? parsedStartDate : today;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* df hidden (schema contract) */}
        <input type="hidden" {...register('title_df' as any)} />
        <input type="hidden" {...register('message_df' as any)} />

        {/* Toggle (Form/JSON) */}
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {editData?.id ? 'Update Notice' : 'Add Notice'}
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
                label="Notice JSON"
                languages={uiLangs}
                value={ensureLangKeys(safeObject(translationsJson), uiLangs as any)}
                onChange={(next) => applyJsonToForm(next)}
                perLanguage
                showAllTab
                helperText={
                  <span>
                    Alanlar: <code>title</code>, <code>message</code>.
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* LEFT */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.type')}</p>
                    <Controller
                      control={control}
                      name="type"
                      render={({ field }) => (
                        <AppSelect
                          value={String(field.value ?? '')}
                          onSelect={(value) => {
                            const v = String(value ?? '');
                            field.onChange(v);
                            handleSelectItem(v, 'type');
                          }}
                          groups={TypeList}
                          hideNone
                        />
                      )}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Priority</p>
                    <Controller
                      control={control}
                      name="priority"
                      render={({ field }) => (
                        <AppSelect
                          value={String(field.value ?? '')}
                          onSelect={(value) => {
                            const v = String(value ?? '');
                            field.onChange(v);
                            handleSelectItem(v, 'priority');
                          }}
                          groups={PriorityList}
                          hideNone
                        />
                      )}
                    />
                  </div>

                  {watchedType === 'specific_seller' ? (
                    <div>
                      <p className="text-sm font-medium mb-1">Seller</p>
                      <Controller
                        control={control}
                        name="seller_id"
                        render={({ field }) => (
                          <AppSelect
                            value={String(field.value ?? '')}
                            onSelect={(value) => {
                              const v = String(value ?? '');
                              field.onChange(v);
                              handleSelectItem(v, 'seller_id');
                            }}
                            groups={sellerData}
                          />
                        )}
                      />
                    </div>
                  ) : null}

                  {watchedType === 'specific_store' ? (
                    <div>
                      <p className="text-sm font-medium mb-1">Store</p>
                      <Controller
                        control={control}
                        name="store_id"
                        render={({ field }) => (
                          <AppSelect
                            value={String(field.value ?? '')}
                            onSelect={(value) => {
                              const v = String(value ?? '');
                              field.onChange(v);
                              handleSelectItem(v, 'store_id');
                            }}
                            groups={sellerStoreData}
                          />
                        )}
                      />
                    </div>
                  ) : null}

                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.active_date')}</p>
                    <Controller
                      name="active_date"
                      control={control}
                      render={({ field }) => (
                        <CustomSingleDatePicker
                          label=""
                          selectedDate={
                            field.value ? parse(String(field.value), 'yyyy-MM-dd', new Date()) : null
                          }
                          onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.expire_date')}</p>
                    <Controller
                      name="expire_date"
                      control={control}
                      render={({ field }) => (
                        <CustomSingleDatePicker
                          label=""
                          selectedDate={
                            field.value ? parse(String(field.value), 'yyyy-MM-dd', new Date()) : null
                          }
                          onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          minDate={minDate}
                        />
                      )}
                    />
                    {errors.expire_date && (
                      <p className="text-red-500 text-sm mt-1">{String(errors.expire_date.message)}</p>
                    )}
                  </div>
                </div>

                {/* RIGHT — i18n tabs (df yok) */}
                <div>
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
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>
                                  Title ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                </span>
                              </p>
                              <Input
                                id={`title_${lang.id}`}
                                {...register(`title_${lang.id}` as keyof NoticeFormData)}
                                className="app-input"
                                placeholder="Entry title"
                              />
                              {(errors as any)[`title_${lang.id}`]?.message && (
                                <p className="text-red-500 text-sm mt-1">
                                  {String((errors as any)[`title_${lang.id}`]?.message)}
                                </p>
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>Message</span>
                              </p>
                              <Textarea
                                id={`message_${lang.id}`}
                                {...register(`message_${lang.id}` as keyof NoticeFormData)}
                                className="app-input min-h-[120px]"
                                placeholder="Entry message"
                              />
                              {(errors as any)[`message_${lang.id}`]?.message && (
                                <p className="text-red-500 text-sm mt-1">
                                  {String((errors as any)[`message_${lang.id}`]?.message)}
                                </p>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </div>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save */}
        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={data}
            IsLoading={data ? isUpdatePending : isStorePending}
            AddLabel="Add Notice"
            UpdateLabel="Update Notice"
          />
        </Card>
      </form>
    </div>
  );
};

export default CreateOrUpdateStoreNoticesForm;
