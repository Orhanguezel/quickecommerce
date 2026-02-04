"use client";
import CreateOrUpdateStaffForm from "@/components/blocks/seller-section/store/staff/CreateOrUpdateStaffForm";
import { Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const AddStaff = () => {
  const t = useTranslations()
  return (
    <div>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <Users />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
            {t("label.add_staff")}
            </h1>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={SellerRoutes.staff}
              >
                {t("label.all_staff")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      <>
        <CreateOrUpdateStaffForm />
      </>
    </div>
  );
};

export default AddStaff;
