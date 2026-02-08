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
import PhotoUploadModal, { type UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";

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

type ToggleKeys = "customer" | "admin";

type ToggleState = Record<ToggleKeys, string>;

const makeLoginSchema = () => {
  const baseDf: Record<string, z.ZodTypeAny> = {
    customer_title_df: z.string().optional(),
    customer_subtitle_df: z.string().optional(),
    admin_title_df: z.string().optional(),
    admin_subtitle_df: z.string().optional(),
  };

  const langs = (multiLang as Array<{ id: string }>)
    .map((l) => l.id)
    .filter((id) => id !== "df");

  const dyn: Record<string, z.ZodTypeAny> = {};
  langs.forEach((id) => {
    dyn[`customer_title_${id}`] = z.string().optional();
    dyn[`customer_subtitle_${id}`] = z.string().optional();
    dyn[`admin_title_${id}`] = z.string().optional();
    dyn[`admin_subtitle_${id}`] = z.string().optional();
  });

  return z.object({
    ...baseDf,
    ...dyn,
  });
};

const pageSettingsSchemaHome = makeLoginSchema();
type PageSettingsFormDataHome = z.infer<typeof pageSettingsSchemaHome>;

const ThemeLoginPage: React.FC<ThemeLoginPageProps> = ({
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
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState("");
  const [lastSelectedLogoAdmin, setLastSelectedLogoAdmin] = useState<any>(null);
  const [errorLogoMessageAdmin, setLogoErrorMessageAdmin] = useState("");
  const [toggles, setToggles] = useState<ToggleState>({
    customer: "",
    admin: "",
  });

  useEffect(() => {
    if (
      !allData ||
      !(allData as any).theme_data ||
      !(allData as any)?.translations
    )
      return;

    const loginDefault =
      (allData as any).theme_data?.theme_pages?.[0]?.theme_login_page?.[0] ||
      {};

    setValue("customer_title_df", loginDefault?.customer?.[0]?.title || "");
    setValue(
      "customer_subtitle_df",
      loginDefault?.customer?.[0]?.subtitle || ""
    );
    setValue("admin_title_df", loginDefault?.admin?.[0]?.title || "");
    setValue("admin_subtitle_df", loginDefault?.admin?.[0]?.subtitle || "");
    setToggles({
      customer:
        loginDefault?.customer?.[0]?.enabled_disabled === "on" ? "on" : "",
      admin: loginDefault?.admin?.[0]?.enabled_disabled === "on" ? "on" : "",
    });

    // Image
    if (loginDefault?.customer?.[0]) {
      setLastSelectedLogo({
        image_id: loginDefault?.customer?.[0].image_id,
        img_url: loginDefault?.customer?.[0].img_url || "/images/no-image.png",
        name: "logo",
      });
    }
    if (loginDefault?.admin?.[0]) {
      setLastSelectedLogoAdmin({
        image_id: loginDefault?.admin?.[0].image_id,
        img_url: loginDefault?.admin?.[0].img_url || "/images/no-image.png",
        name: "logo",
      });
    }

    multiLangData
      .filter((l) => l.id !== "df")
      .forEach((lang) => {
        const langCode = lang.id;
        const tObj =
          (allData as any)?.translations?.[langCode]?.theme_data
            ?.theme_pages?.[0]?.theme_login_page?.[0] || {};

        setValue(
          `customer_title_${langCode}`,
          tObj?.customer?.[0]?.title || ""
        );
        setValue(
          `customer_subtitle_${langCode}`,
          tObj?.customer?.[0]?.subtitle || ""
        );
        setValue(`admin_title_${langCode}`, tObj?.admin?.[0]?.title || "");
        setValue(
          `admin_subtitle_${langCode}`,
          tObj?.admin?.[0]?.subtitle || ""
        );
      });
  }, [allData, setValue, multiLangData]);

  const handleToggle = (key: ToggleKeys) => {
    setToggles((prev) => ({ ...prev, [key]: prev[key] === "on" ? "" : "on" }));
  };

  const { mutate: ThemeStore, isPending } = useThemeStoreMutation();
  const onSubmit = (values: PageSettingsFormDataHome) => {
    const updatedThemeData = JSON.parse(
      JSON.stringify((allData as any).theme_data || {})
    );

    // Build the single home object (shape identical to your provided data)
    const buildLoginObject = (src: {
      customer_title: string;
      customer_subtitle: string;
      admin_title: string;
      admin_subtitle: string;
    }) => ({
      customer: [
        {
          title: src.customer_title,
          subtitle: src.customer_subtitle,
          enabled_disabled: toggles.customer,
          image_id: lastSelectedLogo?.image_id || "",
          img_url: lastSelectedLogo?.img_url || "",
        },
      ],
      admin: [
        {
          title: src.admin_title,
          subtitle: src.admin_subtitle,
          image_id: lastSelectedLogoAdmin?.image_id || "",
          img_url: lastSelectedLogoAdmin?.img_url || "",
        },
      ],
    });

    // df source
    const dfSource: any = {
      customer_title: values.customer_title_df || "",
      customer_subtitle: values.customer_subtitle_df || "",
      admin_title: values.admin_title_df || "",
      admin_subtitle: values.admin_subtitle_df || "",
    };

    if (!updatedThemeData.theme_pages) updatedThemeData.theme_pages = {};
    if (!updatedThemeData.theme_pages["0"])
      updatedThemeData.theme_pages["0"] = {};

    updatedThemeData.theme_pages["0"].theme_login_page = [
      buildLoginObject(dfSource),
    ];

    // remove any possible stray top-level copy
    if (updatedThemeData?.theme_pages?.theme_login_page) {
      delete updatedThemeData.theme_pages.theme_login_page;
    }

    // Translations
    const updatedTranslations: Record<string, any> = JSON.parse(
      JSON.stringify((allData as any).translations || {})
    );
    if (Object.keys(updatedTranslations).length > 0) {
      multiLangData
        .filter((l) => l.id !== "df")
        .forEach((lang) => {
          const langCode = lang.id;

          if (!updatedTranslations[langCode])
            updatedTranslations[langCode] = { theme_data: {} };
          if (!updatedTranslations[langCode].theme_data.theme_pages)
            updatedTranslations[langCode].theme_data.theme_pages = {};
          if (!updatedTranslations[langCode].theme_data.theme_pages["0"])
            updatedTranslations[langCode].theme_data.theme_pages["0"] = {};

          const langSource = {
            customer_title: (values as any)[`customer_title_${langCode}`] || "",
            customer_subtitle:
              (values as any)[`customer_subtitle_${langCode}`] || "",
            admin_title: (values as any)[`admin_title_${langCode}`] || "",
            admin_subtitle: (values as any)[`admin_subtitle_${langCode}`] || "",
          };

          updatedTranslations[langCode].theme_data.theme_pages[
            "0"
          ].theme_login_page = [buildLoginObject(langSource)];

          // remove stray copy
          if (
            updatedTranslations[langCode].theme_data.theme_pages
              ?.theme_login_page
          ) {
            delete updatedTranslations[langCode].theme_data.theme_pages
              .theme_login_page;
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

  const handleSaveLogo = (images: UploadedImage[]) => {
    const selected = images[0];
    setLastSelectedLogo(selected);
    handleChange(sectionIndex, itemIndex, "image_id", selected.image_id);
    handleChange(sectionIndex, itemIndex, "img_url", selected.img_url);
  };

  const removeLogo = () => {
    setLastSelectedLogo(null);
    setLogoErrorMessage("");
    handleChange(sectionIndex, itemIndex, "image_id", "");
  };

  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            src={lastSelectedLogo.img_url}
            alt={lastSelectedLogo?.name || "Logo"}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="py-2 absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t("common.change_image")}</p>
          </div>
          <Cancel
            customClass="absolute top-0 right-0 m-1"
            onClick={(event: { stopPropagation: () => void }) => {
              event.stopPropagation();
              removeLogo();
            }}
          />
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <CloudIcon />
          <p className="mt-2 text-blue-500 text-xs font-medium">{t("common.drag_and_drop")}</p>
        </div>
      )}
    </div>
  );
  const handleSaveLogoAdmin = (images: UploadedImage[]) => {
    const selected = images[0];
    setLastSelectedLogoAdmin(selected);
    handleChange(sectionIndex, itemIndex, "image_id", selected.image_id);
    handleChange(sectionIndex, itemIndex, "img_url", selected.img_url);
  };

  const removeLogoAdmin = () => {
    setLastSelectedLogoAdmin(null);
    setLogoErrorMessageAdmin("");
    handleChange(sectionIndex, itemIndex, "image_id", "");
  };
  const triggerLogoAdmin = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogoAdmin?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            src={lastSelectedLogoAdmin.img_url}
            alt={lastSelectedLogoAdmin?.name || "Logo"}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="py-2 absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t("common.change_image")}</p>
          </div>
          <Cancel
            customClass="absolute top-0 right-0 m-1"
            onClick={(event: { stopPropagation: () => void }) => {
              event.stopPropagation();
              removeLogoAdmin();
            }}
          />
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <CloudIcon />
          <p className="mt-2 text-blue-500 text-xs font-medium">{t("common.drag_and_drop")}</p>
        </div>
      )}
    </div>
  );
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
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">{t("theme.login.customer")}</h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("customer_title"))}
                    />

                    <label className="block text-sm font-medium">
                      {t("label.subtitle")} ({t(`lang.${id}` as any)})
                    </label>
                    <Textarea
                      className="app-input"
                      {...register(field("customer_subtitle"))}
                    />

                    <p className="text-base">{t("theme.login.social_login_enable")}</p>
                    <Switch
                      checked={toggles.customer === "on"}
                      onCheckedChange={() => handleToggle("customer")}
                    />
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("theme.login.login_image")}
                      </label>
                      <div className="relative flex items-start gap-4">
                        <div className="relative w-32">
                          <PhotoUploadModal
                            trigger={triggerLogo}
                            isMultiple={false}
                            onSave={handleSaveLogo}
                            usageType="brand"
                            selectedImage={lastSelectedLogo}
                          />
                          {errorLogoMessage && (
                            <p className="absolute text-red-500 text-sm mt-1">
                              {errorLogoMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">{t("theme.login.admin")}</h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("admin_title"))}
                    />

                    <label className="block text-sm font-medium">
                      {t("label.subtitle")} ({t(`lang.${id}` as any)})
                    </label>
                    <Textarea
                      className="app-input"
                      {...register(field("admin_subtitle"))}
                    />

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("theme.login.login_image")}
                      </label>
                      <div className="relative flex items-start gap-4">
                        <div className="relative w-32">
                          <PhotoUploadModal
                            trigger={triggerLogoAdmin}
                            isMultiple={false}
                            onSave={handleSaveLogoAdmin}
                            usageType="brand"
                            selectedImage={lastSelectedLogoAdmin}
                          />
                          {errorLogoMessageAdmin && (
                            <p className="absolute text-red-500 text-sm mt-1">
                              {errorLogoMessageAdmin}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
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

export default ThemeLoginPage;
