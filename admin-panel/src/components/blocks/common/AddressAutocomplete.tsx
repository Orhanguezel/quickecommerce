"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";

type Suggestion = {
  description: string;
  place_id: string;
  main: string;
  secondary: string;
};

export type AddressSelected = {
  formattedAddress: string;
  lat: number;
  lng: number;
  city?: string;
  district?: string;
  country?: string;
  postalCode?: string;
};

type Props = {
  /**
   * Google Maps API key. If the SDK is already loaded on window (e.g. from
   * GoogleMapsContext), the key is unused but still expected for safety.
   */
  apiKey: string;
  /** Initial input value (read-only display, doesn't drive selection). */
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** ISO country code restriction. Default 'tr'. */
  country?: string;
  /** Called when user picks a suggestion. */
  onSelect: (selected: AddressSelected) => void;
};

/**
 * Search-as-you-type address picker backed by Google Places Autocomplete.
 *
 * Selection triggers Place Details fetch to resolve lat/lng + parsed
 * address components, so callers receive everything in one callback.
 */
export default function AddressAutocomplete({
  apiKey,
  defaultValue = "",
  placeholder = "Adres ara… (örn: Beşiktaş İstanbul)",
  className,
  disabled,
  country = "tr",
  onSelect,
}: Props) {
  const inputId = useId();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);

  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then((g) => {
        if (cancelled) return;
        autocompleteServiceRef.current = new g.maps.places.AutocompleteService();
        sessionRef.current = new g.maps.places.AutocompleteSessionToken();
        // PlacesService requires a DOM node. Hidden div is the standard trick.
        const dummy = document.createElement("div");
        placesServiceRef.current = new g.maps.places.PlacesService(dummy);
        setSdkReady(true);
      })
      .catch(() => {
        // SDK unavailable — input stays usable but won't suggest.
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function fetchPredictions(query: string) {
    const svc = autocompleteServiceRef.current;
    const token = sessionRef.current;
    if (!svc || !query.trim()) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    svc.getPlacePredictions(
      {
        input: query,
        sessionToken: token,
        componentRestrictions: country ? { country } : undefined,
        language: "tr",
      },
      (preds: any[] | null) => {
        setLoading(false);
        if (!preds) {
          setSuggestions([]);
          return;
        }
        setSuggestions(
          preds.slice(0, 6).map((p) => ({
            description: p.description,
            place_id: p.place_id,
            main: p.structured_formatting?.main_text || p.description,
            secondary: p.structured_formatting?.secondary_text || "",
          })),
        );
      },
    );
  }

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    setOpen(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchPredictions(v), 220);
  }

  function pickSuggestion(s: Suggestion) {
    setValue(s.description);
    setOpen(false);
    setSuggestions([]);

    const placesSvc = placesServiceRef.current;
    if (!placesSvc) return;

    placesSvc.getDetails(
      {
        placeId: s.place_id,
        fields: ["geometry", "formatted_address", "address_components"],
        sessionToken: sessionRef.current,
      },
      (place: any, status: string) => {
        if (status !== "OK" || !place) return;

        const lat = place.geometry?.location?.lat?.();
        const lng = place.geometry?.location?.lng?.();
        if (typeof lat !== "number" || typeof lng !== "number") return;

        const components = parseAddressComponents(place.address_components || []);

        onSelect({
          formattedAddress: place.formatted_address || s.description,
          lat,
          lng,
          ...components,
        });

        // New session token after a billable Place Details call.
        if ((window as any).google?.maps?.places) {
          sessionRef.current = new (window as any).google.maps.places.AutocompleteSessionToken();
        }
      },
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <MapPin size={16} />
        </span>
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => value && setOpen(true)}
          placeholder={sdkReady ? placeholder : "Harita yükleniyor…"}
          disabled={disabled || !sdkReady}
          autoComplete="off"
          className={`w-full bg-background border rounded-md pl-9 pr-9 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${
            className || ""
          }`}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Loader2 size={14} className="animate-spin" />
          </span>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 left-0 right-0 max-h-72 overflow-y-auto rounded-md border bg-background shadow-lg divide-y">
          {suggestions.map((s) => (
            <li key={s.place_id}>
              <button
                type="button"
                onClick={() => pickSuggestion(s)}
                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.main}</div>
                    {s.secondary && (
                      <div className="text-xs text-muted-foreground truncate">
                        {s.secondary}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Pull human-friendly fields out of Google's address_components list.
 * Turkey: administrative_area_level_1 = il, level_2 = ilçe.
 */
function parseAddressComponents(components: any[]): {
  city?: string;
  district?: string;
  country?: string;
  postalCode?: string;
} {
  const out: { city?: string; district?: string; country?: string; postalCode?: string } = {};
  for (const c of components) {
    const types: string[] = c.types || [];
    if (types.includes("administrative_area_level_1")) {
      out.city = c.long_name;
    } else if (types.includes("administrative_area_level_2") && !out.district) {
      out.district = c.long_name;
    } else if (types.includes("locality") && !out.district) {
      out.district = c.long_name;
    } else if (types.includes("country")) {
      out.country = c.long_name;
    } else if (types.includes("postal_code")) {
      out.postalCode = c.long_name;
    }
  }
  return out;
}
