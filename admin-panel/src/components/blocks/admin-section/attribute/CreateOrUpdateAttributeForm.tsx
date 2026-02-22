// =============================================================
// FILE: src/components/blocks/admin-section/attribute/CreateOrUpdateAttributeForm.tsx
// FINAL — Form + JSON mode (SEO settings pattern)
// - df used as required root (NOT rendered as a tab)
// - First active tab = first UI language (multiLangData[0] excluding df)
// - Uses: useFormI18nScaffold + AdminI18nJsonPanel + i18nFormAdapter
// - JSON includes: attribute_name only
// - Init: data -> RHF (root -> df + firstUILangId) + translations -> other langs
// - attribute_values kept in local state + sync to RHF attribute_values
// =============================================================

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { toast } from "react-toastify";

import multiLang from "@/components/molecules/multiLang.json";
import { AppSelect } from "@/components/blocks/common";
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

import { useStoreTypeQuery } from "@/modules/common/store-type/store-type.action";
import { useCategoriesQuery } from "@/modules/common/category/category.action";
import {
  useAttributeStoreMutation,
  useAttributeUpdateMutation,
} from "@/modules/admin-section/attribute/attributes.action";
import {
  AttributeFormData,
  attributeSchema,
} from "@/modules/admin-section/attribute/attributes.schema";
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


const I18N_FIELDS = ["attribute_name"] as const;

function normalizeStr(v: any) {
  return String(v ?? "").trim();
}

/**
 * Attribute JSON normalize:
 * - ensures every UI lang exists
 * - ensures attribute_name exists as string (default "")
 */
