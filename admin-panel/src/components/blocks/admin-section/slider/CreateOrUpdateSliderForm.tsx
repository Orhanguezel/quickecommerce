// =============================================================
// File: src/components/blocks/admin-section/slider/CreateOrUpdateSliderForm.tsx
// FINAL — Slider Form (Form + JSON) — SAME PATTERN as TagForm (DF + JSON Scaffold)
// - DF contract: title_df/sub_title_df/description_df/button_text_df => hidden register + dfSync
// - Root language dynamic (firstUILangId), df excluded from language tabs
// - View mode: form | json (JSON panel uses AdminI18nJsonPanel)
// - Edit init deterministic via initI18nFlatFormFromEntity + robust translations pick
// - NO whole-form watch: only color fields watched
// - Submit payload: root from DF (fallback firstUILangId), translations[] exclude firstUILangId
// - payload includes dual keys: image+image_id, bg_image+bg_image_id
// =============================================================

"use client";

import React, { useEffect, useMemo, useState } from "react";
import multiLang from "@/components/molecules/multiLang.json";
import { AppSelect } from "@/components/blocks/common";
import { SubmitButton } from "@/components/blocks/shared";
import PhotoUploadModal, { type UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";

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
} from "@/components/ui";

import CloudIcon from "@/assets/icons/CloudIcon";
import Cancel from "@/components/blocks/custom-icons/Cancel";
import {
  useSliderStoreMutation,
  useSliderUpdateMutation,
} from "@/modules/admin-section/slider/slider.action";
import { SliderFormData, sliderSchema } from "@/modules/admin-section/slider/slider.schema";

import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HexColorPicker } from "react-colorful";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import GlobalImageLoader from "@/lib/imageLoader";

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


// i18n json fields
const I18N_FIELDS = ["title", "sub_title", "description", "button_text"] as const;

const StatusList = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "0" },
];

const PlatformList = [
  { label: "Web", value: "web" },
  { label: "Mobile", value: "mobile" },
];

const COLOR_FIELDS = [
  { key: "title_color", label: "Title Color", btnClass: "dynamic-title-color" },
  { key: "sub_title_color", label: "Sub Title Color", btnClass: "dynamic-sub-title-color" },
  { key: "description_color", label: "Description Color", btnClass: "dynamic-description-color" },
  { key: "button_text_color", label: "Button Text Color", btnClass: "dynamic-button-text-color" },
  { key: "button_bg_color", label: "Button BG Color", btnClass: "dynamic-button-color" },
  { key: "button_hover_color", label: "Button Hover Color", btnClass: "dynamic-button-hover-color" },
  { key: "bg_color", label: "Background Color", btnClass: "dynamic-background-color" },
] as const;

type ColorFieldKey = (typeof COLOR_FIELDS)[number]["key"];

function safeStr(x: any) {
  return String(x ?? "").trim();
}

function hasAnyI18nValue(values: any, langId: string) {
  const v = values ?? {};
  const a = safeStr(v?.[`title_${langId}`]);
  const b = safeStr(v?.[`sub_title_${langId}`]);
  const c = safeStr(v?.[`button_text_${langId}`]);
  const d = safeStr(v?.[`description_${langId}`]);
  return !!(a || b || c || d);
}

// Slider translations may come from different keys
function pickTranslationsBlock(editData: any) {
  return (
    editData?.translations ??
    editData?.related_translations ??
    editData?.relatedTranslations ??
    editData?.translations_data ??
    editData?.translation ??
    null
  );
}

