// ===============================================
// File: src/components/blocks/admin-section/category/CreateOrUpdateCategoryForm.tsx
// FINAL — FIXED (Create shows in list / type-parent reset / deterministic init)
// Notes:
// - type değişince parent path reset + categories refetch yönetimi effect ile
// - create’de rootCategoryName boş kalmasın diye ekstra guard
// - refetch spam kaldırıldı (handleSelectItem içinden refetch kaldırıldı)
// ===============================================

"use client";

import multiLang from "@/components/molecules/multiLang.json";
import Cancel from "@/components/blocks/custom-icons/Cancel";
import PhotoUploadModal, { type UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
} from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { HexColorPicker } from "react-colorful";
import CloudIcon from "@/assets/icons/CloudIcon";
import { AppNestedDropdown, AppSelect } from "@/components/blocks/common";
import { SubmitButton } from "@/components/blocks/shared";
import {
  useCategoriesQuery,
  useCategoryStoreMutation,
  useCategoryUpdateMutation,
} from "@/modules/admin-section/category/category.action";
import { CategoryFormData, categorySchema } from "@/modules/admin-section/category/category.schema";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { useStoreTypeQuery } from "@/modules/common/store-type/store-type.action";
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


const I18N_FIELDS = ["category_name", "meta_title", "meta_description"] as const;

function safeStr(x: any) {
  return String(x ?? "").trim();
}

function hasAnyI18nValueCategory(v: any, langId: string) {
  const cn = safeStr(v?.[`category_name_${langId}`]);
  const mt = safeStr(v?.[`meta_title_${langId}`]);
  const md = safeStr(v?.[`meta_description_${langId}`]);
  return !!(cn || mt || md);
}

