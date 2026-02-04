// To parse this JSON data, do
//
//     final storeDetailsModel = storeDetailsModelFromJson(jsonString);

import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


StoreDetailsModel storeDetailsModelFromJson(String str) => StoreDetailsModel.fromJson(json.decode(str));

String storeDetailsModelToJson(StoreDetailsModel data) => json.encode(data.toJson());

class StoreDetailsModel {
  final bool status;
  final int statusCode;
  final String message;
  final Data? data;

  StoreDetailsModel({
    required this.status,
    required this.statusCode,
    required this.message,
    required this.data,
  });

  factory StoreDetailsModel.fromJson(Map<String, dynamic> json) => StoreDetailsModel(
    status: json["status"],
    statusCode: json["status_code"],
    message: json["message"],
    data: json["data"] != null ? Data.fromJson(json["data"]) : null,
  );

  Map<String, dynamic> toJson() => {
    "status": status,
    "status_code": statusCode,
    "message": message,
    "data": data?.toJson(),
  };
}

class Data {
  final dynamic id;
  final dynamic area;
  final dynamic storeType;
  final dynamic name;
  final dynamic slug;
  final dynamic phone;
  final dynamic email;
  final dynamic logo;
  final dynamic logoUrl;
  final dynamic banner;
  final dynamic bannerUrl;
  final dynamic address;
  final dynamic isFeatured;
  final dynamic openingTime;
  final dynamic closingTime;
  final dynamic vegStatus;
  final dynamic offDay;
  final dynamic totalProduct;
  final List<ProductData>? allProducts;
  final List<ProductData>? featuredProducts;
  final dynamic areaId;
  final Seller? seller;
  final dynamic description;
  final dynamic tax;
  final dynamic taxNumber;
  final dynamic businessPlan;
  final dynamic deliveryTime;
  final dynamic startedFrom;
  final dynamic rating;
  final dynamic additionalChargeName;
  final dynamic additionalChargeAmount;
  final dynamic additionalChargeType;

  Data({
     this.id,
     this.area,
     this.storeType,
     this.name,
     this.slug,
     this.phone,
     this.email,
     this.logo,
     this.logoUrl,
     this.banner,
     this.bannerUrl,
     this.address,
     this.isFeatured,
     this.openingTime,
     this.closingTime,
     this.vegStatus,
     this.offDay,
     this.totalProduct,
     this.allProducts,
     this.featuredProducts,
     this.areaId,
     this.seller,
     this.description,
     this.tax,
     this.taxNumber,
     this.businessPlan,
     this.deliveryTime,
     this.startedFrom,
     this.rating,
    this.additionalChargeName,
    this.additionalChargeAmount,
    this.additionalChargeType,
  });

  factory Data.fromJson(Map<String, dynamic> json) => Data(
    id: json["id"],
    area: json["area"],
    storeType: json["store_type"],
    name: json["name"],
    slug: json["slug"],
    phone: json["phone"],
    email: json["email"],
    logo: json["logo"],
    logoUrl: json["logo_url"],
    banner: json["banner"],
    bannerUrl: json["banner_url"],
    address: json["address"],
    isFeatured: json["is_featured"],
    openingTime: json["opening_time"],
    closingTime: json["closing_time"],
    vegStatus: json["veg_status"],
    offDay: json["off_day"],
    totalProduct: json["total_product"],
    allProducts: json["all_products"] == null
        ? []
        : List<ProductData>.from(
      (json["all_products"] as List)
          .where((x) => x != null)
          .map((x) => ProductData.fromJson(x as Map<String, dynamic>)),
    ),
    featuredProducts: json["featured_products"] != null
        ? List<ProductData>.from(json["featured_products"].map((x) => ProductData.fromJson(x)))
        : [],
    areaId: json["area_id"],
    seller: json["seller"] == null ? null : Seller.fromJson(json["seller"]),
    description: json["description"],
    tax: json["tax"],
    taxNumber: json["tax_number"],
    businessPlan: json["business_plan"],
    deliveryTime: json["delivery_time"],
    startedFrom: json["started_from"],
    rating: json["rating"]?.toDouble(),
    additionalChargeName: json["additional_charge_name"],
    additionalChargeAmount: json["additional_charge_amount"],
    additionalChargeType:json["additional_charge_type"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "area": area,
    "store_type": storeType,
    "name": name,
    "slug": slug,
    "phone": phone,
    "email": email,
    "logo": logo,
    "logo_url": logoUrl,
    "banner": banner,
    "banner_url": bannerUrl,
    "address": address,
    "is_featured": isFeatured,
    "opening_time": openingTime,
    "closing_time": closingTime,
    "veg_status": vegStatus,
    "off_day": offDay,
    "total_product": totalProduct,
    "all_products": List<ProductData>.from(allProducts!.map((x) => x.toJson())),
    "featured_products": List<ProductData>.from(featuredProducts!.map((x) => x.toJson())),
    "area_id": areaId,
    "seller": seller?.toJson(),
    "description": description,
    "tax": tax,
    "tax_number": taxNumber,
    "business_plan": businessPlan,
    "delivery_time": deliveryTime,
    "started_from": startedFrom,
    "rating": rating,
    "additional_charge_name": additionalChargeName,
    "additional_charge_amount": additionalChargeAmount,
    "additional_charge_type": additionalChargeType,
  };
}

class Seller {
  final dynamic id;
  final dynamic name;
  final dynamic phone;
  final dynamic email;

  Seller({
     this.id,
     this.name,
     this.phone,
     this.email,
  });

  factory Seller.fromJson(Map<String, dynamic> json) => Seller(
    id: json["id"],
    name: json["name"],
    phone: json["phone"],
    email: json["email"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "phone": phone,
    "email": email,
  };
}