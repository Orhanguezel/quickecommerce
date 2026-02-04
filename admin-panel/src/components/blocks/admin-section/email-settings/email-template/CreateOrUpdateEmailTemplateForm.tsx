// ===============================================
// File: src/components/blocks/admin-section/email-settings/email-template/CreateOrUpdateEmailTemplateForm.tsx
// FINAL — JSON panel standard + first language default + TS build safe
// - Uses lib/json/rhf helpers: makeRHFSetValueAny + safeObject
// - DB -> form fills firstLangId (no *_df)
// - JSON mode rebuilds from current form snapshot (SEOSettingsForm logic)
// - Adapter receives (name: string, ...) compatible setValueAny wrapper
// - Keeps legacy translations[] + translations_json payload together
// ===============================================

"use client";

import React, { useEffect, useMemo, useState } from "react";
import multiLang from "@/components/molecules/multiLang.json";
import { SubmitButton } from "@/components/blocks/shared";
import {
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";

import { useEmailTemplateUpdateMutation } from "@/modules/admin-section/email-settings/email-template/email-template.action";
import {
  EmailTemplateFormData,
  emailTemplateSchema,
} from "@/modules/admin-section/email-settings/email-template/email-template.schema";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";

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


// ✅ Bu formda JSON’a dahil edeceğimiz alanlar
const I18N_FIELDS = ["name", "subject", "body"] as const;

const CreateOrUpdateEmailTemplateForm = ({
  data,
  ID,
  // Wrapper’dan gelirse kullanırız; gelmezse içeride yönetiriz
  viewMode: viewModeProp,
  onViewModeChange: onViewModeChangeProp,
  languages: languagesProp,
  firstLangId: firstLangIdProp,
}: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();

  const multiLangData = useMemo(
    () => (languagesProp ?? multiLang) as Array<{ id: string; label?: string }>,
    [languagesProp]
  );

  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const firstLangId = firstLangIdProp ?? (multiLangData?.[0]?.id ?? "tr");

  // ✅ Form/JSON görünümü (wrapper yoksa burada yönet)
  const [viewModeLocal, setViewModeLocal] = useState<ViewMode>("form");
  const viewMode: ViewMode = viewModeProp ?? viewModeLocal;
  const setViewMode = onViewModeChangeProp ?? setViewModeLocal;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    getValues,
    watch,
  } = useForm<EmailTemplateFormData>({
    resolver: zodResolver(emailTemplateSchema),
  });

  // ✅ TS build safe setValue wrapper
  const setValueAny = useMemo(
    () => makeRHFSetValueAny<EmailTemplateFormData>(setValue),
    [setValue]
  );

  // ✅ i18n JSON state
  const [translationsJson, setTranslationsJson] = useState<any>({});

  // ✅ JSON -> form
  const handleTranslationsJsonChange = (next: any) => {
    const safe = safeObject(next);
    setTranslationsJson(safe);

    applyI18nJsonToFlatForm({
      json: safe,
      languages: multiLangData,
      fields: [...I18N_FIELDS],
      setValue: setValueAny,
      keyOf: (field, langId) => `${field}_${langId}`,
    });
  };

  // ✅ data -> form + JSON init
  useEffect(() => {
    if (!data) return;

    // type sabit (disabled input)
    setValueAny("type", data?.type ?? "");

    // root/default -> firstLangId
    setValueAny(`name_${firstLangId}`, data?.name ?? "");
    setValueAny(`subject_${firstLangId}`, data?.subject ?? "");
    setValueAny(`body_${firstLangId}`, data?.body ?? "");

    // translations map
    const trMap = safeObject(data?.translations);
    Object.keys(trMap).forEach((language) => {
      const trn = trMap?.[language];
      if (!trn) return;

      setValueAny(`name_${language}`, trn?.name ?? "");
      setValueAny(`subject_${language}`, trn?.subject ?? "");
      setValueAny(`body_${language}`, trn?.body ?? "");
    });

    // JSON init
    const dbJson = data?.translations_json;
    if (dbJson && typeof dbJson === "object") {
      handleTranslationsJsonChange(dbJson);
    } else {
      const current = getValues() as any;
      const built = buildI18nJsonFromFlatValues({
        values: current,
        languages: multiLangData,
        fields: [...I18N_FIELDS],
        keyOf: (field, langId) => `${field}_${langId}`,
        skipEmpty: true,
      });
      setTranslationsJson(built);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, firstLangId]);

  // ✅ Mode sync: JSON moduna geçince formdan rebuild et
  useEffect(() => {
    if (viewMode !== "json") return;

    const current = watch() as any;
    const built = buildI18nJsonFromFlatValues({
      values: current,
      languages: multiLangData,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: true,
    });
    setTranslationsJson(built);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const { mutate: TemplateUpdate, isPending: isUpdating } =
    useEmailTemplateUpdateMutation();

  const onSubmit = async (values: EmailTemplateFormData) => {
    const v: any = values as any;

    // Default/root artık ilk dilden okunur
    const defaultData = {
      name: v[`name_${firstLangId}`] ?? "",
      subject: v[`subject_${firstLangId}`] ?? "",
      body: v[`body_${firstLangId}`] ?? "",
      type: v.type ?? data?.type ?? "",
    };

    // legacy translations[] (bozmuyoruz)
    const translations = (multiLangData ?? [])
      .filter((lang) => !!v[`name_${lang.id}`])
      .map((lang) => ({
        language_code: lang.id,
        name: v[`name_${lang.id}`] ?? "",
        subject: v[`subject_${lang.id}`] ?? "",
        body: v[`body_${lang.id}`] ?? "",
      }));

    // JSON payload (panel varsa onu gönder; yoksa formdan üret)
    const translations_json =
      translationsJson && typeof translationsJson === "object"
        ? translationsJson
        : buildI18nJsonFromFlatValues({
            values: v,
            languages: multiLangData,
            fields: [...I18N_FIELDS],
            keyOf: (field, langId) => `${field}_${langId}`,
            skipEmpty: true,
          });

    const submissionData: any = {
      ...defaultData,
      id: ID ?? data?.id,
      translations,
      translations_json,
    };

    return TemplateUpdate(submissionData, {
      onSuccess: () => {
        reset();
        dispatch(setRefetch(true));
      },
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ Header Toggle */}
        <Card className="mb-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between">
            <div className="text-sm font-semibold">
              {t("common.edit_template")}
            </div>

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
          </CardContent>
        </Card>

        {viewMode === "json" ? (
          <Card>
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Translations JSON"
                languages={multiLangData}
                value={translationsJson}
                onChange={handleTranslationsJsonChange}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    Her tab sadece o dilin JSON’unu düzenler. Alanlar:{" "}
                    <code>name</code>, <code>subject</code>, <code>body</code>.
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-2 md:p-6">
              <Tabs defaultValue={firstLangId} className="col-span-2">
                <TabsList
                  dir={dir}
                  className="flex justify-start bg-white dark:bg-[#1f2937]"
                >
                  {multiLangData.map((lang) => (
                    <TabsTrigger key={lang.id} value={lang.id}>
                      {lang.label ?? lang.id}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div dir={dir}>
                  {multiLangData.map((lang) => (
                    <TabsContent
                      key={lang.id}
                      value={lang.id}
                      className="lg:col-span-2"
                    >
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t("label.name")} (
                            {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please provide name{" "}
                                  <span>{`in ${lang.label ?? lang.id}`}</span>
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <Input
                          id={`name_${lang.id}`}
                          {...register(`name_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />

                        {(errors as any)?.[`name_${lang.id}`]?.message ? (
                          <p className="text-red-500 text-sm mt-1">
                            {(errors as any)[`name_${lang.id}`]?.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t("label.subject")} (
                            {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">
                                  Please provide subject{" "}
                                  <span>{`in ${lang.label ?? lang.id}`}</span>
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <Input
                          id={`subject_${lang.id}`}
                          {...register(`subject_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          {t("label.type")}
                        </p>

                        <Input
                          disabled
                          id="type"
                          {...register("type" as any)}
                          className="app-input"
                        />
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">
                          {t("label.body")} (
                          {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                        </p>

                        <Textarea
                          id={`body_${lang.id}`}
                          {...register(`body_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={data}
            IsLoading={isUpdating}
            UpdateLabel={t("button.update_template")}
          />
        </Card>
      </form>
    </div>
  );
};

export default CreateOrUpdateEmailTemplateForm;
