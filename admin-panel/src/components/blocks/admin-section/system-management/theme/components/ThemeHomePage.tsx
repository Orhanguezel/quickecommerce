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
import { getThemeLanguageData } from "../utils/themeLanguage";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useThemeStoreMutation } from "@/modules/admin-section/theme/theme.action";
import { SubmitButton } from "@/components/blocks/shared";
import { GripVertical } from "lucide-react";

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
  | "blog_section"
  | "top_stores_section"
  | "newsletters_section"
  | "all_products_section";

type ToggleState = Record<ToggleKeys, string>;
type LayoutBlockType = ToggleKeys;
type BannerSpan = 4 | 6 | 12;
type FlashSaleSpan = 4 | 6 | 12;
type BlogSpan = 4 | 6 | 12;
type TopStoresSpan = 4 | 6 | 12;

type LayoutBlock = {
  id: string;
  type: LayoutBlockType;
  instance: number;
  enabled_disabled: "on" | "off";
  config?: {
    banner_span?: BannerSpan;
    flash_sale_span?: FlashSaleSpan;
    blog_span?: BlogSpan;
    top_stores_span?: TopStoresSpan;
  };
};

const SECTION_KEYS: ToggleKeys[] = [
  "slider",
  "category",
  "flash_sale",
  "product_featured",
  "banner_section",
  "product_top_selling",
  "product_latest",
  "popular_product_section",
  "blog_section",
  "top_stores_section",
  "newsletters_section",
  "all_products_section",
];

const SECTION_LABELS: Record<ToggleKeys, string> = {
  slider: "Slider",
  category: "Kategoriler",
  flash_sale: "Flash Sale",
  product_featured: "Öne Çıkan Ürünler",
  banner_section: "Banner",
  product_top_selling: "En Çok Satanlar",
  product_latest: "Yeni Ürünler",
  popular_product_section: "Popüler Ürünler",
  blog_section: "Blog",
  top_stores_section: "Top Stores",
  newsletters_section: "Bültene Abone Ol",
  all_products_section: "Tüm Ürünler",
};

const REPEATABLE_BLOCKS: LayoutBlockType[] = ["banner_section", "flash_sale", "blog_section"];
const BANNER_SPAN_OPTIONS: BannerSpan[] = [4, 6, 12];
const FLASH_SALE_SPAN_OPTIONS: FlashSaleSpan[] = [4, 6, 12];
const BLOG_SPAN_OPTIONS: BlogSpan[] = [4, 6, 12];
const TOP_STORES_SPAN_OPTIONS: TopStoresSpan[] = [4, 6, 12];

const getDefaultLayoutBlocks = (): LayoutBlock[] =>
  SECTION_KEYS.map((key, index) => ({
    id: `${key}__${index + 1}`,
    type: key,
    instance: 1,
    enabled_disabled: "on",
  }));

const getBlockSpan = (type: LayoutBlockType): number => {
  if (type === "banner_section") return 4;
  if (type === "flash_sale") return 6;
  if (type === "blog_section") return 4;
  return 12;
};

