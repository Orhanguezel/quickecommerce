// =============================================================
// File: src/components/blocks/admin-section/system-management/currency/CreateOrUpdateCurrencyForm.tsx
// FINAL — Form + JSON aynı "Kaydet/Güncelle" butonu ile
// - AdminI18nJsonPanel + useFormI18nScaffold
// - JSON değişiklikleri RHF alanlarına setValue ile yazılır
// - Schema değişmedi (currencySchema aynen)
// =============================================================

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import multiLang from "@/components/molecules/multiLang.json";
import { SubmitButton } from "@/components/blocks/shared";
import { Input, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

import {
  useCurrencyStoreMutation,
  useCurrencyUpdateMutation,
} from "@/modules/admin-section/system-management/currency/currency.action";
import { CurrencyFormData, currencySchema } from "@/modules/admin-section/system-management/currency/currency.schema";

import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

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


// JSON alanları
const I18N_FIELDS = ["name"] as const;

type ToggleState = {
  status: boolean;
};

function safeStr(x: unknown) {
  return String(x ?? "").trim();
}

function hasAnyI18nValue(values: any, langId: string) {
  return !!safeStr(values?.[`name_${langId}`]);
}

export default function CreateOrUpdateCurrencyForm({ data }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const dir = locale === "ar" ? "rtl" : "ltr";

  const allLangs = useMemo(() => multiLang as LangType[], []);
  const [viewMode, setViewMode] = useState<ViewMode>("form");

  // senin eski yapın: data?.data
  const editData = data?.data;

  const [toggles, setToggles] = useState<ToggleState>({
    status: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
    control,
  } = useForm<CurrencyFormData>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      name_df: "",
      code: "",
      symbol: "",
      exchange_rate: "",
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<CurrencyFormData>(setValue), [setValue]);

  // i18n scaffold (df dahil)
  const i18n = useFormI18nScaffold<CurrencyFormData>({
    languages: allLangs,
    excludeLangIds: [],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    extraWatchNames: ["code", "symbol", "exchange_rate"],
    dfSync: {
      enabled: true,
      pairs: [{ dfField: "name_df", srcField: (l) => `name_${l}`, validate: true }],
    },
  });

  const { uiLangs, firstUILangId, translationsJson, handleTranslationsJsonChange, rebuildJsonNow } = i18n;

  // minimal watch (submit disable için)
  const watchedNameDf = useWatch({ control, name: "name_df" as any }) as string;

  // Init (DB -> Form) + JSON init
  useEffect(() => {
    if (!editData) {
      rebuildJsonNow();
      return;
    }

    // base fields
    setValueAny("name_df", editData?.name ?? "", { shouldDirty: false, shouldValidate: true });
    setValueAny("code", editData?.code ?? "", { shouldDirty: false });
    setValueAny("symbol", editData?.symbol ?? "", { shouldDirty: false });
    setValueAny("exchange_rate", editData?.exchange_rate != null ? String(editData.exchange_rate) : "", { shouldDirty: false });

    // toggles
    setToggles({
      status: !!editData?.status,
    });

    // normalize translations: object map ya da array olabilir
    const raw = editData?.translations;
    const normalizedTranslations = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object"
        ? Object.keys(raw).map((lang) => ({
            language_code: lang,
            name: raw?.[lang]?.name ?? "",
          }))
        : [];

    const normalizedEditData = {
      ...editData,
      translations: normalizedTranslations,
    };

    initI18nFlatFormFromEntity({
      editData: normalizedEditData,
      firstUILangId,
      uiLangs,
      i18nFields: I18N_FIELDS,
      setValueAny,
      entityFieldMap: {
        name: "name",
      },
      after: rebuildJsonNow,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, firstUILangId]);

  // Toggle
  const handleToggle = (field: keyof ToggleState) => {
    setToggles((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // JSON -> RHF bridge
  const onJsonChange = (next: any) => {
    handleTranslationsJsonChange(next);

    uiLangs.forEach((lang) => {
      const langId = lang.id;
      const block = next?.[langId] ?? {};
      const name = safeStr(block?.name);

      setValueAny(`name_${langId}` as any, name, { shouldDirty: true, shouldValidate: langId === "df" });

      if (langId === "df") {
        setValueAny("name_df", name, { shouldDirty: true, shouldValidate: true });
      }
    });

    rebuildJsonNow();
  };

  // mutations
  const { mutate: currencyStore, isPending } = useCurrencyStoreMutation();
  const { mutate: currencyUpdate, isPending: isUpdating } = useCurrencyUpdateMutation();

  const onSubmit = async (values: CurrencyFormData) => {
    const v: any = values as any;

    // schema name_df required ama UX mesajı net olsun
    if (!safeStr(v.name_df)) return;

    const defaultData: any = {
      name: safeStr(v.name_df),
      code: safeStr(v.code),
      symbol: safeStr(v.symbol),
      exchange_rate: safeStr(v.exchange_rate),
    };

    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== "df")
      .filter((lang) => hasAnyI18nValue(v, lang.id))
      .map((lang) => ({
        language_code: lang.id,
        name: safeStr(v?.[`name_${lang.id}`]),
      }));

    const builtJson = buildI18nJsonFromFlatValues({
      values: v,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });

    const payload: any = {
      ...defaultData,
      id: editData?.id,
      status: toggles.status,
      translations,
      translations_json: ensureLangKeys(builtJson, uiLangs),
    };

    return editData
      ? currencyUpdate(
          { ...(payload as any) },
          {
            onSuccess: () => {
              dispatch(setRefetch(true));
              reset();
            },
          }
        )
      : currencyStore(
          { ...(payload as any) },
          {
            onSuccess: () => {
              dispatch(setRefetch(true));
              reset();
            },
          }
        );
  };

  return (
    <div className="pb-24">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* df required hidden register (schema ile uyum) */}
        <input type="hidden" {...register("name_df" as any)} />

        {/* View toggle */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="inline-flex rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("form")}
              className={[
                "px-4 py-2 text-sm font-medium transition",
                viewMode === "form"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              Form
            </button>
            <button
              type="button"
              onClick={() => setViewMode("json")}
              className={[
                "px-4 py-2 text-sm font-medium transition",
                viewMode === "json"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              JSON
            </button>
          </div>
        </div>

        {viewMode === "json" ? (
          <div className="mt-4">
            <AdminI18nJsonPanel
              label="Currency JSON"
              languages={uiLangs}
              value={ensureLangKeys(translationsJson, uiLangs)}
              onChange={onJsonChange}
              perLanguage={true}
              showAllTab={true}
              helperText={
                <span>
                  Alanlar: <code>name</code>
                </span>
              }
            />
          </div>
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

              <div dir={dir}>
                {uiLangs.map((lang) => (
                  <TabsContent key={lang.id} value={lang.id} className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>
                          {t("label.name")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                        </span>
                      </p>
                      <Input
                        id={`name_${lang.id}`}
                        {...register(`name_${lang.id}` as any)}
                        className="app-input"
                        placeholder={t("place_holder.enter_name")}
                        onChange={(e) => {
                          const val = e.target.value;
                          setValueAny(`name_${lang.id}` as any, val, { shouldDirty: true, shouldValidate: lang.id === "df" });
                          if (lang.id === "df") {
                            setValueAny("name_df", val, { shouldDirty: true, shouldValidate: true });
                          }
                        }}
                      />
                      {(errors as any)?.[`name_${lang.id}`]?.message ? (
                        <p className="text-red-500 text-sm mt-1">{String((errors as any)[`name_${lang.id}`]?.message)}</p>
                      ) : null}
                    </div>

                    {/* Bu alanlar dil bağımsız; her tabda göstermek istemezsen df tabında şart koşabiliriz */}
                    <div>
                      <p className="text-sm font-medium mb-1">Currency Code</p>
                      <Input
                        id="code"
                        {...register("code" as any)}
                        className="app-input"
                        placeholder="Enter code"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Symbol</p>
                      <Input
                        id="symbol"
                        {...register("symbol" as any)}
                        className="app-input"
                        placeholder="Enter symbol"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Exchange Rate</p>
                      <Input
                        type="number"
                        min={0}
                        id="exchange_rate"
                        {...register("exchange_rate" as any)}
                        className="app-input"
                        placeholder="Enter exchange rate"
                      />
                    </div>

                    <div className="grid grid-cols-7 w-full">
                      <h2 className="col-span-2 text-sm font-medium">Status</h2>
                      <div className="flex flex-col items-start">
                        <Switch dir="ltr" checked={toggles.status} onCheckedChange={() => handleToggle("status")} />
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        )}

        {/* Footer (tek buton) */}
        <div className="fixed left-0 right-0 bottom-0 z-50 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-end">
            <SubmitButton
              UpdateData={data}
              IsLoading={isPending || isUpdating}
              AddLabel="Create Currency"
              UpdateLabel="Update Currency"
              // @ts-ignore - mevcut SubmitButton prop setine göre
              disabled={!safeStr(watchedNameDf)}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
