"use client";

import SiteMapSettingsForm from "@/components/blocks/admin-section/system-management/sitemap-settings/SiteMapSettingsForm";
import { Card, CardContent } from "@/components/ui";
import { MapIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const SiteMapSettings = () => {
  const t = useTranslations()

  return (
    <>
      <Card className="">
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <MapIcon /> {t("label.sitemap_settings")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-lg border-none mt-6 ">
        <CardContent className="p-6">
          <SiteMapSettingsForm />
        </CardContent>
      </Card>
    </>
  );
};

export default SiteMapSettings;
