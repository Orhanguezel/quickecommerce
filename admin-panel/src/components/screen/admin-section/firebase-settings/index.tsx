"use client";
import FirebaseSettingsForm from "@/components/blocks/admin-section/firebase-settings/FirebaseSettingsForm";
import { Card, CardContent } from "@/components/ui";
import { useTranslations } from "next-intl";

const FirebaseSettings = () => {
  const t = useTranslations()
  return (
    <div>
      <Card >
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-blue-500 flex items-center gap-2">
               {t("label.firebase_settings")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <FirebaseSettingsForm />
    </div>
  );
};

export default FirebaseSettings;
