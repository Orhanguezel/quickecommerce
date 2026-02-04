"use client";
import AddToCardIcon from "@/assets/icons/AddToCardIcon";
import VehicleTypeTable from "@/components/blocks/admin-section/deliveryman/vehicle-type/VehicleTypeTable";
import { Button, Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useTranslations } from "next-intl";
import Link from "next/link";

const VehicleType = () => {
  const t = useTranslations();

  return (
    <>
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 p-2 md:p-4">
          <div className="col-span-1">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <AddToCardIcon /> {t("label.vehicle_type")}{" "}
            </h1>
          </div>
          <div className="flex items-center gap-2 col-span-4 justify-start md:justify-end">
            <Link href={Routes.addVehicleType}>
              <Button variant="outline" className="app-button">
                + {t("label.add_vehicle_type")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <VehicleTypeTable />
    </>
  );
};

export default VehicleType;
