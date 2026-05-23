export function formatOrderAddress(address: any): string {
  if (!address) return "";

  const base = String(address.address || "").trim();
  if (base) {
    const lower = base.toLocaleLowerCase("tr");
    const tail = [address.district_name, address.city_name]
      .filter((value) => value && !lower.includes(String(value).toLocaleLowerCase("tr")))
      .join(" / ");
    const postalCode = address.postal_code && !lower.includes(String(address.postal_code))
      ? String(address.postal_code)
      : "";

    return [tail ? `${base}, ${tail}` : base, postalCode]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  return [
    address.road,
    address.house,
    address.floor,
    [address.district_name, address.city_name].filter(Boolean).join(" / "),
    address.postal_code,
  ]
    .filter(Boolean)
    .join(", ")
    .trim();
}
