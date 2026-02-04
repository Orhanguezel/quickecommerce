// To parse this JSON data, do
//
//     final questionModel = questionModelFromJson(jsonString);

import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


QuestionModel questionModelFromJson(String str) => QuestionModel.fromJson(json.decode(str));

String questionModelToJson(QuestionModel data) => json.encode(data.toJson());

class QuestionModel {
  final List<QuestionData>? data;
  final Meta? meta;

  QuestionModel({
    required this.data,
     this.meta,
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) => QuestionModel(
    data: List<QuestionData>.from(json["data"].map((x) => QuestionData.fromJson(x))),
    meta: Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "data": List<dynamic>.from(data!.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}

class QuestionData {
  final dynamic id;
  final dynamic productId;
  final dynamic customer;
  final dynamic question;
  final dynamic store;
  final dynamic reply;
  final dynamic repliedAt;
  final dynamic status;
  final dynamic createdAt;

  QuestionData({
     this.id,
     this.productId,
     this.customer,
     this.question,
     this.store,
     this.reply,
     this.repliedAt,
     this.status,
     this.createdAt,
  });

  factory QuestionData.fromJson(Map<String, dynamic> json) => QuestionData(
    id: json["id"],
    productId: json["product_id"],
    customer: json["customer"],
    question: json["question"],
    store: json["store"],
    reply: json["reply"],
    repliedAt: json["replied_at"],
    status: json["status"],
    createdAt: json["created_at"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "product_id": productId,
    "customer": customer,
    "question": question,
    "store": store,
    "reply": reply,
    "replied_at": repliedAt,
    "status": status,
    "created_at": createdAt,
  };
}
