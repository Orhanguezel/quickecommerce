"use client";
import AboutSettingsForm from "@/components/blocks/admin-section/system-management/page-settings/about-settings/AboutSettingsForm";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";
import { Card, CardContent } from "@/components/ui";
import { usePageSettingsAboutQuery } from "@/modules/admin-section/system-management/page-settings/page-settings.action";
import { useTranslations } from "next-intl";

const AboutSettings = () => {
  const t = useTranslations();
  const { AboutSettingsData, isPending } = usePageSettingsAboutQuery({});

  return (
    <div>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-blue-500 flex items-center gap-2">
              {t("label.about_settings")}
            </h1>
          </div>
        </CardContent>
      </Card>
      {isPending ? <CardSkletonLoader /> : <AboutSettingsForm data={AboutSettingsData} />}
    </div>
  );
};

export default AboutSettings;
