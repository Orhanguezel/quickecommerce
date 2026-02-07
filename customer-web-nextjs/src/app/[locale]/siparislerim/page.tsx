import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrdersClient } from "./orders-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seoT = await getTranslations({ locale, namespace: "seo" });

  return {
    title: seoT("orders_title"),
    robots: { index: false },
    alternates: {
      canonical: `/${locale}/siparislerim`,
      languages: { tr: `/tr/siparislerim`, en: `/en/siparislerim` },
    },
  };
}

export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;
  const orderT = await getTranslations({ locale, namespace: "order" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  return (
    <OrdersClient
      translations={{
        my_orders: orderT("my_orders"),
        order_number: orderT("order_number"),
        order_date: orderT("order_date"),
        status: orderT("status"),
        total: orderT("total"),
        cancel_order: orderT("cancel_order"),
        view_detail: orderT("view_detail"),
        no_orders: orderT("no_orders"),
        cancel_confirm: orderT("cancel_confirm"),
        cancel_confirm_message: orderT("cancel_confirm_message"),
        cancel_yes: orderT("cancel_yes"),
        cancel_no: orderT("cancel_no"),
        status_pending: orderT("status_pending"),
        status_confirmed: orderT("status_confirmed"),
        status_processing: orderT("status_processing"),
        status_pickup: orderT("status_pickup"),
        status_shipped: orderT("status_shipped"),
        status_delivered: orderT("status_delivered"),
        status_cancelled: orderT("status_cancelled"),
        status_on_hold: orderT("status_on_hold"),
        filter_all: orderT("filter_all"),
        items_count: orderT("items_count"),
        home: commonT("home"),
        loading: commonT("loading"),
        error: commonT("error"),
        currency: commonT("currency"),
        previous: commonT("previous"),
        next: commonT("next"),
        page: commonT("page"),
        search: commonT("search"),
      }}
    />
  );
}
