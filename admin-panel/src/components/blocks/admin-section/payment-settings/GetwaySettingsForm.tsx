"use client";
import CloudIcon from "@/assets/icons/CloudIcon";
import Loader from "@/components/molecules/Loader";
import { SubmitButton } from "@/components/blocks/shared";
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
import {
  usePaymentGetwayQuery,
  usePaymentGetwayStoreMutation,
} from "@/modules/admin-section/payment-settings/payment-settings.action";
import {
  GetwaySettingsFormData,
  getwaySettingsSchema,
} from "@/modules/admin-section/payment-settings/payment-settings.schema";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Cancel from "../../custom-icons/Cancel";
import PhotoUploadModal, { type UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

type ToggleState = {
  status: boolean;
  is_test_mode: boolean;
};

const GetwaySettingsForm = ({
  getwayname = "Stripe",
  paymentgetway,
  refetch,
  isPending,
  isFetching,
  error,
}: any) => {
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

  const GetwaySettingsData = useMemo(
    () => (paymentgetway as any) || [],
    [paymentgetway]
  );

  useEffect(() => {
    if (GetwaySettingsData?.auth_credentials) {
      setValue("gateway_name", getwayname ?? "");
      setValue("description", GetwaySettingsData.description ?? "");

      if (GetwaySettingsData.auth_credentials) {
        Object.entries(GetwaySettingsData.auth_credentials).forEach(
          ([key, value]) => {
            setValue(key, value ?? "");
          }
        );
      }
      setLastSelectedLogo({
        image_id: GetwaySettingsData?.image ? GetwaySettingsData?.image : "",
        img_url: GetwaySettingsData?.image_url
          ? GetwaySettingsData?.image_url
          : "",
        name: "Logo",
      });

      setToggles({
        status: GetwaySettingsData?.status,
        is_test_mode: GetwaySettingsData?.is_test_mode,
      });
    }
    if (GetwaySettingsData?.slug === "cash_on_delivery") {
      setValue("gateway_name", getwayname ?? "");
      setValue("description", GetwaySettingsData.description ?? "");
      setLastSelectedLogo({
        image_id: GetwaySettingsData?.image ? GetwaySettingsData?.image : "",
        img_url: GetwaySettingsData?.image_url
          ? GetwaySettingsData?.image_url
          : "",
        name: "Logo",
      });
      setToggles({
        status: GetwaySettingsData?.status,
        is_test_mode: GetwaySettingsData?.is_test_mode,
      });
    }
  }, [GetwaySettingsData, setValue, getwayname]);

  const handleSavelogoIcon = (images: UploadedImage[]) => {
    setLastSelectedLogo(images[0]);
  };
  const removeLogo = () => {
    setLastSelectedLogo(null);
  };

  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => ({
      ...prev,
      [property]: prev[property] === true ? false : true,
    }));
  };

  const { mutate: PaymentGetwayService, isPending: isUpdating } =
    usePaymentGetwayStoreMutation(getwayname);
  const onSubmit = async (values: any) => {
    let getwaykey = getwayname.toLowerCase() + "_";
    const filteredCredentialObject = Object.fromEntries(
      Object.entries(values).filter(([key, value]) => key.includes(getwaykey))
    );
    console.log(filteredCredentialObject);
    const selectedImageId = (lastSelectedLogo?.image_id).toString();
    const defaultData = {
      name: getwayname,
      description: values.description,
      auth_credentials: filteredCredentialObject,
      status: toggles.status,
      is_test_mode: toggles.is_test_mode,
    };
    const submissionData = {
      ...defaultData,
      id: GetwaySettingsData?.id ? GetwaySettingsData?.id : 0,
      image: lastSelectedLogo ? selectedImageId : undefined,
    };

    return PaymentGetwayService(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  useEffect(() => {
    if (!isPending && !error) {
      refetch();
    }
  }, [isPending, refetch, error]);

  const trigger = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-24 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={lastSelectedLogo?.name as string}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded p-4"
          />
          <div className=" absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-xs font-bold text-red-500 p-1">
              {t("common.change_image")}
            </p>
          </div>
        </div>
      ) : (
        <div className=" w-32 h-24 border-2 border-dashed border-blue-500  text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
          <div className="flex flex-col items-center justify-center mt-2">
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
      {isPending ? (
        <CardSkletonLoader CustomClass="!p-2 !shadow-none" />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="p-2 md:p-4">
            <p className="text-lg md:text-2xl font-medium mb-4">
              Payment Getway
            </p>
            <div dir={dir}>
              <>
                <div className="bg-gray-200 dark:bg-gray-700 p-4 border-l-8 border-blue-600">
                  If your currency is not available in{" "}
                  <strong>
                    <i className="capitalize">
                      {formatLabel(getwayname || "", "_")}
                    </i>
                  </strong>
                  , it will convert you currency value to USD value based on
                  your currency exchange rate.
                </div>
                <div className="mt-6">
                  <div className=" grid grid-cols-2">
                    <p className="text-1xl font-medium mb-1">
                      Enable/Disable{" "}
                      <strong>
                        <i className="capitalize">
                          {formatLabel(getwayname || "", "_")}
                        </i>
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
                        <i className="capitalize">
                          {formatLabel(getwayname || "", "_")}
                        </i>
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
                      {" "}
                      <strong>
                        <i className="capitalize">
                          {formatLabel(getwayname || "", "_")}
                        </i>
                      </strong>{" "}
                      Logo
                    </p>
                    <div className="relative flex align-start gap-4">
                      <div className="relative w-32">
                        <PhotoUploadModal
                          trigger={trigger}
                          isMultiple={false}
                          onSave={handleSavelogoIcon}
                          usageType="gateway_settings"
                          selectedImage={lastSelectedLogo}
                        />
                        {lastSelectedLogo?.image_id && (
                          <Cancel
                            customClass="absolute top-0 right-0 m-1"
                            onClick={(event: {
                              stopPropagation: () => void;
                            }) => {
                              event.stopPropagation();
                              removeLogo();
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {getwayname && getwayname == "Paypal" ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Sandbox Client Id</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please provide Sandbox Client Id
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paypal_sandbox_client_id"
                        {...register(
                          "paypal_sandbox_client_id" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                        autoFocus={false}
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Sandbox Client Secret</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Sandbox Client Secret
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paypal_sandbox_client_secret"
                        {...register(
                          "paypal_sandbox_client_secret" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Sandbox Client App Id</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please provide Sandbox App Id
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paypal_sandbox_client_app_id"
                        {...register(
                          "paypal_sandbox_client_app_id" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Live Client Id</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please provide Live Client Id
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paypal_live_client_id"
                        {...register(
                          "paypal_live_client_id" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Live Client Secret</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please provide Live Client Secret
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paypal_live_client_secret"
                        {...register(
                          "paypal_live_client_secret" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Live App Id</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please provide Live App Id
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paypal_live_app_id"
                        {...register(
                          "paypal_live_app_id" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                  </>
                ) : getwayname && getwayname == "Stripe" ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Public key</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Public key
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="stripe_public_key"
                        {...register(
                          "stripe_public_key" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Secret key</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Secret key
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="stripe_secret_key"
                        {...register(
                          "stripe_secret_key" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Webhook Secret</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide  Webhook Secret
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="stripe_webhook_secret"
                        {...register(
                          "stripe_webhook_secret" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4 mb-4 w-full">
                      <div className="">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Success Url </span>
                        </div>
                        <Input
                          id="stripe_success_url"
                          {...register(
                            "stripe_success_url" as keyof GetwaySettingsFormData
                          )}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>
                      <div className="">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Cancel Url</span>
                        </div>
                        <Input
                          id="stripe_cancel_url"
                          {...register(
                            "stripe_cancel_url" as keyof GetwaySettingsFormData
                          )}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>
                    </div>
                  </>
                ) : getwayname && getwayname == "PayTm" ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Merchant key</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Merchant key
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paytm_merchant_key"
                        {...register(
                          "paytm_merchant_key" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Merchant Mid</span>
                      </p>
                      <Input
                        id="paytm_merchant_mid"
                        {...register(
                          "paytm_merchant_mid" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Merchant Website</span>
                      </p>
                      <Input
                        id="paytm_merchant_website"
                        {...register(
                          "paytm_merchant_website" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Channel</span>
                      </p>
                      <Input
                        id="paytm_channel"
                        {...register(
                          "paytm_channel" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Industry Type</span>
                      </p>
                      <Input
                        id="paytm_industry_type"
                        {...register(
                          "paytm_industry_type" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                  </>
                ) : getwayname && getwayname == "Paystack" ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Public key</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Public key
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paystack_public_key"
                        {...register(
                          "paystack_public_key" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Secret key</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Secret key
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paystack_secret_key"
                        {...register(
                          "paystack_secret_key" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Merchant email</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Merchant email
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paystack_merchant_email"
                        {...register(
                          "paystack_merchant_email" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                  </>
                ) : getwayname && getwayname == "Mollie" ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Public key</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Public key
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="mollie_public_key"
                        {...register(
                          "mollie_public_key" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                  </>
                ) : getwayname && getwayname == "Zitopay" ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Username</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Username
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="zitopay_username"
                        {...register(
                          "zitopay_username" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                  </>
                ) : getwayname && getwayname == "Paytabs" ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Profile id</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Profile id
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paytabs_profile_id"
                        {...register(
                          "paytabs_profile_id" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Region</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Region
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paytabs_region"
                        {...register(
                          "paytabs_region" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Server key</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Server key
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="paytabs_server_key"
                        {...register(
                          "paytabs_server_key" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                  </>
                ) : getwayname && getwayname == "Billplz" ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Key</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Key
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="billplz_key"
                        {...register(
                          "billplz_key" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Version</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Version
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="billplz_version"
                        {...register(
                          "billplz_version" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>X signature</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide X signature
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="billplz_x_signature"
                        {...register(
                          "billplz_x_signature" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Collection name</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Collection name
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="billplz_collection_name"
                        {...register(
                          "billplz_collection_name" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                  </>
                ) : getwayname && getwayname == "Flutterwave" ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Public key</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Public key
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="flutterwave_public_key"
                        {...register(
                          "flutterwave_public_key" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Secret key</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Secret key
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="flutterwave_secret_key"
                        {...register(
                          "flutterwave_secret_key" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>Secret hash</span>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please Provide Secret hash
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Input
                        id="flutterwave_secret_hash"
                        {...register(
                          "flutterwave_secret_hash" as keyof GetwaySettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                  </>
                ) : null}
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
                            <p className="p-1 text-sm font-medium">
                              Please provide description
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
                    placeholder="Enter value"
                  />
                </div>
                <div className="mt-4">
                  <SubmitButton
                    IsLoading={isUpdating}
                    AddLabel="Update Changes"
                  />
                </div>
              </>
            </div>
          </CardContent>
        </form>
      )}
    </div>
  );
};

export default GetwaySettingsForm;
