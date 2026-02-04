// To parse this JSON data, do
//
//     final profileImageUploadModel = profileImageUploadModelFromJson(jsonString);

import 'dart:convert';

ProfileImageUploadModel profileImageUploadModelFromJson(String str) => ProfileImageUploadModel.fromJson(json.decode(str));

String profileImageUploadModelToJson(ProfileImageUploadModel data) => json.encode(data.toJson());

class ProfileImageUploadModel {
  final dynamic message;
  final dynamic imageId;
  final dynamic imageUrl;

  ProfileImageUploadModel({
    this.message,
    this.imageId,
    this.imageUrl,
  });

  factory ProfileImageUploadModel.fromJson(Map<String, dynamic> json) => ProfileImageUploadModel(
    message: json["message"],
    imageId: json["image_id"],
    imageUrl: json["image_url"],
  );

  Map<String, dynamic> toJson() => {
    "message": message,
    "image_id": imageId,
    "image_url": imageUrl,
  };
}
