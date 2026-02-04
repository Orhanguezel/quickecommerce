import StepTracker from "@/components/blocks/admin-section/orders/components/StepTracker";
import { AppModal } from "@/components/blocks/common/AppModal";
import { Card, CardContent } from "@/components/ui";
import { useGoogleMapForAllQuery } from "@/modules/admin-section/google-map-settings/google-map-settings.action";
import { useUpdateLiveLocation } from "@/modules/admin-section/orders/refund-request/refund-request.action";
import {
  DirectionsRenderer,
  GoogleMap,
  Marker,
  Polyline
} from "@react-google-maps/api";
import { Check, RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
  CurrencyData: any;
  OrderTrackingTime?: any;
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
  {
    title: "Pickup",
    value: "pickup",
    icon: <Check className="w-6 h-6" />,
  },
  { title: "Shipped", value: "shipped", icon: <Check className="w-6 h-6" /> },
  {
    title: "Delivered",
    value: "delivered",
    icon: <Check className="w-6 h-6" />,
  },
];
const OrderTrackerModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
  OrderTrackingTime,
}) => {
  const t = useTranslations();
  const pathname = usePathname();
  const localeDir = pathname.split("/")[1];
  const dir = localeDir === "ar" ? "rtl" : "ltr";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { GoogleMapData } = useGoogleMapForAllQuery({});
  const [googleMapKey, setGoogleMapKey] = useState("");

  function buildStepsWithTimes(
    steps: any,
    tracking:
      | { status: string; created_at: string; label?: string }[]
      | undefined
  ) {
    const byStatus = new Map(
      (tracking ?? []).map((t) => [t.status.toLowerCase(), t])
    );
    const temp = steps.map((s: any) => ({
      ...s,
      subtitle: byStatus.get(s.value)?.created_at ?? "",
      hint: byStatus.get(s.value)?.label ?? "",
    }));

    let carryTime = "";
    for (let i = temp.length - 1; i >= 0; i--) {
      if (!temp[i].subtitle && carryTime) {
        temp[i].subtitle = carryTime;
      } else if (temp[i].subtitle) {
        carryTime = temp[i].subtitle;
      }
    }
    return temp;
  }

  const stepsWithTimes = React.useMemo(
    () => buildStepsWithTimes(steps, OrderTrackingTime),
    [OrderTrackingTime]
  );

  useEffect(() => {
    //@ts-ignore
    const mapSettings = GoogleMapData?.message;
    if (mapSettings?.com_google_map_enable_disable === "on") {
      setGoogleMapKey(mapSettings.com_google_map_api_key);
    }
  }, [GoogleMapData]);

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  const getDirections = (
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ) => {
    if (!window.google) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          toast.error(
            result instanceof Error
              ? `Error refetching data: ${result}`
              : "An unknown error occurred while refetching data"
          );
        }
      }
    );
  };

  const activeStepIndex = steps.findIndex(
    (step) => step.value.toLowerCase() === row?.status.toLowerCase()
  );
  const { order_master = {}, store_details = {} } = row;
  const [distance, setDistance] = useState<number | null>(null);
  const [liveLocation, setLiveLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const customerLocation = useMemo(
    () => ({
      lat: Number(order_master?.shipping_address?.latitude),
      lng: Number(order_master?.shipping_address?.longitude),
    }),
    [
      order_master?.shipping_address?.latitude,
      order_master?.shipping_address?.longitude,
    ]
  );

  const storeLocation = useMemo(
    () => ({
      lat: Number(store_details?.latitude),
      lng: Number(store_details?.longitude),
    }),
    [store_details?.latitude, store_details?.longitude]
  );

  const [activeStep, setActiveStep] = useState(
    activeStepIndex !== -1 ? activeStepIndex : 1
  );

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
  );

  useEffect(() => {
    if (
      isModalOpen &&
      googleMapKey &&
      row?.status.toLowerCase() === "shipped" &&
      row?.order_id
    ) {
      handleLiveLocation(row.order_id);
    }
  }, [
    isModalOpen,
    row?.status,
    row?.order_id,
    googleMapKey,
    handleLiveLocation,
  ]);

  const getMapCenter = () => {
    if (row.status.toLowerCase() === "delivered") {
      return customerLocation;
    } else if (row.status.toLowerCase() === "shipped" && liveLocation) {
      return liveLocation;
    }
    return storeLocation;
  };

  useEffect(() => {
    if (row.status.toLowerCase() === "shipped" && liveLocation) {
      const dist = calculateDistance(
        liveLocation.lat,
        liveLocation.lng,
        customerLocation.lat,
        customerLocation.lng
      );
      setDistance(dist);
    } else if (
      customerLocation.lat &&
      customerLocation.lng &&
      storeLocation.lat &&
      storeLocation.lng
    ) {
      const dist = calculateDistance(
        storeLocation.lat,
        storeLocation.lng,
        customerLocation.lat,
        customerLocation.lng
      );
      setDistance(dist);
    }
  }, [customerLocation, storeLocation, liveLocation, row.status]);

  useEffect(() => {
    if (!isModalOpen) return;

    const origin =
      row.status.toLowerCase() === "shipped" && liveLocation
        ? liveLocation
        : storeLocation;

    const destination = customerLocation;

    if (origin && destination) {
      getDirections(origin, destination);
    }
  }, [isModalOpen, row.status, liveLocation, storeLocation, customerLocation]);

  if (!googleMapKey) {
    return <div>Loading Google Maps...</div>;
  }

  return (
    <AppModal
      trigger={trigger}
      customClass="lg:inset-x-25p md:inset-x-25p lg:top-[100px] md:top-[100px] top-[50px]"
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      cancelButtonLabel="Close"
    >
      <div className="text-start ">
        <h1 className="text-2xl font-semibold mt-6 mb-4 border-b pb-6 border-slate-300">
          Track Order
        </h1>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 text-sm font-semibold">
            <span className="text-slate-500">Invoice No</span>{" "}
            <span>: {row?.invoice_number}</span>{" "}
          </p>
          <button
            onClick={() => handleLiveLocation(row.order_id)}
            disabled={loading}
            className={`flex items-center gap-1 p-2 border ${
              loading
                ? "border-slate-300 bg-slate-100 text-slate-400"
                : "border-teal-500 bg-teal-50 text-teal-500 hover:border-teal-600 hover:bg-teal-100 hover:text-teal-600"
            } rounded cursor-pointer`}
          >
            <RefreshCcw
              width={16}
              height={16}
              className={loading ? "rotate-animation" : ""}
            />
          </button>
        </div>
        <Card>
          <CardContent className="p-4 mt-4">
            <div
              className={` ${
                dir === "rtl" ? "mr-0 xl:mr-[6rem]" : "ml-0 xl:ml-[5rem]"
              } `}
            >
              <StepTracker
                steps={stepsWithTimes}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
              />
            </div>

            <div className="mt-4 ">
              <Card>
                <CardContent className="p-0 rounded-lg">
                  <div>
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={getMapCenter()}
                      zoom={12}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                      }}
                    >
                      {directions && (
                        <DirectionsRenderer
                          directions={directions}
                          options={{
                            suppressMarkers: true,
                            polylineOptions: {
                              strokeColor: "#4285F4",
                              strokeWeight: 5,
                              strokeOpacity: 0.7,
                            },
                          }}
                        />
                      )}

                      {["confirmed", "cancelled", "processing"].includes(
                        row.status.toLowerCase()
                      ) && <Marker position={storeLocation} />}

                      {["shipped", "delivered"].includes(
                        row.status.toLowerCase()
                      ) && <Marker position={customerLocation} />}

                      {row.status.toLowerCase() === "shipped" &&
                        liveLocation && (
                          <>
                            <Marker position={liveLocation} />
                            <Polyline
                              path={[liveLocation, customerLocation]}
                              options={{
                                strokeColor: "#4285F4",
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                              }}
                            />
                          </>
                        )}
                    </GoogleMap>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppModal>
  );
};

export default OrderTrackerModal;
