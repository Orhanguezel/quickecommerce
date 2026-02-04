"use client";
import { AppSelect } from "@/components/blocks/common";
import { Button, Card, CardContent } from "@/components/ui";
import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import AddCustomerModal from "../modals/AddCustomerModal";
import { usePosCustomerList } from "@/modules/seller-section/pos/Pos.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { AppSelectDetails } from "@/components/blocks/common/AppSelectDetails";

const Billing = ({ setCustomerDetails }: any) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id;
  const [selectStatus, setSelectStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const { posCustomers, refetch, isFetching } = usePosCustomerList({
    store_id: store_id,
    search,
  });
  let CustomerList = (posCustomers as any)?.data || [];

  const handleSearch = (query: string) => {
    setSearch(query);
    refetch();
  };

  const handleSelectStatus = (value: string) => {
    const selectedOption = CustomerList.find((item: { id: any; }) => String(item.id) === String(value));
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectStatus("");
      setCustomerDetails("");
    } else {
      setSelectStatus(newSelectStatus);
      // setCustomerDetails(newSelectStatus);
       setCustomerDetails({
      id: selectedOption.id,
      wallet_balance: selectedOption.wallet_balance,
    });
    }
  };

  return (
    <>
      <Card className="">
        <CardContent className="space-y-4 p-2 md:p-4">
          <div className="py-2 md:py-0">
            <h1 className="text-md xl:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <PackageSearch /> Billing
            </h1>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AppSelectDetails
                placeholder="Select Customer Info"
                value={String(selectStatus)}
                onSelect={handleSelectStatus}
                groups={CustomerList}
                customClass="w-full "
                onSearch={handleSearch}
                search={search}
                loading={isFetching}
              />
            </div>
            <div className="relative flex items-center gap-2 w-full">
              <AddCustomerModal
                trigger={
                  <Button variant="outline" className="app-button w-full">
                    Add Customer
                  </Button>
                }
                listRefetch={refetch}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Billing;
