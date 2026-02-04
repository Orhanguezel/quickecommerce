"use client";
import { Button, Card } from "@/components/ui";
import { useDatabaseUpdateControlsStoreMutation } from "@/modules/admin-section/database-update-controls/database-update-controls.action";
import { Database } from "lucide-react";
import { useTranslations } from "next-intl";
import DatabaseUpdateConfirmModal from "./modal/DatabaseUpdateConfirmModal";

const DatabaseUpdateControlsForm = () => {
  const t = useTranslations();

  const { mutate: DatabaseUpdateControls, isPending } =
    useDatabaseUpdateControlsStoreMutation();
  const onConfirmUpdate = () => {
    DatabaseUpdateControls(undefined, {
      onSuccess: () => {},
      onError: () => {},
    });
  };

  return (
    <Card className="p-2 md:p-4 mt-6">
      <div>
        <DatabaseUpdateConfirmModal
          trigger={
            <Button
              type="button"
              variant="outline"
              className="app-button flex items-center gap-2"
            >
              <Database size={18} />
              Database Update Controls
            </Button>
          }
          onSave={onConfirmUpdate}
          loading={isPending}
          title="Database Update "
          subTitle="This action will trigger a database update process. Please ensure
              all changes are verified before proceeding. Use this only when
              required."
        />
      </div>
    </Card>
  );
};

export default DatabaseUpdateControlsForm;
