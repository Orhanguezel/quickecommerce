"use client";
import NoticesTable from "@/components/blocks/seller-section/store/settings/notices/NoticesTable";
import { Card, CardContent } from "@/components/ui";
import { MessageSquareWarning } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";


const Notices = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <>
      <Card>
        <CardContent
          dir={dir}
          className="flex flex-col lg:flex-row justify-between p-2 lg:p-4"
        >
          <div className="mb-4 lg:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <MessageSquareWarning /> {t("common.notices")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <div>
        <NoticesTable />
      </div>
    </>
  );
};

export default Notices;
