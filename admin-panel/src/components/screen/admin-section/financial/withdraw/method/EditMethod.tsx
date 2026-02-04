"use client";
import TicketIcon from "@/assets/icons/TicketIcon";
import Loader from "@/components/molecules/Loader";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CreateOrUpdateMethodForm from "@/components/blocks/admin-section/financial/withdraw/method/CreateOrUpdateMethodForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useMethodQueryById } from "@/modules/admin-section/financial/withdraw/method/method.action";
import { useAppSelector } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const EditMethod = ({ ID }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { Method, refetch, isPending } = useMethodQueryById(ID);
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
    <div className="space-y-4">
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="flex flex-col md:flex-row justify-start md:justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2 mb-4 md:mb-0">
            <TicketIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("common.edit_method")}
            </h1>
          </div>
          <div className="flex items-start">
            <p className="text-sm font-semibold text-blue-500 bg-blue-100 py-2 px-6 rounded dark:text-[#93c5fd] dark:bg-[#1e3a8a]  flex items-center gap-2">
              <Link
                className="text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white"
                href={Routes.MethodList}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                {t("link.all_method")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {isPending || !Method ? (
        <CardSkletonLoader />
      ) : (
        <>
          <CreateOrUpdateMethodForm data={Method} ID={ID} />
        </>
      )}
    </div>
  );
};

export default EditMethod;
