export interface PublicCoupon {
  id: number;
  coupon_title: string;
  coupon_description: string | null;
  coupon_image_url: string | null;
  coupon_code: string;
  discount_type: "percentage" | "amount";
  discount: number;
  min_order_value: number | null;
  max_discount: number | null;
  start_date: string;
  end_date: string;
}
