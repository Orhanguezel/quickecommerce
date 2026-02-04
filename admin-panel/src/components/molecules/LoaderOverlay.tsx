
"use client";
import { useEffect, useState } from "react";
type LoaderOverlayProps = {
  isLoading: boolean;
};

export default function LoaderOverlay({ isLoading }: LoaderOverlayProps) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShowLoader(true);
      }, 1000);
    } else {
      setShowLoader(false);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading]);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-gray-300 border-b-transparent rounded-full animate-spin-slow dark:border-gray-600 dark:border-b-transparent"></div>
      </div>
    </div>
  );
}
