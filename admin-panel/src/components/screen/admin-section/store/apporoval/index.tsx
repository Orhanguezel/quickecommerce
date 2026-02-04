"use client";
import StoreRequestApprovalTable from "@/components/blocks/admin-section/store/approval/StoreRequestApprovalTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { ShoppingBasket } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
type Option = {
  label: string;
  value: boolean;
};
const StoreRequestApproval = () => {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<Option[] | null>(null);

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

  useEffect(() => {
    const storedOptions = localStorage.getItem("selectedOptions");
    if (storedOptions) {
      setOptions(JSON.parse(storedOptions));
    }
  }, []);
  return (
    <>
      <Card>
        <CardContent className="flex flex-col md:flex-row justify-between gap-4 p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <ShoppingBasket /> {t("label.store_request")}{" "}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Input
                type="text"
                placeholder={t("place_holder.search_by_name")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="mx-0 md:mx-2 app-input "
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="mx-2 md:mx-0 app-button"
              >
                {t("button.search")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div>
        <StoreRequestApprovalTable searchValue={searchValue} />
      </div>
    </>
  );
};

export default StoreRequestApproval;
