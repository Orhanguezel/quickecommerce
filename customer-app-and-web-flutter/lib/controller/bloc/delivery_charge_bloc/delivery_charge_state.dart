
import 'package:equatable/equatable.dart';
import '../../../data/data_model/delivery_charge_model.dart';


abstract class DeliveryChargeState extends Equatable {
  const DeliveryChargeState();
}

class DeliveryChargeInitial extends DeliveryChargeState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class DeliveryChargeLoading extends DeliveryChargeState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class DeliveryChargeLoaded extends DeliveryChargeState{
  final List<DeliveryChargeModel> deliveryChargeModel;
  const DeliveryChargeLoaded({required this.deliveryChargeModel});
  @override
  List<Object?> get props => [deliveryChargeModel];

}

/// this state represents user has no internet

class DeliveryChargeConnectionError extends DeliveryChargeState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class DeliveryChargeFailure extends DeliveryChargeState {
  final List<DeliveryChargeModel> deliveryChargeModel;
  const DeliveryChargeFailure({required this.deliveryChargeModel});
  @override
  List<Object?> get props => [deliveryChargeModel];
}