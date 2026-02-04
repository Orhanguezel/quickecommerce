// To parse this JSON data, do
//
//     final taxModel = taxModelFromJson(jsonString);

import 'dart:convert';

TaxModel taxModelFromJson(String str) => TaxModel.fromJson(json.decode(str));

String taxModelToJson(TaxModel data) => json.encode(data.toJson());

class TaxModel {
  final bool success;
  final List<TaxInfo>? taxInfo;

  TaxModel({
    required this.success,
     this.taxInfo,
  });

  factory TaxModel.fromJson(Map<String, dynamic> json) => TaxModel(
        success: json["success"],
        taxInfo: json["tax_info"] == null
            ? null
            : List<TaxInfo>.from(
                json["tax_info"].map((x) => TaxInfo.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "success": success,
        "tax_info": List<dynamic>.from(taxInfo!.map((x) => x.toJson())),
      };
}

class TaxInfo {
  final dynamic storeId;
  final dynamic tax;

  TaxInfo({
     this.storeId,
     this.tax,
  });

  factory TaxInfo.fromJson(Map<String, dynamic> json) => TaxInfo(
        storeId: json["store_id"],
        tax: json["tax"],
      );

  Map<String, dynamic> toJson() => {
        "store_id": storeId,
        "tax": tax,
      };
}
