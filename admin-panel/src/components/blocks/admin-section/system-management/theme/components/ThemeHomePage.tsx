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

interface ThemeHomePageProps {
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

type ToggleKeys =
  | "slider"
  | "flash_sale"
  | "category"
  | "product_featured"
  | "banner_section"
  | "product_top_selling"
  | "product_latest"
  | "popular_product_section"
  | "top_stores_section"
  | "newsletters_section";

type ToggleState = Record<ToggleKeys, string>;

const makeHomeSchema = () => {
  const baseDf: Record<string, z.ZodTypeAny> = {
    category_title_df: z.string().optional(),
    flash_sale_title_df: z.string().optional(),
    product_featured_title_df: z.string().optional(),
    product_top_selling_title_df: z.string().optional(),
    product_latest_title_df: z.string().optional(),
    popular_product_section_title_df: z.string().optional(),
    top_stores_section_title_df: z.string().optional(),
    newsletters_title_df: z.string().optional(),
    newsletters_subtitle_df: z.string().optional(),
  };

  const langs = (multiLang as Array<{ id: string }>)
    .map((l) => l.id)
    .filter((id) => id !== "df");

  const dyn: Record<string, z.ZodTypeAny> = {};
  langs.forEach((id) => {
    dyn[`category_title_${id}`] = z.string().optional();
    dyn[`flash_sale_title_${id}`] = z.string().optional();
    dyn[`product_featured_title_${id}`] = z.string().optional();
    dyn[`product_top_selling_title_${id}`] = z.string().optional();
    dyn[`product_latest_title_${id}`] = z.string().optional();
    dyn[`popular_product_section_title_${id}`] = z.string().optional();
    dyn[`top_stores_section_title_${id}`] = z.string().optional();
    dyn[`newsletters_title_${id}`] = z.string().optional();
    dyn[`newsletters_subtitle_${id}`] = z.string().optional();
  });

  return z.object({
    ...baseDf,
    ...dyn,
  });
};

const pageSettingsSchemaHome = makeHomeSchema();
type PageSettingsFormDataHome = z.infer<typeof pageSettingsSchemaHome>;

const ThemeHomePage: React.FC<ThemeHomePageProps> = ({
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
    slider: "",
    category: "",
    flash_sale: "",
    product_featured: "",
    banner_section: "",
    product_top_selling: "",
    product_latest: "",
    popular_product_section: "",
    top_stores_section: "",
    newsletters_section: "",
  });

  const { mutate: ThemeStore, isPending } = useThemeStoreMutation();

  useEffect(() => {
    if (
      !(allData as any) ||
      !(allData as any).theme_data ||
      !(allData as any).translations
    )
      return;

    const homeDefault =
      (allData as any).theme_data?.theme_pages[0]?.theme_home_page[0] || {};

    setValue("category_title_df", homeDefault?.category[0]?.title || "");
    setValue("flash_sale_title_df", homeDefault?.flash_sale[0]?.title || "");
    setValue(
      "product_featured_title_df",
      homeDefault?.product_featured[0]?.title || ""
    );
    setValue(
      "product_top_selling_title_df",
      homeDefault?.product_top_selling[0]?.title || ""
    );
    setValue(
      "product_latest_title_df",
      homeDefault?.product_latest[0]?.title || ""
    );
    setValue(
      "popular_product_section_title_df",
      homeDefault?.popular_product_section?.[0]?.title || ""
    );
    setValue(
      "top_stores_section_title_df",
      homeDefault?.top_stores_section[0]?.title || ""
    );
    setValue(
      "newsletters_title_df",
      homeDefault?.newsletters_section[0]?.title || ""
    );
    setValue(
      "newsletters_subtitle_df",
      homeDefault?.newsletters_section[0]?.subtitle || ""
    );

    // toggles (string "on" | "")
    setToggles({
      slider: homeDefault?.slider[0]?.enabled_disabled === "on" ? "on" : "",
      category: homeDefault?.category[0]?.enabled_disabled === "on" ? "on" : "",
      flash_sale:
        homeDefault?.flash_sale[0]?.enabled_disabled === "on" ? "on" : "",
      product_featured:
        homeDefault?.product_featured[0]?.enabled_disabled === "on" ? "on" : "",
      banner_section:
        homeDefault?.banner_section[0]?.enabled_disabled === "on" ? "on" : "",
      product_top_selling:
        homeDefault?.product_top_selling[0]?.enabled_disabled === "on"
          ? "on"
          : "",
      product_latest:
        homeDefault?.product_latest[0]?.enabled_disabled === "on" ? "on" : "",
      popular_product_section:
        homeDefault?.popular_product_section[0]?.enabled_disabled === "on"
          ? "on"
          : "",
      top_stores_section:
        homeDefault?.top_stores_section[0]?.enabled_disabled === "on"
          ? "on"
          : "",
      newsletters_section:
        homeDefault?.newsletters_section[0]?.enabled_disabled === "on"
          ? "on"
          : "",
    });
    if ((allData as any).translations.length > 0) {
      // translations
      multiLangData
        .filter((l) => l.id !== "df")
        .forEach((lang) => {
          const langCode = lang.id;
          const tObj =
            (allData as any).translations?.[langCode]?.theme_data
              ?.theme_pages[0]?.theme_home_page[0] || {};

          setValue(
            `category_title_${langCode}`,
            tObj?.category[0]?.title || ""
          );
          setValue(
            `flash_sale_title_${langCode}`,
            tObj?.flash_sale[0]?.title || ""
          );
          setValue(
            `product_featured_title_${langCode}`,
            tObj?.product_featured[0]?.title || ""
          );
          setValue(
            `product_top_selling_title_${langCode}`,
            tObj?.product_top_selling[0]?.title || ""
          );
          setValue(
            `product_latest_title_${langCode}`,
            tObj?.product_latest[0]?.title || ""
          );
          setValue(
            `popular_product_section_title_${langCode}`,
            tObj?.popular_product_section[0]?.title || ""
          );
          setValue(
            `top_stores_section_title_${langCode}`,
            tObj?.top_stores_section[0]?.title || ""
          );
          setValue(
            `newsletters_title_${langCode}`,
            tObj?.newsletters_section[0]?.title || ""
          );
          setValue(
            `newsletters_subtitle_${langCode}`,
            tObj?.newsletters_section[0]?.subtitle || ""
          );
        });
    }
  }, [allData, setValue, multiLangData, (allData as any).translations]);

