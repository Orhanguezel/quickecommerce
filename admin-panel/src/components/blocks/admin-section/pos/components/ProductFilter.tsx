"use client";
import { AppNestedDropdown } from "@/components/blocks/common";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { useCategoriesQuery } from "@/modules/common/category/category.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { PackageSearch, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useInventoryStoreQuery } from "@/modules/admin-section/inventory/inventory.action";
import { AppSearchSelect } from "@/components/blocks/common/AppSearchSelect";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { setSelectedStore } from "@/redux/slices/storeSlice";
import { clearCart } from "@/redux/slices/cartSlice";

const ProductFilter = ({
  finalSelectedID,
  setfinalSelectedID,
  setSearchValue,
  setSelectedPayment,
  setTota_tax,
  setCurrentPage,
}: any) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_type = selectedStore?.type;
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedIDs, setSelectedIDs] = useState<string[]>([]);


  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setSearchValue(searchQuery);
  };
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      handleSearchButtonClick();
    }
  };
  const { InventoryStoreList } = useInventoryStoreQuery({
    seller_id: "",
  });
  let StoreData = (InventoryStoreList as any) || [];

  const dispatch = useAppDispatch();

  const handleSelectItem = (storeId: string) => {
    const store = StoreData.find(
      (store: { value: string }) => store.value == storeId
    );
    if (!store) {
      dispatch(setSelectedStore({ id: "", type: "", slug: "" }));
    }
    dispatch(
      setSelectedStore({ id: store.value, type: store.store_type, slug: store.slug })
    );
    dispatch(clearCart());
    setSelectedPayment("cash");
    setTota_tax(0);
    setCurrentPage(1);
    setSelectedItems([]);
    setSelectedIDs([]);
    setfinalSelectedID("");
    setSearchQuery("");
    if (store.slug) {
      setIsLoading(true);
      dispatch(setRefetch(true));
      localStorage.setItem("store_id", storeId);
    }
  };

  const { categories } = useCategoriesQuery({
    pagination: false,
    type: store_type ?? "",
  });
  let optionsData = (categories as any)?.data || [];

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery, setSearchValue]);

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <Card className="">
        <CardContent className="space-y-4 p-2 md:p-4">
          <div className="py-2 md:py-0">
            <h1 className="text-md xl:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <PackageSearch /> {t("pos.products_filter")}
            </h1>
          </div>
          <div className="space-y-4 pb-3">
            <div className="flex items-center gap-4">
              <AppSearchSelect
                placeholder={t("place_holder.select_store")}
                value={String(selectedStore.id) ?? "None"}
                onSelect={handleSelectItem}
                groups={StoreData}
                customClass="w-full xl:w-48"
              />

              <div className="w-full">
                <AppNestedDropdown
                  selectedItems={selectedItems}
                  selectedIDs={selectedIDs}
                  finalSelectedID={finalSelectedID}
                  setfinalSelectedID={setfinalSelectedID}
                  setSelectedItems={setSelectedItems}
                  setSelectedIDs={setSelectedIDs}
                  groups={optionsData}
                />
              </div>
            </div>
            <div className="relative flex items-center gap-2 w-full">
              <div
                className={`${locale === "ar" ? "right-3" : "left-3"
                  } absolute  text-gray-500 dark:text-white mt-0.5`}
              >
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_product")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="app-input px-10"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button mx-2 lg:mx-0"
              >
                {t("button.search")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ProductFilter;
