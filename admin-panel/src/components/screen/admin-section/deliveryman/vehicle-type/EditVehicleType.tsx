"use client";
import AddToCardIcon from "@/assets/icons/AddToCardIcon";
import Loader from "@/components/molecules/Loader";
import CreateOrUpdateVehicleTypeForm from "@/components/blocks/admin-section/deliveryman/vehicle-type/CreateOrUpdateVehicleTypeForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useVehicleTypeQueryById } from "@/modules/admin-section/vehicle-type/vehicle-type.action";
import { useAppSelector } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

const EditVehicleType = ({ ID }: any) => {
  const t = useTranslations();

  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { VehicleTypeByID, refetch, isPending } = useVehicleTypeQueryById(ID);

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
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <AddToCardIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.edit_vehicle_type")}
            </h1>
          </div>
          <div className="flex">
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={Routes.vehicleTypeList}
              >
                {t("label.vehicle_type")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {isPending || !VehicleTypeByID ? (
        <Loader customClass="mt-10" size="large" />
      ) : (
        <CreateOrUpdateVehicleTypeForm data={VehicleTypeByID} />
      )}
    </>
  );
};

export default EditVehicleType;
