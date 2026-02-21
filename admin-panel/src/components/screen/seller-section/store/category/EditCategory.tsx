"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";
import CreateOrUpdateCategoryForm from "@/components/blocks/seller-section/store/category/CreateOrUpdateCategoryForm";
import { Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useCategoryQueryById } from "@/modules/seller-section/category/category.action";
import { useAppSelector } from "@/redux/hooks";
import { LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const EditCategory = ({ ID }: { ID: string }) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { category, refetch, isPending } = useCategoryQueryById(ID);
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
        <CardContent className="flex flex-col md:flex-row gap-4 justify-between p-2 md:p-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white">
              {t("button.update_category")}
            </h1>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded">
              <Link
                href={SellerRoutes.categoryList}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;
                  if (!isNewTab) setIsLoading(true);
                }}
              >
                {t("label.category")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {isPending ? (
        <CardSkletonLoader />
      ) : (
        <CreateOrUpdateCategoryForm data={category} />
      )}
    </>
  );
};

export default EditCategory;
