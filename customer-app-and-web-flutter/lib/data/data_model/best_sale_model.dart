import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


BestSaleModel productResponseFromJson(String str) =>
    BestSaleModel.fromJson(json.decode(str));

String productResponseToJson(BestSaleModel data) => json.encode(data.toJson());

class BestSaleModel {
  BestSaleModel({
    required this.message,
    required this.data,
    this.meta,
  });

  final String message;
  final List<ProductData>? data;
  final Meta? meta;

  factory BestSaleModel.fromJson(Map<String, dynamic> json) => BestSaleModel(
        message: json["message"],
        data:json["data"]==null?null:
            List<ProductData>.from(json["data"].map((x) => ProductData.fromJson(x))),
        meta: Meta.fromJson(json["meta"]),
      );

  Map<String, dynamic> toJson() => {
        "message": message,
        "data":data==null?null: List<dynamic>.from(data!.map((x) => x.toJson())),
        "meta": meta?.toJson(),
      };
}


