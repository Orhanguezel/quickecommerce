"use client";

import { Card, CardContent } from "@/components/ui";
import {
  usePaymentGetwayListQuery,
  usePaymentGetwayQuery,
} from "@/modules/admin-section/payment-settings/payment-settings.action";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useEffect, useMemo, useState } from "react";
import GetwaySettingsForm from "./GetwaySettingsForm";

type GatewayButton = {
  id: string;
  label: string;
};

const FALLBACK_SLUG = "cash_on_delivery";

const PaymentSettingsForm = () => {
  const dispatch = useAppDispatch();

  const [sectionName, setSectionName] = useState<string>(FALLBACK_SLUG);

  const { paymentGetwayList } = usePaymentGetwayListQuery({});

  const buttons = useMemo<GatewayButton[]>(() => {
    const raw = paymentGetwayList as any;
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.gateways)
      ? raw.gateways
      : Array.isArray(raw?.paymentGateways)
      ? raw.paymentGateways
      : [];

    return list
      .map((gateway: any) => ({
        id: String(gateway?.slug ?? ""),
        label: String(gateway?.name ?? gateway?.slug ?? "").trim(),
      }))
      .filter((gateway: GatewayButton) => gateway.id.length > 0);
  }, [paymentGetwayList]);

  useEffect(() => {
    if (!buttons.length) return;
    if (buttons.some((button) => button.id === sectionName)) return;
    setSectionName(buttons[0].id);
  }, [buttons, sectionName]);

  const selectedGateway = sectionName || buttons[0]?.id || FALLBACK_SLUG;

  const { paymentgetway, refetch, isFetching, isPending, error } =
    usePaymentGetwayQuery(selectedGateway);

  const handleSelectionChange = (value: string) => {
    setSectionName(value);
    dispatch(setRefetch(true));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-8 gap-0 md:gap-5">
      <div className="col-span-1">
        <Card className="sticky inset-x-0 top-24 left-0 mt-4">
          <CardContent className="p-2 md:p-4">
            {buttons.map((button) => (
              <div
                onClick={() => handleSelectionChange(button.id)}
                key={button.id}
                className={`cursor-pointer my-2 bg-blue-50 text-blue-500 rounded p-2 ${
                  selectedGateway === button.id ? "bg-blue-500 text-white" : ""
                }`}
              >
                <button className="text-sm font-semibold text-start">{button.label}</button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 col-span-7 min-h-[calc(100vh-74px)]">
        <div className="p-2">
          <GetwaySettingsForm
            paymentgetway={paymentgetway}
            refetch={refetch}
            isPending={isPending}
            getwayname={selectedGateway}
            isFetching={isFetching}
            error={error}
          />
        </div>
      </Card>
    </div>
  );
};

export default PaymentSettingsForm;
