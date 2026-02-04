// ===============================================
// File: src/components/blocks/admin-section/blog/post/BlogPostForm.tsx
// FINAL — Blog Post Form (Standard Form + I18n JSON Scaffold) + DF contract
// - Schema requires: title_df, description_df (min 2) => hidden register + dfSync
// - Root language is dynamic (firstUILangId), df excluded from tabs/json
// - JSON edits all i18n fields (title/description/meta_* + meta_keywords)
// - No whole-form watch: scaffold watches only i18n + extraWatchNames + one meta_keywords watch
// - DB -> Form init: root -> df + firstUILangId, translations -> other langs
// - JSON init: translations_json (if exists) else build from form
// - meta_keywords in form ALWAYS array (TagsInput compatible)
// ===============================================

"use client";

import React, { useEffect, useMemo, useState } from "react";

import CloudIcon from "@/assets/icons/CloudIcon";
import { AppSelect } from "@/components/blocks/common";
import CustomSingleDatePicker from "@/components/blocks/common/CustomSingleDatePicker";
import TiptapEditor from "@/components/blocks/common/TiptapField";
import Cancel from "@/components/blocks/custom-icons/Cancel";
import { SubmitButton } from "@/components/blocks/shared";
import multiLang from "@/components/molecules/multiLang.json";

