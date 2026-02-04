"use client";
import CreateOrUpdateStaffForm from "@/components/blocks/seller-section/store/staff/CreateOrUpdateStaffForm";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";
import Loader from "@/components/molecules/Loader";
import { Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useStaffQueryById } from "@/modules/seller-section/staff/staff.action";
import { useAppSelector } from "@/redux/hooks";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

const EditStaff = ({ ID }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { StaffByID, refetch, isPending } = useStaffQueryById(ID);

  useEffect(() => {
    if (isRefetch) {
      refetch();
    }
  }, [isRefetch, refetch]);
  if (!ID) {
    return (
      <div className="mt-10">
        <h1 className="text-xl text-red-500">{t("common.invalid_id")}</h1>
      </div>
    );
  }
  return (
    <>
      <Card>
        <CardContent className="flex flex-col md:flex-row justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2 mb-4 md:mb-0">
            <Users />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.edit_staff")}
            </h1>
          </div>
          <div className="flex items-start md:items-center">
            <p className="text-sm font-semibold text-blue-500 bg-blue-100 py-2 px-6 rounded dark:text-[#93c5fd] dark:bg-[#1e3a8a]  flex items-center gap-2 ">
              <Link
                className="text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white"
                href={SellerRoutes.staff}
              >
                {t("label.all_staff")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {isPending || !StaffByID ? (
        <CardSkletonLoader />
      ) : (
        <CreateOrUpdateStaffForm data={StaffByID} />
      )}
    </>
  );
};

export default EditStaff;
