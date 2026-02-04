export interface CurrencySettings {
  com_site_currency_symbol_position: "left" | "right" | "none" | null; // Position of the currency symbol
  com_site_enable_disable_decimal_point: string | null; // Enable/Disable decimal points
  com_site_comma_form_adjustment_amount: string | null; // Enable/Disable comma formatting
  com_site_space_between_amount_and_symbol: string | null; // Space between amount and symbol
  com_site_global_currency: string | null; // Global currency (e.g., USD)
}

export const formatPrice = (
  price: number,
  settings?: CurrencySettings
): string => {
  if (price == null) return "";

  if (!settings) {
    return price.toString();
  }
  const {
    com_site_currency_symbol_position = "left",
    com_site_enable_disable_decimal_point = "NO",
    com_site_comma_form_adjustment_amount = "NO",
    com_site_space_between_amount_and_symbol = "NO",
    com_site_global_currency = "USD",
  } = settings;
  // Apply decimal and comma formatting using Intl.NumberFormat
  let formattedPrice: string;

  if (com_site_comma_form_adjustment_amount == "YES") {
    formattedPrice = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits:
        com_site_enable_disable_decimal_point == "YES" ? 2 : 0,
      maximumFractionDigits:
        com_site_enable_disable_decimal_point == "YES" ? 2 : 0,
    }).format(price);
  } else {
    // Without comma formatting
    formattedPrice = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits:
        com_site_enable_disable_decimal_point == "YES" ? 2 : 0,
      maximumFractionDigits:
        com_site_enable_disable_decimal_point == "YES" ? 2 : 0,
    }).format(price);
  }

  // Determine the currency symbol (can be expanded if more currencies are supported)
  const currencySymbol = com_site_global_currency == "USD" ? "$" : "";

  // Add space between amount and symbol if needed
  const symbolWithSpace =
    com_site_space_between_amount_and_symbol == "YES"
      ? `${currencySymbol} `
      : currencySymbol;

  // Handle currency symbol positioning (before or after)
  if (com_site_currency_symbol_position === "left") {
    return `${symbolWithSpace}${formattedPrice}`;
  } else if (com_site_currency_symbol_position === "right") {
    return `${formattedPrice}${symbolWithSpace}`;
  } else {
    return `${formattedPrice} ${currencySymbol}`;
  }
};
