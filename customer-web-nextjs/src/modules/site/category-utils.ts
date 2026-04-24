import type { Category } from "./site.type";

function normalizeCategoryText(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isBuyPayCampaignCategory(category: Category): boolean {
  const text = normalizeCategoryText(
    `${category.category_name || ""} ${category.category_slug || ""}`
  );

  return /\b\d+\s*al\s*\d+\s*ode\b/.test(text);
}

export function isDisplayableProductCategory(category: Category): boolean {
  return !isBuyPayCampaignCategory(category) && Number(category.product_count || 0) > 0;
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
