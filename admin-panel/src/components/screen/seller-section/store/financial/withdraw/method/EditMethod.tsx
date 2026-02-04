"use client";
import TicketIcon from "@/assets/icons/TicketIcon";
import Loader from "@/components/molecules/Loader";
import CreateOrUpdateMethodForm from "@/components/blocks/admin-section/financial/withdraw/method/CreateOrUpdateMethodForm";
import CreateOrUpdateSupportTicketForm from "@/components/blocks/admin-section/support-ticket/CreateOrUpdateSupportTicketForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useMethodQueryById } from "@/modules/admin-section/financial/withdraw/method/method.action";
import { useSupportTicketQueryById } from "@/modules/admin-section/support-ticket/support-ticket.action";
import { useAppSelector } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const EditMethod = ({ ID }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { Method, refetch, isPending } = useMethodQueryById(ID);

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
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <TicketIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("common.edit_method")}
            </h1>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link className="" href={Routes.MethodList}>
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
