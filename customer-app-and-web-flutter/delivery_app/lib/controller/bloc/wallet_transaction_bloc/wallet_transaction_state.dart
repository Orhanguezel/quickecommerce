
import 'package:equatable/equatable.dart';
import '../../../data/data_model/wallet_transaction_model.dart';


abstract class WalletTransactionState extends Equatable {
  const WalletTransactionState();
}

class WalletTransactionInitial extends WalletTransactionState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class WalletTransactionLoading extends WalletTransactionState {
  @override
  List<Object> get props => [];
}


class WalletTransactionTokenExp extends WalletTransactionState {
  @override
  List<Object?> get props => [];
}

/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class WalletTransactionLoaded extends WalletTransactionState{
  final WalletsTransactionModel walletsTransactionModel;
  final bool hasConnectionError;
  const WalletTransactionLoaded({required this.walletsTransactionModel, this.hasConnectionError=false,});
  @override
  List<Object?> get props => [walletsTransactionModel];

}

/// this state represents user has no internet

class WalletTransactionConnectionError extends WalletTransactionState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class WalletTransactionFailure extends WalletTransactionState {
  final WalletsTransactionModel walletsTransactionModel;
  const WalletTransactionFailure({required this.walletsTransactionModel});
  @override
  List<Object?> get props => [walletsTransactionModel];
}