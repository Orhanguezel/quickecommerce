"use client";
import TicketIcon from "@/assets/icons/TicketIcon";
import SupportTicketDetailsCard from "@/components/blocks/seller-section/store/support-ticket/SupportTicketDetailsCard";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";
import Loader from "@/components/molecules/Loader";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import { Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useSupportTicketDetailsById } from "@/modules/seller-section/support-ticket/support-ticket.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SupportTicketDetails = ({ ID }: any) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id || "";
  const { SupportTicketDetails, refetch, isPending } =
    useSupportTicketDetailsById(ID, store_id);
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
      <LoaderOverlay isLoading={isLoading} />
      <Card className="mb-4">
        <CardContent
          dir={dir}
          className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4"
        >
          <div className="flex items-center justify-start md:justify-center gap-2">
            <TicketIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("common.ticket_details")}
            </h1>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={SellerRoutes.supportTicketList}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
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
        <SupportTicketDetailsCard
          data={SupportTicketDetails}
          ID={ID}
          refetch={refetch}
        />
      )}
    </>
  );
};

export default SupportTicketDetails;
