"use client";
import FileIcon from "@/assets/icons/FileIcon";
import RequestCancelIcon from "@/assets/icons/RequestCancelIcon";
import ReviewIcon from "@/assets/icons/ReviewIcon";
import TableEditIcon from "@/assets/icons/TableEditIcon";
import { formatPrice } from "@/components/molecules/formatPrice";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import { Button, Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import { formatLabel } from "@/lib/utils";
import { useRefundRequestStatusUpdate } from "@/modules/admin-section/orders/refund-request/refund-request.action";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { format } from "date-fns";
import {
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
import ApproveConfirmModal from "./modals/ApproveConfirmModal";
import AssignDeliverymanFromDetails from "./modals/AssignDeliverymanFromDetails";
import DeliverymanLocationModal from "./modals/DeliverymanLocationModal";
import OrderTrackerModal from "./modals/OrderTrackerModal";
import PaymentStatusUpdateModal from "./modals/PaymentStatusUpdateModal";
import RejectConfirmModal from "./modals/RejectConfirmModal";
import ShowFileModal from "./modals/ShowFileModal";
import ShowNoteModal from "./modals/ShowNoteModal";
import StatusUpdateModal from "./modals/StatusUpdateModal";

const OrdersDetailsCard = ({ data, refetch, ID }: any) => {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const OrderDetails = data?.order_data;
  const RefundOrder = data?.refund;
  const OrderTrackingTime = data?.order_tracking || [];
  const OrderPaymentTrackingTime = data?.order_payment_tracking || [];
  const OrderRefundTrackingTime = data?.order_refund_tracking || [];
  const OrderSummary = data?.order_summary;
  const { currency } = useCurrencyQuery({});
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
    additional_charge_amount,
    additional_charge_name,
  } = OrderDetails || {};

  const [isLoading, setIsLoading] = useState(false);
  const handleClickStore = (e: React.MouseEvent) => {
    const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

    if (!isNewTab) {
      setIsLoading(true);
    }

    const chatTarget = {
      receiver_id: OrderDetails?.store_details?.id,
      receiver_type: OrderDetails?.store_details?.type,
    };
    localStorage.setItem("chat_target", JSON.stringify(chatTarget));
    const url = `${Routes.adminChatManage}`;
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(url, "_blank");
    } else {
      router.push(url);
    }
  };
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

  const {
    name = "Unknown",
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
    localStorage.setItem("chat_target", JSON.stringify(chatTarget));
    const url = `${Routes.adminChatManage}`;
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(url, "_blank");
    } else {
      router.push(url);
    }
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const totalStars = 5;

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

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <div dir={dir} className="grid 2xl:grid-cols-3 grid-cols-1 gap-4">
        <div className="2xl:col-span-2 space-y-4">
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
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
                  <OrderTrackerModal
                    trigger={
                      <Button
                        variant="outline"
                        className="border border-blue-500 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 p-2"
                      >
                        <span className="mr-2">{t("orders.track_order")}</span>
                        <span className="text-white bg-blue-500 hover:bg-opacity-80 p-1 rounded">
                          <MapPinned width={16} height={16} />
                        </span>
                      </Button>
                    }
                    refetch={refetch}
                    row={OrderDetails}
                    CurrencyData={CurrencyData}
                    OrderTrackingTime={OrderTrackingTime}
                  />
                  <StatusUpdateModal
                    trigger={
                      <Button
                        variant="outline"
                        disabled={
                          OrderDetails?.status === "delivered" ||
                          OrderDetails?.status === "cancelled"
                        }
                        className="border border-yellow-500 bg-yellow-50 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 p-2"
                      >
                        <span className="mr-2">
                          {t("orders.change_status")}
                        </span>
                        <span className="text-white bg-yellow-500 hover:bg-opacity-80 p-1 rounded">
                          <TableEditIcon />
                        </span>
                      </Button>
                    }
                    refetch={refetch}
                    row={OrderDetails}
                  />
                  <PaymentStatusUpdateModal
                    trigger={
                      <Button
                        variant="outline"
                        disabled={
                          OrderDetails?.status === "delivered" ||
                          OrderDetails?.status === "cancelled" ||
                          OrderDetails?.payment_status === "paid"
                        }
                        className="border border-cyan-500 bg-cyan-50 text-cyan-500 hover:bg-cyan-100 hover:text-cyan-600 p-2"
                      >
                        <span className="mr-2">
                          {t("orders.change_payment_status")}
                        </span>
                        <span className="text-white bg-cyan-500 hover:bg-opacity-80 p-1 rounded">
                          <TableEditIcon />
                        </span>
                      </Button>
                    }
                    refetch={refetch}
                    row={OrderDetails}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">
                    {t("orders.order_amount")} :
                  </span>
                  <span className="mt-1 text-sm font-semibold text-gray-500 dark:text-white ">
                    {order_amount
                      ? formatPrice(order_amount, CurrencyData)
                      : order_amount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">
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
                  <span className="text-base font-semibold">
                    {t("orders.payment_getway")} :
                  </span>
                  <span className="rounded p-2 text-sm font-semibold text-gray-500 bg-gray-100">
                    {order_master?.payment_gateway &&
                      formatLabel(order_master?.payment_gateway || "", "_")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">
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
                  <span className="text-base font-semibold">
                    {t("orders.order_date")} :
                  </span>
                  <span className="text-sm font-semibold text-gray-500 dark:text-white mt-1 ">
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
                      : 0}
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
                      : 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">
                    {t("orders.deliveryman_commission")} :
                  </span>
                  <span className=" text-sm font-semibold text-gray-500 dark:text-white mt-1">
                    {OrderDetails?.deliveryman_amount
                      ? formatPrice(
                          OrderDetails?.deliveryman_amount,
                          CurrencyData
                        )
                      : 0}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">
                    {t("orders.admin_deliveryman_commission")} :
                  </span>
                  <span className=" text-sm font-semibold text-gray-500 dark:text-white mt-1">
                    {OrderDetails?.deliveryman_charge_admin_commission
                      ? formatPrice(
                          OrderDetails?.deliveryman_charge_admin_commission,
                          CurrencyData
                        )
                      : 0}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">
                    {t("orders.additional_charge_store_amount")} :
                  </span>
                  <span className=" text-sm font-semibold text-gray-500 dark:text-white mt-1">
                    {OrderDetails?.additional_charge_store_amount
                      ? formatPrice(
                          OrderDetails?.additional_charge_store_amount,
                          CurrencyData
                        )
                      : 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">
                    {t("orders.admin_additional_charge_commission")} :
                  </span>
                  <span className=" text-sm font-semibold text-gray-500 dark:text-white mt-1">
                    {OrderDetails?.admin_additional_charge_commission
                      ? formatPrice(
                          OrderDetails?.admin_additional_charge_commission,
                          CurrencyData
                        )
                      : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0 w-full">
              <div className="grid grid-cols-5 p-4 shadow-custom text-md font-bold">
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
                        line_total_price_with_qty,
                        variant_details,
                        product_image_url,
                      } = singleOrder;
                      return (
                        <div key={index}>
                          <div className="grid grid-cols-5 p-2 py-4">
                            <div className="col-span-2 flex items-center gap-2">
                              <div>
                                <div className="relative w-[80px] h-[60px]">
                                  {product_image_url ? (
                                    <Image
                                      loader={GlobalImageLoader}
                                      src={product_image_url}
                                      alt="product_image_url"
                                      fill
                                      sizes="320px"
                                      className="w-full h-full rounded"
                                    />
                                  ) : (
                                    <Image
                                      src="/images/no-image.png"
                                      alt="no_image"
                                      fill
                                      sizes="320px"
                                      className=" w-full h-full rounded"
                                    />
                                  )}
                                </div>
                              </div>
                              <div>
                                <h1 className="text-lg font-semibold ">
                                  {product_name}
                                </h1>

                                <div className="grid grid-cols-1 gap-1">
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
            <CardContent className="p-6 w-full">
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
                  <p>
                    {t("orders.additional_charge")}
                    <span className="px-1">({additional_charge_name})</span>
                  </p>
                  <p>{t("orders.delivery_fee")}</p>
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
                  <p>
                    {CurrencyData
                      ? formatPrice(
                          OrderSummary?.additional_charge,
                          CurrencyData
                        )
                      : OrderSummary?.additional_charge}
                  </p>
                  <p>
                    {CurrencyData
                      ? formatPrice(OrderSummary?.shipping_charge, CurrencyData)
                      : OrderSummary?.shipping_charge}
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
              <CardContent className="p-6 w-full">
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
                <div className="flex items-center gap-2 mt-4">
                  <ApproveConfirmModal
                    trigger={
                      <Button
                        disabled={
                          status == "approved" ||
                          status == "refunded" ||
                          status == "rejected"
                        }
                        variant="outline"
                        className="app-button"
                      >
                        <RequestCancelIcon />{" "}
                        <span className="mx-1">
                          {t("button.approve_request")}
                        </span>
                      </Button>
                    }
                    onSave={() => handleSingleApprove(RefundOrder?.id)}
                    loading={loading}
                    title={t("orders.approve_request_title")}
                    subTitle={t("orders.approve_request_subtitle")}
                  />
                  <RejectConfirmModal
                    trigger={
                      <Button
                        disabled={
                          status == "approved" ||
                          status == "refunded" ||
                          status == "rejected"
                        }
                        variant="outline"
                        className="app-delete-button"
                      >
                        <RequestCancelIcon />{" "}
                        <span className="mx-1">
                          {t("button.reject_request")}
                        </span>
                      </Button>
                    }
                    onSave={(reason: string) =>
                      handleSingleReject(RefundOrder?.id, reason)
                    }
                    loading={loading}
                  />
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-6 w-full">
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
          <Card>
            <CardContent className="p-6 w-full">
              <div className="flex items-start justify-between ">
                <div className="flex items-center gap-2">
                  <Truck width={24} height={24} className="mt-1" />
                  <h2 className="text-lg md:text-2xl font-medium">
                    {t("orders.delivery_info")}
                  </h2>
                </div>
              </div>
              <div className="p-2">
                <div className="space-y-3 px-6 text-sm font-semibold text-gray-500 dark:text-white">
                  <p className="">
                    {t("orders.delivery_type")} :{" "}
                    {OrderDetails?.delivery_type &&
                      formatLabel(OrderDetails?.delivery_type || "", "_")}
                  </p>
                  {shipping_charge && (
                    <p className="">
                      {t("orders.charge")}:{" "}
                      <span className="px-1">
                        {" "}
                        {CurrencyData
                          ? formatPrice(shipping_charge, CurrencyData)
                          : shipping_charge}
                      </span>
                    </p>
                  )}
                  {OrderDetails?.delivery_time && (
                    <p>
                      {t("orders.delivery_time")} :
                      <span className="rounded px-2 py-1 text-sm font-normal text-gray-500 dark:text-white bg-gray-100">
                        {OrderDetails?.delivery_time}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 w-full">
              <div className="flex items-start justify-between ">
                <div className="flex items-center gap-2">
                  <UserCircle width={24} height={24} className="mt-1" />
                  <h2 className="text-lg md:text-2xl font-medium">
                    {t("orders.deliveryman_info")}
                  </h2>
                </div>
                {OrderDetails?.deliveryman && (
                  <Button
                    variant="outline"
                    className="border border-slate-300 bg-blue-50 text-black  p-2 text-sm font-semibold"
                    onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                      handleClickDeliveryman(e)
                    }
                  >
                    <MessageSquareMore width={16} height={16} />{" "}
                    <span className="ml-1"> {t("button.chat")}</span>
                  </Button>
                )}
              </div>
              <div className="p-2">
                {OrderDetails?.deliveryman ? (
                  <>
                    <div className="space-y-2 px-6 text-sm font-semibold text-gray-500 dark:text-white">
                      <p className="capitalize">
                        {t("orders.name")} : {name}
                      </p>
                      {delPhone && (
                        <p className="">
                          {t("orders.contact")} : {delPhone}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-500 gap-1">
                          {[...Array(totalStars)].map((_, index) => {
                            let fillPercentage = 0;
                            if (index < fullStars) {
                              fillPercentage = 100;
                            } else if (index === fullStars && hasHalfStar) {
                              fillPercentage = 50;
                            }
                            return (
                              <ReviewIcon
                                key={index}
                                fillPercentage={fillPercentage}
                              />
                            );
                          })}
                        </div>
                        <span className="text-gray-600 dark:text-white text-sm">
                          {rating && Number(rating).toFixed(2)} ({review_count}{" "}
                          {t("orders.reviews")})
                        </span>
                      </div>
                    </div>
                    <div className="w-full mt-4">
                      <DeliverymanLocationModal
                        trigger={
                          <Button
                            variant="outline"
                            className="w-full border border-blue-500 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 p-2"
                          >
                            <span>
                              <MapPin width={16} height={16} />
                            </span>
                            <span className="mx-1">{t("orders.location")}</span>
                          </Button>
                        }
                        refetch={refetch}
                        row={OrderDetails}
                        CurrencyData={CurrencyData}
                      />
                    </div>
                  </>
                ) : (
                  <div className="mt-1 ">
                    <AssignDeliverymanFromDetails
                      trigger={
                        <Button
                          disabled={
                            OrderDetails?.confirmed_by ||
                            OrderDetails?.status === "pending" ||
                            OrderDetails?.status === "confirmed" ||
                            OrderDetails?.status === "shipped" ||
                            OrderDetails?.status === "cancelled" ||
                            OrderDetails?.status === "delivered"
                          }
                          className="mt-2 p-2 bg-blue-500 hover:bg-blue-700 text-white rounded w-full"
                        >
                          {t("orders.assign_delivery_man")}
                        </Button>
                      }
                      row={OrderDetails}
                      refetch={refetch}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 w-full">
              <div className="flex items-start justify-between ">
                <div className="flex items-center gap-2">
                  <UserCircle width={24} height={24} className="mt-1" />
                  <h2 className="text-lg md:text-2xl font-medium">
                    {t("orders.store_info")}
                  </h2>
                </div>
                {OrderDetails?.store_details?.live_chat && (
                  <Button
                    variant="outline"
                    className="border border-slate-300 bg-blue-50 text-black  p-2 text-sm font-semibold"
                    onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                      handleClickStore(e)
                    }
                  >
                    <MessageSquareMore width={16} height={16} />{" "}
                    <span className="ml-1">{t("button.chat")}</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4 ">
                <div className="relative w-[40px] h-[40px]">
                  <Image
                    loader={GlobalImageLoader}
                    src={
                      OrderDetails?.store_details?.logo ??
                      "/images/no-image.png"
                    }
                    alt="logo"
                    fill
                    sizes="160px"
                    className="w-full h-full rounded-full"
                  />
                </div>
                <div className="">
                  <h1 className="text-lg font-semibold ">
                    {OrderDetails?.store_details?.name}
                  </h1>
                  <p className="flex items-center gap-1 text-black dark:text-white text-sm font-medium mt-1">
                    <Phone width={16} height={16} />
                    <span className="text-gray-500 dark:text-white">
                      {" "}
                      {OrderDetails?.store_details?.phone}
                    </span>
                  </p>
                  <p className="flex items-center gap-1 text-black dark:text-white text-sm font-medium mt-1">
                    <Mail width={16} height={16} />
                    <span className="text-gray-500 dark:text-white">
                      {" "}
                      {OrderDetails?.store_details?.email}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrdersDetailsCard;
