// To parse this JSON data, do
//
//     final imageListModel = imageListModelFromJson(jsonString);

import 'dart:convert';

ImageListModel imageListModelFromJson(String str) =>
    ImageListModel.fromJson(json.decode(str));

String imageListModelToJson(ImageListModel data) => json.encode(data.toJson());

class ImageListModel {
  final List<Image>? images;

  ImageListModel({
    required this.images,
  });

  factory ImageListModel.fromJson(Map<String, dynamic> json) => ImageListModel(
        images: json["images"] == null
            ? null
            : List<Image>.from(json["images"].map((x) => Image.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "images": List<dynamic>.from(images!.map((x) => x.toJson())),
      };
}

class Image {
  final dynamic imageId;
  final dynamic name;
  final dynamic dimensions;
  final dynamic alt;
  final dynamic size;
  final dynamic path;
  final dynamic imgUrl;
  final dynamic uploadAt;

  Image({
     this.imageId,
     this.name,
     this.dimensions,
     this.alt,
     this.size,
     this.path,
     this.imgUrl,
     this.uploadAt,
  });

  factory Image.fromJson(Map<String, dynamic> json) => Image(
        imageId: json["image_id"],
        name: json["name"],
        dimensions: json["dimensions"],
        alt: json["alt"],
        size: json["size"],
        path: json["path"],
        imgUrl: json["img_url"],
        uploadAt: json["upload_at"],
      );

  Map<String, dynamic> toJson() => {
        "image_id": imageId,
        "name": name,
        "dimensions": dimensions,
        "alt": alt,
        "size": size,
        "path": path,
        "img_url": imgUrl,
        "upload_at": uploadAt,
      };
}
