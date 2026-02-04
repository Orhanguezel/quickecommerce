"use client";
import TrashListTable from "@/components/blocks/admin-section/customer/trash-list/TrashListTable";
import { Card, CardContent } from "@/components/ui";
import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const TrashList = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <>
      <Card>
        <CardContent
          dir={dir}
          className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 p-2 md:p-4"
        >
          <div className="col-span-1">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <Trash /> {t("label.trash_list")}
            </h1>
          </div>
          
        </CardContent>
      </Card>
      <div>
        <TrashListTable />
      </div>
    </>
  );
};

export default TrashList;
