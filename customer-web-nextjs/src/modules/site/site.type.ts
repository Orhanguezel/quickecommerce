export interface SiteSettings {
  com_site_title: string;
  com_site_subtitle: string;
  com_site_favicon: string;
  com_site_logo: string;
  com_site_white_logo: string;
  com_site_footer_copyright: string;
  com_site_email: string;
  com_site_website_url: string;
  com_site_contact_number: string;
  com_site_full_address: string;
  com_maintenance_mode: boolean;
  com_user_login_otp?: string | null;
  otp_login_enabled_disable?: string | null;
  com_google_login_enabled?: string | null;
  com_facebook_login_enabled?: string | null;
  active_theme: string;
  com_ai_chat_enabled?: string | null;
}

export interface SiteGeneralInfo {
  site_settings: SiteSettings;
}

export interface MenuItem {
  id: number;
  page_id: number | null;
  value: number;
  name: string;
  label: string;
  url: string;
  icon: string | null;
  position: number;
  is_visible: boolean;
  parent_id: number | null;
  parent_path: string;
  menu_level: number;
  menu_path: string;
  menu_content: Record<string, unknown>;
  childrenRecursive: MenuItem[];
  status: number;
}

export interface FooterLinkItem {
  title?: string;
  url?: string;
  com_quick_access_title?: string;
  com_quick_access_url?: string;
}

export interface FooterContent {
  com_quick_access_enable_disable?: string;
  com_our_info_enable_disable?: string;
  com_social_links_enable_disable?: string;
  com_social_links_title?: string;
  com_payment_methods_enable_disable?: string;
  com_quick_access?: FooterLinkItem[];
  com_our_info?: FooterLinkItem[];
  com_help_center?: FooterLinkItem[];
  com_social_links_facebook_url?: string;
  com_social_links_twitter_url?: string;
  com_social_links_instagram_url?: string;
  com_social_links_linkedin_url?: string;
  com_download_app_link_one?: string;
  com_download_app_link_two?: string;
  com_payment_methods_image?: string;
  com_payment_methods_image_urls?: string;
}

export interface FooterSettings {
  content: FooterContent;
}

export interface Category {
  id: number;
  value: number;
  label: string;
  category_name: string;
  parent_id: number | null;
  category_slug: string;
  category_banner: string;
  category_thumb: string;
  category_thumb_url: string;
  category_name_paths: string;
  parent_path: string;
  display_order: number;
  children?: Category[];
}
