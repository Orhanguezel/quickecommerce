"use client";
import QuestionsTable from "@/components/blocks/admin-section/feedback-control/questions/QuestionsTable";
import { AppSelect } from "@/components/blocks/common";
import { Card, CardContent, Input } from "@/components/ui";
import { Search, ShieldQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Questions = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [selectReplied, setSelectStoreID] = useState<string>("");
  const [selectStatus, setSelectStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState({
    search: "",
  });
  const StatusList = [
    { label: t("common.hide"), value: "0" },
    { label: t("common.show"), value: "1" },
  ];
  const ReplyList = [
    { label: t("common.replied"), value: "replied" },
    { label: t("common.not_replied"), value: "not_replied" },
  ];
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

  const handleSelectStatus = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectStatus("");
    } else {
      setSelectStatus(newSelectStatus);
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
              <ShieldQuestion /> {t("label.questions")}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 col-span-4 justify-start md:justify-end">
            <div
              dir={dir}
              className="relative flex items-center w-full md:w-[30%]"
            >
              <div
                className={`${
                  locale === "ar" ? "right-3" : "left-3"
                } absolute  text-[#CCCFD7]`}
              >
                <Search width={18} height={17} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_question")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="px-10 app-input"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
              <AppSelect
                placeholder={t("place_holder.select_status")}
                value={String(selectStatus)}
                onSelect={handleSelectStatus}
                groups={StatusList}
                customClass="mx-0 md:mx-2 w-full md:w-48"
              />
              <AppSelect
                placeholder={t("place_holder.select_reply_status")}
                value={String(selectReplied)}
                onSelect={handleSelectOwner}
                groups={ReplyList}
                customClass="w-full md:w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div>
        <QuestionsTable
          searchValue={searchValue}
          selectStatus={selectStatus}
          selectReplied={selectReplied}
        />
      </div>
    </>
  );
};

export default Questions;
