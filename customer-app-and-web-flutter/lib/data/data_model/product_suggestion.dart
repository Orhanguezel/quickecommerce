// To parse this JSON data, do
//
//     final productSuggestionModel = productSuggestionModelFromJson(jsonString);

import 'dart:convert';


import 'all_product_model.dart';

ProductSuggestionModel productSuggestionModelFromJson(String str) =>
    ProductSuggestionModel.fromJson(json.decode(str));

String productSuggestionModelToJson(ProductSuggestionModel data) =>
    json.encode(data.toJson());

class ProductSuggestionModel {

  final List<ProductData>? data;

  ProductSuggestionModel({
    required this.data,
  });

  factory ProductSuggestionModel.fromJson(Map<String, dynamic> json) =>
      ProductSuggestionModel(
        data: json["data"] == null
            ? null
            : List<ProductData>.from(
                json["data"].map((x) => ProductData.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "data": data == null
            ? null
            : List<dynamic>.from(data!.map((x) => x.toJson())),
      };
}

