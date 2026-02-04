// To parse this JSON data, do
//
//     final hMacModel = hMacModelFromJson(jsonString);

import 'dart:convert';

HMacModel hMacModelFromJson(String str) => HMacModel.fromJson(json.decode(str));

String hMacModelToJson(HMacModel data) => json.encode(data.toJson());

class HMacModel {
  final dynamic hMac;
  final dynamic timestamp;
  final Data? data;
  HMacModel({
    this.hMac,
    this.timestamp,
    this.data,
  });

  factory HMacModel.fromJson(Map<String, dynamic> json) => HMacModel(
    hMac: json["hmac"],
    timestamp: json["timestamp"],
    data:json["data"]==null?null: Data.fromJson(json["data"]),
  );

  Map<String, dynamic> toJson() => {
    "hmac": hMac,
    "timestamp": timestamp,
    "data": data!.toJson(),
  };
}


class Data {
  final dynamic checkoutUrl;
  final dynamic sessionId;
  final dynamic orderMasterId;
  final StripeDebug? stripeDebug;

  Data({
    this.checkoutUrl,
    this.sessionId,
    this.orderMasterId,
    this.stripeDebug,
  });

  factory Data.fromJson(Map<String, dynamic> json) => Data(
    checkoutUrl: json["checkout_url"],
    sessionId: json["session_id"],
    orderMasterId: json["order_master_id"],
    stripeDebug: StripeDebug.fromJson(json["stripe_debug"]),
  );

  Map<String, dynamic> toJson() => {
    "checkout_url": checkoutUrl,
    "session_id": sessionId,
    "order_master_id": orderMasterId,
    "stripe_debug": stripeDebug!.toJson(),
  };
}

class StripeDebug {
  final dynamic currency;
  final dynamic amountTotal;
  final dynamic paymentStatus;
  final dynamic created;

  StripeDebug({
    this.currency,
    this.amountTotal,
    this.paymentStatus,
    this.created,
  });

  factory StripeDebug.fromJson(Map<String, dynamic> json) => StripeDebug(
    currency: json["currency"],
    amountTotal: json["amount_total"],
    paymentStatus: json["payment_status"],
    created: json["created"],
  );

  Map<String, dynamic> toJson() => {
    "currency": currency,
    "amount_total": amountTotal,
    "payment_status": paymentStatus,
    "created": created,
  };
}
