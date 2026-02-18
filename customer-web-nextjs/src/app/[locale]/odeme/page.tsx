import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckoutClient } from "./checkout-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });

  return {
    title: t("title"),
    robots: { index: false },
    alternates: {
      canonical: `/${locale}/odeme`,
      languages: { tr: `/tr/odeme`, en: `/en/odeme` },
    },
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  const commonT = await getTranslations({ locale, namespace: "common" });
  const cartT = await getTranslations({ locale, namespace: "cart" });

  return (
    <CheckoutClient
      translations={{
        title: t("title"),
        shipping_address: t("shipping_address"),
        add_address: t("add_address"),
        edit_address: t("edit_address"),
        no_addresses: t("no_addresses"),
        address_type: t("address_type"),
        address_type_home: t("address_type_home"),
        address_type_office: t("address_type_office"),
        address_type_others: t("address_type_others"),
        address_title: t("address_title"),
        address_field: t("address_field"),
        address_email: t("address_email"),
        address_phone: t("address_phone"),
        address_road: t("address_road"),
        address_house: t("address_house"),
        address_floor: t("address_floor"),
        address_postal: t("address_postal"),
        set_default: t("set_default"),
        order_summary: t("order_summary"),
        payment_method: t("payment_method"),
        no_payment_methods: t("no_payment_methods"),
        unsupported_payment_methods_for_checkout: t(
          "unsupported_payment_methods_for_checkout"
        ),
        coupon_code: t("coupon_code"),
        apply: t("apply"),
        coupon_applied: t("coupon_applied"),
        coupon_discount: t("coupon_discount"),
        order_notes: t("order_notes"),
        order_notes_placeholder: t("order_notes_placeholder"),
        place_order: t("place_order"),
        placing_order: t("placing_order"),
        empty_cart: cartT("empty_cart"),
        subtotal: cartT("subtotal"),
        shipping: cartT("shipping"),
        total: cartT("total"),
        currency: commonT("currency"),
        loading: commonT("loading"),
        error: commonT("error"),
        save: commonT("save"),
        cancel: commonT("cancel"),
        home: commonT("home"),
      }}
    />
  );
}
