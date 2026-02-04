// To parse this JSON data, do
//
//     final walletsModel = walletsModelFromJson(jsonString);

import 'dart:convert';

WalletsModel walletsModelFromJson(String str) => WalletsModel.fromJson(json.decode(str));

String walletsModelToJson(WalletsModel data) => json.encode(data.toJson());

class WalletsModel {
  final Wallets wallets;
  final dynamic maxDepositPerTransaction;

  WalletsModel({
    required this.wallets,
    this.maxDepositPerTransaction,
  });

  factory WalletsModel.fromJson(Map<String, dynamic> json) => WalletsModel(
    wallets: Wallets.fromJson(json["wallets"]),
    maxDepositPerTransaction: json["max_deposit_per_transaction"],
  );

  Map<String, dynamic> toJson() => {
    "wallets": wallets.toJson(),
    "max_deposit_per_transaction": maxDepositPerTransaction,
  };
}

class Wallets {
  final dynamic id;
  final dynamic ownerId;
  final dynamic ownerType;
  final dynamic balance;
  final dynamic status;
  final dynamic totalBalance;
  final dynamic totalEarnings;
  final dynamic totalWithdrawn;

  Wallets({
     this.id,
     this.ownerId,
     this.ownerType,
     this.balance,
     this.status,
     this.totalBalance,
     this.totalEarnings,
     this.totalWithdrawn,
  });

  factory Wallets.fromJson(Map<String, dynamic> json) => Wallets(
    id: json["id"],
    ownerId: json["owner_id"],
    ownerType: json["owner_type"],
    balance: json["balance"],
    status: json["status"],
    totalBalance: json["total_balance"],
    totalEarnings: json["total_earnings"],
    totalWithdrawn: json["total_withdrawn"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "owner_id": ownerId,
    "owner_type": ownerType,
    "balance": balance,
    "status": status,
    "total_balance": totalBalance,
    "total_earnings": totalEarnings,
    "total_withdrawn": totalWithdrawn,
  };
}