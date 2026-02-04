export interface CurrencySettings {
  com_site_enable_disable_decimal_point: string | null;
  com_site_comma_form_adjustment_amount: string | null;
}

const defaultSettings: CurrencySettings = {
  com_site_enable_disable_decimal_point: "NO",
  com_site_comma_form_adjustment_amount: "YES",
};

export const formatNumberOnly = (
  price: number,
  settings: Partial<CurrencySettings> = {}
): string => {
  const {
    com_site_enable_disable_decimal_point,
    com_site_comma_form_adjustment_amount,
  } = { ...defaultSettings, ...settings };

  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits:
      com_site_enable_disable_decimal_point === "YES" ? 2 : 0,
    maximumFractionDigits:
      com_site_enable_disable_decimal_point === "YES" ? 2 : 0,
    useGrouping: com_site_comma_form_adjustment_amount === "YES",
  }).format(price);
};
