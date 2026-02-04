// =============================================================
// File: src/components/blocks/admin-section/system-management/menu-customization/CreateOrUpdateMenuCustomizationForm.tsx
// FINAL — Form + JSON aynı "Kaydet/Güncelle" butonu ile
// - manuCustomizationSchema değişmedi
// - AdminI18nJsonPanel + useFormI18nScaffold
// - JSON değişiklikleri RHF alanlarına setValue ile yazılır (name alanı)
// - Menü ağacı (menuItems) her dil için ayrı tutulur (df + diğerleri)
// - Sıra/structure değişince tüm dillerin yapısı güncellenir, label'lar korunur
// - Footer Save her modda görünür (tek buton)
// =============================================================

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import NoDataFoundIcon from "@/assets/icons/NoDataFoundIcon";
import multiLang from "@/components/molecules/multiLang.json";
import { SubmitButton } from "@/components/blocks/shared";
import { Card, CardContent, Input, Switch } from "@/components/ui";
import { useAllPagesQuery } from "@/modules/admin-section/pages/pages.action";
import {
  useMenuCustomizationStoreMutation,
  useMenuCustomizationUpdateMutation,
} from "@/modules/admin-section/system-management/menu-customization/menu-customization.action";
import {
  manuCustomizationSchema,
  MenuCustomizationFormData,
} from "@/modules/admin-section/system-management/menu-customization/menu-customization.schema";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import DefaultPagesSelector from "./component/DefaultPagesSelector";
import LinkAdder from "./component/LinkAdder";
import NestedDndMenu from "./component/NestedDndMenu";
import PagesSelector from "./component/PagesSelector";

// JSON scaffold stack (standard)
import {
  AdminI18nJsonPanel,
  buildI18nJsonFromFlatValues,
  applyI18nJsonToFlatForm,
  makeRHFSetValueAny, safeObject,
  ensureLangKeys,
  useFormI18nScaffold,
  initI18nFlatFormFromEntity,
} from '@/lib/json';
import type {  LangKeys, ViewMode, LangType} from '@/lib/json';


type ToggleState = { is_visible: boolean };


// JSON alanları (schema: name_df + name_x)
const I18N_FIELDS = ["name"] as const;

interface MenuItem {
  id: string;
  label: string;
  url: string;
  children?: MenuItem[];
}

function safeStr(x: unknown) {
  return String(x ?? "").trim();
}

function hasAnyI18nValue(values: any, langId: string) {
  return !!safeStr(values?.[`name_${langId}`]);
}

function cloneTreeWithPreservedLabels(newItems: MenuItem[], oldLangItems: MenuItem[]): MenuItem[] {
  const labelMap = new Map<string, string>();

  const collectLabels = (items: MenuItem[]) => {
    for (const item of items) {
      labelMap.set(item.id, item.label);
      if (item.children?.length) collectLabels(item.children);
    }
  };

  collectLabels(oldLangItems);

  const cloneItems = (items: MenuItem[]): MenuItem[] =>
    items.map((item) => ({
      ...item,
      label: labelMap.get(item.id) || item.label,
      children: item.children ? cloneItems(item.children) : [],
    }));

  return cloneItems(newItems);
}

