"use client";
import { SubmitButton } from "@/components/blocks/shared";
import multiLang from "@/components/molecules/multiLang.json";
import {
  Card,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { useThemeStoreMutation } from "@/modules/admin-section/theme/theme.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ThemeBlogPageProps {
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

const makeLoginSchema = () => {
  const baseDf: Record<string, z.ZodTypeAny> = {
    popular_title_df: z.string().optional(),
    related_title_df: z.string().optional(),
  };

  const langs = (multiLang as Array<{ id: string }>)
    .map((l) => l.id)
    .filter((id) => id !== "df");

  const dyn: Record<string, z.ZodTypeAny> = {};
  langs.forEach((id) => {
    dyn[`popular_title_${id}`] = z.string().optional();
    dyn[`related_title_${id}`] = z.string().optional();
  });

  return z.object({
    ...baseDf,
    ...dyn,
  });
};

const pageSettingsSchemaHome = makeLoginSchema();
type PageSettingsFormDataHome = z.infer<typeof pageSettingsSchemaHome>;

const ThemeBlogPage: React.FC<ThemeBlogPageProps> = ({
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

  useEffect(() => {
    if (
      !allData ||
      !(allData as any).theme_data ||
      !(allData as any)?.translations
    )
      return;

    const loginDefault =
      (allData as any).theme_data?.theme_pages?.[0]?.theme_blog_page?.[0] || {};

    setValue("popular_title_df", loginDefault?.popular_title || "");
    setValue("related_title_df", loginDefault?.related_title || "");

    multiLangData
      .filter((l) => l.id !== "df")
      .forEach((lang) => {
        const langCode = lang.id;
        const tObj =
          (allData as any)?.translations?.[langCode]?.theme_data
            ?.theme_pages?.[0]?.theme_blog_page?.[0] || {};

        setValue(`popular_title_${langCode}`, tObj?.popular_title || "");
        setValue(`related_title_${langCode}`, tObj?.related_title || "");
      });
  }, [allData, setValue, multiLangData]);

  const { mutate: ThemeStore, isPending } = useThemeStoreMutation();
  const onSubmit = (values: PageSettingsFormDataHome) => {
    const updatedThemeData = JSON.parse(
      JSON.stringify((allData as any).theme_data)
    );

    if (updatedThemeData?.theme_pages?.["0"]) {
      updatedThemeData.theme_pages["0"].theme_blog_page = [
        {
          popular_title: values.popular_title_df,
          related_title: values.related_title_df,
        },
      ];
    }

    if (updatedThemeData?.theme_pages?.theme_blog_page) {
      delete updatedThemeData.theme_pages.theme_blog_page;
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
        ].theme_blog_page = [
          {
            popular_title: (values as any)[`popular_title_${langCode}`],
            related_title: (values as any)[`related_title_${langCode}`],
          },
        ];

        if (
          updatedTranslations[langCode].theme_data.theme_pages.theme_blog_page
        ) {
          delete updatedTranslations[langCode].theme_data.theme_pages
            .theme_blog_page;
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
                <Card className="p-4">
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      Popular Title ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("popular_title"))}
                    />

                    <label className="block text-sm font-medium">
                      Related Title ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("related_title"))}
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

export default ThemeBlogPage;
