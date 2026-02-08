export interface Banner {
  id: number;
  type: string;
  title: string;
  description?: string;
  button_text?: string;
  image_url: string;
  link_url?: string;
  location: string;
  theme_name: string;
  status: number;
  display_order: number;
}

export interface BannerResponse {
  [key: string]: Banner[];
}
