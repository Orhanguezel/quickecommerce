"use client";
import AddToCardIcon from "@/assets/icons/AddToCardIcon";
import Edit from "@/assets/icons/Edit";
import Loader from "@/components/molecules/Loader";
import FlashSaleDetailsCard from "@/components/blocks/admin-section/promotional/flash-deals/FlashSaleDetailsCard";
import { Button, Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useFlashDealsQueryById } from "@/modules/admin-section/promotional/flash-deals/flash-deals.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const FlashSaleDetails = ({ ID }: any) => {
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { FlashDeal, refetch, isPending } = useFlashDealsQueryById(ID);
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const handleEdit = (Id: string) => {
    setEditRowId(Id);
    router.push(`${Routes.editStore}/${Id}`);
    dispatch(setRefetch(true));
  };
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
    <div>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 items-center justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <AddToCardIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.flash_deals_details")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex">
              <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
                <Link className="" href={Routes.flashDealsList}>
                  {t("label.flash_deals")}
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`${Routes.editFlashDeals}/${ID}`}>
                <Button
                  disabled={editRowId === ID}
                  onClick={() => handleEdit(ID)}
                  variant="outline"
                  className="app-button flex items-center gap-2"
                >
                  {editRowId === ID ? <Loader size="sm" /> : <Edit />}{" "}
                  {t("button.edit_flash_deals")}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      {isPending || !FlashDeal ? (
        <CardSkletonLoader />
      ) : (
        <FlashSaleDetailsCard data={FlashDeal} />
      )}
    </div>
  );
};

export default FlashSaleDetails;
