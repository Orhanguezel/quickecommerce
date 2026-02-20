import 'dart:convert';

import 'all_product_model.dart';

FavoritesModel favoritesModelFromJson(String str) => FavoritesModel.fromJson(json.decode(str));

String favoritesModelToJson(FavoritesModel data) => json.encode(data.toJson());

class FavoritesModel {
  final List<ProductData>? wishlist;
  final Meta? meta;

  FavoritesModel({
     this.wishlist,
     this.meta,
  });

  factory FavoritesModel.fromJson(Map<String, dynamic> json) => FavoritesModel(
    wishlist:json["wishlist"]==null?null: List<ProductData>.from(json["wishlist"].map((x) => ProductData.fromJson(x))),
    meta: Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "wishlist": List<dynamic>.from(wishlist!.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}


