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
  iyzico: ["api_key", "secret_key", "sub_merchant_key", "store_sub_merchant_keys"],
};

type Props = {
  getwayname?: string;
  paymentgetway?: any;
  refetch: () => void;
  isPending: boolean;
  isFetching?: boolean;
  error?: unknown;
};

const GetwaySettingsForm = ({
  getwayname = "cash_on_delivery",
  paymentgetway,
  refetch,
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
      setValue(key, getwaySettingsData?.auth_credentials?.[key] ?? "");
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
      authCredentialKeys.map((key) => [key, values?.[key] ?? ""])
    );

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
            <p className="text-lg md:text-2xl font-medium mb-4">Payment Getway</p>
            <div dir={dir}>
              <div className="bg-gray-200 dark:bg-gray-700 p-4 border-l-8 border-blue-600">
                If your currency is not available in{" "}
                <strong>
                  <i className="capitalize">{formatLabel(getwayname || "", "_")}</i>
                </strong>
                , it will convert you currency value to USD value based on your currency exchange rate.
              </div>

              <div className="mt-6">
                <div className=" grid grid-cols-2">
                  <p className="text-1xl font-medium mb-1">
                    Enable/Disable{" "}
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
                    Enable/Disable Test Mode{" "}
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
              </div>

              <div className="grid grid-cols-4 gap-4 my-6">
                <div>
                  <p className="text-sm font-medium my-2">
                    <strong>
                      <i className="capitalize">{formatLabel(getwayname || "", "_")}</i>
                    </strong>{" "}
                    Logo
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

              {authCredentialKeys.map((key) => (
                <div className="mb-4" key={key}>
                  <div className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span>{formatLabel(key, "_")}</span>
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-custom-dark-blue">
                            <p className="p-1 text-sm font-medium">Please provide {formatLabel(key, "_")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <Input
                    id={key}
                    {...register(key as keyof GetwaySettingsFormData)}
                    className="app-input"
                    placeholder="Enter value"
                  />
                </div>
              ))}

              <div className="mb-4">
                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>Description</span>
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-custom-dark-blue">
                          <p className="p-1 text-sm font-medium">Please provide description</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <Textarea
                  id="description"
                  {...register("description" as keyof GetwaySettingsFormData)}
                  className="app-input"
                  placeholder="Enter value"
                />
              </div>

              <div className="mt-4">
                <SubmitButton IsLoading={isUpdating} AddLabel="Update Changes" />
              </div>
            </div>
          </CardContent>
        </form>
      )}
    </div>
  );
};

export default GetwaySettingsForm;
