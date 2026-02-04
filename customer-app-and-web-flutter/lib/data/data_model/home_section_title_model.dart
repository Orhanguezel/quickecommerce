// To parse this JSON data, do
//
//     final homeSectionTitleModel = homeSectionTitleModelFromJson(jsonString);

import 'dart:convert';

HomeSectionTitleModel homeSectionTitleModelFromJson(String str) => HomeSectionTitleModel.fromJson(json.decode(str));

String homeSectionTitleModelToJson(HomeSectionTitleModel data) => json.encode(data.toJson());

class HomeSectionTitleModel {
  final Data? data;

  HomeSectionTitleModel({
    this.data,
  });

  factory HomeSectionTitleModel.fromJson(Map<String, dynamic> json) => HomeSectionTitleModel(
    data: Data.fromJson(json["data"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data?.toJson(),
  };
}

class Data {
  final dynamic comHomeOneCategoryButtonTitle;
  final dynamic comHomeOneStoreButtonTitle;
  final dynamic categorySectionTitle;
  final dynamic flashSaleSectionTitle;
  final dynamic featuredSectionTitle;
  final dynamic topSellingSectionTitle;
  final dynamic latestProductSectionTitle;
  final dynamic popularProductSectionTitle;
  final dynamic topStoreSectionTitle;

  Data({
    this.comHomeOneCategoryButtonTitle,
    this.comHomeOneStoreButtonTitle,
    this.categorySectionTitle,
    this.flashSaleSectionTitle,
    this.featuredSectionTitle,
    this.topSellingSectionTitle,
    this.latestProductSectionTitle,
    this.popularProductSectionTitle,
    this.topStoreSectionTitle,
  });

  factory Data.fromJson(Map<String, dynamic> json) => Data(
    comHomeOneCategoryButtonTitle: json["com_home_one_category_button_title"],
    comHomeOneStoreButtonTitle: json["com_home_one_store_button_title"],
    categorySectionTitle: json["com_home_one_category_section_title"],
    flashSaleSectionTitle: json["com_home_one_flash_sale_section_title"],
    featuredSectionTitle: json["com_home_one_featured_section_title"],
    topSellingSectionTitle: json["com_home_one_top_selling_section_title"],
    latestProductSectionTitle: json["com_home_one_latest_product_section_title"],
    popularProductSectionTitle: json["com_home_one_popular_product_section_title"],
    topStoreSectionTitle: json["com_home_one_top_store_section_title"],
  );

  Map<String, dynamic> toJson() => {
    "com_home_one_category_button_title": comHomeOneCategoryButtonTitle,
    "com_home_one_store_button_title": comHomeOneStoreButtonTitle,
    "com_home_one_category_section_title": categorySectionTitle,
    "com_home_one_flash_sale_section_title": flashSaleSectionTitle,
    "com_home_one_featured_section_title": featuredSectionTitle,
    "com_home_one_top_selling_section_title": topSellingSectionTitle,
    "com_home_one_latest_product_section_title": latestProductSectionTitle,
    "com_home_one_popular_product_section_title": popularProductSectionTitle,
    "com_home_one_top_store_section_title": topStoreSectionTitle,
  };
}
