"use client";
import { SubmitButton } from "@/components/blocks/shared";
import { Card, CardContent, Checkbox, Input } from "@/components/ui";
import {
  useMethodStoreMutation,
  useMethodUpdateMutation,
} from "@/modules/admin-section/financial/withdraw/method/method.action";
import {
  MethodFormData,
  methodSchema,
} from "@/modules/admin-section/financial/withdraw/method/method.schema";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const CreateOrUpdateMethodForm = ({ data, ID }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const editData = data?.data;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MethodFormData>({
    resolver: zodResolver(methodSchema),
  });

  const [attributeValues, setAttributeValues] = useState<
    { field_name: string }[]
  >(
    editData?.fields?.length > 0
      ? editData?.fields.map((item: any) =>
          typeof item === "object"
            ? {
                field_name: item || "",
              }
            : { field_name: item || "" }
        )
      : [{ field_name: "" }]
  );

  const handleAddAttributeValue = () => {
    setAttributeValues([...attributeValues, { field_name: "" }]);
  };

  const handleDeleteAttributeValue = (index: number) => {
    setAttributeValues(attributeValues.filter((_, i) => i !== index));
  };

  const handleChangeAttributeValue = (
    index: number,
    field: "field_name",
    value: string
  ) => {
    const updatedValues = [...attributeValues];
    updatedValues[index][field] = value;
    setAttributeValues(updatedValues);
  };

  const { mutate: methodStore, isPending: isMethodPending } =
    useMethodStoreMutation();
  const { mutate: methodUpdate, isPending: isMethodUpdating } =
    useMethodUpdateMutation();

  const onSubmit = async (values: MethodFormData) => {
    const defaultData: any = {
      name: values.name,
      fields: attributeValues.map((item) => item.field_name),
    };

    const submissionData = {
      ...defaultData,
      id: !data ? 0 : editData.id,
    };

    if (data) {
      return methodUpdate(
        { ...(submissionData as any) },
        {
          onSuccess: () => {
            reset();
            dispatch(setRefetch(true));
          },
        }
      );
    } else {
      return methodStore(
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
    <>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6 ">
               <div className="mb-4">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <span>{t("label.method_name")}</span>
                  </p>
                  <Input
                    id="name"
                    type="text"
                    defaultValue={editData?.name ? editData?.name : ""}
                    {...register(`name` as keyof MethodFormData)}
                    className="app-input"
                    placeholder={t("place_holder.enter_name")}
                  />
                  {errors[`name` as keyof MethodFormData] && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        //@ts-ignore
                        errors[`name`]?.message
                      }
                    </p>
                  )}
                </div>
              <div dir={dir} className="space-y-4">
                <div className="text-sm font-semibold mb-2 flex items-center justify-between ">
                  <span>{t("label.input_methods_fill")}</span>
                  <span
                    onClick={handleAddAttributeValue}
                    className="flex items-center cursor-pointer bg-blue-50 border border-blue-500 text-blue-500 text-sm font-bold shadow-2xl px-2 py-2 rounded hover:bg-blue-500 hover:text-white"
                  >
                    {t("button.add_more")}
                  </span>
                </div>
                <div className="max-h-[285px] overflow-x-auto custom-scrollbar ">
                  {attributeValues.map((value, index) => (
                    <div
                      key={index}
                      className="my-4 flex items-end w-full gap-4"
                    >
                      <div className="w-full gap-2">
                        <div>
                          <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                            {t("label.field_name")}
                          </p>
                          <Input
                            type="text"
                            value={value.field_name}
                            onChange={(e) =>
                              handleChangeAttributeValue(
                                index,
                                "field_name",
                                e.target.value
                              )
                            }
                            className="app-input flex-grow py-2"
                            placeholder={t("place_holder.enter_name")}
                          />
                        </div>
                      </div>
                      {index === 0 ? (
                        <span className="flex items-center cursor-not-allowed bg-slate-500 text-slate-300 text-sm font-bold shadow-2xl px-2 py-2.5 rounded">
                          {t("button.default")}
                        </span>
                      ) : (
                        <span
                          onClick={() => handleDeleteAttributeValue(index)}
                          className="cursor-pointer bg-red-500 text-white shadow-2xl px-3 py-2 rounded"
                        >
                          {t("button.close")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton
              UpdateData={data}
              IsLoading={isMethodPending || isMethodUpdating}
              AddLabel={t("button.add_method")}
              UpdateLabel={t("button.update_method")}
            />
          </Card>
        </form>
      </div>
    </>
  );
};

export default CreateOrUpdateMethodForm;
