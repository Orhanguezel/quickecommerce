"use client";
import multiLang from "@/components/molecules/multiLang.json";
import { SubmitButton } from "@/components/blocks/shared";
import {
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import {
  useAreaStoreMutation,
  useAreaUpdateMutation,
} from "@/modules/admin-section/business-operations/area/area.action";
import {
  AreaFormData,
  areaSchema,
} from "@/modules/admin-section/business-operations/area/area.schema";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { zodResolver } from "@hookform/resolvers/zod";

import { Hand, Info, Pentagon } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// JSON scaffold stack (standard)
import {
  AdminI18nJsonPanel,
  buildI18nJsonFromFlatValues,
  applyI18nJsonToFlatForm,
  makeRHFSetValueAny, safeObject,
  ensureLangKeys,
  useFormI18nScaffold,
  initI18nFlatFormFromEntity,
} from '@/lib/json';
import type {  LangKeys, ViewMode, LangType} from '@/lib/json';


// Dynamically import Google Maps components with no SSR
const GoogleMap = dynamic(
  () => import("@react-google-maps/api").then((mod) => mod.GoogleMap),
  { ssr: false }
);
const Marker = dynamic(
  () => import("@react-google-maps/api").then((mod) => mod.Marker),
  { ssr: false }
);
const Polygon = dynamic(
  () => import("@react-google-maps/api").then((mod) => mod.Polygon),
  { ssr: false }
);
const Autocomplete = dynamic(
  () => import("@react-google-maps/api").then((mod) => mod.Autocomplete),
  { ssr: false }
);
const DrawingManager = dynamic(
  () => import("@react-google-maps/api").then((mod) => mod.DrawingManager),
  { ssr: false }
);


const CreateOrUpdateAreaForm = ({ data }: any) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const multiLangData = useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const mapContainerStyle = {
    width: "100%",
    height: "350px",
  };
  const { isLoaded, isEnabled: isMapEnabled, apiKey: googleMapKey, isPending: isMapSettingsPending } = useGoogleMaps();
  const [markerPosition, setMarkerPosition] = useState({
    lat: 23.8103,
    lng: 90.4125,
  });
  const defaultCenter = { lat: 23.8103, lng: 90.4125 };
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(8);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [polygonCoords, setPolygonCoords] = useState<any>([]);
  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setCenter({ lat, lng });
        setMarkerPosition({ lat, lng });
        setZoom(12);

        setErrorMessage("");
      }
    }
  };

  const handlePolygonComplete = async (polygon: any) => {
    const path = polygon.getPath();
    const coordinates: { lat: number; lng: number }[] = [];

    for (let i = 0; i < path.getLength(); i++) {
      const coord = path.getAt(i).toJSON();
      coordinates.push(coord);
    }

    setPolygonCoords(coordinates);

    if (coordinates.length > 0) {
      const firstCoord = coordinates[0];

      setMarkerPosition({ lat: firstCoord.lat, lng: firstCoord.lng });

      const stateName = await fetchAddress(firstCoord.lat, firstCoord.lng);
      setValue("state_df", stateName);
    }
  };
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
      const address = await fetchAddress(newLat, newLng);
      setMarkerPosition({ lat: newLat, lng: newLng });
      setValue("state_df", address);
      setErrorMessage("");
    } else {
      setErrorMessage(
        "Invalid marker position. Please drag the marker inside the highlighted area."
      );
    }
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapKey}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address");
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0].address_components[1]?.long_name;
      }
      return "Address not found";
    } catch (error) {
      return "Error fetching address";
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<AreaFormData>({
    resolver: zodResolver(areaSchema),
  });
  useEffect(() => {
    if (data) {
      setValue("name_df", data.name);
      setValue("state_df", data.state);
      setValue("city_df", data.city);

      if (data.translations && typeof data.translations === 'object') {
        Object.keys(data.translations).forEach((language) => {
          const translation = data.translations[language];
          setValue(`name_${language}` as keyof AreaFormData, translation?.name);
          setValue(`state_${language}` as keyof AreaFormData, translation?.state);
          setValue(`city_${language}` as keyof AreaFormData, translation?.city);
        });
      }
      setPolygonCoords(data?.coordinates);
      setMarkerPosition({
        lat: Number(data?.center_latitude),
        lng: Number(data?.center_longitude),
      });
    }
  }, [data, setValue]);

  const handlePolygonEdit = (e: any) => {
    const newCoords = e
      .getPath()
      .getArray()
      .map((coord: any) => coord.toJSON());

    setPolygonCoords(newCoords);

    if (newCoords.length > 0) {
      const firstCoord = newCoords[0];
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ location: firstCoord }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const addressComponents = results[0].address_components;
          const stateComponent = addressComponents.find((comp) =>
            comp.types.includes("administrative_area_level_1")
          );

          if (stateComponent) {
            const stateName = stateComponent.long_name;
            setValue("state_df", stateName);
          }
        } else {
        }
      });
    }
  };

  const { mutate: areaStore, isPending } = useAreaStoreMutation();
  const { mutate: areaUpdate, isPending: isUpdating } = useAreaUpdateMutation();

  const onSubmit = async (values: AreaFormData) => {
    if (polygonCoords.length === 0) {
      return toast.error(t("toast.area_is_required"));
    }
    if (errorMessage) {
      return toast.error(
        "Invalid marker position. Please drag the marker inside the highlighted area."
      );
    }
    const submissionData = {
      id: data ? data.id : "",
      name: values.name_df,
      state: values.state_df,
      city: values.city_df,
      translations: multiLangData
        .slice(1)
        .filter((lang) => (values as any)[`name_${lang.id}`])
        .map((lang) => ({
          language_code: lang.id,
          name: (values as any)[`name_${lang.id}`],
          state: (values as any)[`state_${lang.id}`],
          city: (values as any)[`city_${lang.id}`],
        })),
      coordinates: polygonCoords,
    };

    return data
      ? areaUpdate(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              reset();
              dispatch(setRefetch(true));
            },
          }
        )
      : areaStore(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              reset();
              dispatch(setRefetch(true));
            },
          }
        );
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <div className="">
              <div className="relative">
                {isMapSettingsPending ? (
                  <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800" style={mapContainerStyle}>
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-gray-500 dark:text-gray-400">{t("common.loading")}...</p>
                    </div>
                  </div>
                ) : !isMapEnabled || !googleMapKey ? (
                  <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800" style={mapContainerStyle}>
                    <div className="text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        {!googleMapKey ? t("common.google_map_api_key_not_set") : t("common.google_map_disabled")}
                      </p>
                    </div>
                  </div>
                ) : !isLoaded ? (
                  <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800" style={mapContainerStyle}>
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-gray-500 dark:text-gray-400">{t("common.loading_map")}...</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-16 md:mt-0">
                    <Autocomplete
                      onLoad={(autocomplete) =>
                        (autocompleteRef.current = autocomplete)
                      }
                      onPlaceChanged={handlePlaceSelect}
                      className=" absolute z-10 top-[-50px] md:top-2 right-0 md:right-[20%] lg:right-[30%] w-full md:w-[40%]"
                    >
                      <Input
                        type="text"
                        placeholder="Search for a location"
                        className="w-full app-input mb-2"
                      />
                    </Autocomplete>

                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={center}
                      zoom={zoom}
                      //@ts-ignore
                      onLoad={(map) => (mapRef.current = map)}
                    >
                      <Polygon
                        path={polygonCoords}
                        options={{
                          fillColor: "#2196F3",
                          strokeColor: "#2196F3",
                          editable: true,
                          draggable: false,
                        }}
                        onEdit={handlePolygonEdit}
                      />
                      {polygonCoords.length > 0 && markerPosition && (
                        <Marker
                          position={markerPosition}
                          draggable={true}
                          onDragEnd={handleMarkerDrag}
                        />
                      )}

                      <DrawingManager
                        onPolygonComplete={handlePolygonComplete}
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
              <div className="w-full text-center ">
                {errorMessage && (
                  <p className="text-red-500 text-sm py-4">{errorMessage}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 md:p-6">
            <div className="grid lg:grid-cols-5 grid-cols-1 gap-8 ">
              <div className="mr-4 col-span-2">
                <div>
                  <div className="text-xl font-semibold text-blue-500 flex items-center gap-2 mb-2">
                    <span>{t("common.instructions")} </span>
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="mt-1 w-4 text-custom-dark-blue cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-custom-dark-blue w-80">
                            <p className="p-1 text-sm font-medium">
                              {t("common.create_connect_dot")}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
                <div className="">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-white flex items-center gap-2">
                      <span className="border border-blue-500 p-1 text-blue-500">
                        <Hand />
                      </span>
                      {t("common.use_hand_tool")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-white flex items-center gap-2 ">
                      <span className="border border-blue-500 p-1 text-blue-500">
                        <Pentagon />
                      </span>{" "}
                      {t("common.use_shape_tool")}
                    </p>
                  </div>
                  <div className="shadow-lg p-2 mt-2 relative w-full h-[150px]">
                    <Image
                      src="/images/Geofencing-GIF-New-Look.gif"
                      alt="Picture of the map instruction"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="w-full h-full"
                      priority
                    />
                  </div>
                </div>
              </div>

              <Tabs dir={dir} defaultValue="df" className="col-span-3">
                <TabsList className="flex justify-start bg-white dark:bg-[#1f2937]">
                  {multiLangData.map((lang) => (
                    <TabsTrigger key={lang.id} value={lang.id}>
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {multiLangData.map((lang) => {
                  return (
                    <TabsContent className="" key={lang.id} value={lang.id}>
                      <div className="mb-6">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {" "}
                            {t("label.area")} (
                            {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                          </span>
                        </div>
                        <Input
                          id={`name_${lang.id}`}
                          {...register(`name_${lang.id}` as keyof AreaFormData)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                        {errors[`name_${lang.id}` as keyof AreaFormData] && (
                          <p className="text-red-500 text-sm mt-1">
                            {(errors as any)[`name_${lang.id}`]?.message}
                          </p>
                        )}
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t("label.state")} (
                            {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                          </span>
                        </p>
                        <Input
                          id={`state_${lang.id}`}
                          {...register(
                            `state_${lang.id}` as keyof AreaFormData
                          )}
                          className="app-input"
                          placeholder="Enter state"
                        />
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t("label.city")} (
                            {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                          </span>
                        </p>
                        <Input
                          id={`city_${lang.id}`}
                          {...register(`city_${lang.id}` as keyof AreaFormData)}
                          className="app-input"
                          placeholder="Enter city"
                        />
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 space-x-4 sticky bottom-0 rounded-lg shadow w-full bg-white p-4 flex items-center">
          <SubmitButton
            UpdateData={data}
            IsLoading={isPending || isUpdating}
            AddLabel={t("button.add_area")}
            UpdateLabel={t("button.update_area")}
            disabled={errorMessage}
          />
        </div>
      </form>
    </div>
  );
};
export default CreateOrUpdateAreaForm;
