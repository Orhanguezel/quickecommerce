// To parse this JSON data, do
//
//     final walletsTransactionModel = walletsTransactionModelFromJson(jsonString);

import 'dart:convert';

WalletsTransactionModel walletsTransactionModelFromJson(String str) => WalletsTransactionModel.fromJson(json.decode(str));

String walletsTransactionModelToJson(WalletsTransactionModel data) => json.encode(data.toJson());

class WalletsTransactionModel {
  final List<Wallet>? wallets;
  final Pagination? pagination;

  WalletsTransactionModel({
    required this.wallets,
    required this.pagination,
  });

  factory WalletsTransactionModel.fromJson(Map<String, dynamic> json) => WalletsTransactionModel(
    wallets: json["wallets"]==null?null:List<Wallet>.from(json["wallets"].map((x) => Wallet.fromJson(x))),
    pagination:json["pagination"]==null?null: Pagination.fromJson(json["pagination"]),
  );

  Map<String, dynamic> toJson() => {
    "wallets":wallets==null?null: List<dynamic>.from(wallets!.map((x) => x.toJson())),
    "pagination": pagination?.toJson(),
  };
}

class Pagination {
  final dynamic total;
  final dynamic perPage;
  final dynamic currentPage;
  final dynamic lastPage;
  final dynamic from;
  final dynamic to;

  Pagination({
     this.total,
     this.perPage,
     this.currentPage,
     this.lastPage,
     this.from,
     this.to,
  });

  factory Pagination.fromJson(Map<String, dynamic> json) => Pagination(
    total: json["total"],
    perPage: json["per_page"],
    currentPage: json["current_page"],
    lastPage: json["last_page"],
    from: json["from"],
    to: json["to"],
  );

  Map<String, dynamic> toJson() => {
    "total": total,
    "per_page": perPage,
    "current_page": currentPage,
    "last_page": lastPage,
    "from": from,
    "to": to,
  };
}

class Wallet {
  final dynamic id;
  final dynamic walletId;
  final dynamic transactionRef;
  final dynamic transactionDetails;
  final dynamic amount;
  final dynamic type;
  final dynamic purpose;
  final dynamic status;
  final dynamic createdAt;
  final dynamic updatedAt;
  final dynamic ownerName;
  final dynamic paymentGateway;
  final dynamic paymentStatus;

  Wallet({
     this.id,
     this.walletId,
     this.transactionRef,
     this.transactionDetails,
     this.amount,
     this.type,
     this.purpose,
     this.status,
     this.createdAt,
     this.updatedAt,
     this.ownerName,
     this.paymentGateway,
     this.paymentStatus,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) => Wallet(
    id: json["id"],
    walletId: json["wallet_id"],
    transactionRef: json["transaction_ref"],
    transactionDetails: json["transaction_details"],
    amount: json["amount"],
    type: json["type"],
    purpose: json["purpose"],
    status: json["status"],
    createdAt: json["created_at"],
    updatedAt:json["updated_at"],
    ownerName: json["owner_name"],
    paymentGateway: json["payment_gateway"],
    paymentStatus: json["payment_status"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "wallet_id": walletId,
    "transaction_ref": transactionRef,
    "transaction_details": transactionDetails,
    "amount": amount,
    "type": type,
    "purpose": purpose,
    "status": status,
    "created_at": createdAt,
    "updated_at": updatedAt,
    "owner_name": ownerName,
    "payment_gateway": paymentGateway,
    "payment_status": paymentStatus,
  };
}
