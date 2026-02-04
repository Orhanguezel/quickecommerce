"use client";
import AddToCardIcon from "@/assets/icons/AddToCardIcon";
import FiltersIcon from "@/assets/icons/FiltersIcon";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import FlashDealsTable from "@/components/blocks/admin-section/promotional/flash-deals/FlashDealsTable";
import CustomDateRangePicker from "@/components/blocks/common/CustomDateRangePicker";
import Filters from "@/components/blocks/common/Filters";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useDeactivateExpiredFlashDealMutation } from "@/modules/admin-section/promotional/flash-deals/flash-deals.action";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const FlashDeals = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const [searchValue, setSearchValue] = useState({
    title: "",
    start_date: "",
    end_date: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setSearchValue({
      title: searchQuery,
      start_date: dateRange.from ? dateRange.from.toISOString() : "",
      end_date: dateRange.to ? dateRange.to.toISOString() : "",
    });
    setIsModalOpen(false);
  };
  const handleResetButtonClick = () => {
    setSearchQuery("");
    setDateRange({ from: null, to: null });
    setSearchValue({
      title: "",
      start_date: "",
      end_date: "",
    });
    setIsModalOpen(false);
  };
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      handleSearchButtonClick();
    }
  };

  const { mutate: DatabaseUpdateControls, isPending } =
    useDeactivateExpiredFlashDealMutation();
  const onSubmit = async () => {
    setLoading(true);
    DatabaseUpdateControls(undefined, {
      onSuccess: () => {
        setLoading(false);
        dispatch(setRefetch(true));
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? `Error refetching data: ${error.message}`
            : "An unknown error occurred while refetching data"
        );
      },
    });
  };
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue({
        title: "",
        start_date: dateRange.from ? dateRange.from.toISOString() : "",
        end_date: dateRange.to ? dateRange.to.toISOString() : "",
      });
    }
  }, [searchQuery, dateRange.from, dateRange.to]);

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-2 md:p-4">
          <div className="col-span-1 flex items-center">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <AddToCardIcon /> {t("label.flash_deals")}{" "}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 col-span-1 lg:col-span-4 justify-start lg:justify-end w-full lg:w-auto">
            <div className="relative flex items-center w-full md:w-[30%]">
              <div
                className={`absolute left-3 text-[#CCCFD7] ${
                  dir === "rtl" ? "right-3" : "left-3"
                } `}
              >
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_title")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="px-8 mx-0 lg:mx-2 app-input"
              />

              <span
                className={`absolute  bg-transparent cursor-pointer ${
                  dir === "rtl" ? "left-2" : "right-2"
                }   `}
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
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">
                        {t("label.title")}
                      </p>
                      <Input
                        type="text"
                        placeholder={t("place_holder.search_by_title")}
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="app-input "
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
                </Filters>
              )}
            </div>
            <div className="flex items-center gap-5">
              <ConfirmationModal
                trigger={
                  <Button variant="outline" className="app-delete-button">
                    {t("button.deactivate")}
                  </Button>
                }
                onSave={() => onSubmit()}
                loading={loading}
                title={t("title.deactivate_expired_flash_deals")}
                subTitle={t("sub_title.deactivate_expired_flash_deals")}
              />

              <Link href={Routes.addFlashDeals}>
                <Button
                  variant="outline"
                  className="app-button"
                  onClick={(e) => {
                    const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                    if (!isNewTab) {
                      setIsLoading(true);
                    }
                  }}
                >
                  + {t("button.add_flash_deals")}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <FlashDealsTable searchValue={searchValue} />
    </>
  );
};

export default FlashDeals;
