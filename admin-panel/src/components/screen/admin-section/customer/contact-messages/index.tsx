"use client";
import ContractMessagesTable from "@/components/blocks/admin-section/customer/contact-messages/ContractMessagesTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { MessageSquareQuote, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ContractMessages = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState({
    search: "",
  });
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleSearchButtonClick = () => {
    setSearchValue({
      search: searchQuery,
    });
  };
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      handleSearchButtonClick();
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue({ search: "" });
    }
  }, [searchQuery]);
  return (
    <>
      <Card>
        <CardContent
          dir={dir}
          className="flex flex-col md:flex-row justify-between gap-4 p-2 md:p-4"
        >
          <div className="">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <MessageSquareQuote className="mt-1" />
              {t("label.all_contact_messages")}
            </h1>
          </div>
          <div className="flex items-center justify-start md:justify-end">
            <div dir={dir} className="relative flex items-center">
              <div
                className={`${
                  locale === "ar" ? "right-4" : "left-4"
                } absolute  text-[#CCCFD7]`}
              >
                <Search width={18} height={17} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_name")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="mx-0 lg:mx-2 px-10 app-input"
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
      <div>
        <ContractMessagesTable searchValue={searchValue} />
      </div>
    </>
  );
};

export default ContractMessages;
