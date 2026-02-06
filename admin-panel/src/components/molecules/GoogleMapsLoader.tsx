"use client";

import { ReactNode } from "react";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";

type GoogleMapsLoaderProps = {
  children: ReactNode;
  locale?: string;
};

const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({ children }) => {
  return <GoogleMapsProvider>{children}</GoogleMapsProvider>;
};

export default GoogleMapsLoader;
