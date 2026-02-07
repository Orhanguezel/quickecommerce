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
  active_theme: string;
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
}
