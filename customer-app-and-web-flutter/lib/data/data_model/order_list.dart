// To parse this JSON data, do
//
//     final orderListModel = orderListModelFromJson(jsonString);

import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


OrderListModel orderListModelFromJson(String str) =>
    OrderListModel.fromJson(json.decode(str));

String orderListModelToJson(OrderListModel data) => json.encode(data.toJson());

class OrderListModel {
  final String message;
  final List<OrderData>? data;
  final Meta? meta;

  OrderListModel({
    required this.message,
     this.data,
     this.meta,
  });

  factory OrderListModel.fromJson(Map<String, dynamic> json) => OrderListModel(
    message: json["message"],
    data: List<OrderData>.from(json["data"].map((x) => OrderData.fromJson(x))),
    meta: Meta.fromJson(json["meta"]),
      );

  Map<String, dynamic> toJson() => {
    "message": message,
    "data": List<dynamic>.from(data!.map((x) => x.toJson())),
    "meta": meta!.toJson(),
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
  final Store? storeDetails;
  final dynamic deliveryman;
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
    storeDetails:json["store_details"]==null?null: Store.fromJson(json["store_details"]),
    deliveryman: json["deliveryman"],
    orderMaster:json["order_master"]==null?null: OrderMaster.fromJson(json["order_master"]),
    orderDetails: List<OrderDetail>.from(json["order_details"].map((x) => OrderDetail.fromJson(x))),
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
    "store_details": storeDetails?.toJson(),
    "deliveryman": deliveryman,
    "order_master": orderMaster?.toJson(),
    "order_details": List<dynamic>.from(orderDetails!.map((x) => x.toJson())),
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
    required this.variantDetails,
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
    variantDetails:json["variant_details"]as Map<String, dynamic>?,
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
     this.id,
     this.customerId,
     this.shippingAddressId,
     this.shippingAddress,
     this.deliveryCharge,
     this.productDiscountAmount,
     this.orderAmount,
     this.shippingCharge,
     this.paidAmount,
     this.paymentGateway,
     this.paymentStatus,
     this.transactionRef,
     this.transactionDetails,
     this.orderNotes,
     this.customer,
  });

  factory OrderMaster.fromJson(Map<String, dynamic> json) => OrderMaster(
    id: json["id"],
    customerId: json["customer_id"],
    shippingAddressId: json["shipping_address_id"],
    shippingAddress:json["shipping_address"]==null?null: Address.fromJson(json["shipping_address"]),
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
    customer: Customer.fromJson(json["customer"]),
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
    address:json["address"]==null?null: Address.fromJson(json["address"]),
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
    createdAt:json["created_at"],
    updatedAt:json["updated_at"],
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
    "created_at": createdAt,
    "updated_at": updatedAt,
  };
}

