
import 'package:equatable/equatable.dart';

import '../../../data/data_model/wallet_model.dart';


abstract class WalletState extends Equatable {
  const WalletState();
}

class WalletInitial extends WalletState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class WalletLoading extends WalletState {
  @override
  List<Object> get props => [];
}



class WalletTokenExp extends WalletState {
  @override
  List<Object?> get props => [];
}

/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class WalletLoaded extends WalletState{
  final WalletsModel walletsModel;
  final bool hasConnectionError;
  const WalletLoaded({required this.walletsModel,
    this.hasConnectionError=false,});
  @override
  List<Object?> get props => [walletsModel];

}

/// this state represents user has no internet

class WalletConnectionError extends WalletState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class WalletFailure extends WalletState {
  final WalletsModel walletsModel;
  const WalletFailure({required this.walletsModel});
  @override
  List<Object?> get props => [walletsModel];
}