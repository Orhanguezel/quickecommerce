"use client";

import { useState, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronsRight,
  Star,
  RotateCcw,
  Search,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface FilterState {
  min_price?: string;
  max_price?: string;
  brand_id?: string[];
  category_id?: string[];
  min_rating?: string;
  availability?: string;
  sort?: string;
}

export interface FilterBrand {
  id: number;
  name: string;
}

export interface FilterCategory {
  id: number;
  category_name: string;
  category_slug: string;
  parent_id: number | null;
  children?: FilterCategory[];
}

export interface FilterAttributeValue {
  id: number;
  label: string;
}

export interface FilterAttribute {
  id: number;
  label: string;
  values: FilterAttributeValue[];
}

interface FilterSidebarProps {
  attributes?: FilterAttribute[];
  brands?: FilterBrand[];
  categories?: FilterCategory[];
  currentFilters: FilterState;
  basePath: string;
  translations: {
    filter_options: string;
    reset_filter: string;
    categories: string;
    brands: string;
    price: string;
    min_price: string;
    max_price: string;
    rating: string;
    rating_up: string;
    apply_filters: string;
    clear_filters: string;
  };
}

export function FilterSidebar({
  attributes = [],
  brands = [],
  categories = [],
  currentFilters,
  basePath,
  translations: t,
}: FilterSidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: false,
    brands: false,
    price: false,
    rating: false,
  });
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());
  const [brandSearch, setBrandSearch] = useState("");

  const [minPrice, setMinPrice] = useState(currentFilters.min_price || "");
  const [maxPrice, setMaxPrice] = useState(currentFilters.max_price || "");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    currentFilters.brand_id || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentFilters.category_id || []
  );
  const [selectedRating, setSelectedRating] = useState(
    currentFilters.min_rating || ""
  );
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  const topCategories = categories.filter((c) => !c.parent_id);
  const getChildren = (parentId: number) =>
    categories.filter((c) => c.parent_id === parentId);

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    const search = brandSearch.toLowerCase();
    return brands.filter((b) => b.name.toLowerCase().includes(search));
  }, [brands, brandSearch]);

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleExpandCat(id: number) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleBrand(id: string) {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function toggleAttribute(attrId: string, valueId: string) {
    setSelectedAttributes((prev) => {
      const current = prev[attrId] || [];
      const next = current.includes(valueId)
        ? current.filter((v) => v !== valueId)
        : [...current, valueId];
      return { ...prev, [attrId]: next };
    });
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    selectedBrands.forEach((id) => params.append("brand_id", id));
    selectedCategories.forEach((id) => params.append("category_id", id));
    if (selectedRating) params.set("min_rating", selectedRating);
    if (currentFilters.sort) params.set("sort", currentFilters.sort);

    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
    setMobileOpen(false);
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedRating("");
    setBrandSearch("");
    setSelectedAttributes({});

    const params = new URLSearchParams();
    if (currentFilters.sort) params.set("sort", currentFilters.sort);
    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
    setMobileOpen(false);
  }

  const hasActiveFilters =
    minPrice ||
    maxPrice ||
    selectedBrands.length > 0 ||
    selectedCategories.length > 0 ||
    selectedRating ||
    Object.values(selectedAttributes).some((v) => v.length > 0);

  /* ── Card-style section header (matches Flutter FilterTitleWidget) ── */
  function SectionHeader({
    label,
    sectionKey,
  }: {
    label: string;
    sectionKey: string;
  }) {
    const isOpen = openSections[sectionKey];
    return (
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex w-full items-center justify-between rounded-lg border bg-card px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/30"
      >
        {label}
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-primary" />
        ) : (
          <ChevronsRight className="h-4 w-4 text-primary" />
        )}
      </button>
    );
  }

  const filterContent = (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-lg font-medium text-foreground">{t.filter_options}</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <RotateCcw className="h-3 w-3" />
            {t.reset_filter}
          </button>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <SectionHeader label={t.categories} sectionKey="categories" />
          {openSections.categories && (
            <div className="mt-2 space-y-0.5 pb-2">
              {topCategories.map((cat) => {
                const children = getChildren(cat.id);
                const hasChildren = children.length > 0;
                const isExpanded = expandedCats.has(cat.id);

                return (
                  <div key={cat.id}>
                    <div className="flex items-center">
                      <label className="flex flex-1 cursor-pointer items-center gap-2 py-1.5 text-sm transition-colors hover:text-primary">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(
                            String(cat.id)
                          )}
                          onChange={() => toggleCategory(String(cat.id))}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                        />
                        <span className="text-foreground">
                          {cat.category_name}
                        </span>
                      </label>
                      {hasChildren && (
                        <button
                          onClick={() => toggleExpandCat(cat.id)}
                          className="shrink-0 rounded-lg border bg-card p-1 shadow-sm transition-colors hover:bg-muted"
                        >
                          {isExpanded ? (
                            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                      )}
                    </div>
                    {hasChildren && isExpanded && (
                      <div className="ml-7 space-y-0.5">
                        {children.map((child) => (
                          <label
                            key={child.id}
                            className="flex cursor-pointer items-center gap-2 py-1 text-sm transition-colors hover:text-primary"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(
                                String(child.id)
                              )}
                              onChange={() =>
                                toggleCategory(String(child.id))
                              }
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                            />
                            <span className="text-muted-foreground">
                              {child.category_name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <SectionHeader label={t.brands} sectionKey="brands" />
          {openSections.brands && (
            <div className="mt-2 space-y-2 pb-2">
              {/* Brand search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Search"
                  className="h-8 w-full rounded-md border bg-card pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              {/* Brand list */}
              <div className="max-h-48 space-y-0.5 overflow-y-auto">
                {filteredBrands.map((brand) => (
                  <label
                    key={brand.id}
                    className="flex cursor-pointer items-center gap-2 py-1.5 text-sm transition-colors hover:text-primary"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(String(brand.id))}
                      onChange={() => toggleBrand(String(brand.id))}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                    />
                    <span className="text-foreground">{brand.name}</span>
                  </label>
                ))}
                {filteredBrands.length === 0 && (
                  <p className="py-2 text-center text-xs text-muted-foreground">
                    No brands found
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div>
        <SectionHeader label={t.price} sectionKey="price" />
        {openSections.price && (
          <div className="mt-2 space-y-2 pb-2">
            <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>

      {/* Rating */}
      <div>
        <SectionHeader label={t.rating} sectionKey="rating" />
        {openSections.rating && (
          <div className="mt-2 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() =>
                    setSelectedRating(
                      selectedRating === String(rating) ? "" : String(rating)
                    )
                  }
                  className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedRating === String(rating)
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  <Star
                    className={`h-3 w-3 ${
                      selectedRating === String(rating)
                        ? "fill-white text-white"
                        : "fill-amber-400 text-amber-400"
                    }`}
                  />
                  {rating}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Attribute Filters */}
      {attributes.map((attr) => {
        const sectionKey = `attr_${attr.id}`;
        return (
          <div key={attr.id}>
            <SectionHeader label={attr.label} sectionKey={sectionKey} />
            {openSections[sectionKey] && (
              <div className="mt-2 max-h-48 space-y-0.5 overflow-y-auto pb-2">
                {attr.values.map((val) => (
                  <label
                    key={val.id}
                    className="flex cursor-pointer items-center gap-2 py-1.5 text-sm transition-colors hover:text-primary"
                  >
                    <input
                      type="checkbox"
                      checked={(selectedAttributes[String(attr.id)] || []).includes(String(val.id))}
                      onChange={() => toggleAttribute(String(attr.id), String(val.id))}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                    />
                    <span className="text-foreground">{val.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Apply / Clear Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={clearFilters}
          className="flex-1"
        >
          {t.clear_filters}
        </Button>
        <Button size="sm" onClick={applyFilters} className="flex-1">
          {t.apply_filters}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t.filter_options}
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {
              [
                minPrice,
                maxPrice,
                ...selectedBrands,
                ...selectedCategories,
                selectedRating,
              ].filter(Boolean).length
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
          <div className="absolute inset-y-0 left-0 w-80 overflow-y-auto bg-background p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t.filter_options}</h2>
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
