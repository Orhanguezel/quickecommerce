"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import { AppSelect } from "@/components/blocks/common";
import SupportTicketTable from "@/components/blocks/seller-section/store/support-ticket/SupportTicketTable";
import { Button, Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useDepartmentQuery } from "@/modules/common/department/department.action";
import { HelpingHand } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const SupportTicket = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [selectPaymentStatus, setSelectPaymentStatus] = useState<string>("");
  const [selectPayment2Status, setSelectPayment2Status] = useState<string>("");
  const [selectStatus, setSelectStatus] = useState<string>("");
  const priorityList = [
    { label: t("common.urgent"), value: "urgent" },
    { label: t("common.high"), value: "high" },
    { label: t("common.medium"), value: "medium" },
    { label: t("common.low"), value: "low" },
  ];
  const statusList = [
    { label: t("common.active"), value: "1" },
    { label: t("common.resolved"), value: "0" },
  ];

  const { DepartmentList } = useDepartmentQuery({});
  let DepartmentListData = (DepartmentList as any)?.data || [];

  const handleSelectStatus = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectStatus("");
    } else {
      setSelectStatus(newSelectStatus);
    }
  };
  const handlePaymentStatus = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectPaymentStatus("");
    } else {
      setSelectPaymentStatus(newSelectOwner);
    }
  };
  const handlePayment2Status = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectPayment2Status("");
    } else {
      setSelectPayment2Status(newSelectOwner);
    }
  };
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

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="flex flex-col xl:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <HelpingHand /> {t("common.support_ticket")}
            </h1>
          </div>
          <div className="flex flex-col xl:flex-row gap-2 items-start xl:items-center md:gap-4 w-full xl:w-auto">
            <div className="flex flex-col md:flex-row gap-2 items-center w-full xl:w-auto">
              <AppSelect
                placeholder={t("place_holder.select_status")}
                value={String(selectStatus)}
                onSelect={handleSelectStatus}
                groups={statusList}
                customClass="w-full xl:w-40"
              />
              <AppSelect
                placeholder={t("place_holder.select_priority")}
                value={String(selectPaymentStatus)}
                onSelect={handlePaymentStatus}
                groups={priorityList}
                customClass="mx-0 mmd:mx-2 w-full xl:w-48"
              />
              <AppSelect
                placeholder={t("place_holder.select_department")}
                value={String(selectPayment2Status)}
                onSelect={handlePayment2Status}
                groups={DepartmentListData}
                customClass="w-full xl:w-48"
              />
            </div>

            <Link
              href={SellerRoutes.addSupportTicket}
              onClick={(e) => {
                const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                if (!isNewTab) {
                  setIsLoading(true);
                }
              }}
            >
              <Button variant="outline" className="app-button">
                + {t("common.add_support_ticket")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <SupportTicketTable
        selectStatus={selectStatus}
        selectPaymentStatus={selectPaymentStatus}
        selectPayment2Status={selectPayment2Status}
      />
    </>
  );
};

export default SupportTicket;
