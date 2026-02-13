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
  const orderT = await getTranslations({ locale, namespace: "order" });
  const supportT = await getTranslations({ locale, namespace: "support" });

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
        wishlist: accountT("wishlist"),
        no_wishlist: accountT("no_wishlist"),
        recently_viewed: accountT("recently_viewed"),
        no_recently_viewed: accountT("no_recently_viewed"),
        clear_history: accountT("clear_history"),
        no_addresses: checkoutT("no_addresses"),
        address_saved: checkoutT("address_saved"),
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
        // Order translations
        my_orders: orderT("my_orders"),
        order_number: orderT("order_number"),
        order_date: orderT("order_date"),
        view_detail: orderT("view_detail"),
        cancel_order: orderT("cancel_order"),
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
        // Support translations
        support: supportT("support"),
        new_ticket: supportT("new_ticket"),
        ticket_title: supportT("ticket_title"),
        ticket_subject: supportT("ticket_subject"),
        ticket_priority: supportT("ticket_priority"),
        priority_low: supportT("priority_low"),
        priority_medium: supportT("priority_medium"),
        priority_high: supportT("priority_high"),
        priority_urgent: supportT("priority_urgent"),
        status_open: supportT("status_open"),
        status_closed: supportT("status_closed"),
        no_tickets: supportT("no_tickets"),
        view_conversation: supportT("view_conversation"),
        type_message: supportT("type_message"),
        resolve_ticket: supportT("resolve_ticket"),
        // Common
        home: commonT("home"),
        loading: commonT("loading"),
        error: commonT("error"),
        save: commonT("save"),
        cancel: commonT("cancel"),
        delete: commonT("delete"),
        edit: commonT("edit"),
        logout: commonT("logout"),
        currency: commonT("currency"),
        previous: commonT("previous"),
        next: commonT("next"),
        search: commonT("search"),
      }}
    />
  );
}
