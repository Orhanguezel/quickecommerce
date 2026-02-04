"use client";

import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CreateOrUpdateCategoryForm from "@/components/blocks/admin-section/category/CreateOrUpdateCategoryForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { Layers3 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

function withLocalePath(path: string, locale: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const prefix = `/${locale}`;
  if (p === prefix || p.startsWith(`${prefix}/`)) return p;
  return `${prefix}${p}`;
}

const AddCategory = () => {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  const allCategoryHref = withLocalePath(Routes.categories, locale);

  return (
    <div>
      <LoaderOverlay isLoading={isLoading} />

      <Card>
        <CardContent className="flex flex-col md:flex-row justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2 mb-4 md:mb-0">
            <Layers3 />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("common.add_category")}
            </h1>
          </div>

          <div className="flex">
            <Link
              href={allCategoryHref}
              className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2"
              onClick={(e) => {
                const isNewTab = e.metaKey || e.ctrlKey || (e as any).button === 1;
                if (!isNewTab) setIsLoading(true);
              }}
            >
              {t("common.all_category")}
            </Link>
          </div>
        </CardContent>
      </Card>

      <CreateOrUpdateCategoryForm />
    </div>
  );
};

export default AddCategory;
