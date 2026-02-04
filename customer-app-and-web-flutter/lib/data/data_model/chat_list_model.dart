// To parse this JSON data, do
//
//     final chatListModel = chatListModelFromJson(jsonString);

import 'dart:convert';

ChatListModel chatListModelFromJson(String str) => ChatListModel.fromJson(json.decode(str));

String chatListModelToJson(ChatListModel data) => json.encode(data.toJson());

class ChatListModel {
  final bool? success;
  final String? message;
  final List<ChatListData>? data;

  ChatListModel({
    this.success,
    this.message,
    this.data,
  });

  factory ChatListModel.fromJson(Map<String, dynamic> json) => ChatListModel(
    success: json["success"],
    message: json["message"],
    data:json["data"]==null?null: List<ChatListData>.from(json["data"].map((x) => ChatListData.fromJson(x))),
  );

  Map<String, dynamic> toJson() => {
    "success": success,
    "message": message,
    "data": List<dynamic>.from(data!.map((x) => x.toJson())),
  };
}

class ChatListData {
  final dynamic id;
  final dynamic chatId;
  final dynamic userType;
  final dynamic senderId;
  final User? user;

  ChatListData({
    this.id,
    this.chatId,
    this.userType,
    this.senderId,
    this.user,
  });

  factory ChatListData.fromJson(Map<String, dynamic> json) => ChatListData(
    id: json["id"],
    chatId: json["chat_id"],
    userType: json["user_type"],
    senderId: json["sender_id"],
    user:json["user"]==null?null: User.fromJson(json["user"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "chat_id": chatId,
    "user_type": userType,
    "sender_id": senderId,
    "user": user?.toJson(),
  };
}

class User {
  final dynamic id;
  final dynamic name;
  final dynamic phone;
  final dynamic email;
  final dynamic activityScope;
  final dynamic image;
  final dynamic isOnline;

  User({
    this.id,
    this.name,
    this.phone,
    this.email,
    this.activityScope,
    this.image,
    this.isOnline,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json["id"],
    name: json["name"],
    phone: json["phone"],
    email: json["email"],
    activityScope: json["activity_scope"],
    image: json["image"],
    isOnline: json["is_online"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "phone": phone,
    "email": email,
    "activity_scope": activityScope,
    "image": image,
    "is_online": isOnline,
  };
}
