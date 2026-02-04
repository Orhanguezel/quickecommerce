// To parse this JSON data, do
//
//     final supportTicketModel = supportTicketModelFromJson(jsonString);

import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';



SupportTicketModel supportTicketModelFromJson(String str) => SupportTicketModel.fromJson(json.decode(str));

String supportTicketModelToJson(SupportTicketModel data) => json.encode(data.toJson());

class SupportTicketModel {
  final String? message;
  final List<TicketData>? data;
  final Meta? meta;

  SupportTicketModel({
     this.message,
     this.data,
     this.meta,
  });

  factory SupportTicketModel.fromJson(Map<String, dynamic> json) => SupportTicketModel(
    message: json["message"],
    data:json["data"]==null?null: List<TicketData>.from(json["data"].map((x) => TicketData.fromJson(x))),
    meta: Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "message": message,
    "data":data==null?null: List<dynamic>.from(data!.map((x) => x.toJson())),
    "meta": meta!.toJson(),
  };
}

class TicketData {
  final dynamic id;
  final dynamic title;
  final dynamic priority;
  final dynamic status;
  final dynamic department;
  final dynamic createdBy;

  TicketData({
     this.id,
     this.title,
    this.priority,
     this.status,
     this.department,
     this.createdBy,
  });

  factory TicketData.fromJson(Map<String, dynamic> json) => TicketData(
    id: json["id"],
    title: json["title"],
    priority: json["priority"],
    status: json["status"],
    department: json["department"],
    createdBy: json["created_by"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "title": title,
    "priority": priority,
    "status": status,
    "department": department,
    "created_by": createdBy,
  };
}
