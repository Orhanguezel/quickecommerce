// To parse this JSON data, do
//
//     final currenciesModel = currenciesModelFromJson(jsonString);

import 'dart:convert';

CurrenciesModel currenciesModelFromJson(String str) => CurrenciesModel.fromJson(json.decode(str));

String currenciesModelToJson(CurrenciesModel data) => json.encode(data.toJson());

class CurrenciesModel {
  final CurrenciesInfo currenciesInfo;

  CurrenciesModel({
    required this.currenciesInfo,
  });

  factory CurrenciesModel.fromJson(Map<String, dynamic> json) => CurrenciesModel(
    currenciesInfo: CurrenciesInfo.fromJson(json["currencies_info"]),
  );

  Map<String, dynamic> toJson() => {
    "currencies_info": currenciesInfo.toJson(),
  };
}

class CurrenciesInfo {
  final dynamic comSiteGlobalCurrency;
  final dynamic comSiteCurrencySymbolPosition;
  final dynamic comSiteDefaultCurrencyToUsdExchangeRate;
  final dynamic comSiteCommaFormAdjustmentAmount;
  final dynamic comSiteEnableDisableDecimalPoint;
  final dynamic comSiteSpaceBetweenAmountAndSymbol;

  CurrenciesInfo({
     this.comSiteGlobalCurrency,
     this.comSiteCurrencySymbolPosition,
     this.comSiteDefaultCurrencyToUsdExchangeRate,
     this.comSiteCommaFormAdjustmentAmount,
     this.comSiteEnableDisableDecimalPoint,
     this.comSiteSpaceBetweenAmountAndSymbol,
  });

  factory CurrenciesInfo.fromJson(Map<String, dynamic> json) => CurrenciesInfo(
    comSiteGlobalCurrency: json["com_site_global_currency"],
    comSiteCurrencySymbolPosition: json["com_site_currency_symbol_position"],
    comSiteDefaultCurrencyToUsdExchangeRate: json["com_site_default_currency_to_usd_exchange_rate"],
    comSiteCommaFormAdjustmentAmount: json["com_site_comma_form_adjustment_amount"],
    comSiteEnableDisableDecimalPoint: json["com_site_enable_disable_decimal_point"],
    comSiteSpaceBetweenAmountAndSymbol: json["com_site_space_between_amount_and_symbol"],
  );

  Map<String, dynamic> toJson() => {
    "com_site_global_currency": comSiteGlobalCurrency,
    "com_site_currency_symbol_position": comSiteCurrencySymbolPosition,
    "com_site_default_currency_to_usd_exchange_rate": comSiteDefaultCurrencyToUsdExchangeRate,
    "com_site_comma_form_adjustment_amount": comSiteCommaFormAdjustmentAmount,
    "com_site_enable_disable_decimal_point": comSiteEnableDisableDecimalPoint,
    "com_site_space_between_amount_and_symbol": comSiteSpaceBetweenAmountAndSymbol,
  };
}
