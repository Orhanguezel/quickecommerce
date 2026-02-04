import { AppSelect } from "@/components/blocks/common";
import { AppModal } from "@/components/blocks/common/AppModal";
import { useGoogleMapSettingsQuery } from "@/modules/admin-section/google-map-settings/google-map-settings.action";
import {
  useDeliverymanAssign,
  useDeliverymanListQuery,
} from "@/modules/admin-section/orders/orders.action";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useTranslations } from "next-intl";
import React, { useRef, useState } from "react";

interface AssignDeliverymanFromDetailsModalProps {
  trigger: any;
  refetch?: () => void;
  row?: any;
}

const AssignDeliverymanFromDetails: React.FC<
  AssignDeliverymanFromDetailsModalProps
> = ({ trigger, row }) => {
  const t = useTranslations();
  const [selectDeliveryman, setSelectDeliveryman] = useState<string>("");
  const { DeliverymanList } = useDeliverymanListQuery({});
  const deliveryman = (DeliverymanList as any)?.data || [];

  const handleDeliveryman = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectDeliveryman("");
    } else {
      setSelectDeliveryman(newSelectOwner);
    }
  };
  const { mutate: updateStoreStatus } = useDeliverymanAssign();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      order_id: row.id,
      delivery_man_id: selectDeliveryman,
    };
    const submissionData = {
      ...defaultData,
    };
    updateStoreStatus(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          setLoading(false);
          setIsModalOpen(false);
        },
        onError: (error: any) => {
          setLoading(false);
        },
      }
    );
  };

  const mapContainerStyle = {
    width: "100%",
    height: "350px",
  };
  const [markerPosition, setMarkerPosition] = useState({
    lat: 23.8103,
    lng: 90.4125,
  });
  const defaultCenter = { lat: 23.8103, lng: 90.4125 };
  const [center, setCenter] = useState(defaultCenter); // State for dynamic centering
  const [zoom, setZoom] = useState(8);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [polygonCoords, setPolygonCoords] = useState<any>([]);

  const [errorMessage, setErrorMessage] = useState("");
  const handleMarkerDrag: any = async (event: {
    latLng: { lat: () => number; lng: () => number };
  }) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();

    const point = new window.google.maps.LatLng(newLat, newLng);
    const polygon = new window.google.maps.Polygon({ paths: polygonCoords });
    const isInsideZone = window.google.maps.geometry.poly.containsLocation(
      point,
      polygon
    );

    if (isInsideZone) {
      setMarkerPosition({ lat: newLat, lng: newLng });
      setErrorMessage("");
    } else {
      setErrorMessage("The marker is out of the selected zone.");
    }
  };

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel={t("common.assign")}
      IsLoading={loading}
      onSave={handleSave}
      customClass="lg:inset-x-25p md:inset-x-25p lg:top-[100px] md:top-[100px] top-[50px]"
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <div className="text-start ">
        <h1 className="text-xl font-bold text-blue-500 mb-4">
          {t("common.deliveryman_assign_modal")}
        </h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative rounded-xl">
            <div className="relative rounded-xl">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={zoom}
                //@ts-ignore
                onLoad={(map) => (mapRef.current = map)}
              >
                <Marker
                  position={markerPosition}
                  draggable={true}
                  onDragEnd={handleMarkerDrag}
                />
              </GoogleMap>
            </div>
          </div>

          <div>
            <p className="text-gray-500 dark:text-white mb-2">
              {t("common.select_deliveryman_and_assign")}
            </p>

            <AppSelect
              placeholder={t("place_holder.select_deliveryman")}
              value={String(selectDeliveryman)}
              onSelect={handleDeliveryman}
              groups={deliveryman}
            />
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default AssignDeliverymanFromDetails;
