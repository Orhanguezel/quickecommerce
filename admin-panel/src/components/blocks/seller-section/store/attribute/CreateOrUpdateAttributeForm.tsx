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
  AttributeFormData,
  attributeSchema,
} from "@/modules/admin-section/attribute/attributes.schema";
import {
  useAttributeStoreMutation,
  useAttributeUpdateMutation,
} from "@/modules/seller-section/attribute/attributes.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Delete } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

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

const CreateOrUpdateAttributeForm = ({ data }: any) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const multiLangData = useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_type = selectedStore?.type;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      product_type: store_type ?? "",
    },
  });
  const [attributeValues, setAttributeValues] = useState<string[]>(
    data?.attribute_values?.length > 0
      ? data.attribute_values.map((item: any) =>
          typeof item === "object" ? item.label : item
        )
      : []
  );

  useEffect(() => {
    if (data) {
      setValue("attribute_name_df", data.label ?? "");
      Object.keys(data?.translations).forEach((language) => {
        const translation = data.translations[language];
        setValue(
          `attribute_name_${language}` as keyof AttributeFormData,
          translation?.label ?? ""
        );
      });
      if (data?.attribute_values?.length > 0) {
        setAttributeValues(
          data.attribute_values.map((item: any) =>
            typeof item === "object" ? item.label : item
          )
        );
      }
    }
  }, [data, setValue]);

  const handleAddAttributeValue = () => {
    setAttributeValues([...attributeValues, ""]);
  };

  const handleDeleteAttributeValue = (index: number) => {
    setAttributeValues(attributeValues.filter((_, i) => i !== index));
  };

  const handleChangeAttributeValue = (index: number, value: string) => {
    const updatedValues = [...attributeValues];
    updatedValues[index] = value;
    setAttributeValues(updatedValues);
    setValue("attribute_values", updatedValues);
  };

  const { mutate: attributeStore, isPending } = useAttributeStoreMutation();
  const { mutate: attributeUpdate, isPending: isUpdating } =
    useAttributeUpdateMutation();
  const onSubmit = async (values: AttributeFormData) => {
    if (!attributeValues.length) {
      return toast.error(t("toast.one_attribute_value_is_required"));
    }
    if (store_type === "") {
      return toast.error(t("toast.one_type_is_required"));
    }
    const defaultData = {
      name: values.attribute_name_df,
      product_type: store_type,
      value: attributeValues,
    };
    const translations = multiLangData
      .filter((lang) => (values as any)[`attribute_name_${lang.id}`])
      .map((lang) => ({
        language_code: lang.id,
        name: (values as any)[`attribute_name_${lang.id}`],
      }));

    const submissionData = {
      ...defaultData,
      id: data ? data.id : "",
      translations: translations,
    };
    if (data) {
      return attributeUpdate(
        { ...(submissionData as any) },
        {
          onSuccess: () => {
            reset();
            dispatch(setRefetch(true));
          },
        }
      );
    } else {
      return attributeStore(
        { ...(submissionData as any) },
        {
          onSuccess: () => {
            reset();
            dispatch(setRefetch(true));
          },
        }
      );
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="rounded-lg border-none mt-4">
          <CardContent className="p-2 md:p-6">
            <Tabs dir={dir} defaultValue="df">
              <div className="flex items-center justify-between">
                <TabsList className="flex justify-start bg-white dark:bg-[#1f2937]">
                  {multiLangData.map((lang) => (
                    <TabsTrigger key={lang.id} value={lang.id}>
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="bg-teal-500 text-white text-base font-semibold  capitalize px-3 py-1 rounded">
                  {store_type}
                </div>
              </div>
              {multiLangData.map((lang) => {
                return (
                  <TabsContent
                    className="space-y-4"
                    key={lang.id}
                    value={lang.id}
                  >
                    <div>
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <span>
                          {" "}
                          {t("label.name")} (
                          {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                        </span>
                      </p>
                      <Input
                        id={`attribute_name_${lang.id}`}
                        {...register(
                          `attribute_name_${lang.id}` as keyof AttributeFormData
                        )}
                        className="app-input"
                        placeholder={t("place_holder.enter_name")}
                      />
                      {errors[
                        `attribute_name_${lang.id}` as keyof AttributeFormData
                      ] && (
                        <p className="text-red-500 text-sm mt-1">
                          {
                            (errors as any)[`attribute_name_${lang.id}`]
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1 flex items-center gap-4">
                        <span>{t("label.values")}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Input
                          value={attributeValues[0] || ""}
                          onChange={(e) =>
                            handleChangeAttributeValue(0, e.target.value)
                          }
                          className="app-input flex-grow py-2"
                          placeholder={t("place_holder.enter_value")}
                        />
                        <span
                          onClick={handleAddAttributeValue}
                          className="w-[100px] flex items-center cursor-pointer 
  bg-blue-50 border border-blue-500 text-blue-500 
  dark:border-[#93c5fd] dark:text-[#93c5fd] dark:bg-[#1e3a8a] 
  hover:bg-blue-500 hover:text-white 
  dark:hover:bg-[#2563eb] dark:hover:text-white 
  text-sm font-bold shadow-2xl px-2 py-2 rounded"
                        >
                          {t("button.add_more")}
                        </span>
                      </div>
                      {attributeValues.slice(1).map((value, index) => (
                        <div
                          key={index + 1}
                          className="my-4 flex items-center mb-2 gap-4"
                        >
                          <Input
                            value={value}
                            onChange={(e) =>
                              handleChangeAttributeValue(
                                index + 1,
                                e.target.value
                              )
                            }
                            className="app-input flex-grow py-2"
                            placeholder={t("place_holder.enter_value")}
                          />
                          <span
                            onClick={() =>
                              handleDeleteAttributeValue(index + 1)
                            }
                            className="cursor-pointer bg-red-50 border border-red-500 text-red-500 shadow-2xl px-2 py-2 rounded hover:bg-red-500 hover:text-white"
                          >
                            <Delete width={20} height={20} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={data}
            IsLoading={isPending || isUpdating}
            AddLabel={t("button.add_attribute")}
            UpdateLabel={t("button.update_attribute")}
          />
        </Card>
      </form>
    </div>
  );
};
export default CreateOrUpdateAttributeForm;
