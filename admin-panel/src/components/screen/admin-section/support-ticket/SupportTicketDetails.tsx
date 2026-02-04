"use client";
import TicketIcon from "@/assets/icons/TicketIcon";
import Loader from "@/components/molecules/Loader";
import SupportTicketDetailsCard from "@/components/blocks/admin-section/support-ticket/SupportTicketDetailsCard";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useSupportTicketDetailsById } from "@/modules/admin-section/support-ticket/support-ticket.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const SupportTicketDetails = ({ ID }: any) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { SupportTicketDetails, refetch, isPending } = useSupportTicketDetailsById(ID);

  useEffect(() => {
    refetch();
    dispatch(setRefetch(false));
  }, [isRefetch, refetch, dispatch]);
  if (!ID) {
    return (
      <div className="mt-10">
        <h1 className="text-xl text-red-500">{t("common.invalid_id")}</h1>
      </div>
    );
  }
  return (
    <>
      <Card className="mb-4">
        <CardContent dir={dir} className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <TicketIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
            {t("common.ticket_details")}
            </h1>
          </div>
          <div className="flex">
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={Routes.supportTicketList}
              >
                {t("link.all_support_ticket")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {isPending || !SupportTicketDetails ? (
        <CardSkletonLoader />
      ) : (
        <SupportTicketDetailsCard data={SupportTicketDetails} ID={ID} refetch={refetch} />
      )}
    </>
  );
};

export default SupportTicketDetails;
