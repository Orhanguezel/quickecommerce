export interface ShippingCampaign {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  background_color?: string;
  title_color?: string;
  description_color?: string;
  button_text?: string;
  button_text_color?: string;
  button_bg_color?: string;
  button_url?: string;
  min_order_value: number;
}
