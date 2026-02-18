"use client";

import { z } from "zod";


const baseSchema = {
  currency_settings: z.string().optional(),
  com_site_global_currency: z.string().optional(),
  com_site_enable_disable_decimal_point: z.string().optional(),
  com_site_space_between_amount_and_symbol: z.string().optional(),
  com_site_comma_form_adjustment_amount: z.string().optional(),
  com_site_currency_symbol_position: z.string().optional(),
  com_site_default_currency_to_usd_exchange_rate: z.string().optional(),
  com_site_default_currency_to_myr_exchange_rate: z.string().optional(),
  com_site_default_currency_to_brl_exchange_rate: z.string().optional(),
  com_site_default_currency_to_zar_exchange_rate: z.string().optional(),
  com_site_default_currency_to_ngn_exchange_rate: z.string().optional(),
};

export const paymentSettingsSchema = z.object({
  ...baseSchema,
  //...dynamicFields,
});

export type CurrencySettingsFormData = z.infer<typeof paymentSettingsSchema>;

const subSchema = {
  gateway_name: z.string().optional(),
  description: z.string().optional(),

  paypal_sandbox_client_id: z.string().optional(),
  paypal_sandbox_client_secret: z.string().optional(),
  paypal_sandbox_client_app_id: z.string().optional(),
  paypal_live_client_id: z.string().optional(),
  paypal_live_client_secret: z.string().optional(),
  paypal_live_app_id: z.string().optional(),

  stripe_public_key: z.string().optional(),
  stripe_secret_key: z.string().optional(),


  paytm_merchant_key: z.string().optional(),
  paytm_merchant_mid: z.string().optional(),
  paytm_merchant_website: z.string().optional(),
  paytm_channel: z.string().optional(),
  paytm_industry_type: z.string().optional(),

  paystack_public_key: z.string().optional(),
  paystack_secret_key: z.string().optional(),
  paystack_merchant_email: z.string().optional(),

  mollie_public_key: z.string().optional(),
  zitopay_username: z.string().optional(),

  paytabs_profile_id: z.string().optional(),
  paytabs_region: z.string().optional(),
  paytabs_server_key: z.string().optional(),

  billplz_key: z.string().optional(),
  billplz_version: z.string().optional(),
  billplz_x_signature: z.string().optional(),
  billplz_collection_name: z.string().optional(),

  flutterwave_public_key: z.string().optional(),
  flutterwave_secret_key: z.string().optional(),
  flutterwave_secret_hash: z.string().optional(),
  manual_payment_name: z.string().optional(),  
};

export const getwaySettingsSchema = z.object({
  ...subSchema
}).passthrough();

export type GetwaySettingsFormData = z.infer<typeof getwaySettingsSchema>;
