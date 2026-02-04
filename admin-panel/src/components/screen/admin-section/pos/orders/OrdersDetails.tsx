"use client";
import StoreIcon from "@/assets/icons/StoreIcon";
import OrdersDetailsCard from "@/components/blocks/admin-section/pos/orders/OrdersDetailsCard";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";
import Loader from "@/components/molecules/Loader";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import { Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useOrdersQueryById } from "@/modules/admin-section/pos/orders/orders.action";
import { useAppSelector } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const OrdersDetails = ({ ID }: any) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const storeID = selectedStore?.id ?? "";
  const { SellerOrderDetails, refetch, isPending } = useOrdersQueryById(ID);
  const [isLoading, setIsLoading] = useState(false);
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
  useEffect(() => {
    if (isRefetch) {
      refetch();
    }
  }, [isRefetch, refetch]);
  if (!ID) {
    return (
      <div className="mt-10">
        <h1 className="text-xl text-red-500">{t("common.invalid_id")}</h1>
      </div>
    );
  }

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <Card className="mb-4">
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <StoreIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("orders.order_details")}
            </h1>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={SellerRoutes.ordersList}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                {t("orders.all_orders")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {isPending || !SellerOrderDetails ? (
        <CardSkletonLoader />
      ) : (
        <OrdersDetailsCard
          data={SellerOrderDetails}
          refetch={refetch}
          ID={ID}
        />
      )}
    </>
  );
};

export default OrdersDetails;
