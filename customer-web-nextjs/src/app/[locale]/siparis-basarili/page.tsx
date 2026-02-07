import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrderSuccessClient } from "./order-success-client";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });

  return {
    title: t("order_success"),
    robots: { index: false },
  };
}

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "checkout" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  return (
    <OrderSuccessClient
      orderId={sp.order || ""}
      translations={{
        order_success: t("order_success"),
        order_success_message: t("order_success_message"),
        order_number: t("order_number"),
        continue_shopping: t("continue_shopping"),
        view_orders: t("view_orders"),
        home: commonT("home"),
      }}
    />
  );
}
