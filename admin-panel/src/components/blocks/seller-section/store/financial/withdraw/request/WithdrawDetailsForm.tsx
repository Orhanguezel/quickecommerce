"use client";
import { formatPrice } from "@/components/molecules/formatPrice";
import { Card, CardContent } from "@/components/ui";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useAppDispatch } from "@/redux/hooks";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const WithdrawDetailsForm = ({ data, ID }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const editData = data?.data;
  const { currency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  return (
    <>
      <div className="grid 2xl:grid-cols-12 grid-cols-2 gap-4">
        <Card className="2xl:col-span-4 col-span-2">
          <CardContent className="p-2 md:p-6 w-full">
            <div className="flex items-start justify-between border-b border-slate-400 pb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold ">
                  {t("common.withdraw_info")}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 my-2">
              <div className="text-black dark:text-white text-sm font-medium space-y-4">
                <div className="flex items-items-start ">
                  <p className="min-w-[200px]">{t("common.amount")}</p>
                  <p className="flex items-start gap-1 text-gray-500 dark:text-white">
                    <span>:</span>
                    <span>
                      {CurrencyData
                        ? formatPrice(editData?.amount, CurrencyData)
                        : editData?.amount}
                    </span>
                  </p>
                </div>
                <div className="flex items-start ">
                  <p className="min-w-[200px]">{t("common.gateway_name")}</p>
                  <p className="flex items-start gap-1 text-gray-500 dark:text-white">
                    <span>:</span>
                    <span> {editData?.gateway_name} </span>
                  </p>
                </div>
                <div className="flex items-start ">
                  <p className="min-w-[200px]">{t("common.gateway_info")}</p>
                  <p>
                    <p className="flex items-start gap-1 text-gray-500 dark:text-white">
                      <span>:</span>
                      <span className="flex flex-col">
                        {Object.entries(editData?.gateways || {}).map(
                          ([key, value]) => (
                            <span key={key} className="px-2">
                              <span className="text-black dark:text-white">{key}</span>{" "}
                              {` ${value}`}
                            </span>
                          )
                        )}
                      </span>
                    </p>
                  </p>
                </div>
                <div className="flex items-start ">
                  <p className="min-w-[200px]">{t("common.details")}</p>
                  <p className="flex items-start gap-1 text-gray-500 dark:text-white">
                    <span>:</span>
                    <span> {editData?.details} </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="2xl:col-span-8 col-span-2">
          <CardContent className="p-2 md:p-6 w-full">
            <div className="flex items-start justify-between border-b border-slate-400 pb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold ">
                  {t("common.activity")}
                </h2>
              </div>
            </div>
            <div className="w-full overflow-x-auto custom-scrollbar">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-5 p-4 shadow-custom text-md font-semibold">
                  <h2 className="">{t("common.status")}</h2>
                  <h2 className="">{t("common.create_date")}</h2>
                  <h2 className="">{t("common.approve_reject_date")}</h2>
                  <h2 className="col-span-2">
                    {t("common.approved_or_decline")}
                  </h2>
                </div>
                <div className="grid grid-cols-5 p-4 mt-4 items-center">
                  <p className="text-sm font-semibold text-gray-500 dark:text-white">
                    <span
                      className={`border ${
                        editData?.status === "approved"
                          ? "text-green-500 border-green-500 bg-green-50"
                          : editData?.status === "pending"
                          ? "text-yellow-500 border-yellow-500 bg-yellow-50"
                          : "text-red-500 border-red-500 bg-red-50"
                      } capitalize px-2 py-1 rounded`}
                    >
                      {editData?.status}
                    </span>
                  </p>
                  <p className="text-sm font-semibold text-gray-500 dark:text-white">
                    {editData?.created_at &&
                      format(editData?.created_at, "dd MMMM yyyy hh:mm a")}
                  </p>
                  <p className="text-sm font-semibold text-gray-500 dark:text-white">
                    {editData?.updated_at &&
                      format(editData?.updated_at, "dd MMMM yyyy hh:mm a")}
                  </p>

                  <div className="col-span-2 text-sm font-semibold text-gray-500 dark:text-white flex items-center gap-2">
                    {editData?.status === "approved" && (
                      <div className="">
                        {editData?.attachment?.endsWith(".jpg") ||
                        editData?.attachment?.endsWith(".jpeg") ||
                        editData?.attachment?.endsWith(".png") ? (
                          <Link
                            href={editData?.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline border border-slate-300 rounded overflow-hidden p-2"
                          >
                            {t("common.view_file")}
                          </Link>
                        ) : editData?.attachment?.endsWith(".gif") ? (
                          <Link
                            href={editData?.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline border border-slate-300 rounded overflow-hidden p-2"
                          >
                            {t("common.view_file")}
                          </Link>
                        ) : editData?.attachment?.endsWith(".pdf") ? (
                          <Link
                            href={editData?.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline border border-slate-300 rounded overflow-hidden p-2"
                          >
                            {t("common.view_pdf")}
                          </Link>
                        ) : null}
                      </div>
                    )}
                    {editData?.status === "approved" && editData?.details}
                    {editData?.status === "rejected" && editData?.reject_reason}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default WithdrawDetailsForm;
