"use client";
import BalanceInfoIcon from "@/assets/icons/BalanceInfoIcon";
import StoreInfoIcon from "@/assets/icons/StoreInfoIcon";
import WithdrawInfoIcon from "@/assets/icons/WithdrawInfoIcon";
import { formatPrice } from "@/components/molecules/formatPrice";
import { Button, Card, CardContent } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useRequestRejectMutation } from "@/modules/admin-section/financial/withdraw/request/request.action";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useAppDispatch } from "@/redux/hooks";
import { format } from "date-fns";
import { Mail, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import ApproveConfirmModal from "./modals/ApproveConfirmModal";
import RejectConfirmModal from "./modals/RejectConfirmModal";

const WithdrawDetailsForm = ({ data, ID, refetch }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const editData = data?.data;
  const activityData = data?.activity;
  const { currency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  const [loading, setLoading] = useState(false);

  const { mutate: RejectSingleRowId } = useRequestRejectMutation();
  const handleSingleReject = (id: string, reason: string) => {
    const payload = { id: id, reject_reason: reason };
    setLoading(true);
    RejectSingleRowId(payload, {
      onSuccess: () => {
        refetch();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
  };

  return (
    <div dir={dir} className="space-y-4">
      <div className="grid 2xl:grid-cols-12 lg:grid-cols-2 gap-4">
        {editData?.owner && (
          <Card className="2xl:col-span-3 lg:col-span-1">
            <CardContent className="p-2 md:p-6 w-full">
              <div className="flex items-start justify-between border-b border-slate-400 pb-4">
                <div className="flex items-center gap-2">
                  <StoreInfoIcon />
                  <h2 className="text-lg md:text-2xl font-medium ">
                    {t("common.owner_info")} :
                  </h2>
                </div>
              </div>
              <div className="p-2">
                <div className="flex items-center gap-4">
                  <div className="relative w-[80px] h-[80px] border border-slate-300 rounded p-2">
                    <Image
                      loader={GlobalImageLoader}
                      src={editData?.owner?.logo ?? "/images/no-image.png"}
                      alt="CardImage"
                      fill
                      sizes="80px"
                      priority
                      className="w-full h-full rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    {editData?.owner?.name && (
                      <h1 className="flex items-center gap-1 text-lg font-semibold ">
                        <User width={16} height={16} />
                        <span className="text-gray-500 dark:text-white">
                          {" "}
                          {editData?.owner?.name}
                        </span>
                      </h1>
                    )}
                    {editData?.owner?.email && (
                      <p className="flex items-center gap-1 text-black dark:text-white text-sm font-medium mt-1">
                        <Mail width={16} height={16} />
                        <span className="text-gray-500 dark:text-white">
                          {" "}
                          {editData?.owner?.email}
                        </span>
                      </p>
                    )}
                    {editData?.owner?.phone && (
                      <p className="flex items-center gap-1 text-black dark:text-white text-sm font-medium mt-1">
                        <Phone width={16} height={16} />
                        <span className="text-gray-500 dark:text-white">
                          {" "}
                          {editData?.owner?.phone}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {editData?.wallet && (
          <Card className="2xl:col-span-3 lg:col-span-1">
            <CardContent className="p-2 md:p-6 w-full">
              <div className="flex items-start justify-between border-b border-slate-400 pb-4">
                <div className="flex items-center gap-2">
                  <BalanceInfoIcon />
                  <h2 className="text-lg md:text-2xl font-medium ">
                    {t("common.balance_info")} :
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 my-2">
                <div className="">
                  <p className="flex items-center gap-1 text-black dark:text-white text-sm font-medium mt-1">
                    {t("common.available_balance")}
                  </p>
                  <p className="flex items-center gap-1 text-black dark:text-white text-sm font-medium mt-1">
                    {t("common.total_earnings")}
                  </p>
                </div>
                <div className="">
                  <p className="flex items-center gap-1 text-black dark:text-white text-sm font-medium mt-1">
                    <span className="text-gray-500 dark:text-white">
                      :{" "}
                      {CurrencyData
                        ? formatPrice(editData?.wallet?.balance, CurrencyData)
                        : editData?.wallet?.balance}
                    </span>
                  </p>
                  <p className="flex items-center gap-1 text-black dark:text-white text-sm font-medium mt-1">
                    <span className="text-gray-500 dark:text-white">
                      :{" "}
                      {CurrencyData
                        ? formatPrice(editData?.wallet?.earnings, CurrencyData)
                        : editData?.wallet?.earnings}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="2xl:col-span-6 lg:col-span-2">
          <CardContent className="p-2 md:p-6 w-full">
            <div className="flex items-center justify-between border-b border-slate-400 pb-2">
              <div className="flex items-center gap-2">
                <WithdrawInfoIcon />
                <h2 className="text-lg md:text-2xl font-medium ">
                  {t("common.withdraw_info")} :
                </h2>
              </div>
              {activityData?.status === "pending" && (
                <div className="flex items-center gap-2">
                  <RejectConfirmModal
                    trigger={
                      <Button variant="outline" className="app-delete-button">
                        {t("button.reject_request")}
                      </Button>
                    }
                    onSave={(reason: string) => handleSingleReject(ID, reason)}
                    loading={loading}
                  />
                  <ApproveConfirmModal
                    trigger={
                      <Button variant="outline" className="app-button">
                        {t("button.approve_request")}
                      </Button>
                    }
                    refetch={refetch}
                    ID={ID}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4 my-2">
              <div className="text-black dark:text-white text-sm font-medium space-y-1">
                <p>{t("common.amount")}</p>
                <p>{t("common.gateway_name")}</p>
                <p>{t("common.gateway_info")}</p>
              </div>
              <div className="col-span-3 text-gray-500 dark:text-white text-sm font-medium  space-y-1">
                <p>
                  :{" "}
                  {CurrencyData
                    ? formatPrice(editData?.amount, CurrencyData)
                    : editData?.amount}
                </p>

                <p>: {t("common.bank")}</p>
                <p className="flex flex-col">
                  <span>: {editData?.gateway_name}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-2 md:p-6 w-full">
          <div className="flex items-start justify-between border-b border-slate-400 pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-2xl font-medium ">
                {t("common.activity")}
              </h2>
            </div>
          </div>
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-5 p-4 shadow-custom text-md font-semibold">
                <h2 className="">{t("common.sl")}</h2>
                <h2 className="">{t("common.date")}</h2>
                <h2 className="">{t("common.status")}</h2>
                <h2 className="col-span-2">
                  {t("common.approved_or_decline")}
                </h2>
              </div>
              <div className="grid grid-cols-5 p-4 mt-4 items-center">
                <p className="text-sm font-semibold text-gray-500 dark:text-white">
                  1
                </p>
                <p className="text-sm font-semibold text-gray-500 dark:text-white">
                  {activityData?.date &&
                    format(activityData?.date, "dd MMMM yyyy hh:mm a")}
                </p>
                <p className="text-sm font-semibold text-gray-500 dark:text-white">
                  <span
                    className={`border ${
                      activityData?.status === "approved"
                        ? "text-green-500 border-green-500 bg-green-50"
                        : activityData?.status === "pending"
                        ? "text-yellow-500 border-yellow-500 bg-yellow-50"
                        : "text-red-500 border-red-500 bg-red-50"
                    } capitalize px-2 py-1 rounded`}
                  >
                    {activityData?.status}
                  </span>
                </p>
                <div className="col-span-2 text-sm font-semibold text-gray-500 dark:text-white flex items-center gap-2">
                  {activityData?.status === "approved" && (
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

                  {activityData?.status === "approved" && activityData?.details}
                  {activityData?.status === "rejected" &&
                    activityData?.reject_reason}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WithdrawDetailsForm;
