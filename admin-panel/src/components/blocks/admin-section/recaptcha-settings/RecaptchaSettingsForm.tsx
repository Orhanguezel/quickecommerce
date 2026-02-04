"use client";
import Loader from "@/components/molecules/Loader";
import { SubmitButton } from "@/components/blocks/shared";
import { Card, CardContent, Input, Switch } from "@/components/ui";
import {
  useRecaptchaSettingsQuery,
  useRecaptchaSettingsStoreMutation,
} from "@/modules/admin-section/recaptcha-settings/recaptcha-settings.action";
import {
  RecaptchaSettingsFormData,
  recaptchaSettingsSchema,
} from "@/modules/admin-section/recaptcha-settings/recaptcha-settings.schema";
import {
  useSocialSettingsQuery,
  useSocialSettingsStoreMutation,
} from "@/modules/admin-section/social-login-settings/social-login-settings.action";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

type ToggleState = {
  com_google_recaptcha_enable_disable: string;
};

const RecaptchaSettingsForm = ({ data }: any) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const { register, setValue, handleSubmit } =
    useForm<RecaptchaSettingsFormData>({
      resolver: zodResolver(recaptchaSettingsSchema),
    });

  const [toggles, setToggles] = useState<ToggleState>({
    com_google_recaptcha_enable_disable: "",
  });

  const {
    recaptchaSettingsData,
    refetch,
    isPending: isLoading,
    error,
  } = useRecaptchaSettingsQuery({});
  const QueryGeneralSettingsData = useMemo(
    () => (recaptchaSettingsData as any) || [],
    [recaptchaSettingsData]
  );

  useEffect(() => {
    let GeneralSettingsMessage = QueryGeneralSettingsData?.message;
    if (GeneralSettingsMessage) {
      setValue(
        "com_google_recaptcha_v3_site_key",
        GeneralSettingsMessage?.site_key ?? ""
      );
      setValue(
        "com_google_recaptcha_v3_secret_key",
        GeneralSettingsMessage?.secret_key ?? ""
      );
      setToggles({
        com_google_recaptcha_enable_disable:
          GeneralSettingsMessage?.recaptcha_enable_disable || "",
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
    useRecaptchaSettingsStoreMutation();
  const onSubmit = async (values: RecaptchaSettingsFormData) => {
    const defaultData = {
      ...values,
      com_google_recaptcha_enable_disable:
        toggles.com_google_recaptcha_enable_disable,
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
    if (!isLoading && !error) {
      refetch();
    }
  }, [isLoading, refetch, error]);

  return (
    <div>
      {isLoading ? (
        <CardSkletonLoader />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="">
            <Card className="mt-4">
              <CardContent className="p-2 md:p-6">
                <div>
                  <div dir={dir}>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">
                        {t("label.cloudflare_recaptcha_v3_site_key")}
                      </p>
                      <Input
                        id="com_google_recaptcha_v3_site_key"
                        {...register(
                          "com_google_recaptcha_v3_site_key" as keyof RecaptchaSettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">
                        {t("label.cloudflare_recaptcha_v3_secret_key")}
                      </p>
                      <Input
                        id="com_google_recaptcha_v3_secret_key"
                        {...register(
                          "com_google_recaptcha_v3_secret_key" as keyof RecaptchaSettingsFormData
                        )}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>

                    <div className="mt-6">
                      <div className="my-4 grid grid-cols-3 md:grid-cols-6">
                        <p className="col-span-2 text-sm font-medium mb-1">
                          {t("label.cloudflare_recaptcha_enable_disable")}
                        </p>
                        <Switch
                          dir="ltr"
                          checked={
                            toggles.com_google_recaptcha_enable_disable === "on"
                          }
                          onCheckedChange={() =>
                            handleToggle("com_google_recaptcha_enable_disable")
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 ">
                  <SubmitButton
                    IsLoading={isPending}
                    AddLabel={t("button.save_changes")}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
};

export default RecaptchaSettingsForm;
