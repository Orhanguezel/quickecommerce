"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CreateOrUpdateProductForm from "@/components/blocks/seller-section/store/products/CreateOrUpdateProductForm";
import { Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AddProduct = () => {
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
    <>
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="flex flex-col md:flex-row justify-between p-2 md:p-4">
          <div className="flex items-start md:items-center justify-start md:justify-center gap-2 py-2 md:py-0">
            <PackageSearch />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white">
              {t("common.add_product")}
            </h1>
          </div>
          <div className="flex">
            <p className="text-sm font-semibold text-blue-500 bg-blue-100 py-2 px-6 rounded dark:text-[#93c5fd] dark:bg-[#1e3a8a]  flex items-center gap-2">
              <Link
                className="text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white"
                href={SellerRoutes.productList}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                {t("link.all_product")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <CreateOrUpdateProductForm />
    </>
  );
};

export default AddProduct;
