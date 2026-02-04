"use client";
import ContactSettingsForm from "@/components/blocks/admin-section/system-management/page-settings/contact-settings/ContactSettingsForm";
import { Card, CardContent } from "@/components/ui";
import { useTranslations } from "next-intl";

const ContactSettings = () => {
  const t = useTranslations();
  return (
    <div>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-blue-500 flex items-center gap-2">
              {t("label.contact_settings")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <ContactSettingsForm />
    </div>
  );
};

export default ContactSettings;
