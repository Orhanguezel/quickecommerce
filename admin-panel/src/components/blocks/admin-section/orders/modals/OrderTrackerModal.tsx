
import { AppModal } from "@/components/blocks/common/AppModal";
import { Card, CardContent } from "@/components/ui";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import { useUpdateLiveLocation } from "@/modules/admin-section/orders/refund-request/refund-request.action";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { Check, RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import StepTracker from "../components/StepTracker";

interface StatusUpdateModalProps {
  trigger: any;
  refetch?: any;
  row: any;
  CurrencyData: any;
  OrderTrackingTime?: any;
}

interface LatLng { lat: number; lng: number }
interface RouteResult {
  path: LatLng[];
}

const OrderTrackerModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
  OrderTrackingTime,
}) => {
  const t = useTranslations();
  const steps = useMemo(
    () => [
      { title: t("common.pending"), value: "pending", icon: <Check className="w-6 h-6" /> },
      {
        title: t("common.confirmed"),
        value: "confirmed",
        icon: <Check className="w-6 h-6" />,
      },
      {
        title: t("common.processing"),
        value: "processing",
        icon: <Check className="w-6 h-6" />,
      },
      { title: t("common.pickup"), value: "pickup", icon: <Check className="w-6 h-6" /> },
      { title: t("common.shipped"), value: "shipped", icon: <Check className="w-6 h-6" /> },
      {
        title: t("common.delivered"),
        value: "delivered",
        icon: <Check className="w-6 h-6" />,
      },
    ],
    [t]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoaded, isEnabled: isMapEnabledBySettings, isPending } = useGoogleMaps();

  const [directionsResult, setDirectionsResult] = useState<RouteResult | null>(
    null
  );
  const [hasCenteredInitially, setHasCenteredInitially] = useState(false);

  const mapRef = useRef<any>(null);

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
    [steps, OrderTrackingTime]
  );

  const [liveLocation, setLiveLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const activeStepIndex = steps.findIndex(
    (step) => step.value.toLowerCase() === row?.status?.toLowerCase()
  );
  const { order_master = {}, store_details = {} } = row;

  const customerLocation = useMemo(
    () => ({
      lat:
        row?.delivery_option === "takeaway"
          ? Number(order_master?.customer?.address?.latitude)
          : Number(order_master?.shipping_address?.latitude),
      lng:
        row?.delivery_option === "takeaway"
          ? Number(order_master?.customer?.address?.longitude)
          : Number(order_master?.shipping_address?.longitude),
    }),
    [row?.delivery_option, order_master]
  );

  const storeLocation = useMemo(
    () => ({
      lat: Number(store_details?.latitude),
      lng: Number(store_details?.longitude),
    }),
    [store_details]
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
            refetch?.();
            setLoading(false);
          },
          onError: () => {
            setLoading(false);
          },
        }
      );
    },
    [refetch, brandStatus]
  );

  const getMapCenter = useCallback(() => {
    const status =
      typeof row?.status === "string" ? row.status.toLowerCase() : "";

    if (status === "delivered") {
      return customerLocation;
    } else if ((status === "shipped" || status === "pickup") && liveLocation) {
      return liveLocation;
    }

    return storeLocation;
  }, [row?.status, customerLocation, storeLocation, liveLocation]);

  useEffect(() => {
    if (
      isModalOpen &&
      typeof row?.status === "string" &&
      row.status.toLowerCase() === "shipped" &&
      row?.order_id
    ) {
      handleLiveLocation(row.order_id);
    }
  }, [isModalOpen, row, handleLiveLocation]);

  const showMap =
    !isPending && isLoaded && isMapEnabledBySettings;

  useEffect(() => {
    if (showMap && mapRef.current && window.google?.maps) {
      window.google.maps.event.trigger(mapRef.current, "resize");
      const center = getMapCenter();
      mapRef.current.panTo(center);
    }
  }, [showMap, getMapCenter]);

  const calculateRoute = useCallback(
    async (
      origin: LatLng,
      destination: LatLng,
      routeType: "live" | "store"
    ) => {
      if (
        isNaN(origin.lat) ||
        isNaN(origin.lng) ||
        isNaN(destination.lat) ||
        isNaN(destination.lng) ||
        (origin.lat === 0 && origin.lng === 0) ||
        (destination.lat === 0 && destination.lng === 0)
      ) {
        setDirectionsResult(null);
        return;
      }

      if (
        !window.google ||
        !window.google.maps ||
        !window.google.maps.DirectionsService
      ) {
        setDirectionsResult(null);
        return;
      }

      setDirectionsResult(null);

      const directionsService = new window.google.maps.DirectionsService();

      try {
        const result = await directionsService.route({
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });

        if (result.routes && result.routes.length > 0) {
          setDirectionsResult({
            path: result.routes[0].overview_path.map((p) => ({
              lat: p.lat(),
              lng: p.lng(),
            })),
          });
        } else {
        }
      } catch (error: any) {
        let errorMessage = "Route Calculation Failed";
        if (error.code === "ZERO_RESULTS") {
          errorMessage = "No Route Found Between Points";
        } else if (
          error.code === "NOT_FOUND" ||
          error.code === "INVALID_REQUEST"
        ) {
          errorMessage = "invalid locations for route";
        } else if (error.message) {
          errorMessage = `${errorMessage}: ${error.message}`;
        }
      } finally {
      }
    },
    []
  );

  useEffect(() => {
    const status = row?.status?.toLowerCase();
    const isModalOpenAndShipped = isModalOpen && status === "shipped";
    const isNotDelivered = status !== "delivered";

    if (
      showMap &&
      isModalOpenAndShipped &&
      liveLocation &&
      customerLocation.lat &&
      customerLocation.lng
    ) {
      calculateRoute(liveLocation, customerLocation, "live");
    } else if (
      showMap &&
      isModalOpen &&
      isNotDelivered &&
      storeLocation.lat &&
      storeLocation.lng &&
      customerLocation.lat &&
      customerLocation.lng
    ) {
      calculateRoute(storeLocation, customerLocation, "store");
    } else {
      setDirectionsResult(null);
    }
  }, [
    showMap,
    isModalOpen,
    row?.status,
    liveLocation,
    customerLocation,
    storeLocation,
    calculateRoute,
  ]);

  const storeIconSvg = `<svg width="50" height="50" viewBox="0 0 336 424" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M336 168C336 200.32 315.68 241.04 289.2 280.48C263.787 317.338 235.741 352.31 205.28 385.12C183.6 408.8 168 424 168 424C168 424 152.4 408.8 130.72 385.12C81.2 331.04 0 232.56 0 168C0 123.444 17.6999 80.7122 49.2061 49.2061C80.7122 17.7 123.444 0 168 0C212.556 0 255.288 17.7 286.794 49.2061C318.3 80.7122 336 123.444 336 168Z" fill="#ED1C24"/>
  <path d="M168 288C234.274 288 288 234.274 288 168C288 101.726 234.274 48 168 48C101.726 48 48 101.726 48 168C48 234.274 101.726 288 168 288Z" fill="#F1F2F2"/>
  <path d="M168 48C163.952 48 159.952 48.216 156 48.608C185.587 51.5977 213.009 65.4664 232.952 87.5256C252.894 109.585 263.936 138.263 263.936 168C263.936 197.737 252.894 226.415 232.952 248.474C213.009 270.534 185.587 284.402 156 287.392C159.952 287.784 163.952 288 168 288C199.826 288 230.348 275.357 252.853 252.853C275.357 230.348 288 199.826 288 168C288 136.174 275.357 105.652 252.853 83.1472C230.348 60.6428 199.826 48 168 48Z" fill="#D1D3D4"/>
  <path d="M232 136H104L112 104H224L232 136Z" fill="#A97C50"/>
  <path d="M104 136H232V232H104V136Z" fill="#8B5E3C"/>
  <path d="M136 232H232V136C232 161.461 221.886 185.879 203.882 203.882C185.879 221.886 161.461 232 136 232Z" fill="#754C29"/>
  <path d="M152 136H184V168H152V136Z" fill="#EE8700"/>
  <path d="M152 104H184V136H152V104Z" fill="#FF9811"/>
  <path d="M184 200C181.878 200 179.843 200.843 178.343 202.343C176.843 203.843 176 205.878 176 208C176 210.122 176.843 212.157 178.343 213.657C179.843 215.157 181.878 216 184 216H208C210.122 216 212.157 215.157 213.657 213.657C215.157 212.157 216 210.122 216 208C216 205.878 215.157 203.843 213.657 202.343C212.157 200.843 210.122 200 208 200H184Z" fill="#F1F2F2"/>
</svg>
`;

  const CUSIconSvg = `<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M42.8593 19.0491C42.802 23.7506 40.9482 28.0123 37.9286 31.1657C33.7051 35.5994 29.921 40.3963 27.1881 45.862L25.8865 48.4478C25.516 49.1838 24.4654 49.1841 24.0944 48.4484L23.0602 46.3972C20.3846 41.0269 17.0593 35.9435 12.702 31.8154C9.28105 28.5664 7.14062 23.9608 7.14062 18.8583C7.14062 8.80585 15.4349 0.70276 25.5446 1.00837C35.1193 1.3142 42.9548 9.47444 42.8593 19.0491Z" fill="#FF4848"/>
<path d="M23.4526 3.95285C23.3266 3.95285 23.2182 3.85764 23.2046 3.72922C23.1899 3.59201 23.2895 3.46897 23.4267 3.45432C24.1259 3.3801 24.8393 3.35178 25.5507 3.37522C25.6884 3.37961 25.7968 3.49485 25.7929 3.63303C25.7885 3.77073 25.6977 3.87864 25.5351 3.87522C24.8506 3.8547 24.1562 3.88058 23.4795 3.95138C23.4707 3.95236 23.4614 3.95285 23.4526 3.95285Z" fill="white"/>
<path d="M9.83984 19.1085C9.70166 19.1085 9.58984 18.9967 9.58984 18.8585C9.58984 12.4942 13.5771 6.68269 19.5117 4.39704C19.6392 4.3487 19.7847 4.41218 19.835 4.54059C19.8843 4.6695 19.8203 4.81403 19.6914 4.86383C13.9483 7.07526 10.0899 12.6993 10.0899 18.8585C10.0898 18.9967 9.97802 19.1085 9.83984 19.1085Z" fill="white"/>
<path d="M36.9806 18.7865C36.9806 25.4288 31.5962 30.7599 25.0072 30.7599C18.4409 30.7599 13.0195 25.4583 13.0195 18.7865C13.0195 12.1711 18.3918 6.79883 25.0072 6.79883C31.6226 6.79883 36.9806 12.1711 36.9806 18.7865Z" fill="white"/>
<path d="M29.1565 16.5925C29.1565 18.8893 27.2988 20.7464 25.0026 20.7464C22.7217 20.7464 20.8438 18.9062 20.8438 16.5925C20.8438 14.2974 22.7076 12.4336 25.0026 12.4336C27.2977 12.4336 29.1565 14.2974 29.1565 16.5925Z" fill="#1664FF"/>
<path d="M33.9796 26.7166C31.7935 29.2027 28.5787 30.7601 25.0067 30.7601C21.4347 30.7601 18.2199 29.2027 16.0195 26.7166C18.2056 24.2162 21.4204 22.6445 25.0067 22.6445C28.593 22.6445 31.8078 24.2162 33.9796 26.7166Z" fill="#1664FF"/>
</svg>
`;

  const storeIconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    storeIconSvg
  )}`;

  const cusIconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    CUSIconSvg
  )}`;

  useEffect(() => {
    if (mapRef.current && showMap && !hasCenteredInitially) {
      const center = getMapCenter();
      if (center.lat && center.lng) {
        mapRef.current.panTo(center);
        setHasCenteredInitially(true);
      }
    }
  }, [getMapCenter, showMap, hasCenteredInitially]);

  useEffect(() => {
    if (isModalOpen) {
      setHasCenteredInitially(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  return (
    <AppModal
      trigger={trigger}
      customClass="lg:inset-x-20p md:inset-x-10p lg:top-[60px] md:top-[200px] top-[100px]"
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <div className="text-start ">
        <h1 className="text-xl font-bold text-[var(--primary)] mt-6 mb-4 border-b pb-6 border-slate-300">
          {t("orders.track_order")}
        </h1>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 text-sm font-semibold">
            <span className="text-slate-500">{t("table_header.invoice_no")}</span>{" "}
            <span>: {row?.invoice_number}</span>{" "}
          </p>
          <button
            onClick={() => handleLiveLocation(row.order_id)}
            disabled={loading}
            className={`flex items-center gap-1 p-2 border ${loading
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
            <div className="ml-[3rem]">
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
                    {showMap ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={16}
                        onLoad={(map) => {
                          mapRef.current = map;
                          const center = getMapCenter();
                          map.panTo(center);
                        }}
                      >
                        {(typeof row?.status === "string" &&
                          row.status.toLowerCase() !== "pickup" &&
                          row.status.toLowerCase() !== "shipped" &&
                          row.status.toLowerCase() !== "delivered") ||
                          (typeof row?.status === "string" &&
                            (row.status.toLowerCase() === "pickup" ||
                              row.status.toLowerCase() === "shipped") &&
                            !liveLocation) ? (
                          <Marker
                            position={storeLocation}
                            icon={storeIconUrl}
                          />
                        ) : null}

                        {customerLocation.lat && customerLocation.lng && (
                          <Marker
                            position={customerLocation}
                            icon={cusIconUrl}
                          />
                        )}

                        {typeof row?.status === "string" &&
                          (row.status.toLowerCase() === "pickup" ||
                            row.status.toLowerCase() === "shipped") &&
                          liveLocation &&
                          directionsResult && (
                            <>
                              <Marker
                                position={liveLocation}
                                icon={{
                                  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                                                                <svg width="50" height="50" viewBox="0 0 336 424" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M336 168C336 200.32 315.68 241.04 289.2 280.48C263.787 317.338 235.741 352.31 205.28 385.12C183.6 408.8 168 424 168 424C168 424 152.4 408.8 130.72 385.12C81.2 331.04 0 232.56 0 168C0 123.444 17.6999 80.7122 49.2061 49.2061C80.7122 17.7 123.444 0 168 0C212.556 0 255.288 17.7 286.794 49.2061C318.3 80.7122 336 123.444 336 168Z" fill="#ED1C24"/>
                                    <path d="M168 288C234.274 288 288 234.274 288 168C288 101.726 234.274 48 168 48C101.726 48 48 101.726 48 168C48 234.274 101.726 288 168 288Z" fill="#F1F2F2"/>
                                    <circle cx="168" cy="120" r="18" fill="#533824ff"/>
                                    <rect x="150" y="138" width="36" height="60" fill="#8B5E3C"/>
                                    <rect x="138" y="138" width="12" height="48" fill="#A97C50"/>
                                    <rect x="186" y="138" width="12" height="48" fill="#A97C50"/>
                                    <rect x="150" y="198" width="12" height="36" fill="#754C29"/>
                                    <rect x="174" y="198" width="12" height="36" fill="#754C29"/>
                                    <rect x="138" y="138" width="42" height="24" fill="#EE8700" stroke="#FF9811" strokeWidth="2"/>
                                  </svg>
                                                                  `)}`,
                                  scaledSize: new window.google.maps.Size(40, 60),
                                  anchor: new window.google.maps.Point(20, 60)
                                }}
                              />
                              <Polyline
                                path={directionsResult.path}
                                options={{
                                  strokeColor: "#4285F4",
                                  strokeOpacity: 0.8,
                                  strokeWeight: 2,
                                }}
                              />
                            </>
                          )}

                        {row.status !== "delivered" &&
                          (typeof row?.status === "string" &&
                            row.status.toLowerCase() !== "pickup" &&
                            row.status.toLowerCase() !== "shipped" &&
                            !liveLocation &&
                            directionsResult ? (
                            <Polyline
                              path={directionsResult.path}
                              options={{
                                strokeColor: "#4285F4",
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                              }}
                            />
                          ) : null)}
                      </GoogleMap>
                    ) : (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={16}
                        onLoad={(map) => {
                          mapRef.current = map;
                          const center = getMapCenter();
                          map.panTo(center);
                        }}
                      >
                        {(typeof row?.status === "string" &&
                          row.status.toLowerCase() !== "pickup" &&
                          row.status.toLowerCase() !== "shipped" &&
                          row.status.toLowerCase() !== "delivered") ||
                          (typeof row?.status === "string" &&
                            (row.status.toLowerCase() === "pickup" ||
                              row.status.toLowerCase() === "shipped") &&
                            !liveLocation) ? (
                          <Marker
                            position={storeLocation}
                            icon={storeIconUrl}
                          />
                        ) : null}

                        {customerLocation.lat && customerLocation.lng && (
                          <Marker
                            position={customerLocation}
                            icon={cusIconUrl}
                          />
                        )}

                        {typeof row?.status === "string" &&
                          (row.status.toLowerCase() === "pickup" ||
                            row.status.toLowerCase() === "shipped") &&
                          liveLocation &&
                          directionsResult && (
                            <>
                              <Marker
                                position={liveLocation}
                                icon={{
                                  url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                                }}
                              />
                              <Polyline
                                path={directionsResult.path}
                                options={{
                                  strokeColor: "#4285F4",
                                  strokeOpacity: 0.8,
                                  strokeWeight: 2,
                                }}
                              />
                            </>
                          )}

                        {row.status !== "delivered" &&
                          (typeof row?.status === "string" &&
                            row.status.toLowerCase() !== "pickup" &&
                            row.status.toLowerCase() !== "shipped" &&
                            !liveLocation &&
                            directionsResult ? (
                            <Polyline
                              path={directionsResult.path}
                              options={{
                                strokeColor: "#4285F4",
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                              }}
                            />
                          ) : null)}
                      </GoogleMap>
                    )}
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
