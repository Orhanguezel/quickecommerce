"use client";
import WithdrawRequestIcon from "@/assets/icons/WithdrawRequestIcon";
import CreateOrUpdateWithdrawRequestForm from "@/components/blocks/seller-section/store/financial/withdraw/request/CreateOrUpdateWithdrawRequestForm";
import { Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useTranslations } from "next-intl";
import Link from "next/link";

const AddWithdrawRequest = () => {
  const t = useTranslations();
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <WithdrawRequestIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("common.add_withdraw_request")}
            </h1>
          </div>
          <div className="flex">
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link className="" href={SellerRoutes.withdrawRequestList}>
                {t("common.all_withdraw_request")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      <>
        <CreateOrUpdateWithdrawRequestForm />
      </>
    </div>
  );
};

export default AddWithdrawRequest;
