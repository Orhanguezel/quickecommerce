"use client";
import Loader from "@/components/molecules/Loader";
import { SubmitButton } from "@/components/blocks/shared";
import { Card, CardContent, Input, Switch } from "@/components/ui";
import {
  useSocialSettingsQuery,
  useSocialSettingsStoreMutation,
} from "@/modules/admin-section/social-login-settings/social-login-settings.action";
import {
  SocialLoginSettingsFormData,
  socialSettingsSchema,
} from "@/modules/admin-section/social-login-settings/social-login-settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

type ToggleState = {
  com_google_login_enabled: string;
  com_facebook_login_enabled: string;
};

const SocialLoginSettingsForm = ({ data }: any) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const { register, setValue, handleSubmit } =
    useForm<SocialLoginSettingsFormData>({
      resolver: zodResolver(socialSettingsSchema),
    });

  const [toggles, setToggles] = useState<ToggleState>({
    com_google_login_enabled: "",
    com_facebook_login_enabled: "",
  });

  const {
    generalSettingsData,
    refetch,
    isPending: isLoading,
  } = useSocialSettingsQuery({});
  const QueryGeneralSettingsData = useMemo(
    () => (generalSettingsData as any) || [],
    [generalSettingsData]
  );

  useEffect(() => {
    let GeneralSettingsMessage = QueryGeneralSettingsData?.message;
    if (GeneralSettingsMessage) {
      setValue(
        "com_google_app_id",
        GeneralSettingsMessage?.com_google_app_id ?? ""
      );
      setValue(
        "com_google_client_secret",
        GeneralSettingsMessage?.com_google_client_secret ?? ""
      );
      setValue(
        "com_google_client_callback_url",
        GeneralSettingsMessage?.com_google_client_callback_url ?? ""
      );
      setValue(
        "com_facebook_app_id",
        GeneralSettingsMessage?.com_facebook_app_id ?? ""
      );
      setValue(
        "com_facebook_client_secret",
        GeneralSettingsMessage?.com_facebook_client_secret ?? ""
      );
      setValue(
        "com_facebook_client_callback_url",
        GeneralSettingsMessage?.com_facebook_client_callback_url ?? ""
      );

      setToggles({
        com_google_login_enabled:
          GeneralSettingsMessage?.com_google_login_enabled || "",
        com_facebook_login_enabled:
          GeneralSettingsMessage?.com_facebook_login_enabled || "",
      });
    }
  }, [QueryGeneralSettingsData, setValue]);

  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => ({
      ...prev,
      [property]: prev[property] === "on" ? "" : "on",
    }));
  };

  const { mutate: GeneralSettingsStore, isPending } =
    useSocialSettingsStoreMutation();
  const onSubmit = async (values: SocialLoginSettingsFormData) => {
    const defaultData = {
      ...values,
      com_google_login_enabled: toggles.com_google_login_enabled,
      com_facebook_login_enabled: toggles.com_facebook_login_enabled,
    };

    return GeneralSettingsStore(
      { ...(defaultData as any) },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  useEffect(() => {
    if (!isLoading) refetch();
  }, [isLoading, refetch]);

  return (
    <div>
      {isLoading ? (
        <CardSkletonLoader />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
            {/* Google Section */}
            <Card className="mt-4">
              <CardContent className="p-2 md:p-6">
                <div>
                  <h2 className="text-lg md:text-2xl font-medium mb-4">
                    {t("label.google_credential")}
                  </h2>
                  <div dir={dir}>
                    <div className="mb-4">
                      <label
                        htmlFor="com_google_app_id"
                        className="text-sm font-medium mb-1 block"
                      >
                        {t("label.google_app_id")}
                      </label>
                      <Input
                        id="com_google_app_id"
                        {...register(
                          "com_google_app_id" as keyof SocialLoginSettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="com_google_client_secret"
                        className="text-sm font-medium mb-1 block"
                      >
                        {t("label.google_client_secret")}
                      </label>
                      <Input
                        id="com_google_client_secret"
                        {...register(
                          "com_google_client_secret" as keyof SocialLoginSettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="com_google_client_callback_url"
                        className="text-sm font-medium mb-1 block"
                      >
                        {t("label.google_client_url")}
                      </label>
                      <Input
                        id="com_google_client_callback_url"
                        {...register(
                          "com_google_client_callback_url" as keyof SocialLoginSettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>

                    <div className="mt-6">
                      <div className="my-4 grid grid-cols-3 md:grid-cols-4 items-center">
                        <label
                          htmlFor="google-login-toggle"
                          className="col-span-2 text-sm font-medium mb-1"
                        >
                          {t("label.google_login_enable")}
                        </label>
                        <Switch
                          id="google-login-toggle"
                          dir="ltr"
                          checked={toggles.com_google_login_enabled === "on"}
                          onCheckedChange={() =>
                            handleToggle("com_google_login_enabled")
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facebook Section */}
            <Card className="mt-4">
              <CardContent className="p-2 md:p-6">
                <div>
                  <h2 className="text-lg md:text-2xl font-medium mb-4">
                    {t("label.facebook_credential")}
                  </h2>
                  <div dir={dir}>
                    <div className="mb-4">
                      <label
                        htmlFor="com_facebook_app_id"
                        className="text-sm font-medium mb-1 block"
                      >
                        {t("label.facebook_app_id")}
                      </label>
                      <Input
                        id="com_facebook_app_id"
                        {...register(
                          "com_facebook_app_id" as keyof SocialLoginSettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="com_facebook_client_secret"
                        className="text-sm font-medium mb-1 block"
                      >
                        {t("label.facebook_client_secret")}
                      </label>
                      <Input
                        id="com_facebook_client_secret"
                        {...register(
                          "com_facebook_client_secret" as keyof SocialLoginSettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="com_facebook_client_callback_url"
                        className="text-sm font-medium mb-1 block"
                      >
                        {t("label.facebook_client_url")}
                      </label>
                      <Input
                        id="com_facebook_client_callback_url"
                        {...register(
                          "com_facebook_client_callback_url" as keyof SocialLoginSettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>

                    <div className="mt-6">
                      <div className="my-4 grid grid-cols-3 md:grid-cols-4 items-center">
                        <label
                          htmlFor="facebook-login-toggle"
                          className="col-span-2 text-sm font-medium mb-1"
                        >
                          {t("label.facebook_login_enable")}
                        </label>
                        <Switch
                          id="facebook-login-toggle"
                          dir="ltr"
                          checked={toggles.com_facebook_login_enabled === "on"}
                          onCheckedChange={() =>
                            handleToggle("com_facebook_login_enabled")
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton
              IsLoading={isPending}
              AddLabel={t("button.save_changes")}
            />
          </Card>
        </form>
      )}
    </div>
  );
};

export default SocialLoginSettingsForm;
