// =============================================================
// FILE: src/components/blocks/admin-section/unit/CreateOrUpdateUnitForm.tsx
// FINAL — Form + JSON mode (same pattern as SEO/Attribute/StoreType)
// - df used as required root (NOT rendered as a tab)
// - First active tab = first UI language (multiLang excluding df)
// - Uses: useFormI18nScaffold + AdminI18nJsonPanel + i18nFormAdapter
// - JSON includes: name only
// - Init: data -> RHF (root -> df + firstUILangId) + translations -> other langs
// - Mode switch to JSON: rebuild from getValues snapshot (timing-safe)
// =============================================================

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import multiLang from "@/components/molecules/multiLang.json";
import { SubmitButton } from "@/components/blocks/shared";
import {
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

import {
  useUnitStoreMutation,
  useUnitUpdateMutation,
} from "@/modules/admin-section/unit/unit.action";
import { UnitFormData, unitSchema } from "@/modules/admin-section/unit/unit.schema";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";

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


const I18N_FIELDS = ["name"] as const;

function normalizeStr(v: any) {
  return String(v ?? "").trim();
}

function normalizeUnitJson(json: any, uiLangs: Array<{ id: string }>) {
  const out: any = {};
  const srcRoot = safeObject(json);

  for (const lang of uiLangs) {
    const src = safeObject((srcRoot as any)?.[lang.id]);
    out[lang.id] = {
      ...src,
      name: normalizeStr(src?.name),
    };
  }

  // preserve other root keys (optional)
  for (const k of Object.keys(srcRoot)) {
    if (k in out) continue;
    const v = (srcRoot as any)[k];
    if (v && typeof v === "object") out[k] = v;
  }

  return out;
}

const CreateOrUpdateUnitForm = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const multiLangData = useMemo(
    () => (Array.isArray(multiLang) ? (multiLang as any[]) : []),
    []
  );

  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
    control,
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name_df: "",
      order: "",
    } as any,
  });

  const setValueAny = useMemo(
    () => makeRHFSetValueAny<UnitFormData>(setValue),
    [setValue]
  );

  // scaffold: df excluded, first tab = first UI lang
  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    setTranslationsJson,
    rebuildJsonNow,
    handleTranslationsJsonChange: scaffoldHandleJsonChange,
  } = useFormI18nScaffold<UnitFormData>({
    languages: multiLangData,
    excludeLangIds: ["df"],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    dfSync: {
      enabled: true,
      pairs: [{ dfField: "name_df", srcField: (l) => `name_${l}`, validate: true }],
    },
    // order is non-i18n but we can include it so JSON updates reflect latest order edits when toggling mode
    extraWatchNames: ["order"],
  });

  const [viewMode, setViewMode] = useState<ViewMode>("form");

  // -----------------------------
  // JSON change wrapper (normalize + apply + scaffold)
  // -----------------------------
  const handleTranslationsJsonChange = (next: any) => {
    const normalized = normalizeUnitJson(next, uiLangs);

    setTranslationsJson(normalized);

    applyI18nJsonToFlatForm<UnitFormData>({
      json: normalized,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      setValue,
      keyOf: (field, langId) => `${field}_${langId}`,
    });

    scaffoldHandleJsonChange(normalized);
  };

  // -----------------------------
  // Init: data -> RHF + JSON
  // -----------------------------
  useEffect(() => {
    if (!data) {
      // create mode: seed JSON from defaults
      const snap = getValues() as any;
      const built = buildI18nJsonFromFlatValues({
        values: snap,
        languages: uiLangs,
        fields: [...I18N_FIELDS],
        keyOf: (field, langId) => `${field}_${langId}`,
        skipEmpty: false,
      });
      setTranslationsJson(normalizeUnitJson(built, uiLangs));
      return;
    }

    // root -> df (required)
    setValueAny("name_df", data?.name ?? "", {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });

    // root -> first UI language (SEO pattern)
    setValueAny(`name_${firstUILangId}`, data?.name ?? "", {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // order
    setValueAny("order", data?.order !== undefined && data?.order !== null ? String(data.order) : "", {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // translations (object keyed OR array)
    const tr = data?.translations;
    if (Array.isArray(tr)) {
      tr.forEach((row: any) => {
        const langId = row?.language || row?.language_code;
        if (!langId || langId === "df") return;
        setValueAny(`name_${langId}`, row?.name ?? "", {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      });
    } else if (tr && typeof tr === "object") {
      Object.keys(tr).forEach((langId) => {
        if (!langId || langId === "df") return;
        const row = tr[langId];
        setValueAny(`name_${langId}`, row?.name ?? "", {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      });
    }

    // JSON init after setValue settle
    requestAnimationFrame(() => {
      rebuildJsonNow();
      setTranslationsJson((prev: any) => normalizeUnitJson(prev, uiLangs));
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, firstUILangId]);

  // Mode sync: when entering JSON, rebuild from latest form edits
  useEffect(() => {
    if (viewMode !== "json") return;
    rebuildJsonNow();
    setTranslationsJson((prev: any) => normalizeUnitJson(prev, uiLangs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // -----------------------------
  // Mutations
  // -----------------------------
  const { mutate: unitStore, isPending: isUnitStorePending } = useUnitStoreMutation();
  const { mutate: unitUpdate, isPending: isUnitUpdatePending } = useUnitUpdateMutation();

  const onSubmit = async (values: UnitFormData) => {
    const orderValue =
      values.order === "" || values.order === undefined || values.order === null
        ? values.order
        : Number(values.order);

    const defaultData = {
      name: values.name_df,
      order: orderValue,
    };

    const translations = uiLangs
      .filter((lang) => lang?.id && lang.id !== firstUILangId)
      .map((lang) => ({
        language_code: lang.id,
        name: normalizeStr((values as any)[`name_${lang.id}`]),
      }))
      .filter((row) => row.name.length > 0);

    const submissionData = {
      ...defaultData,
      id: !data ? 0 : data.id,
      translations,
      // if backend supports later:
      // translations_json: normalizeUnitJson(translationsJson, uiLangs),
    };

    const onSuccess = () => {
      reset();
      dispatch(setRefetch(true));
    };

    if (data) return unitUpdate({ ...(submissionData as any) }, { onSuccess });
    return unitStore({ ...(submissionData as any) }, { onSuccess });
  };

  // -----------------------------
  // UI
  // -----------------------------
  const ModeToggle = (
    <div className="mb-3 mt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t("label.unit") ?? "Unit"}
        </div>

        <div className="inline-flex rounded-md border bg-white dark:bg-[#1f2937] overflow-hidden">
          <button
            type="button"
            onClick={() => setViewMode("form")}
            className={`px-4 py-2 text-sm font-medium transition ${
              viewMode === "form"
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Form
          </button>
          <button
            type="button"
            onClick={() => setViewMode("json")}
            className={`px-4 py-2 text-sm font-medium transition ${
              viewMode === "json"
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
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
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* hidden df field (schema uyumu + dfSync hedefi) */}
        <input type="hidden" {...register("name_df")} />

        {ModeToggle}

        {viewMode === "json" ? (
          <Card className="mt-2">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Translations JSON"
                languages={uiLangs}
                value={normalizeUnitJson(translationsJson, uiLangs)}
                onChange={handleTranslationsJsonChange}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    Her tab sadece o dilin JSON’unu düzenler. <code>name</code> string olmalı.
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-2">
            <CardContent className="p-2 md:p-6">
              <Tabs defaultValue={firstUILangId} dir={dir} className="col-span-2">
                <TabsList className="flex justify-start bg-white dark:bg-[#1f2937]">
                  {uiLangs.map((lang) => (
                    <TabsTrigger key={lang.id} value={lang.id}>
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div dir={dir}>
                  {uiLangs.map((lang) => (
                    <TabsContent key={lang.id} value={lang.id} className="">
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t("label.name")} ({lang.label})
                          </span>
                        </div>
                        <Input
                          id={`name_${lang.id}`}
                          {...register(`name_${lang.id}` as keyof UnitFormData)}
                          className="app-input"
                          placeholder={t("place_holder.enter_name")}
                        />
                        {errors[`name_${lang.id}` as keyof UnitFormData] && (
                          <p className="text-red-500 text-sm mt-1">
                            {(errors as any)[`name_${lang.id}`]?.message}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">
                          {t("label.display_order")}
                        </p>
                        <Input
                          id="order"
                          type="number"
                          min={0}
                          {...register("order" as keyof UnitFormData)}
                          className="app-input"
                          placeholder="Entry display order"
                        />
                        {errors["order" as keyof UnitFormData] && (
                          <p className="text-red-500 text-sm mt-1">
                            {(errors as any)["order"]?.message}
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={data}
            IsLoading={data ? isUnitUpdatePending : isUnitStorePending}
            AddLabel={t("button.add")}
            UpdateLabel={t("button.update")}
          />
        </Card>
      </form>
    </div>
  );
};

export default CreateOrUpdateUnitForm;