export default function CreateOrUpdateCategoryForm({ data }: any) {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const allLangs = useMemo(() => multiLang as Array<{ id: string; label: string }>, []);

  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const dir = locale === "ar" ? "rtl" : "ltr";

  const editData = data;
  const isEdit = Boolean(editData?.id && Number(editData?.id) > 0);

  const [viewMode, setViewMode] = useState<ViewMode>("form");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    reset,
    control,
    getValues,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      category_banner: "#fff",
      type: editData?.type ?? "",
      category_name_df: "",
      meta_title_df: "",
      meta_description_df: "",
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<CategoryFormData>(setValue), [setValue]);

  // i18n scaffold + dfSync
  const i18n = useFormI18nScaffold<CategoryFormData>({
    languages: allLangs,
    excludeLangIds: ["df"],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    extraWatchNames: ["type", "display_order", "category_banner", "parent_id", "is_featured"],
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: "category_name_df", srcField: (l) => `category_name_${l}`, validate: true },
        { dfField: "meta_title_df", srcField: (l) => `meta_title_${l}` },
        { dfField: "meta_description_df", srcField: (l) => `meta_description_${l}` },
      ],
    },
  });

  const { uiLangs, firstUILangId, translationsJson, handleTranslationsJsonChange, rebuildJsonNow } = i18n;

  // local states
  const [isFeature, setIsFeature] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedIDs, setSelectedIDs] = useState<string[]>([]);
  const [finalSelectedID, setfinalSelectedID] = useState<any[] | "">("");
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>("");

  // type list — API returns { value, label, name, image_url }; map explicitly for AppSelect
  const { storeType } = useStoreTypeQuery({});
  const typeData = useMemo(
    () =>
      ((storeType as any) || []).map((t: any) => ({
        label: t.label || t.name || String(t.value ?? t.slug ?? ""),
        value: String(t.value || t.slug || t.type || ""),
      })),
    [storeType],
  );

  // parent categories (depends on type)
  const typeValue = watch("type");
  const { categories, refetch } = useCategoriesQuery({
    pagination: false,
    type: typeValue,
  });
  const optionsData = (categories as any)?.data || [];

  // ✅ type değişince sadece parent kategorileri refetch et
  // Parent reset işlemi handleSelectItem'da yapılıyor (kullanıcı değiştirdiğinde)
  useEffect(() => {
    if (typeValue) refetch();
  }, [typeValue, refetch]);

  // JSON -> form apply
  const onJsonChange = (next: any) => {
    const safeNext = safeObject(next);
    handleTranslationsJsonChange(safeNext);

    applyI18nJsonToFlatForm({
      json: safeNext,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      setValue: setValueAny,
      keyOf: (field, langId) => `${field}_${langId}`,
    });
  };

  // init DB -> form
  useEffect(() => {
    if (!editData) {
      // create: start with deterministic json
      rebuildJsonNow();
      return;
    }

    // root -> DF
    setValueAny("category_name_df", editData?.category_name ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny("meta_title_df", editData?.meta_title ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny("meta_description_df", editData?.meta_description ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });

    // root -> first UI lang
    setValueAny(`category_name_${firstUILangId}` as any, editData?.category_name ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny(`meta_title_${firstUILangId}` as any, editData?.meta_title ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny(`meta_description_${firstUILangId}` as any, editData?.meta_description ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });

    // non-i18n
    setValueAny("display_order", String(editData?.display_order ?? ""), { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    setValueAny("type", String(editData?.type ?? ""), { shouldDirty: false, shouldTouch: false, shouldValidate: false });

    setfinalSelectedID(editData?.parent_id ?? "");
    setIsFeature(!!editData?.is_featured);

    // paths
    const pathName = editData?.category_name_paths;
    setSelectedItems(pathName ? String(pathName).split("/") : []);

    const pathIds = editData?.parent_path;
    setSelectedIDs(pathIds ? String(pathIds).split("/") : []);

    setValueAny("category_banner", editData?.category_banner ? editData?.category_banner : "#fff", {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    // translations
    const trMap = safeObject(editData?.translations);
    Object.keys(trMap).forEach((langId) => {
      const translation = trMap?.[langId];
      if (!translation) return;

      setValueAny(`category_name_${langId}` as any, translation?.category_name ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      setValueAny(`meta_title_${langId}` as any, translation?.meta_title ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      setValueAny(`meta_description_${langId}` as any, translation?.meta_description ?? "", { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    });

    // thumb
    if (editData?.category_thumb) {
      setLastSelectedLogo({
        image_id: editData?.category_thumb ?? "",
        img_url: editData?.category_thumb_url ?? "/images/no-image.png",
        name: "thumbnail image",
      });
    } else {
      setLastSelectedLogo(null);
    }
    setLogoErrorMessage("");

    // JSON init
    const dbJson = editData?.translations_json;
    if (dbJson && typeof dbJson === "object") onJsonChange(dbJson);
    else rebuildJsonNow();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, firstUILangId]);

  // JSON mode sync
  useEffect(() => {
    if (viewMode === "json") rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // banner css var
  const categoryColor = watch("category_banner");
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--category-banner-color", categoryColor || "#000000");
  }, [categoryColor]);

  type ColorField = "category_banner";
  const handleColorChange = (color: string, colorField: ColorField) => {
    setValueAny(colorField, color, { shouldValidate: true });
  };

  // ✅ select handler: refetch kaldırıldı (effect typeValue zaten refetch ediyor)
  const handleSelectItem = (value: string, inputType: string) => {
    setValueAny(inputType as any, value, { shouldValidate: true, shouldDirty: true });
    if (inputType === "type") {
      // type değişince parent state reset effect ile zaten yapılıyor ama anında temizleyelim
      setSelectedItems([]);
      setSelectedIDs([]);
      setfinalSelectedID("");
    }
  };

  const handleSaveLogo = (images: UploadedImage[]) => {
    setLastSelectedLogo(images[0]);

    const dimensions = images?.[0]?.dimensions ?? "";
    const [width, height] = dimensions.split(" x ").map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width && height ? width / height : 0;

    if (Math.abs(aspectRatio - 1) < 0.01) {
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

  const handleToggleStatus = () => setIsFeature((v) => !v);

  const { mutate: categoryStore, isPending } = useCategoryStoreMutation();
  const { mutate: categoryUpdate, isPending: isUpdating } = useCategoryUpdateMutation();

  const onSubmit = async (values: CategoryFormData) => {
    const type = safeStr((values as any)?.type);

    if (!type) {
      toast.error("The type field is required.");
      setError("type" as any, { type: "manual", message: "Type is required" });
      return;
    }

    const rootCategoryName =
      safeStr((values as any)?.category_name_df) ||
      safeStr((values as any)[`category_name_${firstUILangId}`]);

    if (!rootCategoryName) {
      // ✅ create’de görünmeme riskini sıfırlıyoruz: root zorunlu
      toast.error("Category name is required.");
      setError(`category_name_${firstUILangId}` as any, { type: "manual", message: "Category name is required" });
      return;
    }

    const rootMetaTitle =
      safeStr((values as any)?.meta_title_df) || safeStr((values as any)[`meta_title_${firstUILangId}`]);

    const rootMetaDesc =
      safeStr((values as any)?.meta_description_df) ||
      safeStr((values as any)[`meta_description_${firstUILangId}`]);

    const pathName = selectedItems.join("/");
    const pathIds = selectedIDs.join("/");

    const defaultData = {
      category_name: rootCategoryName,
      type,
      meta_title: rootMetaTitle,
      meta_description: rootMetaDesc,
      display_order: (values as any).display_order,

      category_name_df: (values as any).category_name_df,
      meta_title_df: (values as any).meta_title_df,
      meta_description_df: (values as any).meta_description_df,

      is_featured: isFeature,
      category_name_paths: pathName,
      parent_path: pathIds,
      parent_id: finalSelectedID ? finalSelectedID : "",
      category_banner: (values as any).category_banner,
    };

    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== firstUILangId)
      .filter((lang) => hasAnyI18nValueCategory(values as any, lang.id))
      .map((lang) => ({
        language_code: lang.id,
        category_name: (values as any)[`category_name_${lang.id}`] ?? "",
        meta_title: (values as any)[`meta_title_${lang.id}`] ?? "",
        meta_description: (values as any)[`meta_description_${lang.id}`] ?? "",
      }));

    // path validation
    if (selectedItems.includes(String(rootCategoryName || ""))) {
      setError(`category_name_${firstUILangId}` as any, {
        type: "manual",
        message: "Category name cannot be part of the selected path.",
      });
      toast.error("Category name cannot be part of the selected path!");
      return;
    }

    for (const tr of translations) {
      if (selectedItems.includes(String(tr.category_name || ""))) {
        setError(`category_name_${tr.language_code}` as any, {
          type: "manual",
          message: `Category name in ${tr.language_code} cannot be part of the selected path.`,
        });
        toast.error(`Category name in ${tr.language_code} cannot be part of the selected path!`);
        return;
      }
    }

    // translations_json
    const builtJson = buildI18nJsonFromFlatValues({
      values: values as any,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });
    const translations_json = ensureLangKeys(builtJson, uiLangs);

    const submissionData: any = {
      ...defaultData,
      id: editData?.id ?? 0,
      category_thumb: lastSelectedLogo ? lastSelectedLogo?.image_id : "",
      translations,
      translations_json,
    };

    const onOk = () => {
      reset();
      dispatch(setRefetch(true)); // table tarafında bunu dinleyip refetch edeceğiz
    };

    if (isEdit) return categoryUpdate(submissionData, { onSuccess: onOk });
    return categoryStore(submissionData, { onSuccess: onOk });
  };

  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={String(lastSelectedLogo?.name ?? "thumbnail")}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-semibold text-red-500">{t("common.change_image")}</p>
          </div>
        </div>
      ) : (
        <div className="p-2 w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-2 text-blue-500 text-sm font-medium">{t("common.drag_and_drop")}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* DF hidden fields required by schema */}
        <input type="hidden" {...register("category_name_df" as any)} />
        <input type="hidden" {...register("meta_title_df" as any)} />
        <input type="hidden" {...register("meta_description_df" as any)} />

        {/* Header toggle */}
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {isEdit ? t("button.update_category") : t("button.add_category")}
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

        {/* DF error surface */}
        {(errors as any)?.category_name_df?.message ? (
          <Card className="mt-4">
            <CardContent className="p-3">
              <p className="text-red-600 text-sm">{String((errors as any)?.category_name_df?.message)}</p>
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
                    Alanlar: <code>category_name</code>, <code>meta_title</code>, <code>meta_description</code>.
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full flex items-center justify-center mt-4">
            <CardContent className="p-2 md:p-6 w-full">
              <Tabs defaultValue={firstUILangId} className="col-span-2">
                <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                  {uiLangs.map((lang) => (
                    <TabsTrigger key={lang.id} value={lang.id}>
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div dir={dir} className="grid 2xl:grid-cols-2 gap-4 lg:gap-8">
                  <div className="mt-2">
                    <div className="mb-2">
                      <p className="text-sm font-medium mb-1">
                        {t("label.type")} <span className="text-red-500 mx-0.5">*</span>
                      </p>
                      <Controller
                        control={control}
                        name="type"
                        render={({ field }) => (
                          <AppSelect
                            value={String(field.value ?? "")}
                            onSelect={(value) => {
                              field.onChange(value);
                              handleSelectItem(String(value), "type");
                            }}
                            groups={typeData}
                          />
                        )}
                      />
                      {(errors as any)?.type?.message ? (
                        <p className="text-red-500 text-sm mt-1">{String((errors as any)?.type?.message)}</p>
                      ) : null}
                    </div>

                    <div className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span>{t("label.parent_category")}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild className="relative">
                            <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-custom-dark-blue w-96 -top-20 -left-36 absolute">
                            <p className="p-1 text-sm font-medium">{t("tooltip.select_parent_category")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="mt-1">
                      <AppNestedDropdown
                        selectedItems={selectedItems}
                        selectedIDs={selectedIDs}
                        finalSelectedID={finalSelectedID}
                        setfinalSelectedID={setfinalSelectedID}
                        setSelectedItems={setSelectedItems}
                        setSelectedIDs={setSelectedIDs}
                        groups={optionsData}
                      />
                    </div>

                    {uiLangs.map((lang) => (
                      <TabsContent key={lang.id} value={lang.id}>
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>
                              {t("label.category_name")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                              <span className="text-red-500 mx-0.5">*</span>
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  align="center"
                                  sideOffset={8}
                                  avoidCollisions={false}
                                  className="bg-custom-dark-blue w-96"
                                >
                                  <p className="p-1 text-sm font-medium">{t("tooltip.select_category_name")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <Input
                            id={`category_name_${lang.id}`}
                            {...register(`category_name_${lang.id}` as any)}
                            className="app-input"
                            placeholder={t("place_holder.enter_name")}
                          />
                          {(errors as any)?.[`category_name_${lang.id}`]?.message ? (
                            <p className="text-red-500 text-sm mt-1">
                              {String((errors as any)[`category_name_${lang.id}`]?.message)}
                            </p>
                          ) : null}
                        </div>

                        <div className="mb-4">
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

                        <div className="mb-4">
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
                          <p className="text-sm font-medium mb-1">{t("label.display_order")}</p>
                          <Input
                            type="number"
                            id="display_order"
                            {...register("display_order" as any)}
                            className="app-input"
                            placeholder={t("place_holder.enter_value")}
                          />
                        </div>

                        <div className="my-4 grid grid-cols-4 md:grid-cols-8 items-center">
                          <p className="col-span-3 text-sm font-medium mb-1">{t("label.is_featured")}</p>
                          <Switch dir="ltr" checked={isFeature} onCheckedChange={handleToggleStatus} />
                        </div>

                        <div className="grid grid-cols-4 md:grid-cols-8 items-center">
                          <p className="col-span-3 text-sm font-medium mb-1">{t("label.category_bg_color")}</p>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button type="button" className="w-12 h-10 rounded-md border dynamic-category-banner-color" />
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-4 flex flex-col items-center gap-2">
                              <HexColorPicker
                                color={watch("category_banner")}
                                onChange={(color) => handleColorChange(color, "category_banner")}
                              />
                              <Input
                                type="text"
                                value={watch("category_banner")}
                                onChange={(e) => handleColorChange(e.target.value, "category_banner")}
                                className="app-input w-full"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TabsContent>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row items-start gap-4 mt-2 mb-4 lg:mb-0">
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2">
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

                      <div className="relative flex align-start gap-4">
                        <div className="relative w-32">
                          <PhotoUploadModal
                            trigger={triggerLogo}
                            isMultiple={false}
                            onSave={handleSaveLogo}
                            usageType="category"
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
                          {errorLogoMessage ? <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p> : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={data}
            IsLoading={isPending || isUpdating}
            AddLabel={t("button.add_category")}
            UpdateLabel={t("button.update_category")}
          />
        </Card>
      </form>
    </div>
  );
}
