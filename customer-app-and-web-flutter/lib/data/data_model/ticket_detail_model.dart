// To parse this JSON data, do
//
//     final ticketDetailsModel = ticketDetailsModelFromJson(jsonString);

import 'dart:convert';

TicketDetailsModel ticketDetailsModelFromJson(String str) => TicketDetailsModel.fromJson(json.decode(str));

String ticketDetailsModelToJson(TicketDetailsModel data) => json.encode(data.toJson());

class TicketDetailsModel {
  final TicketData? data;

  TicketDetailsModel({
    required this.data,
  });

  factory TicketDetailsModel.fromJson(Map<String, dynamic> json) => TicketDetailsModel(
    data:json["data"]==null?null: TicketData.fromJson(json["data"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data?.toJson(),
  };
}

class TicketData {
  final dynamic ticketId;
  final dynamic departmentId;
  final dynamic departmentName;
  final dynamic createdBy;
  final dynamic status;
  final dynamic priority;
  final dynamic title;
  final dynamic subject;
  final dynamic lastUpdated;

  TicketData({
     this.ticketId,
     this.departmentId,
     this.departmentName,
     this.createdBy,
     this.status,
     this.priority,
     this.title,
     this.subject,
     this.lastUpdated,
  });

  factory TicketData.fromJson(Map<String, dynamic> json) => TicketData(
    ticketId: json["ticket_id"],
    departmentId: json["department_id"],
    departmentName: json["department_name"],
    createdBy: json["created_by"],
    status: json["status"],
    priority: json["priority"],
    title: json["title"],
    subject: json["subject"],
    lastUpdated: json["last_updated"],
  );

  Map<String, dynamic> toJson() => {
    "ticket_id": ticketId,
    "department_id": departmentId,
    "department_name": departmentName,
    "created_by": createdBy,
    "status": status,
    "priority": priority,
    "title": title,
    "subject": subject,
    "last_updated": lastUpdated,
  };
}
