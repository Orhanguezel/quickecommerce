"use client";
import { SubmitButton } from "@/components/blocks/shared";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";
import { Card, CardContent, Input } from "@/components/ui";
import {
  useCommissionSettingsQuery,
  useCommissionSettingsStoreMutation,
} from "@/modules/admin-section/business-operations/commission/settings/commission-settings.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const shippingSchema = z.object({
  order_shipping_charge: z.number().min(0),
  free_shipping_min_order_value: z.number().min(0),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const VALID_COMMISSION_TYPES = ["fixed", "percentage"];

const ShippingSettingsCard = () => {
  const t = useTranslations();
  const {
    commissionSettingsData,
    refetch,
    isPending: isQuerying,
  } = useCommissionSettingsQuery({});

  const message = useMemo(
    () => (commissionSettingsData as any)?.data,
    [commissionSettingsData]
  );

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      order_shipping_charge: 0,
      free_shipping_min_order_value: 0,
    },
  });

  // Populate form when data loads (useForm defaultValues only run once on mount)
  useEffect(() => {
    if (message) {
      reset({
        order_shipping_charge: Number(message.order_shipping_charge ?? 0),
        free_shipping_min_order_value: Number(
          message.free_shipping_min_order_value ?? 0
        ),
      });
    }
  }, [message, reset]);

  const { mutate: CommissionSettingsStore, isPending } =
    useCommissionSettingsStoreMutation();

  const onSubmit = async (values: ShippingFormData) => {
    // Ensure commission_type is valid for backend in:fixed,percentage validation
    const safeCommissionType = VALID_COMMISSION_TYPES.includes(
      message?.commission_type
    )
      ? message.commission_type
      : "percentage";

    const submissionData = {
      order_additional_charge_amount: Number(
        message?.order_additional_charge_amount ?? 0
      ),
      // Clamp to max:100 — backend validation enforces this limit
      order_additional_charge_commission: Math.min(
        100,
        Number(message?.order_additional_charge_commission ?? 0)
      ),
      default_delivery_commission_charge: Math.min(
        100,
        Number(message?.default_delivery_commission_charge ?? 0)
      ),
      commission_amount: Number(message?.commission_amount ?? 0),
      default_order_commission_rate: Number(
        message?.default_order_commission_rate ?? 0
      ),
      commission_type: safeCommissionType,
      order_include_tax_amount: message?.order_include_tax_amount ?? false,
      // Default to true to avoid "at least one must be enabled" backend error
      subscription_enabled: message?.subscription_enabled ?? true,
      commission_enabled: message?.commission_enabled ?? false,
      order_additional_charge_enable_disable:
        message?.order_additional_charge_enable_disable ?? false,
      order_additional_charge_name:
        message?.order_additional_charge_name ?? null,
      ...values,
    };

    return CommissionSettingsStore(submissionData as any, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  return (
    <div>
      {isQuerying ? (
        <CardSkletonLoader />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardContent className="p-2 md:p-6">
              <h2 className="text-lg md:text-2xl font-medium flex items-center gap-1">
                <Truck /> {t("common.shipping_charge")}
              </h2>
              <div className="p-4 mt-2 space-y-6">
                <div>
                  <p className="text-sm font-medium mb-1">
                    {t("common.minimum_shipping_charge")}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t("common.order_shipping_charge_hint")}
                  </p>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    id="order_shipping_charge"
                    {...register("order_shipping_charge", {
                      valueAsNumber: true,
                    })}
                    placeholder={t("place_holder.enter_order_shipping_charge")}
                    className="app-input"
                  />
                  {errors.order_shipping_charge && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.order_shipping_charge.message}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">
                    {t("common.free_shipping_min_cart_subtotal")}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t("common.free_shipping_min_order_hint")}
                  </p>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    id="free_shipping_min_order_value"
                    {...register("free_shipping_min_order_value", {
                      valueAsNumber: true,
                    })}
                    placeholder={t(
                      "place_holder.enter_free_shipping_threshold"
                    )}
                    className="app-input"
                  />
                  {errors.free_shipping_min_order_value && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.free_shipping_min_order_value.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 bg-white dark:bg-[#1e293b] shadow-xl p-4 rounded-lg">
            <SubmitButton
              AddLabel={t("button.save_changes")}
              IsLoading={isPending}
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default ShippingSettingsCard;
