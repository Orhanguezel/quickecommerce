// =============================================================
// FILE: src/components/screen/admin-section/products/EditProduct.tsx
// FINAL — standard edit screen wrapper
// =============================================================

"use client";

import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CreateOrUpdateProductForm from "@/components/blocks/admin-section/products/CreateOrUpdateProductForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useProductQueryById } from "@/modules/admin-section/products/product.action";
import { useAppSelector } from "@/redux/hooks";
import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const EditProduct = ({ ID }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { product, isPending, refetch } = useProductQueryById(ID);
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isRefetch) refetch();
  }, [isRefetch, refetch]);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

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
      <div>
        <Card>
          <CardContent className="flex flex-col md:flex-row justify-between p-2 md:p-4">
            <div className="flex items-start md:items-center justify-start md:justify-center gap-2 py-2 md:py-0">
              <PackageSearch />
              <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
                {t("common.edit_product")}
              </h1>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
                <Link
                  href={Routes.productList}
                  onClick={(e) => {
                    const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;
                    if (!isNewTab) setIsLoading(true);
                  }}
                >
                  {t("link.all_product")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {isPending || !product || Object.keys(product).length === 0 ? (
          <CardSkletonLoader />
        ) : (
          <CreateOrUpdateProductForm data={product} />
        )}
      </div>
    </>
  );
};

export default EditProduct;
