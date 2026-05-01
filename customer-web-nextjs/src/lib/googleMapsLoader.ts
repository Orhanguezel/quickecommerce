/**
 * Lazy loader for Google Maps Places SDK on the customer site.
 *
 * The API key is fetched from the backend `/site-general-info` endpoint
 * and passed in by callers — this loader only injects the script tag.
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=tr&callback=${cbName}`;
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
