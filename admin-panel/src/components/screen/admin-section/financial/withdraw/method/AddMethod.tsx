"use client";
import TicketIcon from "@/assets/icons/TicketIcon";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CreateOrUpdateMethodForm from "@/components/blocks/admin-section/financial/withdraw/method/CreateOrUpdateMethodForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AddMethod = () => {
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

      <div className="space-y-4">
        <Card>
          <CardContent className="flex flex-col md:flex-row justify-start md:justify-between p-2 md:p-4">
            <div className="flex items-center justify-start md:justify-center gap-2 mb-4 md:mb-0">
              <TicketIcon />
              <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
                {t("common.add_method")}
              </h1>
            </div>
            <div className="flex items-start">
              <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
                <Link
                  className=""
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
        <>
          <CreateOrUpdateMethodForm />
        </>
      </div>
    </>
  );
};

export default AddMethod;
