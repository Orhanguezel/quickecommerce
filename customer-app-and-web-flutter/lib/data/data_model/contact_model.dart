// To parse this JSON data, do
//
//     final contactModel = contactModelFromJson(jsonString);

import 'dart:convert';

ContactModel contactModelFromJson(String str) => ContactModel.fromJson(json.decode(str));

String contactModelToJson(ContactModel data) => json.encode(data.toJson());

class ContactModel {
  final Content? content;

  ContactModel({
     this.content,
  });

  factory ContactModel.fromJson(Map<String, dynamic> json) => ContactModel(
    content:json["content"]==null?null: Content.fromJson(json["content"]),
  );

  Map<String, dynamic> toJson() => {
    "content": content?.toJson(),
  };
}

class Content {
  final ContactFormSection? contactFormSection;
  final ContactDetailsSection? contactDetailsSection;
  final MapSection? mapSection;

  Content({
     this.contactFormSection,
     this.contactDetailsSection,
     this.mapSection,
  });

  factory Content.fromJson(Map<String, dynamic> json) => Content(
    contactFormSection: ContactFormSection.fromJson(json["contact_form_section"]),
    contactDetailsSection: ContactDetailsSection.fromJson(json["contact_details_section"]),
    mapSection:json["map_section"]==null?null: MapSection.fromJson(json["map_section"]),
  );

  Map<String, dynamic> toJson() => {
    "contact_form_section": contactFormSection?.toJson(),
    "contact_details_section": contactDetailsSection?.toJson(),
    "map_section": mapSection?.toJson(),
  };
}

class ContactDetailsSection {
  final dynamic address;
  final dynamic phone;
  final dynamic email;
  final dynamic website;
  final dynamic image;
  final dynamic imageUrl;
  final List<Social>? social;

  ContactDetailsSection({
     this.address,
     this.phone,
     this.email,
     this.website,
     this.image,
     this.imageUrl,
     this.social,
  });

  factory ContactDetailsSection.fromJson(Map<String, dynamic> json) => ContactDetailsSection(
    address: json["address"],
    phone: json["phone"],
    email: json["email"],
    website: json["website"],
    image: json["image"],
    imageUrl: json["image_url"],
    social:json["social"]==null?null: List<Social>.from(json["social"].map((x) => Social.fromJson(x))),
  );

  Map<String, dynamic> toJson() => {
    "address": address,
    "phone": phone,
    "email": email,
    "website": website,
    "image": image,
    "image_url": imageUrl,
    "social": List<dynamic>.from(social!.map((x) => x.toJson())),
  };
}

class Social {
  final dynamic url;
  final dynamic icon;

  Social({
     this.url,
     this.icon,
  });

  factory Social.fromJson(Map<String, dynamic> json) => Social(
    url: json["url"],
    icon: json["icon"],
  );

  Map<String, dynamic> toJson() => {
    "url": url,
    "icon": icon,
  };
}

class ContactFormSection {
  final dynamic title;
  final dynamic subtitle;

  ContactFormSection({
     this.title,
     this.subtitle,
  });

  factory ContactFormSection.fromJson(Map<String, dynamic> json) => ContactFormSection(
    title: json["title"],
    subtitle: json["subtitle"],
  );

  Map<String, dynamic> toJson() => {
    "title": title,
    "subtitle": subtitle,
  };
}

class MapSection {
  final Coordinates? coordinates;

  MapSection({this.coordinates});

  factory MapSection.fromJson(Map<String, dynamic> json) => MapSection(
    coordinates: json["coordinates"] == null ? null : Coordinates.fromJson(json["coordinates"]),
  );

  Map<String, dynamic> toJson() => {
    "coordinates": coordinates?.toJson(),
  };
}

class Coordinates {
  final double? lat;
  final double? lng;

  Coordinates({
    this.lat,
    this.lng,
  });

  factory Coordinates.fromJson(Map<String, dynamic> json) => Coordinates(
    lat: json["lat"],
    lng: json["long"],
  );

  Map<String, dynamic> toJson() => {
    "lat": lat,
    "lng": lng,
  };
}

