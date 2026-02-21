"use client";
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
} from "@/components/ui";
import {
  CategoryFormData,
  categorySchema,
} from "@/modules/seller-section/category/category.schema";
import {
  useCategoryStoreMutation,
  useCategoryUpdateMutation,
} from "@/modules/seller-section/category/category.action";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { LangKeys } from "@/lib/json";

const CreateOrUpdateCategoryForm = ({ data }: { data?: any }) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const multiLangData = useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const firstLang = multiLangData[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (data) {
      // Set main category name (default lang)
      setValue(
        `category_name_${firstLang.id}` as keyof CategoryFormData,
        data.category_name ?? ""
      );

      // Set status
      if (data.status !== undefined) {
        setValue("status", String(data.status));
      }

      // Populate translations
      const translations = data.related_translations ?? data.translations ?? [];
      if (Array.isArray(translations)) {
        translations.forEach((tr: any) => {
          const code = tr.language_code ?? tr.lang;
          if (code && tr.category_name) {
            setValue(
              `category_name_${code}` as keyof CategoryFormData,
              tr.category_name
            );
          }
        });
      } else if (typeof translations === "object") {
        Object.keys(translations).forEach((code) => {
          const tr = translations[code];
          if (tr?.category_name) {
            setValue(
              `category_name_${code}` as keyof CategoryFormData,
              tr.category_name
            );
          }
        });
      }
    }
  }, [data, setValue, firstLang.id]);

  const { mutate: categoryStore, isPending } = useCategoryStoreMutation();
  const { mutate: categoryUpdate, isPending: isUpdating } =
    useCategoryUpdateMutation();

  const onSubmit = (values: CategoryFormData) => {
    const defaultName =
      (values as any)[`category_name_${firstLang.id}`] ?? "";

    const translations = multiLangData
      .filter((lang) => {
        const val = (values as any)[`category_name_${lang.id}`];
        return val && val.trim() !== "";
      })
      .map((lang) => ({
        language_code: lang.id,
        category_name: (values as any)[`category_name_${lang.id}`],
      }));

    const rawStatus: string = (values as any)?.status || "1";
    const submissionData: any = {
      category_name: defaultName,
      status: parseInt(rawStatus) || 1,
      translations,
    };

    if (data) {
      submissionData.id = String(data.id);
      return categoryUpdate(submissionData, {
        onSuccess: () => {
          dispatch(setRefetch(true));
        },
      });
    } else {
      return categoryStore(submissionData, {
        onSuccess: () => {
          reset();
          dispatch(setRefetch(true));
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="rounded-lg border-none mt-4">
        <CardContent className="p-2 md:p-6">
          <Tabs dir={dir} defaultValue={firstLang.id}>
            <TabsList className="flex justify-start bg-white dark:bg-[#1f2937] mb-4">
              {multiLangData.map((lang) => (
                <TabsTrigger key={lang.id} value={lang.id}>
                  {lang.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {multiLangData.map((lang) => (
              <TabsContent
                className="space-y-4"
                key={lang.id}
                value={lang.id}
              >
                <div>
                  <p className="text-sm font-medium mb-1">
                    {t("label.category_name")} (
                    {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                    {lang.id === firstLang.id && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </p>
                  <Input
                    id={`category_name_${lang.id}`}
                    {...register(
                      `category_name_${lang.id}` as keyof CategoryFormData
                    )}
                    className="app-input"
                    placeholder={t("place_holder.search_by_category")}
                  />
                  {errors[
                    `category_name_${lang.id}` as keyof CategoryFormData
                  ] && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        (errors as any)[`category_name_${lang.id}`]
                          ?.message
                      }
                    </p>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mt-4 sticky bottom-0 w-full p-4">
        <SubmitButton
          UpdateData={data}
          IsLoading={isPending || isUpdating}
          AddLabel={t("button.add_category")}
          UpdateLabel={t("button.update_category")}
        />
      </Card>
    </form>
  );
};

export default CreateOrUpdateCategoryForm;
