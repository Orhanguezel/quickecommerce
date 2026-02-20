// To parse this JSON data, do
//
//     final generalInfoModel = generalInfoModelFromJson(jsonString);

import 'dart:convert';

GeneralInfoModel generalInfoModelFromJson(String str) => GeneralInfoModel.fromJson(json.decode(str));

String generalInfoModelToJson(GeneralInfoModel data) => json.encode(data.toJson());

class GeneralInfoModel {
  final SiteSettings siteSettings;

  GeneralInfoModel({
    required this.siteSettings,
  });

  factory GeneralInfoModel.fromJson(Map<String, dynamic> json) => GeneralInfoModel(
    siteSettings: SiteSettings.fromJson(json["site_settings"]),
  );

  Map<String, dynamic> toJson() => {
    "site_settings": siteSettings.toJson(),
  };
}

class SiteSettings {
  final dynamic comSiteTitle;
  final dynamic comSiteSubtitle;
  final dynamic comSiteFavicon;
  final dynamic comSiteLogo;
  final dynamic comSiteFooterCopyright;
  final dynamic comSiteEmail;
  final dynamic comSiteWebsiteUrl;
  final dynamic comSiteContactNumber;
  final dynamic comSiteFullAddress;
  final dynamic comMaintenanceMode;
  final dynamic comUserLoginOtp;
  final dynamic comUserEmailVerification;

  SiteSettings({
     this.comSiteTitle,
     this.comSiteSubtitle,
     this.comSiteFavicon,
     this.comSiteLogo,
     this.comSiteFooterCopyright,
     this.comSiteEmail,
     this.comSiteWebsiteUrl,
     this.comSiteContactNumber,
     this.comSiteFullAddress,
     this.comMaintenanceMode,
     this.comUserLoginOtp,
     this.comUserEmailVerification,
  });

  factory SiteSettings.fromJson(Map<String, dynamic> json) => SiteSettings(
    comSiteTitle: json["com_site_title"],
    comSiteSubtitle: json["com_site_subtitle"],
    comSiteFavicon: json["com_site_favicon"],
    comSiteLogo: json["com_site_logo"],
    comSiteFooterCopyright: json["com_site_footer_copyright"],
    comSiteEmail: json["com_site_email"],
    comSiteWebsiteUrl: json["com_site_website_url"],
    comSiteContactNumber: json["com_site_contact_number"],
    comSiteFullAddress: json["com_site_full_address"],
    comMaintenanceMode: json["com_maintenance_mode"],
    comUserLoginOtp: json["com_user_login_otp"],
    comUserEmailVerification: json["com_user_email_verification"],
  );

  Map<String, dynamic> toJson() => {
    "com_site_title": comSiteTitle,
    "com_site_subtitle": comSiteSubtitle,
    "com_site_favicon": comSiteFavicon,
    "com_site_logo": comSiteLogo,
    "com_site_footer_copyright": comSiteFooterCopyright,
    "com_site_email": comSiteEmail,
    "com_site_website_url": comSiteWebsiteUrl,
    "com_site_contact_number": comSiteContactNumber,
    "com_site_full_address": comSiteFullAddress,
    "com_maintenance_mode": comMaintenanceMode,
    "com_user_login_otp": comUserLoginOtp,
    "com_user_email_verification": comUserEmailVerification,
  };
}
