import { AppModal } from "@/components/blocks/common/AppModal";
import { Button, Card, Input } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useGoogleMapForAllQuery } from "@/modules/admin-section/google-map-settings/google-map-settings.action";
import {
  useDeliverymanAssign,
  useDeliverymanListQuery,
} from "@/modules/admin-section/orders/orders.action";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface AssignDeliverymanFromDetailsModalProps {
  trigger: any;
  refetch: () => void;
  row?: any;
}

const AssignDeliverymanFromDetails: React.FC<
  AssignDeliverymanFromDetailsModalProps
> = ({ trigger, refetch, row }) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const mapContainerStyle = {
    width: "100%",
    height: "405px",
  };
  const { GoogleMapData } = useGoogleMapForAllQuery({});
  //@ts-ignore
  const GoogleMapSettingsMessage = GoogleMapData?.message;
  const [googleMapKey, setGoogleMapKey] = useState("");

  useEffect(() => {
    if (GoogleMapSettingsMessage?.com_google_map_enable_disable == "on") {
      setGoogleMapKey(GoogleMapSettingsMessage?.com_google_map_api_key);
    }
  }, [
    GoogleMapSettingsMessage?.com_google_map_enable_disable,
    GoogleMapSettingsMessage?.com_google_map_api_key,
  ]);

  const defaultCenter = { lat: 23.8103, lng: 90.4125 };
  const [center, setCenter] = useState(defaultCenter); // State for dynamic centering
  const [zoom, setZoom] = useState(8);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
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

  const [markerPosition, setMarkerPosition] = useState({
    lat: 23.8103,
    lng: 90.4125,
  });

  const { DeliverymanList, refetch: DeliverymanRefetch } =
    useDeliverymanListQuery({ search: searchValue });
  const deliveryman = (DeliverymanList as any)?.data || [];

  const [selectDeliveryman, setSelectDeliveryman] = useState<string>("");
  const handleDeliveryman = (item: any) => {
    setSelectDeliveryman(item?.value);
    const lat = Number(item?.area?.center_latitude);
    const lng = Number(item?.area?.center_longitude);
    setCenter({ lat, lng });
    setMarkerPosition({ lat, lng });
    setZoom(16);
  };

  const { mutate: updateStoreStatus } = useDeliverymanAssign();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      order_id: row.order_id,
      delivery_man_id: selectDeliveryman,
    };
    const submissionData = {
      ...defaultData,
    };
    updateStoreStatus(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
          setIsModalOpen(false);
        },
        onError: (error: any) => {
          setLoading(false);
        },
      }
    );
  };

  useEffect(() => {
    DeliverymanRefetch();
  }, [DeliverymanRefetch, searchValue]);
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);
  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel={t("common.assign")}
      IsLoading={loading}
      onSave={handleSave}
      customClass="lg:inset-x-25p md:inset-x-25p lg:top-[100px] md:top-[100px] top-[50px] "
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <div className="text-start ">
        <h1 className="text-xl font-bold mb-8">
          {t("common.deliveryman_assign_modal")}
        </h1>
        <div className="grid grid-cols-2 gap-8">
          <div className="relative rounded-xl">
            {googleMapKey ? (
              <div className="relative rounded-xl">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={zoom}
                  //@ts-ignore
                  onLoad={(map) => (mapRef.current = map)}
                >
                  <Marker position={markerPosition} draggable={true} />
                </GoogleMap>
              </div>
            ) : (
              <div className="mt-4">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={zoom}
                  //@ts-ignore
                  onLoad={(map) => (mapRef.current = map)}
                >
                  <Marker position={markerPosition} draggable={true} />
                </GoogleMap>
              </div>
            )}
          </div>
          <Card className="p-4">
            <div className="relative flex items-center gap-2 w-full mb-8">
              <div
                className={`${
                  locale === "ar" ? "right-3" : "left-3"
                } absolute  text-[#CCCFD7]`}
              >
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_title")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="px-8 app-input w-full"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button mx-2 lg:mx-0"
              >
                {t("button.search")}
              </Button>
            </div>
            <div className="grid grid-cols-1  md:grid-cols-1 max-h-[300px] overflow-y-auto custom-scrollbar ">
              <div className="border border-slate-300">
                {Array.isArray(deliveryman) && deliveryman.length > 0
                  ? deliveryman?.map((singleDeliveryMan: any, index: any) => {
                      const { label, image_url } = singleDeliveryMan;
                      return (
                        <div
                          className="border-b border-slate-300 cursor-pointer"
                          key={index}
                        >
                          <div
                            onClick={() => handleDeliveryman(singleDeliveryMan)}
                            className={`flex items-center justify-between p-3 ${
                              singleDeliveryMan?.value == selectDeliveryman
                                ? " bg-blue-500 text-white "
                                : " text-slate-500 hover:text-blue-500"
                            } m-0.5 rounded`}
                          >
                            <div className="flex items-center gap-2 text-sm font-semibold capitalize">
                              <div className="shadow-custom relative w-8 h-8 rounded-full">
                                <Image
                                  loader={GlobalImageLoader}
                                  src={
                                    image_url
                                      ? image_url
                                      : "/images/no-image.png"
                                  }
                                  alt="deliveryman"
                                  layout="fill"
                                  className="rounded-full "
                                />
                              </div>
                              <span className="font-semibold">{label}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : ""}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppModal>
  );
};

export default AssignDeliverymanFromDetails;
