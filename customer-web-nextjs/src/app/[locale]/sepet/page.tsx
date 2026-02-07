import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CartClient } from "./cart-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });

  return {
    title: t("your_cart"),
    robots: { index: false },
    alternates: {
      canonical: `/${locale}/sepet`,
      languages: { tr: `/tr/sepet`, en: `/en/sepet` },
    },
  };
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  return (
    <CartClient
      translations={{
        your_cart: t("your_cart"),
        empty_cart: t("empty_cart"),
        subtotal: t("subtotal"),
        shipping: t("shipping"),
        total: t("total"),
        checkout: t("checkout"),
        continue_shopping: t("continue_shopping"),
        remove: t("remove"),
        apply_coupon: t("apply_coupon"),
        home: commonT("home"),
        currency: commonT("currency"),
        quantity: commonT("products"),
      }}
    />
  );
}
