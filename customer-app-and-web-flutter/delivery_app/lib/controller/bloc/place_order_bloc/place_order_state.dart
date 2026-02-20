
import 'package:equatable/equatable.dart';

import '../../../data/data_model/login_model.dart';


abstract class PlaceOrderState extends Equatable {
  const PlaceOrderState();
}

class PlaceOrderInitial extends PlaceOrderState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class PlaceOrderLoading extends PlaceOrderState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class PlaceOrderLoaded extends PlaceOrderState{
  final AuthModel authModel;
  final bool hasConnectionError;
  const PlaceOrderLoaded({
    required this.authModel,
     this.hasConnectionError=false,
  });
  @override
  List<Object?> get props => [authModel];

}

/// this state represents user has no internet

class PlaceOrderConnectionError extends PlaceOrderState {
  @override
  List<Object?> get props => [];
}
/// this state represents user has no internet

class PlaceOrderTokenExp extends PlaceOrderState {
  @override
  List<Object?> get props => [];
}
/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class PlaceOrderFailure extends PlaceOrderState {
  final AuthModel authModel;
  const PlaceOrderFailure({required this.authModel});
  @override
  List<Object?> get props => [authModel];
}