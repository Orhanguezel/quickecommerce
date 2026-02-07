import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountClient } from "./account-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seoT = await getTranslations({ locale, namespace: "seo" });

  return {
    title: seoT("account_title"),
    robots: { index: false },
    alternates: {
      canonical: `/${locale}/hesabim`,
      languages: { tr: `/tr/hesabim`, en: `/en/hesabim` },
    },
  };
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  const accountT = await getTranslations({ locale, namespace: "account" });
  const commonT = await getTranslations({ locale, namespace: "common" });
  const checkoutT = await getTranslations({ locale, namespace: "checkout" });

  return (
    <AccountClient
      translations={{
        my_account: accountT("my_account"),
        profile: accountT("profile"),
        change_password: accountT("change_password"),
        addresses: accountT("addresses"),
        first_name: accountT("first_name"),
        last_name: accountT("last_name"),
        email: accountT("email"),
        phone: accountT("phone"),
        birth_day: accountT("birth_day"),
        gender: accountT("gender"),
        gender_male: accountT("gender_male"),
        gender_female: accountT("gender_female"),
        gender_others: accountT("gender_others"),
        profile_updated: accountT("profile_updated"),
        old_password: accountT("old_password"),
        new_password: accountT("new_password"),
        confirm_password: accountT("confirm_password"),
        password_changed: accountT("password_changed"),
        passwords_not_match: accountT("passwords_not_match"),
        delete_account: accountT("delete_account"),
        delete_account_confirm: accountT("delete_account_confirm"),
        delete_account_message: accountT("delete_account_message"),
        delete_yes: accountT("delete_yes"),
        delete_no: accountT("delete_no"),
        no_addresses: checkoutT("no_addresses"),
        add_address: checkoutT("add_address"),
        address_type: checkoutT("address_type"),
        address_type_home: checkoutT("address_type_home"),
        address_type_office: checkoutT("address_type_office"),
        address_type_others: checkoutT("address_type_others"),
        address_title: checkoutT("address_title"),
        address_field: checkoutT("address_field"),
        address_email: checkoutT("address_email"),
        address_phone: checkoutT("address_phone"),
        address_road: checkoutT("address_road"),
        address_house: checkoutT("address_house"),
        address_floor: checkoutT("address_floor"),
        address_postal: checkoutT("address_postal"),
        set_default: checkoutT("set_default"),
        home: commonT("home"),
        loading: commonT("loading"),
        error: commonT("error"),
        save: commonT("save"),
        cancel: commonT("cancel"),
        delete: commonT("delete"),
        edit: commonT("edit"),
      }}
    />
  );
}
