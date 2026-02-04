"use client";
import FiltersIcon from "@/assets/icons/FiltersIcon";
import ReviewsTable from "@/components/blocks/admin-section/feedback-control/review/ReviewsTable";
import { AppSelect } from "@/components/blocks/common";
import CustomDateRangePicker from "@/components/blocks/common/CustomDateRangePicker";
import Filters from "@/components/blocks/common/Filters";
import { Card, CardContent, Input } from "@/components/ui";
import { useInventoryStoreQuery } from "@/modules/admin-section/inventory/inventory.action";
import { Command, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Reviews = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectStoreID, setSelectStoreID] = useState<string>("");
  const [selectReviewableType, setSelectReviewableType] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const [searchFilters, setSearchFilters] = useState({
    status: "",
    rating: "",
    min_rating: "",
    max_rating: "",
    customer_name: "",
    start_date: "",
    end_date: "",
  });
  const [filterInputs, setFilterInputs] = useState({
    status: "",
    rating: "",
    min_rating: "",
    max_rating: "",
    customer_name: "",
  });
  const ReviewableTypeList = [
    { label: t("common.product"), value: "product" },
    { label: t("common.delivery_man"), value: "delivery_man" },
  ];
  const { InventoryStoreList } = useInventoryStoreQuery({
    seller_id: "",
  });
  let StoreData = (InventoryStoreList as any) || [];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchButtonClick = () => {
    setSearchFilters({
      ...filterInputs,
      start_date: dateRange.from ? dateRange.from.toISOString() : "",
      end_date: dateRange.to ? dateRange.to.toISOString() : "",
    });
    setIsModalOpen(false);
  };

  const handleResetButtonClick = () => {
    setFilterInputs({
      status: "",
      rating: "",
      min_rating: "",
      max_rating: "",
      customer_name: "",
    });
    setSearchFilters({
      status: "",
      rating: "",
      min_rating: "",
      max_rating: "",
      customer_name: "",
      start_date: "",
      end_date: "",
    });
    setDateRange({ from: null, to: null });
    setIsModalOpen(false);
  };

  const handleSelectStatus = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectReviewableType("all");
    } else {
      setSelectReviewableType(newSelectStatus);
    }
  };
  const handleSelectOwner = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectStoreID("");
    } else {
      setSelectStoreID(newSelectOwner);
    }
  };

  return (
    <>
      <Card>
        <CardContent
          dir={dir}
          className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 p-2 md:p-4"
        >
          <div className="col-span-1">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <Command /> {t("common.reviews")}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 col-span-4 justify-start md:justify-end">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-0 w-full md:w-auto">
              <AppSelect
                placeholder={t("place_holder.select_reviewable_type")}
                value={String(selectReviewableType)}
                onSelect={handleSelectStatus}
                groups={ReviewableTypeList}
                customClass="mx-0 md:mx-2 w-full md:w-48"
              />
              <AppSelect
                placeholder={t("place_holder.select_store")}
                value={String(selectStoreID)}
                onSelect={handleSelectOwner}
                groups={StoreData}
                customClass="w-full md:w-40"
              />
            </div>
            <div
              dir={dir}
              className="relative flex items-center w-full md:w-[30%]"
            >
              <div
                className={`${
                  locale === "ar" ? "right-4" : "left-4"
                } absolute  text-[#CCCFD7]`}
              >
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                name="customer_name"
                placeholder={t("place_holder.search_by_customer_name")}
                value={filterInputs.customer_name}
                onChange={handleFilterChange}
                className="px-8 mx-0 md:mx-2 app-input"
              />
              <span
                className={`${
                  locale === "ar" ? "left-2" : "right-2"
                } absolute bg-transparent cursor-pointer`}
                onClick={() => setIsModalOpen(!isModalOpen)}
              >
                <FiltersIcon />
              </span>
              {isModalOpen && (
                <Filters
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  showOverlay={false}
                  onSearch={handleSearchButtonClick}
                  onReset={handleResetButtonClick}
                >
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium mb-1">
                        {t("label.customer_name")}
                      </p>
                      <Input
                        type="text"
                        name="customer_name"
                        placeholder={t("place_holder.enter_customer_name")}
                        value={filterInputs.customer_name}
                        onChange={handleFilterChange}
                        className="app-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium mb-1">
                          {t("label.min_rating")}
                        </p>
                        <Input
                          type="number"
                          name="min_rating"
                          placeholder={t("place_holder.enter_min_rating")}
                          value={filterInputs.min_rating}
                          onChange={handleFilterChange}
                          className="app-input"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          {t("label.max_rating")}
                        </p>
                        <Input
                          type="number"
                          name="max_rating"
                          placeholder={t("place_holder.enter_max_rating")}
                          value={filterInputs.max_rating}
                          onChange={handleFilterChange}
                          className="app-input"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          {t("label.rating")}
                        </p>
                        <Input
                          type="number"
                          name="rating"
                          placeholder={t("place_holder.enter_rating")}
                          value={filterInputs.rating}
                          onChange={handleFilterChange}
                          className="app-input"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          {t("label.status")}
                        </p>
                        <Input
                          type="text"
                          name="status"
                          placeholder={t("place_holder.enter_status")}
                          value={filterInputs.status}
                          onChange={handleFilterChange}
                          className="app-input"
                        />
                      </div>
                      <div className="col-span-2 w-full">
                        <p className="text-sm font-medium mb-1">
                          {t("label.date")}
                        </p>
                        <CustomDateRangePicker
                          dateRange={dateRange}
                          onDateChange={setDateRange}
                          customSide="right-0"
                        />
                      </div>
                    </div>
                  </div>
                </Filters>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div>
        <ReviewsTable
          searchValue={searchFilters}
          selectReviewableType={selectReviewableType}
          selectStoreID={selectStoreID}
        />
      </div>
    </>
  );
};

export default Reviews;