  const handleToggle = (key: ToggleKeys) => {
    setToggles((prev) => ({ ...prev, [key]: prev[key] === "on" ? "" : "on" }));
  };

  // 2) Submit — build clean payload (theme_data + translations)
  const onSubmit = (values: PageSettingsFormDataHome) => {
    const updatedThemeData = JSON.parse(
      JSON.stringify((allData as any).theme_data || {})
    );

    // Build the single home object (shape identical to your provided data)
    const buildHomeObject = (src: {
      category_title: string;
      flash_sale_title: string;
      product_featured_title: string;
      product_top_selling_title: string;
      product_latest_title: string;
      popular_product_section_title: string;
      top_stores_section_title: string;
      newsletters_title: string;
      newsletters_subtitle: string;
    }) => ({
      slider: [{ enabled_disabled: toggles.slider }],
      category: [
        { title: src.category_title, enabled_disabled: toggles.category },
      ],
      flash_sale: [
        { title: src.flash_sale_title, enabled_disabled: toggles.flash_sale },
      ],
      product_featured: [
        {
          title: src.product_featured_title,
          enabled_disabled: toggles.product_featured,
        },
      ],
      banner_section: [{ enabled_disabled: toggles.banner_section }],
      product_top_selling: [
        {
          title: src.product_top_selling_title,
          enabled_disabled: toggles.product_top_selling,
        },
      ],
      product_latest: [
        {
          title: src.product_latest_title,
          enabled_disabled: toggles.product_latest,
        },
      ],
      popular_product_section: [
        {
          title: src.popular_product_section_title,
          enabled_disabled: toggles.popular_product_section,
        },
      ],
      top_stores_section: [
        {
          title: src.top_stores_section_title,
          enabled_disabled: toggles.top_stores_section,
        },
      ],
      newsletters_section: [
        {
          title: src.newsletters_title,
          subtitle: src.newsletters_subtitle,
          enabled_disabled: toggles.newsletters_section,
        },
      ],
    });

    const dfSource: any = {
      category_title: values.category_title_df || "",
      flash_sale_title: values.flash_sale_title_df || "",
      product_featured_title: values.product_featured_title_df || "",
      product_top_selling_title: values.product_top_selling_title_df || "",
      product_latest_title: values.product_latest_title_df || "",
      popular_product_section_title:
        values.popular_product_section_title_df || "",
      top_stores_section_title: values.top_stores_section_title_df || "",
      newsletters_title: values.newsletters_title_df || "",
      newsletters_subtitle: values.newsletters_subtitle_df || "",
    };

    if (!updatedThemeData.theme_pages) updatedThemeData.theme_pages = {};
    if (!updatedThemeData.theme_pages["0"])
      updatedThemeData.theme_pages["0"] = {};

    updatedThemeData.theme_pages["0"].theme_home_page = [
      buildHomeObject(dfSource),
    ];

    // remove any possible stray top-level copy
    if (updatedThemeData?.theme_pages?.theme_home_page) {
      delete updatedThemeData.theme_pages.theme_home_page;
    }

    // Translations
    const updatedTranslations: Record<string, any> = JSON.parse(
      JSON.stringify((allData as any).translations || {})
    );
    if (updatedTranslations.length > 0) {
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
            category_title: (values as any)[`category_title_${langCode}`] || "",
            flash_sale_title:
              (values as any)[`flash_sale_title_${langCode}`] || "",
            product_featured_title:
              (values as any)[`product_featured_title_${langCode}`] || "",
            product_top_selling_title:
              (values as any)[`product_top_selling_title_${langCode}`] || "",
            product_latest_title:
              (values as any)[`product_latest_title_${langCode}`] || "",
            popular_product_section_title:
              (values as any)[`popular_product_section_title_${langCode}`] ||
              "",
            top_stores_section_title:
              (values as any)[`top_stores_section_title_${langCode}`] || "",
            newsletters_title:
              (values as any)[`newsletters_title_${langCode}`] || "",
            newsletters_subtitle:
              (values as any)[`newsletters_subtitle_${langCode}`] || "",
          };

          updatedTranslations[langCode].theme_data.theme_pages[
            "0"
          ].theme_home_page = [buildHomeObject(langSource)];

          // remove stray copy
          if (
            updatedTranslations[langCode].theme_data.theme_pages
              ?.theme_home_page
          ) {
            delete updatedTranslations[langCode].theme_data.theme_pages
              .theme_home_page;
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

  // ------------------------------
  // UI
  // ------------------------------
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
                  <h3 className="text-lg font-semibold mb-3">Slider</h3>
                  <div className="space-y-3 border rounded p-4">
                    <p className="text-base">Enable/Disable</p>
                    <Switch
                      checked={toggles.slider === "on"}
                      onCheckedChange={() => handleToggle("slider")}
                    />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Banner</h3>
                  <div className="space-y-3 border rounded p-4">
                    <p className="text-base">Enable/Disable</p>
                    <Switch
                      checked={toggles.banner_section === "on"}
                      onCheckedChange={() => handleToggle("banner_section")}
                    />
                  </div>
                </Card>

                {/* Category */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Flash Sale</h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("flash_sale_title"))}
                    />

                    <p className="text-base">Enable/Disable</p>
                    <Switch
                      checked={toggles.flash_sale === "on"}
                      onCheckedChange={() => handleToggle("flash_sale")}
                    />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Category</h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("category_title"))}
                    />

                    <p className="text-base">Enable/Disable</p>
                    <Switch
                      checked={toggles.category === "on"}
                      onCheckedChange={() => handleToggle("category")}
                    />
                  </div>
                </Card>

                {/* Featured Products */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Featured Products
                  </h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      Title ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("product_featured_title"))}
                    />

                    <p className="text-base">Enable/Disable</p>
                    <Switch
                      checked={toggles.product_featured === "on"}
                      onCheckedChange={() => handleToggle("product_featured")}
                    />
                  </div>
                </Card>

                {/* Top Selling */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Top Selling Products
                  </h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      Title ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("product_top_selling_title"))}
                    />

                    <p className="text-base">Enable/Disable</p>
                    <Switch
                      checked={toggles.product_top_selling === "on"}
                      onCheckedChange={() =>
                        handleToggle("product_top_selling")
                      }
                    />
                  </div>
                </Card>

                {/* Latest */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Latest Products
                  </h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      Title ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("product_latest_title"))}
                    />

                    <p className="text-base">Enable/Disable</p>
                    <Switch
                      checked={toggles.product_latest === "on"}
                      onCheckedChange={() => handleToggle("product_latest")}
                    />
                  </div>
                </Card>

                {/* Popular */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Popular Products
                  </h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      Title ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("popular_product_section_title"))}
                    />

                    <p className="text-base">Enable/Disable</p>
                    <Switch
                      checked={toggles.popular_product_section === "on"}
                      onCheckedChange={() =>
                        handleToggle("popular_product_section")
                      }
                    />
                  </div>
                </Card>

                {/* Top Stores */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Top Stores</h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      Title ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("top_stores_section_title"))}
                    />

                    <p className="text-base">Enable/Disable</p>
                    <Switch
                      checked={toggles.top_stores_section === "on"}
                      onCheckedChange={() => handleToggle("top_stores_section")}
                    />
                  </div>
                </Card>

                {/* Newsletters */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Newsletters</h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      Title ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("newsletters_title"))}
                    />

                    <label className="block text-sm font-medium">
                      Subtitle ({t(`lang.${id}` as any)})
                    </label>
                    <Textarea
                      className="app-input"
                      {...register(field("newsletters_subtitle"))}
                    />

                    <p className="text-base">Enable/Disable</p>
                    <Switch
                      checked={toggles.newsletters_section === "on"}
                      onCheckedChange={() =>
                        handleToggle("newsletters_section")
                      }
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

export default ThemeHomePage;
