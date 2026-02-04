"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import SubscriptionStoreListHistory from "@/components/blocks/admin-section/business-operations/subscription/store/history/SubscriptionStoreListHistory";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useSubscriptionStoreHistoryQueryById } from "@/modules/admin-section/business-operations/subscription/package/package.action";
import { useAppSelector } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SubscriptionStoreHistory = ({ ID }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { refetch } = useSubscriptionStoreHistoryQueryById(ID);
  const pathname = usePathname();

  useEffect(() => {
    if (isRefetch) {
      refetch();
    }
  }, [isRefetch, refetch]);
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
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.store_subscription_history")}
            </h1>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={Routes.StoreSubscriptionList}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                {t("label.store_subscriptions")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      <SubscriptionStoreListHistory ID={ID} />
    </>
  );
};

export default SubscriptionStoreHistory;
