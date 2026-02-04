// To parse this JSON data, do
//
//     final businessPlanModel = businessPlanModelFromJson(jsonString);

import 'dart:convert';

PrivacyPolicyModel businessPlanModelFromJson(String str) => PrivacyPolicyModel.fromJson(json.decode(str));

String businessPlanModelToJson(PrivacyPolicyModel data) => json.encode(data.toJson());

class PrivacyPolicyModel {
  final dynamic content;
  final dynamic metaTitle;
  final dynamic metaDescription;
  final dynamic metaKeywords;

  PrivacyPolicyModel({
    this.content,
    this.metaTitle,
    this.metaDescription,
    this.metaKeywords,
  });

  factory PrivacyPolicyModel.fromJson(Map<String, dynamic> json) => PrivacyPolicyModel(
    content: json["content"],
    metaTitle: json["meta_title"],
    metaDescription: json["meta_description"],
    metaKeywords: json["meta_keywords"],
  );

  Map<String, dynamic> toJson() => {
    "content": content,
    "meta_title": metaTitle,
    "meta_description": metaDescription,
    "meta_keywords": metaKeywords,
  };
}