export default function CreateOrUpdateMenuCustomizationForm({ data }: any) {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const localeLang = useLocale();

  const allLangs = useMemo(() => multiLang as LangType[], []);
  const [viewMode, setViewMode] = useState<ViewMode>("form");

  const editData = data?.data;

  // -----------------------------
  // RHF
  // -----------------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
    control,
  } = useForm<MenuCustomizationFormData>({
    resolver: zodResolver(manuCustomizationSchema),
    defaultValues: {
      name_df: "",
      pages: editData?.page_id ? String(editData.page_id) : "",
      url: "",
      icon: "",
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<MenuCustomizationFormData>(setValue), [setValue]);

  // i18n scaffold
  const i18n = useFormI18nScaffold<MenuCustomizationFormData>({
    languages: allLangs,
    excludeLangIds: [],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    extraWatchNames: ["pages", "url", "icon"],
    dfSync: {
      enabled: true,
      pairs: [{ dfField: "name_df", srcField: (l) => `name_${l}`, validate: true }],
    },
  });

  const { uiLangs, translationsJson, handleTranslationsJsonChange, rebuildJsonNow } = i18n;

  // minimal watch
  const watchedNameDf = useWatch({ control, name: "name_df" as any }) as string;

  // -----------------------------
  // UI state
  // -----------------------------
  const [toggles, setToggles] = useState<ToggleState>({ is_visible: false });
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({});

  // Menü dil map init
  useEffect(() => {
    if (Object.keys(menuItems).length > 0) return;
    const initial = uiLangs.reduce((acc, lang) => {
      acc[lang.id] = [];
      return acc;
    }, {} as Record<string, MenuItem[]>);
    setMenuItems(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLangs]);

  // -----------------------------
  // Pages
  // -----------------------------
  const additionalPages = [
    { id: 1, label: "Home", value: 1, slug: "/" },
    { id: 2, label: "Product", value: 2, slug: "products" },
    { id: 3, label: "Category", value: 3, slug: "product-categories" },
    { id: 4, label: "Store", value: 4, slug: "stores" },
    { id: 5, label: "Blog", value: 5, slug: "blogs" },
    { id: 6, label: "Coupon", value: 6, slug: "coupon" },
  ];

  const { AllPagesData, isPending: isPagePending } = useAllPagesQuery({
    language: localeLang,
  });
  const AllPages = (AllPagesData as any)?.all_pages || [];

  const handleAddDefaultPagesToMenu = (selectedPages: any[]) => {
    const newMenuItems: MenuItem[] = selectedPages.map((page) => ({
      id: `new-${Date.now()}-${page.value}`,
      label: page.label,
      url: page.slug || `/${page.value}`,
      children: [],
    }));

    setMenuItems((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((lang) => {
        updated[lang] = [...(updated[lang] || []), ...newMenuItems];
      });
      return updated;
    });
  };

  const handleAddPagesToMenu = (selectedPages: any[]) => {
    const newMenuItems: MenuItem[] = selectedPages.map((page) => ({
      id: `new-${Date.now()}-${page.value}`,
      label: page.label,
      url: page.slug || `/${page.value}`,
      children: [],
    }));

    setMenuItems((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((lang) => {
        updated[lang] = [...(updated[lang] || []), ...newMenuItems];
      });
      return updated;
    });
  };

  const handleAddCustomLink = (title: string, url: string) => {
    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      label: title,
      url: url.startsWith("http") ? url : `/${url}`,
      children: [],
    };

    setMenuItems((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((lang) => {
        updated[lang] = [...(updated[lang] || []), newItem];
      });
      return updated;
    });
  };

  // -----------------------------
  // Edit init: form + menuItems + i18n
  // -----------------------------
  useEffect(() => {
    if (!editData) {
      rebuildJsonNow();
      return;
    }

    // base fields
    setValueAny("name_df", editData?.name ?? "", { shouldDirty: false, shouldValidate: true });
    setValueAny("url", editData?.url ?? "", { shouldDirty: false });
    setValueAny("pages", editData?.page_id ? String(editData.page_id) : "", { shouldDirty: false });

    setToggles({ is_visible: editData?.is_visible == 1 || editData?.is_visible === true });

    // normalize translations for initI18nFlatFormFromEntity
    const raw = editData?.translations;
    const normalizedTranslations = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object"
        ? Object.keys(raw).map((lang) => ({
            language_code: lang,
            name: raw?.[lang]?.name ?? "",
          }))
        : [];

    const normalizedEditData = {
      ...editData,
      translations: normalizedTranslations,
    };

    initI18nFlatFormFromEntity({
      editData: normalizedEditData,
      firstUILangId: "df",
      uiLangs,
      i18nFields: I18N_FIELDS,
      setValueAny,
      entityFieldMap: { name: "name" },
      after: rebuildJsonNow,
    });

    // menuItems init
    // backend genelde:
    // editData.menu_content (array or json string) + editData.translations[lang].menu_content
    const parseMenuContent = (x: any): MenuItem[] => {
      if (!x) return [];
      if (Array.isArray(x)) return x;
      if (typeof x === "string") {
        try {
          const parsed = JSON.parse(x);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const dfItems = parseMenuContent(editData?.menu_content);

    const nextMenuItems: Record<string, MenuItem[]> = {};
    uiLangs.forEach((lang) => {
      if (lang.id === "df") {
        nextMenuItems.df = dfItems;
        return;
      }

      // translations map olabilir
      const tMap = editData?.translations;
      const langNode = tMap?.[lang.id];
      const langItems = parseMenuContent(langNode?.menu_content);

      // eğer dilde yoksa df yapısını kopyala (label df'den gelir, sonra user değiştirir)
      nextMenuItems[lang.id] = langItems.length ? langItems : dfItems.map((item) => ({ ...item }));
    });

    setMenuItems(nextMenuItems);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, uiLangs?.length]);

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleToggle = (field: keyof ToggleState) => {
    setToggles((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Structure değişince: tüm dillerin structure'ı güncelle, label'ları koru
  const handleItemsChange = (newItems: MenuItem[]) => {
    setMenuItems((prev) => {
      const updated: Record<string, MenuItem[]> = {};
      for (const langId of Object.keys(prev)) {
        updated[langId] = cloneTreeWithPreservedLabels(newItems, prev[langId] || []);
      }
      return updated;
    });
  };

  const handleLabelChange = (id: string, newLabel: string, langId: string) => {
    setMenuItems((prev) => {
      const updated = { ...prev };
      const list = updated[langId] || [];

      const updateItem = (items: MenuItem[]): MenuItem[] =>
        items.map((item) => {
          if (item.id === id) return { ...item, label: newLabel };
          if (item.children?.length) return { ...item, children: updateItem(item.children) };
          return item;
        });

      updated[langId] = updateItem(list);
      return updated;
    });
  };

  // JSON -> RHF bridge (name alanı)
  const onJsonChange = (next: any) => {
    handleTranslationsJsonChange(next);

    uiLangs.forEach((lang) => {
      const langId = lang.id;
      const block = next?.[langId] ?? {};
      const name = safeStr(block?.name);

      setValueAny(`name_${langId}` as any, name, { shouldDirty: true, shouldValidate: langId === "df" });

      if (langId === "df") {
        setValueAny("name_df", name, { shouldDirty: true, shouldValidate: true });
      }
    });

    rebuildJsonNow();
  };

  // -----------------------------
  // Mutations
  // -----------------------------
  const { mutate: MenuStore, isPending: isSaving } = useMenuCustomizationStoreMutation();
  const { mutate: MenuUpdate, isPending: isUpdating } = useMenuCustomizationUpdateMutation();

  const onSubmit = async (values: MenuCustomizationFormData) => {
    const v: any = values as any;

    const defaultData: any = {
      name: safeStr(v.name_df),
      url: safeStr(v.url),
      page_id: safeStr(v.pages),
      is_visible: toggles.is_visible,
      menu_content: JSON.stringify(menuItems["df"] || []),
    };

    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== "df")
      .map((lang) => ({
        language_code: lang.id,
        name: safeStr(v?.[`name_${lang.id}`]),
        menu_content: JSON.stringify(menuItems[lang.id] || []),
      }));

    // translations_json (name)
    const builtJson = buildI18nJsonFromFlatValues({
      values: v,
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });

    const payload: any = {
      ...defaultData,
      id: editData ? editData.id : 0,
      translations,
      translations_json: ensureLangKeys(builtJson, uiLangs),
    };

    const done = () => {
      dispatch(setRefetch(true));
      // reset() istersen aç
      // reset();
    };

    if (editData?.id) {
      return MenuUpdate(payload as any, { onSuccess: done, onError: () => {} });
    }
    return MenuStore(payload as any, { onSuccess: done, onError: () => {} });
  };

  const isSubmitDisabled = !safeStr(watchedNameDf) || isSaving || isUpdating;

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="pb-24">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* df required hidden register */}
        <input type="hidden" {...register("name_df" as any)} />

        {/* View toggle */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="inline-flex rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("form")}
              className={[
                "px-4 py-2 text-sm font-medium transition",
                viewMode === "form"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              Form
            </button>
            <button
              type="button"
              onClick={() => setViewMode("json")}
              className={[
                "px-4 py-2 text-sm font-medium transition",
                viewMode === "json"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              JSON
            </button>
          </div>
        </div>

        {viewMode === "json" ? (
          <div className="mt-4">
            <AdminI18nJsonPanel
              label="Menu Customization JSON"
              languages={uiLangs}
              value={ensureLangKeys(translationsJson, uiLangs)}
              onChange={onJsonChange}
              perLanguage={true}
              showAllTab={true}
              helperText={
                <span>
                  Alanlar: <code>name</code>
                </span>
              }
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Top: i18n name + visibility */}
            <Card>
              <CardContent className="p-2 md:p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span>
                        {t("label.name")} ({t(`lang.df` as `lang.${LangKeys}`)})
                      </span>
                    </p>
                    <Input
                      id="name_df"
                      {...register("name_df" as any)}
                      className="app-input"
                      placeholder="Entry title"
                      onChange={(e) => {
                        const val = e.target.value;
                        setValueAny("name_df" as any, val, { shouldDirty: true, shouldValidate: true });
                        setValueAny("name_df" as any, val, { shouldDirty: true });
                        // df için aynı zamanda name_df -> name_df fieldi zaten
                        setValueAny("name_df", val, { shouldDirty: true, shouldValidate: true });

                        // df tabının flat alanı name_df değildir; schema dynamic field yok df için.
                        // Biz panel standardında name_df yanında name_df gibi davranıyoruz:
                        // i18n flat alan: name_df yerine name_df kullanıyoruz, ama init/scaffold name_df + name_df eşleşiyor.
                      }}
                    />
                    {(errors as any)?.name_df?.message ? (
                      <p className="text-red-500 text-sm mt-1">{String((errors as any).name_df?.message)}</p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-7 items-center justify-between w-full">
                    <h2 className="col-span-2 font-medium flex items-center gap-1">{t("label.visibility")}</h2>
                    <div className="col-span-3 flex flex-col items-start">
                      <Switch dir="ltr" checked={toggles.is_visible} onCheckedChange={() => handleToggle("is_visible")} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selectors */}
            <DefaultPagesSelector
              pages={additionalPages}
              isPagePending={false}
              onAddSelected={handleAddDefaultPagesToMenu}
            />

            <PagesSelector pages={AllPages} isPagePending={isPagePending} onAddSelected={handleAddPagesToMenu} />

            <LinkAdder onAddLink={handleAddCustomLink} />

            {/* Per-language menu structure + label edit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {uiLangs.map((lang) => (
                <Card key={lang.id}>
                  <h3 className="font-medium p-4 shadow-custom">
                    Menu Structure — {lang.label} ({lang.id})
                  </h3>
                  <CardContent className="p-4" dir={dir}>
                    {/* Dil label input */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>
                          {t("label.name")} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                        </span>
                      </p>
                      <Input
                        id={`name_${lang.id}`}
                        {...register(`name_${lang.id}` as any)}
                        className="app-input"
                        placeholder="Entry title"
                        onChange={(e) => {
                          const val = e.target.value;
                          setValueAny(`name_${lang.id}` as any, val, { shouldDirty: true, shouldValidate: lang.id === "df" });
                          if (lang.id === "df") setValueAny("name_df", val, { shouldDirty: true, shouldValidate: true });
                        }}
                      />
                      {(errors as any)?.[`name_${lang.id}`]?.message ? (
                        <p className="text-red-500 text-sm mt-1">{String((errors as any)[`name_${lang.id}`]?.message)}</p>
                      ) : null}
                    </div>

                    {menuItems?.[lang.id]?.length > 0 ? (
                      <NestedDndMenu
                        itemsList={menuItems[lang.id] || []}
                        onItemsChange={handleItemsChange}
                        onLabelChange={(id, newLabel) => handleLabelChange(id, newLabel, lang.id)}
                        language={lang.id}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500 py-10">
                        <NoDataFoundIcon />
                        <p className="mt-2 text-sm text-gray-500 dark:text-white font-bold">{t("common.not_data_found")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER SAVE — her modda var */}
        <div className="fixed left-0 right-0 bottom-0 z-50 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-end">
            <SubmitButton
              UpdateData={data}
              IsLoading={editData?.id ? isUpdating : isSaving}
              AddLabel={t("button.add_menu")}
              UpdateLabel={t("button.update_menu")}
              // @ts-ignore SubmitButton destekliyorsa
              disabled={isSubmitDisabled}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
