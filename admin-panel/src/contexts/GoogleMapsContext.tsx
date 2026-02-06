"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { useGoogleMapForAllQuery } from "@/modules/admin-section/google-map-settings/google-map-settings.action";

type GoogleMapsContextType = {
  isLoaded: boolean;
  loadError: Error | undefined;
  isEnabled: boolean;
  apiKey: string;
};

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: undefined,
  isEnabled: false,
  apiKey: "",
});

const GOOGLE_LIBRARIES: ("places" | "drawing" | "geometry")[] = [
  "places",
  "drawing",
  "geometry",
];

type GoogleMapsProviderProps = {
  children: ReactNode;
};

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  const { GoogleMapData, isPending, error } = useGoogleMapForAllQuery({});
  const settings = (GoogleMapData as any)?.message;

  const apiKey = settings?.com_google_map_api_key || "";
  const isEnabled = settings?.com_google_map_enable_disable === "on";

  // Only load script if we have a valid API key and maps are enabled
  const shouldLoad = !isPending && !error && apiKey && isEnabled;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: shouldLoad ? apiKey : "",
    libraries: GOOGLE_LIBRARIES,
    // Prevent loading if no key or disabled
    preventGoogleFontsLoading: !shouldLoad,
  });

  const value = useMemo(
    () => ({
      isLoaded: shouldLoad ? isLoaded : false,
      loadError,
      isEnabled,
      apiKey,
    }),
    [isLoaded, loadError, isEnabled, apiKey, shouldLoad]
  );

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }
  return context;
};

export default GoogleMapsContext;