const makeHomeSchema = () => {
  const baseDf: Record<string, z.ZodTypeAny> = {
    category_title_df: z.string().optional(),
    flash_sale_title_df: z.string().optional(),
    product_featured_title_df: z.string().optional(),
    product_top_selling_title_df: z.string().optional(),
    product_latest_title_df: z.string().optional(),
    popular_product_section_title_df: z.string().optional(),
    blog_section_title_df: z.string().optional(),
    top_stores_section_title_df: z.string().optional(),
    newsletters_title_df: z.string().optional(),
    newsletters_subtitle_df: z.string().optional(),
    all_products_section_title_df: z.string().optional(),
  };

  const langs = getThemeLanguageData()
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
    dyn[`blog_section_title_${id}`] = z.string().optional();
    dyn[`top_stores_section_title_${id}`] = z.string().optional();
    dyn[`newsletters_title_${id}`] = z.string().optional();
    dyn[`newsletters_subtitle_${id}`] = z.string().optional();
    dyn[`all_products_section_title_${id}`] = z.string().optional();
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
    () => getThemeLanguageData(),
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
    blog_section: "",
    top_stores_section: "",
    newsletters_section: "",
    all_products_section: "",
  });
  const [layoutBlocks, setLayoutBlocks] = useState<LayoutBlock[]>(
    getDefaultLayoutBlocks()
  );
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const [sliderNumber, setSliderNumber] = useState<string>("1");

  const { mutate: ThemeStore, isPending } = useThemeStoreMutation();

  const normalizeLayoutBlocks = (
    input: unknown,
    legacySectionOrder: unknown
  ): LayoutBlock[] => {
    const fromRaw = Array.isArray(input)
      ? input
          .filter((item) => item && typeof item === "object")
          .map((item: any, index: number) => {
            const type = item.type as LayoutBlockType;
            if (!SECTION_KEYS.includes(type)) return null;
            return {
              id: String(item.id || `${type}__${index + 1}`),
              type,
              instance: Math.max(1, Number(item.instance || 1)),
              enabled_disabled: item?.enabled_disabled === "off" ? "off" : "on",
              config:
                type === "banner_section"
                  ? {
                      banner_span: BANNER_SPAN_OPTIONS.includes(
                        Number(item?.config?.banner_span) as BannerSpan
                      )
                        ? (Number(item?.config?.banner_span) as BannerSpan)
                        : 4,
                    }
                  : type === "flash_sale"
                    ? {
                        flash_sale_span: FLASH_SALE_SPAN_OPTIONS.includes(
                          Number(item?.config?.flash_sale_span) as FlashSaleSpan
                        )
                          ? (Number(item?.config?.flash_sale_span) as FlashSaleSpan)
                          : 6,
                      }
                    : type === "blog_section"
                      ? {
                          blog_span: BLOG_SPAN_OPTIONS.includes(
                            Number(item?.config?.blog_span) as BlogSpan
                          )
                            ? (Number(item?.config?.blog_span) as BlogSpan)
                            : 4,
                        }
                    : type === "top_stores_section"
                      ? {
                          top_stores_span: TOP_STORES_SPAN_OPTIONS.includes(
                            Number(item?.config?.top_stores_span) as TopStoresSpan
                          )
                            ? (Number(item?.config?.top_stores_span) as TopStoresSpan)
                            : 12,
                        }
                  : undefined,
            } as LayoutBlock;
          })
          .filter(Boolean) as LayoutBlock[]
      : [];

    // Append any SECTION_KEYS not yet in the stored blocks (forward compatibility)
    const appendMissing = (blocks: LayoutBlock[]): LayoutBlock[] => {
      const existingTypes = new Set(blocks.map((b) => b.type));
      const missing = SECTION_KEYS.filter(
        (key) => !existingTypes.has(key as LayoutBlockType)
      ).map((key) => ({
        id: `${key}__auto_1`,
        type: key as LayoutBlockType,
        instance: 1,
        enabled_disabled: "on" as const,
      }));
      return missing.length > 0 ? [...blocks, ...missing] : blocks;
    };

    if (fromRaw.length > 0) {
      return appendMissing(fromRaw);
    }

    const fromLegacy = Array.isArray(legacySectionOrder)
      ? legacySectionOrder
          .filter((item): item is string => typeof item === "string")
          .filter((item) => SECTION_KEYS.includes(item as ToggleKeys))
          .map((key, index) => ({
            id: `${key}__legacy_${index + 1}`,
            type: key as LayoutBlockType,
            instance: 1,
            enabled_disabled: "on" as const,
          }))
      : [];

    return fromLegacy.length > 0 ? appendMissing(fromLegacy) : getDefaultLayoutBlocks();
  };

  useEffect(() => {
    if (
      !(allData as any) ||
      !(allData as any).theme_data ||
      !(allData as any).translations
    )
      return;

    const homeDefault =
      (allData as any).theme_data?.theme_pages?.[0]?.theme_home_page?.[0] || {};

    setValue("category_title_df", homeDefault?.category?.[0]?.title || "");
    setValue("flash_sale_title_df", homeDefault?.flash_sale?.[0]?.title || "");
    setValue(
      "product_featured_title_df",
      homeDefault?.product_featured?.[0]?.title || ""
    );
    setValue(
      "product_top_selling_title_df",
      homeDefault?.product_top_selling?.[0]?.title || ""
    );
    setValue(
      "product_latest_title_df",
      homeDefault?.product_latest?.[0]?.title || ""
    );
    setValue(
      "popular_product_section_title_df",
      homeDefault?.popular_product_section?.[0]?.title || ""
    );
    setValue(
      "blog_section_title_df",
      homeDefault?.blog_section?.[0]?.title || ""
    );
    setValue(
      "top_stores_section_title_df",
      homeDefault?.top_stores_section?.[0]?.title || ""
    );
    setValue(
      "newsletters_title_df",
      homeDefault?.newsletters_section?.[0]?.title || ""
    );
    setValue(
      "newsletters_subtitle_df",
      homeDefault?.newsletters_section?.[0]?.subtitle || ""
    );
    setValue(
      "all_products_section_title_df",
      homeDefault?.all_products_section?.[0]?.title || ""
    );

    // toggles (string "on" | "")
    setToggles({
      slider: homeDefault?.slider?.[0]?.enabled_disabled === "on" ? "on" : "",
      category: homeDefault?.category?.[0]?.enabled_disabled === "on" ? "on" : "",
      flash_sale:
        homeDefault?.flash_sale?.[0]?.enabled_disabled === "on" ? "on" : "",
      product_featured:
        homeDefault?.product_featured?.[0]?.enabled_disabled === "on" ? "on" : "",
      banner_section:
        homeDefault?.banner_section?.[0]?.enabled_disabled === "on" ? "on" : "",
      product_top_selling:
        homeDefault?.product_top_selling?.[0]?.enabled_disabled === "on"
          ? "on"
          : "",
      product_latest:
        homeDefault?.product_latest?.[0]?.enabled_disabled === "on" ? "on" : "",
      popular_product_section:
        homeDefault?.popular_product_section?.[0]?.enabled_disabled === "on"
          ? "on"
          : "",
      blog_section:
        homeDefault?.blog_section?.[0]?.enabled_disabled === "on" ? "on" : "",
      top_stores_section:
        homeDefault?.top_stores_section?.[0]?.enabled_disabled === "on"
          ? "on"
          : "",
      newsletters_section:
        homeDefault?.newsletters_section?.[0]?.enabled_disabled === "on"
          ? "on"
          : "",
      all_products_section:
        homeDefault?.all_products_section?.[0]?.enabled_disabled === "on"
          ? "on"
          : "",
    });
    setLayoutBlocks(
      normalizeLayoutBlocks(homeDefault?.layout_blocks, homeDefault?.section_order)
    );
    setSliderNumber(homeDefault?.slider?.[0]?.slider_number || "1");
    if (Object.keys((allData as any).translations || {}).length > 0) {
      // translations
      multiLangData
        .filter((l) => l.id !== "df")
        .forEach((lang) => {
          const langCode = lang.id;
          const tObj =
            (allData as any).translations?.[langCode]?.theme_data
              ?.theme_pages?.[0]?.theme_home_page?.[0] || {};

          setValue(
            `category_title_${langCode}`,
            tObj?.category?.[0]?.title || ""
          );
          setValue(
            `flash_sale_title_${langCode}`,
            tObj?.flash_sale?.[0]?.title || ""
          );
          setValue(
            `product_featured_title_${langCode}`,
            tObj?.product_featured?.[0]?.title || ""
          );
          setValue(
            `product_top_selling_title_${langCode}`,
            tObj?.product_top_selling?.[0]?.title || ""
          );
          setValue(
            `product_latest_title_${langCode}`,
            tObj?.product_latest?.[0]?.title || ""
          );
          setValue(
            `popular_product_section_title_${langCode}`,
            tObj?.popular_product_section?.[0]?.title || ""
          );
          setValue(
            `blog_section_title_${langCode}`,
            tObj?.blog_section?.[0]?.title || ""
          );
          setValue(
            `top_stores_section_title_${langCode}`,
            tObj?.top_stores_section?.[0]?.title || ""
          );
          setValue(
            `newsletters_title_${langCode}`,
            tObj?.newsletters_section?.[0]?.title || ""
          );
          setValue(
            `newsletters_subtitle_${langCode}`,
            tObj?.newsletters_section?.[0]?.subtitle || ""
          );
          setValue(
            `all_products_section_title_${langCode}`,
            tObj?.all_products_section?.[0]?.title || ""
          );
        });
    }
  }, [allData, setValue, multiLangData, (allData as any).translations]);

  const handleToggle = (key: ToggleKeys) => {
    setToggles((prev) => ({ ...prev, [key]: prev[key] === "on" ? "" : "on" }));
  };

  const moveBlock = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const list = [...layoutBlocks];
    const fromIndex = list.findIndex((b) => b.id === fromId);
    const toIndex = list.findIndex((b) => b.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    setLayoutBlocks(list);
  };

  const addBlock = (type: LayoutBlockType) => {
    if (!REPEATABLE_BLOCKS.includes(type)) return;
    const maxInstance = layoutBlocks
      .filter((b) => b.type === type)
      .reduce((max, b) => Math.max(max, b.instance), 0);
    const nextInstance = maxInstance + 1;
    setLayoutBlocks((prev) => [
      ...prev,
      {
        id: `${type}__${Date.now()}_${nextInstance}`,
        type,
        instance: nextInstance,
        enabled_disabled: "on",
        config:
          type === "banner_section"
            ? { banner_span: 4 }
            : type === "flash_sale"
              ? { flash_sale_span: 6 }
              : type === "blog_section"
                ? { blog_span: 4 }
                : undefined,
      },
    ]);
  };

  const removeBlock = (id: string) => {
    setLayoutBlocks((prev) => {
      const block = prev.find((b) => b.id === id);
      if (!block || !REPEATABLE_BLOCKS.includes(block.type)) return prev;
      return prev.filter((b) => b.id !== id);
    });
  };

  const updateBlockInstance = (id: string, value: string) => {
    const parsed = Number.parseInt(value, 10);
    const instance = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
    setLayoutBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? {
              ...block,
              instance,
            }
          : block
      )
    );
  };

  const toggleBlockEnabled = (id: string) => {
    setLayoutBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? {
              ...block,
              enabled_disabled: block.enabled_disabled === "on" ? "off" : "on",
            }
          : block
      )
    );
  };

  const updateBannerSpan = (id: string, value: string) => {
    const parsed = Number.parseInt(value, 10);
    const bannerSpan = BANNER_SPAN_OPTIONS.includes(parsed as BannerSpan)
      ? (parsed as BannerSpan)
      : 4;

    setLayoutBlocks((prev) =>
      prev.map((block) =>
        block.id === id && block.type === "banner_section"
          ? {
              ...block,
              config: {
                ...(block.config || {}),
                banner_span: bannerSpan,
              },
            }
          : block
      )
    );
  };

  const updateFlashSaleSpan = (id: string, value: string) => {
    const parsed = Number.parseInt(value, 10);
    const flashSaleSpan = FLASH_SALE_SPAN_OPTIONS.includes(parsed as FlashSaleSpan)
      ? (parsed as FlashSaleSpan)
      : 6;

    setLayoutBlocks((prev) =>
      prev.map((block) =>
        block.id === id && block.type === "flash_sale"
          ? {
              ...block,
              config: {
                ...(block.config || {}),
                flash_sale_span: flashSaleSpan,
              },
            }
          : block
      )
    );
  };

  const updateBlogSpan = (id: string, value: string) => {
    const parsed = Number.parseInt(value, 10);
    const blogSpan = BLOG_SPAN_OPTIONS.includes(parsed as BlogSpan)
      ? (parsed as BlogSpan)
      : 4;

    setLayoutBlocks((prev) =>
      prev.map((block) =>
        block.id === id && block.type === "blog_section"
          ? {
              ...block,
              config: {
                ...(block.config || {}),
                blog_span: blogSpan,
              },
            }
          : block
      )
    );
  };

  const updateTopStoresSpan = (id: string, value: string) => {
    const parsed = Number.parseInt(value, 10);
    const topStoresSpan = TOP_STORES_SPAN_OPTIONS.includes(parsed as TopStoresSpan)
      ? (parsed as TopStoresSpan)
      : 12;

    setLayoutBlocks((prev) =>
      prev.map((block) =>
        block.id === id && block.type === "top_stores_section"
          ? {
              ...block,
              config: {
                ...(block.config || {}),
                top_stores_span: topStoresSpan,
              },
            }
          : block
      )
    );
  };

  const previewRows = useMemo(() => {
    type PreviewBlock = LayoutBlock & { span: number };
    const rows: PreviewBlock[][] = [];
    let currentRow: PreviewBlock[] = [];
    let currentSpan = 0;
    let currentRepeatableType: LayoutBlockType | null = null;

    const flushRow = () => {
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentSpan = 0;
      currentRepeatableType = null;
    };

    layoutBlocks.forEach((block) => {
      const span =
        block.type === "banner_section"
          ? block.config?.banner_span || 4
          : block.type === "flash_sale"
            ? block.config?.flash_sale_span || 6
            : block.type === "blog_section"
              ? block.config?.blog_span || 4
            : block.type === "top_stores_section"
              ? block.config?.top_stores_span || 12
          : getBlockSpan(block.type);
      const isRepeatable = REPEATABLE_BLOCKS.includes(block.type);

      if (!isRepeatable) {
        flushRow();
        rows.push([{ ...block, span }]);
        return;
      }

      const isCompatibleRow =
        currentRow.length > 0 &&
        currentRepeatableType === block.type &&
        currentSpan + span <= 12;

      if (!isCompatibleRow) {
        flushRow();
      }

      currentRow.push({ ...block, span });
      currentSpan += span;
      currentRepeatableType = block.type;

      if (currentSpan >= 12) {
        flushRow();
      }
    });

    flushRow();
    return rows;
  }, [layoutBlocks]);

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
      blog_section_title: string;
      top_stores_section_title: string;
      newsletters_title: string;
      newsletters_subtitle: string;
      all_products_section_title: string;
    }) => ({
      section_order: layoutBlocks.reduce((acc, block) => {
        if (!acc.includes(block.type)) acc.push(block.type);
        return acc;
      }, [] as string[]),
      layout_blocks: layoutBlocks.map((block) => ({
        id: block.id,
        type: block.type,
        instance: block.instance,
        enabled_disabled: block.enabled_disabled === "off" ? "off" : "on",
        config:
          block.type === "banner_section"
            ? { banner_span: block.config?.banner_span || 4 }
            : block.type === "flash_sale"
              ? { flash_sale_span: block.config?.flash_sale_span || 6 }
              : block.type === "blog_section"
                ? { blog_span: block.config?.blog_span || 4 }
              : block.type === "top_stores_section"
                ? { top_stores_span: block.config?.top_stores_span || 12 }
            : undefined,
      })),
      slider: [
        { enabled_disabled: toggles.slider, slider_number: sliderNumber },
      ],
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
      blog_section: [
        {
          title: src.blog_section_title,
          enabled_disabled: toggles.blog_section,
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
      all_products_section: [
        {
          title: src.all_products_section_title,
          enabled_disabled: toggles.all_products_section,
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
      blog_section_title: values.blog_section_title_df || "",
      top_stores_section_title: values.top_stores_section_title_df || "",
      newsletters_title: values.newsletters_title_df || "",
      newsletters_subtitle: values.newsletters_subtitle_df || "",
      all_products_section_title: values.all_products_section_title_df || "",
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
            blog_section_title:
              (values as any)[`blog_section_title_${langCode}`] || "",
            top_stores_section_title:
              (values as any)[`top_stores_section_title_${langCode}`] || "",
            newsletters_title:
              (values as any)[`newsletters_title_${langCode}`] || "",
            newsletters_subtitle:
              (values as any)[`newsletters_subtitle_${langCode}`] || "",
            all_products_section_title:
              (values as any)[`all_products_section_title_${langCode}`] || "",
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
                {isDf && (
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-3">
                      Blok Akışı
                    </h3>
                    <div className="space-y-2 border rounded p-4">
                      <p className="text-sm text-gray-600">
                        Blokları sürükleyip bırakarak sıralayabilirsin. Banner ve
                        Flash Sale bloklarını birden fazla ekleyebilirsin.
                      </p>
                      <div className="flex flex-wrap gap-2 pb-2">
                        <button
                          type="button"
                          onClick={() => addBlock("banner_section")}
                          className="rounded border px-2 py-1 text-xs font-medium hover:bg-gray-50"
                        >
                          + Banner Bloğu
                        </button>
                        <button
                          type="button"
                          onClick={() => addBlock("flash_sale")}
                          className="rounded border px-2 py-1 text-xs font-medium hover:bg-gray-50"
                        >
                          + Flash Sale Bloğu
                        </button>
                        <button
                          type="button"
                          onClick={() => addBlock("blog_section")}
                          className="rounded border px-2 py-1 text-xs font-medium hover:bg-gray-50"
                        >
                          + Blog Bloğu
                        </button>
                      </div>
                      {layoutBlocks.map((block, index) => (
                        <div
                          key={block.id}
                          draggable
                          onDragStart={() => setDraggedBlockId(block.id)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverBlockId(block.id);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedBlockId) moveBlock(draggedBlockId, block.id);
                            setDraggedBlockId(null);
                            setDragOverBlockId(null);
                          }}
                          onDragEnd={() => {
                            setDraggedBlockId(null);
                            setDragOverBlockId(null);
                          }}
                          className={`flex items-center justify-between rounded border px-3 py-2 bg-white cursor-move ${
                            dragOverBlockId === block.id
                              ? "border-blue-500 bg-blue-50"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {index + 1}. {SECTION_LABELS[block.type]}
                              {REPEATABLE_BLOCKS.includes(block.type)
                                ? ` #${block.instance}`
                                : ""}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                block.enabled_disabled === "on"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {block.enabled_disabled === "on" ? "Aktif" : "Pasif"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={block.enabled_disabled === "on"}
                              onCheckedChange={() => toggleBlockEnabled(block.id)}
                            />
                            {REPEATABLE_BLOCKS.includes(block.type) && (
                              <Input
                                type="number"
                                min={1}
                                value={block.instance}
                                onChange={(e) =>
                                  updateBlockInstance(block.id, e.target.value)
                                }
                                className="app-input h-8 w-20"
                              />
                            )}
                            {block.type === "banner_section" && (
                              <select
                                value={block.config?.banner_span || 4}
                                onChange={(e) =>
                                  updateBannerSpan(block.id, e.target.value)
                                }
                                className="app-input h-8 w-24 rounded border px-2 text-sm"
                              >
                                <option value={4}>4/12</option>
                                <option value={6}>6/12</option>
                                <option value={12}>12/12</option>
                              </select>
                            )}
                            {block.type === "flash_sale" && (
                              <select
                                value={block.config?.flash_sale_span || 6}
                                onChange={(e) =>
                                  updateFlashSaleSpan(block.id, e.target.value)
                                }
                                className="app-input h-8 w-24 rounded border px-2 text-sm"
                              >
                                <option value={4}>4/12</option>
                                <option value={6}>6/12</option>
                                <option value={12}>12/12</option>
                              </select>
                            )}
                            {block.type === "blog_section" && (
                              <select
                                value={block.config?.blog_span || 4}
                                onChange={(e) =>
                                  updateBlogSpan(block.id, e.target.value)
                                }
                                className="app-input h-8 w-24 rounded border px-2 text-sm"
                              >
                                <option value={4}>4/12</option>
                                <option value={6}>6/12</option>
                                <option value={12}>12/12</option>
                              </select>
                            )}
                            {block.type === "top_stores_section" && (
                              <select
                                value={block.config?.top_stores_span || 12}
                                onChange={(e) =>
                                  updateTopStoresSpan(block.id, e.target.value)
                                }
                                className="app-input h-8 w-24 rounded border px-2 text-sm"
                              >
                                <option value={4}>4/12</option>
                                <option value={6}>6/12</option>
                                <option value={12}>12/12</option>
                              </select>
                            )}
                            {REPEATABLE_BLOCKS.includes(block.type) && (
                              <button
                                type="button"
                                onClick={() => removeBlock(block.id)}
                                className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                              >
                                Sil
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-1">
                          Önizleme Sırası
                        </p>
                        <p className="text-sm text-gray-600">
                          {layoutBlocks
                            .map(
                              (block) =>
                                `${SECTION_LABELS[block.type]}${
                                  REPEATABLE_BLOCKS.includes(block.type)
                                    ? ` #${block.instance}`
                                    : ""
                                }`
                            )
                            .join(" > ")}
                        </p>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-2">
                          12-Grid Satır Önizleme
                        </p>
                        <div className="space-y-2">
                          {previewRows.map((row, rowIndex) => (
                            <div
                              key={`preview_row_${rowIndex}`}
                              className="grid grid-cols-12 gap-2 rounded border p-2 bg-gray-50"
                            >
                              {row.map((block, blockIndex) => (
                                <div
                                  key={`preview_block_${block.id}_${blockIndex}`}
                                  className="rounded border bg-white px-2 py-1.5 text-xs font-medium text-gray-700"
                                  style={{
                                    gridColumn: `span ${block.span} / span ${block.span}`,
                                  }}
                                >
                                  {SECTION_LABELS[block.type]}
                                  {REPEATABLE_BLOCKS.includes(block.type)
                                    ? ` #${block.instance}`
                                    : ""}
                                  <span className="ml-1 text-[10px] font-semibold text-slate-500">
                                    {block.enabled_disabled === "on" ? "[Açık]" : "[Kapalı]"}
                                  </span>
                                  <span className="ml-1 text-gray-400">
                                    ({block.span}/12)
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">{t("theme.home.slider")}</h3>
                  <div className="space-y-3 border rounded p-4">
                    <p className="text-base">{t("common.enable_disable")}</p>
                    <Switch
                      checked={toggles.slider === "on"}
                      onCheckedChange={() => handleToggle("slider")}
                    />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">{t("theme.home.banner")}</h3>
                  <div className="space-y-3 border rounded p-4">
                    <p className="text-base">{t("common.enable_disable")}</p>
                    <Switch
                      checked={toggles.banner_section === "on"}
                      onCheckedChange={() => handleToggle("banner_section")}
                    />
                  </div>
                </Card>

                {/* Category */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">{t("theme.home.flash_sale")}</h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("flash_sale_title"))}
                    />

                    <p className="text-base">{t("common.enable_disable")}</p>
                    <Switch
                      checked={toggles.flash_sale === "on"}
                      onCheckedChange={() => handleToggle("flash_sale")}
                    />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">{t("theme.home.category")}</h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("category_title"))}
                    />

                    <p className="text-base">{t("common.enable_disable")}</p>
                    <Switch
                      checked={toggles.category === "on"}
                      onCheckedChange={() => handleToggle("category")}
                    />
                  </div>
                </Card>

                {/* Featured Products */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {t("theme.home.featured_products")}
                  </h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("product_featured_title"))}
                    />

                    <p className="text-base">{t("common.enable_disable")}</p>
                    <Switch
                      checked={toggles.product_featured === "on"}
                      onCheckedChange={() => handleToggle("product_featured")}
                    />
                  </div>
                </Card>

                {/* Top Selling */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {t("theme.home.top_selling_products")}
                  </h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("product_top_selling_title"))}
                    />

                    <p className="text-base">{t("common.enable_disable")}</p>
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
                    {t("theme.home.latest_products")}
                  </h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("product_latest_title"))}
                    />

                    <p className="text-base">{t("common.enable_disable")}</p>
                    <Switch
                      checked={toggles.product_latest === "on"}
                      onCheckedChange={() => handleToggle("product_latest")}
                    />
                  </div>
                </Card>

                {/* Popular */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {t("theme.home.popular_products")}
                  </h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("popular_product_section_title"))}
                    />

                    <p className="text-base">{t("common.enable_disable")}</p>
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
                  <h3 className="text-lg font-semibold mb-3">Blog</h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("blog_section_title"))}
                    />

                    <p className="text-base">{t("common.enable_disable")}</p>
                    <Switch
                      checked={toggles.blog_section === "on"}
                      onCheckedChange={() => handleToggle("blog_section")}
                    />
                  </div>
                </Card>

                {/* Top Stores */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">{t("theme.home.top_stores")}</h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("top_stores_section_title"))}
                    />

                    <p className="text-base">{t("common.enable_disable")}</p>
                    <Switch
                      checked={toggles.top_stores_section === "on"}
                      onCheckedChange={() => handleToggle("top_stores_section")}
                    />
                  </div>
                </Card>

                {/* Newsletters */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">{t("theme.home.newsletters")}</h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("newsletters_title"))}
                    />

                    <label className="block text-sm font-medium">
                      {t("label.subtitle")} ({t(`lang.${id}` as any)})
                    </label>
                    <Textarea
                      className="app-input"
                      {...register(field("newsletters_subtitle"))}
                    />

                    <p className="text-base">{t("common.enable_disable")}</p>
                    <Switch
                      checked={toggles.newsletters_section === "on"}
                      onCheckedChange={() =>
                        handleToggle("newsletters_section")
                      }
                    />
                  </div>
                </Card>

                {/* All Products */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Tüm Ürünler (Sonsuz Scroll)</h3>
                  <div className="space-y-3 border rounded p-4">
                    <label className="block text-sm font-medium">
                      {t("label.title")} ({t(`lang.${id}` as any)})
                    </label>
                    <Input
                      className="app-input"
                      {...register(field("all_products_section_title"))}
                    />

                    <p className="text-base">{t("common.enable_disable")}</p>
                    <Switch
                      checked={toggles.all_products_section === "on"}
                      onCheckedChange={() => handleToggle("all_products_section")}
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
