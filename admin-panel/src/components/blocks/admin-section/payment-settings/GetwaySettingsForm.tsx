"use client";

import CloudIcon from "@/assets/icons/CloudIcon";
import { SubmitButton } from "@/components/blocks/shared";
import PhotoUploadModal, { type UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";
import {
  CardContent,
  Input,
  Switch,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { formatLabel } from "@/lib/utils";
import { usePaymentGetwayStoreMutation } from "@/modules/admin-section/payment-settings/payment-settings.action";
import {
  GetwaySettingsFormData,
  getwaySettingsSchema,
} from "@/modules/admin-section/payment-settings/payment-settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Cancel from "../../custom-icons/Cancel";

type ToggleState = {
  status: boolean;
  is_test_mode: boolean;
};

const GATEWAY_DEFAULT_AUTH_KEYS: Record<string, string[]> = {
  iyzico: [
    "api_key",
    "secret_key",
    "marketplace_mode",
    "sub_merchant_key",
    "store_sub_merchant_keys",
  ],
};

// Field-level tooltip descriptions shown when admin clicks the (!) icon
const FIELD_TOOLTIPS: Record<string, Record<string, string>> = {
  iyzico: {
    api_key:
      "iyzico Merchant Portal → Ayarlar → Firma Ayarları → API Anahtarları → API Anahtarı",
    secret_key:
      "iyzico Merchant Portal → Ayarlar → Firma Ayarları → API Anahtarları → Güvenlik Anahtarı",
    sub_merchant_key:
      "iyzico Merchant Portal → Alt Üye İşyerleri sayfasından mağazanıza ait 'Alt Üye İşyeri Anahtarı' değerini buraya girin. Marketplace Mode açıkken tüm ödemeler için varsayılan sub-merchant key olarak kullanılır.",
    store_sub_merchant_keys:
      'Her mağazanın kendi iyzico sub-merchant hesabı varsa buraya JSON formatında girin. Örnek: {"5": "sub_merchant_key_1", "12": "sub_merchant_key_2"}. Anahtar olarak admin paneldeki Store ID kullanılır. Tek sub-merchant kullanıyorsanız boş bırakın.',
  },
  paytr: {
    merchant_id:
      "PayTR Merchant Panel → Hesap Bilgileri bölümünden Merchant ID değerini buraya girin.",
    merchant_key:
      "PayTR Merchant Panel → Hesap Bilgileri bölümünden Merchant Key değerini buraya girin.",
    merchant_salt:
      "PayTR Merchant Panel → Hesap Bilgileri bölümünden Merchant Salt değerini buraya girin.",
  },
  moka: {
    dealer_code:
      "Moka Pos tarafından size verilen Dealer Code (bayi kodu) değerini buraya girin.",
    username:
      "Moka Pos API erişimi için kullandığınız kullanıcı adını buraya girin.",
    password:
      "Moka Pos API erişimi için kullandığınız şifreyi buraya girin.",
  },
  ziraatpay: {
    merchant_id:
      "ZiraatPay tarafından size verilen Merchant ID (üye işyeri numarası) değerini buraya girin.",
    terminal_id:
      "ZiraatPay tarafından atanan Terminal ID değerini buraya girin.",
    secret_key:
      "ZiraatPay API erişimi için kullanılan Secret Key değerini buraya girin.",
  },
};

type Props = {
  getwayname?: string;
  paymentgetway?: any;
  refetch: () => void;
  refetchList?: () => void;
  isPending: boolean;
  isFetching?: boolean;
  error?: unknown;
};

const GetwaySettingsForm = ({
  getwayname = "cash_on_delivery",
  paymentgetway,
  refetch,
  refetchList,
  isPending,
  error,
}: Props) => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const { register, setValue, handleSubmit } = useForm<any>({
    resolver: zodResolver(getwaySettingsSchema),
  });

  const t = useTranslations();
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [toggles, setToggles] = useState<ToggleState>({
    status: false,
    is_test_mode: false,
  });
  const [iyzicoMarketplaceMode, setIyzicoMarketplaceMode] = useState(false);

  const getwaySettingsData = useMemo(() => (paymentgetway as any) || {}, [paymentgetway]);

  const authCredentialKeys = useMemo(() => {
    const credentials = getwaySettingsData?.auth_credentials;
    const existingKeys =
      credentials && typeof credentials === "object"
        ? Object.keys(credentials)
        : ([] as string[]);
    const defaultKeys = GATEWAY_DEFAULT_AUTH_KEYS[getwayname] ?? [];
    return Array.from(new Set([...existingKeys, ...defaultKeys]));
  }, [getwaySettingsData?.auth_credentials, getwayname]);

  useEffect(() => {
    setValue("gateway_name", getwayname ?? "");
    setValue("description", getwaySettingsData?.description ?? "");

    authCredentialKeys.forEach((key) => {
      let value = getwaySettingsData?.auth_credentials?.[key] ?? "";
      if (value && typeof value === "object") {
        value = JSON.stringify(value);
      }
      setValue(key, value);
    });

    setLastSelectedLogo({
      image_id: getwaySettingsData?.image || "",
      img_url: getwaySettingsData?.image_url || "",
      name: "Logo",
    });

    setToggles({
      status: Boolean(getwaySettingsData?.status),
      is_test_mode: Boolean(getwaySettingsData?.is_test_mode),
    });
    const rawMarketplaceMode = getwaySettingsData?.auth_credentials?.marketplace_mode;
    const normalizedMarketplaceMode =
      typeof rawMarketplaceMode === "boolean"
        ? rawMarketplaceMode
        : ["1", "true", "yes", "on"].includes(
            String(rawMarketplaceMode ?? "")
              .trim()
              .toLowerCase()
          );
    setIyzicoMarketplaceMode(normalizedMarketplaceMode);
  }, [authCredentialKeys, getwaySettingsData, getwayname, setValue]);

  const handleSaveLogoIcon = (images: UploadedImage[]) => {
    setLastSelectedLogo(images[0]);
  };

  const removeLogo = () => {
    setLastSelectedLogo(null);
  };

  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => ({
      ...prev,
      [property]: !prev[property],
    }));
  };

  const { mutate: paymentGetwayService, isPending: isUpdating } =
    usePaymentGetwayStoreMutation(getwayname);

  const onSubmit = async (values: any) => {
    const filteredCredentialObject = Object.fromEntries(
      authCredentialKeys
        .filter((key) => key !== "marketplace_mode")
        .map((key) => [key, values?.[key] ?? ""])
    );

    if (getwayname === "iyzico") {
      filteredCredentialObject.marketplace_mode = iyzicoMarketplaceMode;
      if (!iyzicoMarketplaceMode) {
        filteredCredentialObject.sub_merchant_key = null;
        filteredCredentialObject.store_sub_merchant_keys = null;
      }
    }

    const selectedImageId = lastSelectedLogo?.image_id
      ? String(lastSelectedLogo.image_id)
      : undefined;

    const submissionData = {
      id: getwaySettingsData?.id ? getwaySettingsData.id : 0,
      name: getwaySettingsData?.name || formatLabel(getwayname || "", "_"),
      description: values.description,
      auth_credentials: authCredentialKeys.length ? filteredCredentialObject : null,
      status: toggles.status,
      is_test_mode: toggles.is_test_mode,
      image: selectedImageId,
    };

    return paymentGetwayService(submissionData as GetwaySettingsFormData, {
      onSuccess: () => {
        refetch();
        refetchList?.();
      },
    });
  };

  useEffect(() => {
    if (!isPending && !error) {
      refetch();
    }
  }, [error, isPending, refetch]);

  const trigger = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-24 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo.img_url}
            alt={lastSelectedLogo.name as string}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded p-4"
          />
          <div className=" absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-xs font-bold text-red-500 p-1">{t("common.change_image")}</p>
          </div>
        </div>
      ) : (
        <div className=" w-32 h-24 border-2 border-dashed border-blue-500  text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
          <div className="flex flex-col items-center justify-center mt-2">
            <CloudIcon />
            <p className="mt-2 text-blue-500 text-xs font-medium">{t("common.drag_and_drop")}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {isPending ? (
        <CardSkletonLoader CustomClass="!p-2 !shadow-none" />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="p-2 md:p-4">
            <p className="text-lg md:text-2xl font-medium mb-4">{t("label.payment_gateway")}</p>
            <div dir={dir}>
              <div className="bg-gray-200 dark:bg-gray-700 p-4 border-l-8 border-blue-600">
                {t("common.payment_gateway_currency_note_prefix")}{" "}
                <strong>
                  <i className="capitalize">{formatLabel(getwayname || "", "_")}</i>
                </strong>
                {t("common.payment_gateway_currency_note_suffix")}
              </div>

              <div className="mt-6">
                <div className=" grid grid-cols-2">
                  <p className="text-1xl font-medium mb-1">
                    {t("common.enable_disable")}{" "}
                    <strong>
                      <i className="capitalize">{formatLabel(getwayname || "", "_")}</i>
                    </strong>
                  </p>
                  <Switch
                    dir="ltr"
                    checked={toggles.status}
                    onCheckedChange={() => handleToggle("status")}
                  />
                </div>

                <div className="my-4 grid grid-cols-2">
                  <p className="text-1xl font-medium mb-1">
                    {t("label.enable_disable_test_mode")}{" "}
                    <strong>
                      <i className="capitalize">{formatLabel(getwayname || "", "_")}</i>
                    </strong>
                  </p>
                  <Switch
                    dir="ltr"
                    checked={toggles.is_test_mode}
                    onCheckedChange={() => handleToggle("is_test_mode")}
                  />
                </div>

                {getwayname === "iyzico" && (
                  <div className="my-4 grid grid-cols-2">
                    <p className="text-1xl font-medium mb-1">
                      {t("label.enable_disable_marketplace_mode")}{" "}
                      <strong>
                        <i className="capitalize">{formatLabel(getwayname || "", "_")}</i>
                      </strong>
                    </p>
                    <Switch
                      dir="ltr"
                      checked={iyzicoMarketplaceMode}
                      onCheckedChange={(value) => setIyzicoMarketplaceMode(Boolean(value))}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4 my-6">
                <div>
                  <p className="text-sm font-medium my-2">
                    <strong>
                      <i className="capitalize">{formatLabel(getwayname || "", "_")}</i>
                    </strong>{" "}
                    {t("label.logo")}
                  </p>
                  <div className="relative flex align-start gap-4">
                    <div className="relative w-32">
                      <PhotoUploadModal
                        trigger={trigger}
                        isMultiple={false}
                        onSave={handleSaveLogoIcon}
                        usageType="gateway_settings"
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
                    </div>
                  </div>
                </div>
              </div>

              {authCredentialKeys.map((key) => {
                if (key === "marketplace_mode") return null;
                if (
                  getwayname === "iyzico" &&
                  !iyzicoMarketplaceMode &&
                  (key === "sub_merchant_key" || key === "store_sub_merchant_keys")
                ) {
                  return null;
                }

                return (
                <div className="mb-4" key={key}>
                  <div className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span>{formatLabel(key, "_")}</span>
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-custom-dark-blue max-w-xs">
                            <p className="p-1 text-sm font-medium">
                              {FIELD_TOOLTIPS[getwayname]?.[key] ??
                                t("common.please_provide_dynamic", {
                                  field: formatLabel(key, "_"),
                                })}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  {key === "store_sub_merchant_keys" ? (
                    <Textarea
                      id={key}
                      {...register(key as keyof GetwaySettingsFormData)}
                      className="app-input font-mono text-sm"
                      rows={4}
                      placeholder={'{"store_id_1": "sub_merchant_key_1", "store_id_2": "sub_merchant_key_2"}'}
                    />
                  ) : (
                    <Input
                      id={key}
                      {...register(key as keyof GetwaySettingsFormData)}
                      className="app-input"
                      placeholder={t("place_holder.enter_value")}
                    />
                  )}
                </div>
              )})}

              <div className="mb-4">
                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>{t("common.description")}</span>
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-custom-dark-blue">
                          <p className="p-1 text-sm font-medium">
                            {t("common.please_provide_description")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <Textarea
                  id="description"
                  {...register("description" as keyof GetwaySettingsFormData)}
                  className="app-input"
                  placeholder={t("place_holder.enter_value")}
                />
              </div>

              <div className="mt-4">
                <SubmitButton IsLoading={isUpdating} AddLabel={t("button.update_changes")} />
              </div>
            </div>
          </CardContent>
        </form>
      )}
    </div>
  );
};

export default GetwaySettingsForm;
