// src/components/blocks/admin-section/business-operations/subscription/package/CreateOrUpdatePackageForm.tsx
// FINAL — JSON panel standard + first language default + shared RHF helpers
// - Uses lib/json/rhf (makeRHFSetValueAny + safeObject)
// - DB -> form fills firstLangId (no *_df)
// - JSON mode rebuilds from current form snapshot (SEOSettingsForm logic)
// - TS build fix: adapter receives (name: string, ...) compatible wrapper
"use client";

import CloudIcon from "@/assets/icons/CloudIcon";
import multiLang from "@/components/molecules/multiLang.json";
import { SubmitButton } from "@/components/blocks/shared";
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
} from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  usePackageStoreMutation,
  usePackageUpdateMutation,
} from "@/modules/admin-section/business-operations/subscription/package/package.action";
import {
  PackageFormData,
  packageSchema,
} from "@/modules/admin-section/business-operations/subscription/package/package.schema";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

// ✅ JSON panel + adapter
import { AdminI18nJsonPanel } from "@/lib/json/AdminI18nJsonPanel";
import {
  applyI18nJsonToFlatForm,
  buildI18nJsonFromFlatValues,
} from "@/lib/json/i18nFormAdapter";
import { makeRHFSetValueAny, safeObject } from "@/lib/json/rhf";



type ToggleState = {
  pos_system: boolean;
  self_delivery: boolean;
  mobile_app: boolean;
  live_chat: boolean;
};

type LangKeys = keyof IntlMessages["lang"];
type ViewMode = "form" | "json";

// ✅ i18n json'a dahil edeceğimiz alanlar
const I18N_FIELDS = ["name", "description"] as const;

