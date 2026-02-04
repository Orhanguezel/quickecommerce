'use client';

import React, { useEffect, useMemo, useState } from 'react';
import multiLang from '@/components/molecules/multiLang.json';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import {
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
} from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import {
  useDepartmentStoreMutation,
  useDepartmentUpdateMutation,
} from '@/modules/admin-section/ticket/department/department.action';
import {
  DepartmentFormData,
  departmentSchema,
} from '@/modules/admin-section/ticket/department/department.schema';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { toast } from 'react-toastify';

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


const StatusList = [
  { label: 'Active', value: '1' },
  { label: 'Inactive', value: '0' },
];


const I18N_FIELDS = ['name'] as const;

function safeStr(v: any) {
  return String(v ?? '').trim();
}

function toastBackendErrors(err: any) {
  const data = err?.response?.data;
  const msg = data?.message;

  const errors = data?.errors;
  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const firstVal = firstKey ? (errors as any)[firstKey] : null;
    const firstMsg = Array.isArray(firstVal)
      ? firstVal[0]
      : typeof firstVal === 'string'
        ? firstVal
        : null;

    toast.error(firstMsg ? String(firstMsg) : String(msg ?? 'Validation error'));
    return;
  }

  toast.error(String(msg ?? 'Request failed'));
}

/**
 * Department JSON:
 * { tr:{name:""}, en:{name:""} }
 * Always contain ALL uiLang keys (no missing lang objects).
 */
function normalizeDepartmentJson(json: any, uiLangs: Array<{ id: string }>) {
  const src = safeObject(json);
  const out: Record<string, any> = {};

  for (const lang of uiLangs) {
    const row = safeObject((src as any)[lang.id]);
    out[lang.id] = { name: safeStr(row?.name) };
  }

  // preserve unknown object keys (optional)
  for (const k of Object.keys(src)) {
    if (k in out) continue;
    const v = (src as any)[k];
    if (v && typeof v === 'object') out[k] = v;
  }

  return out;
}

