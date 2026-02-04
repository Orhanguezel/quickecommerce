"use client";
import Edit from "@/assets/icons/Edit";
import Loader from "@/components/molecules/Loader";
import StoreViewCard from "@/components/blocks/admin-section/store/StoreViewCard";
import { Button, Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useStoreQueryById } from "@/modules/admin-section/store/store.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const StoreView = ({ ID }: any) => {
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { StoreById, refetch, isPending } = useStoreQueryById(ID);
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
      <Card className="">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 md:p-4">
          <div className="">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.store_details")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href={Routes.storeList}>
              <Button
                variant="outline"
                className="app-button flex items-center gap-2"
              >
                {t("button.store")}
              </Button>
            </Link>
            <Link href={`${Routes.editStore}/${ID}`}>
              <Button
                disabled={editRowId === ID}
                onClick={() => handleEdit(ID)}
                variant="outline"
                className="app-button flex items-center gap-2"
              >
                {editRowId === ID ? <Loader size="sm" /> : <Edit />}  {t("button.edit_store")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      {isPending || !StoreById ? (
        <Loader customClass="mt-10" size="large" />
      ) : (
        <StoreViewCard data={StoreById} />
      )}
    </div>
  );
};

export default StoreView;