export default function CreateOrUpdateSliderForm({ data }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const dir = locale === "ar" ? "rtl" : "ltr";

  const editData = (data?.data ?? data?.slider ?? data) as any;
  const isEdit = !!(editData && (editData?.id || editData?.id === 0));

  const [viewMode, setViewMode] = useState<ViewMode>("form");

  // all languages (including df in source) → scaffold excludes df
  const allLangs = useMemo(() => (Array.isArray(multiLang) ? (multiLang as any[]) : []), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
    getValues,
  } = useForm<SliderFormData>({
    resolver: zodResolver(sliderSchema),
    defaultValues: {
      // DF contract
      title_df: "",
      sub_title_df: "",
      description_df: "",
      button_text_df: "",

      // globals
      platform: "",
      order: "",
      status: "1",
      button_url: "",
      redirect_url: "",

      // colors
      title_color: "#1E3A8A",
      sub_title_color: "#2563EB",
      description_color: "#3B82F6",
      button_text_color: "#ffff",
      button_bg_color: "#1153eb",
      button_hover_color: "#2563EB",
      bg_color: "#E0F7FA",
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<SliderFormData>(setValue), [setValue]);

  // ✅ Scaffold (same as TagForm)
  const i18n = useFormI18nScaffold<SliderFormData>({
    languages: allLangs,
    excludeLangIds: ["df"],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: "title_df", srcField: (l) => `title_${l}`, validate: true },
        { dfField: "sub_title_df", srcField: (l) => `sub_title_${l}`, validate: false },
        { dfField: "description_df", srcField: (l) => `description_${l}`, validate: false },
        { dfField: "button_text_df", srcField: (l) => `button_text_${l}`, validate: false },
      ],
    },
    // keep sync context minimal (no whole-form watch)
    extraWatchNames: [
      "platform",
      "order",
      "status",
      "button_url",
      "redirect_url",
      ...COLOR_FIELDS.map((x) => x.key),
    ],
  });

  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    handleTranslationsJsonChange,
    rebuildJsonNow,
  } = i18n;

  // ✅ controlled Tabs (fix Radix defaultValue issue)
  const [activeLangId, setActiveLangId] = useState<string>(() => {
    const fromLocale = uiLangs.find((l) => l.id === locale)?.id;
    return fromLocale ?? uiLangs?.[0]?.id ?? "tr";
  });

  // ensure active is valid when languages/locale changes
  useEffect(() => {
    const exists = uiLangs.some((l) => l.id === activeLangId);
    if (!exists) setActiveLangId(uiLangs?.[0]?.id ?? "tr");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLangs.map((l) => l.id).join("|")]);

  // ✅ minimal watch: only colors (no whole form)
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

  const setColor = (key: ColorFieldKey, value: string) => {
    setValueAny(key, value, { shouldValidate: true, shouldDirty: true });
  };

  // images
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>("");
  const [lastSelectedBG, setLastSelectedBG] = useState<any>(null);
  const [errorBGMessage, setBGErrorMessage] = useState<string>("");

  // css vars
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    root.style.setProperty("--title-color", watchedColors.title_color || "#000000");
    root.style.setProperty("--sub-title-color", watchedColors.sub_title_color || "#000000");
    root.style.setProperty("--description-color", watchedColors.description_color || "#000000");
    root.style.setProperty("--button-text-color", watchedColors.button_text_color || "#ffffff");
    root.style.setProperty("--button-color", watchedColors.button_bg_color || "#1153eb");
    root.style.setProperty("--button-hover-color", watchedColors.button_hover_color || "#0d47a1");
    root.style.setProperty("--background-color", watchedColors.bg_color || "#E0F7FA");
  }, [watchedColors]);

  // image validations
  const handleSaveLogo = (images: UploadedImage[]) => {
    const img = images?.[0];
    setLastSelectedLogo(img ?? null);

    const dimensions = img?.dimensions ?? "";
    const [width, height] = String(dimensions)
      .split(" x ")
      .map((d) => parseInt(d.trim(), 10));
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

  const handleSaveBG = (images: UploadedImage[]) => {
    const img = images?.[0];
    setLastSelectedBG(img ?? null);

    const dimensions = img?.dimensions ?? "";
    const [width, height] = String(dimensions)
      .split(" x ")
      .map((d) => parseInt(d.trim(), 10));
    const aspectRatio = width && height ? width / height : 0;

    if (Math.abs(aspectRatio - 4 / 1) < 0.01) {
      setBGErrorMessage("");
      return true;
    }
    setBGErrorMessage("Image must have a 4:1 aspect ratio.");
    return false;
  };

  const removeBG = () => {
    setLastSelectedBG(null);
    setBGErrorMessage("");
  };

  // -----------------------------
  // Init (editData -> form + JSON)
  // -----------------------------
  useEffect(() => {
    // CREATE
    if (!isEdit) {
      // set active tab from locale if possible
      const fromLocale = uiLangs.find((l) => l.id === locale)?.id;
      setActiveLangId(fromLocale ?? firstUILangId);

      // ensure json matches initial snapshot
      rebuildJsonNow();
      return;
    }

    // 1) globals (deterministic)
    const nextGlobals: any = {
      platform: editData?.platform != null ? String(editData.platform) : "",
      order: editData?.order != null ? String(editData.order) : "",
      status: editData?.status != null ? String(editData.status) : "1",
      button_url: editData?.button_url ?? "",
      redirect_url: editData?.redirect_url ?? "",

      title_color: editData?.title_color ?? getValues("title_color"),
      sub_title_color: editData?.sub_title_color ?? getValues("sub_title_color"),
      description_color: editData?.description_color ?? getValues("description_color"),
      button_text_color: editData?.button_text_color ?? getValues("button_text_color"),
      button_bg_color: editData?.button_bg_color ?? getValues("button_bg_color"),
      button_hover_color: editData?.button_hover_color ?? getValues("button_hover_color"),
      bg_color: editData?.bg_color ?? getValues("bg_color"),
    };

    // We reset only globals + df defaults to avoid partial/old remnants;
    // i18n fields set via init helper below.
    reset(
      {
        ...(getValues() as any),
        ...nextGlobals,
        // DF roots (will be synced anyway)
        title_df: safeStr(editData?.title),
        sub_title_df: safeStr(editData?.sub_title),
        description_df: safeStr(editData?.description),
        button_text_df: safeStr(editData?.button_text),
      } as any,
      { keepDefaultValues: true },
    );

    // 2) i18n: root -> firstUILangId + translations
    const picked = pickTranslationsBlock(editData);
    const editLike = { ...editData, translations: picked };

    initI18nFlatFormFromEntity({
      editData: editLike,
      firstUILangId,
      uiLangs,
      i18nFields: I18N_FIELDS,
      setValueAny,
      // slider root field names already match: title/sub_title/description/button_text
      after: () => {
        // choose best tab:
        // 1) locale if exists
        // 2) first lang with content
        // 3) firstUILangId
        const snap = getValues() as any;
        const localeTab =
          uiLangs.some((l) => l.id === locale) && hasAnyI18nValue(snap, locale) ? locale : null;

        const langWithContent =
          uiLangs.find((l) => hasAnyI18nValue(snap, l.id))?.id ?? null;

        setActiveLangId(localeTab ?? langWithContent ?? firstUILangId);

        // rebuild json from initialized form snapshot
        rebuildJsonNow();
      },
    });

    // 3) images
    if (editData?.image) {
      setLastSelectedLogo({
        image_id: editData.image,
        img_url: editData?.image_url ? editData.image_url : "/images/no-image.png",
        name: "image",
      });
    } else {
      setLastSelectedLogo(null);
    }

    if (editData?.bg_image) {
      setLastSelectedBG({
        image_id: editData.bg_image,
        img_url: editData?.bg_image_url ? editData.bg_image_url : "/images/no-image.png",
        name: "bg_image",
      });
    } else {
      setLastSelectedBG(null);
    }

    setLogoErrorMessage("");
    setBGErrorMessage("");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editData?.id, firstUILangId]);

  // ✅ When switching to JSON mode: rebuild from latest form snapshot (same pattern as TagForm)
  useEffect(() => {
    if (viewMode !== "json") return;
    rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // -----------------------------
  // Submit
  // -----------------------------
  const { mutate: SliderStore, isPending: isSliderPending } = useSliderStoreMutation();
  const { mutate: SliderUpdate, isPending: isSliderUpdating } = useSliderUpdateMutation();

  const onSubmit = async (values: SliderFormData) => {
    const v: any = values as any;

    if (safeStr(v.order) === "") {
      toast.error(t("toast.order_is_required"));
      return;
    }

    // ✅ root must come from DF + fallback firstUILangId
    const rootTitle = safeStr(v.title_df) || safeStr(v?.[`title_${firstUILangId}`]);
    if (!rootTitle || rootTitle.length < 2) {
      toast.error("Slider title is required!");
      return;
    }

    const defaultData: any = {
      title: rootTitle,
      sub_title: safeStr(v.sub_title_df) || safeStr(v?.[`sub_title_${firstUILangId}`]),
      button_text: safeStr(v.button_text_df) || safeStr(v?.[`button_text_${firstUILangId}`]),
      description: safeStr(v.description_df) || safeStr(v?.[`description_${firstUILangId}`]),

      // DF contract
      title_df: v.title_df,
      sub_title_df: v.sub_title_df,
      button_text_df: v.button_text_df,
      description_df: v.description_df,

      button_url: v.button_url,
      redirect_url: v.redirect_url,
      platform: v.platform,
      order: Number(v.order),
      status: v.status,

      // colors
      title_color: v.title_color,
      sub_title_color: v.sub_title_color,
      button_text_color: v.button_text_color,
      description_color: v.description_color,
      button_bg_color: v.button_bg_color,
      button_hover_color: v.button_hover_color,
      bg_color: v.bg_color,
    };

    // legacy translations[]: exclude firstUILangId, only include meaningful rows
    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== firstUILangId)
      .filter((lang) => hasAnyI18nValue(v, lang.id))
      .map((lang) => ({
        language_code: lang.id,
        title: safeStr(v?.[`title_${lang.id}`]),
        sub_title: safeStr(v?.[`sub_title_${lang.id}`]),
        button_text: safeStr(v?.[`button_text_${lang.id}`]),
        description: safeStr(v?.[`description_${lang.id}`]),
      }));

    const imageId = lastSelectedLogo?.image_id ?? "";
    const bgId = lastSelectedBG?.image_id ?? "";

    // ✅ translations_json: always use scaffold snapshot (no drift)
    // IMPORTANT: keep it pure i18n map (no meta) unless backend requires meta
    const translations_json = safeObject(translationsJson);

    const submissionData: any = {
      ...defaultData,
      id: isEdit ? editData?.id : 0,

      image: imageId,
      image_id: imageId,
      bg_image: bgId,
      bg_image_id: bgId,

      translations,
      translations_json,
    };

    const mutateFn = isEdit ? SliderUpdate : SliderStore;

    return mutateFn(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          toast.success(isEdit ? "Updated successfully!" : "Created successfully!");
          reset();
          dispatch(setRefetch(true));
        },
        onError: () => {
          toast.error(t("common.something_went_wrong") ?? "Something went wrong!");
        },
      },
    );
  };

  // -----------------------------
  // Render helpers
  // -----------------------------
  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={String(lastSelectedLogo?.name ?? "image")}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded"
            priority
            loading="eager"
          />
          <div className="py-2 absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t("common.change_image")}</p>
          </div>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <CloudIcon />
          <p className="mt-2 text-blue-500 text-xs font-medium">{t("common.drag_and_drop")}</p>
        </div>
      )}
    </div>
  );

  const triggerBG = (
    <div className="hover:cursor-pointer">
      {lastSelectedBG?.img_url ? (
        <div className="relative w-48 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedBG?.img_url}
            alt={String(lastSelectedBG?.name ?? "bg_image")}
            fill
            sizes="192px"
            className="w-full h-full border dark:border-gray-500 rounded"
            priority
            loading="eager"
          />
          <div className="py-2 absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t("common.change_image")}</p>
          </div>
        </div>
      ) : (
        <div className="w-48 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <CloudIcon />
          <p className="mt-2 text-blue-500 text-xs font-medium">{t("common.drag_and_drop")}</p>
        </div>
      )}
    </div>
  );

  // -----------------------------
  // JSX
  // -----------------------------
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ DF hidden required by schema */}
        <input type="hidden" {...register("title_df" as any)} />
        <input type="hidden" {...register("sub_title_df" as any)} />
        <input type="hidden" {...register("description_df" as any)} />
        <input type="hidden" {...register("button_text_df" as any)} />

        {/* Toggle header (same style as TagForm) */}
        <Card className="mt-2">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {isEdit ? t("button.update_slider") : t("button.add_slider")}
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

        {/* DF error surface (like TagForm) */}
        {(errors as any)?.title_df?.message ? (
          <Card className="mt-4">
            <CardContent className="p-3">
              <p className="text-red-600 text-sm">{String((errors as any)?.title_df?.message)}</p>
            </CardContent>
          </Card>
        ) : null}

        {viewMode === "json" ? (
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Slider JSON"
                languages={uiLangs}
                value={translationsJson}
                onChange={(next) => handleTranslationsJsonChange(next)}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    JSON format:{" "}
                    <code>
                      {
                        "{ tr: { title, sub_title, description, button_text }, en: { ... } }"
                      }
                    </code>
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* BASIC + I18N */}
            <Card className="mt-4">
              <CardContent className="p-2 md:p-6">
                <h1 className="text-lg md:text-2xl font-medium mb-4">{t("common.basic_information")}</h1>

                {/* ✅ CONTROLLED Tabs */}
                <Tabs
                  value={activeLangId}
                  onValueChange={(v) => setActiveLangId(String(v))}
                  className="col-span-2"
                >
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
                            <Input
                              {...register(`title_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t("place_holder.enter_title")}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t("label.sub_title")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </p>
                            <Input
                              {...register(`sub_title_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t("place_holder.enter_sub_title")}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t("label.description")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </p>
                            <Textarea
                              {...register(`description_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t("place_holder.enter_description")}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t("label.button_text")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </p>
                            <Input
                              {...register(`button_text_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t("place_holder.enter_button_text")}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            {/* GLOBAL MEDIA + COLORS */}
            <Card className="mt-4">
              <CardContent className="p-2 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="col-span-3">
                    <p className="text-sm font-medium mb-1">{t("label.platform")}</p>
                    <Controller
                      control={control}
                      name="platform"
                      render={({ field }) => (
                        <AppSelect
                          value={String(field.value ?? "")}
                          onSelect={(value) => field.onChange(String(value))}
                          groups={PlatformList}
                          hideNone
                        />
                      )}
                    />
                    {(errors as any)?.platform?.message ? (
                      <p className="text-red-500 text-sm mt-1">
                        {String((errors as any)?.platform?.message)}
                      </p>
                    ) : null}
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm font-medium mb-1">{t("label.order")}</p>
                    <Input type="number" min={0} {...register("order" as any)} className="app-input" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                  <div className="flex items-start gap-4 col-span-3">
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.slider_image")}</p>
                      <div className="w-32 relative">
                        <PhotoUploadModal
                          trigger={triggerLogo}
                          isMultiple={false}
                          onSave={handleSaveLogo}
                          usageType="slider"
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
                        {errorLogoMessage ? (
                          <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.slider_bg_image")}</p>
                      <div className="w-48 relative">
                        <PhotoUploadModal
                          trigger={triggerBG}
                          isMultiple={false}
                          onSave={handleSaveBG}
                          usageType="slider"
                          selectedImage={lastSelectedBG}
                        />
                        {lastSelectedBG?.image_id ? (
                          <Cancel
                            customClass="absolute top-0 right-0 m-1"
                            onClick={(e: { stopPropagation: () => void }) => {
                              e.stopPropagation();
                              removeBG();
                            }}
                          />
                        ) : null}
                        {errorBGMessage ? (
                          <p className="text-red-500 text-sm mt-1">{errorBGMessage}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm font-medium mb-1">{t("label.bg_color")}</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button className="w-12 h-10 rounded-md border dynamic-background-color" />
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-4 flex flex-col items-center gap-2">
                        <HexColorPicker
                          color={watchedColors.bg_color}
                          onChange={(c) => setColor("bg_color", c)}
                        />
                        <Input
                          type="text"
                          value={watchedColors.bg_color}
                          onChange={(e) => setColor("bg_color", e.target.value)}
                          className="app-input w-full"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 mt-6">
                  {COLOR_FIELDS.filter((x) => x.key !== "bg_color").map((item) => (
                    <div key={item.key} className="grid grid-cols-5 items-center">
                      <p className="col-span-3 text-sm font-medium mb-1">{item.label}</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button className={`w-12 h-10 rounded-md border ${item.btnClass}`} />
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-4 flex flex-col items-center gap-2">
                          <HexColorPicker
                            color={watchedColors[item.key]}
                            onChange={(c) => setColor(item.key, c)}
                          />
                          <Input
                            type="text"
                            value={watchedColors[item.key]}
                            onChange={(e) => setColor(item.key, e.target.value)}
                            className="app-input w-full"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* GLOBAL URL + STATUS */}
            <Card className="mt-4">
              <CardContent className="p-2 md:p-6">
                <h1 className="text-lg md:text-2xl font-medium mb-4">{t("common.order_url")}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">{t("label.button_url")}</p>
                    <Input {...register("button_url" as any)} className="app-input" />
                    {(errors as any)?.button_url?.message ? (
                      <p className="text-red-500 text-sm mt-1">
                        {String((errors as any)?.button_url?.message)}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">{t("label.redirect_url")}</p>
                    <Input {...register("redirect_url" as any)} className="app-input" />
                    {(errors as any)?.redirect_url?.message ? (
                      <p className="text-red-500 text-sm mt-1">
                        {String((errors as any)?.redirect_url?.message)}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">{t("label.status")}</p>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <AppSelect
                          value={String(field.value ?? "")}
                          onSelect={(value) => field.onChange(String(value))}
                          groups={StatusList}
                          hideNone
                        />
                      )}
                    />
                    {(errors as any)?.status?.message ? (
                      <p className="text-red-500 text-sm mt-1">
                        {String((errors as any)?.status?.message)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={editData}
            IsLoading={isEdit ? isSliderUpdating : isSliderPending}
            AddLabel={t("button.add_slider")}
            UpdateLabel={t("button.update_slider")}
          />
        </Card>
      </form>
    </div>
  );
}
