// To parse this JSON data, do
//
//     final productDetailsSettingsModel = productDetailsSettingsModelFromJson(jsonString);

import 'dart:convert';

ProductDetailsSettingsModel productDetailsSettingsModelFromJson(String str) => ProductDetailsSettingsModel.fromJson(json.decode(str));

String productDetailsSettingsModelToJson(ProductDetailsSettingsModel data) => json.encode(data.toJson());

class ProductDetailsSettingsModel {
  final Data data;

  ProductDetailsSettingsModel({
    required this.data,
  });

  factory ProductDetailsSettingsModel.fromJson(Map<String, dynamic> json) => ProductDetailsSettingsModel(
    data: Data.fromJson(json["data"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data.toJson(),
  };
}

class Data {
  final dynamic comProductDetailsPageDeliveryTitle;
  final dynamic comProductDetailsPageDeliverySubtitle;
  final dynamic comProductDetailsPageDeliveryUrl;
  final dynamic comProductDetailsPageDeliveryEnableDisable;
  final dynamic comProductDetailsPageReturnRefundTitle;
  final dynamic comProductDetailsPageReturnRefundSubtitle;
  final dynamic comProductDetailsPageReturnRefundUrl;
  final dynamic comProductDetailsPageReturnRefundEnableDisable;
  final dynamic comProductDetailsPageRelatedTitle;

  Data({
     this.comProductDetailsPageDeliveryTitle,
     this.comProductDetailsPageDeliverySubtitle,
     this.comProductDetailsPageDeliveryUrl,
     this.comProductDetailsPageDeliveryEnableDisable,
     this.comProductDetailsPageReturnRefundTitle,
     this.comProductDetailsPageReturnRefundSubtitle,
     this.comProductDetailsPageReturnRefundUrl,
     this.comProductDetailsPageReturnRefundEnableDisable,
     this.comProductDetailsPageRelatedTitle,
  });

  factory Data.fromJson(Map<String, dynamic> json) => Data(
    comProductDetailsPageDeliveryTitle: json["com_product_details_page_delivery_title"],
    comProductDetailsPageDeliverySubtitle: json["com_product_details_page_delivery_subtitle"],
    comProductDetailsPageDeliveryUrl: json["com_product_details_page_delivery_url"],
    comProductDetailsPageDeliveryEnableDisable: json["com_product_details_page_delivery_enable_disable"],
    comProductDetailsPageReturnRefundTitle: json["com_product_details_page_return_refund_title"],
    comProductDetailsPageReturnRefundSubtitle: json["com_product_details_page_return_refund_subtitle"],
    comProductDetailsPageReturnRefundUrl: json["com_product_details_page_return_refund_url"],
    comProductDetailsPageReturnRefundEnableDisable: json["com_product_details_page_return_refund_enable_disable"],
    comProductDetailsPageRelatedTitle: json["com_product_details_page_related_title"],
  );

  Map<String, dynamic> toJson() => {
    "com_product_details_page_delivery_title": comProductDetailsPageDeliveryTitle,
    "com_product_details_page_delivery_subtitle": comProductDetailsPageDeliverySubtitle,
    "com_product_details_page_delivery_url": comProductDetailsPageDeliveryUrl,
    "com_product_details_page_delivery_enable_disable": comProductDetailsPageDeliveryEnableDisable,
    "com_product_details_page_return_refund_title": comProductDetailsPageReturnRefundTitle,
    "com_product_details_page_return_refund_subtitle": comProductDetailsPageReturnRefundSubtitle,
    "com_product_details_page_return_refund_url": comProductDetailsPageReturnRefundUrl,
    "com_product_details_page_return_refund_enable_disable": comProductDetailsPageReturnRefundEnableDisable,
    "com_product_details_page_related_title": comProductDetailsPageRelatedTitle,
  };
}
