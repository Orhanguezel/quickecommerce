// To parse this JSON data, do
//
//     final maintenanceSettingsModel = maintenanceSettingsModelFromJson(jsonString);

import 'dart:convert';

MaintenanceSettingsModel maintenanceSettingsModelFromJson(String str) => MaintenanceSettingsModel.fromJson(json.decode(str));

String maintenanceSettingsModelToJson(MaintenanceSettingsModel data) => json.encode(data.toJson());

class MaintenanceSettingsModel {
  final MaintenanceSettingsData maintenanceSettings;

  MaintenanceSettingsModel({
    required this.maintenanceSettings,
  });

  factory MaintenanceSettingsModel.fromJson(Map<String, dynamic> json) => MaintenanceSettingsModel(
    maintenanceSettings: MaintenanceSettingsData.fromJson(json["maintenance_settings"]),
  );

  Map<String, dynamic> toJson() => {
    "maintenance_settings": maintenanceSettings.toJson(),
  };
}

class MaintenanceSettingsData {
  final dynamic comMaintenanceTitle;
  final dynamic comMaintenanceDescription;
  final dynamic comMaintenanceStartDate;
  final dynamic comMaintenanceEndDate;
  final dynamic comMaintenanceImage;

  MaintenanceSettingsData({
     this.comMaintenanceTitle,
     this.comMaintenanceDescription,
     this.comMaintenanceStartDate,
     this.comMaintenanceEndDate,
     this.comMaintenanceImage,
  });

  factory MaintenanceSettingsData.fromJson(Map<String, dynamic> json) => MaintenanceSettingsData(
    comMaintenanceTitle: json["com_maintenance_title"],
    comMaintenanceDescription: json["com_maintenance_description"],
    comMaintenanceStartDate:json["com_maintenance_start_date"],
    comMaintenanceEndDate: json["com_maintenance_end_date"],
    comMaintenanceImage: json["com_maintenance_image"],
  );

  Map<String, dynamic> toJson() => {
    "com_maintenance_title": comMaintenanceTitle,
    "com_maintenance_description": comMaintenanceDescription,
    "com_maintenance_start_date": comMaintenanceStartDate,
    "com_maintenance_end_date": comMaintenanceEndDate,
    "com_maintenance_image": comMaintenanceImage,
  };
}
