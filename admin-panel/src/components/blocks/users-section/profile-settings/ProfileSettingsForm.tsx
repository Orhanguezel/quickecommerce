"use client";
import {
  Button,
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, LockKeyholeOpen } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import CloudIcon from "@/assets/icons/CloudIcon";
import Loader from "@/components/molecules/Loader";
import { SubmitButton } from "@/components/blocks/shared";
import { Building2, CreditCard } from "lucide-react";
import AppPhoneNumberInput from "@/components/blocks/common/AppPhoneNumberInput";
import {
  useProfileSettingsQuery,
  useProfileSettingsStoreMutation,
} from "@/modules/users-section/profile-settings/profile-settings.action";
import {
  ProfileSettingsFormData,
  profileSettingsSchema,
} from "@/modules/users-section/profile-settings/profile-settings.schema";
import { useMeQuery } from "@/modules/users/users.action";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";
import Cancel from "../../custom-icons/Cancel";
import PhotoUploadModal, { type UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";

import { useChangePassword } from "@/modules/users-section/profile-settings/profile-settings.action";
import { Eye, EyeOff } from "lucide-react";
import GlobalImageLoader from "@/lib/imageLoader";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";


const ProfileSettingsForm = ({ data }: any) => {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema),
  });
  const [activeTab, setActiveTab] = useState("low_stock");
  const [lastSelectedImages, setLastSelectedImages] = useState<any>(null);
  const [logoErrorMessage, setLogoErrorMessage] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const {
    profileSettingsData,
    refetch,
    isFetching,
    isPending: isLoading,
    error,
  } = useProfileSettingsQuery({});
  const { refetch: isMeRefetch } = useMeQuery();
  const QueryGeneralSettingsData = useMemo(
    () => (profileSettingsData as any) || [],
    [profileSettingsData]
  );
  const editData = useMemo(() => {
    return QueryGeneralSettingsData || {};
  }, [QueryGeneralSettingsData]);
  const lastLoadedIdRef = useRef<string | number | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  useEffect(() => {
    if (!editData || !QueryGeneralSettingsData) return;
    const currentId = (editData as any)?.id ?? null;
    if (lastLoadedIdRef.current === currentId) return;
    lastLoadedIdRef.current = currentId;
    setValue("first_name", editData.first_name ?? "");
    setValue("last_name", editData.last_name ?? "");
    setValue("phone", editData.phone ?? "");
    setValue("email", editData.email ?? "");
    setPhoneNumber(editData.phone ?? "");
    // KYC fields
    setValue("company_name", editData.company_name ?? "");
    setValue("brand_name", editData.brand_name ?? "");
    setValue("sector", editData.sector ?? "");
    setValue("tax_office", editData.tax_office ?? "");
    setValue("tax_number", editData.tax_number ?? "");
    setValue("mersis_number", editData.mersis_number ?? "");
    setValue("website_url", editData.website_url ?? "");
    setValue("address_country", editData.address_country ?? "Türkiye");
    setValue("address_city", editData.address_city ?? "");
    setValue("address_district", editData.address_district ?? "");
    setValue("address_postal_code", editData.address_postal_code ?? "");
    setValue("address_line1", editData.address_line1 ?? "");
    setValue("address_line2", editData.address_line2 ?? "");
    setValue("bank_name", editData.bank_name ?? "");
    setValue("bank_account_holder", editData.bank_account_holder ?? "");
    setValue("bank_iban", editData.bank_iban ?? "");
    setValue("bank_account_number", editData.bank_account_number ?? "");
    setValue("bank_branch_code", editData.bank_branch_code ?? "");
    setValue("bank_swift_code", editData.bank_swift_code ?? "");

    setLastSelectedImages({
      image_id: editData.image ?? "",
      img_url: editData.image_url ?? "",
      name: "profile image",
    });
  }, [editData, QueryGeneralSettingsData, setValue]);

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password2, setPassword2] = useState("");
  const [showPassword2, setShowPassword2] = useState(false);
  const { mutate: updateStoreStatus } = useChangePassword();

  const handleSave = () => {
    if (!password.trim() || !password2.trim()) {
      return toast.error(t("toast.both_password_fields_are_required"));
    }
    if (password === password2) {
      return toast.error(t("toast.password_must_be_different"));
    }

    setLoading(true);
    const submissionData = {
      old_password: password,
      new_password: password2,
    };

    updateStoreStatus(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          setLoading(false);
          setPassword("");
          setPassword2("");
        },
        onError: (error: any) => {
          toast.error(
            error instanceof Error
              ? `Error refetching data: ${error.message}`
              : "An unknown error occurred while refetching data"
          );
          setLoading(false);
        },
      }
    );
  };

  const handleSaveImages = (images: UploadedImage[]) => {
    setLastSelectedImages(images[0]);
    const dimensions = images[0].dimensions ?? "";
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

  const removePreview = () => {
    setLastSelectedImages(null);
    setLogoErrorMessage("");
  };

  const { mutate: ProfileSettingsUpdate, isPending } =
    useProfileSettingsStoreMutation();
  const onSubmit = async (values: ProfileSettingsFormData) => {
    const defaultData = {
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone,
      email: values.email,
      image: lastSelectedImages ? lastSelectedImages?.image_id : "",
      // KYC fields
      company_name: values.company_name,
      brand_name: values.brand_name,
      sector: values.sector,
      tax_office: values.tax_office,
      tax_number: values.tax_number,
      mersis_number: values.mersis_number,
      website_url: values.website_url,
      address_country: values.address_country,
      address_city: values.address_city,
      address_district: values.address_district,
      address_postal_code: values.address_postal_code,
      address_line1: values.address_line1,
      address_line2: values.address_line2,
      bank_name: values.bank_name,
      bank_account_holder: values.bank_account_holder,
      bank_iban: values.bank_iban,
      bank_account_number: values.bank_account_number,
      bank_branch_code: values.bank_branch_code,
      bank_swift_code: values.bank_swift_code,
    };
    const submissionData = {
      ...defaultData,
      id: editData?.id ? editData?.id : "",
      multipart: true,
    };
    return ProfileSettingsUpdate(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
          isMeRefetch();
        },
      }
    );
  };

  // useQuery already fetches; avoid refetch loop here

  const trigger = (
    <div className="w-32 h-32 flex flex-col items-center justify-center bg-white text-center rounded cursor-pointer  transition-colors">
      {lastSelectedImages?.img_url ? (
        <div className="relative w-32 h-32 rounded group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedImages?.img_url}
            alt={lastSelectedImages?.name as string}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-blue-50 h-18 opacity-0 w-full group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-xs font-semibold text-red-500 mb-2">
              {t("common.change_image")}
            </p>
          </div>
        </div>
      ) : (
        <div className="border-2 w-32 h-32 border-dashed border-blue-500 text-center rounded cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-2 text-blue-500 font-sm">
              {t("common.drag_and_drop")}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Role badge color mapping
  const roleBadgeColor: Record<string, string> = {
    "super-admin": "bg-purple-100 text-purple-700 border-purple-200",
    "super_admin": "bg-purple-100 text-purple-700 border-purple-200",
    "superadmin": "bg-purple-100 text-purple-700 border-purple-200",
    "admin": "bg-blue-100 text-blue-700 border-blue-200",
    "seller": "bg-green-100 text-green-700 border-green-200",
    "deliveryman": "bg-orange-100 text-orange-700 border-orange-200",
    "customer": "bg-gray-100 text-gray-700 border-gray-200",
  };
  const rawRole: string = (editData as any)?.role ?? "";
  const roleLabel = rawRole
    ? rawRole.replace(/-|_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";
  const roleBadgeClass = roleBadgeColor[rawRole.toLowerCase()] ?? "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div dir={dir}>
      {isLoading ? (
        <CardSkletonLoader />
      ) : (
        <>
          {/* Profile Header Card */}
          <Card className="mt-4">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
                  {lastSelectedImages?.img_url ? (
                    <Image
                      loader={GlobalImageLoader}
                      src={lastSelectedImages.img_url}
                      alt={String(editData?.full_name ?? "profile")}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {(editData?.first_name ?? "?")[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                    {editData?.full_name || `${editData?.first_name ?? ""} ${editData?.last_name ?? ""}`.trim() || "—"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{editData?.email ?? ""}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {roleLabel ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeClass}`}>
                        {roleLabel}
                      </span>
                    ) : null}
                    {(editData as any)?.started_at ? (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {t("label.member_since")}: {(editData as any).started_at}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        <Tabs
          defaultValue="low_stock"
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <Card className="mt-4">
            <CardContent className="p-4">
              <TabsList className="flex items-center justify-start gap-2 bg-transparent flex-wrap">
                <TabsTrigger
                  className={`${
                    isFetching ? "pointer-events-none opacity-50" : ""
                  }`}
                  value="low_stock"
                >
                  <div className="text-start">
                    <h1 className="flex items-center gap-1">
                      <Info className="w-5" />{" "}
                      <span className="text-start text-lg font-semibold">
                        {t("common.basic_info")}
                      </span>
                    </h1>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  className={`${
                    isFetching
                      ? "pointer-events-none opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  value="kyc_info"
                >
                  <div className="text-start">
                    <h1 className="flex items-center gap-1">
                      <Building2 className="w-5" />{" "}
                      <span className="text-start text-lg font-semibold">
                        {t("common.kyc_info") || "KYC / Şirket Bilgileri"}
                      </span>
                    </h1>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  className={`${
                    isFetching
                      ? "pointer-events-none opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  value="out_of_stock"
                >
                  <div className="text-start">
                    <h1 className="flex items-center gap-1">
                      <LockKeyholeOpen className="w-5" />{" "}
                      <span className="text-start text-lg font-semibold">
                        {t("common.password_change")}
                      </span>
                    </h1>
                  </div>
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>
          <TabsContent className="rounded-xl" value="low_stock">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="mt-4">
                <CardContent className="p-2 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-lg md:text-2xl font-medium mb-4">
                      {t("label.basic_information")}
                    </div>
                  </div>
                  <div
                    dir={dir}
                    className="grid lg:grid-cols-1 md:grid-cols-1 gap-4"
                  >
                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-1">
                            {t("label.first_name")}
                          </p>
                          <Input
                            type="text"
                            id="first_name"
                            {...register(
                              "first_name" as keyof ProfileSettingsFormData
                            )}
                            className="app-input"
                            placeholder={t("place_holder.enter_first_name")}
                          />
                          {errors[
                            `first_name` as keyof ProfileSettingsFormData
                          ] && (
                            <p className="text-red-500 text-sm mt-1">
                              {
                               
                                errors[`first_name`]?.message
                              }
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">
                            {t("label.last_name")}
                          </p>
                          <Input
                            type="text"
                            id="last_name"
                            {...register(
                              "last_name" as keyof ProfileSettingsFormData
                            )}
                            className="app-input"
                            placeholder={t("place_holder.enter_last_name")}
                          />
                          {errors[
                            `last_name` as keyof ProfileSettingsFormData
                          ] && (
                            <p className="text-red-500 text-sm mt-1">
                              {
                               
                                errors[`last_name`]?.message
                              }
                            </p>
                          )}
                        </div>

                        <div className="mr-3">
                          <p className="text-sm font-medium mb-1">
                            {t("label.phone")}{" "}
                          </p>
                          <AppPhoneNumberInput
                            value={phoneNumber}
                            onChange={(value) => {
                              setPhoneNumber(value);
                              setValue("phone", value);
                            }}
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.phone?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">
                            {t("label.email")}
                          </p>
                          <Input
                            type="text"
                            id="email"
                            {...register(
                              "email" as keyof ProfileSettingsFormData
                            )}
                            className="app-input"
                            placeholder={t("place_holder.enter_email")}
                          />
                          {errors[`email` as keyof ProfileSettingsFormData] && (
                            <p className="text-red-500 text-sm mt-1">
                              {
                              
                                errors[`email`]?.message
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <p className="text-sm font-medium my-2">
                        {t("label.image")}
                      </p>
                      <div className="relative w-32">
                        <PhotoUploadModal
                          trigger={trigger}
                          isMultiple={false}
                          onSave={handleSaveImages}
                          usageType="profile_settings"
                          selectedImage={lastSelectedImages}
                        />
                        {lastSelectedImages?.image_id && (
                          <Cancel
                            customClass="absolute top-0 right-0 m-1 "
                            onClick={(event: {
                              stopPropagation: () => void;
                            }) => {
                              event.stopPropagation();
                              removePreview();
                            }}
                          />
                        )}
                        {logoErrorMessage && (
                          <p className="text-red-500 text-sm mt-1">
                            {logoErrorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 ">
                    <SubmitButton
                      IsLoading={isPending}
                      AddLabel={t("button.update_profile")}
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>
          <TabsContent className="rounded-xl" value="kyc_info">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* KYC Status Banner */}
              {(editData as any)?.kyc_status !== undefined && (editData as any)?.kyc_status !== null && (
                <div className={`mt-4 p-3 rounded-lg border text-sm font-medium flex items-center gap-2
                  ${(editData as any).kyc_status === 1
                    ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                    : (editData as any).kyc_status === 2
                    ? "bg-red-50 border-red-200 text-redred-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                    : "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400"
                  }`}>
                  <span>
                    {(editData as any).kyc_status === 1
                      ? (t("label.kyc_approved") || "KYC Onaylandı ✓")
                      : (editData as any).kyc_status === 2
                      ? (t("label.kyc_rejected") || "KYC Reddedildi ✗")
                      : (t("label.kyc_pending") || "KYC İncelemede...")}
                  </span>
                  {(editData as any).kyc_admin_note && (
                    <span className="ml-2 text-xs opacity-80">— {(editData as any).kyc_admin_note}</span>
                  )}
                </div>
              )}

              {/* Company Info */}
              <Card className="mt-4">
                <CardContent className="p-4 md:p-6">
                  <div className="text-lg md:text-xl font-medium mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {t("label.company_info") || "Şirket Bilgileri"}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.company_name") || "Şirket Adı"}</p>
                      <Input type="text" id="company_name" {...register("company_name")} className="app-input" placeholder="Şirket unvanı" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.brand_name") || "Marka Adı"}</p>
                      <Input type="text" id="brand_name" {...register("brand_name")} className="app-input" placeholder="Marka / ticaret adı" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.sector") || "Sektör"}</p>
                      <Input type="text" id="sector" {...register("sector")} className="app-input" placeholder="Faaliyet sektörü" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.tax_office") || "Vergi Dairesi"}</p>
                      <Input type="text" id="tax_office" {...register("tax_office")} className="app-input" placeholder="Vergi dairesi adı" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.tax_number") || "Vergi / TC Numarası"}</p>
                      <Input type="text" id="tax_number" {...register("tax_number")} className="app-input" placeholder="Vergi numarası" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.mersis_number") || "MERSİS Numarası"}</p>
                      <Input type="text" id="mersis_number" {...register("mersis_number")} className="app-input" placeholder="MERSİS no (opsiyonel)" />
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium mb-1">{t("label.website_url") || "Web Sitesi"}</p>
                      <Input type="text" id="website_url" {...register("website_url")} className="app-input" placeholder="https://..." />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card className="mt-4">
                <CardContent className="p-4 md:p-6">
                  <div className="text-lg md:text-xl font-medium mb-4">{t("label.address_info") || "Adres Bilgileri"}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.address_country") || "Ülke"}</p>
                      <Input type="text" id="address_country" {...register("address_country")} className="app-input" placeholder="Türkiye" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.address_city") || "Şehir"}</p>
                      <Input type="text" id="address_city" {...register("address_city")} className="app-input" placeholder="İstanbul" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.address_district") || "İlçe"}</p>
                      <Input type="text" id="address_district" {...register("address_district")} className="app-input" placeholder="Kadıköy" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.address_postal_code") || "Posta Kodu"}</p>
                      <Input type="text" id="address_postal_code" {...register("address_postal_code")} className="app-input" placeholder="34000" />
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium mb-1">{t("label.address_line1") || "Adres Satırı 1"}</p>
                      <Input type="text" id="address_line1" {...register("address_line1")} className="app-input" placeholder="Sokak, no, daire..." />
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium mb-1">{t("label.address_line2") || "Adres Satırı 2 (Opsiyonel)"}</p>
                      <Input type="text" id="address_line2" {...register("address_line2")} className="app-input" placeholder="Ek adres bilgisi" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Info */}
              <Card className="mt-4">
                <CardContent className="p-4 md:p-6">
                  <div className="text-lg md:text-xl font-medium mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {t("label.bank_info") || "Banka Bilgileri"}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.bank_name") || "Banka Adı"}</p>
                      <Input type="text" id="bank_name" {...register("bank_name")} className="app-input" placeholder="Banka adı" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.bank_account_holder") || "Hesap Sahibi"}</p>
                      <Input type="text" id="bank_account_holder" {...register("bank_account_holder")} className="app-input" placeholder="Ad Soyad / Şirket adı" />
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium mb-1">{t("label.bank_iban") || "IBAN"}</p>
                      <Input type="text" id="bank_iban" {...register("bank_iban")} className="app-input" placeholder="TR00 0000 0000 0000 0000 0000 00" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.bank_account_number") || "Hesap Numarası"}</p>
                      <Input type="text" id="bank_account_number" {...register("bank_account_number")} className="app-input" placeholder="Opsiyonel" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("label.bank_swift_code") || "SWIFT Kodu"}</p>
                      <Input type="text" id="bank_swift_code" {...register("bank_swift_code")} className="app-input" placeholder="SWIFT / BIC kodu" />
                    </div>
                  </div>
                  <div className="mt-8">
                    <SubmitButton IsLoading={isPending} AddLabel={t("button.update_profile")} />
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent className="rounded-xl" value="out_of_stock">
            <Card dir={dir} className="mt-4">
              <CardContent className="p-2 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="text-lg md:text-2xl font-medium mb-4">
                    {t("label.change_password")}
                  </div>
                </div>
                <div className="">
                  <p className="text-sm font-medium mb-1">
                    {t("label.old_password")}
                  </p>
                  <div className="relative flex flex-col items-start justify-start w-full mb-4">
                    <Input
                      type={showPassword ? "text" : "password"}
                      maxLength={12}
                      placeholder={t("place_holder.enter_old_password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="app-input"
                    />
                    {showPassword ? (
                      <div
                        className={`${
                          locale === "ar" ? "left-4" : "right-4"
                        } absolute top-2 cursor-pointer`}
                      >
                        <Eye
                          className="text-gray-500 dark:text-white w-5"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </div>
                    ) : (
                      <div
                        className={`${
                          locale === "ar" ? "left-4" : "right-4"
                        } absolute top-2 cursor-pointer`}
                      >
                        <EyeOff
                          className="text-gray-500 dark:text-white w-5"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium mb-1">
                    {t("label.new_password")}
                  </p>
                  <div className="relative flex flex-col items-start justify-start w-full mb-4">
                    <Input
                      type={showPassword2 ? "text" : "password"}
                      maxLength={12}
                      placeholder={t("place_holder.enter_new_password")}
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      className="app-input"
                    />
                    {showPassword2 ? (
                      <div
                        className={`${
                          locale === "ar" ? "left-4" : "right-4"
                        } absolute top-2 cursor-pointer`}
                      >
                        <Eye
                          className="text-gray-500 dark:text-white w-5"
                          onClick={() => setShowPassword2(!showPassword2)}
                        />
                      </div>
                    ) : (
                      <div
                        className={`${
                          locale === "ar" ? "left-4" : "right-4"
                        } absolute top-2 cursor-pointer`}
                      >
                        <EyeOff
                          className="text-gray-500 dark:text-white w-5"
                          onClick={() => setShowPassword2(!showPassword2)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <Button className="app-button mt-4" onClick={handleSave}>
                  {loading ? (
                    <Loader size="small" color="text-white" />
                  ) : (
                    <span>{t("button.change_password")}</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </>
      )}
    </div>
  );
};

export default ProfileSettingsForm;
