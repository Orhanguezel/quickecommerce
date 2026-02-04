// =============================================================
// File: src/components/blocks/admin-section/promotional/flash-deals/CreateOrUpdateFlashDealsForm.tsx
// FINAL — Standard Form + I18n JSON (schema-aligned, global fields persist)
// FIXES:
// - discount_amount RHF number state (Controller) ✅
// - discount_type RHF state guaranteed ✅
// - images persisted via payload with dual keys (cover_image + cover_image_id, image + image_id) ✅
// - NO whole-form watch ✅
// =============================================================

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Select from "react-select";
import { format, parse, startOfDay } from "date-fns";
import { Check, Info } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { toast } from "react-toastify";

import multiLang from "@/components/molecules/multiLang.json";
import { AppSelect } from "@/components/blocks/common";
import { SubmitButton } from "@/components/blocks/shared";
import PhotoUploadModal, { type UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";
import CustomSingleDatePicker from "@/components/blocks/common/CustomSingleDatePicker";
import Cancel from "@/components/blocks/custom-icons/Cancel";
import CloudIcon from "@/assets/icons/CloudIcon";
import GlobalImageLoader from "@/lib/imageLoader";
import StoreTypeCard from "../../business-operations/area/settings/components/StoreTypeCard";

import {
  Button,
  Card,
  CardContent,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";

import {
  useFlashDealsStoreMutation,
  useFlashDealsUpdateMutation,
  useTypeWiseStoreQuery,
} from "@/modules/admin-section/promotional/flash-deals/flash-deals.action";
import { FlashDealsFormData, flashDealsSchema } from "@/modules/admin-section/promotional/flash-deals/flash-deals.schema";

import { useStoreTypeQuery } from "@/modules/common/store-type/store-type.action";
import { useStoreWiseProductQuery } from "@/modules/common/store-wise-product/store-wise-product.action";
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


interface Option {
  id?: number;
  value: number;
  label: string;
}

const I18N_FIELDS = ["title", "description", "button_text"] as const;

const DiscountTypeList = [
  { label: "Percent (%)", value: "percentage" },
  { label: "Fixed ($)", value: "amount" },
];

const ProductFilterList = [
  { id: "1", label: "Handpicked products", value: "handpicked_products" },
  { id: "2", label: "Filter products by store", value: "filter_products_by_store" },
];

function safeStr(x: any) {
  return String(x ?? "").trim();
}

function hasAnyI18nValue(values: any, langId: string) {
  const t = safeStr(values?.[`title_${langId}`]);
  const d = safeStr(values?.[`description_${langId}`]);
  const b = safeStr(values?.[`button_text_${langId}`]);
  return !!(t || d || b);
}

const COLOR_FIELDS = [
  { key: "title_color", labelKey: "label.title_color", btnClass: "dynamic-title-color" },
  { key: "description_color", labelKey: "label.description_color", btnClass: "dynamic-description-color" },
  { key: "button_text_color", labelKey: "label.button_text_color", btnClass: "dynamic-button-text-color" },
  { key: "button_bg_color", labelKey: "label.button_bg_color", btnClass: "dynamic-button-color" },
  { key: "button_hover_color", labelKey: "label.button_hover_color", btnClass: "dynamic-button-hover-color" },
  { key: "background_color", labelKey: "label.bg_color", btnClass: "dynamic-background-color" },
  { key: "timer_bg_color", labelKey: "label.timer_bg_color", btnClass: "dynamic-timer-bg-color" },
  { key: "timer_text_color", labelKey: "label.timer_text_color", btnClass: "dynamic-timer-text-color" },
] as const;

type ColorFieldKey = (typeof COLOR_FIELDS)[number]["key"];

export default function CreateOrUpdateFlashDealsForm({ data }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const dir = locale === "ar" ? "rtl" : "ltr";

  const allLangs = useMemo(() => multiLang as Array<{ id: string; label: string }>, []);
  const [viewMode, setViewMode] = useState<ViewMode>("form");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
    getValues,
  } = useForm<FlashDealsFormData>({
    resolver: zodResolver(flashDealsSchema),
    defaultValues: {
      title_df: "",
      description_df: "",
      button_text_df: "",

      store_type: "",
      store_id: "",

      discount_type: "",
      discount_amount: 0,

      purchase_limit: "",
      start_date: "",
      start_time: "",
      end_date: "",
      end_time: "",

      title_color: "#ff6133",
      description_color: "#ffe933",
      button_text_color: "#1beb11",
      button_bg_color: "#ffff",
      button_hover_color: "#1153eb",
      background_color: "#0a3eb5",
      timer_bg_color: "#0a3eb5",
      timer_text_color: "#0a3eb5",
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<FlashDealsFormData>(setValue), [setValue]);

  const i18n = useFormI18nScaffold<FlashDealsFormData>({
    languages: allLangs,
    excludeLangIds: ["df"],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    extraWatchNames: [
      "store_type",
      "store_id",
      "discount_type",
      "discount_amount",
      "purchase_limit",
      "start_date",
      "start_time",
      "end_date",
      "end_time",
      ...COLOR_FIELDS.map((x) => x.key),
    ],
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: "title_df", srcField: (l) => `title_${l}`, validate: true },
        { dfField: "description_df", srcField: (l) => `description_${l}` },
        { dfField: "button_text_df", srcField: (l) => `button_text_${l}` },
      ],
    },
  });

  const { uiLangs, firstUILangId, translationsJson, handleTranslationsJsonChange, rebuildJsonNow } = i18n;

  // minimal watches
  const watchedStoreType = useWatch({ control, name: "store_type" as any });
  const watchedStoreId = useWatch({ control, name: "store_id" as any });
  const watchedDiscountType = useWatch({ control, name: "discount_type" as any });
  const watchedStartDate = useWatch({ control, name: "start_date" as any });

  const watchedColorsArr = useWatch({
    control,
    name: COLOR_FIELDS.map((x) => x.key) as any,
  }) as unknown as Array<string | undefined>;

  const watchedColors = useMemo(() => {
    const out = {} as Record<ColorFieldKey, string>;
    COLOR_FIELDS.forEach((f, idx) => {
      out[f.key] = String(watchedColorsArr?.[idx] ?? "");
    });
    return out;
  }, [watchedColorsArr]);

  const handleColorChange = (color: string, colorField: ColorFieldKey) => {
    setValueAny(colorField, color, { shouldValidate: true });
  };

  // external queries
  const { storeType } = useStoreTypeQuery({});
  const { TypeWiseStoreList } = useTypeWiseStoreQuery({ store_type: watchedStoreType });
  const { StoreWiseProductList, refetch } = useStoreWiseProductQuery({ store_id: watchedStoreId });

  const StoreTypeData = (storeType as any) || [];
  const TypeWiseStoreData = (TypeWiseStoreList as any)?.data || [];
  const StoreWiseProductData = (StoreWiseProductList as any)?.data || [];

  // GLOBAL local state
  const [lastSelectedImages, setLastSelectedImages] = useState<any>(null); // cover_image
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null); // image
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>("");
  const [errorImagesMessage, setImagesErrorMessage] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<Option[]>([]);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string | null>("1");

  const handleCardClick = (optionId: string) => {
    setSelectedPaymentOption(optionId === selectedPaymentOption ? null : optionId);

    if (optionId === "1") {
      setValueAny("store_id", "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      refetch?.();
    }
  };

  const onChangeMultiSelect = (value: Option[]) => {
    setSelectedProducts(value || []);
  };

  // JSON change handler
  const onJsonChange = (next: any) => {
    const normalized = safeObject(next);
    handleTranslationsJsonChange(normalized);

    applyI18nJsonToFlatForm<FlashDealsFormData>({
      json: normalized,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      setValue: setValueAny,
      keyOf: (field, langId) => `${field}_${langId}`,
    });
  };

  useEffect(() => {
    if (viewMode !== "json") return;
    rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // init
  useEffect(() => {
    if (!data || !data?.id) {
      rebuildJsonNow();
      return;
    }

    if (Array.isArray(data?.products)) setSelectedProducts(data.products);

    // IMPORTANT: store_type/store_id edit fill (senin eski kodda yoktu)
    setValueAny("store_type", data?.store_type ?? "", { shouldDirty: false });
    setValueAny("store_id", data?.store_id ?? "", { shouldDirty: false });

    if (data?.start_time) {
      const [sd, st] = String(data.start_time).split(" ");
      setValueAny("start_date", sd ?? "", { shouldDirty: false });
      setValueAny("start_time", st ?? "", { shouldDirty: false });
    } else {
      setValueAny("start_date", "", { shouldDirty: false });
      setValueAny("start_time", "", { shouldDirty: false });
    }

    if (data?.end_time) {
      const [ed, et] = String(data.end_time).split(" ");
      setValueAny("end_date", ed ?? "", { shouldDirty: false });
      setValueAny("end_time", et ?? "", { shouldDirty: false });
    } else {
      setValueAny("end_date", "", { shouldDirty: false });
      setValueAny("end_time", "", { shouldDirty: false });
    }

    setValueAny("discount_type", data?.discount_type ?? "", { shouldDirty: false, shouldValidate: true });
    setValueAny("discount_amount", Number(data?.discount_amount ?? 0), { shouldDirty: false, shouldValidate: true });
    setValueAny("purchase_limit", data?.purchase_limit ? String(data.purchase_limit) : "", { shouldDirty: false });

    (COLOR_FIELDS as readonly { key: ColorFieldKey }[]).forEach((f) => {
      setValueAny(f.key, data?.[f.key] ?? "", { shouldDirty: false });
    });

    if (data?.cover_image) {
      setLastSelectedImages({
        image_id: data.cover_image,
        img_url: data?.cover_image_url ? data.cover_image_url : "/images/no-image.png",
        name: "cover image",
      });
    } else {
      setLastSelectedImages(null);
    }

    if (data?.image) {
      setLastSelectedLogo({
        image_id: data.image,
        img_url: data?.image_url ? data.image_url : "/images/no-image.png",
        name: "flash deals image",
      });
    } else {
      setLastSelectedLogo(null);
    }

    setImagesErrorMessage("");
    setLogoErrorMessage("");

    const rawRelated = data?.related_translations;
    const normalizedTranslations = Array.isArray(data?.translations)
      ? data.translations
      : rawRelated && typeof rawRelated === "object"
        ? Object.keys(rawRelated).map((lang) => ({
            language_code: lang,
            title: rawRelated?.[lang]?.title ?? "",
            description: rawRelated?.[lang]?.description ?? "",
            button_text: rawRelated?.[lang]?.button_text ?? "",
          }))
        : [];

    const normalizedEditData = { ...data, translations: normalizedTranslations };

    const dbJson = data?.translations_json;
    if (dbJson && typeof dbJson === "object") {
      onJsonChange(dbJson);
    } else {
      initI18nFlatFormFromEntity({
        editData: normalizedEditData,
        firstUILangId,
        uiLangs,
        i18nFields: I18N_FIELDS,
        setValueAny,
        entityFieldMap: {
          title: "title",
          description: "description",
          button_text: "button_text",
        },
        after: rebuildJsonNow,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, firstUILangId]);

  // css vars
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.style.setProperty("--title-color", watchedColors.title_color || "#000000");
    root.style.setProperty("--description-color", watchedColors.description_color || "#000000");
    root.style.setProperty("--button-text-color", watchedColors.button_text_color || "#ffffff");
    root.style.setProperty("--button-color", watchedColors.button_bg_color || "#1153eb");
    root.style.setProperty("--button-hover-color", watchedColors.button_hover_color || "#0d47a1");
    root.style.setProperty("--background-color", watchedColors.background_color || "#0a3eb5");
    root.style.setProperty("--timer-bg-color", watchedColors.timer_bg_color || "#0a3eb5");
    root.style.setProperty("--timer-text-color", watchedColors.timer_text_color || "#0a3eb5");
  }, [watchedColors]);

  // images validation
  const handleSaveImages = (images: UploadedImage[]) => {
    setLastSelectedImages(images?.[0] ?? null);

    const dimensions = images?.[0]?.dimensions ?? "";
    const [width, height] = String(dimensions).split(" x ").map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width && height ? width / height : 0;

    if (Math.abs(aspectRatio - 4 / 1) < 0.01) {
      setImagesErrorMessage("");
      return true;
    }
    setImagesErrorMessage("Image must have a 4:1 aspect ratio.");
    return false;
  };

  const removePreview = () => {
    setLastSelectedImages(null);
    setImagesErrorMessage("");
  };

  const handleSaveLogo = (images: UploadedImage[]) => {
    setLastSelectedLogo(images?.[0] ?? null);

    const dimensions = images?.[0]?.dimensions ?? "";
    const [width, height] = String(dimensions).split(" x ").map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width && height ? width / height : 0;

    if (Math.abs(aspectRatio - 1 / 1) < 0.01) {
      setLogoErrorMessage("");
      return true;
    }
    setLogoErrorMessage("Image must have a 1:1 aspect ratio.");
    return false;
  };

  const removeLogo = () => {
    setLastSelectedLogo(null);
    setLogoErrorMessage("");
  };

  // hooks
  const storeHook = useFlashDealsStoreMutation() as any;
  const updateHook = useFlashDealsUpdateMutation() as any;
  const isSaving = !!storeHook?.isPending || !!updateHook?.isPending;

  // submit
  const onSubmit = async (values: FlashDealsFormData) => {
    const v: any = values as any;

    // schema-required: discount_type + discount_amount
    if (!safeStr(v.discount_type)) {
      toast.error("Discount type is required!");
      return;
    }
    if (Number(v.discount_amount ?? 0) < 1) {
      toast.error("Discount amount is required!");
      return;
    }

    const openingTime = `${safeStr(v.start_date)} ${safeStr(v.start_time) || "00:00:00"}`.trim();
    const closingTime = `${safeStr(v.end_date)} ${safeStr(v.end_time) || "00:00:00"}`.trim();

    const idsArray = (selectedProducts || [])
      .map((item) => item.value)
      .filter((x) => typeof x === "number" && Number.isFinite(x));

    if (idsArray.length < 1) {
      toast.error("At least one product must be selected!");
      return;
    }
    if (!safeStr(v.start_time) || !safeStr(v.end_time)) {
      toast.error("Both start time and end time are required!");
      return;
    }

    const startDate = new Date(openingTime);
    const endDate = new Date(closingTime);
    if (startDate > endDate) {
      toast.error("Start time cannot be greater than end time!");
      return;
    }

    // Root fields MUST come from df — fallback if empty
    const rootTitle = safeStr(v?.title_df);
    const rootDesc = safeStr(v?.description_df);
    const rootBtn = safeStr(v?.button_text_df);

    const fallbackLang = uiLangs.find((l) => hasAnyI18nValue(v, l.id))?.id ?? firstUILangId;

    const finalTitle = rootTitle || safeStr(v?.[`title_${fallbackLang}`]);
    const finalDesc = rootDesc || safeStr(v?.[`description_${fallbackLang}`]);
    const finalBtn = rootBtn || safeStr(v?.[`button_text_${fallbackLang}`]);

    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== firstUILangId)
      .filter((lang) => hasAnyI18nValue(v, lang.id))
      .map((lang) => ({
        language_code: lang.id,
        title: safeStr(v?.[`title_${lang.id}`]),
        description: safeStr(v?.[`description_${lang.id}`]),
        button_text: safeStr(v?.[`button_text_${lang.id}`]),
      }));

    const builtJson = buildI18nJsonFromFlatValues({
      values: v,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });

    const coverId = lastSelectedImages?.image_id ?? "";
    const imgId = lastSelectedLogo?.image_id ?? "";

    // ✅ payload: global fields are included + images dual keys for backend compatibility
    const payload: any = {
      id: data?.id,

      title: finalTitle,
      description: finalDesc,
      button_text: finalBtn,

      title_df: v?.title_df,
      description_df: v?.description_df,
      button_text_df: v?.button_text_df,

      discount_type: v?.discount_type,
      discount_amount: Number(v?.discount_amount ?? 0),

      store_type: v?.store_type,
      store_id: v?.store_id,

      purchase_limit: v?.purchase_limit,

      start_time: safeStr(v.start_date) === "" ? "" : openingTime,
      end_time: safeStr(v.end_date) === "" ? "" : closingTime,

      product_ids: idsArray,

      title_color: v?.title_color,
      description_color: v?.description_color,
      background_color: v?.background_color,
      button_text_color: v?.button_text_color,
      button_bg_color: v?.button_bg_color,
      button_hover_color: v?.button_hover_color,
      timer_bg_color: v?.timer_bg_color,
      timer_text_color: v?.timer_text_color,

      // images
      cover_image: coverId,
      cover_image_id: coverId,
      image: imgId,
      image_id: imgId,

      translations,
      translations_json: ensureLangKeys(builtJson, uiLangs),
    };

    try {
      if (data?.id > 0) {
        await (updateHook?.mutateAsync
          ? updateHook.mutateAsync(payload)
          : new Promise((resolve, reject) =>
              updateHook.mutate(payload, { onSuccess: resolve, onError: reject })
            ));

        toast.success(t("common.updated_successfully") ?? "Updated successfully!");
      } else {
        await (storeHook?.mutateAsync
          ? storeHook.mutateAsync(payload)
          : new Promise((resolve, reject) =>
              storeHook.mutate(payload, { onSuccess: resolve, onError: reject })
            ));

        toast.success(t("common.created_successfully") ?? "Created successfully!");
        reset();
        setSelectedProducts([]);
      }

      dispatch(setRefetch(true));
    } catch (e) {
      console.error("FlashDeals submit failed:", e);
      toast.error(t("common.something_went_wrong") ?? "Something went wrong!");
    }
  };

  const triggerCover = (
    <div className="hover:cursor-pointer">
      {lastSelectedImages?.img_url ? (
        <div className="relative w-48 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedImages?.img_url}
            alt={String(lastSelectedImages?.name ?? "cover")}
            fill
            sizes="192px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t("common.change_image")}</p>
          </div>
        </div>
      ) : (
        <div className="border-2 w-48 h-32 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <CloudIcon />
          <p className="mt-4 text-blue-500 text-sm font-medium p-1">{t("common.drag_and_drop")}</p>
        </div>
      )}
    </div>
  );

  const triggerThumb = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={String(lastSelectedLogo?.name ?? "thumb")}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t("common.change_image")}</p>
          </div>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <CloudIcon />
          <p className="mt-4 text-blue-500 text-sm font-medium p-1">{t("common.drag_and_drop")}</p>
        </div>
      )}
    </div>
  );

  const customStyles = {
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#e5e7eb" : state.isFocused ? "#f3f4f6" : "",
      color: "#000",
      padding: "10px",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
    }),
  };

  const isEdit = !!(data?.id && data?.id > 0);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Hidden df fields */}
        <input type="hidden" {...register("title_df" as any)} />
        <input type="hidden" {...register("description_df" as any)} />
        <input type="hidden" {...register("button_text_df" as any)} />

        {/* View toggle */}
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {isEdit ? t("button.update_flash_deals") : t("button.add_flash_deals")}
            </div>

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
          </CardContent>
        </Card>

        {/* DF errors */}
        {(errors as any)?.title_df?.message ? (
          <Card className="mt-4">
            <CardContent className="p-3">
              <p className="text-red-600 text-sm">{String((errors as any)?.title_df?.message)}</p>
            </CardContent>
          </Card>
        ) : null}

        {/* JSON */}
        {viewMode === "json" ? (
          <Card className="rounded-lg border-none mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Flash Deals JSON"
                languages={uiLangs}
                value={ensureLangKeys(translationsJson, uiLangs)}
                onChange={onJsonChange}
                perLanguage
                showAllTab
                helperText={
                  <span>
                    Alanlar: <code>title</code>, <code>description</code>, <code>button_text</code>.
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-0 xl:gap-4">
              {/* LEFT */}
              <Card className="col-span-2 mt-4">
                <CardContent className="p-2 md:p-6">
                  <h1 className="text-lg md:text-2xl font-medium mb-4">{t("label.basic_information")}</h1>

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
                              <p className="text-sm font-medium mb-1">
                                {t("label.title")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                              </p>
                              <Input {...register(`title_${lang.id}` as any)} className="app-input" />
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1">
                                {t("label.description")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                              </p>
                              <Textarea {...register(`description_${lang.id}` as any)} className="app-input" />
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1">
                                {t("label.button_title")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                              </p>
                              <Input {...register(`button_text_${lang.id}` as any)} className="app-input" />
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </div>
                  </Tabs>

                  {/* GLOBAL IMAGES */}
                  <div className="mt-6 flex flex-col md:flex-row items-start gap-6">
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2 mb-1">
                        <span>{t("label.bg_image")}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-custom-dark-blue w-96">
                              <p className="p-1 text-sm font-medium">{t("tooltip.aspect_ratio_4_1")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="relative w-48">
                        <PhotoUploadModal
                          trigger={triggerCover}
                          isMultiple={false}
                          onSave={handleSaveImages}
                          usageType="flash_deals"
                          selectedImage={lastSelectedImages}
                        />
                        {lastSelectedImages?.image_id ? (
                          <Cancel
                            customClass="absolute top-0 right-0 m-1"
                            onClick={(e: { stopPropagation: () => void }) => {
                              e.stopPropagation();
                              removePreview();
                            }}
                          />
                        ) : null}
                        {errorImagesMessage ? <p className="text-red-500 text-sm mt-1">{errorImagesMessage}</p> : null}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium flex items-center gap-2 mb-1">
                        <span>{t("label.thumbnail")}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-custom-dark-blue w-96">
                              <p className="p-1 text-sm font-medium">{t("tooltip.aspect_ratio_1_1")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="relative w-32">
                        <PhotoUploadModal
                          trigger={triggerThumb}
                          isMultiple={false}
                          onSave={handleSaveLogo}
                          usageType="flash_deals"
                          selectedImage={lastSelectedLogo}
                        />
                        {lastSelectedLogo?.image_id ? (
                          <Cancel
                            customClass="absolute top-0 right-0 m-1"
                            onClick={(e: { stopPropagation: () => void }) => {
                              e.stopPropagation();
                              removeLogo();
                            }}
                          />
                        ) : null}
                        {errorLogoMessage ? <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p> : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* RIGHT: discount + validity */}
              <div className="col-span-1 grid grid-cols-1">
                <Card className="mt-4">
                  <CardContent className="p-2 md:p-6">
                    <h1 className="text-lg md:text-2xl font-medium mb-4">{t("label.product_validity")}</h1>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium mb-1">{t("label.opening_date")}</p>
                        <div className="grid grid-cols-3 items-center gap-2">
                          <div className="col-span-2">
                            <Controller
                              name="start_date"
                              control={control}
                              render={({ field }) => (
                                <CustomSingleDatePicker
                                  label=""
                                  selectedDate={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                                  onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                />
                              )}
                            />
                          </div>
                          <Input type="time" {...register("start_time" as any)} className="app-input" />
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">{t("label.expire_date")}</p>
                        <div className="grid grid-cols-3 items-center gap-2">
                          <div className="col-span-2">
                            <Controller
                              name="end_date"
                              control={control}
                              render={({ field }) => {
                                const parsedStartDate = watchedStartDate
                                  ? startOfDay(parse(watchedStartDate, "yyyy-MM-dd", new Date()))
                                  : null;

                                const today = startOfDay(new Date());
                                let minDate = today;
                                if (parsedStartDate && parsedStartDate > today) minDate = parsedStartDate;

                                return (
                                  <CustomSingleDatePicker
                                    label=""
                                    selectedDate={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null}
                                    onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                    minDate={minDate}
                                  />
                                );
                              }}
                            />
                          </div>
                          <Input type="time" {...register("end_time" as any)} className="app-input" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardContent className="p-2 md:p-6">
                    <h1 className="text-lg md:text-2xl font-medium mb-4">{t("label.setup_discount")}</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium mb-1">{t("label.discount_type")}</p>
                        <Controller
                          control={control}
                          name="discount_type"
                          render={({ field }) => (
                            <AppSelect
                              value={String(field.value ?? "")}
                              onSelect={(value) => field.onChange(String(value))}
                              groups={DiscountTypeList}
                              hideNone
                            />
                          )}
                        />
                        {(errors as any)?.discount_type?.message ? (
                          <p className="text-red-500 text-sm mt-1">{String((errors as any)?.discount_type?.message)}</p>
                        ) : null}
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">
                          {t("label.discount")}{" "}
                          {watchedDiscountType ? `( ${watchedDiscountType === "percentage" ? "%" : "$"} )` : ""}
                        </p>

                        {/* ✅ discount_amount MUST be Controller => number state */}
                        <Controller
                          control={control}
                          name="discount_amount"
                          render={({ field }) => (
                            <Input
                              type="number"
                              disabled={!watchedDiscountType}
                              className="app-input"
                              placeholder={t("place_holder.enter_discount")}
                              value={Number(field.value ?? 0)}
                              onChange={(e) => {
                                const n = Number(e.target.value);
                                const clamped =
                                  watchedDiscountType === "percentage" ? Math.min(100, Math.max(0, n)) : Math.max(0, n);
                                field.onChange(clamped);
                              }}
                            />
                          )}
                        />

                        {(errors as any)?.discount_amount?.message ? (
                          <p className="text-red-500 text-sm mt-1">
                            {String((errors as any)?.discount_amount?.message)}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">{t("label.purchase_limit")}</p>
                        <Input {...register("purchase_limit" as any)} className="app-input" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Products */}
            <Card className="mt-4">
              <CardContent className="p-2 md:p-6">
                <h1 className="text-lg md:text-2xl font-medium mb-4">{t("label.choose_products")}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8 mb-4">
                  {ProductFilterList?.map((option: any) => (
                    <StoreTypeCard
                      key={option.id}
                      isSelected={selectedPaymentOption === option.id}
                      onClick={() => handleCardClick(option.id)}
                      imageSrc={option?.image_url}
                      title={option.label}
                    />
                  ))}
                </div>

                {selectedPaymentOption === "2" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1 mb-4">
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.store_type")}</p>
                      <Controller
                        control={control}
                        name="store_type"
                        render={({ field }) => (
                          <AppSelect
                            value={field.value || ""}
                            onSelect={(value) => field.onChange(String(value))}
                            groups={StoreTypeData}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.store")}</p>
                      <Controller
                        control={control}
                        name="store_id"
                        render={({ field }) => (
                          <AppSelect
                            value={field.value || ""}
                            onSelect={(value) => field.onChange(String(value))}
                            groups={TypeWiseStoreData}
                          />
                        )}
                      />
                    </div>
                  </div>
                ) : null}

                <Select
                  isMulti
                  options={StoreWiseProductData}
                  styles={customStyles as any}
                  classNamePrefix="select"
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  value={selectedProducts}
                  onChange={onChangeMultiSelect as any}
                  getOptionLabel={(option: any) => (option?.label ? String(option.label).split(" | ")[0] : "")}
                  formatOptionLabel={(option: any, { context }: any) => (
                    <div className="flex items-center justify-between">
                      <span>{context === "menu" ? option?.label ?? "" : option?.label?.split(" | ")[0] ?? ""}</span>
                      {context === "menu" && selectedProducts.some((attr) => attr.value === option.value) ? (
                        <Check className="w-4 h-4 text-blue-500" />
                      ) : null}
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Save bar */}
        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={data}
            IsLoading={isSaving}
            AddLabel={t("button.add_flash_deals")}
            UpdateLabel={t("button.update_flash_deals")}
          />
        </Card>
      </form>
    </div>
  );
}
