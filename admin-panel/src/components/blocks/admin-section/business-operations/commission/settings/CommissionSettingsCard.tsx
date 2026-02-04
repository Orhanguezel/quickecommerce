"use client";
import { SubmitButton } from "@/components/blocks/shared";
import AlertModal from "@/components/blocks/shared/AlertModal";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";
import { Card, CardContent, Checkbox, Input, Switch } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useCommissionSettingsQuery,
  useCommissionSettingsStoreMutation,
} from "@/modules/admin-section/business-operations/commission/settings/commission-settings.action";
import {
  CommissionSettingsFormData,
  commissionSettingsSchema,
} from "@/modules/admin-section/business-operations/commission/settings/commission-settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, DollarSign, Percent } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type ToggleState = {
  subscription_enabled: boolean;
  commission_enabled: boolean;
  order_additional_charge_enable_disable: boolean;
  customerVerificationEnabled: boolean;
};

const CommissionSettingsCard = () => {
  const t = useTranslations();
  const [openDialog, setOpenDialog] = useState(false);
  const [taxAmount, setTaxAmount] = useState(false);
  const [commissionType, setCommissionType] = useState<string>("");
  const [toggles, setToggles] = useState<ToggleState>({
    subscription_enabled: false,
    commission_enabled: false,
    order_additional_charge_enable_disable: false,
    customerVerificationEnabled: false,
  });
  const {
    commissionSettingsData,
    refetch,
    isPending: isQuerying,
  } = useCommissionSettingsQuery({});
  const QueryCommissionSettingsData = useMemo(
    () => (commissionSettingsData as any) || [],
    [commissionSettingsData]
  );

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CommissionSettingsFormData>({
    resolver: zodResolver(commissionSettingsSchema),
    defaultValues: useMemo(() => {
      if (QueryCommissionSettingsData?.data) {
        const message = QueryCommissionSettingsData.data;
        return {
          order_additional_charge_amount: Number(
            message.order_additional_charge_amount
          ),
          order_additional_charge_commission: Number(
            message.order_additional_charge_commission
          ),
          default_delivery_commission_charge: Number(
            message.default_delivery_commission_charge
          ),
          order_shipping_charge: Number(message.order_shipping_charge),
          default_order_commission_rate: Number(
            message.default_order_commission_rate
          ),
          commission_amount: Number(message.commission_amount),
          order_additional_charge_name: message.order_additional_charge_name,
        };
      }
      return {};
    }, [QueryCommissionSettingsData]),
  });
  const message = QueryCommissionSettingsData?.data;
  useEffect(() => {
    if (message) {
      setToggles({
        subscription_enabled: message.subscription_enabled,
        commission_enabled: message.commission_enabled,
        order_additional_charge_enable_disable:
          message.order_additional_charge_enable_disable,
        customerVerificationEnabled: message.customerVerificationEnabled,
      });
      setTaxAmount(message.order_include_tax_amount);
      setCommissionType(message?.commission_type || "");
    }
  }, [message, setValue]);

  const handleToggle = (field: keyof ToggleState) => {
    setToggles((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const { mutate: CommissionSettingsStore, isPending } =
    useCommissionSettingsStoreMutation();
  const onSubmit = async (values: CommissionSettingsFormData) => {
    const submissionData = {
      ...values,
      commission_type: commissionType,
      order_include_tax_amount: taxAmount,
      subscription_enabled: toggles?.subscription_enabled,
      commission_enabled: toggles?.commission_enabled,
      order_additional_charge_enable_disable:
        toggles?.order_additional_charge_enable_disable,
      customerVerificationEnabled: toggles?.customerVerificationEnabled,
    };
    if (
      !submissionData.subscription_enabled &&
      !submissionData.commission_enabled
    ) {
      setOpenDialog(true);
      return;
    }
    return CommissionSettingsStore(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  return (
    <div>
      {isQuerying ? (
        <CardSkletonLoader />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid xl:grid-cols-2 lg:grid-cols-1  gap-4 mt-4">
            <Card className="">
              <CardContent className="p-2 md:p-6">
                <h2 className="text-lg md:text-2xl font-medium flex items-center gap-1">
                  <BriefcaseBusiness />
                  {t("label.business_plan")}
                </h2>
                <div className="space-y-4 mt-2  ">
                  <Card className="bg-gray-50 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center justify-between w-full">
                        <h2 className="text-lg font-medium flex items-center gap-1">
                          {t("label.subscription")}
                        </h2>
                        <div className="flex flex-col items-start">
                          <Switch
                            dir="ltr"
                            checked={toggles.subscription_enabled}
                            onCheckedChange={() =>
                              handleToggle("subscription_enabled")
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-white">
                        {t("label.note")}:
                      </p>
                      <strong className="text-xs text-red-400">
                        {" "}
                        {t(
                          "title.disable_subscription_based_business_model"
                        )}{" "}
                      </strong>
                      <p>
                        {t(
                          "sub_title.disable_subscription_based_business_model"
                        )}
                      </p>
                    </div>
                  </Card>
                  <Card className="bg-gray-50 p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center justify-between w-full">
                        <h2 className="text-lg font-medium flex items-center gap-1">
                          {t("label.commission")}
                        </h2>
                        <div className="flex flex-col items-start">
                          <Switch
                            dir="ltr"
                            checked={toggles.commission_enabled}
                            onCheckedChange={() =>
                              handleToggle("commission_enabled")
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-white">
                        {t("label.note")}:
                      </p>
                      <strong className="text-xs  text-red-400">
                        {t("title.disable_commission_based_business_model")}
                      </strong>
                      <p>
                        {t("sub_title.disable_commission_based_business_model")}
                      </p>
                    </div>
                    <div>
                      <h2 className="text-md font-medium flex items-center gap-2">
                        {t("label.commission_type")}
                      </h2>

                      <div className="flex items-center gap-4 mt-2">
                        <RadioGroup
                          className="flex items-center gap-4"
                          value={commissionType}
                          onValueChange={(value) => setCommissionType(value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              className="text-blue-500 border-blue-500 "
                              value="percentage"
                              id="p1"
                            />
                            <Label htmlFor="p1">{t("label.percent")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              className="text-blue-500 border-blue-500"
                              value="fixed"
                              id="f2"
                            />
                            <Label htmlFor="f2">{t("label.fixed")}</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="grid 2xl:grid-cols-2 xl:grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium mb-1">
                            {t("label.commission_rate")}
                          </p>
                          <Input
                            type="number"
                            min={0}
                            id="commission_amount"
                            defaultValue={
                              message?.commission_amount
                                ? Number(message.commission_amount)
                                : 0
                            }
                            {...register("commission_amount", {
                              valueAsNumber: true,
                            })}
                            onFocus={(e) => {
                              if (e.target.value === "0") {
                                e.target.value = "";
                              }
                            }}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numericValue = Number(value);
                              if (
                                commissionType == "percentage" &&
                                numericValue > 100
                              ) {
                                e.target.value = "100";
                              }
                              register("commission_amount").onChange(e);
                            }}
                            placeholder="Enter commission amount"
                            className="app-input"
                          />
                          {errors.commission_amount && (
                            <p className="text-red-500 text-sm">
                              {errors.commission_amount.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">
                            {t("label.default_order_commission_rate")}
                          </p>
                          <Input
                            type="number"
                            min={0}
                            id="default_order_commission_rate"
                            defaultValue={
                              message?.default_order_commission_rate
                                ? Number(message.default_order_commission_rate)
                                : 0
                            }
                            {...register("default_order_commission_rate", {
                              valueAsNumber: true,
                            })}
                            onFocus={(e) => {
                              if (e.target.value == "0") {
                                e.target.value = "";
                              }
                            }}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numericValue = Number(value);
                              if (
                                commissionType == "percentage" &&
                                numericValue > 100
                              ) {
                                e.target.value = "100";
                              }
                              register(
                                "default_order_commission_rate"
                              ).onChange(e);
                            }}
                            placeholder="Enter default order commission rate"
                            className="app-input"
                          />
                          {errors.default_order_commission_rate && (
                            <p className="text-red-500 text-sm">
                              {errors.default_order_commission_rate.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">
                            {t("label.commission_rate_on_delivery_charge")}
                          </p>
                          <Input
                            type="number"
                            min={0}
                            id="default_delivery_commission_charge"
                            defaultValue={
                              message?.default_delivery_commission_charge
                                ? Number(
                                    message.default_delivery_commission_charge
                                  )
                                : 0
                            }
                            {...register("default_delivery_commission_charge", {
                              valueAsNumber: true,
                            })}
                            placeholder="Enter default delivery commission charge"
                            className="app-input"
                          />
                          {errors.default_delivery_commission_charge && (
                            <p className="text-red-500 text-sm">
                              {
                                errors.default_delivery_commission_charge
                                  .message
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-2 md:p-6">
                  <h2 className="text-lg md:text-2xl font-medium flex items-center gap-1">
                    <Percent /> {t("common.shipping_charge")}
                  </h2>
                  <div className=" p-4 mt-2">
                    <p className="text-sm font-medium mb-2">
                      {t("common.minimum_shipping_charge")}
                    </p>
                    <Input
                      type="number"
                      min={0}
                      id="order_shipping_charge"
                      defaultValue={
                        message?.order_shipping_charge
                          ? Number(message.order_shipping_charge)
                          : 0
                      }
                      {...register("order_shipping_charge", {
                        valueAsNumber: true,
                      })}
                      placeholder="Enter order shipping charge"
                      className="app-input"
                    />
                    {errors.order_shipping_charge && (
                      <p className="text-red-500 text-sm">
                        {errors.order_shipping_charge.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2 md:p-6">
                  <h2 className="text-lg md:text-2xl font-medium flex items-center">
                    <DollarSign /> {t("common.tax_settings")}
                  </h2>
                  <div className=" p-4 mt-2">
                    <div className="flex items-center gap-3  mb-4">
                      <div className="flex items-center">
                        <Checkbox
                          id="taxAmount"
                          checked={taxAmount}
                          onCheckedChange={(checked: boolean) =>
                            setTaxAmount(checked)
                          }
                        />
                        <label
                          htmlFor="taxAmount"
                          className="text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mx-2"
                        >
                          {t("common.include_tax_amount")}
                        </label>
                      </div>
                    </div>
                    <div className="">
                      <p className="">
                        {t("common.tax_note_in_commission_settings")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-[#1e293b] shadow-xl p-4 rounded-lg">
            <SubmitButton
              AddLabel={t("button.save_changes")}
              IsLoading={isPending}
            />
          </div>
        </form>
      )}
      <AlertModal openDialog={openDialog} setOpenDialog={setOpenDialog} />
    </div>
  );
};

export default CommissionSettingsCard;