const CreateOrUpdatePackageForm = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const multiLangData = useMemo(() => multiLang, []);
  const firstLangId = multiLangData?.[0]?.id ?? "tr";

  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const editData = data?.package;

  const [viewMode, setViewMode] = useState<ViewMode>("form");
  const [translationsJson, setTranslationsJson] = useState<any>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
  });

  // ✅ shared wrapper (TS build fix) — tüm formlarda aynı
  const setValueAny = useMemo(
    () => makeRHFSetValueAny<PackageFormData>(setValue),
    [setValue]
  );

  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>("");

  const [toggles, setToggles] = useState<ToggleState>({
    pos_system: false,
    self_delivery: false,
    mobile_app: false,
    live_chat: false,
  });

  // ✅ JSON -> form
  const handleTranslationsJsonChange = (next: any) => {
    const safeNext = safeObject(next);
    setTranslationsJson(safeNext);

    applyI18nJsonToFlatForm({
      json: safeNext,
      languages: multiLangData,
      fields: [...I18N_FIELDS],
      setValue: setValueAny,
      keyOf: (field, langId) => `${field}_${langId}`,
    });
  };

  useEffect(() => {
    if (!editData) return;

    // default/root -> firstLangId
    setValueAny(`name_${firstLangId}`, editData?.name ?? "");
    setValueAny(`description_${firstLangId}`, editData?.description ?? "");

    setValueAny("type", String(editData?.type ?? ""));
    setValueAny("validity", String(editData?.validity ?? ""));
    setValueAny("price", String(editData?.price ?? ""));
    setValueAny("order_limit", String(editData?.order_limit ?? ""));
    setValueAny("product_limit", String(editData?.product_limit ?? ""));
    setValueAny(
      "product_featured_limit",
      String(editData?.product_featured_limit ?? "")
    );

    // translations
    const trMap = safeObject(editData?.translations);
    Object.keys(trMap).forEach((langId) => {
      const translation = trMap?.[langId];
      if (!translation) return;

      setValueAny(`name_${langId}`, translation?.name ?? "");
      setValueAny(`description_${langId}`, translation?.description ?? "");
    });

    // toggles
    setToggles({
      pos_system: !!editData?.pos_system,
      self_delivery: !!editData?.self_delivery,
      mobile_app: !!editData?.mobile_app,
      live_chat: !!editData?.live_chat,
    });

    // image
    if (editData?.image) {
      setLastSelectedLogo({
        image_id: editData?.image ?? "",
        img_url: editData?.image_url ?? "/images/no-image.png",
        name: "logo",
      });
    } else {
      setLastSelectedLogo(null);
    }
    setLogoErrorMessage("");

    // ✅ JSON init
    const dbJson = editData?.translations_json;
    if (dbJson && typeof dbJson === "object") {
      handleTranslationsJsonChange(dbJson);
    } else {
      const current = watch() as any;
      const built = buildI18nJsonFromFlatValues({
        values: current,
        languages: multiLangData,
        fields: [...I18N_FIELDS],
        keyOf: (field, langId) => `${field}_${langId}`,
        skipEmpty: true,
      });
      setTranslationsJson(built);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, firstLangId]);

  // ✅ Mode sync: JSON moduna geçince formdan rebuild et
  useEffect(() => {
    if (viewMode !== "json") return;

    const current = watch() as any;
    const built = buildI18nJsonFromFlatValues({
      values: current,
      languages: multiLangData,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: true,
    });
    setTranslationsJson(built);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handleSaveLogo = (images: UploadedImage[]) => {
    setLastSelectedLogo(images[0]);

    const dimensions = images?.[0]?.dimensions ?? "";
    const [width, height] = dimensions
      .split(" x ")
      .map((dim) => parseInt(dim.trim(), 10));

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

  const handleToggle = (field: keyof ToggleState) => {
    setToggles((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const { mutate: PackageStore, isPending } = usePackageStoreMutation();
  const { mutate: PackageUpdate, isPending: isPackageUpdatePending } =
    usePackageUpdateMutation();

  const onSubmit = async (values: PackageFormData) => {
    const v: any = values as any;

    // ✅ default/root artık firstLangId’den
    const defaultData = {
      name: v[`name_${firstLangId}`] ?? "",
      description: v[`description_${firstLangId}`] ?? "",
      type: v.type,
      validity: v.validity,
      price: v.price === "" ? 0 : v.price,
      order_limit: v.order_limit === "" ? 0 : v.order_limit,
      product_limit: v.product_limit === "" ? 0 : v.product_limit,
      product_featured_limit:
        v.product_featured_limit === "" ? 0 : v.product_featured_limit,
    };

    // legacy translations array (koruyoruz)
    const translations = (multiLangData ?? [])
      .filter((lang) => lang.id !== firstLangId)
      .filter((lang) => !!v[`name_${lang.id}`])
      .map((lang) => ({
        language_code: lang.id,
        name: v[`name_${lang.id}`] ?? "",
        description: v[`description_${lang.id}`] ?? "",
      }));

    const translations_json =
      translationsJson && typeof translationsJson === "object"
        ? translationsJson
        : buildI18nJsonFromFlatValues({
            values: v,
            languages: multiLangData,
            fields: [...I18N_FIELDS],
            keyOf: (field, langId) => `${field}_${langId}`,
            skipEmpty: true,
          });

    const submissionData: any = {
      ...defaultData,
      id: editData?.id ?? 0,
      mobile_app: toggles.mobile_app,
      live_chat: toggles.live_chat,
      self_delivery: toggles.self_delivery,
      pos_system: toggles.pos_system,
      image: lastSelectedLogo ? lastSelectedLogo?.image_id : "",
      translations,
      translations_json,
    };

    const onOk = () => {
      reset();
      dispatch(setRefetch(true));
    };

    if (data) return PackageUpdate(submissionData, { onSuccess: onOk });
    return PackageStore(submissionData, { onSuccess: onOk });
  };

  const triggerLogo = (
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
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] h-18 border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-semibold text-red-500">
              {t("common.change_image")}
            </p>
          </div>
        </div>
      ) : (
        <div className=" w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-2 text-blue-500 text-sm font-semibold">
              {t("common.drag_and_drop")}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ Header toggle (Form / JSON) */}
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {data ? t("button.update_package") : t("button.add_package")}
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

        {viewMode === "json" ? (
          <Card className="rounded-lg border-none mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Translations JSON"
                languages={multiLangData}
                value={translationsJson}
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
          <div className="space-y-4">
            <Card className="rounded-lg border-none ">
              <CardContent className="p-2 md:p-6">
                <div className="text-xl font-medium mb-1 flex items-center gap-2">
                  <span>{t("label.package_information")}</span>
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-custom-dark-blue w-96">
                          <p className="p-1 text-sm font-medium">
                            {t("tooltip.package_info")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <Tabs defaultValue={firstLangId} className="col-span-2">
                  <TabsList
                    dir={dir}
                    className="flex justify-start bg-white dark:bg-[#1f2937]"
                  >
                    {multiLangData.map((lang) => (
                      <TabsTrigger key={lang.id} value={lang.id}>
                        {lang.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div dir={dir}>
                    {multiLangData.map((lang) => (
                      <TabsContent key={lang.id} value={lang.id}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>
                                  {t("label.name")} (
                                  {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                  <span className="text-red-500 mx-0.5">*</span>
                                </span>
                              </p>
                              <Input
                                id={`name_${lang.id}`}
                                {...register(`name_${lang.id}` as any)}
                                className="app-input"
                                placeholder={t("place_holder.enter_name")}
                              />
                              {(errors as any)?.[`name_${lang.id}`]?.message ? (
                                <p className="text-red-500 text-sm mt-1">
                                  {(errors as any)[`name_${lang.id}`]?.message}
                                </p>
                              ) : null}
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>
                                  {t("label.description")} (
                                  {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                </span>
                              </p>
                              <Textarea
                                id={`description_${lang.id}`}
                                {...register(`description_${lang.id}` as any)}
                                className="app-input min-h-[174px]"
                                placeholder={t("place_holder.enter_description")}
                              />
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1">
                                {t("label.price")}
                              </p>
                              <Input
                                type="number"
                                min={0}
                                id="price"
                                {...register("price" as any)}
                                className="app-input"
                                placeholder={t("place_holder.enter_price")}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium mb-1">
                                {t("label.type")}{" "}
                                <span className="text-red-500 mx-0.5">*</span>
                              </p>
                              <Input
                                type="text"
                                id="type"
                                {...register("type" as any)}
                                className="app-input"
                                placeholder={t("place_holder.enter_type")}
                              />
                              {(errors as any)?.type?.message ? (
                                <p className="text-red-500 text-sm mt-1">
                                  {(errors as any).type.message}
                                </p>
                              ) : null}
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1">
                                {t("label.validity")}{" "}
                                <span className="text-red-500 mx-0.5">*</span>
                              </p>
                              <Input
                                type="number"
                                min={0}
                                id="validity"
                                {...register("validity" as any)}
                                className="app-input"
                                placeholder={t("place_holder.enter_validity")}
                              />
                              {(errors as any)?.validity?.message ? (
                                <p className="text-red-500 text-sm mt-1">
                                  {(errors as any).validity.message}
                                </p>
                              ) : null}
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1">
                                {t("label.order_limit")}
                              </p>
                              <Input
                                type="number"
                                min={0}
                                id="order_limit"
                                {...register("order_limit" as any)}
                                className="app-input"
                                placeholder={t("place_holder.enter_order_limit")}
                              />
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1">
                                {t("label.product_limit")}
                              </p>
                              <Input
                                type="number"
                                min={0}
                                id="product_limit"
                                {...register("product_limit" as any)}
                                className="app-input"
                                placeholder={t("place_holder.enter_product_limit")}
                              />
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1">
                                {t("label.product_featured_limit")}
                              </p>
                              <Input
                                type="number"
                                min={0}
                                id="product_featured_limit"
                                {...register("product_featured_limit" as any)}
                                className="app-input"
                                placeholder={t("place_holder.enter_product_feature_limit")}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-lg md:text-xl font-medium mb-1 flex items-center gap-2">
                        <span>{t("label.package_available_feature")}</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue w-96">
                                <p className="p-1 text-sm font-medium">
                                  {t("tooltip.mark_feature")}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-700">
                        {t("label.pos_system")}
                      </p>
                      <div className="flex flex-col items-start mr-10">
                        <Switch
                          dir="ltr"
                          checked={toggles.pos_system}
                          onCheckedChange={() => handleToggle("pos_system")}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-700">
                        {t("label.live_chat")}
                      </p>
                      <div className="flex flex-col items-start mr-10">
                        <Switch
                          dir="ltr"
                          checked={toggles.live_chat}
                          onCheckedChange={() => handleToggle("live_chat")}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-4 flex items-center gap-2">
                      <span>{t("label.package_image")}</span>
                      <div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-custom-dark-blue w-96">
                              <p className="p-1 text-sm font-medium">
                                {t("tooltip.aspect_ratio_1_1")}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="relative flex align-start gap-4">
                      <div className="relative w-32">
                        <PhotoUploadModal
                          trigger={triggerLogo}
                          isMultiple={false}
                          onSave={handleSaveLogo}
                          usageType="package"
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
                          <p className="absolute text-red-500 text-sm mt-1">
                            {errorLogoMessage}
                          </p>
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
            UpdateData={data}
            IsLoading={data ? isPackageUpdatePending : isPending}
            AddLabel={t("button.add_package")}
            UpdateLabel={t("button.update_package")}
          />
        </Card>
      </form>
    </div>
  );
};

export default CreateOrUpdatePackageForm;
