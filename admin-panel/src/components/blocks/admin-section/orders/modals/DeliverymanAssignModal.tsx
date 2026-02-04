import { AppModal } from "@/components/blocks/common/AppModal";
import { Button, Input } from "@/components/ui";
import {
  useDeliverymanAssign,
  useDeliverymanListQuery,
} from "@/modules/admin-section/orders/orders.action";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

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
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectDeliveryman, setSelectDeliveryman] = useState<string>("");
  useEffect(() => {
    if (row?.deliveryman?.id) {
      setSelectDeliveryman(row.deliveryman.id); // or row.deliveryman.value (depending on your API)
    }
  }, [row]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const [searchTrigger, setSearchTrigger] = useState(false);

  const handleSearchButtonClick = () => {
    setSearchValue(searchQuery);
    setSearchTrigger((prev) => !prev);
  };

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      handleSearchButtonClick();
    }
  };

  const { DeliverymanList, refetch: DeliverymanRefetch } =
    useDeliverymanListQuery({ search: searchValue });
  const deliveryman = (DeliverymanList as any)?.data || [];

  const handleDeliveryman = (item: any) => {
    if (selectDeliveryman === item?.value) {
      setSelectDeliveryman("");
    } else {
      setSelectDeliveryman(item?.value);
    }
  };

  const { mutate: updateStoreStatus } = useDeliverymanAssign();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      order_id: row.order_id,
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
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);
  useEffect(() => {
    DeliverymanRefetch();
  }, [searchValue, DeliverymanRefetch]);
  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel={t("common.assign")}
      IsLoading={loading}
      onSave={handleSave}
      disable={!selectDeliveryman || selectDeliveryman === row?.deliveryman?.id}
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[150px] md:top-[150px] top-[100px] bg-white"
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <div className="text-start ">
        <h1 className="text-xl font-bold mb-4">
          {t("common.deliveryman_assign_modal")}
        </h1>
        <div className="relative flex items-center gap-2 w-full py-4">
          <div
            className={`${
              locale === "ar" ? "right-3" : "left-3"
            } absolute  text-[#CCCFD7]`}
          >
            <Search width={18} height={18} />
          </div>
          <Input
            type="text"
            placeholder={t("place_holder.search_by_title")}
            value={searchQuery}
            onKeyDown={handleKeyDown}
            onChange={handleSearchInputChange}
            className="px-8 app-input w-full"
          />
          <Button
            variant="outline"
            onClick={handleSearchButtonClick}
            className="app-button mx-2 lg:mx-0"
          >
            {t("button.search")}
          </Button>
        </div>
        <div className="grid grid-cols-1  md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto custom-scrollbar">
          {Array.isArray(deliveryman) && deliveryman.length > 0
            ? deliveryman?.map((singleDeliveryMan: any, index) => {
                const { label } = singleDeliveryMan;
                return (
                  <div key={index}>
                    <div
                      onClick={() => handleDeliveryman(singleDeliveryMan)}
                      className={`flex items-center justify-between p-3 cursor-pointer rounded ${
                        singleDeliveryMan?.value == selectDeliveryman
                          ? "border border-blue-500 bg-blue-100 text-blue-500"
                          : "border border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600"
                      } `}
                    >
                      <span className="text-sm font-semibold capitalize">
                        {label}
                      </span>
                    </div>
                  </div>
                );
              })
            : ""}
        </div>
      </div>
    </AppModal>
  );
};

export default DeliverymanAssignModal;
