import { Routes } from "@/config/routes";
import { SellerRoutes } from "@/config/sellerRoutes";

export function notificationRoute(data: any, isSeller = false): string | null {
  if (!isSeller && data?.type === "product_question") {
    return "/admin/feedback-control/questions";
  }
  if (!isSeller && data?.type === "customer_review") {
    return "/admin/feedback-control/review";
  }
  const orderId = String(data?.order_id ?? "");
  if (!/^\d+$/.test(orderId)) return null;
  return `${isSeller ? SellerRoutes.orderDetails : Routes.orderDetails}/${orderId}`;
}
