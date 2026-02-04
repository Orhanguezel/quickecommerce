// =====================================================
// src/components/blocks/admin-section/media-manage/CreateOrUpdateBrandForm.tsx

"use client";
import multiLang from "@/components/molecules/multiLang.json";
import {
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
import {
  BrandFormData,
  brandSchema,
} from "@/modules/admin-section/brand/brand.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import CloudIcon from "@/assets/icons/CloudIcon";
import { SubmitButton } from "@/components/blocks/shared";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useBrandStoreMutation,
  useBrandUpdateMutation,
} from "@/modules/admin-section/brand/brand.action";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Cancel from "../../custom-icons/Cancel";
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



export default function CreateOrUpdateBrandForm({ data }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const multiLangData = React.useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const editData = data?.data;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>("");

  useEffect(() => {
    if (editData) {
      setValue("brand_name_df", editData.brand_name ?? "");
      setValue("meta_title_df", editData.meta_title ?? "");
      setValue("meta_description_df", editData.meta_description ?? "");
      setValue("display_order", String(editData.display_order) ?? "");
      Object.keys(editData?.translations).forEach((language) => {
        const translation = editData.translations[language];
        setValue(
          `brand_name_${language}` as keyof BrandFormData,
          translation?.brand_name ?? ""
        );
        setValue(
          `meta_title_${language}` as keyof BrandFormData,
          translation?.meta_title ?? ""
        );
        setValue(
          `meta_description_${language}` as keyof BrandFormData,
          translation?.meta_description ?? ""
        );
      });
      if (editData?.brand_logo) {
        setLastSelectedLogo({
          image_id: editData?.brand_logo ? editData?.brand_logo : "",
          img_url: editData?.brand_logo_url
            ? editData?.brand_logo_url
            : "/images/no-image.png",
          name: "logo",
        });
      }
    }
  }, [editData, setValue]);

  const handleSaveLogo = (images: UploadedImage[]) => {
    setLastSelectedLogo(images[0]);
    const dimensions = images[0].dimensions;
    //@ts-ignore
    const [width, height] = dimensions
      .split(" x ")
      .map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width / height;

    if (Math.abs(aspectRatio - 1 / 1) < 0.01) {
      setLogoErrorMessage("");
      return true;
    } else {
      setLogoErrorMessage("Image must have a 1:1 aspect ratio.");
      return false;
    }
  };
  const removeLogo = () => {
    setLastSelectedLogo(null);
    setLogoErrorMessage("");
  };

  const { mutate: brandStore, isPending } = useBrandStoreMutation();
  const { mutate: brandUpdate, isPending: isUpdating } =
    useBrandUpdateMutation();
  const onSubmit = async (values: BrandFormData) => {
    let orderValue =
      values.display_order == ""
        ? values.display_order
        : Number(values.display_order);
    const defaultData = {
      brand_name: values.brand_name_df,
      meta_title: values.meta_title_df,
      meta_description: values.meta_description_df,
      display_order: orderValue,
    };
    const translations = multiLangData
      .filter((lang) => (values as any)[`brand_name_${lang.id}`])
      .map((lang) => ({
        language_code: lang.id,
        brand_name: (values as any)[`brand_name_${lang.id}`],
        meta_title: (values as any)[`meta_title_${lang.id}`],
        meta_description: (values as any)[`meta_description_${lang.id}`],
      }));
    const submissionData = {
      ...defaultData,
      id: editData?.id,
      brand_logo: lastSelectedLogo ? lastSelectedLogo?.image_id : "",
      translations: translations,
    };

    return data
      ? brandUpdate(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              dispatch(setRefetch(true));
              reset();
            },
          }
        )
      : brandStore(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              dispatch(setRefetch(true));
              reset();
            },
          }
        );
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
          <div className="py-2 absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">
              {t("common.change_image")}
            </p>
          </div>
        </div>
      ) : (
        <div className=" w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-2 text-blue-500 text-xs font-medium">
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
        <div>
          <Tabs defaultValue="df" className="col-span-2">
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
            <div dir={dir} className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">
              {multiLangData.map((lang) => {
                return (
                  <TabsContent
                    key={lang.id}
                    value={lang.id}
                    className="lg:col-span-2"
                  >
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>
                          {t("label.name")} (
                          {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                        </span>
                      </p>
                      <Input
                        id={`brand_name_${lang.id}`}
                        {...register(
                          `brand_name_${lang.id}` as keyof BrandFormData
                        )}
                        className="app-input"
                        placeholder={t("place_holder.enter_name")}
                      />
                      {errors[
                        `brand_name_${lang.id}` as keyof BrandFormData
                      ] && (
                        <p className="text-red-500 text-sm mt-1">
                          {
                            //@ts-ignore
                            errors[`brand_name_${lang.id}`]?.message
                          }
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">
                        {t("label.meta_title")} (
                        {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                      </p>
                      <Input
                        id={`meta_title_${lang.id}`}
                        {...register(
                          `meta_title_${lang.id}` as keyof BrandFormData
                        )}
                        className="app-input"
                        placeholder={t("place_holder.enter_meta_title")}
                      />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">
                        {t("label.meta_description")} (
                        {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                      </p>
                      <Textarea
                        id={`meta_description_${lang.id}`}
                        {...register(
                          `meta_description_${lang.id}` as keyof BrandFormData
                        )}
                        className="app-input"
                        placeholder={t("place_holder.enter_meta_description")}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">
                        {t("label.order")}
                      </p>
                      <Input
                        type="number"
                        min={0}
                        id="display_order"
                        {...register("display_order" as keyof BrandFormData)}
                        className="app-input"
                        placeholder={t("place_holder.enter_display_order")}
                      />
                    </div>
                  </TabsContent>
                );
              })}
              <div className="mt-2">
                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>{t("label.logo")}</span>
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
                      usageType="brand"
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
          </Tabs>
        </div>

        <div className="col-span-2 mt-10">
          <SubmitButton
            UpdateData={data}
            IsLoading={isPending || isUpdating}
            AddLabel={t("button.add_brand")}
            UpdateLabel={t("button.update_brand")}
          />
        </div>
      </form>
    </div>
  );
}
