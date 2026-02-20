

import 'package:equatable/equatable.dart';

abstract class HMacGenerateEvent extends Equatable {
  const HMacGenerateEvent();
}

class HMacGenerate extends HMacGenerateEvent {
  final String orderId,token;
  const HMacGenerate({
    required this.orderId,
    required this.token,
  });
  @override
  List<Object?> get props => [orderId,token];
}

class CreateStripeSession extends HMacGenerateEvent {
  final String currencyCode,orderMasterId,token;
  const CreateStripeSession({
    required this.currencyCode,
    required this.orderMasterId,
    required this.token,
  });
  @override
  List<Object?> get props => [currencyCode,orderMasterId,token];
}

class CreateWalletStripeSession extends HMacGenerateEvent {
  final String historyId,walletId,token;
  const CreateWalletStripeSession({
    required this.historyId,
    required this.walletId,
    required this.token,
  });
  @override
  List<Object?> get props => [historyId,walletId,token];
}


class WalletHMacGenerate extends HMacGenerateEvent {
  final String historyId,token;
  const WalletHMacGenerate({
    required this.historyId,
    required this.token,
  });
  @override
  List<Object?> get props => [historyId,token];
}

/// this event is triggered when internet
/// connection is not active

class HMacGenerateConnectionErrorEvent extends HMacGenerateEvent {
  @override
  List<Object?> get props => [];
}
