"use client";
import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";


const baseSchemaRegister = {
  com_register_page_title_df: z.string().optional(),
  com_register_page_subtitle_df: z.string().optional(),
  com_register_page_description_df: z.string().optional(),
  com_register_page_terms_title_df: z.string().optional(),
  com_register_page_terms_page: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`com_register_page_title_${lang.id}`] = z.string().optional();
    fields[`com_register_page_subtitle_${lang.id}`] = z.string().optional();
    fields[`com_register_page_description_${lang.id}`] = z.string().optional();
    fields[`com_register_page_terms_title_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const pageSettingsSchemaRegister = z.object({
  ...baseSchemaRegister,
  ...dynamicFields,
});

export type PageSettingsFormDataRegister = z.infer<typeof pageSettingsSchemaRegister>;





const baseSchemaLogin = {
  com_login_page_title_df: z.string().optional(),
  com_seller_login_page_title_df: z.string().optional(),
  com_login_page_subtitle_df: z.string().optional(),
  com_seller_login_page_subtitle_df: z.string().optional(),
};

const dynamicFieldsLogin = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`com_login_page_title_${lang.id}`] = z.string().optional();
    fields[`com_seller_login_page_title_${lang.id}`] = z.string().optional();
    fields[`com_login_page_subtitle_${lang.id}`] = z.string().optional();
    fields[`com_seller_login_page_subtitle_${lang.id}`] = z.string().optional();
    
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const pageSettingsSchemaLogin = z.object({
  ...baseSchemaLogin,
  ...dynamicFieldsLogin,
});

export type PageSettingsFormDataLogin = z.infer<typeof pageSettingsSchemaLogin>;




const baseSchemaProductDetails = {
  com_product_details_page_delivery_title_df: z.string().optional(),
  com_product_details_page_delivery_subtitle_df: z.string().optional(),
  com_product_details_page_return_refund_title_df: z.string().optional(),
  com_product_details_page_return_refund_subtitle_df: z.string().optional(),
  com_product_details_page_delivery_url: z.string().optional(),
  com_product_details_page_return_refund_url: z.string().optional(),
  com_product_details_page_related_title_df: z.string().optional(),
};

const dynamicFieldsProductDetails = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`com_product_details_page_delivery_title_${lang.id}`] = z.string().optional();
    fields[`com_product_details_page_delivery_subtitle_${lang.id}`] = z.string().optional();
    fields[`com_product_details_page_return_refund_title_${lang.id}`] = z.string().optional();
    fields[`com_product_details_page_return_refund_subtitle_${lang.id}`] = z.string().optional();
    fields[`com_product_details_page_related_title_${lang.id}`] = z.string().optional();
    
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const pageSettingsSchemaProductDetails = z.object({
  ...baseSchemaProductDetails,
  ...dynamicFieldsProductDetails,
});

export type PageSettingsFormDataProductDetails = z.infer<typeof pageSettingsSchemaProductDetails>;




const baseSchemaBlogDetails = {
  com_blog_details_popular_title_df: z.string().optional(),
  com_blog_details_related_title_df: z.string().optional(),
};

const dynamicFieldsBlogDetails = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`com_blog_details_popular_title_${lang.id}`] = z.string().optional();
    fields[`com_blog_details_related_title_${lang.id}`] = z.string().optional();
    
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const pageSettingsSchemaBlogDetails = z.object({
  ...baseSchemaBlogDetails,
  ...dynamicFieldsBlogDetails,
});

export type PageSettingsFormDataBlogDetails = z.infer<typeof pageSettingsSchemaBlogDetails>;



const baseSchemaHome = {
  com_home_one_category_button_title_df: z.string().optional(),
  com_home_one_store_button_title_df: z.string().optional(),
  com_home_one_category_section_title_df: z.string().optional(),
  com_home_one_flash_sale_section_title_df: z.string().optional(),
  com_home_one_featured_section_title_df: z.string().optional(),
  com_home_one_top_selling_section_title_df: z.string().optional(),
  com_home_one_latest_product_section_title_df: z.string().optional(),
  com_home_one_popular_product_section_title_df: z.string().optional(),
  com_home_one_top_store_section_title_df: z.string().optional(),
};

const dynamicFieldsHome = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`com_home_one_category_button_title_${lang.id}`] = z.string().optional();
    fields[`com_home_one_store_button_title_${lang.id}`] = z.string().optional();
    fields[`com_home_one_category_section_title_${lang.id}`] = z.string().optional();
    fields[`com_home_one_flash_sale_section_title_${lang.id}`] = z.string().optional();
    fields[`com_home_one_featured_section_title_${lang.id}`] = z.string().optional();
    fields[`com_home_one_top_selling_section_title_${lang.id}`] = z.string().optional();
    fields[`com_home_one_latest_product_section_title_${lang.id}`] = z.string().optional();
    fields[`com_home_one_popular_product_section_title_${lang.id}`] = z.string().optional();
    fields[`com_home_one_top_store_section_title_${lang.id}`] = z.string().optional();
    
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const pageSettingsSchemaHome = z.object({
  ...baseSchemaHome,
  ...dynamicFieldsHome,
});

export type PageSettingsFormDataHome = z.infer<typeof pageSettingsSchemaHome>;