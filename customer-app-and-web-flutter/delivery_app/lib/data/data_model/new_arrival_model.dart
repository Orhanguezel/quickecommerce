import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';

NewArrivalModel productResponseFromJson(String str) =>
    NewArrivalModel.fromJson(json.decode(str));

String productResponseToJson(NewArrivalModel data) =>
    json.encode(data.toJson());

class NewArrivalModel {
  NewArrivalModel({
    required this.message,
    required this.data,
     this.meta,
  });

  final String message;
  final List<ProductData> data;
  final Meta? meta;

  factory NewArrivalModel.fromJson(Map<String, dynamic> json) =>
      NewArrivalModel(
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