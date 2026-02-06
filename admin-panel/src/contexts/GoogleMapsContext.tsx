"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { useGoogleMapForAllQuery } from "@/modules/admin-section/google-map-settings/google-map-settings.action";

type GoogleMapsContextType = {
  isLoaded: boolean;
  loadError: Error | undefined;
  isEnabled: boolean;
  apiKey: string;
  isPending: boolean;
};

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: undefined,
  isEnabled: false,
  apiKey: "",
  isPending: true,
});

const GOOGLE_LIBRARIES: ("places" | "drawing" | "geometry")[] = [
  "places",
  "drawing",
  "geometry",
];

type GoogleMapsProviderProps = {
  children: ReactNode;
};

// Inner component that loads the script only when API key is available
const GoogleMapsScriptLoader: React.FC<{
  apiKey: string;
  children: ReactNode;
  isEnabled: boolean;
  isPending: boolean;
}> = ({ apiKey, children, isEnabled, isPending }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_LIBRARIES,
  });

  const value = useMemo(
    () => ({
      isLoaded,
      loadError,
      isEnabled,
      apiKey,
      isPending,
    }),
    [isLoaded, loadError, isEnabled, apiKey, isPending]
  );

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

// Fallback provider when maps are not available
const GoogleMapsNoScript: React.FC<{
  children: ReactNode;
  isEnabled: boolean;
  apiKey: string;
  isPending: boolean;
}> = ({ children, isEnabled, apiKey, isPending }) => {
  const value = useMemo(
    () => ({
      isLoaded: false,
      loadError: undefined,
      isEnabled,
      apiKey,
      isPending,
    }),
    [isEnabled, apiKey, isPending]
  );

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
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

  if (shouldLoad) {
    return (
      <GoogleMapsScriptLoader
        apiKey={apiKey}
        isEnabled={isEnabled}
        isPending={isPending}
      >
        {children}
      </GoogleMapsScriptLoader>
    );
  }

  return (
    <GoogleMapsNoScript
      isEnabled={isEnabled}
      apiKey={apiKey}
      isPending={isPending}
    >
      {children}
    </GoogleMapsNoScript>
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
