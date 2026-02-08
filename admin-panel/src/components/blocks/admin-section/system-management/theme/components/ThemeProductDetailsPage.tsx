"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Input,
  Switch,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import multiLang from "@/components/molecules/multiLang.json";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useThemeStoreMutation } from "@/modules/admin-section/theme/theme.action";
import { SubmitButton } from "@/components/blocks/shared";
import Image from "next/image";
import CloudIcon from "@/assets/icons/CloudIcon";
import Cancel from "@/components/blocks/custom-icons/Cancel";
import PhotoUploadModal from "@/components/blocks/shared/PhotoUploadModal";

interface ThemeLoginPageProps {
  allData: any[];
  data: any[];
  sectionIndex: number;
  handleChange: (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => void;
  refetch: any;
}

type ToggleState = {
  emailVerification: string;
  loginOTP: string;
  maintenanceMode: string;
};

const makeLoginSchema = () => {
  const baseDf: Record<string, z.ZodTypeAny> = {
    delivery_title_df: z.string().optional(),
    delivery_subtitle_df: z.string().optional(),
    delivery_url: z.string().optional(),
    refund_title_df: z.string().optional(),
    refund_subtitle_df: z.string().optional(),
    refund_url: z.string().optional(),
    related_title_df: z.string().optional(),
  };

  const langs = (multiLang as Array<{ id: string }>)
    .map((l) => l.id)
    .filter((id) => id !== "df");

  const dyn: Record<string, z.ZodTypeAny> = {};
  langs.forEach((id) => {
    dyn[`delivery_title_${id}`] = z.string().optional();
    dyn[`delivery_subtitle_${id}`] = z.string().optional();
    dyn[`refund_title_${id}`] = z.string().optional();
    dyn[`refund_subtitle_${id}`] = z.string().optional();
    dyn[`related_title_${id}`] = z.string().optional();
  });

  return z.object({
    ...baseDf,
    ...dyn,
  });
};

const pageSettingsSchemaHome = makeLoginSchema();
type PageSettingsFormDataHome = z.infer<typeof pageSettingsSchemaHome>;

const ThemeProductDetailsPage: React.FC<ThemeLoginPageProps> = ({
  allData,
  data,
  sectionIndex,
  handleChange,
  refetch,
}) => {
  const t = useTranslations();
  const multiLangData = useMemo(
    () => multiLang as Array<{ id: string; label: string }>,
    []
  );
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const itemIndex = 0;

  const { register, handleSubmit, setValue } =
    useForm<PageSettingsFormDataHome>({
      resolver: zodResolver(pageSettingsSchemaHome),
    });
  const [toggles, setToggles] = useState<ToggleState>({
    emailVerification: "",
    loginOTP: "",
    maintenanceMode: "",
  });

  useEffect(() => {
    if (
      !allData ||
      !(allData as any).theme_data ||
      !(allData as any)?.translations
    )
      return;

    const loginDefault =
      (allData as any).theme_data?.theme_pages?.[0]
        ?.theme_product_details_page?.[0] || {};

    setValue("delivery_title_df", loginDefault?.delivery_title || "");
    setValue("delivery_subtitle_df", loginDefault?.delivery_subtitle || "");
    setValue("delivery_url", loginDefault?.delivery_url || "");
    setValue("refund_title_df", loginDefault?.refund_title || "");
    setValue("refund_subtitle_df", loginDefault?.refund_subtitle || "");
    setValue("refund_url", loginDefault?.refund_url || "");
    setValue("related_title_df", loginDefault?.related_title || "");

    if (loginDefault.delivery_enabled_disabled) {
      setToggles((prev) => ({
        ...prev,
        emailVerification: loginDefault.delivery_enabled_disabled,
      }));
    }
    if (loginDefault.refund_enabled_disabled) {
      setToggles((prev) => ({
        ...prev,
        loginOTP: loginDefault.refund_enabled_disabled,
      }));
    }

    multiLangData
      .filter((l) => l.id !== "df")
      .forEach((lang) => {
        const langCode = lang.id;
        const tObj =
          (allData as any)?.translations?.[langCode]?.theme_data
            ?.theme_pages?.[0]?.theme_product_details_page?.[0] || {};

        setValue(`delivery_title_${langCode}`, tObj?.delivery_title || "");
        setValue(
          `delivery_subtitle_${langCode}`,
          tObj?.delivery_subtitle || ""
        );
        setValue(`refund_title_${langCode}`, tObj?.refund_title || "");
        setValue(`refund_subtitle_${langCode}`, tObj?.refund_subtitle || "");
        setValue(`related_title_${langCode}`, tObj?.related_title || "");
      });
  }, [allData, setValue, multiLangData]);

  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => ({
      ...prev,
      [property]: prev[property] === "on" ? "" : "on",
    }));
  };

  const { mutate: ThemeStore, isPending } = useThemeStoreMutation();
  const onSubmit = (values: PageSettingsFormDataHome) => {
    const updatedThemeData = JSON.parse(
      JSON.stringify((allData as any).theme_data)
    );

    if (updatedThemeData?.theme_pages?.["0"]) {
      updatedThemeData.theme_pages["0"].theme_product_details_page = [
        {
          delivery_title: values.delivery_title_df,
          delivery_subtitle: values.delivery_subtitle_df,
          delivery_url: values.delivery_url,
          refund_title: values.refund_title_df,
          refund_subtitle: values.refund_subtitle_df,
          refund_url: values.refund_url,
          related_title: values.related_title_df,
          delivery_enabled_disabled: toggles.emailVerification,
          refund_enabled_disabled: toggles.loginOTP,
        },
      ];
    }

    if (updatedThemeData?.theme_pages?.theme_product_details_page) {
      delete updatedThemeData.theme_pages.theme_product_details_page;
    }

    const updatedTranslations: Record<string, any> = JSON.parse(
      JSON.stringify((allData as any).translations)
    );
    if (Object.keys(updatedTranslations).length > 0) {
      multiLangData.forEach((lang) => {
        const langCode = lang.id;

        if (!updatedTranslations[langCode].theme_data.theme_pages["0"]) {
          updatedTranslations[langCode].theme_data.theme_pages["0"] = {};
        }

        updatedTranslations[langCode].theme_data.theme_pages[
          "0"
        ].theme_product_details_page = [
          {
            delivery_title: (values as any)[`delivery_title_${langCode}`],
            delivery_subtitle: (values as any)[`delivery_subtitle_${langCode}`],
            refund_title: (values as any)[`refund_title_${langCode}`],
            refund_subtitle: (values as any)[`refund_subtitle_${langCode}`],
            related_title: (values as any)[`related_title_${langCode}`],
            delivery_url: values.delivery_url,
            refund_url: values.refund_url,
            delivery_enabled_disabled: toggles.emailVerification,
            refund_enabled_disabled: toggles.loginOTP,
          },
        ];

        if (
          updatedTranslations[langCode].theme_data.theme_pages
            .theme_product_details_page
        ) {
          delete updatedTranslations[langCode].theme_data.theme_pages
            .theme_product_details_page;
        }
      });
    }
    const payload = {
      theme_data: updatedThemeData,
      translations: updatedTranslations,
    };

    ThemeStore(payload, {
      onSuccess: () => refetch(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Tabs defaultValue="df" className="col-span-2">
        <TabsList dir={dir} className="flex justify-start bg-transparent">
          {multiLangData.map((lang) => (
            <TabsTrigger key={lang.id} value={lang.id}>
              {lang.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {multiLangData.map((lang) => {
          const id = lang.id;
          const isDf = id === "df";

          const field = (name: string) =>
            isDf ? `${name}_df` : `${name}_${id}`;

          return (
            <TabsContent key={id} value={id} className="lg:col-span-2">
              <div className="space-y-4">
                {/* Newsletters */}
                <Card className="p-4">
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("theme.product_details.delivery_title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("delivery_title"))}
                    />

                    <label className="block text-sm font-medium">
                      {t("theme.product_details.delivery_subtitle")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("delivery_subtitle"))}
                    />

                    <label className="block text-sm font-medium">
                      {t("theme.product_details.delivery_url")}
                    </label>
                    <Input
                      className="app-input"
                      {...register("delivery_url")}
                    />

                    <label className="block text-sm font-medium">
                      {t("theme.product_details.refund_title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("refund_title"))}
                    />

                    <label className="block text-sm font-medium">
                      {t("theme.product_details.refund_subtitle")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("refund_subtitle"))}
                    />

                    <label className="block text-sm font-medium">
                      {t("theme.product_details.refund_url")}
                    </label>
                    <Input className="app-input" {...register("refund_url")} />

                    <label className="block text-sm font-medium">
                      {t("theme.product_details.related_title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("related_title"))}
                    />

                    <p className="text-base">{t("theme.product_details.delivery_enable")}</p>
                    <Switch
                      checked={toggles.emailVerification === "on"}
                      onCheckedChange={() => handleToggle("emailVerification")}
                    />

                    <p className="text-base">{t("theme.product_details.refund_enable")}</p>
                    <Switch
                      checked={toggles.loginOTP === "on"}
                      onCheckedChange={() => handleToggle("loginOTP")}
                    />
                  </div>
                </Card>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <Card className="mt-4 sticky bottom-0 w-full p-4">
        <SubmitButton
          IsLoading={isPending}
          AddLabel={t("button.save_changes")}
        />
      </Card>
    </form>
  );
};

export default ThemeProductDetailsPage;
