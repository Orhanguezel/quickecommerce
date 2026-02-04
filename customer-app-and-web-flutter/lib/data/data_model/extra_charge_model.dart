// To parse this JSON data, do
//
//     final extraChargeModel = extraChargeModelFromJson(jsonString);

import 'dart:convert';

ExtraChargeModel extraChargeModelFromJson(String str) =>
    ExtraChargeModel.fromJson(json.decode(str));

String extraChargeModelToJson(ExtraChargeModel data) =>
    json.encode(data.toJson());

class ExtraChargeModel {
  final List<FlashSale>? flashSale;
  final List<FlashSaleProduct>? flashSaleProducts;
  final AdditionalCharge? additionalCharge;
  final bool? orderIncludeTaxAmount;

  ExtraChargeModel({
    this.flashSale,
    this.flashSaleProducts,
    this.additionalCharge,
    this.orderIncludeTaxAmount,
  });

  factory ExtraChargeModel.fromJson(Map<String, dynamic> json) =>
      ExtraChargeModel(
        flashSale:json["flash_sale"]==null?null: List<FlashSale>.from(json["flash_sale"].map((x) => FlashSale.fromJson(x))),
        flashSaleProducts: json["flash_sale_products"]==null?null: List<FlashSaleProduct>.from(
            json["flash_sale_products"]
                .map((x) => FlashSaleProduct.fromJson(x))),
        additionalCharge: AdditionalCharge.fromJson(json["additional_charge"]),
        orderIncludeTaxAmount: json["order_include_tax_amount"],
      );

  Map<String, dynamic> toJson() => {
    "flash_sale": List<dynamic>.from(flashSale!.map((x) => x.toJson())),
        "flash_sale_products":
            List<dynamic>.from(flashSaleProducts!.map((x) => x.toJson())),
        "additional_charge": additionalCharge?.toJson(),
        "order_include_tax_amount": orderIncludeTaxAmount,
      };
}


class FlashSale {
  final dynamic flashSaleId;
  final dynamic discountType;
  final dynamic discountAmount;
  final dynamic purchaseLimit;

  FlashSale({
     this.flashSaleId,
     this.discountType,
     this.discountAmount,
     this.purchaseLimit,
  });

  factory FlashSale.fromJson(Map<String, dynamic> json) => FlashSale(
    flashSaleId: json["flash_sale_id"],
    discountType: json["discount_type"],
    discountAmount: json["discount_amount"],
    purchaseLimit: json["purchase_limit"],
  );

  Map<String, dynamic> toJson() => {
    "flash_sale_id": flashSaleId,
    "discount_type": discountType,
    "discount_amount": discountAmount,
    "purchase_limit": purchaseLimit,
  };
}


class AdditionalCharge {
  final dynamic orderAdditionalChargeEnableDisable;
  final dynamic orderAdditionalChargeName;
  final dynamic orderAdditionalChargeAmount;

  AdditionalCharge({
    this.orderAdditionalChargeEnableDisable,
    this.orderAdditionalChargeName,
    this.orderAdditionalChargeAmount,
  });

  factory AdditionalCharge.fromJson(Map<String, dynamic> json) =>
      AdditionalCharge(
        orderAdditionalChargeEnableDisable:
            json["order_additional_charge_enable_disable"],
        orderAdditionalChargeName: json["order_additional_charge_name"],
        orderAdditionalChargeAmount: json["order_additional_charge_amount"],
      );

  Map<String, dynamic> toJson() => {
        "order_additional_charge_enable_disable":
            orderAdditionalChargeEnableDisable,
        "order_additional_charge_name": orderAdditionalChargeName,
        "order_additional_charge_amount": orderAdditionalChargeAmount,
      };
}

class FlashSaleProduct {
  final dynamic id;
  final dynamic name;
  final dynamic slug;
  final dynamic description;
  final dynamic image;
  final dynamic imageUrl;
  final dynamic stock;
  final dynamic price;
  final dynamic specialPrice;
  final dynamic discountPercentage;
  final dynamic wishlist;
  final dynamic rating;
  final dynamic reviewCount;
  final dynamic discountType;
  final dynamic discountAmount;
  final dynamic purchaseLimit;

  FlashSaleProduct({
    this.id,
    this.name,
    this.slug,
    this.description,
    this.image,
    this.imageUrl,
    this.stock,
    this.price,
    this.specialPrice,
    this.discountPercentage,
    this.wishlist,
    this.rating,
    this.reviewCount,
    this.discountType,
    this.discountAmount,
    this.purchaseLimit,
  });

  factory FlashSaleProduct.fromJson(Map<String, dynamic> json) =>
      FlashSaleProduct(
        id: json["id"],
        name: json["name"],
        slug: json["slug"],
        description: json["description"],
        image: json["image"],
        imageUrl: json["image_url"],
        stock: json["stock"],
        price: json["price"],
        specialPrice: json["special_price"],
        discountPercentage: json["discount_percentage"]?.toDouble(),
        wishlist: json["wishlist"],
        rating: json["rating"],
        reviewCount: json["review_count"],
        discountType: json["discount_type"],
        discountAmount: json["discount_amount"],
        purchaseLimit: json["purchase_limit"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
        "slug": slug,
        "description": description,
        "image": image,
        "image_url": imageUrl,
        "stock": stock,
        "price": price,
        "special_price": specialPrice,
        "discount_percentage": discountPercentage,
        "wishlist": wishlist,
        "rating": rating,
        "review_count": reviewCount,
        "discount_type": discountType,
        "discount_amount": discountAmount,
        "purchase_limit": purchaseLimit,
      };
}
