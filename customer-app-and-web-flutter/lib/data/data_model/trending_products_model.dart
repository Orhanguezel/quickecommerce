// To parse this JSON data, do
//
//     final trendingProductsModel = trendingProductsModelFromJson(jsonString);

import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


TrendingProductsModel trendingProductsModelFromJson(String str) => TrendingProductsModel.fromJson(json.decode(str));

String trendingProductsModelToJson(TrendingProductsModel data) => json.encode(data.toJson());

class TrendingProductsModel {
  final String message;
  final List<ProductData> data;
  final Meta? meta;

  TrendingProductsModel({
    required this.message,
    required this.data,
     this.meta,
  });

  factory TrendingProductsModel.fromJson(Map<String, dynamic> json) => TrendingProductsModel(
    message: json["message"],
    data: List<ProductData>.from(json["data"].map((x) => ProductData.fromJson(x))),
    meta:json["meta"]==null?null:Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "message": message,
    "data": List<dynamic>.from(data.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}



