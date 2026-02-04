// To parse this JSON data, do
//
//     final currencyListModel = currencyListModelFromJson(jsonString);

import 'dart:convert';

CurrencyListModel currencyListModelFromJson(String str) => CurrencyListModel.fromJson(json.decode(str));

String currencyListModelToJson(CurrencyListModel data) => json.encode(data.toJson());

class CurrencyListModel {
  final List<CurrencyData>? data;

  CurrencyListModel({
    this.data,
  });

  factory CurrencyListModel.fromJson(Map<String, dynamic> json) => CurrencyListModel(
    data: List<CurrencyData>.from(json["data"].map((x) => CurrencyData.fromJson(x))),
  );

  Map<String, dynamic> toJson() => {
    "data": List<dynamic>.from(data!.map((x) => x.toJson())),
  };
}

class CurrencyData {
  final dynamic label;
  final dynamic value;
  final dynamic symbol;
  final dynamic exchangeRate;
  final dynamic isDefault;

  CurrencyData({
    this.label,
    this.value,
    this.symbol,
    this.exchangeRate,
    this.isDefault,
  });

  factory CurrencyData.fromJson(Map<String, dynamic> json) => CurrencyData(
    label: json["label"],
    value: json["value"],
    symbol: json["symbol"],
    exchangeRate: json["exchange_rate"],
    isDefault: json["is_default"],

  );

  Map<String, dynamic> toJson() => {
    "label": label,
    "value": value,
    "symbol": symbol,
    "exchange_rate": exchangeRate,
    "is_default": isDefault,
  };
}

