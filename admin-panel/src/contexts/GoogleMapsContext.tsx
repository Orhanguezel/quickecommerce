"use client";

import { createContext, useContext, ReactNode, useMemo, useRef } from "react";
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

// Loaded once and stays mounted — avoids repeated useLoadScript calls
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
    () => ({ isLoaded, loadError, isEnabled, apiKey, isPending }),
    [isLoaded, loadError, isEnabled, apiKey, isPending]
  );

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

// Used before maps are ready — no script injection
const GoogleMapsNoScript: React.FC<{
  children: ReactNode;
  isEnabled: boolean;
  apiKey: string;
  isPending: boolean;
}> = ({ children, isEnabled, apiKey, isPending }) => {
  const value = useMemo(
    () => ({ isLoaded: false, loadError: undefined, isEnabled, apiKey, isPending }),
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
  const shouldLoad = !isPending && !error && !!apiKey && isEnabled;

  /**
   * Once shouldLoad becomes true (settings loaded + maps enabled + key present),
   * we latch it permanently. This prevents switching back to GoogleMapsNoScript
   * on re-renders (stale data, refetch, etc.) which would cause useLoadScript
   * to be called multiple times and produce intermittent console errors.
   */
  const latchedRef = useRef(false);
  const latchedApiKeyRef = useRef("");
  if (shouldLoad && apiKey) {
    latchedRef.current = true;
    latchedApiKeyRef.current = apiKey;
  }

  if (latchedRef.current) {
    return (
      <GoogleMapsScriptLoader
        apiKey={latchedApiKeyRef.current}
        isEnabled={isEnabled}
        isPending={isPending}
      >
        {children}
      </GoogleMapsScriptLoader>
    );
  }

  return (
    <GoogleMapsNoScript isEnabled={isEnabled} apiKey={apiKey} isPending={isPending}>
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
