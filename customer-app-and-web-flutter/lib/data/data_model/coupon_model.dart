// To parse this JSON data, do
//
//     final couponModel = couponModelFromJson(jsonString);

import 'dart:convert';

CouponModel couponModelFromJson(String str) => CouponModel.fromJson(json.decode(str));

String couponModelToJson(CouponModel data) => json.encode(data.toJson());

class CouponModel {

  final dynamic message;
  final Coupon? coupon;

  CouponModel({
     this.message,
    required this.coupon,
  });

  factory CouponModel.fromJson(Map<String, dynamic> json) => CouponModel(
    message: json["message"],
    coupon: json["coupon"] != null
        ? Coupon.fromJson(json["coupon"])
        : null,
  );

  Map<String, dynamic> toJson() => {
    "message": message,
    "coupon": coupon?.toJson(),
  };
}

class Coupon {
  final dynamic title;
  final dynamic discountAmount;
  final dynamic discountType;
  final dynamic maxDiscount;
  final dynamic minOrderValue;
  final dynamic code;
  final dynamic discountedAmount;
  final dynamic finalAmount;

  Coupon({
     this.title,
     this.discountAmount,
     this.discountType,
     this.maxDiscount,
     this.minOrderValue,
     this.code,
     this.discountedAmount,
     this.finalAmount,
  });

  factory Coupon.fromJson(Map<String, dynamic> json) => Coupon(
    title: json["title"],
    discountAmount: json["discount_amount"],
    discountType: json["discount_type"],
    maxDiscount: json["max_discount"],
    minOrderValue: json["min_order_value"],
    code: json["code"],
    discountedAmount: json["discounted_amount"],
    finalAmount: json["final_amount"],
  );

  Map<String, dynamic> toJson() => {
    "title": title,
    "discount_amount": discountAmount,
    "discount_type": discountType,
    "max_discount": maxDiscount,
    "min_order_value": minOrderValue,
    "code": code,
    "discounted_amount": discountedAmount,
    "final_amount": finalAmount,
  };
}
