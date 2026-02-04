"use client";

import { ReactNode, useMemo } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { useGoogleMapForAllQuery } from "@/modules/admin-section/google-map-settings/google-map-settings.action";

type GoogleMapsLoaderProps = {
  children: ReactNode;
  locale: string;
};

const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({
  children,
  locale,
}) => {
  const { GoogleMapData, isPending, error } = useGoogleMapForAllQuery({});
  const settings = (GoogleMapData as any)?.message;

  const apiKey = settings?.com_google_map_api_key;
  const isEnabled = settings?.com_google_map_enable_disable === "on";

  const memoKey = useMemo(() => `${apiKey}-${locale}`, [apiKey, locale]);

  // If disabled or loading settings → just render children
  if (isPending || error || !apiKey || !isEnabled) {
    return <>{children}</>;
  }

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["places", "drawing", "geometry"],
  });

  // If Google Maps script loading fails → fallback to children
  if (loadError || !isLoaded) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default GoogleMapsLoader;
