// To parse this JSON data, do
//
//     final deliveryChergeModel = deliveryChergeModelFromJson(jsonString);
// To parse this JSON data, do
//
//     final deliveryChargeModel = deliveryChargeModelFromJson(jsonString);

import 'dart:convert';

List<DeliveryChargeModel> deliveryChargeModelFromJson(String str) => List<DeliveryChargeModel>.from(json.decode(str).map((x) => DeliveryChargeModel.fromJson(x)));

String deliveryChargeModelToJson(List<DeliveryChargeModel> data) => json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class DeliveryChargeModel {
  final int? areaId;
  final DeliveryChargeData? deliveryCharge;

  DeliveryChargeModel({
     this.areaId,
     this.deliveryCharge,
  });

  factory DeliveryChargeModel.fromJson(Map<String, dynamic> json) => DeliveryChargeModel(
    areaId:  json["area_id"] == null
        ? null
        : int.tryParse(json["area_id"].toString()),
    deliveryCharge:json["delivery_charge"]==null?null: DeliveryChargeData.fromJson(json["delivery_charge"]),
  );

  Map<String, dynamic> toJson() => {
    "area_id": areaId,
    "delivery_charge": deliveryCharge?.toJson(),
  };
}



class DeliveryChargeData {
  final dynamic status;
  final dynamic message;
  final dynamic deliveryMethod;
  final dynamic deliveryCharge;
  final dynamic distanceKm;
  final dynamic info;

  DeliveryChargeData({
     this.status,
     this.message,
     this.deliveryMethod,
     this.deliveryCharge,
     this.distanceKm,
     this.info,
  });

  factory DeliveryChargeData.fromJson(Map<String, dynamic> json) => DeliveryChargeData(
    status: json["status"],
    message: json["message"],
    deliveryMethod: json["delivery_method"],
    deliveryCharge: json["delivery_charge"],
    distanceKm: json["distance_km"],
    info: json["info"],
  );

  Map<String, dynamic> toJson() => {
    "status": status,
    "message": message,
    "delivery_method": deliveryMethod,
    "delivery_charge": deliveryCharge,
    "distance_km": distanceKm,
    "info": info,
  };
}
