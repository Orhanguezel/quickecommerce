// To parse this JSON data, do
//
//     final flashDealProductModel = flashDealProductModelFromJson(jsonString);

import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


FlashDealProductModel flashDealProductModelFromJson(String str) => FlashDealProductModel.fromJson(json.decode(str));

String flashDealProductModelToJson(FlashDealProductModel data) => json.encode(data.toJson());

class FlashDealProductModel {
  final String message;
  final List<ProductData> data;
  final Meta? meta;

  FlashDealProductModel({
    required this.message,
    required this.data,
     this.meta,
  });

  factory FlashDealProductModel.fromJson(Map<String, dynamic> json) => FlashDealProductModel(

    message: json["message"],
    data: json["data"] != null
        ? List<ProductData>.from(
      json["data"].map((x) =>ProductData.fromJson(x)),
    )
        : [],
    meta: Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "message": message,
    "data": List<dynamic>.from(data.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}


