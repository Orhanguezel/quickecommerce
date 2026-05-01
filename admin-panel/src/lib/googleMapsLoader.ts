/**
 * Lazy loader for Google Maps Places SDK.
 *
 * Idempotent: if google.maps.places is already on window (e.g. admin-panel's
 * GoogleMapsContext loaded the script), returns immediately. Otherwise injects
 * the script and shares the promise across concurrent callers.
 */

type GMaps = any;

let loaderPromise: Promise<GMaps> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<GMaps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("googleMaps_only_in_browser"));
  }
  if ((window as any).google?.maps?.places) {
    return Promise.resolve((window as any).google);
  }
  if (loaderPromise) return loaderPromise;
  if (!apiKey) {
    return Promise.reject(new Error("googleMaps_apiKey_missing"));
  }

  loaderPromise = new Promise((resolve, reject) => {
    const cbName = `__gm_cb_${Date.now()}`;
    (window as any)[cbName] = () => {
      delete (window as any)[cbName];
      resolve((window as any).google);
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&language=tr&callback=${cbName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loaderPromise = null;
      reject(new Error("google_maps_script_failed"));
    };
    document.head.appendChild(script);
  });

  return loaderPromise;
}
