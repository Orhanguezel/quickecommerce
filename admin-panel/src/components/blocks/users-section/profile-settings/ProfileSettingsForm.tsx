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
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import CloudIcon from "@/assets/icons/CloudIcon";
import Loader from "@/components/molecules/Loader";
import { SubmitButton } from "@/components/blocks/shared";
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  useEffect(() => {
    if (!editData || !QueryGeneralSettingsData) return;
    setValue("first_name", editData.first_name ?? "");
    setValue("last_name", editData.last_name ?? "");
    setValue("phone", editData.phone ?? "");
    setValue("email", editData.email ?? "");
    setPhoneNumber(editData.phone ?? "");

    setLastSelectedImages({
      image_id: editData.image ?? "",
      img_url: editData.image_url ?? "",
      name: "profile image",
    });
  }, [
    editData,
    editData?.id,
    QueryGeneralSettingsData,
    QueryGeneralSettingsData?.id,
    setValue,
  ]);

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

  useEffect(() => {
    if (!isPending && !error) {
      refetch();
    }
  }, [isPending, refetch, error]);

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

  return (
    <div dir={dir}>
      {isLoading ? (
        <CardSkletonLoader />
      ) : (
        <Tabs
          defaultValue="low_stock"
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <Card className="mt-4">
            <CardContent className="p-4">
              <TabsList className="flex items-center justify-start gap-2 bg-transparent">
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
      )}
    </div>
  );
};

export default ProfileSettingsForm;
