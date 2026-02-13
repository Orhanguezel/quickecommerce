export interface Banner {
  id: number;
  type: string;
  title: string;
  title_color?: string;
  description?: string;
  description_color?: string;
  button_text?: string;
  button_text_color?: string;
  button_hover_color?: string;
  button_color?: string;
  background_image?: string;
  background_color?: string;
  thumbnail_image?: string;
  redirect_url?: string;
  location: string;
  status: number;
}

/** API returns banners grouped by type: { banner_one: [...], banner_two: [...] } */
export interface BannerGroupedResponse {
  [type: string]: Banner[];
}
