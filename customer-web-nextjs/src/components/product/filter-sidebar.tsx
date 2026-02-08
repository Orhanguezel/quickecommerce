"use client";

import { useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface FilterState {
  min_price?: string;
  max_price?: string;
  brand_id?: string[];
  min_rating?: string;
  availability?: string;
  sort?: string;
}

export interface FilterBrand {
  id: number;
  name: string;
}

interface FilterTranslations {
  filter: string;
  price_range: string;
  min_price: string;
  max_price: string;
  brands: string;
  rating: string;
  rating_up: string;
  availability: string;
  in_stock: string;
  all_products: string;
  apply_filters: string;
  clear_filters: string;
  close: string;
}

interface FilterSidebarProps {
  brands?: FilterBrand[];
  currentFilters: FilterState;
  basePath: string;
  translations: FilterTranslations;
}

export function FilterSidebar({
  brands = [],
  currentFilters,
  basePath,
  translations: t,
}: FilterSidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    brands: true,
    rating: false,
    availability: false,
  });

  const [minPrice, setMinPrice] = useState(currentFilters.min_price || "");
  const [maxPrice, setMaxPrice] = useState(currentFilters.max_price || "");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    currentFilters.brand_id || []
  );
  const [selectedRating, setSelectedRating] = useState(
    currentFilters.min_rating || ""
  );
  const [availability, setAvailability] = useState(
    currentFilters.availability || ""
  );

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleBrand(id: string) {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    selectedBrands.forEach((id) => params.append("brand_id", id));
    if (selectedRating) params.set("min_rating", selectedRating);
    if (availability) params.set("availability", availability);
    if (currentFilters.sort) params.set("sort", currentFilters.sort);

    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
    setMobileOpen(false);
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    setSelectedBrands([]);
    setSelectedRating("");
    setAvailability("");

    const params = new URLSearchParams();
    if (currentFilters.sort) params.set("sort", currentFilters.sort);
    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
    setMobileOpen(false);
  }

  const hasActiveFilters =
    minPrice || maxPrice || selectedBrands.length > 0 || selectedRating || availability;

  const filterContent = (
    <div className="space-y-1">
      {/* Price Range */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between py-2 text-sm font-semibold"
        >
          {t.price_range}
          {openSections.price ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {openSections.price && (
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="number"
              placeholder={t.min_price}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-9 text-sm"
              min={0}
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder={t.max_price}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-9 text-sm"
              min={0}
            />
          </div>
        )}
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("brands")}
            className="flex w-full items-center justify-between py-2 text-sm font-semibold"
          >
            {t.brands}
            {openSections.brands ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {openSections.brands && (
            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
              {brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(String(brand.id))}
                    onChange={() => toggleBrand(String(brand.id))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {brand.name}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rating */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("rating")}
          className="flex w-full items-center justify-between py-2 text-sm font-semibold"
        >
          {t.rating}
          {openSections.rating ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {openSections.rating && (
          <div className="mt-2 space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === String(rating)}
                  onChange={() => setSelectedRating(String(rating))}
                  className="h-4 w-4"
                />
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </span>
                <span className="text-muted-foreground">{t.rating_up}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="pb-4">
        <button
          onClick={() => toggleSection("availability")}
          className="flex w-full items-center justify-between py-2 text-sm font-semibold"
        >
          {t.availability}
          {openSections.availability ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {openSections.availability && (
          <div className="mt-2 space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="availability"
                checked={availability === ""}
                onChange={() => setAvailability("")}
                className="h-4 w-4"
              />
              {t.all_products}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="availability"
                checked={availability === "1"}
                onChange={() => setAvailability("1")}
                className="h-4 w-4"
              />
              {t.in_stock}
            </label>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={applyFilters} className="flex-1">
          {t.apply_filters}
        </Button>
        {hasActiveFilters && (
          <Button size="sm" variant="outline" onClick={clearFilters}>
            {t.clear_filters}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t.filter}
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {
              [minPrice, maxPrice, ...selectedBrands, selectedRating, availability].filter(
                Boolean
              ).length
            }
          </span>
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 overflow-y-auto bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t.filter}</h2>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">{filterContent}</div>
    </>
  );
}
