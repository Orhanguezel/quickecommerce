import 'package:equatable/equatable.dart';


abstract class PaymentStatusUpdateEvent extends Equatable {
  const PaymentStatusUpdateEvent();
}


class DepositUpdate extends PaymentStatusUpdateEvent {
  final String transactionId, transactionDetails, hMacSignature, token;
  final int timestamp,walletHistoryId;
  const DepositUpdate(
      {required this.walletHistoryId,
        required this.transactionId,
        required this.transactionDetails,
        required this.hMacSignature,
        required this.timestamp,
        required this.token});
  @override
  List<Object?> get props => [
    walletHistoryId,
    transactionId,
    transactionDetails,
    hMacSignature,
    timestamp,
    token
  ];
}


class OrderPaymentStatusUpdate extends PaymentStatusUpdateEvent {
  final String orderId, transactionId,timestamp, hMacSignature, token;
  const OrderPaymentStatusUpdate(
      {required this.orderId,
        required this.transactionId,
        required this.timestamp,
        required this.hMacSignature,
        required this.token});
  @override
  List<Object?> get props => [orderId, transactionId,timestamp, hMacSignature, token];
}

class StripeWebhook extends PaymentStatusUpdateEvent {
  final String  token;
  final Map<String, dynamic> objectData;
  const StripeWebhook(
      {required this.objectData,
        required this.token});
  @override
  List<Object?> get props => [objectData,token];
}

class PaymentStatusUpdateConnectionErrorEvent extends PaymentStatusUpdateEvent {
  @override
  List<Object?> get props => [];
}
