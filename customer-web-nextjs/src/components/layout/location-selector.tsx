"use client";

import { useTranslations } from "next-intl";
import { useLocationStore } from "@/stores/location-store";
import { useAreaListQuery } from "@/modules/area/area.service";
import { MapPin, X, Search, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { Area } from "@/modules/area/area.type";

export function LocationSelector() {
  const t = useTranslations("common");
  const { isOpen, selectedArea, setSelectedArea, closeSelector, clearLocation } =
    useLocationStore();
  const { data: areas, isLoading } = useAreaListQuery();
  const [search, setSearch] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSelector();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, closeSelector]);

  // Reset search when opening
  useEffect(() => {
    if (isOpen) setSearch("");
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = (areas ?? []).filter((area) =>
    area.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (area: Area) => {
    setSelectedArea(area);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeSelector}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {t("select_location")}
            </h2>
          </div>
          <button
            onClick={closeSelector}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border px-5 py-3">
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search_placeholder")}
              autoFocus
              className="h-10 flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Area List */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              {t("loading")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              {t("no_results")}
            </div>
          ) : (
            filtered.map((area) => {
              const isSelected = selectedArea?.id === area.id;
              return (
                <button
                  key={area.id}
                  onClick={() => handleSelect(area)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <MapPin className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="flex-1 text-sm font-medium">
                    {area.label}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer - Clear selection */}
        {selectedArea && (
          <div className="border-t border-border px-5 py-3">
            <button
              onClick={() => {
                clearLocation();
                closeSelector();
              }}
              className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t("delete")} {t("location").toLowerCase()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