function normalizeAttributeJson(json: any, uiLangs: Array<{ id: string }>) {
  const out: any = {};
  const srcRoot = safeObject(json);

  for (const lang of uiLangs) {
    const src = safeObject(srcRoot?.[lang.id]);
    out[lang.id] = {
      ...src,
      attribute_name: normalizeStr(src?.attribute_name),
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

const CreateOrUpdateAttributeForm = ({ data }: any) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const multiLangData = useMemo(
    () => (Array.isArray(multiLang) ? (multiLang as any[]) : []),
    []
  );

  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const {
    register,
    control,
    reset,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      product_type: data?.product_type ?? "",
      attribute_values:
        data?.attribute_values?.length > 0
          ? data.attribute_values.map((item: any) =>
              typeof item === "object" ? item.label : item
            )
          : [],
      attribute_name_df: "",
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<AttributeFormData>(setValue), [setValue]);

  // Scaffold (df excluded, first tab = first UI lang)
  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    setTranslationsJson,
    handleTranslationsJsonChange: scaffoldHandleJsonChange,
    rebuildJsonNow,
  } = useFormI18nScaffold<AttributeFormData>({
    languages: multiLangData,
    excludeLangIds: ["df"],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    // dfSync: attribute_name_df should follow first ui language attribute_name
    dfSync: {
      enabled: true,
      pairs: [{ dfField: "attribute_name_df", srcField: (l) => `attribute_name_${l}`, validate: true }],
    },
  });

  const [viewMode, setViewMode] = useState<ViewMode>("form");

  const { storeType } = useStoreTypeQuery({});
  const typeData = (storeType as any) || [];

  const [categoryId, setCategoryId] = useState<string>(
    data?.category_id ? String(data.category_id) : ""
  );

  const { categories } = useCategoriesQuery({ pagination: false });
  const allCategoryData: any[] = (categories as any)?.data || [];

  const categoryOptions = useMemo(() => {
    return allCategoryData.map((cat: any) => ({
      label: cat.category_name ?? cat.name ?? "",
      value: String(cat.id),
    }));
  }, [allCategoryData]);

  const [attributeValues, setAttributeValues] = useState<string[]>(
    data?.attribute_values?.length > 0
      ? data.attribute_values.map((item: any) =>
          typeof item === "object" ? item.label : item
        )
      : []
  );

  // JSON change wrapper (normalize + apply + scaffold)
  const handleTranslationsJsonChange = (next: any) => {
    const normalized = normalizeAttributeJson(next, uiLangs);

    setTranslationsJson(normalized);

    // JSON -> Form
    applyI18nJsonToFlatForm<AttributeFormData>({
      json: normalized,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      setValue,
      keyOf: (field, langId) => `${field}_${langId}`,
    });

    scaffoldHandleJsonChange(normalized);
  };

  // -------------------------------------------
  // Init: data -> RHF + attribute_values + JSON
  // -------------------------------------------
  useEffect(() => {
    // ensure attribute_values stays in RHF even in create mode
    setValueAny("attribute_values", attributeValues, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    if (!data) {
      // create mode: build JSON from current form snapshot (includes firstUILangId values)
      queueMicrotask(() => {
        const snap = getValues() as any;
        const built = buildI18nJsonFromFlatValues({
          values: snap,
          languages: uiLangs,
          fields: [...I18N_FIELDS],
          keyOf: (field, langId) => `${field}_${langId}`,
          skipEmpty: false,
        });
        setTranslationsJson(normalizeAttributeJson(built, uiLangs));
      });
      return;
    }

    // root -> df (required)
    setValueAny("attribute_name_df", data?.label ?? "", {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });

    // root -> first UI language (SEO settings pattern)
    setValueAny(`attribute_name_${firstUILangId}`, data?.label ?? "", {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // product type
    setValueAny("product_type", data?.product_type ?? "", {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // translations:
    // supports both {tr:{label}} object AND [{language_code, name}] array (defensive)
    const tr = data?.translations;

    if (Array.isArray(tr)) {
      tr.forEach((row: any) => {
        const langId = row?.language || row?.language_code;
        if (!langId || langId === "df") return;

        // backend may send label or name
        const val = row?.label ?? row?.name ?? "";
        setValueAny(`attribute_name_${langId}`, val, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      });
    } else if (tr && typeof tr === "object") {
      Object.keys(tr).forEach((langId) => {
        if (!langId || langId === "df") return;
        const row = tr[langId];
        setValueAny(`attribute_name_${langId}`, row?.label ?? row?.name ?? "", {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      });
    }

    // values
    if (data?.attribute_values?.length > 0) {
      const arr = data.attribute_values.map((item: any) =>
        typeof item === "object" ? item.label : item
      );
      setAttributeValues(arr);
      setValueAny("attribute_values", arr, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    } else {
      setAttributeValues([]);
      setValueAny("attribute_values", [], {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }

    // JSON init from snapshot AFTER setValue’s settle
    requestAnimationFrame(() => {
      rebuildJsonNow();
      // also normalize to ensure attribute_name exists for each lang
      setTranslationsJson((prev: any) => normalizeAttributeJson(prev, uiLangs));
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, firstUILangId]);

  // Mode sync: when entering JSON, rebuild from latest form edits
  useEffect(() => {
    if (viewMode !== "json") return;
    rebuildJsonNow();
    setTranslationsJson((prev: any) => normalizeAttributeJson(prev, uiLangs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // -------------------------------------------
  // Attribute values handlers
  // -------------------------------------------
  const handleSelectItem = (value: string, inputType: string) => {
    setValueAny(inputType, value);
  };

  const handleAddAttributeValue = () => {
    const next = [...attributeValues, ""];
    setAttributeValues(next);
    setValueAny("attribute_values", next);
  };

  const handleDeleteAttributeValue = (index: number) => {
    const next = attributeValues.filter((_, i) => i !== index);
    setAttributeValues(next);
    setValueAny("attribute_values", next);
  };

  const handleChangeAttributeValue = (index: number, value: string) => {
    const next = [...attributeValues];
    next[index] = value;
    setAttributeValues(next);
    setValueAny("attribute_values", next);
  };

  // -------------------------------------------
  // Submit
  // -------------------------------------------
  const { mutate: attributeStore, isPending } = useAttributeStoreMutation();
  const { mutate: attributeUpdate, isPending: isUpdating } = useAttributeUpdateMutation();

  const onSubmit = async (values: AttributeFormData) => {
    if (!values.product_type && !categoryId) {
      return toast.error(t("toast.one_type_is_required"));
    }

    const defaultData = {
      name: values.attribute_name_df,
      product_type: values.product_type || null,
      category_id: categoryId || null,
      value: attributeValues,
    };

    const translations = uiLangs
      .filter((lang) => lang?.id && lang.id !== firstUILangId)
      .map((lang) => ({
        language_code: lang.id,
        name: normalizeStr((values as any)[`attribute_name_${lang.id}`]),
      }))
      .filter((row) => row.name.length > 0);

    const submissionData = {
      ...defaultData,
      id: data ? data.id : "",
      translations,
    };

    const onSuccess = () => {
      dispatch(setRefetch(true));
      reset();
      setAttributeValues([]);
    };

    if (data) return attributeUpdate({ ...(submissionData as any) }, { onSuccess });
    return attributeStore({ ...(submissionData as any) }, { onSuccess });
  };

  // -------------------------------------------
  // UI
  // -------------------------------------------
  const ModeToggle = (
    <div className="mb-3 mt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t("label.attribute") ?? "Attribute"}
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
        <input type="hidden" {...register("attribute_name_df")} />

        {ModeToggle}

        {viewMode === "json" ? (
          <Card className="mt-2">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Translations JSON"
                languages={uiLangs}
                value={normalizeAttributeJson(translationsJson, uiLangs)}
                onChange={handleTranslationsJsonChange}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    Her tab sadece o dilin JSON’unu düzenler. <code>attribute_name</code> string olmalı.
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-2">
            <CardContent className="p-2 md:p-6">
              {/* First active tab = first UI language (df render yok) */}
              <Tabs dir={dir} defaultValue={firstUILangId}>
                <TabsList className="flex justify-start bg-white dark:bg-[#1f2937]">
                  {uiLangs.map((lang) => (
                    <TabsTrigger key={lang.id} value={lang.id}>
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {uiLangs.map((lang) => (
                  <TabsContent className="" key={lang.id} value={lang.id}>
                    <div>
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>
                          {t("label.name")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                        </span>
                      </p>

                      <Input
                        id={`attribute_name_${lang.id}`}
                        {...register(`attribute_name_${lang.id}` as keyof AttributeFormData)}
                        className="app-input"
                        placeholder={t("place_holder.enter_name")}
                      />

                      {errors[`attribute_name_${lang.id}` as keyof AttributeFormData] && (
                        <p className="text-red-500 text-sm mt-1">
                          {(errors as any)[`attribute_name_${lang.id}`]?.message}
                        </p>
                      )}
                    </div>

                    {/* product_type + category_id + values her dilde aynı: tek yerde gösteririz */}
                    <div className="my-4">
                      <p className="text-sm font-medium mb-1">{t("label.type")}</p>

                      <Controller
                        control={control}
                        name="product_type"
                        render={({ field }) => (
                          <AppSelect
                            value={String(field.value ?? "")}
                            onSelect={(value) => {
                              const next = value === "none" ? "" : String(value);
                              field.onChange(next);
                              handleSelectItem(next, "product_type");
                            }}
                            groups={typeData}
                          />
                        )}
                      />
                    </div>

                    <div className="my-4">
                      <p className="text-sm font-medium mb-1">{t("label.category")}</p>
                      <AppSelect
                        value={categoryId}
                        onSelect={(value) => {
                          setCategoryId(value === "none" ? "" : String(value));
                        }}
                        groups={categoryOptions}
                        placeholder={t("label.category")}
                      />
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-1 flex items-center gap-4">
                        <span>{t("label.values")}</span>
                      </div>

                      <div className="flex items-center gap-2 md:gap-4">
                        <Input
                          value={attributeValues[0] || ""}
                          onChange={(e) => handleChangeAttributeValue(0, e.target.value)}
                          className="app-input flex-grow py-2"
                          placeholder={t("place_holder.enter_value")}
                        />
                        <span
                          onClick={handleAddAttributeValue}
                          className="w-[110px] md:w-[100px] flex items-center cursor-pointer bg-blue-50 border border-blue-500 text-blue-500 text-xs md:text-sm font-bold shadow-2xl px-2 py-2.5 md:py-2 rounded hover:bg-blue-500 hover:text-white"
                        >
                          {t("button.add_more")}
                        </span>
                      </div>

                      {attributeValues.slice(1).map((value, index) => (
                        <div
                          key={index + 1}
                          className="my-4 flex items-center mb-2 gap-2 md:gap-4"
                        >
                          <Input
                            value={value}
                            onChange={(e) =>
                              handleChangeAttributeValue(index + 1, e.target.value)
                            }
                            className="app-input flex-grow py-2"
                            placeholder={t("place_holder.enter_value")}
                          />
                          <span
                            onClick={() => handleDeleteAttributeValue(index + 1)}
                            className="cursor-pointer bg-red-50 border border-red-500 text-red-500 shadow-2xl px-2 py-2 rounded hover:bg-red-500 hover:text-white"
                          >
                            <X width={20} height={20} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={data}
            IsLoading={isPending || isUpdating}
            AddLabel={t("button.add_attribute")}
            UpdateLabel={t("button.update_attribute")}
          />
        </Card>
      </form>
    </div>
  );
};

export default CreateOrUpdateAttributeForm;
