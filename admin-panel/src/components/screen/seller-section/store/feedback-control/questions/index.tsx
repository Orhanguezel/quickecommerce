"use client";
import { AppSelect } from "@/components/blocks/common";
import QuestionsTable from "@/components/blocks/seller-section/store/feedback-control/questions/QuestionsTable";
import { Card, CardContent } from "@/components/ui";
import { ShieldQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Questions = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [selectReplied, setSelectStoreID] = useState<string>("");
  const [selectDateFilter, setDateFilter] = useState<string>("");

  const DateFilter = [
    { label: t("common.last_week"), value: "last_week" },
    { label: t("common.last_month"), value: "last_month" },
    { label: t("common.last_year"), value: "last_year" },
  ];
  const ReplyList = [
    { label: t("common.replied"), value: "replied" },
    { label: t("common.not_replied"), value: "not_replied" },
  ];

  const handleSelectOwner = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectStoreID("");
    } else {
      setSelectStoreID(newSelectOwner);
    }
  };

  const handleSelectDateFilter = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setDateFilter("");
    } else {
      setDateFilter(newSelectOwner);
    }
  };

  return (
    <>
      <Card>
        <CardContent
          dir={dir}
          className="grid grid-cols-1 md:grid-cols-5 p-2 md:p-4"
        >
          <div className="col-span-1">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <ShieldQuestion /> {t("common.all_questions")}
            </h1>
          </div>
          <div
            className="flex flex-col md:flex-row items-start md:items-center gap-2 col-span-4 justify-start md:justify-end w-full md:w-auto
          "
          >
            <div className="flex items-center">
              <AppSelect
                placeholder={t("place_holder.select_date_range")}
                value={String(selectDateFilter)}
                onSelect={handleSelectDateFilter}
                groups={DateFilter}
                customClass="w-full md:w-48"
              />
            </div>
            <div className="flex items-center">
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
          selectReplied={selectReplied}
          selectDateFilter={selectDateFilter}
        />
      </div>
    </>
  );
};

export default Questions;
