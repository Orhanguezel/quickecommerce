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
  apiKey: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  country?: string;
  onSelect: (selected: AddressSelected) => void;
  onError?: (message: string) => void;
};

export default function AddressAutocomplete({
  apiKey,
  defaultValue = "",
  placeholder = "Adres ara… (örn: Beşiktaş İstanbul)",
  className,
  disabled,
  country = "tr",
  onSelect,
  onError,
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
  const [error, setError] = useState<string | null>(null);

  function showError(message: string) {
    setError(message);
    onError?.(message);
  }

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    let cancelled = false;
    if (!apiKey) return;
    loadGoogleMaps(apiKey)
      .then((g) => {
        if (cancelled) return;
        autocompleteServiceRef.current = new g.maps.places.AutocompleteService();
        sessionRef.current = new g.maps.places.AutocompleteSessionToken();
        const dummy = document.createElement("div");
        placesServiceRef.current = new g.maps.places.PlacesService(dummy);
        setSdkReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        showError("Adres arama servisi yüklenemedi. İl ve ilçe alanlarını manuel doldurun.");
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
      (preds: any[] | null, status: string) => {
        setLoading(false);
        if (status !== "OK" && status !== "ZERO_RESULTS") {
          setSuggestions([]);
          showError("Adres arama sırasında hata oluştu. İl ve ilçe alanlarını manuel doldurun.");
          return;
        }
        if (!preds) {
          setSuggestions([]);
          return;
        }
        setError(null);
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
        if (status !== "OK" || !place) {
          showError("Seçilen adres detayları alınamadı. İl ve ilçe alanlarını manuel doldurun.");
          return;
        }

        const lat = place.geometry?.location?.lat?.();
        const lng = place.geometry?.location?.lng?.();
        if (typeof lat !== "number" || typeof lng !== "number") {
          showError("Seçilen adres için konum bilgisi alınamadı. İl ve ilçe alanlarını manuel doldurun.");
          return;
        }

        const components = parseAddressComponents(place.address_components || []);

        onSelect({
          formattedAddress: place.formatted_address || s.description,
          lat,
          lng,
          ...components,
        });

        if ((window as any).google?.maps?.places) {
          sessionRef.current = new (window as any).google.maps.places.AutocompleteSessionToken();
        }
        setError(null);
      },
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <MapPin size={16} />
        </span>
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => value && setOpen(true)}
          placeholder={apiKey ? (sdkReady ? placeholder : "Harita yükleniyor…") : placeholder}
          disabled={disabled || !apiKey || !sdkReady}
          autoComplete="off"
          className={`flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
            className || ""
          }`}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
          </span>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 left-0 right-0 max-h-72 overflow-y-auto rounded-md border bg-popover shadow-lg divide-y">
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
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

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
