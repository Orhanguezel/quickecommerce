"use client";

import { TotalRefundedOrderIcon } from "@/assets/icons";
import TotalCanceledOrderIcon from "@/assets/icons/TotalCanceledOrderIcon";
import TotalCompletedOrderIcon from "@/assets/icons/TotalCompletedOrderIcon";
import TotalEarningsIcon from "@/assets/icons/TotalEarningsIcon";
import TotalInProcessOrderIcon from "@/assets/icons/TotalInProcessOrderIcon";
import TotalOrderIcon from "@/assets/icons/TotalOrderIcon";
import TotalProductsIcon from "@/assets/icons/TotalProductsIcon";
import TotalQueueOrderIcon from "@/assets/icons/TotalQueueOrderIcon";
import TotalRefundIcon from "@/assets/icons/TotalRefundIcon";
import { formatPrice } from "@/components/molecules/formatPrice";
import Loader from "@/components/molecules/Loader";
import { Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import GlobalImageLoader from "@/lib/imageLoader";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useGetPermissionsQuery } from "@/modules/users/users.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/index";
import { setRefetch } from "@/redux/slices/refetchSlice";
import {
  BriefcaseBusiness,
  Clock,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Store,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CustomViewIcon } from "../../custom-icons";
import TableEdit from "../../custom-icons/TableEdit";
import TotalPosOrderEarningsIcon from "@/assets/icons/TotalPosOrderEarningsIcon";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const StoreDashboardCard = ({ data, isPending }: any) => {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const localeDir = pathname.split("/")[1];
  const dir = localeDir === "ar" ? "rtl" : "ltr";
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const storedSlug = selectedStore?.slug;
  const { refetch: permissionRefetch } = useGetPermissionsQuery({
    store_slug: storedSlug ?? "",
  });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const QueryStoreDashboardData = (data as any)?.store_details[0] || {};
  const {
    id,
    slug,
    store_type,
    name,
    phone,
    email,
    address,
    opening_time,
    logo_url,
    closing_time,
    business_plan,
    started_from,
    tax,
    tax_number,
  } = QueryStoreDashboardData;

  const { currency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  const { summary = {}, order_summary = {} } = data;
  const {
    refunds = {},
    earnings = {},
    order = {},
    pos_order_amount = {},
    product = {},
  } = summary;
  const {
    pending_orders = {},
    completed_orders = {},
    cancelled_orders = {},
    processing_orders = {},
    refunded_orders = {},
    pos_orders = {},
  } = order_summary;

  useEffect(() => {
    if (isRefetch) {
      permissionRefetch();
      dispatch(setRefetch(false));
    }
  }, [isRefetch, dispatch, permissionRefetch]);

  const [editRowId, setEditRowId] = useState<string | null>(null);
  const handleEdit = (e: any, Id: string) => {
    e.stopPropagation();
    setEditRowId(Id);
    router.push(`${SellerRoutes.editStore}/${Id}`);
  };

  return (
    <>
      {isPending ? (
        <CardSkletonLoader />
      ) : (
        <div className="space-y-4">
          <Card className="">
            <div className="">
              <div className=" rounded-t-md grid grid-cols-1 md:grid-cols-2 items-start relative py-2 md:py-6 ">
                <div className="p-4 flex flex-col md:flex-row items-start justify-start z-10 w-full">
                  <div className="relative rounded-full h-28 w-28 mx-0 md:mx-4">
                    <Image
                      loader={GlobalImageLoader}
                      src={logo_url ? logo_url : "/images/no-image.png"}
                      alt="logo_url"
                      fill
                      sizes="112px"
                      className="w-full h-full rounded-full"
                      priority
                    />
                  </div>
                  <div className="">
                    <div>
                      <h2 className="mb-4 md:mb-0 text-[20px] sm:text-[30px] font-semibold">
                        {name}
                      </h2>
                    </div>

                    {phone && (
                      <div className="flex items-center gap-2 my-3">
                        <Phone className="w-[20px] h-[19px]" />
                        <p className="text-[14px] font-normal">{phone}</p>
                      </div>
                    )}
                    {email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-[20px] h-[19px]" />
                        <p className="text-[14px] font-normal">{email}</p>
                      </div>
                    )}

                    {address && (
                      <div className="flex items-center gap-2 my-3">
                        <MapPin className="w-[20px] h-[19px]" />
                        <p className="text-[14px] font-normal">{address}</p>
                      </div>
                    )}
                    {started_from && (
                      <div className="flex font-semibold items-center gap-1 mt-4">
                        <p className="text-[14px]">
                          {t("common.started_from")}:
                        </p>
                        <p className="text-[14px]">{started_from}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={` ${
                    dir === "rtl"
                      ? "border-0 md:border-r-2"
                      : "border-0 md:border-l-2"
                  }  border-slate-300 grid grid-cols-2 md:grid-cols-3 items-start justify-start `}
                >
                  <div
                    className={` ${
                      dir === "rtl" ? "pr-4 md:pr-12" : "pl-4 md:pl-12"
                    }  py-0 md:py-6 col-span-2`}
                  >
                    <div className="w-full flex flex-col items-start justify-between">
                      <div className="w-full space-y-3">
                        {store_type && (
                          <p className="flex items-start gap-2 line-clamp-2 text-md font-normal py-2 lg:py-0">
                            <span className="bg-blue-500 text-white rounded-full p-1.5">
                              <Store width={16} height={16} />{" "}
                            </span>
                            <span>
                              {t("label.store_type")}:{" "}
                              <span className="text-gray-500 dark:text-white capitalize">
                                {" "}
                                {store_type}
                              </span>
                            </span>
                          </p>
                        )}

                        {business_plan && (
                          <p className="flex items-start gap-2 line-clamp-2 text-md font-normal">
                            <span className="bg-blue-500 text-white rounded-full p-1.5">
                              <BriefcaseBusiness width={16} height={16} />{" "}
                            </span>
                            <span>
                              {t("label.business_plan")}:{" "}
                              <span className="text-gray-500 dark:text-white capitalize">
                                {" "}
                                {business_plan}
                              </span>
                            </span>
                          </p>
                        )}

                        {tax && (
                          <p className="flex items-start gap-2 line-clamp-2 text-md font-normal py-2 lg:py-0">
                            <span className="bg-blue-500 text-white rounded-full p-1.5">
                              <DollarSign width={16} height={16} />{" "}
                            </span>
                            <span>
                              {t("label.vat_tax")}:{" "}
                              <span className="text-gray-500 dark:text-white">
                                {" "}
                                {tax} %
                              </span>
                            </span>
                          </p>
                        )}
                        {tax_number && (
                          <p className="flex items-start gap-2 line-clamp-2 text-md font-normal">
                            <span className="bg-blue-500 text-white rounded-full p-1.5">
                              <DollarSign width={16} height={16} />{" "}
                            </span>
                            <span>
                              {t("label.vat_tax_number")}:{" "}
                              <span className="text-gray-500 dark:text-white">
                                {" "}
                                {tax_number}
                              </span>
                            </span>
                          </p>
                        )}
                        {opening_time && (
                          <p className="flex items-start gap-2 line-clamp-2 text-md font-normal">
                            <span className="bg-blue-500 text-white rounded-full p-1.5">
                              <Clock width={16} height={16} />{" "}
                            </span>
                            <span>
                              {t("label.opening_closing_time")}:
                              <span className="text-gray-500 dark:text-white">
                                {" "}
                                {opening_time} to {closing_time}
                              </span>
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 md:px-6 mt-4 md:mt-0 flex  items-center justify-between">
                    <div className="flex items-start justify-start md:justify-end w-full">
                      <div className="">
                        <div onClick={(e) => handleEdit(e, id)}>
                          <TableEdit isLoading={editRowId === id} />
                        </div>
                      </div>
                      <div className="">
                        <Link
                          className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white mx-2"
                          href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/stores/details/${slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CustomViewIcon />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card className="">
            <CardContent className="p-2 md:p-6">
              <div className="mb-8">
                <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
                  {" "}
                  {t("label.store_dashboard")}
                </h1>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E5E4F7] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-3 p-6">
                    <div className=" p-2">
                      <TotalProductsIcon />
                    </div>
                    <div>
                      <div className="text-md">{product?.title}</div>
                      <div className="text-xl font-bold">{product?.count}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#EDE6F3] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-3 p-6">
                    <div className="p-2 text-[#A970DA]">
                      <TotalEarningsIcon />
                    </div>
                    <div>
                      <div className="text-md">{earnings?.title}</div>
                      <div className="text-xl font-bold">
                        {earnings?.count
                          ? formatPrice(earnings?.count, CurrencyData)
                          : earnings?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-orange-100 dark:bg-gray-700">
                  <CardContent className="flex items-center gap-3 p-6">
                    <div className="p-2 text-orange-400">
                      <TotalPosOrderEarningsIcon />
                    </div>
                    <div>
                      <div className="text-md">{pos_order_amount?.title}</div>
                      <div className="text-xl font-bold">
                        {pos_order_amount?.count
                          ? formatPrice(pos_order_amount?.count, CurrencyData)
                          : pos_order_amount?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#F3E9E9] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-3 p-6">
                    <div className="p-2 text-[#F38585]">
                      <TotalRefundIcon />
                    </div>
                    <div>
                      <div className="text-md">{refunds?.title}</div>
                      <div className="text-xl font-bold ">
                        {refunds?.count
                          ? formatPrice(refunds?.count, CurrencyData)
                          : refunds?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#EBF0E3] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-3 p-6">
                    <div className=" p-2">
                      <TotalOrderIcon />
                    </div>
                    <div>
                      <div className="text-md ">{order?.title}</div>

                      <div className="text-xl font-bold ">{order?.count}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#DEF0EE] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-3 p-6">
                    <div className="p-2 text-[#4EBCAF]">
                      <TotalCompletedOrderIcon />
                    </div>
                    <div>
                      <div className="text-md">{pos_orders?.title}</div>
                      <div className="text-xl font-bold">
                        {pos_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E7EDE3] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-3 p-6">
                    <div className="p-2 text-[#87A870]">
                      <TotalQueueOrderIcon />
                    </div>
                    <div>
                      <div className="text-md">{processing_orders?.title}</div>
                      <div className="text-xl font-bold">
                        {processing_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#DEF0EE] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-3 p-6">
                    <div className="p-2 text-[#4EBCAF]">
                      <TotalCompletedOrderIcon />
                    </div>
                    <div>
                      <div className="text-md">{completed_orders?.title}</div>
                      <div className="text-xl font-bold">
                        {completed_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E1F3E7] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-3 p-6">
                    <div className="p-2">
                      <TotalInProcessOrderIcon />
                    </div>
                    <div>
                      <div className="text-md">{pending_orders?.title}</div>
                      <div className="text-xl font-bold ">
                        {pending_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E1EDF2] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-3 p-6">
                    <div className="p-2 text-[#45A0C7]">
                      <TotalCanceledOrderIcon />
                    </div>
                    <div>
                      <div className="text-md">{cancelled_orders?.title}</div>
                      <div className="text-xl font-bold ">
                        {cancelled_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#F4F0E2] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-3 p-6">
                    <div className="p-2 text-[#E3C048]">
                      <TotalRefundedOrderIcon />
                    </div>
                    <div>
                      <div className="text-md">{refunded_orders?.title}</div>
                      <div className="text-xl font-bold ">
                        {refunded_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default StoreDashboardCard;
