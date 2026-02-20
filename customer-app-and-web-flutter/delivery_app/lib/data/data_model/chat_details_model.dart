// To parse this JSON data, do
//
//     final messagesDetailsModel = messagesDetailsModelFromJson(jsonString);

import 'dart:convert';

MessagesDetailsModel messagesDetailsModelFromJson(String str) => MessagesDetailsModel.fromJson(json.decode(str));

String messagesDetailsModelToJson(MessagesDetailsModel data) => json.encode(data.toJson());

class MessagesDetailsModel {
  final bool? success;
  final int? unreadMessage;
  final List<MessagesData>? data;
  final Meta? meta;

  MessagesDetailsModel({
    this.success,
    this.unreadMessage,
    this.data,
    this.meta,
  });

  factory MessagesDetailsModel.fromJson(Map<String, dynamic> json) => MessagesDetailsModel(
    success: json["success"],
    unreadMessage: json["unread_message"],
    data:json["data"]==null?null: List<MessagesData>.from(json["data"].map((x) => MessagesData.fromJson(x))),
    meta: Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "success": success,
    "unread_message": unreadMessage,
    "data": List<dynamic>.from(data!.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}

class MessagesData {
  final dynamic id;
  final dynamic chatId;
  final dynamic senderId;
  final dynamic senderType;
  final dynamic receiverId;
  final dynamic receiverType;
  final dynamic message;
  final dynamic file;
  final dynamic isSeen;
  final dynamic createdAt;

  MessagesData({
    this.id,
    this.chatId,
    this.senderId,
    this.senderType,
    this.receiverId,
    this.receiverType,
    this.message,
    this.file,
    this.isSeen,
    this.createdAt,
  });

  factory MessagesData.fromJson(Map<String, dynamic> json) => MessagesData(
    id: json["id"],
    chatId: json["chat_id"],
    senderId: json["sender_id"],
    senderType: json["sender_type"],
    receiverId: json["receiver_id"],
    receiverType: json["receiver_type"],
    message: json["message"],
    file: json["file"],
    isSeen: json["is_seen"],
    createdAt: DateTime.parse(json["created_at"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "chat_id": chatId,
    "sender_id": senderId,
    "sender_type": senderType,
    "receiver_id": receiverId,
    "receiver_type": receiverType,
    "message": message,
    "file": file,
    "is_seen": isSeen,
    "created_at": createdAt,
  };
}



class Meta {
  final dynamic currentPage;
  final dynamic lastPage;
  final dynamic perPage;
  final dynamic total;
  final dynamic from;
  final dynamic to;

  Meta({
    this.currentPage,
    this.lastPage,
    this.perPage,
    this.total,
    this.from,
    this.to,
  });

  factory Meta.fromJson(Map<String, dynamic> json) => Meta(
    currentPage: json["current_page"],
    lastPage: json["last_page"],
    perPage: json["per_page"],
    total: json["total"],
    from: json["from"],
    to: json["to"],
  );

  Map<String, dynamic> toJson() => {
    "current_page": currentPage,
    "last_page": lastPage,
    "per_page": perPage,
    "total": total,
    "from": from,
    "to": to,
  };
}

