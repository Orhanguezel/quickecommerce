"use client";
import PosOrderConfirmIcon from "@/assets/icons/PosOrderConfirmIcon";
import { AppModal } from "@/components/blocks/common/AppModal";
import { usePlaceOrderMutation } from "@/modules/seller-section/pos/Pos.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";

const OrderConfirmModal = ({
  trigger,
  total,
  payemtMethod,
  cartData,
  customerDetails,
  coupon,
  handlePlaceOrder,
  isModalOpen,
  setIsModalOpen,
  isPending,
}: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel={t("button.confirm")}
      customClass="inset-x-0p md:inset-x-30p lg:inset-x-35p 2xl:inset-x-40p top-[200px] bg-white"
      onSave={handlePlaceOrder}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={isPending}
      disable={isPending}
      hideX
    >
      <>
        <div
          className="flex flex-col itmes-center justify-center mt-4 w-full"
          dir={dir}
        >
          <div className="mt-4 flex itmes-center justify-center w-full">
            <div className="flex w-auto bg-blue-500 rounded-full p-3 ">
              <PosOrderConfirmIcon />
            </div>
          </div>
          <div className="py-2 flex itmes-center justify-center w-full">
            <h1 className="text-2xl font-bold text-black dark:text-white">
              {t("pos.confirm_order")}
            </h1>
          </div>
          <div className="my-6 text-md font-semibold text-gray-500 mx-4">
            <div className="border-b border-slate-300 flex items-center justify-between py-3">
              <h1>
                {payemtMethod === "cash"
                  ? t("pos.received_amount")
                  : t("pos.total_amount")}
              </h1>
              <h1 className="text-lg font-bold text-black dark:text-white">{total}</h1>
            </div>
            <div className="border-b border-slate-300 flex items-center justify-between py-3">
              <h1>{t("label.payment_method")}</h1>
              <h1 className="uppercase text-lg font-bold text-black dark:text-white">
                {payemtMethod}
              </h1>
            </div>
          </div>
        </div>
      </>
    </AppModal>
  );
};

export default OrderConfirmModal;
