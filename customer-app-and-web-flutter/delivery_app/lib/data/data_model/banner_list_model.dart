// To parse this JSON data, do
//
//     final bannerListModel = bannerListModelFromJson(jsonString);

import 'dart:convert';

BannerListModel bannerListModelFromJson(String str) => BannerListModel.fromJson(json.decode(str));

String bannerListModelToJson(BannerListModel data) => json.encode(data.toJson());

class BannerListModel {
  final List<BannerData> data;

  BannerListModel({
    required this.data,
  });

  factory BannerListModel.fromJson(Map<String, dynamic> json) => BannerListModel(
    data: List<BannerData>.from(json["data"].map((x) => BannerData.fromJson(x))),
  );

  Map<String, dynamic> toJson() => {
    "data": List<dynamic>.from(data.map((x) => x.toJson())),
  };
}

class BannerData {
  final dynamic id;
  final dynamic title;
  final dynamic description;
  final dynamic buttonText;
  final dynamic backgroundImage;
  final dynamic thumbnailImage;
  final dynamic buttonColor;
  final dynamic redirectUrl;
  final dynamic location;
  final dynamic type;
  final dynamic status;
  final dynamic titleColor;
  final dynamic descriptionColor;
  final dynamic buttonTextColor;
  final dynamic buttonHoverColor;
  final dynamic backgroundColor;

  BannerData({
     this.id,
     this.title,
     this.description,
     this.buttonText,
     this.backgroundImage,
     this.thumbnailImage,
     this.buttonColor,
     this.redirectUrl,
     this.location,
     this.type,
     this.status,
     this.titleColor,
     this.descriptionColor,
     this.buttonTextColor,
     this.buttonHoverColor,
     this.backgroundColor,
  });

  factory BannerData.fromJson(Map<String, dynamic> json) => BannerData(
    id: json["id"],
    title: json["title"],
    description: json["description"],
    buttonText: json["button_text"],
    backgroundImage: json["background_image"],
    thumbnailImage: json["thumbnail_image"],
    buttonColor: json["button_color"],
    redirectUrl: json["redirect_url"],
    location: json["location"],
    type: json["type"],
    status: json["status"],
    titleColor: json["title_color"],
    descriptionColor: json["description_color"],
    buttonTextColor: json["button_text_color"],
    buttonHoverColor: json["button_hover_color"],
    backgroundColor: json["background_color"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "title": title,
    "description": description,
    "button_text": buttonText,
    "background_image": backgroundImage,
    "thumbnail_image": thumbnailImage,
    "button_color": buttonColor,
    "redirect_url": redirectUrl,
    "location": location,
    "type": type,
    "status": status,
    "title_color": titleColor,
    "description_color": descriptionColor,
    "button_text_color": buttonTextColor,
    "button_hover_color": buttonHoverColor,
    "background_color": backgroundColor,
  };
}
