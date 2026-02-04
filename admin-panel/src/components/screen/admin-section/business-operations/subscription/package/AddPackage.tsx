"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CreateOrUpdatePackageForm from "@/components/blocks/admin-section/business-operations/subscription/package/CreateOrUpdatePackageForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { TicketPercent } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
const AddPackage = () => {
  const t = useTranslations();
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
  return (
    <div className="space-y-4">
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <TicketPercent />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.add_package")}
            </h1>
          </div>
          <div className="flex">
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={Routes.packageList}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                {t("label.subscription_package")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      <div>
        <CreateOrUpdatePackageForm />
      </div>
    </div>
  );
};

export default AddPackage;
