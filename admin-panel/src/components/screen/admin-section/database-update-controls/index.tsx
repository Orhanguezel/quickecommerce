"use client";
import DatabaseUpdateControlsForm from "@/components/blocks/admin-section/database-update-controls/DatabaseUpdateControlsForm";
import { Card, CardContent } from "@/components/ui";
import { useTranslations } from "next-intl";

const DatabaseUpdateControls = () => {
  const t = useTranslations()
  return (
    <div>
      <Card >
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-blue-500 flex items-center gap-2">
            {t("label.database_update_controls")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <DatabaseUpdateControlsForm />
    </div>
  );
};

export default DatabaseUpdateControls;
