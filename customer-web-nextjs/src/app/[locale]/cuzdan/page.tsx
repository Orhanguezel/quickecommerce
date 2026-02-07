import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WalletClient } from "./wallet-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seoT = await getTranslations({ locale, namespace: "seo" });

  return {
    title: seoT("wallet_title"),
    robots: { index: false },
    alternates: {
      canonical: `/${locale}/cuzdan`,
      languages: { tr: `/tr/cuzdan`, en: `/en/cuzdan` },
    },
  };
}

export default async function WalletPage({ params }: Props) {
  const { locale } = await params;
  const walletT = await getTranslations({ locale, namespace: "wallet" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  return (
    <WalletClient
      translations={{
        wallet: walletT("wallet"),
        balance: walletT("balance"),
        total_earnings: walletT("total_earnings"),
        total_withdrawn: walletT("total_withdrawn"),
        transactions: walletT("transactions"),
        no_transactions: walletT("no_transactions"),
        filter_all: walletT("filter_all"),
        filter_credit: walletT("filter_credit"),
        filter_debit: walletT("filter_debit"),
        type_credit: walletT("type_credit"),
        type_debit: walletT("type_debit"),
        status_pending: walletT("status_pending"),
        status_paid: walletT("status_paid"),
        status_failed: walletT("status_failed"),
        home: commonT("home"),
        loading: commonT("loading"),
        error: commonT("error"),
        currency: commonT("currency"),
        previous: commonT("previous"),
        next: commonT("next"),
        page: commonT("page"),
      }}
    />
  );
}
