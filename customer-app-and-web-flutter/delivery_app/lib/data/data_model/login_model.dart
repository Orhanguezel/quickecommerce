// To parse this JSON data, do
//
//     final empLoginModel = empLoginModelFromJson(jsonString);

import 'dart:convert';

// Functions to convert JSON to/from the model
AuthModel userResponseFromJson(String str) =>
    AuthModel.fromJson(json.decode(str));

String userResponseToJson(AuthModel data) => json.encode(data.toJson());

// Main UserResponse class
class AuthModel {
  dynamic status;
  dynamic message;
  dynamic walletHistoryId;
  dynamic  statusCode;
  dynamic token;
  final dynamic expiresAt;
  final dynamic email;
  final List<Permission>? permissions;
  dynamic emailVerified;
  dynamic role;
   final  OrderData? order;
  final OrderMaster? orderMaster;
  final dynamic emailVerificationSettings;
  final dynamic accountStatus;
  final dynamic marketingEmail;
  final dynamic activityNotification;

  AuthModel({
     this.status,
     this.message,
     this.walletHistoryId,
      this.statusCode,
     this.token,
    this.expiresAt,
    this.email,
     this.permissions,
     this.emailVerified,
     this.role,
    this.order,
    this.orderMaster,
    this.emailVerificationSettings,
    this.accountStatus,
    this.marketingEmail,
    this.activityNotification,
  });

  factory AuthModel.fromJson(Map<String, dynamic> json) => AuthModel(
    status: json['status'] ?? false,
    message: json['message'] ?? "",
    walletHistoryId: json['wallet_history_id'] ?? "",
    statusCode: json['status_code'] ??000,
    token: json['token'] ?? '',
    expiresAt: json["expires_at"],
    email: json["email"],
    permissions: (json['permissions'] as List<dynamic>?)
        ?.map((e) => Permission.fromJson(e as Map<String, dynamic>))
        .toList() ??
        [],
    emailVerified: json['email_verified'] ?? false,
    role: json['role'] ?? '',
    order:json["order"]==null?null: OrderData.fromJson(json["order"]),
    orderMaster:json["order_master"]==null?null: OrderMaster.fromJson(json["order_master"]),
    emailVerificationSettings: json["email_verification_settings"],
    accountStatus: json["account_status"],
    marketingEmail: json["marketing_email"],
    activityNotification: json["activity_notification"],
  );

  Map<String, dynamic> toJson() => {
    'status': status,
    'message': message,
    'wallet_history_id': walletHistoryId,
    'status_code': statusCode,
    'token': token,
    "expires_at": expiresAt,
    "email": email,
    'permissions': permissions!.map((e) => e.toJson()).toList(),
    'email_verified': emailVerified,
    'role': role,
    "order": order?.toJson(),
    "order_master": orderMaster?.toJson(),
    "email_verification_settings": emailVerificationSettings,
    "account_status": accountStatus,
    "marketing_email": marketingEmail,
    "activity_notification": activityNotification,
  };
}

// Permission class
class Permission {
  final int id;
  final String permTitle;
  final String permName;
  final String icon;
  final List<Translation> translations;
  final List<Option> options;
  final List<dynamic> children;

  Permission({
    required this.id,
    required this.permTitle,
    required this.permName,
    required this.icon,
    required this.translations,
    required this.options,
    required this.children,
  });

  factory Permission.fromJson(Map<String, dynamic> json) => Permission(
    id: json['id'] ?? 0,
    permTitle: json['perm_title'] ?? '',
    permName: json['perm_name'] ?? '',
    icon: json['icon'] ?? '',
    translations: (json['translations'] as List<dynamic>?)
        ?.map((e) => Translation.fromJson(e as Map<String, dynamic>))
        .toList() ??
        [],
    options: (json['options'] as List<dynamic>?)
        ?.map((e) => Option.fromJson(e as Map<String, dynamic>))
        .toList() ??
        [],
    children: json['children'] ?? [],
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'perm_title': permTitle,
    'perm_name': permName,
    'icon': icon,
    'translations': translations.map((e) => e.toJson()).toList(),
    'options': options.map((e) => e.toJson()).toList(),
    'children': children,
  };
}

// Translation class
class Translation {
  final String language;
  final String permTitle;

  Translation({
    required this.language,
    required this.permTitle,
  });

  factory Translation.fromJson(Map<String, dynamic> json) => Translation(
    language: json['language'] ?? '',
    permTitle: json['perm_title'] ?? '',
  );

  Map<String, dynamic> toJson() => {
    'language': language,
    'perm_title': permTitle,
  };
}

// Option class
class Option {
  final String label;
  final bool value;

  Option({
    required this.label,
    required this.value,
  });

  factory Option.fromJson(Map<String, dynamic> json) => Option(
    label: json['label'] ?? '',
    value: json['value'] ?? false,
  );

  Map<String, dynamic> toJson() => {
    'label': label,
    'value': value,
  };
}


class OrderMaster {
  final dynamic id;
  final dynamic paymentGateway;
  final dynamic paymentStatus;
  final dynamic orderNotes;

  OrderMaster({
     this.id,
     this.paymentGateway,
     this.paymentStatus,
     this.orderNotes,
  });

  factory OrderMaster.fromJson(Map<String, dynamic> json) => OrderMaster(
    id: json["id"],
    paymentGateway: json["payment_gateway"],
    paymentStatus: json["payment_status"],
    orderNotes: json["order_notes"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "payment_gateway": paymentGateway,
    "payment_status": paymentStatus,
    "order_notes": orderNotes,
  };
}

class OrderData {
  final dynamic orderId;
  final dynamic customerId;
  final dynamic shippingAddressId;
  final dynamic orderAmount;
  final dynamic paymentType;
  final dynamic paymentStatus;
  final dynamic deliveryStatus;
  final dynamic orderNotes;
  final dynamic couponCode;
  final dynamic createdAt;

  OrderData({
     this.orderId,
     this.customerId,
     this.shippingAddressId,
     this.orderAmount,
     this.paymentType,
     this.paymentStatus,
     this.deliveryStatus,
     this.orderNotes,
     this.couponCode,
     this.createdAt,
  });

  factory OrderData.fromJson(Map<String, dynamic> json) => OrderData(
    orderId: json["order_id"],
    customerId: json["customer_id"],
    shippingAddressId: json["shipping_address_id"],
    orderAmount: json["order_amount"],
    paymentType: json["payment_type"],
    paymentStatus: json["payment_status"],
    deliveryStatus: json["delivery_status"],
    orderNotes: json["order_notes"],
    couponCode: json["coupon_code"],
    createdAt: DateTime.parse(json["created_at"]),
  );

  Map<String, dynamic> toJson() => {
    "order_id": orderId,
    "customer_id": customerId,
    "shipping_address_id": shippingAddressId,
    "order_amount": orderAmount,
    "payment_type": paymentType,
    "payment_status": paymentStatus,
    "delivery_status": deliveryStatus,
    "order_notes": orderNotes,
    "coupon_code": couponCode,
    "created_at": createdAt.toIso8601String(),
  };
}