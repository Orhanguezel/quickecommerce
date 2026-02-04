// To parse this JSON data, do
//
//     final notificationModel = notificationModelFromJson(jsonString);

import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


NotificationModel notificationModelFromJson(String str) => NotificationModel.fromJson(json.decode(str));

String notificationModelToJson(NotificationModel data) => json.encode(data.toJson());

class NotificationModel {
  final bool? success;
  final String? message;
  final List<NotificationData>? data;
  final Meta? meta;

  NotificationModel({
     this.success,
     this.message,
    required this.data,
     this.meta,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) => NotificationModel(
    success: json["success"],
    message: json["message"],
    data:json["data"]==null?null:List<NotificationData>.from(json["data"].map((x) => NotificationData.fromJson(x))),
    meta: Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "success": success,
    "message": message,
    "data": List<dynamic>.from(data!.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}

class NotificationData {
  final dynamic id;
  final dynamic value;
  final dynamic label;
  final dynamic title;
  final dynamic message;
  final dynamic notifiableType;
  final dynamic notifiableId;
  final Data? data;
  final dynamic status;
  final dynamic createdAt;

  NotificationData({
     this.id,
     this.value,
     this.label,
     this.title,
     this.message,
     this.notifiableType,
     this.notifiableId,
     this.data,
     this.status,
     this.createdAt,
  });

  factory NotificationData.fromJson(Map<String, dynamic> json) => NotificationData(
    id: json["id"],
    value: json["value"],
    label: json["label"],
    title: json["title"],
    message: json["message"],
    notifiableType: json["notifiable_type"],
    notifiableId: json["notifiable_id"],
    data:json["data"]==null?null:Data.fromJson(json["data"]),
    status: json["status"],
    createdAt:json["created_at"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "value": value,
    "label": label,
    "title": title,
    "message": message,
    "notifiable_type": notifiableType,
    "notifiable_id": notifiableId,
    "data": data?.toJson(),
    "status": status,
    "created_at": createdAt,
  };
}

class Data {
  final dynamic orderId;

  Data({
     this.orderId,
  });

  factory Data.fromJson(Map<String, dynamic> json) => Data(
    orderId: json["order_id"],
  );

  Map<String, dynamic> toJson() => {
    "order_id": orderId,
  };
}
