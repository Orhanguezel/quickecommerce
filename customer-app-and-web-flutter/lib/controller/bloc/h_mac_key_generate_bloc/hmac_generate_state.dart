
import 'package:equatable/equatable.dart';
import 'package:quick_ecommerce/data/data_model/h_mac_model.dart';


abstract class HMacGenerateState extends Equatable {
  const HMacGenerateState();
}

class HMacGenerateInitial extends HMacGenerateState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class HMacGenerateLoading extends HMacGenerateState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class HMacGenerateLoaded extends HMacGenerateState{
  final HMacModel hMacModel;
  final bool hasConnectionError;
  const HMacGenerateLoaded({required this.hMacModel,this.hasConnectionError = false,});
  @override
  List<Object?> get props => [hMacModel];

}

/// this state represents user has no internet

class HMacGenerateConnectionError extends HMacGenerateState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class HMacGenerateFailure extends HMacGenerateState {
  final HMacModel hMacModel;
  const HMacGenerateFailure({required this.hMacModel});
  @override
  List<Object?> get props => [hMacModel];
}