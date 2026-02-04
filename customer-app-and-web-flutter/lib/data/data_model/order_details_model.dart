// To parse this JSON data, do
//
//     final orderDetailsModel = orderDetailsModelFromJson(jsonString);

import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


OrderDetailsModel orderDetailsModelFromJson(String str) =>
    OrderDetailsModel.fromJson(json.decode(str));

String orderDetailsModelToJson(OrderDetailsModel data) =>
    json.encode(data.toJson());

class OrderDetailsModel {
  final OrderData? orderData;
  final OrderSummary? orderSummary;
  final Refund? refund;
  final List<OrderTracking>? orderTracking;
  final List<OrderTracking>? orderPaymentTracking;
  final List<OrderTracking>? orderRefundTracking;

  OrderDetailsModel({
    required this.orderData,
    required this.orderSummary,
    this.refund,
    this.orderTracking,
    this.orderPaymentTracking,
    this.orderRefundTracking,
  });

  factory OrderDetailsModel.fromJson(Map<String, dynamic> json) =>
      OrderDetailsModel(
        orderData: json["order_data"] == null
            ? null
            : OrderData.fromJson(json["order_data"]),
        orderSummary: json["order_summary"] == null
            ? null
            : OrderSummary.fromJson(json["order_summary"]),
        refund:json["refund"] == null
            ? null
            : Refund.fromJson(json["refund"]),
        orderTracking: json["order_tracking"] == null
            ? null
            : List<OrderTracking>.from(
                json["order_tracking"].map((x) => OrderTracking.fromJson(x))),
        orderPaymentTracking: json["order_payment_tracking"] == null
            ? null
            : List<OrderTracking>.from(json["order_payment_tracking"]
                .map((x) => OrderTracking.fromJson(x))),
        orderRefundTracking: json["order_refund_tracking"] == null
            ? null
            : List<OrderTracking>.from(json["order_refund_tracking"]
                .map((x) => OrderTracking.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "order_data": orderData?.toJson(),
        "order_summary": orderSummary?.toJson(),
        "refund": refund?.toJson(),
        "order_tracking":
            List<dynamic>.from(orderTracking!.map((x) => x.toJson())),
        "order_payment_tracking":
            List<dynamic>.from(orderPaymentTracking!.map((x) => x.toJson())),
        "order_refund_tracking":
            List<dynamic>.from(orderRefundTracking!.map((x) => x.toJson())),
      };
}

class OrderData {
  final dynamic orderId;
  final dynamic store;
  final dynamic customerName;
  final dynamic invoiceNumber;
  final dynamic orderDate;
  final dynamic invoiceDate;
  final dynamic orderType;
  final dynamic deliveryOption;
  final dynamic deliveryType;
  final dynamic deliveryTime;
  final dynamic orderAmount;
  final dynamic productDiscountAmount;
  final dynamic shippingCharge;
  final dynamic isReviewed;
  final dynamic confirmedBy;
  final dynamic confirmedAt;
  final dynamic cancelRequestAt;
  final dynamic cancelledAt;
  final dynamic deliveryCompletedAt;
  final dynamic paymentStatus;
  final dynamic status;
  final dynamic refundStatus;
  final dynamic deliverymanReviewStatus;
  final Store? storeDetails;
  final Deliveryman? deliveryman;
  final OrderMaster? orderMaster;
  final List<OrderDetail>? orderDetails;

  OrderData({
    this.orderId,
    this.store,
    this.customerName,
    this.invoiceNumber,
    this.orderDate,
    this.invoiceDate,
    this.orderType,
    this.deliveryOption,
    this.deliveryType,
    this.deliveryTime,
    this.orderAmount,
    this.productDiscountAmount,
    this.shippingCharge,
    this.isReviewed,
    this.confirmedBy,
    this.confirmedAt,
    this.cancelRequestAt,
    this.cancelledAt,
    this.deliveryCompletedAt,
    this.paymentStatus,
    this.status,
    this.refundStatus,
    this.deliverymanReviewStatus,
    this.storeDetails,
    this.deliveryman,
    this.orderMaster,
    this.orderDetails,
  });

  factory OrderData.fromJson(Map<String, dynamic> json) => OrderData(
        orderId: json["order_id"],
        store: json["store"],
        customerName: json["customer_name"],
        invoiceNumber: json["invoice_number"],
        orderDate: json["order_date"],
        invoiceDate: json["invoice_date"],
        orderType: json["order_type"],
        deliveryOption: json["delivery_option"],
        deliveryType: json["delivery_type"],
        deliveryTime: json["delivery_time"],
        orderAmount: json["order_amount"],
        productDiscountAmount: json["product_discount_amount"],
        shippingCharge: json["shipping_charge"],
        isReviewed: json["is_reviewed"],
        confirmedBy: json["confirmed_by"],
        confirmedAt: json["confirmed_at"],
        cancelRequestAt: json["cancel_request_at"],
        cancelledAt: json["cancelled_at"],
        deliveryCompletedAt: json["delivery_completed_at"],
        paymentStatus: json["payment_status"],
        status: json["status"],
        refundStatus: json["refund_status"],
        deliverymanReviewStatus: json["deliveryman_review_status"],
        storeDetails: json["store_details"] == null
            ? null
            : Store.fromJson(json["store_details"]),
        deliveryman: json["deliveryman"] == null
            ? null
            : Deliveryman.fromJson(json["deliveryman"]),
        orderMaster: json["order_master"] == null
            ? null
            : OrderMaster.fromJson(json["order_master"]),
        orderDetails: json["order_details"] == null
            ? null
            : List<OrderDetail>.from(
                json["order_details"].map((x) => OrderDetail.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "order_id": orderId,
        "store": store,
        "customer_name": customerName,
        "invoice_number": invoiceNumber,
        "order_date": orderDate,
        "invoice_date": invoiceDate,
        "order_type": orderType,
        "delivery_option": deliveryOption,
        "delivery_type": deliveryType,
        "delivery_time": deliveryTime,
        "order_amount": orderAmount,
        "product_discount_amount": productDiscountAmount,
        "shipping_charge": shippingCharge,
        "is_reviewed": isReviewed,
        "confirmed_by": confirmedBy,
        "confirmed_at": confirmedAt,
        "cancel_request_at": cancelRequestAt,
        "cancelled_at": cancelledAt,
        "delivery_completed_at": deliveryCompletedAt,
        "payment_status": paymentStatus,
        "status": status,
        "refund_status": refundStatus,
        "deliveryman_review_status": deliverymanReviewStatus,
        "store_details": storeDetails?.toJson(),
        "deliveryman": deliveryman?.toJson(),
        "order_master": orderMaster?.toJson(),
        "order_details":
            List<dynamic>.from(orderDetails!.map((x) => x.toJson())),
      };
}

class Deliveryman {
  final int id;
  final String name;
  final dynamic phone;
  final String email;
  final dynamic totalDelivered;
  final dynamic lastDeliveredLocation;
  final String rating;
  final int reviewCount;

  Deliveryman({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.totalDelivered,
    required this.lastDeliveredLocation,
    required this.rating,
    required this.reviewCount,
  });

  factory Deliveryman.fromJson(Map<String, dynamic> json) => Deliveryman(
        id: json["id"],
        name: json["name"],
        phone: json["phone"],
        email: json["email"],
        totalDelivered: json["total_delivered"],
        lastDeliveredLocation: json["last_delivered_location"],
        rating: json["rating"],
        reviewCount: json["review_count"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
        "phone": phone,
        "email": email,
        "total_delivered": totalDelivered,
        "last_delivered_location": lastDeliveredLocation,
        "rating": rating,
        "review_count": reviewCount,
      };
}

class OrderDetail {
  final dynamic id;
  final dynamic orderId;
  final dynamic storeId;
  final dynamic areaId;
  final dynamic productId;
  final dynamic productName;
  final dynamic productImageUrl;
  final dynamic behaviour;
  final dynamic productSku;
  final Map<String, dynamic>? variantDetails;
  final dynamic productCampaignId;
  final dynamic basePrice;
  final dynamic adminDiscountType;
  final dynamic adminDiscountRate;
  final dynamic adminDiscountAmount;
  final dynamic price;
  final dynamic quantity;
  final dynamic lineTotalPriceWithQty;
  final dynamic couponDiscountAmount;
  final dynamic lineTotalExcludingTax;
  final dynamic taxRate;
  final dynamic taxAmount;
  final dynamic totalTaxAmount;
  final dynamic lineTotalPrice;
  final dynamic adminCommissionType;
  final dynamic adminCommissionRate;
  final dynamic adminCommissionAmount;
  final dynamic createdAt;
  final dynamic updatedAt;
  final dynamic reviewStatus;

  OrderDetail({
    this.id,
    this.orderId,
    this.storeId,
    this.areaId,
    this.productId,
    this.productName,
    this.productImageUrl,
    this.behaviour,
    this.productSku,
    this.variantDetails,
    this.productCampaignId,
    this.basePrice,
    this.adminDiscountType,
    this.adminDiscountRate,
    this.adminDiscountAmount,
    this.price,
    this.quantity,
    this.lineTotalPriceWithQty,
    this.couponDiscountAmount,
    this.lineTotalExcludingTax,
    this.taxRate,
    this.taxAmount,
    this.totalTaxAmount,
    this.lineTotalPrice,
    this.adminCommissionType,
    this.adminCommissionRate,
    this.adminCommissionAmount,
    this.createdAt,
    this.updatedAt,
    this.reviewStatus,
  });

  factory OrderDetail.fromJson(Map<String, dynamic> json) => OrderDetail(
        id: json["id"],
        orderId: json["order_id"],
        storeId: json["store_id"],
        areaId: json["area_id"],
        productId: json["product_id"],
        productName: json["product_name"],
        productImageUrl: json["product_image_url"],
        behaviour: json["behaviour"],
        productSku: json["product_sku"],
        variantDetails: json["variant_details"] as Map<String, dynamic>?,
        productCampaignId: json["product_campaign_id"],
        basePrice: json["base_price"],
        adminDiscountType: json["admin_discount_type"],
        adminDiscountRate: json["admin_discount_rate"],
        adminDiscountAmount: json["admin_discount_amount"],
        price: json["price"],
        quantity: json["quantity"],
        lineTotalPriceWithQty: json["line_total_price_with_qty"],
        couponDiscountAmount: json["coupon_discount_amount"],
        lineTotalExcludingTax: json["line_total_excluding_tax"],
        taxRate: json["tax_rate"],
        taxAmount: json["tax_amount"],
        totalTaxAmount: json["total_tax_amount"],
        lineTotalPrice: json["line_total_price"],
        adminCommissionType: json["admin_commission_type"],
        adminCommissionRate: json["admin_commission_rate"],
        adminCommissionAmount: json["admin_commission_amount"],
        createdAt: json["created_at"],
        updatedAt: json["updated_at"],
        reviewStatus: json["review_status"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "order_id": orderId,
        "store_id": storeId,
        "area_id": areaId,
        "product_id": productId,
        "product_name": productName,
        "product_image_url": productImageUrl,
        "behaviour": behaviour,
        "product_sku": productSku,
        "variant_details": variantDetails,
        "product_campaign_id": productCampaignId,
        "base_price": basePrice,
        "admin_discount_type": adminDiscountType,
        "admin_discount_rate": adminDiscountRate,
        "admin_discount_amount": adminDiscountAmount,
        "price": price,
        "quantity": quantity,
        "line_total_price_with_qty": lineTotalPriceWithQty,
        "coupon_discount_amount": couponDiscountAmount,
        "line_total_excluding_tax": lineTotalExcludingTax,
        "tax_rate": taxRate,
        "tax_amount": taxAmount,
        "total_tax_amount": totalTaxAmount,
        "line_total_price": lineTotalPrice,
        "admin_commission_type": adminCommissionType,
        "admin_commission_rate": adminCommissionRate,
        "admin_commission_amount": adminCommissionAmount,
        "created_at": createdAt,
        "updated_at": updatedAt,
        "review_status": reviewStatus,
      };
}

class OrderMaster {
  final dynamic id;
  final dynamic customerId;
  final dynamic shippingAddressId;
  final Address? shippingAddress;
  final dynamic deliveryCharge;
  final dynamic productDiscountAmount;
  final dynamic orderAmount;
  final dynamic shippingCharge;
  final dynamic paidAmount;
  final dynamic paymentGateway;
  final dynamic paymentStatus;
  final dynamic transactionRef;
  final dynamic transactionDetails;
  final dynamic orderNotes;
  final Customer? customer;

  OrderMaster({
    required this.id,
    required this.customerId,
    required this.shippingAddressId,
    required this.shippingAddress,
    required this.deliveryCharge,
    required this.productDiscountAmount,
    required this.orderAmount,
    required this.shippingCharge,
    required this.paidAmount,
    required this.paymentGateway,
    required this.paymentStatus,
    required this.transactionRef,
    required this.transactionDetails,
    required this.orderNotes,
    required this.customer,
  });

  factory OrderMaster.fromJson(Map<String, dynamic> json) => OrderMaster(
        id: json["id"],
        customerId: json["customer_id"],
        shippingAddressId: json["shipping_address_id"],
        shippingAddress: json["shipping_address"] == null
            ? null
            : Address.fromJson(json["shipping_address"]),
        deliveryCharge: json["delivery_charge"],
        productDiscountAmount: json["product_discount_amount"],
        orderAmount: json["order_amount"],
        shippingCharge: json["shipping_charge"],
        paidAmount: json["paid_amount"],
        paymentGateway: json["payment_gateway"],
        paymentStatus: json["payment_status"],
        transactionRef: json["transaction_ref"],
        transactionDetails: json["transaction_details"],
        orderNotes: json["order_notes"],
        customer: json["customer"] == null
            ? null
            : Customer.fromJson(json["customer"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "customer_id": customerId,
        "shipping_address_id": shippingAddressId,
        "shipping_address": shippingAddress?.toJson(),
        "delivery_charge": deliveryCharge,
        "product_discount_amount": productDiscountAmount,
        "order_amount": orderAmount,
        "shipping_charge": shippingCharge,
        "paid_amount": paidAmount,
        "payment_gateway": paymentGateway,
        "payment_status": paymentStatus,
        "transaction_ref": transactionRef,
        "transaction_details": transactionDetails,
        "order_notes": orderNotes,
        "customer": customer?.toJson(),
      };
}

class Customer {
  final dynamic id;
  final dynamic firstName;
  final dynamic lastName;
  final dynamic email;
  final dynamic phone;
  final dynamic image;
  final dynamic defLang;
  final dynamic emailVerified;
  final dynamic verified;
  final dynamic status;
  final Address? address;

  Customer({
    this.id,
    this.firstName,
    this.lastName,
    this.email,
    this.phone,
    this.image,
    this.defLang,
    this.emailVerified,
    this.verified,
    this.status,
    this.address,
  });

  factory Customer.fromJson(Map<String, dynamic> json) => Customer(
        id: json["id"],
        firstName: json["first_name"],
        lastName: json["last_name"],
        email: json["email"],
        phone: json["phone"],
        image: json["image"],
        defLang: json["def_lang"],
        emailVerified: json["email_verified"],
        verified: json["verified"],
        status: json["status"],
        address:
            json["address"] == null ? null : Address.fromJson(json["address"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "first_name": firstName,
        "last_name": lastName,
        "email": email,
        "phone": phone,
        "image": image,
        "def_lang": defLang,
        "email_verified": emailVerified,
        "verified": verified,
        "status": status,
        "address": address?.toJson(),
      };
}

class Address {
  final dynamic id;
  final dynamic customerId;
  final dynamic title;
  final dynamic type;
  final dynamic email;
  final dynamic contactNumber;
  final dynamic address;
  final dynamic latitude;
  final dynamic longitude;
  final dynamic areaId;
  final dynamic road;
  final dynamic house;
  final dynamic floor;
  final dynamic postalCode;
  final dynamic isDefault;
  final dynamic status;
  final dynamic createdAt;
  final dynamic updatedAt;

  Address({
    this.id,
    this.customerId,
    this.title,
    this.type,
    this.email,
    this.contactNumber,
    this.address,
    this.latitude,
    this.longitude,
    this.areaId,
    this.road,
    this.house,
    this.floor,
    this.postalCode,
    this.isDefault,
    this.status,
    this.createdAt,
    this.updatedAt,
  });

  factory Address.fromJson(Map<String, dynamic> json) => Address(
        id: json["id"],
        customerId: json["customer_id"],
        title: json["title"],
        type: json["type"],
        email: json["email"],
        contactNumber: json["contact_number"],
        address: json["address"],
        latitude: json["latitude"],
        longitude: json["longitude"],
        areaId: json["area_id"],
        road: json["road"],
        house: json["house"],
        floor: json["floor"],
        postalCode: json["postal_code"],
        isDefault: json["is_default"],
        status: json["status"],
        createdAt: json["created_at"],
        updatedAt: json["updated_at"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "customer_id": customerId,
        "title": title,
        "type": type,
        "email": email,
        "contact_number": contactNumber,
        "address": address,
        "latitude": latitude,
        "longitude": longitude,
        "area_id": areaId,
        "road": road,
        "house": house,
        "floor": floor,
        "postal_code": postalCode,
        "is_default": isDefault,
        "status": status,
        "created_at": createdAt.toIso8601String(),
        "updated_at": updatedAt.toIso8601String(),
      };
}

class OrderSummary {
  final dynamic subtotal;
  final dynamic couponDiscount;
  final dynamic taxRate;
  final dynamic totalTaxAmount;
  final dynamic productDiscountAmount;
  final dynamic shippingCharge;
  final dynamic additionalCharge;
  final dynamic totalAmount;

  OrderSummary({
    this.subtotal,
    this.couponDiscount,
    this.taxRate,
    this.totalTaxAmount,
    this.productDiscountAmount,
    this.shippingCharge,
    this.additionalCharge,
    this.totalAmount,
  });

  factory OrderSummary.fromJson(Map<String, dynamic> json) => OrderSummary(
        subtotal: json["subtotal"],
        couponDiscount: json["coupon_discount"],
        taxRate: json["tax_rate"],
        totalTaxAmount: json["total_tax_amount"],
        productDiscountAmount: json["product_discount_amount"],
        shippingCharge: json["shipping_charge"],
        additionalCharge: json["additional_charge"],
        totalAmount: json["total_amount"],
      );

  Map<String, dynamic> toJson() => {
        "subtotal": subtotal,
        "coupon_discount": couponDiscount,
        "tax_rate": taxRate,
        "total_tax_amount": totalTaxAmount,
        "product_discount_amount": productDiscountAmount,
        "shipping_charge": shippingCharge,
        "additional_charge": additionalCharge,
        "total_amount": totalAmount,
      };
}

class OrderTracking {
  final dynamic label;
  final dynamic status;
  final dynamic createdAt;

  OrderTracking({
    this.label,
    this.status,
    this.createdAt,
  });

  factory OrderTracking.fromJson(Map<String, dynamic> json) => OrderTracking(
        label: json["label"],
        status: json["status"],
        createdAt: json["created_at"],
      );

  Map<String, dynamic> toJson() => {
        "label": label,
        "status": status,
        "created_at": createdAt,
      };
}

class Refund {
  final dynamic id;
  final dynamic orderId;
  final dynamic invoice;
  final dynamic customerNote;
  final dynamic status;
  final dynamic amount;
  final dynamic store;
  final dynamic customer;
  final dynamic orderRefundReason;
  final List<dynamic>? files;
  final dynamic rejectReason;

  Refund({
    this.id,
    this.orderId,
    this.invoice,
    this.customerNote,
    this.status,
    this.amount,
    this.store,
    this.customer,
    this.orderRefundReason,
    this.files,
    this.rejectReason,
  });

  factory Refund.fromJson(Map<String, dynamic> json) => Refund(
        id: json["id"],
        orderId: json["order_id"],
        invoice: json["invoice"],
        customerNote: json["customer_note"],
        status: json["status"],
        amount: json["amount"],
        store: json["store"],
        customer: json["customer"],
        orderRefundReason: json["order_refund_reason"],
        files: List<dynamic>.from(json["files"].map((x) => x)),
        rejectReason: json["reject_reason"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "order_id": orderId,
        "invoice": invoice,
        "customer_note": customerNote,
        "status": status,
        "amount": amount,
        "store": store,
        "customer": customer,
        "order_refund_reason": orderRefundReason,
        "files": List<dynamic>.from(files!.map((x) => x)),
        "reject_reason": rejectReason,
      };
}
