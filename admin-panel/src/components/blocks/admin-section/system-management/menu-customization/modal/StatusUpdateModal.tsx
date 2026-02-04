import { AppModal } from "@/components/blocks/common/AppModal";
import { Card, Input } from "@/components/ui";
import { useMenuPositionChange } from "@/modules/admin-section/system-management/menu-customization/menu-customization.action";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
}) => {
  const t = useTranslations();
  const [menuOrder, setMenuOrder] = useState(row?.position);
  const { mutate: updateStoreStatus } = useMenuPositionChange();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMenuOrder = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setMenuOrder(value);
  };

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      id: row.id,
      position: menuOrder,
    };
    const submissionData = {
      ...defaultData,
    };
    updateStoreStatus(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
          setIsModalOpen(false);
        },
        onError: (error: any) => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel="Confirm"
      IsLoading={loading}
      onSave={handleSave}
      customClass="lg:inset-x-40p md:inset-x-40p lg:top-[250px] md:top-[250px] top-[200px]"
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <div className="text-start ">
        <h1 className="text-xl font-semibold mt-4">Order Update </h1>
        <Card className="p-2 md:p-4 mt-4">
          <p className="text-gray-500 dark:text-white mb-2">Order</p>
          <div className="flex flex-col gap-2 items-start">
            <Input
              id="menu_order"
              type="number"
              min={0}
              defaultValue={menuOrder ?? ""}
              className="app-input"
              placeholder="Enter menu order.."
              onChange={(e) => {
                handleMenuOrder(e);
              }}
            />
          </div>
        </Card>
      </div>
    </AppModal>
  );
};

export default StatusUpdateModal;
