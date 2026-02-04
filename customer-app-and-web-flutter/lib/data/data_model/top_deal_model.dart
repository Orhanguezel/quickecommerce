import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


// Parse JSON string to TopDealModel
TopDealModel productResponseFromJson(String str) =>
    TopDealModel.fromJson(json.decode(str));

// Convert TopDealModel to JSON string
String productResponseToJson(TopDealModel data) => json.encode(data.toJson());

class TopDealModel {
  final String messages;
  final List<TopProduct>? data;
  final Meta? meta;
  TopDealModel({
    required this.messages,
    required this.data,
    this.meta,
  });

  factory TopDealModel.fromJson(Map<String, dynamic> json) {
    return TopDealModel(
      messages: json['message'],
      data: json['data'] != null
          ? List<TopProduct>.from(
              json['data'].map((x) => TopProduct.fromJson(x)),
            )
          : null,
      meta:json["meta"]==null?null: Meta.fromJson(json["meta"]),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'message': messages,
      'data': data != null
          ? List<dynamic>.from(data!.map((x) => x.toJson()))
          : null,
      "meta": meta?.toJson(),
    };
  }
}

class TopProduct {
  final dynamic id;
  final Store? store;
  final dynamic name;
  final dynamic description;
  final dynamic image;
  final dynamic imageUrl;
  final dynamic stock;
  final dynamic price;
  final dynamic specialPrice;
  final List<SingleVariant>? singleVariant;
  final dynamic discountPercentage;
  final dynamic wishlist;
  final List<Translation>? translations;
  final dynamic storeId;
  final dynamic category;
  final dynamic slug;
  final dynamic rating;
  final dynamic reviewCount;
  final dynamic maxCartQty;
  final dynamic flashSale;

  TopProduct({
    this.id,
    this.store,
    this.name,
    this.description,
    this.image,
    this.imageUrl,
    this.stock,
    this.price,
    this.specialPrice,
    this.singleVariant,
    this.discountPercentage,
    this.wishlist,
    this.translations,
     this.storeId,
     this.category,
     this.slug,
     this.rating,
     this.reviewCount,
     this.maxCartQty,
     this.flashSale,
  });

  factory TopProduct.fromJson(Map<String, dynamic> json) {
    return TopProduct(
      id: json['id'],
      store: Store.fromJson(json["store"]),
      name: json['name'],
      description: json['description'],
      image: json['image'],
      imageUrl: json["image_url"],
      stock: json["stock"],
      price: json['price'],
      specialPrice: json['special_price'],
      singleVariant: json["singleVariant"] != null
          ? List<SingleVariant>.from(
              json["singleVariant"].map((x) => SingleVariant.fromJson(x)))
          : [],
      discountPercentage: json["discount_percentage"]?.toDouble(),
      wishlist: json["wishlist"],
      translations: json['translations'] != null
          ? List<Translation>.from(
              json['translations'].map((x) => Translation.fromJson(x)),
            )
          : [],
      storeId: json["store_id"],
      category: json["category"],
      slug: json["slug"],
      rating: json["rating"],
      reviewCount: json["review_count"],
      maxCartQty: json["max_cart_qty"],
      flashSale: json["flash_sale"],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'store': store?.toJson(),
      'name': name,
      'description': description,
      'image': image,
      "image_url": imageUrl,
      "stock": stock,
      'price': price,
      'special_price': specialPrice,
      "singleVariant": singleVariant != null
          ? List<dynamic>.from(singleVariant!.map((x) => x.toJson()))
          : [],
      "discount_percentage": discountPercentage,
      "wishlist": wishlist,
      'translations': translations != null
          ? List<dynamic>.from(translations!.map((x) => x.toJson()))
          : [],
      "store_id": storeId,
      "category": category,
      "slug": slug,
      "rating": rating,
      "review_count": reviewCount,
      "max_cart_qty": maxCartQty,
      "flash_sale": flashSale,
    };
  }
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
        createdAt: json["created_at"] == null
            ? null
            : DateTime.parse(json["created_at"]),
        updatedAt: json["updated_at"] == null
            ? null
            : DateTime.parse(json["updated_at"]),
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

class Translation {
  final int id;
  final int translatableId;
  final String translatableType;
  final String language;
  final String key;
  final String value;
  final String? createdAt;
  final String? updatedAt;

  Translation({
    required this.id,
    required this.translatableId,
    required this.translatableType,
    required this.language,
    required this.key,
    required this.value,
    this.createdAt,
    this.updatedAt,
  });

  factory Translation.fromJson(Map<String, dynamic> json) {
    return Translation(
      id: json['id'],
      translatableId: json['translatable_id'],
      translatableType: json['translatable_type'],
      language: json['language'],
      key: json['key'],
      value: json['value'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'translatable_id': translatableId,
      'translatable_type': translatableType,
      'language': language,
      'key': key,
      'value': value,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}
