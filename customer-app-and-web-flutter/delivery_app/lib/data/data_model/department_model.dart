// To parse this JSON data, do
//
//     final departmentModel = departmentModelFromJson(jsonString);

import 'dart:convert';

DepartmentModel departmentModelFromJson(String str) => DepartmentModel.fromJson(json.decode(str));

String departmentModelToJson(DepartmentModel data) => json.encode(data.toJson());

class DepartmentModel {
  final bool status;
  final int statusCode;
  final List<DepartmentData> data;

  DepartmentModel({
    required this.status,
    required this.statusCode,
    required this.data,
  });

  factory DepartmentModel.fromJson(Map<String, dynamic> json) => DepartmentModel(
    status: json["status"],
    statusCode: json["status_code"],
    data: json["data"] != null && json["data"] is List
        ? List<DepartmentData>.from(
      json["data"].map((x) => DepartmentData.fromJson(x)),
    )
        : [],
  );

  Map<String, dynamic> toJson() => {
    "status": status,
    "status_code": statusCode,
    "data": List<dynamic>.from(data.map((x) => x.toJson())),
  };
}

class DepartmentData {
  final int id;
  final int value;
  final String label;

  DepartmentData({
    required this.id,
    required this.value,
    required this.label,
  });

  factory DepartmentData.fromJson(Map<String, dynamic> json) => DepartmentData(
    id: json["id"],
    value: json["value"],
    label: json["label"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "value": value,
    "label": label,
  };
}
