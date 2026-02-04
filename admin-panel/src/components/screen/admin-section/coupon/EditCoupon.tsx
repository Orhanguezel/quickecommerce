"use client";
import Loader from "@/components/molecules/Loader";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CreateOrUpdateCouponForm from "@/components/blocks/admin-section/coupon/CreateOrUpdateCouponForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useCouponQueryById } from "@/modules/admin-section/coupon/coupon.action";
import { useAppSelector } from "@/redux/hooks";
import { TicketPercent } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const EditCoupon = ({ ID }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { coupon, refetch, isPending } = useCouponQueryById(ID);
  const pathname = usePathname();
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
    <div>
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="flex justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <TicketPercent />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.edit_coupon")}
            </h1>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={Routes.couponList}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                {t("label.coupon")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {isPending || !coupon ? (
        <CardSkletonLoader />
      ) : (
        <Card className="rounded-lg border-none mt-6 ">
          <CardContent className="p-6">
            <CreateOrUpdateCouponForm data={coupon} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EditCoupon;
