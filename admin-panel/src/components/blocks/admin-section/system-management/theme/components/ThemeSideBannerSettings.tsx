"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import multiLang from "@/components/molecules/multiLang.json";
import { Card, Input, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { useThemeStoreMutation } from "@/modules/admin-section/theme/theme.action";
import { SubmitButton } from "@/components/blocks/shared";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

type PageTarget = "all" | "home" | "product";

type SideBannerItem = {
  id: string;
  enabled_disabled: "on" | "off";
  title: string;
  link_url: string;
  open_in_new_tab: "on" | "off";
  page_target: PageTarget;
  width_px: number;
  top_offset_px: number;
  banner_order: number;
  dismissible: "on" | "off";
  dismiss_policy: "always" | "session" | "days";
  dismiss_days: number;
};

interface ThemeSideBannerSettingsProps {
  allData: any[];
  refetch: any;
}

const defaultBanner = (): SideBannerItem => ({
  id: "left_sticky_banner_1",
  enabled_disabled: "off",
  title: "Sol Sticky Banner",
  link_url: "",
  open_in_new_tab: "off",
  page_target: "all",
  width_px: 240,
  top_offset_px: 200,
  banner_order: 1,
  dismissible: "on",
  dismiss_policy: "days",
  dismiss_days: 1,
});

const ThemeSideBannerSettings: React.FC<ThemeSideBannerSettingsProps> = ({ allData, refetch }) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const multiLangData = useMemo(
    () => multiLang as Array<{ id: string; label: string }>,
    []
  );
  const nonDefaultLangs = useMemo(
    () => multiLangData.filter((lang) => lang.id !== "df"),
    [multiLangData]
  );
  const hydratedRef = useRef<string>("");

  const [defaultItem, setDefaultItem] = useState<SideBannerItem>(defaultBanner());
  const [langItems, setLangItems] = useState<Record<string, SideBannerItem>>({});

  const { mutate: ThemeStore, isPending } = useThemeStoreMutation();

  const hydrationKey = useMemo(() => {
    const rawDefault =
      (allData as any)?.theme_data?.theme_pages?.[0]?.theme_side_banner_settings?.[0] || {};
    const rawTranslations = nonDefaultLangs.map((lang) => ({
      lang: lang.id,
      item:
        (allData as any)?.translations?.[lang.id]?.theme_data?.theme_pages?.[0]
          ?.theme_side_banner_settings?.[0] || {},
    }));
    return JSON.stringify({ rawDefault, rawTranslations });
  }, [allData, nonDefaultLangs]);

  useEffect(() => {
    if (hydrationKey === hydratedRef.current) return;
    hydratedRef.current = hydrationKey;

    const raw =
      (allData as any)?.theme_data?.theme_pages?.[0]?.theme_side_banner_settings?.[0] || {};
    const base: SideBannerItem = {
      ...defaultBanner(),
      ...raw,
      id: String(raw?.id || "left_sticky_banner_1"),
      enabled_disabled: raw?.enabled_disabled === "on" ? "on" : "off",
      link_url: raw?.link_url || "",
      open_in_new_tab: raw?.open_in_new_tab === "on" ? "on" : "off",
      page_target:
        raw?.page_target === "home" || raw?.page_target === "product" ? raw.page_target : "all",
      width_px: Math.max(180, Number(raw?.width_px || 240)),
      top_offset_px: Math.max(80, Number(raw?.top_offset_px || 200)),
      banner_order: Math.max(1, Number(raw?.banner_order || 1)),
      dismissible: raw?.dismissible === "off" ? "off" : "on",
      dismiss_policy:
        raw?.dismiss_policy === "always" || raw?.dismiss_policy === "session"
          ? raw.dismiss_policy
          : "days",
      dismiss_days: Math.max(1, Number(raw?.dismiss_days || 1)),
    };
    setDefaultItem(base);

    const next: Record<string, SideBannerItem> = {};
    nonDefaultLangs.forEach((lang) => {
      const tr =
        (allData as any)?.translations?.[lang.id]?.theme_data?.theme_pages?.[0]
          ?.theme_side_banner_settings?.[0] || {};
      next[lang.id] = {
        ...base,
        title: tr?.title || "",
      };
    });
    setLangItems(next);
  }, [allData, hydrationKey, nonDefaultLangs]);

  const onSubmit = () => {
    const updatedThemeData = JSON.parse(JSON.stringify((allData as any).theme_data || {}));
    if (!updatedThemeData.theme_pages) updatedThemeData.theme_pages = {};
    if (!updatedThemeData.theme_pages["0"]) updatedThemeData.theme_pages["0"] = {};
    updatedThemeData.theme_pages["0"].theme_side_banner_settings = [defaultItem];

    const updatedTranslations: Record<string, any> = JSON.parse(
      JSON.stringify((allData as any).translations || {})
    );

    nonDefaultLangs.forEach((lang) => {
      if (!updatedTranslations[lang.id]) {
        updatedTranslations[lang.id] = { theme_data: { theme_pages: { "0": {} } } };
      }
      if (!updatedTranslations[lang.id].theme_data?.theme_pages) {
        updatedTranslations[lang.id].theme_data.theme_pages = { "0": {} };
      }
      if (!updatedTranslations[lang.id].theme_data.theme_pages["0"]) {
        updatedTranslations[lang.id].theme_data.theme_pages["0"] = {};
      }

      updatedTranslations[lang.id].theme_data.theme_pages["0"].theme_side_banner_settings = [
        {
          ...defaultItem,
          title: langItems[lang.id]?.title || "",
        },
      ];
    });

    ThemeStore(
      { theme_data: updatedThemeData, translations: updatedTranslations },
      { onSuccess: () => refetch() }
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Tabs defaultValue="df" className="col-span-2">
        <TabsList dir={dir} className="flex justify-start bg-transparent">
          {multiLangData.map((lang) => (
            <TabsTrigger key={lang.id} value={lang.id}>
              {lang.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {multiLangData.map((lang) => {
          const isDefault = lang.id === "df";
          const item = isDefault ? defaultItem : langItems[lang.id] || defaultItem;
          return (
            <TabsContent key={lang.id} value={lang.id} className="lg:col-span-2">
              <Card className="space-y-4 p-4">
                <label className="block text-sm font-medium">Banner Başlığı</label>
                <Input
                  className="app-input"
                  value={item.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (isDefault) {
                      setDefaultItem((prev) => ({ ...prev, title: value }));
                    } else {
                      setLangItems((prev) => ({
                        ...prev,
                        [lang.id]: { ...(prev[lang.id] || defaultItem), title: value },
                      }));
                    }
                  }}
                />

                {isDefault ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium">Banner Sırası</label>
                        <Input
                          type="number"
                          min={1}
                          className="app-input"
                          value={item.banner_order}
                          onChange={(e) =>
                            setDefaultItem((prev) => ({
                              ...prev,
                              banner_order: Math.max(1, Number(e.target.value || 1)),
                            }))
                          }
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          1, 2, 3... olarak mevcut banner listesindeki sıraya göre seçer.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Hedef Sayfa</label>
                        <select
                          value={item.page_target}
                          onChange={(e) =>
                            setDefaultItem((prev) => ({
                              ...prev,
                              page_target:
                                e.target.value === "home" || e.target.value === "product"
                                  ? (e.target.value as PageTarget)
                                  : "all",
                            }))
                          }
                          className="app-input h-10 rounded border px-2 text-sm"
                        >
                          <option value="all">Tüm Sayfalar</option>
                          <option value="home">Sadece Ana Sayfa</option>
                          <option value="product">Sadece Ürün Sayfası</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium">Link URL (Opsiyonel)</label>
                        <Input
                          className="app-input"
                          value={item.link_url}
                          onChange={(e) =>
                            setDefaultItem((prev) => ({ ...prev, link_url: e.target.value }))
                          }
                        />
                      </div>
                      <div className="pt-1">
                        <p className="text-base">Yeni Sekmede Aç</p>
                        <Switch
                          checked={item.open_in_new_tab === "on"}
                          onCheckedChange={() =>
                            setDefaultItem((prev) => ({
                              ...prev,
                              open_in_new_tab: prev.open_in_new_tab === "on" ? "off" : "on",
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium">Genişlik (px)</label>
                        <Input
                          type="number"
                          min={180}
                          className="app-input"
                          value={item.width_px}
                          onChange={(e) =>
                            setDefaultItem((prev) => ({
                              ...prev,
                              width_px: Math.max(180, Number(e.target.value || 240)),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Üst Ofset (px)</label>
                        <Input
                          type="number"
                          min={80}
                          className="app-input"
                          value={item.top_offset_px}
                          onChange={(e) =>
                            setDefaultItem((prev) => ({
                              ...prev,
                              top_offset_px: Math.max(80, Number(e.target.value || 200)),
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <p className="text-base">{t("common.enable_disable")}</p>
                      <Switch
                        checked={item.enabled_disabled === "on"}
                        onCheckedChange={() =>
                          setDefaultItem((prev) => ({
                            ...prev,
                            enabled_disabled: prev.enabled_disabled === "on" ? "off" : "on",
                          }))
                        }
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="pt-1">
                        <p className="text-base">Kapatma Butonu</p>
                        <Switch
                          checked={item.dismissible === "on"}
                          onCheckedChange={() =>
                            setDefaultItem((prev) => ({
                              ...prev,
                              dismissible: prev.dismissible === "on" ? "off" : "on",
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Tekrar Gösterim</label>
                        <select
                          value={item.dismiss_policy}
                          onChange={(e) =>
                            setDefaultItem((prev) => ({
                              ...prev,
                              dismiss_policy:
                                e.target.value === "always" || e.target.value === "session"
                                  ? e.target.value
                                  : "days",
                            }))
                          }
                          className="app-input h-10 rounded border px-2 text-sm"
                        >
                          <option value="always">Her Zaman Göster</option>
                          <option value="session">Sadece Oturum Boyunca Gizle</option>
                          <option value="days">Gün Bazlı Gizle</option>
                        </select>
                      </div>
                    </div>

                    {item.dismiss_policy === "days" ? (
                      <div>
                        <label className="block text-sm font-medium">Kaç Gün Gizlensin</label>
                        <Input
                          type="number"
                          min={1}
                          className="app-input"
                          value={item.dismiss_days}
                          onChange={(e) =>
                            setDefaultItem((prev) => ({
                              ...prev,
                              dismiss_days: Math.max(1, Number(e.target.value || 1)),
                            }))
                          }
                        />
                      </div>
                    ) : null}
                  </>
                ) : null}
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <Card className="sticky bottom-0 mt-4 w-full p-4">
        <SubmitButton IsLoading={isPending} AddLabel={t("button.save_changes")} />
      </Card>
    </form>
  );
};

export default ThemeSideBannerSettings;
