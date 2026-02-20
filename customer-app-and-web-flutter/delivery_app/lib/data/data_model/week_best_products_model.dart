

import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


WeekBestProductsModel weekBestProductsModelFromJson(String str) => WeekBestProductsModel.fromJson(json.decode(str));

String weekBestProductsModelToJson(WeekBestProductsModel data) => json.encode(data.toJson());

class WeekBestProductsModel {
  final String message;
  final List<ProductData> data;
  final Meta? meta;

  WeekBestProductsModel({
    required this.message,
    required this.data,
     this.meta,
  });

  factory WeekBestProductsModel.fromJson(Map<String, dynamic> json) => WeekBestProductsModel(
    message: json["message"],
    data: List<ProductData>.from(json["data"].map((x) => ProductData.fromJson(x))),
    meta: Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "message": message,
    "data": List<dynamic>.from(data.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}



