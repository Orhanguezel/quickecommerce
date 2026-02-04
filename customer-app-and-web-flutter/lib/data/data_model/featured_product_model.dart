import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';

FeaturedProductModel popularProductsModelFromJson(String str) => FeaturedProductModel.fromJson(json.decode(str));

String popularProductsModelToJson(FeaturedProductModel data) => json.encode(data.toJson());


class FeaturedProductModel {
  final String message;
  final List<ProductData> data;
  final Meta? meta;

  FeaturedProductModel({
    required this.message,
    required this.data,
     this.meta,
  });
  factory FeaturedProductModel.fromJson(Map<String, dynamic> json) =>
      FeaturedProductModel(
        message: json["message"],
        data: List<ProductData>.from(
            json["data"].map((x) => ProductData.fromJson(x))),
        meta: Meta.fromJson(json["meta"]),
      );

  Map<String, dynamic> toJson() => {
    "message": message,
    "data": List<ProductData>.from(data.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}



