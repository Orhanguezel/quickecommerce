export interface BundleItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  product: {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    image_url: string | null;
  } | null;
  variant: {
    id: number;
    variant_slug: string;
    price: number;
    special_price: number | null;
    stock_quantity: number;
  } | null;
}

export interface Bundle {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  image_url: string | null;
  original_price: number;
  bundle_price: number;
  discount_percent: number;
  savings: number;
  currency_code: string;
  starts_at: string | null;
  ends_at: string | null;
  items: BundleItem[];
}
