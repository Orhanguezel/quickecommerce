"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CashCollectTable from "@/components/blocks/admin-section/financial/cash-collect/CashCollectTable";
import { Button, Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CashCollect = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
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
        <CardContent
          dir={dir}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 md:p-4"
        >
          <div className="col-span-1">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <DollarSign /> {t("label.collect_cash")}
            </h1>
          </div>
          <div className="colo-span-1 flex items-center gap-2 justify-start md:justify-end">
            <Link href={Routes.addCashCollect}>
              <Button
                variant="outline"
                className="app-button"
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                + {t("button.add_cash")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <CashCollectTable />
    </>
  );
};

export default CashCollect;
