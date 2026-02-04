
import 'package:equatable/equatable.dart';

abstract class WalletEvent extends Equatable {
  const WalletEvent();
}

class Wallet extends WalletEvent {
  final String token;
   const Wallet({required this.token});
  @override
  List<Object?> get props => [token];
}


/// this event is triggered when internet
/// connection is not active

class WalletConnectionErrorEvent extends WalletEvent {
  @override
  List<Object?> get props => [];
}
