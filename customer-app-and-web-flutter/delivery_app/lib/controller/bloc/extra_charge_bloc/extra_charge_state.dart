
import 'package:equatable/equatable.dart';
import '../../../data/data_model/extra_charge_model.dart';


abstract class ExtraChargeState extends Equatable {
  const ExtraChargeState();
}

class ExtraChargeInitial extends ExtraChargeState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class ExtraChargeLoading extends ExtraChargeState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class ExtraChargeLoaded extends ExtraChargeState{
  final ExtraChargeModel extraChargeModel;
  const ExtraChargeLoaded({required this.extraChargeModel});
  @override
  List<Object?> get props => [extraChargeModel];

}

/// this state represents user has no internet

class ExtraChargeConnectionError extends ExtraChargeState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class ExtraChargeFailure extends ExtraChargeState {
  final ExtraChargeModel extraChargeModel;
  const ExtraChargeFailure({required this.extraChargeModel});
  @override
  List<Object?> get props => [extraChargeModel];
}