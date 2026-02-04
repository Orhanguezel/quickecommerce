"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import DeliverymanTable from "@/components/blocks/admin-section/deliveryman/DeliverymanTable";
import { AppSelect } from "@/components/blocks/common";
import { AppSearchSelect } from "@/components/blocks/common/AppSearchSelect";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useVehicleTypeDropdownQuery } from "@/modules/admin-section/vehicle-type/vehicle-type.action";
import { useAreaDropdownQuery } from "@/modules/common/area/area.action";
import { Search, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const Deliveryman = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectIdentification, setSelectIdentification] = useState<string>("");
  const [selectStatus, setSelectStatus] = useState<string>("");
  const [selectVehicleType, setSelectVehicleType] = useState<string>("");
  const [selectAreaId, setSelectAreaId] = useState<string>("");
  const StatusList = [
    { label: t("common.pending"), value: "pending" },
    { label: t("common.approved"), value: "approved" },
    { label: t("common.inactive"), value: "inactive" },
  ];
  const IdentificationList = [
    { label: t("common.nid"), value: "nid" },
    { label: t("common.passport"), value: "passport" },
    { label: t("common.driving_license"), value: "driving_license" },
  ];

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setSearchValue(searchQuery);
  };
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      handleSearchButtonClick();
    }
  };

  const handleSelectStatus = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectStatus("");
    } else {
      setSelectStatus(newSelectStatus);
    }
  };
  const handleIdentificationList = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectIdentification("");
    } else {
      setSelectIdentification(newSelectOwner);
    }
  };

  const { VehicleTypeDropdownList } = useVehicleTypeDropdownQuery({});
  let VehicleTypeList = (VehicleTypeDropdownList as any) || [];
  const handleSelectOwner = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectVehicleType("");
    } else {
      setSelectVehicleType(newSelectOwner);
    }
  };

  const { AreaDropdownList } = useAreaDropdownQuery({});
  let AreaList = (AreaDropdownList as any) || [];
  const handleSelectAreaID = (value: string) => {
    const newSelectAreaID = String(value);
    if (value === "none") {
      setSelectAreaId("");
    } else {
      setSelectAreaId(newSelectAreaID);
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);
  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="flex items-center justify-between p-2 lg:p-4">
          <div className="">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Users /> {t("label.deliveryman")}{" "}
            </h1>
          </div>
          <div className="justify-end w-auto">
            <Link href={Routes.addDeliveryman}>
              <Button
                variant="outline"
                className="app-button"
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                + {t("button.add")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardContent className="grid grid-cols-1 2xl:grid-cols-5 p-2 lg:p-6">
          <div className="flex flex-col xl:flex-row gap-2 items-start xl:items-center col-span-5 justify-end w-full">
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center w-full">
              <AppSelect
                placeholder={t("place_holder.select_status")}
                value={String(selectStatus)}
                onSelect={handleSelectStatus}
                groups={StatusList}
                customClass="w-full "
              />
              <AppSearchSelect
                placeholder={t("place_holder.select_area")}
                value={String(selectAreaId)}
                onSelect={handleSelectAreaID}
                groups={AreaList}
                customClass="w-full"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center w-full">
              <AppSelect
                placeholder={t("place_holder.select_identification_type")}
                value={String(selectIdentification)}
                onSelect={handleIdentificationList}
                groups={IdentificationList}
                customClass="w-full "
              />
              <AppSearchSelect
                placeholder={t("place_holder.select_vehicle_type")}
                value={String(selectVehicleType)}
                onSelect={handleSelectOwner}
                groups={VehicleTypeList}
                customClass="w-full "
              />
            </div>
            <div className="relative flex items-center w-full">
              <div className="absolute left-3 text-[#CCCFD7]">
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_title")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="pl-8 mx-0 md:mx-2 app-input w-full"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="mx-2 md:mx-0 app-button"
              >
                {t("button.search")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeliverymanTable
        searchValue={searchValue}
        selectStatus={selectStatus}
        selectIdentification={selectIdentification}
        selectVehicleType={selectVehicleType}
        selectAreaId={selectAreaId}
      />
    </>
  );
};

export default Deliveryman;
