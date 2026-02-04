"use client";
import WithdrawRequestIcon from "@/assets/icons/WithdrawRequestIcon";
import Loader from "@/components/molecules/Loader";
import WithdrawDetailsForm from "@/components/blocks/admin-section/financial/withdraw/WithdrawDetailsForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useAllWithdrawalQueryById } from "@/modules/admin-section/financial/withdraw/all-withdrawal/all-withdrawal.action";
import { useAppSelector } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

const WithdrawDetails = ({ ID }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { WithdrawalDetails, refetch, isPending } =
    useAllWithdrawalQueryById(ID);

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
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col md:flex-row justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2 mb-4 md:mb-0">
            <WithdrawRequestIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("common.withdrawal_details")}
            </h1>
          </div>
          <div className="flex items-start">
            <p className="text-sm font-semibold text-blue-500 bg-blue-100 py-2 px-6 rounded dark:text-[#93c5fd] dark:bg-[#1e3a8a]  flex items-center gap-2  ">
              <Link
                className="text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white"
                href={Routes.withdrawList}
              >
                {t("link.all_withdraw")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {isPending || !WithdrawalDetails ? (
        <Loader customClass="mt-10" size="large" />
      ) : (
        <>
          <WithdrawDetailsForm
            data={WithdrawalDetails}
            ID={ID}
            refetch={refetch}
          />
        </>
      )}
    </div>
  );
};

export default WithdrawDetails;
