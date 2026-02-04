// To parse this JSON data, do
//
//     final popularProductsModel = popularProductsModelFromJson(jsonString);

import 'dart:convert';

import 'all_product_model.dart';

PopularProductsModel popularProductsModelFromJson(String str) => PopularProductsModel.fromJson(json.decode(str));

String popularProductsModelToJson(PopularProductsModel data) => json.encode(data.toJson());

class PopularProductsModel {
  final String message;
  final List<ProductData> data;
  final Meta meta;

  PopularProductsModel({
    required this.message,
    required this.data,
    required this.meta,
  });

  factory PopularProductsModel.fromJson(Map<String, dynamic> json) => PopularProductsModel(

    message: json["message"],
    data: List<ProductData>.from(json["data"].map((x) => ProductData.fromJson(x))),
    meta: Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "message": message,
    "data": List<dynamic>.from(data.map((x) => x.toJson())),
    "meta": meta.toJson(),
  };
}
