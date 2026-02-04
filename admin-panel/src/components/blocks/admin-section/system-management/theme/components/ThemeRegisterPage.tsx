"use client";
import CloudIcon from "@/assets/icons/CloudIcon";
import Cancel from "@/components/blocks/custom-icons/Cancel";
import { SubmitButton } from "@/components/blocks/shared";
import PhotoUploadModal, { type UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";
import multiLang from "@/components/molecules/multiLang.json";
import {
  Card,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@/components/ui";
import { useThemeStoreMutation } from "@/modules/admin-section/theme/theme.action";
import {
  PageSettingsFormDataRegister,
  pageSettingsSchemaRegister,
} from "@/modules/admin-section/theme/theme.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface ThemeRegisterPageProps {
  allData: any[];
  data: any[];
  sectionIndex: number;
  refetch: any;
  handleChange: (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => void;
}

type ToggleState = {
  emailVerification: string;
  loginOTP: string;
  maintenanceMode: string;
};
type LangKeys = keyof IntlMessages["lang"];

const ThemeRegisterPage: React.FC<ThemeRegisterPageProps> = ({
  allData,
  refetch,
  data,
  sectionIndex,
  handleChange,
}) => {
  const t = useTranslations();
  const multiLangData = React.useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const itemIndex = 0;
  const section = data[0];
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState("");
  const [toggles, setToggles] = useState<ToggleState>({
    emailVerification: "",
    loginOTP: "",
    maintenanceMode: "",
  });

  const { watch, register, setValue, handleSubmit } =
    useForm<PageSettingsFormDataRegister>({
      resolver: zodResolver(pageSettingsSchemaRegister),
    });

  useEffect(() => {
    if (
      !(allData as any) ||
      !(allData as any).theme_data ||
      !(allData as any).translations
    )
      return;

    const registerPageDefault = (allData as any).theme_data?.theme_pages?.[0]
      ?.theme_register_page?.[0];

    // Set default (df) values
    if (registerPageDefault) {
      setValue("title_df", registerPageDefault.title || "");
      setValue("subtitle_df", registerPageDefault.subtitle || "");
      setValue("description_df", registerPageDefault.description || "");
      setValue(
        "terms_page_title_df",
        registerPageDefault.terms_page_title || ""
      );
      setValue("terms_page_url", registerPageDefault.terms_page_url || "");

      // Social login toggle
      if (registerPageDefault.social_login_enable_disable) {
        setToggles((prev) => ({
          ...prev,
          emailVerification: registerPageDefault.social_login_enable_disable,
        }));
      }

      // Image
      if (registerPageDefault.image_id) {
        setLastSelectedLogo({
          image_id: registerPageDefault.image_id,
          img_url: registerPageDefault.img_url || "/images/no-image.png",
          name: "logo",
        });
      }
    }

    if ((allData as any).translations.length > 0) {
      multiLangData.forEach((lang) => {
        const langCode = lang.id;
        const translation =
          (allData as any).translations?.[langCode]?.theme_data?.theme_pages[0]
            ?.theme_register_page[0] || {};

        if (translation) {
          setValue(
            `title_${langCode}` as keyof PageSettingsFormDataRegister,
            translation.title || ""
          );
          setValue(
            `subtitle_${langCode}` as keyof PageSettingsFormDataRegister,
            translation.subtitle || ""
          );
          setValue(
            `description_${langCode}` as keyof PageSettingsFormDataRegister,
            translation.description || ""
          );
          setValue(
            `terms_page_title_${langCode}` as keyof PageSettingsFormDataRegister,
            translation.terms_page_title || ""
          );
        }
      });
    }
  }, [allData, setValue, (allData as any).translations, multiLangData]);

  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => ({
      ...prev,
      [property]: prev[property] === "on" ? "" : "on",
    }));
  };

  useEffect(() => {
    if (section && section?.image_id) {
      setLastSelectedLogo({
        image_id: section?.image_id ? section?.image_id : "",
        img_url: section?.img_url ? section?.img_url : "/images/no-image.png",
        name: "logo",
      });
    }
  }, [section]);

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
  const { mutate: ThemeStore, isPending } = useThemeStoreMutation();
  const onSubmit = (values: PageSettingsFormDataRegister) => {
    const updatedThemeData = JSON.parse(
      JSON.stringify((allData as any).theme_data)
    );

    if (updatedThemeData?.theme_pages?.["0"]) {
      updatedThemeData.theme_pages["0"].theme_register_page = [
        {
          title: values.title_df,
          subtitle: values.subtitle_df,
          description: values.description_df,
          terms_page_title: values.terms_page_title_df,
          terms_page_url: values.terms_page_url,
          social_login_enable_disable: toggles.emailVerification,
          image_id: lastSelectedLogo?.image_id || "",
          img_url: lastSelectedLogo?.img_url || "",
        },
      ];
    }

    if (updatedThemeData?.theme_pages?.theme_register_page) {
      delete updatedThemeData.theme_pages.theme_register_page;
    }
    const updatedTranslations: Record<string, any> = JSON.parse(
      JSON.stringify((allData as any).translations)
    );
    if (updatedTranslations.length > 0) {
      multiLangData.forEach((lang) => {
        const langCode = lang.id;

        if (!updatedTranslations[langCode].theme_data.theme_pages["0"]) {
          updatedTranslations[langCode].theme_data.theme_pages["0"] = {};
        }

        updatedTranslations[langCode].theme_data.theme_pages[
          "0"
        ].theme_register_page = [
          {
            title: (values as any)[`title_${langCode}`],
            subtitle: (values as any)[`subtitle_${langCode}`],
            description: (values as any)[`description_${langCode}`],
            terms_page_title: (values as any)[`terms_page_title_${langCode}`],
            terms_page_url: values.terms_page_url,
            social_login_enable_disable: toggles.emailVerification,
            image_id: lastSelectedLogo?.image_id || "",
            img_url: lastSelectedLogo?.img_url || "",
          },
        ];

        if (
          updatedTranslations[langCode].theme_data.theme_pages
            .theme_register_page
        ) {
          delete updatedTranslations[langCode].theme_data.theme_pages
            .theme_register_page;
        }
      });
    }
    const payload = {
      theme_data: updatedThemeData,
      translations: updatedTranslations ?? [],
    };


    ThemeStore(payload, {
      onSuccess: () => refetch(),
    });
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
            <p className="text-sm font-bold text-red-500 p-1">Change image</p>
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
          <p className="mt-2 text-blue-500 text-xs font-medium">Drag & drop</p>
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
          return (
            <TabsContent
              key={lang.id}
              value={lang.id}
              className="lg:col-span-2"
            >
              <Card className="p-4 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                  </label>
                  <Input
                    id={`title_${lang.id}`}
                    {...register(
                      `title_${lang.id}` as keyof PageSettingsFormDataRegister
                    )}
                    className="app-input"
                    placeholder="Enter value"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Subtitle ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                  </label>
                  <Input
                    id={`subtitle_${lang.id}`}
                    {...register(
                      `subtitle_${lang.id}` as keyof PageSettingsFormDataRegister
                    )}
                    className="app-input"
                    placeholder="Enter value"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                  </label>
                  <Textarea
                    id={`description_${lang.id}`}
                    {...register(
                      `description_${lang.id}` as keyof PageSettingsFormDataRegister
                    )}
                    className="app-input"
                    placeholder="Enter value"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Terms Page Title (
                    {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                  </label>
                  <Input
                    id={`terms_page_title_${lang.id}`}
                    {...register(
                      `terms_page_title_${lang.id}` as keyof PageSettingsFormDataRegister
                    )}
                    className="app-input"
                    placeholder="Enter value"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Terms Page URL
                  </label>
                  <Input
                    id="terms_page_url"
                    {...register(
                      "terms_page_url" as keyof PageSettingsFormDataRegister
                    )}
                    className="app-input"
                    placeholder="Enter value"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    Social Login Enable/Disable
                  </label>
                  <Switch
                    dir="ltr"
                    checked={toggles.emailVerification === "on"}
                    onCheckedChange={() => handleToggle("emailVerification")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Image
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
              </Card>
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

export default ThemeRegisterPage;
