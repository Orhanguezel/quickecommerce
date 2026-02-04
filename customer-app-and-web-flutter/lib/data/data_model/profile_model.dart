// To parse this JSON data, do
//
//     final profileModel = profileModelFromJson(jsonString);

import 'dart:convert';

ProfileModel profileModelFromJson(String str) => ProfileModel.fromJson(json.decode(str));

String profileModelToJson(ProfileModel data) => json.encode(data.toJson());

class ProfileModel {
  final ProfileData? data;

  ProfileModel({
    required this.data,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) => ProfileModel(
    data:json["data"]==null?null: ProfileData.fromJson(json["data"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data?.toJson(),
  };
}

class ProfileData {
  final dynamic id;
  final dynamic firstName;
  final dynamic lastName;
  final dynamic fullName;
  final dynamic phone;
  final dynamic email;
  final dynamic birthDay;
  final dynamic gender;
  final dynamic image;
  final dynamic imageUrl;
  final dynamic status;
  final dynamic emailVerified;
  final dynamic unreadNotifications;
  final dynamic wishlistCount;
  final dynamic lat;
  final dynamic lng;
  final dynamic countryCode;
  final dynamic e164Phone;
  final dynamic isoCountryCode;
  ProfileData({
     this.id,
     this.firstName,
     this.lastName,
     this.fullName,
     this.phone,
    this.countryCode,
    this.e164Phone,
    this.isoCountryCode,
     this.email,
     this.birthDay,
     this.gender,
     this.image,
     this.imageUrl,
     this.status,
     this.emailVerified,
     this.unreadNotifications,
     this.wishlistCount,
     this.lat,
     this.lng,
  });

  factory ProfileData.fromJson(Map<String, dynamic> json) => ProfileData(
    id: json["id"],
    firstName: json["first_name"],
    lastName: json["last_name"],
    fullName: json["full_name"],
    phone: json["phone"],
    countryCode: json["country_code"],
    e164Phone: json["e164_phone"],
    isoCountryCode: json["iso_country_code"],
    email: json["email"],
    birthDay: json["birth_day"],
    gender: json["gender"],
    image: json["image"],
    imageUrl: json["image_url"],
    status: json["status"],
    emailVerified: json["email_verified"],
    unreadNotifications: json["unread_notifications"],
    wishlistCount: json["wishlist_count"],
    lat: json["lat"],
    lng: json["lng"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "first_name": firstName,
    "last_name": lastName,
    "full_name": fullName,
    "phone": phone,
    "country_code": countryCode,
    "e164_phone": e164Phone,
    "iso_country_code": isoCountryCode,
    "email": email,
    "birth_day": birthDay,
    "gender": gender,
    "image": image,
    "image_url": imageUrl,
    "status": status,
    "email_verified": emailVerified,
    "unread_notifications": unreadNotifications,
    "wishlist_count": wishlistCount,
    "lat": lat,
    "lng": lng,
  };
}
