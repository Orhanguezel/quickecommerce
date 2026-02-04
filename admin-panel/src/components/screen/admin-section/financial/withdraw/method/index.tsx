"use client";
import AddToCardIcon from "@/assets/icons/AddToCardIcon";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import MethodTable from "@/components/blocks/admin-section/financial/withdraw/method/MethodTable";
import { Button, Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MethodList = () => {
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
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-secondary border-b-transparent rounded-full animate-spin-slow"></div>
          </div>
        </div>
      )}

      <Card>
        <CardContent
          dir={dir}
          className="grid grid-cols-1 md:grid-cols-2 p-2 md:p-4"
        >
          <div className="col-span-1 mb-4 md:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <AddToCardIcon /> {t("common.withdrawal_method")}
            </h1>
          </div>
          <div className="flex items-center gap-2 justify-start md:justify-end">
            <Link href={Routes.addMethod}>
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
                + {t("button.add_new_method")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <MethodTable />
    </>
  );
};

export default MethodList;
