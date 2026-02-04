import { AppSelect } from "@/components/blocks/common";
import { AppModal } from "@/components/blocks/common/AppModal";
import {
  useDeliverymanListQuery,
  useDeliverymanAssign
} from "@/modules/admin-section/orders/orders.action";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface DeliverymanAssignModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}

const DeliverymanAssignModal: React.FC<DeliverymanAssignModalProps> = ({
  trigger,
  refetch,
  row,
}) => {
  const t = useTranslations();
  const [selectDeliveryman, setSelectDeliveryman] = useState<string>("");
  const { DeliverymanList } = useDeliverymanListQuery({});
  const deliveryman = (DeliverymanList as any)?.data || [];
  const handleDeliveryman = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectDeliveryman("");
    } else {
      setSelectDeliveryman(newSelectOwner);
    }
  };
  const { mutate: updateStoreStatus } = useDeliverymanAssign();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      order_id: row.id,
      delivery_man_id: selectDeliveryman,
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
      actionButtonLabel={t("common.assign")}
      IsLoading={loading}
      onSave={handleSave}
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[250px] md:top-[250px] top-[200px]"
      isOpen={isModalOpen} // Bind modal open state
      onOpenChange={setIsModalOpen}
    >
      <div className="text-start ">
        <h1 className="text-xl font-bold text-blue-500 mb-4">
          {t("common.deliveryman_assign_modal")}
        </h1>
        <div className="p-4 min-h-[200px]">
          <p className="text-gray-500 dark:text-white mb-2">
            {t("common.select_deliveryman_and_assign")}
          </p>

          <AppSelect
            placeholder={t("place_holder.select_deliveryman")}
            value={String(selectDeliveryman)}
            onSelect={handleDeliveryman}
            groups={deliveryman}
          />
        </div>
      </div>
    </AppModal>
  );
};

export default DeliverymanAssignModal;
