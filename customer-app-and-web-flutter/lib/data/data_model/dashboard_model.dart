// To parse this JSON data, do
//
//     final dashboardModel = dashboardModelFromJson(jsonString);

import 'dart:convert';

DashboardModel dashboardModelFromJson(String str) => DashboardModel.fromJson(json.decode(str));

String dashboardModelToJson(DashboardModel data) => json.encode(data.toJson());

class DashboardModel {
  final bool status;
  final int statusCode;
  final DashboardData data;

  DashboardModel({
    required this.status,
    required this.statusCode,
    required this.data,
  });

  factory DashboardModel.fromJson(Map<String, dynamic> json) => DashboardModel(
    status: json["status"],
    statusCode: json["status_code"],
    data: DashboardData.fromJson(json["data"]),
  );

  Map<String, dynamic> toJson() => {
    "status": status,
    "status_code": statusCode,
    "data": data.toJson(),
  };
}

class DashboardData {
  final dynamic wishlistCount;
  final dynamic totalOrders;
  final dynamic pendingOrders;
  final dynamic canceledOrders;
  final dynamic onHoldProducts;
  final dynamic totalSupportTicket;
  final dynamic wallet;

  DashboardData({
     this.wishlistCount,
     this.totalOrders,
     this.pendingOrders,
     this.canceledOrders,
     this.onHoldProducts,
     this.totalSupportTicket,
     this.wallet,
  });

  factory DashboardData.fromJson(Map<String, dynamic> json) => DashboardData(
    wishlistCount: json["wishlist_count"],
    totalOrders: json["total_orders"],
    pendingOrders: json["pending_orders"],
    canceledOrders: json["canceled_orders"],
    onHoldProducts: json["on_hold_products"],
    totalSupportTicket: json["total_support_ticket"],
    wallet: json["wallet"],
  );

  Map<String, dynamic> toJson() => {
    "wishlist_count": wishlistCount,
    "total_orders": totalOrders,
    "pending_orders": pendingOrders,
    "canceled_orders": canceledOrders,
    "on_hold_products": onHoldProducts,
    "total_support_ticket": totalSupportTicket,
    "wallet": wallet,
  };
}
