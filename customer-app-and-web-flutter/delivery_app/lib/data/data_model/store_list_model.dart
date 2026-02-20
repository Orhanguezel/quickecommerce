// To parse this JSON data, do
//
//     final storeListModel = storeListModelFromJson(jsonString);

import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


StoreListModel storeListModelFromJson(String str) => StoreListModel.fromJson(json.decode(str));

String storeListModelToJson(StoreListModel data) => json.encode(data.toJson());

class StoreListModel {
  final bool? status;
  final int? statusCode;
  final String message;
  final List<StoreData> data;
  final Meta? meta;

  StoreListModel({
     this.status,
     this.statusCode,
    required this.message,
    required  this.data,
     this.meta,
  });

  factory StoreListModel.fromJson(Map<String, dynamic> json) => StoreListModel(
    status: json["status"],
    statusCode: json["status_code"],
    message: json["message"],
    data: List<StoreData>.from(json["data"].map((x) => StoreData.fromJson(x))),
    meta: Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "status": status,
    "status_code": statusCode,
    "message": message,
    "data": List<dynamic>.from(data.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}

class StoreData {
  final dynamic id;
  final dynamic area;
  final dynamic seller;
  final dynamic storeType;
  final dynamic name;
  final dynamic slug;
  final dynamic description;
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
  final dynamic rating;

  StoreData({
     this.id,
     this.area,
     this.seller,
     this.storeType,
     this.name,
     this.slug,
     this.description,
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
     this.rating,
  });

  factory StoreData.fromJson(Map<String, dynamic> json) => StoreData(
    id: json["id"],
    area: json["area"],
    seller: json["seller"],
    storeType: json["store_type"],
    name: json["name"],
    slug: json["slug"],
    description: json["description"],
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
    rating: json["rating"]?.toDouble(),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "area": area,
    "seller": seller,
    "store_type": storeType,
    "name": name,
    "slug": slug,
    "description": description,
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
    "rating": rating,
  };
}



