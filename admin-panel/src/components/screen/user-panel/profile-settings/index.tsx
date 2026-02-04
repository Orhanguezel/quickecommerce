"use client";
import ProfileSettingsForm from "@/components/blocks/users-section/profile-settings/ProfileSettingsForm";
import { Card, CardContent } from "@/components/ui";
import { useTranslations } from "next-intl";

const ProfileSettings = () => {
  const t = useTranslations();
  return (
    <div>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.profile_settings")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <>
        <ProfileSettingsForm />
      </>
    </div>
  );
};

export default ProfileSettings;
