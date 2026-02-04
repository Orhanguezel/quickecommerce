import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';

// Functions to convert JSON to/from the model
CategoryModel categoryResponseFromJson(String str) =>
    CategoryModel.fromJson(json.decode(str));

String categoryResponseToJson(CategoryModel data) => json.encode(data.toJson());

// Main CategoryResponse Class
class CategoryModel {
  final String message;
  final List<CategoryData>? data;
  final Meta? meta;

  CategoryModel({
    required this.message,
    this.data,
    this.meta,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) => CategoryModel(
        message: json['message'] ?? '',
        data: (json['data'] as List<dynamic>)
            .map((e) => CategoryData.fromJson(e as Map<String, dynamic>))
            .toList(),
        meta: Meta.fromJson(json['meta']),
      );

  Map<String, dynamic> toJson() => {
        'message': message,
        'data': data!.map((e) => e.toJson()).toList(),
        'meta': meta!.toJson(),
      };
}



class CategoryData {
  final dynamic id;
  final dynamic value;
  final dynamic label;
  final dynamic categoryName;
  final dynamic parentId;
  final List<Child>? childrenRecursive;
  final dynamic categorySlug;
  final dynamic categoryBanner;
  final dynamic categoryBannerUrl;
  final dynamic categoryThumb;
  final dynamic categoryThumbUrl;
  final dynamic categoryNamePaths;
  final dynamic parentPath;
  final dynamic displayOrder;


  CategoryData({
    this.id,
    this.value,
    this.label,
    this.categoryName,
    this.parentId,
    this.childrenRecursive,
    this.categorySlug,
    this.categoryBanner,
    this.categoryBannerUrl,
    this.categoryThumb,
    this.categoryThumbUrl,
    this.categoryNamePaths,
    this.parentPath,
    this.displayOrder,
  });

  factory CategoryData.fromJson(Map<String, dynamic> json) => CategoryData(
        id: json["id"],
        value: json["value"],
        label: json["label"],
        categoryName: json["category_name"],
        parentId: json["parent_id"],
        childrenRecursive: json["children"] == null
            ? null
            : List<Child>.from(json["children"]
                .map((x) => Child.fromJson(x))),
        categorySlug: json["category_slug"],
        categoryBanner: json["category_banner"],
        categoryBannerUrl: json["category_banner_url"],
        categoryThumb: json["category_thumb"],
        categoryThumbUrl: json["category_thumb_url"],
        categoryNamePaths: json["category_name_paths"],
        parentPath: json["parent_path"],
        displayOrder: json["display_order"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "value": value,
        "label": label,
        "category_name": categoryName,
        "parent_id": parentId,
        "children":
            List<dynamic>.from(childrenRecursive!.map((x) => x.toJson())),
        "category_slug": categorySlug,
        "category_banner": categoryBanner,
        "category_banner_url": categoryBannerUrl,
        "category_thumb": categoryThumb,
        "category_thumb_url": categoryThumbUrl,
        "category_name_paths": categoryNamePaths,
        "parent_path": parentPath,
        "display_order": displayOrder,
      };
}



class Child {
  final dynamic id;
  final dynamic value;
  final dynamic label;
  final dynamic categoryName;
  final dynamic parentId;
  final List<dynamic>? childrenRecursive;
  final dynamic categorySlug;
  final dynamic categoryBanner;
  final dynamic categoryBannerUrl;
  final dynamic categoryThumb;
  final dynamic categoryThumbUrl;
  final dynamic metaTitle;
  final dynamic metaDescription;
  final dynamic categoryNamePaths;
  final dynamic parentPath;
  final dynamic displayOrder;
  final dynamic createdBy;
  final dynamic updatedBy;
  final dynamic status;
  final dynamic createdAt;
  final dynamic updatedAt;

  Child({
     this.id,
     this.value,
     this.label,
     this.categoryName,
     this.parentId,
     this.childrenRecursive,
     this.categorySlug,
     this.categoryBanner,
     this.categoryBannerUrl,
     this.categoryThumb,
     this.categoryThumbUrl,
     this.metaTitle,
     this.metaDescription,
     this.categoryNamePaths,
     this.parentPath,
     this.displayOrder,
     this.createdBy,
     this.updatedBy,
     this.status,
     this.createdAt,
     this.updatedAt,
  });

  factory Child.fromJson(Map<String, dynamic> json) =>
      Child(
        id: json["id"],
        value: json["value"],
        label: json["label"],
        categoryName: json["category_name"],
        parentId: json["parent_id"],
        childrenRecursive:json["childrenRecursive"]==null?null:
            List<dynamic>.from(json["childrenRecursive"].map((x) => x)),
        categorySlug: json["category_slug"],
        categoryBanner: json["category_banner"],
        categoryBannerUrl: json["category_banner_url"],
        categoryThumb: json["category_thumb"],
        categoryThumbUrl: json["category_thumb_url"],
        metaTitle: json["meta_title"],
        metaDescription: json["meta_description"],
        categoryNamePaths: json["category_name_paths"],
        parentPath: json["parent_path"],
        displayOrder: json["display_order"],
        createdBy: json["created_by"],
        updatedBy: json["updated_by"],
        status: json["status"],
        createdAt: json["created_at"],
        updatedAt: json["updated_at"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "value": value,
        "label": label,
        "category_name": categoryName,
        "parent_id": parentId,
        "childrenRecursive":
            List<dynamic>.from(childrenRecursive!.map((x) => x)),
        "category_slug": categorySlug,
        "category_banner": categoryBanner,
        "category_banner_url": categoryBannerUrl,
        "category_thumb": categoryThumb,
        "category_thumb_url": categoryThumbUrl,
        "meta_title": metaTitle,
        "meta_description": metaDescription,
        "category_name_paths":categoryNamePaths,
        "parent_path": parentPath,
        "display_order": displayOrder,
        "created_by": createdBy,
        "updated_by": updatedBy,
        "status": status,
        "created_at": createdAt,
        "updated_at": updatedAt,
      };
}


