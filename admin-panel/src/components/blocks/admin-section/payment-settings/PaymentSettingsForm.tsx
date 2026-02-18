"use client";
import multiLang from "@/components/molecules/multiLang.json";
import { Card, CardContent } from "@/components/ui";
import {
  usePaymentGetwayQuery
} from "@/modules/admin-section/payment-settings/payment-settings.action";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import GetwaySettingsForm from "./GetwaySettingsForm";

// JSON scaffold stack (standard)
import {
  AdminI18nJsonPanel,
  buildI18nJsonFromFlatValues,
  applyI18nJsonToFlatForm,
  makeRHFSetValueAny, safeObject,
  ensureLangKeys,
  useFormI18nScaffold
} from '@/lib/json';

type LangKeys = keyof IntlMessages["lang"];
type ViewMode = "form" | "json";

const PaymentSettingsForm = ({ data }: any) => {
  const t = useTranslations();
  const multiLangData = useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [sectionName, setSectionName] = useState("Stripe");


  const { paymentgetway, refetch, isFetching, isPending, error } =
    usePaymentGetwayQuery(sectionName);

  const buttons = [
    { id: "Stripe", label: "Stripe" },
    { id: "Paypal", label: "PayPal" },
    { id: "PayTm", label: "PayTm" },
    { id: "cash_on_delivery", label: "Cash On Delivery" },
  ];
  const dispatch = useAppDispatch();
  const handleSelectionChange = (value: string) => {
    setSectionName(value);
    dispatch(setRefetch(true));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-8 gap-0 md:gap-5">
        <div className="col-span-1">
          <Card className="sticky inset-x-0 top-24 left-0 mt-4">
            <CardContent className="p-2 md:p-4">
              {buttons.map((button) => (
                <div
                  onClick={() => handleSelectionChange(button.id)}
                  key={button.id}
                  className={`cursor-pointer my-2 bg-blue-50 text-blue-500 rounded p-2 ${
                    sectionName === button.id ? "bg-blue-500 text-white" : ""
                  } `}
                >
                  <button className="text-sm font-semibold text-start">
                    {button.label}
                  </button>
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
              getwayname={sectionName}
              isFetching={isFetching}
              error={error}
            />
          </div>
        </Card>
      </div>
    </>
  );
};

export default PaymentSettingsForm;
