// To parse this JSON data, do
//
//     final topRatedModel = topRatedModelFromJson(jsonString);

import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


TopRatedModel topRatedModelFromJson(String str) =>
    TopRatedModel.fromJson(json.decode(str));

String topRatedModelToJson(TopRatedModel data) => json.encode(data.toJson());

class TopRatedModel {
  final String message;
  final List<TopRatedData>? data;
  final Meta? meta;

  TopRatedModel({
    required this.message,
    this.data,
    this.meta,
  });

  factory TopRatedModel.fromJson(Map<String, dynamic> json) => TopRatedModel(

        message: json["message"],
        data: json["data"] == null
            ? null
            : List<TopRatedData>.from(
                json["data"].map((x) => TopRatedData.fromJson(x))),
        meta: Meta.fromJson(json["meta"]),
      );

  Map<String, dynamic> toJson() => {
        "message": message,
        "data": List<dynamic>.from(data!.map((x) => x.toJson())),
        "meta": meta?.toJson(),
      };
}

class TopRatedData {
  final dynamic id;
  final Store? store;
  final dynamic storeId;
  final dynamic name;
  final dynamic slug;
  final dynamic description;
  final dynamic image;
  final dynamic imageUrl;
  final dynamic stock;
  final dynamic price;
  final dynamic specialPrice;
  final List<SingleVariant>? singleVariant;
  final dynamic discountPercentage;
  final dynamic wishlist;
  final dynamic rating;
  final dynamic reviewCount;
  final dynamic maxCartQty;
  final FlashSale? flashSale;

  TopRatedData({
    this.id,
    this.store,
    this.storeId,
    this.name,
    this.slug,
    this.description,
    this.image,
    this.imageUrl,
    this.stock,
    this.price,
    this.specialPrice,
    this.singleVariant,
    this.discountPercentage,
    this.wishlist,
    this.rating,
    this.reviewCount,
    this.maxCartQty,
    this.flashSale,
  });

  factory TopRatedData.fromJson(Map<String, dynamic> json) => TopRatedData(
        id: json["id"],
        store: Store.fromJson(json["store"]),
        storeId: json["store_id"],
        name: json["name"],
        slug: json["slug"],
        description: json["description"],
        image: json["image"],
        imageUrl: json["image_url"],
        stock: json["stock"],
        price: json["price"],
        specialPrice: json["special_price"],
        singleVariant: json["singleVariant"] == null
            ? null
            : List<SingleVariant>.from(
                json["singleVariant"].map((x) => SingleVariant.fromJson(x))),
        discountPercentage: json["discount_percentage"]?.toDouble(),
        wishlist: json["wishlist"],
        rating: json["rating"],
        reviewCount: json["review_count"],
    maxCartQty: json["max_cart_qty"],
    flashSale: json["flash_sale"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "store": store?.toJson(),
        "store_id": storeId,
        "name": name,
        "slug": slug,
        "description": description,
        "image": image,
        "image_url": imageUrl,
        "stock": stock,
        "price": price,
        "special_price": specialPrice,
        "singleVariant": singleVariant == null
            ? null
            : List<dynamic>.from(singleVariant!.map((x) => x.toJson())),
        "discount_percentage": discountPercentage,
        "wishlist": wishlist,
        "rating": rating,
        "review_count": reviewCount,
        "max_cart_qty": maxCartQty,
        "flash_sale": flashSale,
      };
}

class SingleVariant {
  final dynamic id;
  final dynamic productId;
  final dynamic variantSlug;
  final dynamic sku;
  final dynamic packQuantity;
  final dynamic weightMajor;
  final dynamic weightGross;
  final dynamic weightNet;
  final dynamic attributes;
  final dynamic price;
  final dynamic specialPrice;
  final dynamic stockQuantity;
  final dynamic unitId;
  final dynamic length;
  final dynamic width;
  final dynamic height;
  final dynamic image;
  final dynamic orderCount;
  final dynamic status;
  final dynamic deletedAt;
  final dynamic createdAt;
  final dynamic updatedAt;

  SingleVariant({
     this.id,
     this.productId,
     this.variantSlug,
     this.sku,
     this.packQuantity,
     this.weightMajor,
     this.weightGross,
     this.weightNet,
     this.attributes,
     this.price,
     this.specialPrice,
     this.stockQuantity,
     this.unitId,
     this.length,
     this.width,
     this.height,
     this.image,
     this.orderCount,
     this.status,
     this.deletedAt,
     this.createdAt,
     this.updatedAt,
  });

  factory SingleVariant.fromJson(Map<String, dynamic> json) => SingleVariant(
        id: json["id"],
        productId: json["product_id"],
        variantSlug: json["variant_slug"],
        sku: json["sku"],
        packQuantity: json["pack_quantity"],
        weightMajor: json["weight_major"],
        weightGross: json["weight_gross"],
        weightNet: json["weight_net"],
        attributes: json["attributes"],
        price: json["price"],
        specialPrice: json["special_price"],
        stockQuantity: json["stock_quantity"],
        unitId: json["unit_id"],
        length: json["length"],
        width: json["width"],
        height: json["height"],
        image: json["image"],
        orderCount: json["order_count"],
        status: json["status"],
        deletedAt: json["deleted_at"],
        createdAt: json["created_at"],
        updatedAt:json["updated_at"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "product_id": productId,
        "variant_slug": variantSlug,
        "sku": sku,
        "pack_quantity": packQuantity,
        "weight_major": weightMajor,
        "weight_gross": weightGross,
        "weight_net": weightNet,
        "attributes": attributes,
        "price": price,
        "special_price": specialPrice,
        "stock_quantity": stockQuantity,
        "unit_id": unitId,
        "length": length,
        "width": width,
        "height": height,
        "image": image,
        "order_count": orderCount,
        "status": status,
        "deleted_at": deletedAt,
        "created_at": createdAt,
        "updated_at": updatedAt,
      };
}
