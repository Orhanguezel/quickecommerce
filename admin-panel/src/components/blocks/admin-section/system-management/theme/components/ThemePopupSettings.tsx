"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { getThemeLanguageData } from "../utils/themeLanguage";
import PhotoUploadModal, { type UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";
import { Card, Input, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { useThemeStoreMutation } from "@/modules/admin-section/theme/theme.action";
import { SubmitButton } from "@/components/blocks/shared";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface ThemePopupSettingsProps {
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

type PopupDisplayType = "modal_center" | "top_bar" | "bottom_bar";
type PopupTextBehavior = "static" | "marquee";

type PopupItem = {
  id: string;
  enabled_disabled: "on" | "off";
  title: string;
  subtitle: string;
  button_text: string;
  button_url: string;
  image_id: string | null;
  image_id_url?: string;
  img_url: string;
  image_url: string;
  coupon_code: string;
  sort_order: number;
  delay_seconds: number;
  frequency_days: number;
  page_target: "all" | "home";
  display_type: PopupDisplayType;
  text_behavior: PopupTextBehavior;
  popup_bg_color: string;
  popup_text_color: string;
  popup_button_bg_color: string;
  popup_button_text_color: string;
};

const emptyPopup = (sortOrder: number): PopupItem => ({
  id: `popup_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  enabled_disabled: "on",
  title: "",
  subtitle: "",
  button_text: "",
  button_url: "",
  image_id: null,
  image_id_url: "",
  img_url: "",
  image_url: "",
  coupon_code: "",
  sort_order: sortOrder,
  delay_seconds: 3,
  frequency_days: 3,
  page_target: "all",
  display_type: "modal_center",
  text_behavior: "static",
  popup_bg_color: "#0E5ABC",
  popup_text_color: "#FFFFFF",
  popup_button_bg_color: "#FFFFFF",
  popup_button_text_color: "#0E5ABC",
});

const popupChannelPrefix = (displayType: PopupDisplayType): "Top" | "Modal" | "Bottom" => {
  if (displayType === "top_bar") return "Top";
  if (displayType === "bottom_bar") return "Bottom";
  return "Modal";
};

const getPopupChannelLabel = (items: PopupItem[], idx: number): string => {
  const current = items[idx];
  if (!current) return "Modal #1";
  const sameChannelCount = items
    .slice(0, idx + 1)
    .filter((item) => item.display_type === current.display_type).length;
  return `${popupChannelPrefix(current.display_type)} #${sameChannelCount}`;
};

const getPopupChannelBadgeClass = (displayType: PopupDisplayType): string => {
  if (displayType === "top_bar") {
    return "bg-blue-100 text-blue-700";
  }
  if (displayType === "bottom_bar") {
    return "bg-emerald-100 text-emerald-700";
  }
  return "bg-indigo-100 text-indigo-700";
};

const ThemePopupSettings: React.FC<ThemePopupSettingsProps> = ({ allData, refetch }) => {
  const t = useTranslations();
  const multiLangData = useMemo(
    () => getThemeLanguageData(),
    []
  );
  const nonDefaultLangs = useMemo(
    () => multiLangData.filter((lang) => lang.id !== "df"),
    [multiLangData]
  );
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [defaultItems, setDefaultItems] = useState<PopupItem[]>([]);
  const [langItems, setLangItems] = useState<Record<string, PopupItem[]>>({});
  const hydratedKeyRef = useRef<string>("");

  const { mutate: ThemeStore, isPending } = useThemeStoreMutation();

  const hydrationKey = useMemo(() => {
    const defaultRaw = (allData as any)?.theme_data?.theme_pages?.[0]?.theme_popup_settings ?? [];
    const translationRaw = nonDefaultLangs.map((lang) => ({
      lang: lang.id,
      popups:
        (allData as any)?.translations?.[lang.id]?.theme_data?.theme_pages?.[0]
          ?.theme_popup_settings ?? [],
    }));
    return JSON.stringify({ defaultRaw, translationRaw });
  }, [allData, nonDefaultLangs]);

  useEffect(() => {
    if (hydrationKey === hydratedKeyRef.current) return;
    hydratedKeyRef.current = hydrationKey;

    const defaultRaw = (allData as any)?.theme_data?.theme_pages?.[0]?.theme_popup_settings;
    const baseItems: PopupItem[] = Array.isArray(defaultRaw) && defaultRaw.length > 0
      ? defaultRaw.map((item: any, idx: number) => ({
          id: String(item?.id || `popup_${idx + 1}`),
          enabled_disabled: item?.enabled_disabled === "on" ? "on" : "off",
          title: item?.title || "",
          subtitle: item?.subtitle || "",
          button_text: item?.button_text || "",
          button_url: item?.button_url || "",
          image_id: item?.image_id ? String(item.image_id) : null,
          image_id_url: item?.image_id_url || "",
          img_url: item?.image_id_url || item?.img_url || item?.image_url || "",
          image_url: item?.image_id_url || item?.image_url || item?.img_url || "",
          coupon_code: item?.coupon_code || "",
          sort_order: Number(item?.sort_order ?? idx + 1),
          delay_seconds: Number(item?.delay_seconds ?? 3),
          frequency_days: Number(item?.frequency_days ?? 3),
          page_target: item?.page_target === "home" ? "home" : "all",
          display_type:
            item?.display_type === "top_bar" || item?.display_type === "bottom_bar"
              ? item.display_type
              : "modal_center",
          text_behavior: item?.text_behavior === "marquee" ? "marquee" : "static",
          popup_bg_color: item?.popup_bg_color || "#0E5ABC",
          popup_text_color: item?.popup_text_color || "#FFFFFF",
          popup_button_bg_color: item?.popup_button_bg_color || "#FFFFFF",
          popup_button_text_color: item?.popup_button_text_color || "#0E5ABC",
        }))
      : [emptyPopup(1)];

    setDefaultItems(baseItems);

    const nextLangItems: Record<string, PopupItem[]> = {};
    nonDefaultLangs.forEach((lang) => {
      const translatedRaw =
        (allData as any)?.translations?.[lang.id]?.theme_data?.theme_pages?.[0]
          ?.theme_popup_settings;

      const translatedArray = Array.isArray(translatedRaw) ? translatedRaw : [];
      nextLangItems[lang.id] = baseItems.map((base, idx) => {
        const trans = translatedArray[idx] || {};
        return {
          ...base,
          title: trans?.title || "",
          subtitle: trans?.subtitle || "",
          button_text: trans?.button_text || "",
        };
      });
    });
    setLangItems(nextLangItems);
  }, [allData, nonDefaultLangs, hydrationKey]);

  const addPopup = () => {
    setDefaultItems((prev) => {
      const next = [...prev, emptyPopup(prev.length + 1)];
      return next.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    });
    setLangItems((prev) => {
      const next = { ...prev };
      nonDefaultLangs.forEach((lang) => {
        const current = next[lang.id] || [];
        next[lang.id] = [...current, emptyPopup(current.length + 1)];
      });
      return next;
    });
  };

  const removePopup = (idx: number) => {
    setDefaultItems((prev) =>
      prev.filter((_, i) => i !== idx).map((item, i) => ({ ...item, sort_order: i + 1 }))
    );
    setLangItems((prev) => {
      const next = { ...prev };
      nonDefaultLangs.forEach((lang) => {
        next[lang.id] = (next[lang.id] || [])
          .filter((_, i) => i !== idx)
          .map((item, i) => ({ ...item, sort_order: i + 1 }));
      });
      return next;
    });
  };

  const updateDefaultField = (idx: number, field: keyof PopupItem, value: any) => {
    setDefaultItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const updateLangField = (
    langId: string,
    idx: number,
    field: "title" | "subtitle" | "button_text",
    value: string
  ) => {
    setLangItems((prev) => ({
      ...prev,
      [langId]: (prev[langId] || []).map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      ),
    }));
  };

  const savePopupImage = (idx: number, images: UploadedImage[]) => {
    const selected = images[0] as UploadedImage & { id?: string; image_id_url?: string };
    if (!selected) return;
    const resolvedUrl = selected.img_url || selected.image_id_url || selected.url || "";
    const asString = (value: unknown) => (value === null || value === undefined ? "" : String(value));
    const imageIdRaw = asString(selected.image_id);
    const fallbackIdRaw = asString(selected.id);
    const normalizedId = /^\d+$/.test(imageIdRaw)
      ? imageIdRaw
      : /^\d+$/.test(fallbackIdRaw)
        ? fallbackIdRaw
        : "";
    if (!normalizedId && !resolvedUrl) return;
    updateDefaultField(idx, "image_id", normalizedId || null);
    updateDefaultField(idx, "image_id_url", resolvedUrl);
    updateDefaultField(idx, "img_url", resolvedUrl);
    updateDefaultField(idx, "image_url", resolvedUrl);
  };

  const clearPopupImage = (idx: number) => {
    updateDefaultField(idx, "image_id", null);
    updateDefaultField(idx, "image_id_url", "");
    updateDefaultField(idx, "img_url", "");
    updateDefaultField(idx, "image_url", "");
  };

  const onSubmit = () => {
    const updatedThemeData = JSON.parse(JSON.stringify((allData as any).theme_data || {}));
    if (!updatedThemeData.theme_pages) updatedThemeData.theme_pages = {};
    if (!updatedThemeData.theme_pages["0"]) updatedThemeData.theme_pages["0"] = {};
    updatedThemeData.theme_pages["0"].theme_popup_settings = defaultItems.map((item, idx) => ({
      ...item,
      id: item.id || `popup_${idx + 1}`,
      enabled_disabled: item.enabled_disabled === "on" ? "on" : "off",
      sort_order: idx + 1,
    }));

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

      const local = langItems[lang.id] || [];
      updatedTranslations[lang.id].theme_data.theme_pages["0"].theme_popup_settings =
        defaultItems.map((base, idx) => ({
          ...base,
          title: local[idx]?.title || "",
          subtitle: local[idx]?.subtitle || "",
          button_text: local[idx]?.button_text || "",
          sort_order: idx + 1,
        }));
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
          const isDf = lang.id === "df";
          const activeItems = isDf ? defaultItems : langItems[lang.id] || [];

          return (
            <TabsContent key={lang.id} value={lang.id} className="lg:col-span-2">
              <Card className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    Popup Listesi ({activeItems.length})
                  </p>
                  {isDf ? (
                    <button
                      type="button"
                      onClick={addPopup}
                      className="rounded border px-3 py-1 text-xs font-medium"
                    >
                      + Popup Ekle
                    </button>
                  ) : null}
                </div>

                <div className="space-y-4">
                  {activeItems.map((item, idx) => (
                    <div key={`${lang.id}_${item.id}_${idx}`} className="space-y-3 rounded border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">Popup #{idx + 1}</p>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${getPopupChannelBadgeClass(item.display_type)}`}
                          >
                            {getPopupChannelLabel(activeItems, idx)}
                          </span>
                        </div>
                        {isDf ? (
                          <button
                            type="button"
                            onClick={() => removePopup(idx)}
                            className="rounded border px-2 py-1 text-xs text-red-600"
                          >
                            Sil
                          </button>
                        ) : null}
                      </div>

                      <label className="block text-sm font-medium">Başlık</label>
                      <Input
                        className="app-input"
                        value={item.title}
                        onChange={(e) =>
                          isDf
                            ? updateDefaultField(idx, "title", e.target.value)
                            : updateLangField(lang.id, idx, "title", e.target.value)
                        }
                      />

                      <label className="block text-sm font-medium">Alt Metin</label>
                      <Input
                        className="app-input"
                        value={item.subtitle}
                        onChange={(e) =>
                          isDf
                            ? updateDefaultField(idx, "subtitle", e.target.value)
                            : updateLangField(lang.id, idx, "subtitle", e.target.value)
                        }
                      />

                      <label className="block text-sm font-medium">Buton Metni</label>
                      <Input
                        className="app-input"
                        value={item.button_text}
                        onChange={(e) =>
                          isDf
                            ? updateDefaultField(idx, "button_text", e.target.value)
                            : updateLangField(lang.id, idx, "button_text", e.target.value)
                        }
                      />

                      {isDf ? (
                        <>
                          <label className="block text-sm font-medium">Buton URL</label>
                          <Input
                            className="app-input"
                            value={item.button_url}
                            onChange={(e) => updateDefaultField(idx, "button_url", e.target.value)}
                          />

                          <label className="block text-sm font-medium">Kupon Kodu</label>
                          <Input
                            className="app-input"
                            value={item.coupon_code}
                            onChange={(e) => updateDefaultField(idx, "coupon_code", e.target.value)}
                          />

                          <label className="block text-sm font-medium">Görsel</label>
                          <div className="flex items-center gap-3">
                            <PhotoUploadModal
                              trigger={
                                item.img_url ? (
                                  <div className="relative h-20 w-20 cursor-pointer overflow-hidden rounded border">
                                    <Image
                                      src={item.img_url}
                                      alt="Popup"
                                      fill
                                      className="object-cover"
                                      sizes="80px"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-20 w-20 cursor-pointer items-center justify-center rounded border border-dashed text-xs text-gray-500">
                                    Görsel Seç
                                  </div>
                                )
                              }
                              isMultiple={false}
                              onSave={(images) => savePopupImage(idx, images)}
                              usageType="theme_popup"
                              selectedImage={
                                (item.img_url || item.image_id_url)
                                  ? {
                                      image_id: item.image_id || "",
                                      img_url: item.img_url || item.image_id_url || "",
                                      url: item.img_url || item.image_id_url || "",
                                      name: "popup",
                                    }
                                  : undefined
                              }
                            />
                            {(item.img_url || item.image_id_url) ? (
                              <button
                                type="button"
                                onClick={() => clearPopupImage(idx)}
                                className="rounded border px-3 py-1 text-xs text-red-600"
                              >
                                Kaldır
                              </button>
                            ) : null}
                          </div>

                          <div className="grid gap-3 md:grid-cols-3">
                            <div>
                              <label className="block text-sm font-medium">Gecikme (sn)</label>
                              <Input
                                type="number"
                                min={0}
                                className="app-input"
                                value={item.delay_seconds}
                                onChange={(e) =>
                                  updateDefaultField(
                                    idx,
                                    "delay_seconds",
                                    Number(e.target.value || 0)
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium">Tekrar (gün)</label>
                              <Input
                                type="number"
                                min={0}
                                className="app-input"
                                value={item.frequency_days}
                                onChange={(e) =>
                                  updateDefaultField(
                                    idx,
                                    "frequency_days",
                                    Number(e.target.value || 0)
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium">Sıra</label>
                              <Input
                                type="number"
                                min={1}
                                className="app-input"
                                value={item.sort_order}
                                onChange={(e) =>
                                  updateDefaultField(
                                    idx,
                                    "sort_order",
                                    Number(e.target.value || idx + 1)
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-3">
                            <div>
                              <label className="block text-sm font-medium">Hedef Sayfa</label>
                              <select
                                value={item.page_target}
                                onChange={(e) =>
                                  updateDefaultField(
                                    idx,
                                    "page_target",
                                    e.target.value === "home" ? "home" : "all"
                                  )
                                }
                                className="app-input h-10 rounded border px-2 text-sm"
                              >
                                <option value="all">Tüm Sayfalar</option>
                                <option value="home">Sadece Ana Sayfa</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium">Konum</label>
                              <select
                                value={item.display_type}
                                onChange={(e) =>
                                  updateDefaultField(idx, "display_type", e.target.value)
                                }
                                className="app-input h-10 rounded border px-2 text-sm"
                              >
                                <option value="modal_center">Ortada Popup</option>
                                <option value="top_bar">Sayfa Üstü Bar</option>
                                <option value="bottom_bar">Sayfa Altı Bar</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium">Metin Davranışı</label>
                              <select
                                value={item.text_behavior}
                                onChange={(e) =>
                                  updateDefaultField(idx, "text_behavior", e.target.value)
                                }
                                className="app-input h-10 rounded border px-2 text-sm"
                              >
                                <option value="static">Sabit</option>
                                <option value="marquee">Kayan Yazı</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium">Popup Arkaplan</label>
                              <Input
                                type="color"
                                className="app-input h-10 w-full p-1"
                                value={item.popup_bg_color || "#0E5ABC"}
                                onChange={(e) =>
                                  updateDefaultField(idx, "popup_bg_color", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium">Popup Yazı</label>
                              <Input
                                type="color"
                                className="app-input h-10 w-full p-1"
                                value={item.popup_text_color || "#FFFFFF"}
                                onChange={(e) =>
                                  updateDefaultField(idx, "popup_text_color", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium">Buton Arkaplan</label>
                              <Input
                                type="color"
                                className="app-input h-10 w-full p-1"
                                value={item.popup_button_bg_color || "#FFFFFF"}
                                onChange={(e) =>
                                  updateDefaultField(idx, "popup_button_bg_color", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium">Buton Yazı</label>
                              <Input
                                type="color"
                                className="app-input h-10 w-full p-1"
                                value={item.popup_button_text_color || "#0E5ABC"}
                                onChange={(e) =>
                                  updateDefaultField(idx, "popup_button_text_color", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="pt-1">
                            <p className="text-base">{t("common.enable_disable")}</p>
                            <Switch
                              checked={item.enabled_disabled === "on"}
                              onCheckedChange={() =>
                                updateDefaultField(
                                  idx,
                                  "enabled_disabled",
                                  item.enabled_disabled === "on" ? "off" : "on"
                                )
                              }
                            />
                          </div>
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <Card className="mt-4 sticky bottom-0 w-full p-4">
        <SubmitButton IsLoading={isPending} AddLabel={t("button.save_changes")} />
      </Card>
    </form>
  );
};

export default ThemePopupSettings;
