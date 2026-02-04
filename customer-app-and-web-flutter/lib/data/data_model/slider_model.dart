// To parse this JSON data, do
//
//     final sliderModel = sliderModelFromJson(jsonString);

import 'dart:convert';

SliderModel sliderModelFromJson(String str) => SliderModel.fromJson(json.decode(str));

String sliderModelToJson(SliderModel data) => json.encode(data.toJson());

class SliderModel {
  final String? message;
  final List<Slider>? sliders;

  SliderModel({
     this.message,
     this.sliders,
  });

  factory SliderModel.fromJson(Map<String, dynamic> json) => SliderModel(
    message:json["message"],
    sliders:json["sliders"]==null?null: List<Slider>.from(json["sliders"].map((x) => Slider.fromJson(x))),
  );

  Map<String, dynamic> toJson() => {
    "message": message,
    "sliders": List<dynamic>.from(sliders!.map((x) => x.toJson())),
  };
}

class Slider {
  final dynamic id;
  final dynamic title;
  final dynamic subTitle;
  final dynamic description;
  final dynamic buttonText;
  final dynamic buttonUrl;
  final dynamic redirectUrl;
  final dynamic image;
  final dynamic imageUrl;
  final dynamic order;
  final dynamic titleColor;
  final dynamic subTitleColor;
  final dynamic descriptionColor;
  final dynamic bgColor;
  final dynamic bgImageUrl;
  final dynamic buttonTextColor;
  final dynamic buttonBgColor;
  final dynamic buttonHoverColor;

  Slider({
     this.id,
     this.title,
     this.subTitle,
     this.description,
     this.buttonText,
     this.buttonUrl,
     this.redirectUrl,
     this.image,
     this.imageUrl,
     this.order,
     this.titleColor,
     this.subTitleColor,
     this.descriptionColor,
     this.bgColor,
     this.bgImageUrl,
     this.buttonTextColor,
     this.buttonBgColor,
     this.buttonHoverColor,
  });

  factory Slider.fromJson(Map<String, dynamic> json) => Slider(
    id: json["id"],
    title: json["title"],
    subTitle: json["sub_title"],
    description: json["description"],
    buttonText: json["button_text"],
    buttonUrl: json["button_url"],
    redirectUrl: json["redirect_url"],
    image: json["image"],
    imageUrl: json["image_url"],
    order: json["order"],
    titleColor: json["title_color"],
    subTitleColor: json["sub_title_color"],
    descriptionColor: json["description_color"],
    bgColor: json["bg_color"],
    bgImageUrl: json["bg_image_url"],
    buttonTextColor:json["button_text_color"],
    buttonBgColor: json["button_bg_color"],
    buttonHoverColor: json["button_hover_color"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "title": title,
    "sub_title": subTitle,
    "description": description,
    "button_text": buttonText,
    "button_url": buttonUrl,
    "redirect_url": redirectUrl,
    "image": image,
    "image_url": imageUrl,
    "order": order,
    "title_color": titleColor,
    "sub_title_color": subTitleColor,
    "description_color": descriptionColor,
    "bg_color": bgColor,
    "bg_image_url": bgImageUrl,
    "button_text_color": buttonTextColor,
    "button_bg_color": buttonBgColor,
    "button_hover_color": buttonHoverColor,
  };
}