import {
  Card,
  CardContent,
  Input,
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
import { TagsInput } from "@/components/ui/tags-input";

import GlobalImageLoader from "@/lib/imageLoader";
import { useBlogCategoriesFetchQuery } from "@/modules/admin-section/blog/blog-category/blog-category.action";
import {
  useBlogPostStoreMutation,
  useBlogPostUpdateMutation,
} from "@/modules/admin-section/blog/post/blog-post.action";
import {
  BlogPostFormData,
  blogPostSchema,
} from "@/modules/admin-section/blog/post/blog-post.schema";

import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid, parse } from "date-fns";
import { Info } from "lucide-react";
import moment from "moment";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import PhotoUploadModal, { type UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";
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


// i18n json'a dahil alanlar (df dahil değil)
const I18N_FIELDS = [
  "title",
  "description",
  "meta_title",
  "meta_description",
  "meta_keywords",
] as const;

function safeStr(x: any) {
  return String(x ?? "").trim();
}

function splitCsv(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

// meta_keywords normalize (JSON mode safety)
function normalizeJsonForForm(json: any, langs: Array<{ id: string }>) {
  if (!json || typeof json !== "object") return {};
  const out: any = { ...(json as any) };

  for (const lang of langs) {
    const block = out?.[lang.id];
    if (!block || typeof block !== "object") continue;

    if (typeof block.meta_keywords === "string") {
      block.meta_keywords = splitCsv(block.meta_keywords);
    }
    if (!Array.isArray(block.meta_keywords) && block.meta_keywords != null) {
      block.meta_keywords = [];
    }
  }

  return out;
}

function hasAnyI18nValuePost(v: any, langId: string) {
  const title = safeStr(v?.[`title_${langId}`]);
  const desc = safeStr(v?.[`description_${langId}`]);
  const mt = safeStr(v?.[`meta_title_${langId}`]);
  const md = safeStr(v?.[`meta_description_${langId}`]);
  const mk = v?.[`meta_keywords_${langId}`];
  const mkHas = Array.isArray(mk) ? mk.filter((x: any) => safeStr(x)).length > 0 : false;
  return !!(title || desc || mt || md || mkHas);
}

const BlogPostForm = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const allLangs = useMemo(
    () => (multiLang as Array<{ id: string; label: string }>),
    []
  );

  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const dir = locale === "ar" ? "rtl" : "ltr";

  const editData = data?.data ?? data;

  const StatusList = [
    { label: t("label.draft"), value: 0 },
    { label: t("label.publish"), value: 1 },
  ];
  const VisibilityList = [
    { label: t("label.private"), value: "private" },
    { label: t("label.public"), value: "public" },
  ];

  const [viewMode, setViewMode] = useState<ViewMode>("form");

  // -----------------------------
  // RHF
  // -----------------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
    getValues,
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      // non-i18n
      status: editData?.status != null ? String(editData.status) : "",
      category_id: editData?.category_id != null ? String(editData.category_id) : "",
      visibility: editData?.visibility != null ? String(editData.visibility) : "",
      start_date: editData?.schedule_date ? String(editData.schedule_date).split("T")[0] : "",
      author: editData?.author ?? "",
      tag_name: [],

      // df (schema contract!)
      title_df: "",
      description_df: "",
      meta_title_df: "",
      meta_description_df: "",
      meta_keywords_df: [],

      // safe: first lang fields can be empty
    } as any,
  });

  const setValueAny = useMemo(
    () => makeRHFSetValueAny<BlogPostFormData>(setValue),
    [setValue]
  );

  // ✅ Scaffold (single-source) + dfSync
  const i18n = useFormI18nScaffold<BlogPostFormData>({
    languages: allLangs,
    excludeLangIds: ["df"],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    extraWatchNames: ["status", "category_id", "visibility", "start_date", "tag_name", "author"],
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: "title_df", srcField: (l) => `title_${l}`, validate: true },
        { dfField: "description_df", srcField: (l) => `description_${l}`, validate: true },
        { dfField: "meta_title_df", srcField: (l) => `meta_title_${l}` },
        { dfField: "meta_description_df", srcField: (l) => `meta_description_${l}` },
        // meta_keywords_df array => manual sync below (scaffold dfSync is string-oriented)
      ],
    },
  });

  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    handleTranslationsJsonChange,
    rebuildJsonNow,
  } = i18n;

  // meta_keywords first lang watch (allowed: single field, not whole form)
  const firstLangKeywords = useWatch({
    control,
    name: `meta_keywords_${firstUILangId}` as any,
  });

  // ✅ keep meta_keywords_df synced (only when differs)
  useEffect(() => {
    const next = Array.isArray(firstLangKeywords) ? firstLangKeywords : [];
    const current = getValues("meta_keywords_df" as any);
    const curArr = Array.isArray(current) ? current : [];

    // shallow compare
    const same =
      curArr.length === next.length && curArr.every((v: any, i: number) => String(v) === String(next[i]));

    if (!same) {
      setValueAny("meta_keywords_df", next as any, {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstLangIdKey(firstUILangId), firstLangKeywords]);

  // helper to force dep changes safely
  function firstLangIdKey(id: string) {
    return `__mkdf__${id}`;
  }

  // categories
  const { blogcategories } = useBlogCategoriesFetchQuery({
    pagination: false,
    status: 1,
  });
  const categories = useMemo(() => ((blogcategories as any) || []) as any[], [blogcategories]);

  // -----------------------------
  // JSON -> form (normalize keywords)
  // -----------------------------
  const onJsonChange = (next: any) => {
    const normalized = normalizeJsonForForm(next, uiLangs);

    // 1) update JSON state (scaffold) + apply to form
    handleTranslationsJsonChange(normalized);

    // 2) also apply explicitly (kept import + extra safety)
    applyI18nJsonToFlatForm({
      json: normalized,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      setValue,
      keyOf: (field, langId) => `${field}_${langId}`,
    });

    // dfSync will propagate title/desc/meta_* into df automatically,
    // meta_keywords_df sync handled by useWatch effect above.
  };

  // -----------------------------
  // Images
  // -----------------------------
  const [lastSelectedImages, setLastSelectedImages] = useState<any>(null);
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>("");
  const [errorImagesMessage, setImagesErrorMessage] = useState<string>("");

  const handleSaveImages = (images: UploadedImage[]) => {
    const img = images?.[0];
    setLastSelectedImages(img);

    const dimensions = img?.dimensions ?? "";
    const [width, height] = dimensions.split(" x ").map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width && height ? width / height : NaN;

    if (Number.isFinite(aspectRatio) && Math.abs(aspectRatio - 1) < 0.01) {
      setImagesErrorMessage("");
      return true;
    }
    setImagesErrorMessage("Image must have a 1:1 aspect ratio.");
    return false;
  };

  const removePreview = () => {
    setLastSelectedImages(null);
    setImagesErrorMessage("");
  };

  const handleSaveLogo = (images: UploadedImage[]) => {
    const img = images?.[0];
    setLastSelectedLogo(img);

    const dimensions = img?.dimensions ?? "";
    const [width, height] = dimensions.split(" x ").map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width && height ? width / height : NaN;

    if (Number.isFinite(aspectRatio) && Math.abs(aspectRatio - 1) < 0.01) {
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

  // -----------------------------
  // ✅ DB -> Form init (deterministic) + JSON init
  // -----------------------------
  useEffect(() => {
    // Create
    if (!editData) {
      rebuildJsonNow();
      return;
    }

    // ---- DF root init (schema contract)
    setValueAny("title_df", editData?.title ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny("description_df", editData?.description ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny("meta_title_df", editData?.meta_title ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny("meta_description_df", editData?.meta_description ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny("meta_keywords_df", splitCsv(editData?.meta_keywords), { shouldDirty: false, shouldTouch: false, shouldValidate: false });

    // ---- root -> firstUILangId (so tabs show)
    setValueAny(`title_${firstUILangId}` as any, editData?.title ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny(`description_${firstUILangId}` as any, editData?.description ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny(`meta_title_${firstUILangId}` as any, editData?.meta_title ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny(`meta_description_${firstUILangId}` as any, editData?.meta_description ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny(`meta_keywords_${firstUILangId}` as any, splitCsv(editData?.meta_keywords), { shouldDirty: false, shouldTouch: false, shouldValidate: false });

    // ---- global
    setValueAny("tag_name", splitCsv(editData?.tag_name), { shouldDirty: false, shouldTouch: false, shouldValidate: false });

    // ---- non-i18n
    setValueAny("category_id", editData?.category_id != null ? String(editData.category_id) : "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny("visibility", editData?.visibility != null ? String(editData.visibility) : "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny("status", editData?.status != null ? String(editData.status) : "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny("author", editData?.author ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });

    const schedule = editData?.schedule_date ?? editData?.start_date ?? "";
    if (schedule) {
      setValueAny("start_date", String(schedule).split("T")[0], { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    } else {
      setValueAny("start_date", "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    }

    // ---- translations (supports array OR object)
    const rawTr = editData?.translations;

    if (Array.isArray(rawTr)) {
      for (const item of rawTr) {
        const langId = item?.language_code || item?.language;
        if (!langId) continue;

        setValueAny(`title_${langId}` as any, item?.title ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
        setValueAny(`description_${langId}` as any, item?.description ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
        setValueAny(`meta_title_${langId}` as any, item?.meta_title ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
        setValueAny(`meta_description_${langId}` as any, item?.meta_description ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
        setValueAny(`meta_keywords_${langId}` as any, splitCsv(item?.meta_keywords), { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      }
    } else if (rawTr && typeof rawTr === "object") {
      Object.keys(rawTr).forEach((langId) => {
        const tr = (rawTr as any)?.[langId];
        if (!tr) return;

        setValueAny(`title_${langId}` as any, tr?.title ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
        setValueAny(`description_${langId}` as any, tr?.description ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
        setValueAny(`meta_title_${langId}` as any, tr?.meta_title ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
        setValueAny(`meta_description_${langId}` as any, tr?.meta_description ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
        setValueAny(`meta_keywords_${langId}` as any, splitCsv(tr?.meta_keywords), { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      });
    }

    // ---- images
    if (editData?.meta_image) {
      setLastSelectedImages({
        image_id: editData?.meta_image ?? "",
        img_url: editData?.meta_image_url ?? "/images/no-image.png",
        name: "cover image",
      });
    }
    if (editData?.image) {
      setLastSelectedLogo({
        image_id: editData?.image ?? "",
        img_url: editData?.image_url ?? "/images/no-image.png",
        name: "thumbnail image",
      });
    }

    // ---- JSON init
    const dbJson = editData?.translations_json;
    if (dbJson && typeof dbJson === "object") {
      onJsonChange(dbJson);
    } else {
      // build from current form snapshot after init
      const snap = getValues() as any;
      const built = buildI18nJsonFromFlatValues({
        values: snap,
        languages: uiLangs,
        fields: [...I18N_FIELDS],
        keyOf: (field, langId) => `${field}_${langId}`,
        skipEmpty: false,
      });
      onJsonChange(built);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, firstUILangId]);

  const { mutate: blogStore, isPending } = useBlogPostStoreMutation();
  const { mutate: blogUpdate, isPending: isUpdating } = useBlogPostUpdateMutation();

  // -----------------------------
  // Submit
  // -----------------------------
  const onSubmit = async (values: BlogPostFormData) => {
    if (!values?.status) return toast.error("Please Select Status !");
    if (!values?.category_id) return toast.error(t("toast.select_item", { type: "a category" }));
    if (!values?.visibility) return toast.error(t("toast.select_item", { type: "visibility" }));

    // ROOT must come from df fields (schema contract)
    const rootTitle = safeStr((values as any).title_df) || safeStr((values as any)[`title_${firstUILangId}`]);
    const rootDesc = safeStr((values as any).description_df) || safeStr((values as any)[`description_${firstUILangId}`]);
    const rootMetaTitle = safeStr((values as any).meta_title_df) || safeStr((values as any)[`meta_title_${firstUILangId}`]);
    const rootMetaDesc = safeStr((values as any).meta_description_df) || safeStr((values as any)[`meta_description_${firstUILangId}`]);

    const dfKeywords = (values as any).meta_keywords_df;
    const rootKeywordsArr = Array.isArray(dfKeywords)
      ? dfKeywords
      : Array.isArray((values as any)[`meta_keywords_${firstUILangId}`])
        ? (values as any)[`meta_keywords_${firstUILangId}`]
        : [];

    const defaultData: any = {
      tag_name: (values.tag_name || []).join(", "),
      meta_keywords: (rootKeywordsArr as string[]).join(", "),
      meta_title: rootMetaTitle,
      meta_description: rootMetaDesc,
      title: rootTitle,
      description: rootDesc,

      // keep df too (harmless)
      title_df: (values as any).title_df,
      description_df: (values as any).description_df,
      meta_title_df: (values as any).meta_title_df,
      meta_description_df: (values as any).meta_description_df,
      meta_keywords_df: rootKeywordsArr,

      category_id: values.category_id,
      author: values.author,
      visibility: values.visibility,
      status: values.status,
      schedule_date: values.start_date ? moment(values.start_date).format("YYYY-MM-DD") : "",
    };

    // translations exclude firstUILangId + skip empty blocks
    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== firstUILangId)
      .filter((lang) => hasAnyI18nValuePost(values as any, lang.id))
      .map((lang) => ({
        language_code: lang.id,
        title: (values as any)[`title_${lang.id}`] ?? "",
        description: (values as any)[`description_${lang.id}`] ?? "",
        meta_title: (values as any)[`meta_title_${lang.id}`] ?? "",
        meta_keywords: (((values as any)[`meta_keywords_${lang.id}`] || []) as string[]).join(", "),
        meta_description: (values as any)[`meta_description_${lang.id}`] ?? "",
      }));

    // translations_json: build from flat + ensureLangKeys + normalize
    const builtJson = buildI18nJsonFromFlatValues({
      values: values as any,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });

    const jsonFinal = normalizeJsonForForm(ensureLangKeys(builtJson, uiLangs), uiLangs);

    const submissionData: any = {
      ...defaultData,
      id: editData?.id,
      meta_image: lastSelectedImages ? lastSelectedImages?.image_id : "",
      image: lastSelectedLogo ? lastSelectedLogo?.image_id : "",
      translations,
      translations_json: jsonFinal,
    };

    if (editData?.id > 0) {
      return blogUpdate(submissionData, {
        onSuccess: () => {
          dispatch(setRefetch(true));
          reset();
        },
      });
    }

    return blogStore(submissionData, {
      onSuccess: () => {
        dispatch(setRefetch(true));
        reset();
      },
    });
  };

  // -----------------------------
  // UI triggers
  // -----------------------------
  const triggerMetaImage = (
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
            <p className="text-sm font-bold text-red-500 p-1">{t("common.change_image")}</p>
          </div>
        </div>
      ) : (
        <div className="border-2 w-32 h-32 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-4 text-blue-500 text-sm font-medium p-1">{t("common.drag_and_drop")}</p>
          </div>
        </div>
      )}
    </div>
  );

  const triggerThumbImage = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={lastSelectedLogo?.name as string}
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
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-4 text-blue-500 text-sm font-medium p-1">{t("common.drag_and_drop")}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ DF hidden fields required by schema */}
        <input type="hidden" {...register("title_df" as any)} />
        <input type="hidden" {...register("description_df" as any)} />
        <input type="hidden" {...register("meta_title_df" as any)} />
        <input type="hidden" {...register("meta_description_df" as any)} />
        <input type="hidden" {...register("meta_keywords_df" as any)} />

        {/* Header toggle */}
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {editData?.id > 0 ? t("common.edit_blog_post") : t("button.add_blog")}
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

        {/* Show DF errors (same style as category) */}
        {(errors as any)?.title_df?.message || (errors as any)?.description_df?.message ? (
          <Card className="mt-4">
            <CardContent className="p-3">
              {(errors as any)?.title_df?.message ? (
                <p className="text-red-600 text-sm">{String((errors as any)?.title_df?.message)}</p>
              ) : null}
              {(errors as any)?.description_df?.message ? (
                <p className="text-red-600 text-sm">{String((errors as any)?.description_df?.message)}</p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {viewMode === "json" ? (
          <Card className="rounded-lg border-none mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Translations JSON"
                languages={uiLangs}
                value={translationsJson}
                onChange={onJsonChange}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    Alanlar: <code>title</code>, <code>description</code>,{" "}
                    <code>meta_title</code>, <code>meta_description</code>,{" "}
                    <code>meta_keywords</code> (array).
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-12 gap-4 mt-4">
            {/* Left: i18n fields */}
            <Card className="2xl:col-span-8 xl:col-span-6 lg:col-span-6 md:col-span-12 col-span-12">
              <CardContent className="p-2 md:p-6">
                <h1 className="text-lg md:text-2xl font-medium mb-4">
                  {t("common.basic_information")}
                </h1>

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
                      <TabsContent key={lang.id} value={lang.id} className="space-y-2">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>
                                {t("label.title")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                              </span>
                            </p>
                            <Input
                              id={`title_${lang.id}`}
                              {...register(`title_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t("place_holder.enter_title")}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t("label.description")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </p>

                            <Controller
                              control={control}
                              name={`description_${lang.id}` as any}
                              render={({ field }) => (
                                <TiptapEditor
                                  value={typeof field.value === "string" ? field.value : ""}
                                  onChange={field.onChange}
                                />
                              )}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t("label.meta_title")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </p>
                            <Input
                              id={`meta_title_${lang.id}`}
                              {...register(`meta_title_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t("place_holder.enter_meta_title")}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t("label.meta_description")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </p>
                            <Textarea
                              id={`meta_description_${lang.id}`}
                              {...register(`meta_description_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t("place_holder.enter_meta_description")}
                            />
                          </div>

                          <div>
                            <div className="text-sm font-medium flex items-center gap-2">
                              <span>
                                {t("label.meta_keywords")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="right"
                                    align="center"
                                    sideOffset={4}
                                    avoidCollisions={false}
                                    className="bg-custom-dark-blue w-68"
                                  >
                                    <p className="p-1 text-sm font-medium">
                                      {t("place_holder.enter_meta_key")}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>

                            <Controller
                              name={`meta_keywords_${lang.id}` as any}
                              control={control}
                              render={({ field }) => (
                                <TagsInput
                                  value={Array.isArray(field.value) ? field.value : []}
                                  onChange={(newValue: string[]) => field.onChange(newValue)}
                                  placeholder={`${t("place_holder.enter_meta_key")} ${t(
                                    `lang.${lang.id}` as `lang.${LangKeys}`
                                  )}`}
                                  className="app-input"
                                />
                              )}
                            />
                          </div>

                          {/* tag_name global (only firstUILangId) */}
                          {lang.id === firstUILangId && (
                            <div>
                              <div className="text-sm font-medium flex items-center gap-2">
                                <span>{t("label.tag_name")}</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="right"
                                      align="center"
                                      sideOffset={4}
                                      avoidCollisions={false}
                                      className="bg-custom-dark-blue w-68"
                                    >
                                      <p className="p-1 text-sm font-medium">
                                        {t("place_holder.enter_tag_name")}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>

                              <Controller
                                name={"tag_name" as any}
                                control={control}
                                render={({ field }) => (
                                  <TagsInput
                                    value={Array.isArray(field.value) ? field.value : []}
                                    onChange={(newValue: string[]) => field.onChange(newValue)}
                                    placeholder={t("place_holder.enter_tag_name")}
                                    className="app-input"
                                  />
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            {/* Right: non-i18n fields + images */}
            <Card className="2xl:col-span-4 xl:col-span-6 lg:col-span-6 md:col-span-12 col-span-12">
              <CardContent className="p-2 md:p-6">
                <h1 className="text-lg md:text-2xl font-medium mb-4">
                  {t("common.category_visibility")}
                </h1>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span>{t("label.category")}</span>
                    </p>
                    <Controller
                      control={control}
                      name="category_id"
                      render={({ field }) => (
                        <AppSelect
                          key={field.value}
                          value={String(field.value ?? "")} 
                          onSelect={(value) => field.onChange(value)}
                          groups={categories}
                          hideNone
                        />
                      )}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span>{t("label.status")}</span>
                    </p>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <AppSelect
                          value={String(field.value ?? "")} 
                          onSelect={(value) => field.onChange(value)}
                          groups={StatusList}
                          hideNone
                        />
                      )}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span>{t("label.visibility")}</span>
                    </p>
                    <Controller
                      control={control}
                      name="visibility"
                      render={({ field }) => (
                        <AppSelect
                          value={String(field.value ?? "")} 
                          onSelect={(value) => field.onChange(value)}
                          groups={VisibilityList}
                          hideNone
                        />
                      )}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">{t("label.schedule_date")}</p>
                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field }) => {
                        let selectedDate: Date | null = null;
                        if (field.value) {
                          const parsedDate = parse(String(field.value), "yyyy-MM-dd", new Date());
                          selectedDate = isValid(parsedDate) ? parsedDate : null;
                        }
                        return (
                          <CustomSingleDatePicker
                            label=""
                            selectedDate={selectedDate}
                            onChange={(date) => {
                              if (date) field.onChange(format(date, "yyyy-MM-dd"));
                              else field.onChange("");
                            }}
                          />
                        );
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">
                      <span>{t("label.thumbnail")}</span>
                    </p>
                    <div className="relative flex align-start gap-4">
                      <div className="relative w-32">
                        <PhotoUploadModal
                          trigger={triggerThumbImage}
                          isMultiple={false}
                          onSave={handleSaveLogo}
                          usageType="blog"
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
                        {errorLogoMessage && (
                          <p className="absolute text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">
                      <span>{t("label.meta_image")}</span>
                    </p>
                    <div className="relative flex align-start gap-4">
                      <div className="relative w-32">
                        <PhotoUploadModal
                          trigger={triggerMetaImage}
                          isMultiple={false}
                          onSave={handleSaveImages}
                          usageType="blog"
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
                        {errorImagesMessage && (
                          <p className="absolute text-red-500 text-sm mt-1">{errorImagesMessage}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={editData}
            IsLoading={isPending || isUpdating}
            AddLabel={t("button.add_blog")}
            UpdateLabel={t("button.update_blog")}
          />
        </Card>
      </form>
    </div>
  );
};

export default BlogPostForm;
