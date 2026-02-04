// src/components/screen/admin-section/business-operations/area/EditArea.tsx

"use client";
import AreaIcon from "@/assets/icons/AreaIcon";
import Loader from "@/components/molecules/Loader";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CreateOrUpdateAreaForm from "@/components/blocks/admin-section/business-operations/area/CreateOrUpdateAreaForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useAreaQueryById } from "@/modules/admin-section/business-operations/area/area.action";
import { useAppSelector } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const EditArea = ({ ID }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const [isLoading, setIsLoading] = useState(false);
  const { Area, refetch, isPending } = useAreaQueryById(ID);

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
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <AreaIcon />

            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.edit_area")}
            </h1>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={Routes.areaList}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                {t("label.area_list")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {isPending || !Area ? (
        <CardSkletonLoader />
      ) : (
        <>
          <CreateOrUpdateAreaForm data={Area} />
        </>
      )}
    </div>
  );
};

export default EditArea;
