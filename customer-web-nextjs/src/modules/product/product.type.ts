export interface Product {
  id: number;
  store_id: number | null;
  name: string;
  slug: string;
  description: string;
  image: string;
  image_url: string;
  stock: number | null;
  price: number | null;
  special_price: number | null;
  discount_percentage: number;
  wishlist: boolean;
  rating: string;
  review_count: number;
  flash_sale: FlashSaleInfo | null;
  is_featured?: boolean;
  max_cart_qty?: number;
  singleVariant?: ProductVariant[];
  default_variant_id?: number;
  category_name?: {
    id: number;
    category_name: string;
    category_slug: string;
  };
  store?: {
    id: number;
    store_name: string;
    slug: string;
  };
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  image_url: string;
  gallery_images: string[];
  gallery_images_urls: string[];
  video_url: string | null;
  price: string | number | null;
  special_price: string | number | null;
  discount_percentage: number;
  stock: number | null;
  tag: string;
  type: string;
  behaviour: string;
  unit_name: string | null;
  max_cart_qty: number;
  order_count: number;
  views: number;
  wishlist: boolean;
  rating: string;
  review_count: number;
  is_featured: boolean;
  status: string;
  warranty: string | null;
  return_in_days: number | null;
  return_text: string | null;
  allow_change_in_mind: string | number;
  cash_on_delivery: string | number;
  free_shipping: string | number | null;
  delivery_time_min: number | null;
  delivery_time_max: number | null;
  delivery_time_text: string | null;
  available_time_starts: string | null;
  available_time_ends: string | null;
  manufacture_date: string | null;
  expiry_date: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  meta_image_url: string | null;
  flash_sale: FlashSaleInfo | null;
  category: {
    id: number;
    category_name: string;
    category_slug: string;
  } | null;
  brand: {
    value: number;
    label: string;
  } | null;
  unit: {
    id: number;
    name: string;
  } | null;
  store: ProductStore | null;
  variants: ProductVariant[];
  reviews: ProductReview[];
  specifications: ProductSpecification[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  variant_slug: string;
  sku: string;
  pack_quantity: number;
  attributes: Record<string, string> | null;
  size: string | null;
  color: string | null;
  price: string | number;
  special_price: string | number | null;
  stock_quantity: number;
  image: string | null;
  image_url: string | null;
  status: string;
}

export interface ProductReview {
  review_id: number;
  reviewed_by: {
    name: string;
    image_url: string | null;
  };
  review: string;
  rating: number;
  like_count: number;
  dislike_count: number;
  reviewed_at: string;
  liked: boolean;
  disliked: boolean;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface ProductStore {
  id: number;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  logo: string | null;
  rating: number;
  total_product: number;
}

export interface FlashSaleInfo {
  flash_sale_id: number;
  discount_type: string;
  discount_amount: number;
  purchase_limit: number;
}

export interface ProductDetailResponse {
  messages: string;
  data: ProductDetail;
  related_products: Product[];
}

export interface Slider {
  id: number;
  title: string;
  title_color: string;
  sub_title: string;
  sub_title_color: string;
  description: string;
  description_color: string;
  image: string;
  image_url: string;
  bg_image: string;
  bg_image_url: string;
  bg_color: string;
  button_text: string;
  button_text_color: string;
  button_bg_color: string;
  button_hover_color: string;
  button_url: string;
  redirect_url: string;
}

export interface FlashSale {
  id: number;
  title: string;
  title_color: string;
  description: string;
  description_color: string;
  background_color: string;
  image: string;
  image_url: string;
  cover_image: string;
  cover_image_url: string;
  button_text: string;
  button_text_color: string;
  button_bg_color: string;
  button_url: string;
  start_time: string;
  end_time: string;
}
