"use client";
import FiltersIcon from "@/assets/icons/FiltersIcon";
import CustomDateRangePicker from "@/components/blocks/common/CustomDateRangePicker";
import Filters from "@/components/blocks/common/Filters";
import ReviewsTable from "@/components/blocks/seller-section/store/feedback-control/review/ReviewsTable";
import { Card, CardContent, Input } from "@/components/ui";
import { Command, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

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
    min_rating: "",
    max_rating: "",
    start_date: "",
    end_date: "",
  });
  const [filterInputs, setFilterInputs] = useState({
    min_rating: "",
    max_rating: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick2 = () => {
    setSearchValue(searchQuery);
  };
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      handleSearchButtonClick2();
    }
  };

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
      min_rating: "",
      max_rating: "",
    });
    setSearchFilters({
      min_rating: "",
      max_rating: "",
      start_date: "",
      end_date: "",
    });
    setDateRange({ from: null, to: null });
    setIsModalOpen(false);
  };

  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);

  return (
    <>
      <Card>
        <CardContent
          dir={dir}
          className="grid grid-cols-1 md:grid-cols-5 gap-4  p-2 md:p-4"
        >
          <div className="col-span-1">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <Command /> {t("common.reviews")}
            </h1>
          </div>
          <div className="flex items-center gap-2 col-span-4 justify-start md:justify-end">
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
                type="number"
                name="rating"
                min={0}
                placeholder={t("place_holder.search_by_rating")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
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
          searchRating={searchValue}
          searchFilters={searchFilters}
          selectStoreID={selectStoreID}
          selectReviewableType={selectReviewableType}
        />
      </div>
    </>
  );
};

export default Reviews;
