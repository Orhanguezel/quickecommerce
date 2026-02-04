"use client";
import { Card, CardContent } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useGoogleMapForAllQuery } from "@/modules/admin-section/google-map-settings/google-map-settings.action";
import {
  DrawingManager,
  GoogleMap,
  Marker,
  Polygon
} from "@react-google-maps/api";
import { Mail, MapPinHouse, PhoneCall, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

const StoreViewCard = ({ data }: any) => {
  const t = useTranslations();
  const editData = data;
  const { GoogleMapData } = useGoogleMapForAllQuery({});
  const GoogleMapSettingsMessage = (GoogleMapData as any)?.message;
  const [googleMapKey, setGoogleMapKey] = useState("");

  useEffect(() => {
    if (GoogleMapSettingsMessage?.com_google_map_enable_disable == "on") {
      setGoogleMapKey(GoogleMapSettingsMessage?.com_google_map_api_key);
    }
  }, [
    GoogleMapSettingsMessage?.com_google_map_enable_disable,
    GoogleMapSettingsMessage?.com_google_map_api_key,
  ]);

  const [polygonCoords, setPolygonCoords] = useState<any>(null);

  useEffect(() => {
    if (editData) {
      setPolygonCoords(editData?.area?.coordinates);
      setMarkerPosition({
        lat: Number(editData?.latitude),
        lng: Number(editData?.longitude),
      });
    }
  }, [editData]);

  const mapContainerStyle = {
    width: "100%",
    height: "200px",
  };

  const center = {
    lat: 23.8103,
    lng: 90.4125,
  };
  const [markerPosition, setMarkerPosition] = useState({
    lat: 23.8103,
    lng: 90.4125,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-3 gap-4 mt-4">
      <Card className="col-span-1 2xl:col-span-2 ">
        <CardContent className="p-2 md:p-6">
          <h2 className="text-lg md:text-2xl font-medium mb-4">
            {t("label.information")}
          </h2>
          <div className="grid xl:grid-cols-2 gap-4">
            <div className="flex flex-col md:flex-row items-center justify-start gap-4">
              <div className="relative w-32 h-32">
                <Image
                  loader={GlobalImageLoader}
                  src={editData?.logo_url ? editData?.logo_url : "/images/no-image.png"}
                  alt={
                    editData?.logo_url
                      ? editData?.logo_url
                      : ("NoImg" as string)
                  }
                  fill
                  sizes="128px"
                  className="w-full h-full border dark:border-gray-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <div className="capitalize text-xl font-bold text-blue-500 mb-2">
                  <h3>{editData?.name}</h3>
                </div>
                {editData?.store_type && (
                  <div className="flex items-center justify-start gap-2 text-black dark:text-white text-sm font-semibold">
                    <span>
                      <Store width={16} height={16} />
                    </span>
                    <span>{t("label.type")}:</span>
                    <span className="text-blue-500 capitalize">
                      {editData?.store_type}
                    </span>
                  </div>
                )}
                {editData?.phone && (
                  <div className="flex items-center justify-start gap-2 text-black dark:text-white text-sm font-semibold">
                    <span>
                      <PhoneCall width={16} height={16} />
                    </span>
                    <span>{t("label.phone")}:</span>
                    <span className="text-blue-500">{editData?.phone}</span>
                  </div>
                )}
                {editData?.email && (
                  <div className="flex items-center justify-start gap-2 text-black dark:text-white text-sm font-semibold">
                    <span>
                      <Mail width={16} height={16} />
                    </span>
                    <span>{t("label.email")}:</span>
                    <span className="text-blue-500">{editData?.email}</span>
                  </div>
                )}
                {editData?.address && (
                  <div className="flex items-center justify-start gap-2 text-black dark:text-white text-sm font-semibold">
                    <span>
                      <MapPinHouse width={16} height={16} />
                    </span>
                    <span>{t("label.address")}:</span>
                    <span className="text-blue-500">{editData?.address}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              {googleMapKey ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={8}
                >
                  {polygonCoords?.length > 0 && (
                    <Polygon
                      path={polygonCoords}
                      options={{
                        fillColor: "#2196F3",
                        strokeColor: "#2196F3",
                        editable: false,
                        draggable: false,
                      }}
                    />
                  )}

                  <Marker position={markerPosition} draggable={true} />
                  <DrawingManager
                    options={{
                      drawingControl: true,
                      drawingControlOptions: {
                        drawingModes: [
                          "polygon" as google.maps.drawing.OverlayType,
                        ],
                      },
                      polygonOptions: {
                        fillColor: "#2196F3",
                        strokeColor: "#2196F3",
                        editable: true,
                      },
                    }}
                  />
                </GoogleMap>
              ) : (
                <div className="mt-4">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={8}
                  >
                    {polygonCoords?.length > 0 && (
                      <Polygon
                        path={polygonCoords}
                        options={{
                          fillColor: "#2196F3",
                          strokeColor: "#2196F3",
                          editable: false,
                          draggable: false,
                        }}
                      />
                    )}

                    <Marker position={markerPosition} draggable={true} />
                    <DrawingManager
                      options={{
                        drawingControl: true,
                        drawingControlOptions: {
                          drawingModes: [
                            "polygon" as google.maps.drawing.OverlayType,
                          ],
                        },
                        polygonOptions: {
                          fillColor: "#2196F3",
                          strokeColor: "#2196F3",
                          editable: true,
                        },
                      }}
                    />
                  </GoogleMap>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 ">
        <CardContent className="p-2 md:p-6">
          <h2 className="text-lg md:text-2xl font-medium mb-4">
            {t("label.business_plan")}
          </h2>
          <div className="flex items-center justify-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-start gap-2 text-gray-500 dark:text-white text-lg font-semibold">
                <h4>{t("label.business_plan")}:</h4>
                <h4 className="text-blue-500 capitalize">
                  {editData?.subscription_type}
                </h4>
              </div>
              {editData?.subscription && (
                <div className="flex items-center justify-start gap-2 text-gray-500 dark:text-white text-lg font-semibold">
                  <h4>{t("label.package")}:</h4>
                  <h4 className="text-blue-500 capitalize">
                    {editData?.subscription}
                  </h4>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default StoreViewCard;
