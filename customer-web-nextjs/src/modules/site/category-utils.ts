import type { Category } from "./site.type";

function normalizeCategoryText(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const LEGACY_MARKETPLACE_CATEGORY_SLUGS = new Set([
  "market",
  "firin-pastane",
  "eczane-saglik",
  "makyaj-guzellik",
  "mobilya",
  "ev-dekorasyon",
  "evcil-hayvan",
  "restoran",
  "kafe",
  "fast-food",
  "taki-mucevher",
  "oto-yedek-parca",
  "organik",
  "kasap",
  "meyve-sebze",
  "dondurma",
  "hirdavat",
  "bebek-cocuk",
  "cilt-ve-vucut-bakimi",
  "cilt-ve-vücüt-bakımı",
  "temizlik",
  "cinsel-saglik",
  "cinsel-sağlık",
  "hazir-yemekler",
  "hazır-yemekler",
  "kisisel-bakim",
  "kisisel-bakım",
  "kişisel-bakım",
  "tesettur-ust-parcalar",
  "genel",
]);

const LEGACY_MARKETPLACE_CATEGORY_TERMS = [
  "makyaj",
  "mobilya",
  "dekorasyon",
  "evcil",
  "restoran",
  "kafe",
  "fast food",
  "mucevher",
  "mücevher",
  "oto yedek",
  "kasap",
  "meyve",
  "sebze",
  "dondurma",
  "hirdavat",
  "bebek",
  "cocuk",
  "çocuk",
  "cinsel",
  "hazir yemek",
  "hazır yemek",
  "tesettur",
  "tesettür",
];

export function isBuyPayCampaignCategory(category: Category): boolean {
  const text = normalizeCategoryText(
    `${category.category_name || ""} ${category.category_slug || ""}`
  );

  return /\b\d+\s*al\s*\d+\s*ode\b/.test(text);
}

export function isSportoonlineRelevantCategory(category: Category): boolean {
  const slug = normalizeCategoryText(category.category_slug || "");
  const path = normalizeCategoryText(category.parent_path || "");
  const text = normalizeCategoryText(
    `${category.category_name || ""} ${category.category_slug || ""} ${category.parent_path || ""}`
  );

  if (LEGACY_MARKETPLACE_CATEGORY_SLUGS.has(slug)) return false;

  const pathSegments = path.split("/").filter(Boolean);
  if (pathSegments.some((segment) => LEGACY_MARKETPLACE_CATEGORY_SLUGS.has(segment))) {
    return false;
  }

  return !LEGACY_MARKETPLACE_CATEGORY_TERMS.some((term) => text.includes(term));
}

export function isDisplayableProductCategory(category: Category): boolean {
  return (
    !isBuyPayCampaignCategory(category) &&
    isSportoonlineRelevantCategory(category) &&
    Number(category.product_count || 0) > 0
  );
}

export function sortCategoriesForNavigation(a: Category, b: Category): number {
  const orderA = Number(a.display_order);
  const orderB = Number(b.display_order);
  const safeOrderA =
    Number.isFinite(orderA) && orderA > 0 ? orderA : Number.MAX_SAFE_INTEGER;
  const safeOrderB =
    Number.isFinite(orderB) && orderB > 0 ? orderB : Number.MAX_SAFE_INTEGER;

  if (safeOrderA !== safeOrderB) return safeOrderA - safeOrderB;

  return a.category_name.localeCompare(b.category_name, "tr-TR", {
    sensitivity: "base",
  });
}
