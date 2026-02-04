"use client";
import Loader from "@/components/molecules/Loader";
import StoreDashboardCard from "@/components/blocks/seller-section/store/StoreDashboardCard";
import { useStoreDashboardQuery } from "@/modules/seller-section/store/store.action";
import { useAppSelector } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import React, { useEffect } from "react";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const StoreDashboard = ({ slug }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { storeDashboard, isPending, refetch } = useStoreDashboardQuery(slug);

  useEffect(() => {
    if (isRefetch) {
      refetch();
    }
  }, [isRefetch, refetch]);
  if (!slug) {
    return (
      <div className="mt-10">
        <h1 className="text-xl text-red-500">{t("common.invalid_id")}</h1>
      </div>
    );
  }
  return (
    <div>
      {isPending ||
      !storeDashboard ||
      Object.keys(storeDashboard).length === 0 ? (
        <CardSkletonLoader />
      ) : (
        <StoreDashboardCard data={storeDashboard} isPending={isPending} />
      )}
    </div>
  );
};

export default StoreDashboard;
