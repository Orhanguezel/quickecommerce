import type { QueryOptions } from "@/modules/core/types";

export interface ShippingCampaignQueryOptions extends QueryOptions {
  search?: string;
}

export interface ShippingCampaign {
  id: string;
  title: string;
  description?: string;
  image?: string;
  image_url?: string;
  background_color?: string;
  title_color?: string;
  description_color?: string;
  button_text?: string;
  button_text_color?: string;
  button_bg_color?: string;
  button_url?: string;
  min_order_value: number;
  status: boolean;
  created_at?: string;
}
