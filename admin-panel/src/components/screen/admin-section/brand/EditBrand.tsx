"use client";
import Loader from "@/components/molecules/Loader";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CreateOrUpdateBrandForm from "@/components/blocks/admin-section/brand/CreateOrUpdateBrandForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useBrandQueryById } from "@/modules/admin-section/brand/brand.action";
import { useAppSelector } from "@/redux/hooks";
import { BaggageClaim } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const EditBrand = ({ ID }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { BrandByID, refetch, isPending } = useBrandQueryById(ID);
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
      <Card>
        <CardContent className="flex flex-col md:flex-row justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2 mb-4 md:mb-0">
            <BaggageClaim />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.edit_brand")}
            </h1>
          </div>
          <div className="flex">
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={Routes.brand}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                {t("label.all_brand")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {isPending || !BrandByID ? (
        <CardSkletonLoader />
      ) : (
        <Card className="mt-4 ">
          <CardContent className="p-2 md:p-4">
            <CreateOrUpdateBrandForm data={BrandByID} />
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default EditBrand;
