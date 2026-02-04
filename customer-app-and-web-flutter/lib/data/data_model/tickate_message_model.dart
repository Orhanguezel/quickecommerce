// To parse this JSON data, do
//
//     final ticketMessageModel = ticketMessageModelFromJson(jsonString);

import 'dart:convert';

TicketMessageModel ticketMessageModelFromJson(String str) => TicketMessageModel.fromJson(json.decode(str));

String ticketMessageModelToJson(TicketMessageModel data) => json.encode(data.toJson());

class TicketMessageModel {
  final bool status;
  final int statusCode;
  final List<MessageData> data;

  TicketMessageModel({
    required this.status,
    required this.statusCode,
    required this.data,
  });

  factory TicketMessageModel.fromJson(Map<String, dynamic> json) => TicketMessageModel(
    status: json["status"],
    statusCode: json["status_code"],
    data: List<MessageData>.from(json["data"].map((x) => MessageData.fromJson(x))),
  );

  Map<String, dynamic> toJson() => {
    "status": status,
    "status_code": statusCode,
    "data": List<dynamic>.from(data.map((x) => x.toJson())),
  };
}

class MessageData {
  final dynamic id;
  final TicketDetail? ticketDetails;
  final SenderDetails? senderDetails;
  final dynamic receiverDetails;
  final dynamic message;

  MessageData({
     this.id,
     this.ticketDetails,
     this.senderDetails,
     this.receiverDetails,
     this.message,
  });

  factory MessageData.fromJson(Map<String, dynamic> json) => MessageData(
    id: json["id"],
    ticketDetails: TicketDetail.fromJson(json["ticket_details"]),
    senderDetails: json["sender_details"] != null
        ? SenderDetails.fromJson(json["sender_details"])
        : null,
    receiverDetails: json["receiver_details"],
    message: Message.fromJson(json["message"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "ticket_details": ticketDetails!.toJson(),
    "sender_details": senderDetails!.toJson(),
    "receiver_details": receiverDetails,
    "message": message.toJson(),
  };
}

class Message {
  final dynamic from;
  final dynamic role;
  final dynamic message;
  final dynamic timestamp;
  final dynamic file;

  Message({
     this.from,
     this.role,
     this.message,
     this.timestamp,
     this.file,
  });

  factory Message.fromJson(Map<String, dynamic> json) => Message(
    from: json["from"],
    role: json["role"],
    message: json["message"],
    timestamp: json["timestamp"],
    file: json["file"],
  );

  Map<String, dynamic> toJson() => {
    "from": from,
    "role": role,
    "message": message,
    "timestamp": timestamp,
    "file": file,
  };
}

class SenderDetails {
  final dynamic id;
  final dynamic name;

  SenderDetails({
     this.id,
     this.name,
  });

  factory SenderDetails.fromJson(Map<String, dynamic> json) => SenderDetails(
    id: json["id"],
    name: json["name"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
  };
}

class TicketDetail {
  final dynamic ticketId;
  final dynamic status;
  final dynamic priority;
  final dynamic title;
  final dynamic subject;
  final dynamic lastUpdated;

  TicketDetail({
     this.ticketId,
     this.status,
     this.priority,
     this.title,
     this.subject,
     this.lastUpdated,
  });

  factory TicketDetail.fromJson(Map<String, dynamic> json) => TicketDetail(
    ticketId: json["ticket_id"],
    status: json["status"],
    priority: json["priority"],
    title: json["title"],
    subject: json["subject"],
    lastUpdated: json["last_updated"],
  );

  Map<String, dynamic> toJson() => {
    "ticket_id": ticketId,
    "status": status,
    "priority": priority,
    "title": title,
    "subject": subject,
    "last_updated": lastUpdated,
  };
}
