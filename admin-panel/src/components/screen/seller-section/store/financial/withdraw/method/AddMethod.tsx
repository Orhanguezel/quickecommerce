"use client";
import TicketIcon from "@/assets/icons/TicketIcon";
import CreateOrUpdateMethodForm from "@/components/blocks/admin-section/financial/withdraw/method/CreateOrUpdateMethodForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useTranslations } from "next-intl";
import Link from "next/link";

const AddMethod = () => {
  const t = useTranslations();
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <TicketIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("common.add_method")}
            </h1>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link className="" href={Routes.MethodList}>
                {t("link.all_method")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      <>
        <CreateOrUpdateMethodForm />
      </>
    </div>
  );
};

export default AddMethod;
