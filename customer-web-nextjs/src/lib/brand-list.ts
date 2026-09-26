/**
 * brand-list yaniti duz dizi doner ve kimligi `value` alaninda tasir. Liste
 * sayfalari `.data` ve `b.id` okudugu icin marka filtresi hic gorunmuyordu.
 */
export interface BrandOption {
  id: number;
  value: number;
  label: string;
  slug: string;
  product_count?: number;
}

export function normalizeBrandList(raw: unknown): BrandOption[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { data?: unknown })?.data)
      ? (raw as { data: unknown[] }).data
      : [];

  return list
    .map((item) => item as Partial<BrandOption>)
    .filter((item) => item && (item.value ?? item.id) != null && item.label)
    .map((item) => {
      const id = Number(item.value ?? item.id);
      return {
        id,
        value: id,
        label: String(item.label),
        slug: String(item.slug ?? ""),
        product_count: item.product_count,
      };
    });
}
