
import 'package:equatable/equatable.dart';

import '../../../data/data_model/login_model.dart';


abstract class CancelOrderState extends Equatable {
  const CancelOrderState();
}

class CancelOrderInitial extends CancelOrderState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class CancelOrderLoading extends CancelOrderState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class CancelOrderLoaded extends CancelOrderState{
  final AuthModel authModel;
  final bool hasConnectionError;
  const CancelOrderLoaded({
    required this.authModel,
     this.hasConnectionError=false,
  });
  @override
  List<Object?> get props => [authModel];

}

/// this state represents user has no internet

class CancelOrderConnectionError extends CancelOrderState {
  @override
  List<Object?> get props => [];
}
/// this state represents user has no internet

class CancelOrderTokenExp extends CancelOrderState {
  @override
  List<Object?> get props => [];
}
/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class CancelOrderFailure extends CancelOrderState {
  final AuthModel authModel;
  const CancelOrderFailure({required this.authModel});
  @override
  List<Object?> get props => [authModel];
}