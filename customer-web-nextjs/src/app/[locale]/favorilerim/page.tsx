import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WishlistClient } from "./wishlist-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const commonT = await getTranslations({ locale, namespace: "common" });

  return {
    title: commonT("wishlist"),
    robots: { index: false },
    alternates: {
      canonical: `/${locale}/favorilerim`,
      languages: { tr: `/tr/favorilerim`, en: `/en/favorilerim` },
    },
  };
}

export default async function WishlistPage({ params }: Props) {
  const { locale } = await params;
  const commonT = await getTranslations({ locale, namespace: "common" });
  const productT = await getTranslations({ locale, namespace: "product" });

  return (
    <WishlistClient
      translations={{
        wishlist: commonT("wishlist"),
        home: commonT("home"),
        no_data: commonT("no_data"),
        loading: commonT("loading"),
        error: commonT("error"),
        remove_from_wishlist: productT("remove_from_wishlist"),
        add_to_cart: productT("add_to_cart"),
        currency: commonT("currency"),
        previous: commonT("previous"),
        next: commonT("next"),
        page: commonT("page"),
      }}
    />
  );
}
