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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui";
import {
  useRefundReasonStoreMutation,
  useRefundReasonUpdateMutation,
} from "@/modules/admin-section/orders/refund-reason/refund-reason.action";
import {
  RefundReasonFormData,
  refundReasonSchema,
} from "@/modules/admin-section/orders/refund-reason/refund-reason.schema";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

const CreateOrUpdateRefundReasonForm = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const multiLangData = React.useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RefundReasonFormData>({
    resolver: zodResolver(refundReasonSchema),
  });

  useEffect(() => {
    if (data) {
      setValue("reason_df", data.reason);
      Object.keys(data.translations).forEach((language) => {
        const translation = data.translations[language];
        setValue(
          `reason_${language}` as keyof RefundReasonFormData,
          translation?.reason
        );
      });
    }
  }, [data, setValue]);

  const { mutate: couponStore, isPending } = useRefundReasonStoreMutation();
  const { mutate: couponUpdate, isPending: isUpdating } =
    useRefundReasonUpdateMutation();
  const onSubmit = async (values: RefundReasonFormData) => {
    const defaultData = {
      reason: values.reason_df,
    };
    const translations = multiLangData
      .filter((lang) => (values as any)[`reason_${lang.id}`])
      .map((lang) => ({
        language_code: lang.id,
        reason: (values as any)[`reason_${lang.id}`],
      }));
    const submissionData = {
      ...defaultData,
      id: data?.id,
      translations: translations,
    };
    return data
      ? couponUpdate(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              dispatch(setRefetch(true));
            },
          }
        )
      : couponStore(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              dispatch(setRefetch(true));
            },
          }
        );
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-2 md:p-6 w-full">
            <Tabs defaultValue="df" className="col-span-2">
              <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                {multiLangData.map((lang) => (
                  <TabsTrigger key={lang.id} value={lang.id}>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div dir={dir} className="">
                {multiLangData.map((lang) => {
                  return (
                    <TabsContent
                      key={lang.id}
                      value={lang.id}
                      className="lg:col-span-2"
                    >
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t("label.refund_reason")} ({lang.label})
                          </span>
                          <div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-custom-dark-blue">
                                  <p className="p-1 text-sm font-medium">
                                    {t("tooltip.refund_reason")}{" "}
                                    <span>
                                      {" "}
                                      {lang.label !== "Default" &&
                                        `in ${lang.label}`}
                                    </span>
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <Input
                          id={`reason_${lang.id}`}
                          {...register(
                            `reason_${lang.id}` as keyof RefundReasonFormData
                          )}
                          className="app-input"
                          placeholder="Enter value"
                        />
                        {errors[
                          `reason_${lang.id}` as keyof RefundReasonFormData
                        ] && (
                          <p className="text-red-500 text-sm mt-1">
                            {
                              //@ts-ignore
                              errors[`reason_${lang.id}`]?.message
                            }
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  );
                })}
              </div>
            </Tabs>
          </CardContent>
        </Card>
        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={data}
            IsLoading={isPending || isUpdating}
            AddLabel={t("button.add_refund_reason")}
            UpdateLabel={t("button.update_refund_reason")}
          />
        </Card>
      </form>
    </div>
  );
};
export default CreateOrUpdateRefundReasonForm;
