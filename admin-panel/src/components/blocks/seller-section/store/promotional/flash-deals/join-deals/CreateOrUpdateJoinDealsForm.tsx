"use client";
import { SubmitButton } from "@/components/blocks/shared";
import { Card, CardContent } from "@/components/ui";
import Select from "react-select";
import { useStoreWiseProductQuery } from "@/modules/common/store-wise-product/store-wise-product.action";
import { useJoinFlashDealsStoreMutation } from "@/modules/seller-section/promotional/flash-deals/flash-deals.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Option {
  id: number;
  value: number;
  label: string;
}

const CreateOrUpdateJoinDealsForm = ({ ID }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id;
  const { handleSubmit, reset } = useForm<any>({});
  const [selectedProducts, setSelectedProducts] = useState<Option[]>([]);

  const { StoreWiseProductList } = useStoreWiseProductQuery({
    store_id: store_id || "",
  });
  let StoreWiseProductData = (StoreWiseProductList as any)?.data || [];

  const onChangeMultiSelect = (value: Option[]) => {
    setSelectedProducts(value);
  };

  const { mutate: JoinDealsStore, isPending: isJoinDealsStorePending } =
    useJoinFlashDealsStoreMutation();

  const onSubmit = async (values: any) => {
    const idsArray = selectedProducts.map((item) => item.value);
    const defaultData = {
      store_id,
      flash_sale_id: ID,
      products: idsArray,
    };

    const submissionData = {
      ...defaultData,
    };

    return JoinDealsStore(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          reset();
          dispatch(setRefetch(true));
        },
      }
    );
  };

  const customStyles = {
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#e5e7eb"
        : state.isFocused
        ? "#f3f4f6"
        : "",
      color: "#000",
      padding: "10px",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
    }),
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div dir={dir}>
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span>{t("label.choose_products")}</span>
                  </p>

                  <div>
                    <Select
                      isMulti
                      options={StoreWiseProductData}
                      styles={customStyles}
                      classNamePrefix="select"
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      value={selectedProducts}
                      //@ts-ignore
                      onChange={onChangeMultiSelect}
                      getOptionLabel={(option) => option.label.split(" | ")[0]}
                      formatOptionLabel={(option, { context }) => (
                        <div className="flex items-center justify-between">
                          <span>
                            {context === "menu"
                              ? option.label
                              : option.label.split(" | ")[0]}
                          </span>
                          {context === "menu" &&
                            selectedProducts.some(
                              (attr) => attr.value === option.value
                            ) && (
                              <span>
                                <Check className="w-4 h-4 text-blue-500" />
                              </span>
                            )}
                        </div>
                      )}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <SubmitButton
                    IsLoading={isJoinDealsStorePending}
                    AddLabel={t("button.join_deals")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </>
  );
};

export default CreateOrUpdateJoinDealsForm;
