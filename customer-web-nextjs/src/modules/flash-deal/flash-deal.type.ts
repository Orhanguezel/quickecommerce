export interface FlashDeal {
  id: number;
  title: string;
  description: string;
  image: string;
  image_url: string;
  cover_image: string;
  cover_image_url: string;
  discount_type: "percentage" | "amount";
  discount_amount: number;
  special_price: string | null;
  start_time: string;
  end_time: string;
  title_color: string;
  description_color: string;
  background_color: string;
  button_text: string;
  button_text_color: string;
  button_hover_color: string;
  button_bg_color: string;
  button_url: string;
  timer_bg_color: string;
  timer_text_color: string;
}
