"use client";
import Loader from "@/components/molecules/Loader";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CreateOrUpdateSupportTicketForm from "@/components/blocks/seller-section/store/support-ticket/CreateOrUpdateSupportTicketForm";
import { Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useSupportTicketQueryById } from "@/modules/seller-section/support-ticket/support-ticket.action";
import { useAppSelector } from "@/redux/hooks";
import { HelpingHand } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const EditSupportTicket = ({ ID }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { SupportTicket, refetch, isPending } = useSupportTicketQueryById(ID);
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
    <>
      <LoaderOverlay isLoading={isLoading} />

      <div className="space-y-4">
        <Card>
          <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
            <div className="flex items-center justify-start md:justify-center gap-2">
              <HelpingHand />
              <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
                {t("common.edit_support_ticket")}
              </h1>
            </div>
            <div className="flex">
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
        {isPending || !SupportTicket ? (
          <CardSkletonLoader />
        ) : (
          <>
            <CreateOrUpdateSupportTicketForm data={SupportTicket} ID={ID} />
          </>
        )}
      </div>
    </>
  );
};

export default EditSupportTicket;
