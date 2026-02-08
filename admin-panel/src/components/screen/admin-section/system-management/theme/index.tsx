"use client";

import ThemeTable from "@/components/blocks/admin-section/system-management/theme/ThemeList";
import { Card, CardContent } from "@/components/ui";
import { useTranslations } from "next-intl";

const ThemeSettings = () => {
  const t = useTranslations("theme");

  return (
    <>
      <Card className="min-h-[calc(100vh-12rem)]">
        <CardContent className="p-2 md:p-6 ">
          <div className="space-y-2 mb-4 md:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("title")}
            </h1>
            <p className="text-sm font-semibold text-gray-500 dark:text-white flex items-center gap-2">
              {t("description")}
            </p>
          </div>

          <div className="mt-6 ">
            <ThemeTable />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ThemeSettings;
