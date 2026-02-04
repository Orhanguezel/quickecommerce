// To parse this JSON data, do
//
//     final paymentGatewaysModel = paymentGatewaysModelFromJson(jsonString);

import 'dart:convert';

PaymentGatewaysModel paymentGatewaysModelFromJson(String str) => PaymentGatewaysModel.fromJson(json.decode(str));

String paymentGatewaysModelToJson(PaymentGatewaysModel data) => json.encode(data.toJson());

class PaymentGatewaysModel {
  final List<PaymentGateway> paymentGateways;

  PaymentGatewaysModel({
    required this.paymentGateways,
  });

  factory PaymentGatewaysModel.fromJson(Map<String, dynamic> json) => PaymentGatewaysModel(
    paymentGateways: List<PaymentGateway>.from(json["paymentGateways"].map((x) => PaymentGateway.fromJson(x))),
  );

  Map<String, dynamic> toJson() => {
    "paymentGateways": List<dynamic>.from(paymentGateways.map((x) => x.toJson())),
  };
}

class PaymentGateway {
  final dynamic id;
  final dynamic name;
  final dynamic slug;
  final dynamic image;
  final dynamic imageUrl;
  final dynamic description;
  final AuthCredentials? authCredentials;

  PaymentGateway({
     this.id,
     this.name,
     this.slug,
     this.image,
     this.imageUrl,
     this.description,
     this.authCredentials,
  });

  factory PaymentGateway.fromJson(Map<String, dynamic> json) => PaymentGateway(
    id: json["id"],
    name: json["name"],
    slug: json["slug"],
    image: json["image"],
    imageUrl: json["image_url"],
    description: json["description"],
    authCredentials: json["auth_credentials"] == null ? null : AuthCredentials.fromJson(json["auth_credentials"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "slug": slug,
    "image": image,
    "image_url": imageUrl,
    "description": description,
    "auth_credentials": authCredentials?.toJson(),
  };
}

class AuthCredentials {
  final dynamic paypalSandboxClientId;
  final dynamic paypalSandboxClientSecret;
  final dynamic paypalSandboxClientAppId;
  final dynamic paypalLiveClientId;
  final dynamic paypalLiveClientSecret;
  final dynamic paypalLiveClientAppId;
  final dynamic stripePublicKey;
  final dynamic stripePublicSecret;
  final dynamic razorpayApiKey;
  final dynamic razorpayApiSecret;
  final dynamic paytmMerchantKey;
  final dynamic paytmMerchantMid;
  final dynamic paytmMerchantWebsite;
  final dynamic paytmCancelUrl;
  final dynamic paytmIndustryType;

  AuthCredentials({
    this.paypalSandboxClientId,
    this.paypalSandboxClientSecret,
    this.paypalSandboxClientAppId,
    this.paypalLiveClientId,
    this.paypalLiveClientSecret,
    this.paypalLiveClientAppId,
    this.stripePublicKey,
    this.stripePublicSecret,
    this.razorpayApiKey,
    this.razorpayApiSecret,
    this.paytmMerchantKey,
    this.paytmMerchantMid,
    this.paytmMerchantWebsite,
    this.paytmCancelUrl,
    this.paytmIndustryType,
  });

  factory AuthCredentials.fromJson(Map<String, dynamic> json) => AuthCredentials(
    paypalSandboxClientId: json["paypal_sandbox_client_id"],
    paypalSandboxClientSecret: json["paypal_sandbox_client_secret"],
    paypalSandboxClientAppId: json["paypal_sandbox_client_app_id"],
    paypalLiveClientId: json["paypal_live_client_id"],
    paypalLiveClientSecret: json["paypal_live_client_secret"],
    paypalLiveClientAppId: json["paypal_live_client_app_id"],
    stripePublicKey: json["stripe_public_key"],
    stripePublicSecret: json["stripe_public_secret"],
    razorpayApiKey: json["razorpay_api_key"],
    razorpayApiSecret: json["razorpay_api_secret"],
    paytmMerchantKey: json["paytm_merchant_key"],
    paytmMerchantMid: json["paytm_merchant_mid"],
    paytmMerchantWebsite: json["paytm_merchant_website"],
    paytmCancelUrl: json["paytm_cancel_url"],
    paytmIndustryType: json["paytm_industry_type"],
  );

  Map<String, dynamic> toJson() => {
    "paypal_sandbox_client_id": paypalSandboxClientId,
    "paypal_sandbox_client_secret": paypalSandboxClientSecret,
    "paypal_sandbox_client_app_id": paypalSandboxClientAppId,
    "paypal_live_client_id": paypalLiveClientId,
    "paypal_live_client_secret": paypalLiveClientSecret,
    "paypal_live_client_app_id": paypalLiveClientAppId,
    "stripe_public_key": stripePublicKey,
    "stripe_public_secret": stripePublicSecret,
    "razorpay_api_key": razorpayApiKey,
    "razorpay_api_secret": razorpayApiSecret,
    "paytm_merchant_key": paytmMerchantKey,
    "paytm_merchant_mid": paytmMerchantMid,
    "paytm_merchant_website": paytmMerchantWebsite,
    "paytm_cancel_url": paytmCancelUrl,
    "paytm_industry_type": paytmIndustryType,
  };
}
