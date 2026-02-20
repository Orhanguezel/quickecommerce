

import 'package:equatable/equatable.dart';

abstract class WalletTransactionEvent extends Equatable {
  const WalletTransactionEvent();
}

class WalletTransaction extends WalletTransactionEvent {
  final String token;
   const WalletTransaction({required this.token});
  @override
  List<Object?> get props => [token];
}


/// this event is triggered when internet
/// connection is not active

class WalletTransactionConnectionErrorEvent extends WalletTransactionEvent {
  @override
  List<Object?> get props => [];
}
