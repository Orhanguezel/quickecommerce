"use client";
import { SubmitButton } from "@/components/blocks/shared";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";
import { Card, CardContent, Checkbox } from "@/components/ui";
import {
  useCommissionSettingsQuery,
  useCommissionSettingsStoreMutation,
} from "@/modules/admin-section/business-operations/commission/settings/commission-settings.action";
import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const TaxSettingsCard = () => {
  const t = useTranslations();
  const [taxAmount, setTaxAmount] = useState(false);

  const {
    commissionSettingsData,
    refetch,
    isPending: isQuerying,
  } = useCommissionSettingsQuery({});

  const message = useMemo(
    () => (commissionSettingsData as any)?.data,
    [commissionSettingsData]
  );

  useEffect(() => {
    if (message) {
      setTaxAmount(message.order_include_tax_amount);
    }
  }, [message]);

  const { mutate: CommissionSettingsStore, isPending } =
    useCommissionSettingsStoreMutation();

  const VALID_COMMISSION_TYPES = ["fixed", "percentage"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeCommissionType = VALID_COMMISSION_TYPES.includes(
      message?.commission_type
    )
      ? message.commission_type
      : "percentage";

    const submissionData = {
      order_additional_charge_amount: Number(
        message?.order_additional_charge_amount ?? 0
      ),
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
      order_shipping_charge: Number(message?.order_shipping_charge ?? 0),
      free_shipping_min_order_value: Number(
        message?.free_shipping_min_order_value ?? 0
      ),
      commission_type: safeCommissionType,
      subscription_enabled: message?.subscription_enabled ?? true,
      commission_enabled: message?.commission_enabled ?? false,
      order_additional_charge_enable_disable:
        message?.order_additional_charge_enable_disable ?? false,
      order_additional_charge_name:
        message?.order_additional_charge_name ?? null,
      order_include_tax_amount: taxAmount,
    };

    CommissionSettingsStore(submissionData as any, {
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardContent className="p-2 md:p-6">
              <h2 className="text-lg md:text-2xl font-medium flex items-center">
                <DollarSign /> {t("common.tax_settings")}
              </h2>
              <div className="p-4 mt-2">
                <div className="flex items-center gap-3 mb-4">
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
                <div>
                  <p>{t("common.tax_note_in_commission_settings")}</p>
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

export default TaxSettingsCard;
