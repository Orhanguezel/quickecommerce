"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { HexColorPicker } from "react-colorful";
import { useRouter } from "next/navigation";

import { SubmitButton } from "@/components/blocks/shared";
import PhotoUploadModal, { type UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";
import Cancel from "@/components/blocks/custom-icons/Cancel";
import CloudIcon from "@/assets/icons/CloudIcon";
import GlobalImageLoader from "@/lib/imageLoader";
import { Routes } from "@/config/routes";

import {
  Button,
  Card,
  CardContent,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from "@/components/ui";

import {
  useShippingCampaignStoreMutation,
  useShippingCampaignUpdateMutation,
} from "@/modules/admin-section/promotional/shipping-campaign/shipping-campaign.action";
import {
  ShippingCampaignFormData,
  shippingCampaignSchema,
} from "@/modules/admin-section/promotional/shipping-campaign/shipping-campaign.schema";

const COLOR_FIELDS = [
  { key: "background_color", label: "Arka Plan Rengi", default: "#1B4B8B" },
  { key: "title_color", label: "Başlık Rengi", default: "#FFFFFF" },
  { key: "description_color", label: "Açıklama Rengi", default: "#E8F0FE" },
  { key: "button_text_color", label: "Buton Yazı Rengi", default: "#FFFFFF" },
  { key: "button_bg_color", label: "Buton Arka Plan", default: "#FF6B35" },
] as const;

type ColorFieldKey = (typeof COLOR_FIELDS)[number]["key"];

export default function CreateOrUpdateShippingCampaignForm({ data }: { data?: any }) {
  const t = useTranslations();
  const router = useRouter();
  const isEdit = !!data?.id;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShippingCampaignFormData>({
    resolver: zodResolver(shippingCampaignSchema),
    defaultValues: {
      title: data?.title ?? "",
      description: data?.description ?? "",
      image: data?.image ?? "",
      background_color: data?.background_color ?? "#1B4B8B",
      title_color: data?.title_color ?? "#FFFFFF",
      description_color: data?.description_color ?? "#E8F0FE",
      button_text: data?.button_text ?? "",
      button_text_color: data?.button_text_color ?? "#FFFFFF",
      button_bg_color: data?.button_bg_color ?? "#FF6B35",
      button_url: data?.button_url ?? "",
      min_order_value: data?.min_order_value ?? 1000,
      status: data?.status ?? true,
    },
  });

  const [openColors, setOpenColors] = useState<Record<ColorFieldKey, boolean>>(
    COLOR_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: false }), {} as any)
  );
  const [campaignImage, setCampaignImage] = useState<UploadedImage | null>(
    data?.image_url ? { url: data.image_url, id: "0" } : null
  );
  const [lastSelectedImage, setLastSelectedImage] = useState<UploadedImage | undefined>(
    campaignImage ? { ...campaignImage, image_id: campaignImage.id } : undefined
  );

  const { mutate: storeItem, isPending: isStoring } = useShippingCampaignStoreMutation();
  const { mutate: updateItem, isPending: isUpdating } = useShippingCampaignUpdateMutation();
  const isLoading = isStoring || isUpdating;

  const toggleColor = (key: ColorFieldKey) => {
    setOpenColors((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onSubmit = (values: ShippingCampaignFormData) => {
    const payload: any = { ...values };
    if (isEdit) {
      payload.id = data.id;
      updateItem(payload);
    } else {
      storeItem(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Fields */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="text-lg font-semibold">{t("label.basic_info") || "Temel Bilgiler"}</h2>

              {/* Title */}
              <div>
                <label className="text-sm font-medium mb-1 block">{t("label.title")} *</label>
                <Input {...register("title")} placeholder={t("place_holder.title") || "Kampanya başlığı"} className="app-input" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-1 block">{t("label.description")}</label>
                <Textarea
                  {...register("description")}
                  placeholder={t("place_holder.description") || "Kampanya açıklaması"}
                  className="app-input min-h-[100px]"
                />
              </div>

              {/* Min Order Value */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("common.min_order_value") || "Minimum Sipariş Tutarı (₺)"} *
                </label>
                <Controller
                  name="min_order_value"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="app-input"
                    />
                  )}
                />
                {errors.min_order_value && (
                  <p className="text-red-500 text-xs mt-1">{errors.min_order_value.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Button Settings */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="text-lg font-semibold">{t("label.button_settings") || "Buton Ayarları"}</h2>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("label.button_text")}</label>
                <Input {...register("button_text")} placeholder="Alışverişe Başla" className="app-input" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("label.button_url") || "Buton URL"}</label>
                <Input {...register("button_url")} placeholder="/" className="app-input" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Image & Colors */}
        <div className="space-y-4">
          {/* Image Upload */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">{t("label.image") || "Kampanya Görseli"}</h2>
              {campaignImage?.url && (
                <div className="relative mb-2">
                  <Image
                    src={campaignImage.url}
                    alt="campaign"
                    width={300}
                    height={160}
                    className="rounded-lg w-full object-cover"
                    loader={GlobalImageLoader}
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                    onClick={() => {
                      setCampaignImage(null);
                      setLastSelectedImage(undefined);
                      setValue("image", "");
                    }}
                  >
                    <Cancel />
                  </button>
                </div>
              )}
              <PhotoUploadModal
                trigger={
                  <button
                    type="button"
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
                  >
                    <CloudIcon />
                    <span className="text-sm text-gray-500">
                      {campaignImage?.url
                        ? (t("button.change_image") || "Görseli Değiştir")
                        : (t("label.upload_image") || "Görsel Yükle")}
                    </span>
                  </button>
                }
                isMultiple={false}
                usageType="shipping_campaign"
                selectedImage={lastSelectedImage}
                onSave={(images: UploadedImage[]) => {
                  const img = images[0];
                  if (img) {
                    setCampaignImage(img);
                    setLastSelectedImage(img);
                    setValue("image", img.url);
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Color Pickers */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">{t("label.colors") || "Renkler"}</h2>
              <div className="space-y-3">
                {COLOR_FIELDS.map((field) => {
                  const colorVal = watch(field.key as any) as string;
                  return (
                    <div key={field.key} className="flex items-center gap-3">
                      <Popover
                        open={openColors[field.key as ColorFieldKey]}
                        onOpenChange={() => toggleColor(field.key as ColorFieldKey)}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: colorVal || field.default }}
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                          <Controller
                            name={field.key as any}
                            control={control}
                            render={({ field: f }) => (
                              <HexColorPicker color={f.value || field.default} onChange={f.onChange} />
                            )}
                          />
                          <Input
                            className="mt-2 h-7 text-xs"
                            value={colorVal || field.default}
                            onChange={(e) => setValue(field.key as any, e.target.value)}
                          />
                        </PopoverContent>
                      </Popover>
                      <span className="text-sm">{field.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <label className="text-sm font-medium">{t("label.status")}</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value ?? true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="w-4 h-4"
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push(Routes.shippingCampaignList)}
            >
              {t("button.cancel")}
            </Button>
            <SubmitButton
              className="flex-1 app-button"
              loading={isLoading}
              label={isEdit ? t("button.update") : t("button.save")}
            />
          </div>
        </div>
      </div>

    </form>
  );
}
