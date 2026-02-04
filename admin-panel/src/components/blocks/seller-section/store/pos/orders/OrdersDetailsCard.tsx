"use client";
import RequestCancelIcon from "@/assets/icons/RequestCancelIcon";
import ReviewIcon from "@/assets/icons/ReviewIcon";
import TableEditIcon from "@/assets/icons/TableEditIcon";
import { formatPrice } from "@/components/molecules/formatPrice";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import { Button, Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import GlobalImageLoader from "@/lib/imageLoader";
import { formatLabel } from "@/lib/utils";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useRefundRequestStatusUpdate } from "@/modules/seller-section/orders/refund-request/refund-request.action";
import { format } from "date-fns";
import {
  FileIcon,
  Info,
  Mail,
  MapPin,
  MapPinned,
  MessageSquareMore,
  Phone,
  Truck,
  UserCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import OrderTrackerModal from "./modals/OrderTrackerModal";
import ShowFileModal from "./modals/ShowFileModal";
import ShowNoteModal from "./modals/ShowNoteModal";
import StatusUpdateModal from "./modals/StatusUpdateModal";
import ApproveConfirmModal from "./RefundRequest/modal/ApproveConfirmModal";
import RejectConfirmModal from "./RefundRequest/modal/RejectConfirmModal";

const OrdersDetailsCard = ({ data, refetch, ID }: any) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const OrderDetails = data?.order_data;
  const RefundOrder = data?.refund;
  const OrderTrackingTime = data?.order_tracking || [];
  const OrderSummary = data?.order_summary;
  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  const {
    order_amount = "",
    order_details = [],
    order_master,
    shipping_charge,
    additional_charge_name,
  } = OrderDetails;
  const [isLoading, setIsLoading] = useState(false);
  const {
    amount: RefundAmount,
    order_refund_reason,
    status,
  } = RefundOrder || {};
  const {
    email = "",
    full_name = "",
    image = "",
    phone = "",
    address = "",
    id: customer_id = "",
    type = "",
  } = OrderDetails?.order_master?.customer || {};

  const handleClick = (e: React.MouseEvent) => {
    const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

    if (!isNewTab) {
      setIsLoading(true);
    }
    const chatTarget = {
      receiver_id: customer_id,
      receiver_type: type,
    };
    localStorage.setItem("chat_target_seller", JSON.stringify(chatTarget));
    const url = `${SellerRoutes.sellerChatManage}`;
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(url, "_blank");
    } else {
      router.push(url);
    }
  };
  const {
    name = "Unknown",
    total_delivered = "",
    rating = 0,
    phone: delPhone = "",
    review_count = 0,
    id: deliID = "",
    type: deliType = "",
  } = OrderDetails?.deliveryman || {};
  const handleClickDeliveryman = (e: React.MouseEvent) => {
    const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;
    if (!isNewTab) {
      setIsLoading(true);
    }
    const chatTarget = {
      receiver_id: deliID,
      receiver_type: deliType,
    };
    localStorage.setItem("chat_target_seller", JSON.stringify(chatTarget));
    const url = `${SellerRoutes.sellerChatManage}`;
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(url, "_blank");
    } else {
      router.push(url);
    }
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const totalStars = 5;

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  const [loading, setLoading] = useState(false);
  const { mutate: RefundStatusUpdate } = useRefundRequestStatusUpdate();
  const handleSingleApprove = (id: string) => {
    const payload = { id: id, status: "approved" };
    const submissionData = {
      ...payload,
    };
    setLoading(true);
    RefundStatusUpdate(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };
  const handleSingleReject = (id: string, reason: string) => {
    const payload = { id: id, status: "rejected", reject_reason: reason };
    const submissionData = {
      ...payload,
    };
    setLoading(true);
    RefundStatusUpdate(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <div className="grid xl:grid-cols-3 grid-cols-1 gap-4">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardContent className="p-2 md:p-6 w-full">
              <div className="flex flex-col md:flex-row gap-4 items-start justify-between ">
                <div>
                  <h1 className="text-2xl font-bold ">
                    {t("orders.order_id")} :
                    <span className="mx-1 text-2xl font-medium text-gray-500 dark:text-white">
                      #{OrderDetails?.order_id}
                    </span>
                  </h1>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {t("orders.order_amount")} :
                  </span>
                  <span className=" text-sm font-semibold text-gray-500 dark:text-white mt-1">
                    {CurrencyData
                      ? formatPrice(order_amount, CurrencyData)
                      : order_amount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {t("orders.status")} :
                  </span>
                  <span
                    className={` ${
                      OrderDetails?.status === "delivered"
                        ? "bg-green-500"
                        : OrderDetails?.status === "confirmed"
                        ? "bg-blue-500"
                        : OrderDetails?.status === "shipped"
                        ? "bg-indigo-500"
                        : OrderDetails?.status === "pending"
                        ? "bg-gray-500"
                        : OrderDetails?.status === "processing"
                        ? "bg-yellow-500"
                        : OrderDetails?.status === "pickup"
                        ? "bg-teal-500"
                        : "bg-red-500"
                    } capitalize py-1 px-2 rounded text-white`}
                  >
                    {OrderDetails?.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {t("orders.payment_getway")} :
                  </span>
                  <span className="rounded p-2 text-sm font-normal text-gray-500 bg-gray-100 mt-1">
                    {order_master?.payment_gateway &&
                      formatLabel(order_master?.payment_gateway || "", "_")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {t("orders.payment_status")} :
                  </span>
                  <span
                    className={` ${
                      OrderDetails?.payment_status === "paid"
                        ? "border border-green-500 bg-green-50 text-green-500"
                        : OrderDetails?.payment_status === "partially_paid"
                        ? "border border-blue-500 bg-blue-50 text-blue-500"
                        : OrderDetails?.payment_status === "refunded"
                        ? "border border-purple-500 bg-purple-50 text-purple-500"
                        : OrderDetails?.payment_status === "failed"
                        ? "border border-red-500 bg-red-50 text-red-500"
                        : OrderDetails?.payment_status === "pending"
                        ? "border border-yellow-500 bg-yellow-50 text-yellow-500"
                        : "border border-gray-500 bg-gray-50 text-gray-500"
                    } capitalize py-1 px-2 rounded`}
                  >
                    {OrderDetails?.payment_status &&
                      formatLabel(OrderDetails?.payment_status || "", "_")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {t("orders.order_date")} :
                  </span>
                  <span className="text-sm font-semibold text-gray-500 dark:text-white mt-1">
                    {OrderDetails?.order_date &&
                      format(OrderDetails?.order_date, "dd MMMM yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">
                    {t("orders.store_amount")} :
                  </span>
                  <span className=" text-sm font-semibold text-gray-500 dark:text-white mt-1">
                    {OrderDetails?.store_amount
                      ? formatPrice(OrderDetails?.store_amount, CurrencyData)
                      : OrderDetails?.store_amount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">
                    {t("orders.admin_order_commission")} :
                  </span>
                  <span className=" text-sm font-semibold text-gray-500 dark:text-white mt-1">
                    {OrderDetails?.admin_commission
                      ? formatPrice(
                          OrderDetails?.admin_commission,
                          CurrencyData
                        )
                      : OrderDetails?.admin_commission}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0 w-full">
              <div className="grid grid-cols-5 p-4 shadow-xl text-md font-bold">
                <h2 className="col-span-2">{t("orders.item_details")}</h2>
                <h2 className=" text-end">{t("orders.price")}</h2>
                <h2 className="text-end">{t("orders.qty")}</h2>
                <h2 className="text-end">{t("orders.total_price")}</h2>
              </div>

              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                {Array.isArray(order_details) && order_details.length > 0
                  ? order_details?.map((singleOrder, index) => {
                      const {
                        price,
                        quantity,
                        product_name,
                        line_total_price,
                        line_total_price_with_qty,
                        variant_details,
                        product_image_url,
                        product_discount_amount,
                        order_amount,
                      } = singleOrder;
                      return (
                        <div key={index}>
                          <div className="grid grid-cols-5 p-2 py-4">
                            <div className="col-span-2 flex items-center gap-4">
                              <div className="relative w-[60px] h-[60px]">
                                {product_image_url ? (
                                  <Image
                                    loader={GlobalImageLoader}
                                    src={product_image_url}
                                    alt="product_image_url"
                                    fill
                                    sizes="240px"
                                    className=" w-full h-full rounded"
                                  />
                                ) : (
                                  <Image
                                    src="/images/no-image.png"
                                    alt="no_image"
                                    fill
                                    sizes="240px"
                                    className=" w-full h-full rounded"
                                  />
                                )}
                              </div>
                              <div>
                                <h1 className="text-md font-semibold ">
                                  {product_name}
                                </h1>

                                <div className="grid grid-cols-2 gap-1">
                                  {Object.entries(variant_details).map(
                                    ([key, value]) => (
                                      <p
                                        key={key}
                                        className="text-black dark:text-white text-sm font-medium"
                                      >
                                        {key
                                          .replace(/_/g, " ") 
                                          .replace(/\b\w/g, (char) =>
                                            char.toUpperCase()
                                          )}{" "}
                                        :{" "}
                                        <span className="text-gray-500 dark:text-white font-normal">
                                          {String(value)}
                                        </span>
                                      </p>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-white text-end mx-2">
                              {CurrencyData
                                ? formatPrice(price, CurrencyData)
                                : price}
                            </p>
                            <p className="text-sm font-semibold text-gray-500 dark:text-white text-end mx-2">
                              {quantity}
                            </p>
                            <p className="text-sm font-semibold text-gray-500 dark:text-white text-end mx-4">
                              {CurrencyData
                                ? formatPrice(
                                    line_total_price_with_qty,
                                    CurrencyData
                                  )
                                : line_total_price_with_qty}
                            </p>
                          </div>
                          {index !== order_details.length - 1 && (
                            <div className="m-2 border-b border-slate-300" />
                          )}
                        </div>
                      );
                    })
                  : ""}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-6 w-full">
              <div>
                <h1 className="text-2xl font-bold">
                  {t("orders.order_summary")}
                </h1>
              </div>
              <div className="border-b border-slate-300 py-2"></div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-gray-500 dark:text-white text-sm text-start space-y-1">
                  <p>{t("orders.sub_total")}</p>
                  <p>{t("orders.coupon_discount")}</p>
                  <p>{t("orders.tax")}</p>
                  
                  
                </div>

                <div className="text-gray-500 dark:text-white text-sm text-end space-y-1">
                  <p>
                    {CurrencyData
                      ? formatPrice(OrderSummary?.subtotal, CurrencyData)
                      : OrderSummary?.subtotal}
                  </p>

                  <p>
                    -{" "}
                    {CurrencyData
                      ? formatPrice(OrderSummary?.coupon_discount, CurrencyData)
                      : OrderSummary?.coupon_discount}
                  </p>
                  <p>
                    {CurrencyData
                      ? formatPrice(
                          OrderSummary?.total_tax_amount,
                          CurrencyData
                        )
                      : OrderSummary?.total_tax_amount}
                  </p>
                  
                  
                </div>
              </div>
              <div className="border-b border-slate-300 py-2"></div>
              <div className="flex items-start justify-between my-2 text-md font-semibold ">
                <p>{t("orders.total_amount")}</p>
                <p>
                  {CurrencyData
                    ? formatPrice(OrderSummary?.total_amount, CurrencyData)
                    : OrderSummary?.total_amount}
                </p>
              </div>
            </CardContent>
          </Card>
          {order_master?.order_notes && (
            <Card>
              <CardContent className="p-2 md:p-6 w-full">
                <div>
                  <h1 className="text-2xl font-bold">
                    {t("orders.order_note")} :{" "}
                  </h1>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-white ">
                    {order_master?.order_notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-4">
          {RefundOrder && (
            <Card className="">
              <CardContent className="p-6 w-full">
                <div className="flex items-center justify-between pb-2">
                  <div className="">
                    <h2 className="text-lg md:text-2xl font-medium ">
                      {t("orders.refund_request")}
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 my-2">
                  <div className=" text-black dark:text-white text-sm font-medium space-y-1">
                    <p>{t("orders.reason")}</p>
                    <p className="py-1">{t("common.amount")}</p>
                    <p className="py-1">{t("common.status")}</p>
                    <p className="py-1">{t("orders.note")}</p>
                    <p className="py-1">{t("orders.file")}</p>
                  </div>
                  <div className=" text-gray-500 dark:text-white text-sm font-medium  space-y-1">
                    <p>: {order_refund_reason}</p>
                    <p className="py-1">
                      :{" "}
                      {CurrencyData
                        ? formatPrice(RefundAmount, CurrencyData)
                        : RefundAmount}
                    </p>
                    <p className="py-1">
                      :{" "}
                      <span
                        className={`border ${
                          status === "rejected"
                            ? "text-white border-red-500 bg-red-500"
                            : status === "refunded"
                            ? "text-white border-blue-500 bg-blue-500"
                            : status === "approved"
                            ? "text-white border-emerald-500 bg-emerald-500"
                            : "text-white border-yellow-500 bg-yellow-500"
                        } capitalize px-2 py-1 rounded`}
                      >
                        {status}
                      </span>
                    </p>
                    <div className="flex">
                      :{" "}
                      <div>
                        <ShowNoteModal
                          trigger={
                            <button>
                              <div className="mx-1 text-blue-500 bg-blue-100 rounded p-1">
                                <Info width={16} height={16} />
                              </div>
                            </button>
                          }
                          refetch={refetch}
                          row={RefundOrder}
                        />
                      </div>
                    </div>
                    <div className="flex">
                      :{" "}
                      <div>
                        <ShowFileModal
                          trigger={
                            <button>
                              <div className="mx-1">
                                <FileIcon />
                              </div>
                            </button>
                          }
                          refetch={refetch}
                          row={RefundOrder}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-2 md:p-6 w-full">
              <div className="flex items-start justify-between ">
                <div className="flex items-center gap-2">
                  <UserCircle width={24} height={24} className="mt-1" />
                  <h2 className="text-lg md:text-2xl font-medium ">
                    {t("orders.customer_info")}
                  </h2>
                </div>
                
              </div>
              <div className="p-2">
                <div className="flex items-center gap-4">
                  <div className="relative w-[60px] h-[60px]">
                    <Image
                      loader={GlobalImageLoader}
                      src={image ?? "/images/no-image.png"}
                      alt="Avatar"
                      fill
                      sizes="240px"
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-lg font-semibold capitalize">
                      {full_name}
                    </h1>
                    {phone && (
                      <p className="flex items-center gap-1 text-black dark:text-white text-sm font-medium mt-1">
                        <Phone width={16} height={16} />
                        <span className="text-gray-500 dark:text-white">
                          {" "}
                          {phone}
                        </span>
                      </p>
                    )}
                    {email && (
                      <p className="flex items-center gap-1 text-black dark:text-white text-sm font-medium mt-1">
                        <Mail width={16} height={16} />
                        <span className="text-gray-500 dark:text-white">
                          {" "}
                          {email}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                {address && (
                  <div className="mt-1">
                    <div className="flex items-center gap-1 text-md font-semibold ">
                      <MapPin width={16} height={16} />
                      <span>{t("orders.delivery_location")} :</span>
                    </div>
                    <p className="text-gray-500 dark:text-white mx-4">
                      {address?.house && `#H-${address?.house},`}{" "}
                      {address?.floor && `Floor-${address?.floor},`}{" "}
                      {address?.road && `Road-${address?.road},`}{" "}
                      {address?.address && `${address?.address},`}{" "}
                      {address?.postal_code && address?.postal_code}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrdersDetailsCard;
