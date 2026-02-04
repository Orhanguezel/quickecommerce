// To parse this JSON data, do
//
//     final addressListModel = addressListModelFromJson(jsonString);

import 'dart:convert';

List<AddressListModel> addressListModelFromJson(String str) => List<AddressListModel>.from(json.decode(str).map((x) => AddressListModel.fromJson(x)));

String addressListModelToJson(List<AddressListModel> data) => json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class AddressListModel {
  final dynamic id;
  final dynamic title;
  final dynamic type;
  final dynamic email;
  final dynamic contactNumber;
  final dynamic address;
  final dynamic lat;
  final dynamic long;
  final dynamic area;
  final dynamic road;
  final dynamic house;
  final dynamic floor;
  final dynamic postalCode;
  final dynamic isDefault;
  final dynamic status;
  final dynamic countryCode;
  final dynamic e164Phone;
  final dynamic isoCountryCode;


  AddressListModel({
     this.id,
     this.title,
     this.type,
    this.email,
     this.contactNumber,
    this.countryCode,
    this.e164Phone,
    this.isoCountryCode,
     this.address,
     this.lat,
     this.long,
     this.area,
     this.road,
     this.house,
     this.floor,
     this.postalCode,
     this.isDefault,
     this.status,
  });


  factory AddressListModel.fromJson(Map<String, dynamic> json) => AddressListModel(
    id: json["id"],
    title: json["title"],
    type: json["type"],
    email: json["email"],
    contactNumber: json["contact_number"],
    countryCode: json["country_code"],
    e164Phone: json["e164_phone"],
    isoCountryCode: json["iso_country_code"],
    address: json["address"],
    lat: json["lat"],
    long: json["long"],
    area: json["area"],
    road: json["road"],
    house: json["house"],
    floor: json["floor"],
    postalCode: json["postal_code"],
    isDefault: json["is_default"],
    status: json["status"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "title": title,
    "type": type,
    "email": email,
    "contact_number": contactNumber,
    "country_code": countryCode,
    "e164_phone": e164Phone,
    "iso_country_code": isoCountryCode,
    "address": address,
    "lat": lat,
    "long": long,
    "area": area,
    "road": road,
    "house": house,
    "floor": floor,
    "postal_code": postalCode,
    "is_default": isDefault,
    "status": status,
  };
}
