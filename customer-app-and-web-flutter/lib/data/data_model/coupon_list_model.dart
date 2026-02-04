

import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


CouponListModel couponListModelFromJson(String str) => CouponListModel.fromJson(json.decode(str));

String couponListModelToJson(CouponListModel data) => json.encode(data.toJson());

class CouponListModel {
  final List<CouponData> data;
  final Meta meta;

  CouponListModel({
    required this.data,
    required this.meta,
  });

  factory CouponListModel.fromJson(Map<String, dynamic> json) => CouponListModel(
    data: List<CouponData>.from(json["data"].map((x) => CouponData.fromJson(x))),
    meta: Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "data": List<dynamic>.from(data.map((x) => x.toJson())),
    "meta": meta.toJson(),
  };
}

class CouponData {
  final dynamic id;
  final dynamic couponTitle;
  final dynamic couponDescription;
  final dynamic couponImageUrl;
  final dynamic couponCode;
  final dynamic discountType;
  final dynamic discount;
  final dynamic startDate;
  final dynamic endDate;

  CouponData({
     this.id,
     this.couponTitle,
     this.couponDescription,
     this.couponImageUrl,
     this.couponCode,
     this.discountType,
     this.discount,
     this.startDate,
     this.endDate,
  });

  factory CouponData.fromJson(Map<String, dynamic> json) => CouponData(
    id: json["id"],
    couponTitle: json["coupon_title"],
    couponDescription: json["coupon_description"],
    couponImageUrl: json["coupon_image_url"],
    couponCode: json["coupon_code"],
    discountType:json["discount_type"],
    discount: json["discount"],
    startDate:json["start_date"],
    endDate: json["end_date"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "coupon_title": couponTitle,
    "coupon_description": couponDescription,
    "coupon_image_url": couponImageUrl,
    "coupon_code": couponCode,
    "discount_type": discountType,
    "discount": discount,
    "start_date": startDate,
    "end_date": endDate,
  };
}

