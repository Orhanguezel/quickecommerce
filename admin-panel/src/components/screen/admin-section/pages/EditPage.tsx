// ===============================================
// File: src/components/screen/admin-section/pages/EditPage.tsx
// ===============================================

"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui";
import Link from "next/link";
import { Routes } from "@/config/routes";
import PageForm from "@/components/blocks/admin-section/pages/PageForm";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/redux/hooks";
import { usePagesQueryById } from "@/modules/admin-section/pages/pages.action";
import AddToCardIcon from "@/assets/icons/AddToCardIcon";
import Loader from "@/components/molecules/Loader";
import AboutSettingsForm from "@/components/blocks/admin-section/system-management/page-settings/about-settings/AboutSettingsForm";
import ContactSettingsForm from "@/components/blocks/admin-section/system-management/page-settings/contact-settings/ContactSettingsForm";
import BecomeSellerForm from "@/components/blocks/admin-section/system-management/page-settings/become-seller/BecomeSellerForm";
import { usePathname } from "next/navigation";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const EditPage = ({ ID }: any) => {
  const t = useTranslations();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { PageGetByID, refetch, isPending } = usePagesQueryById(ID);
  const [finalData, setFinalData] = useState<any>(null);

  const PageSlug = finalData?.data?.slug;

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
    if (PageGetByID && !isPending) {
      setFinalData(PageGetByID);
    }
  }, [PageGetByID, isPending]);

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
    <div>
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="flex justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <AddToCardIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.edit_page")}
            </h1>
          </div>
          <div className="flex">
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={Routes.pages}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                {t("label.pages")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {isPending || !finalData ? (
        <CardSkletonLoader />
      ) : (
        <>
          {PageSlug == "about" ? (
            <AboutSettingsForm data={finalData} />
          ) : PageSlug == "contact" ? (
            <ContactSettingsForm data={finalData} />
          ) : PageSlug == "become-a-seller" ? (
            <BecomeSellerForm data={finalData} />
          ) : (
            <PageForm data={finalData} />
          )}
        </>
      )}
    </div>
  );
};

export default EditPage;
