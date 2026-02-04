import { AppModal } from "@/components/blocks/common/AppModal";
import { Card, CardContent } from "@/components/ui";
import {
  useGoogleMapForAllQuery,
  useGoogleMapSettingsQuery,
} from "@/modules/admin-section/google-map-settings/google-map-settings.action";
import { useUpdateLiveLocation } from "@/modules/admin-section/orders/refund-request/refund-request.action";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useState } from "react";
interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
  CurrencyData: any;
}
const steps = [
  { title: "Pending", value: "pending", icon: <Check className="w-6 h-6" /> },
  {
    title: "Confirmed",
    value: "confirmed",
    icon: <Check className="w-6 h-6" />,
  },
  {
    title: "Processing",
    value: "processing",
    icon: <Check className="w-6 h-6" />,
  },
  { title: "Shipped", value: "shipped", icon: <Check className="w-6 h-6" /> },
  {
    title: "Cancelled",
    value: "cancelled",
    icon: <Check className="w-6 h-6" />,
  },
  {
    title: "Delivered",
    value: "delivered",
    icon: <Check className="w-6 h-6" />,
  },
];
const DeliverymanLocationModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
  CurrencyData,
}) => {
  const t = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const activeStepIndex = steps.findIndex(
    (step) => step.value.toLowerCase() === row?.status.toLowerCase()
  );
  const { order_master = {}, store_details = {} } = row;

  const [liveLocation, setLiveLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const customerLocation = {
    lat: Number(order_master?.shipping_address?.latitude),
    lng: Number(order_master?.shipping_address?.longitude),
  };
  const storeLocation = {
    lat: Number(store_details?.latitude),
    lng: Number(store_details?.longitude),
  };
  // Set a default value in case row.status is not found
  const [activeStep, setActiveStep] = useState(
    activeStepIndex !== -1 ? activeStepIndex : 1
  );
  // Update activeStep whenever activeStepIndex changes
  useEffect(() => {
    setActiveStep(activeStepIndex !== -1 ? activeStepIndex : 1);
  }, [activeStepIndex]);

  const mapContainerStyle = {
    width: "100%",
    height: "350px",
  };
  const [loading, setLoading] = useState(false);
  const { mutate: brandStatus } = useUpdateLiveLocation();

  const handleLiveLocation = useCallback(
    (order_id: string) => {
      setLoading(true);
      brandStatus(
        { order_id },
        {
          onSuccess: (data: any) => {
            let LiveLocation = data?.data?.data;
            if (LiveLocation?.lat && LiveLocation?.lng) {
              setLiveLocation({
                lat: Number(LiveLocation.lat),
                lng: Number(LiveLocation.lng),
              });
            }
            refetch();
            setLoading(false);
          },
          onError: () => {
            setLoading(false);
          },
        }
      );
    },
    [brandStatus, refetch]
  ); // include dependencies used inside

  useEffect(() => {
    if (
      isModalOpen &&
      row?.status.toLowerCase() === "shipped" &&
      row?.order_id
    ) {
      handleLiveLocation(row.order_id);
    }
  }, [isModalOpen, row?.status, row?.order_id, handleLiveLocation]);

  const getMapCenter = () => {
    if (row.status.toLowerCase() === "delivered") {
      return customerLocation;
    } else if (row.status.toLowerCase() === "shipped" && liveLocation) {
      return liveLocation;
    }
    return storeLocation;
  };

  return (
    <AppModal
      trigger={trigger}
      customClass="lg:inset-x-25p md:inset-x-25p lg:top-[100px] md:top-[100px] top-[50px]"
      isOpen={isModalOpen} // Bind modal open state
      onOpenChange={setIsModalOpen}
      smallModal
    >
      <div className="text-start ">
        <h1 className="text-xl font-bold text-blue-500 mt-6 mb-4">
          Deliveryman Location
        </h1>

        <div className="my-4 ">
          <Card>
            <CardContent className="p-0 rounded-lg">
              <div>
                {googleMapKey ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={getMapCenter()}
                    zoom={14}
                  >
                    {row.status.toLowerCase() === "shipped" && liveLocation && (
                      <Marker
                        position={getMapCenter()}
                        draggable={true}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div className="mt-4">
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={getMapCenter()}
                      zoom={14}
                    >
                      {row.status.toLowerCase() === "shipped" &&
                        liveLocation && (
                          <Marker
                            position={getMapCenter()}
                            draggable={true}
                          />
                        )}
                    </GoogleMap>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppModal>
  );
};

export default DeliverymanLocationModal;