export default function CreateOrUpdateDepartmentForm({ data }: any) {
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
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    shouldUnregister: false, // ✅ tab unmount olsa bile değerleri koru
    defaultValues: {
      name_df: '',
      status: '1', // ✅ undefined olmasın
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<DepartmentFormData>(setValue), [setValue]);

  // ✅ Scaffold (TagForm pattern)
  const i18n = useFormI18nScaffold<DepartmentFormData>({
    languages: allLangs,
    excludeLangIds: ['df'], // UI dilleri (tr/en/..) — df UI'de yok
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    dfSync: {
      enabled: true,
      // df, firstUILang'deki alanla sync (schema name_df şartı için)
      pairs: [{ dfField: 'name_df', srcField: (l) => `name_${l}`, validate: true }],
    },
    extraWatchNames: ['status'],
  });

  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    setTranslationsJson,
    handleTranslationsJsonChange,
    rebuildJsonNow,
  } = i18n;

  // ✅ CRITICAL: EN kaybolmasın diye tüm dil alanlarını PROGRAMATIK register et (hidden input yok!)
  useEffect(() => {
    (uiLangs as any[]).forEach((l) => {
      register(`name_${l.id}` as any);
    });
  }, [uiLangs, register]);

  // Tabs default: locale varsa onu seç, yoksa firstUILangId
  const defaultTab = useMemo(() => {
    const hasLocale = (uiLangs as any[]).some((l) => l?.id === locale);
    return hasLocale ? locale : firstUILangId;
  }, [uiLangs, locale, firstUILangId]);

  // JSON builder from snapshot (TagForm style)
  const buildJsonFromValues = (values: any) => {
    const built = buildI18nJsonFromFlatValues({
      values: safeObject(values),
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (f, l) => `${f}_${l}`,
      skipEmpty: false,
    });

    return normalizeDepartmentJson(built, uiLangs as any);
  };

  const applyJsonToForm = (nextAny: any) => {
    const normalized = normalizeDepartmentJson(nextAny, uiLangs as any);

    // 1) scaffold state + setValue(flat)
    handleTranslationsJsonChange(normalized);

    // 2) extra safety: direct apply to flat form
    applyI18nJsonToFlatForm<DepartmentFormData>({
      json: normalized,
      languages: uiLangs as any,
      fields: [...I18N_FIELDS],
      setValue: setValueAny,
      keyOf: (field, langId) => `${field}_${langId}`,
    });

    // keep local json state consistent
    setTranslationsJson(normalized);
  };

  // INIT (editData -> form)
  useEffect(() => {
    // CREATE
    if (!editData?.id) {
      setValueAny('status', '1', { shouldDirty: false, shouldTouch: false, shouldValidate: false });

      // JSON başlangıç snapshot (boş değil, tüm diller var)
      queueMicrotask(() => {
        const snap = getValues();
        setTranslationsJson(buildJsonFromValues(snap));
      });

      return;
    }

    // root -> df + firstUILang (edit root)
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

    // status
    setValueAny('status', safeStr(editData?.status) || '1', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // translations (object-map OR array) — TagForm robustness
    const trObj = editData?.translation ?? editData?.translations;

    if (trObj && typeof trObj === 'object' && !Array.isArray(trObj)) {
      Object.keys(trObj).forEach((langId) => {
        if (!langId || langId === 'df') return;
        const trn = (trObj as any)?.[langId];
        if (!trn) return;
        setValueAny(`name_${langId}` as any, safeStr(trn?.name), {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      });
    } else if (Array.isArray(trObj)) {
      trObj.forEach((trn: any) => {
        const langId = trn?.language_code ?? trn?.language;
        if (!langId || langId === 'df') return;
        setValueAny(`name_${langId}` as any, safeStr(trn?.name), {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      });
    }

    // JSON init priority: translations_json varsa onu uygula
    const dbJson = editData?.translations_json;
    if (dbJson && typeof dbJson === 'object') {
      applyJsonToForm(dbJson);
    } else {
      // yoksa form snapshot -> json
      queueMicrotask(() => {
        const snap = getValues();
        setTranslationsJson(buildJsonFromValues(snap));
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, firstUILangId]);

  // JSON mode enter: form snapshot -> json (no drift)
  useEffect(() => {
    if (viewMode !== 'json') return;
    rebuildJsonNow(); // scaffold sync
    const snap = getValues();
    setTranslationsJson(buildJsonFromValues(snap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const { mutate: departmentStore, isPending: isPendingCreate } = useDepartmentStoreMutation();
  const { mutate: departmentUpdate, isPending: isPendingUpdate } = useDepartmentUpdateMutation();

  const onSubmit = async (values: DepartmentFormData) => {
    // root (df required)
    const rootName =
      safeStr((values as any).name_df) || safeStr((values as any)[`name_${firstUILangId}`]);

    if (!rootName || rootName.length < 2) {
      toast.error('Department name must be at least 2 characters long');
      return;
    }

    const status = safeStr((values as any).status) || '1';

    // ✅ JSON from submitted snapshot (tek kaynak)
    const translations_json = buildJsonFromValues(values);
    setTranslationsJson(translations_json);

    // ✅ translations[] backend required-safe: include all uiLangs
    const translations = (uiLangs as any[]).map((lang) => ({
      language_code: lang.id,
      name: safeStr((values as any)[`name_${lang.id}`]),
    }));

    const submissionData: any = {
      name: rootName,
      status,
      id: editData?.id,
      translations,
      translations_json,
    };

    const onOk = () => {
      toast.success(editData?.id ? 'Updated successfully' : 'Created successfully');
      reset({ name_df: '', status: '1' } as any);
      setViewMode('form');
    };

    if (editData?.id > 0) {
      return departmentUpdate(submissionData, { onSuccess: onOk, onError: toastBackendErrors });
    }
    return departmentStore(submissionData, { onSuccess: onOk, onError: toastBackendErrors });
  };

  const jsonValue = useMemo(() => {
    return normalizeDepartmentJson(translationsJson, uiLangs as any);
  }, [translationsJson, uiLangs]);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ DF required by schema (NOT rendered) */}
        <input type="hidden" {...register('name_df' as any)} />

        {/* Header toggle (TagForm gibi basit) */}
        <Card className="mt-2">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {editData?.id > 0 ? t('button.update_department') : t('button.add_department')}
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

        {/* DF error */}
        {(errors as any)?.name_df?.message ? (
          <Card className="mt-4">
            <CardContent className="p-3">
              <p className="text-red-600 text-sm">{String((errors as any)?.name_df?.message)}</p>
            </CardContent>
          </Card>
        ) : null}

        {viewMode === 'json' ? (
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Department JSON"
                languages={uiLangs as any}
                value={jsonValue}
                onChange={applyJsonToForm}
                perLanguage
                showAllTab
              />
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4">
            {/* status global (tek sefer) */}
            <Card className="mb-4">
              <CardContent className="p-2 md:p-6">
                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>{t('label.status')}</span>
                </p>

                <Controller
                  control={control}
                  name="status"
                  defaultValue="1"
                  render={({ field }) => (
                    <AppSelect
                      value={String(field.value ?? '')} // ✅ string | undefined fix
                      onSelect={(value) => field.onChange(String(value ?? ''))}
                      groups={StatusList}
                    />
                  )}
                />

                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.status.message)}</p>
                )}
              </CardContent>
            </Card>

            {/* Tabs — sadece UI dilleri (df yok) */}
            <Tabs defaultValue={defaultTab} className="col-span-2">
              <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                {uiLangs.map((lang: any) => (
                  <TabsTrigger key={lang.id} value={lang.id}>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div dir={dir} className="grid grid-cols-1">
                {uiLangs.map((lang: any) => (
                  <TabsContent key={lang.id} value={lang.id} className="lg:col-span-2">
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>
                          {t('label.name')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                        </span>
                      </p>

                      <Input
                        id={`name_${lang.id}`}
                        {...register(`name_${lang.id}` as keyof DepartmentFormData)}
                        className="app-input"
                        placeholder={t('place_holder.enter_name')}
                      />

                      {(errors as any)[`name_${lang.id}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {(errors as any)[`name_${lang.id}`]?.message}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        )}

        <div className="mt-10">
          <SubmitButton
            UpdateData={data}
            IsLoading={editData?.id > 0 ? isPendingUpdate : isPendingCreate}
            AddLabel={t('button.add_department')}
            UpdateLabel={t('button.update_department')}
          />
        </div>
      </form>
    </div>
  );
}
