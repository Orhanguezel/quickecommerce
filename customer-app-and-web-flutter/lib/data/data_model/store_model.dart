// To parse this JSON data, do
//
//     final storeTypeModel = storeTypeModelFromJson(jsonString);

import 'dart:convert';

List<StoreTypeModel> storeTypeModelFromJson(String str) => List<StoreTypeModel>.from(json.decode(str).map((x) => StoreTypeModel.fromJson(x)));

String storeTypeModelToJson(List<StoreTypeModel> data) => json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class StoreTypeModel {
  final dynamic id;
  final dynamic value;
  final dynamic label;
  final dynamic name;
  final dynamic imageUrl;

  StoreTypeModel({
    this.id,
    this.value,
    this.label,
    this.name,
    this.imageUrl,
  });

  factory StoreTypeModel.fromJson(Map<String, dynamic> json) => StoreTypeModel(
    id: json["id"],
    value: json["value"],
    label: json["label"],
    name: json["name"],
    imageUrl: json["image_url"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "value": value,
    "label": label,
    "name": name,
    "image_url": imageUrl,
  };
}
