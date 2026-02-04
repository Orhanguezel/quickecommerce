// To parse this JSON data, do
//
//     final flashDealModel = flashDealModelFromJson(jsonString);

import 'dart:convert';

FlashDealModel flashDealModelFromJson(String str) => FlashDealModel.fromJson(json.decode(str));

String flashDealModelToJson(FlashDealModel data) => json.encode(data.toJson());

class FlashDealModel {

  final String message;
  final List<FlushData> data;

  FlashDealModel({

    required this.message,
    required this.data,
  });

  factory FlashDealModel.fromJson(Map<String, dynamic> json) => FlashDealModel(

    message: json["message"],
    data: List<FlushData>.from(json["data"].map((x) => FlushData.fromJson(x))),
  );

  Map<String, dynamic> toJson() => {
    "message": message,
    "data": List<dynamic>.from(data.map((x) => x.toJson())),
  };
}

class FlushData {
  final dynamic id;
  final dynamic title;
  final dynamic description;
  final dynamic thumbnailImage;
  final dynamic coverImage;
  final dynamic discountType;
  final dynamic discountPrice;
  final dynamic specialPrice;
  final dynamic startTime;
  final dynamic endTime;
  final dynamic titleColor;
  final dynamic descriptionColor;
  final dynamic backgroundColor;
  final dynamic image;
  final dynamic imageUrl;
  final dynamic coverImageUrl;
  final dynamic discountAmount;
  final dynamic buttonText;
  final dynamic buttonTextColor;
  final dynamic buttonHoverColor;
  final dynamic buttonBgColor;
  final dynamic buttonUrl;
  final dynamic timerBgColor;
  final dynamic timerTextColor;

  FlushData({
     this.id,
     this.title,
     this.description,
     this.thumbnailImage,
     this.coverImage,
     this.discountType,
     this.discountPrice,
     this.specialPrice,
     this.startTime,
     this.endTime,
     this.titleColor,
     this.descriptionColor,
     this.backgroundColor,
     this.image,
     this.imageUrl,
     this.coverImageUrl,
     this.discountAmount,
     this.buttonText,
     this.buttonTextColor,
     this.buttonHoverColor,
     this.buttonBgColor,
     this.buttonUrl,
     this.timerBgColor,
     this.timerTextColor,
  });

  factory FlushData.fromJson(Map<String, dynamic> json) => FlushData(
    id: json["id"],
    title: json["title"],
    description: json["description"],
    thumbnailImage: json["thumbnail_image"],
    coverImage: json["cover_image"],
    discountType: json["discount_type"],
    discountPrice: json["discount_price"],
    specialPrice: json["special_price"],
    startTime: json["start_time"],
    endTime: json["end_time"],
    titleColor: json["title_color"],
    descriptionColor: json["description_color"],
    backgroundColor: json["background_color"],
    image: json["image"],
    imageUrl: json["image_url"],
    coverImageUrl: json["cover_image_url"],
    discountAmount: json["discount_amount"],
    buttonText: json["button_text"],
    buttonTextColor: json["button_text_color"],
    buttonHoverColor: json["button_hover_color"],
    buttonBgColor: json["button_bg_color"],
    buttonUrl: json["button_url"],
    timerBgColor: json["timer_bg_color"],
    timerTextColor: json["timer_text_color"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "title": title,
    "description": description,
    "thumbnail_image": thumbnailImage,
    "cover_image": coverImage,
    "discount_type": discountType,
    "discount_price": discountPrice,
    "special_price": specialPrice,
    "start_time": startTime,
    "end_time": endTime,
    "title_color": titleColor,
    "description_color": descriptionColor,
    "background_color": backgroundColor,
    "image": image,
    "image_url": imageUrl,
    "cover_image_url": coverImageUrl,
    "discount_amount": discountAmount,
    "button_text": buttonText,
    "button_text_color": buttonTextColor,
    "button_hover_color": buttonHoverColor,
    "button_bg_color": buttonBgColor,
    "button_url": buttonUrl,
    "timer_bg_color": timerBgColor,
    "timer_text_color": timerTextColor,
  };
}
