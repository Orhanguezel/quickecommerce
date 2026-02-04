
import 'package:equatable/equatable.dart';

import '../../../data/data_model/login_model.dart';



abstract class PaymentStatusUpdateState extends Equatable {
  const PaymentStatusUpdateState();
}

class PaymentStatusUpdateInitial extends PaymentStatusUpdateState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class PaymentStatusUpdateLoading extends PaymentStatusUpdateState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class PaymentStatusUpdateLoaded extends PaymentStatusUpdateState{
  final AuthModel authModel;
  final bool hasConnectionError;
  const PaymentStatusUpdateLoaded({required this.authModel,
  this.hasConnectionError=false
  });
  @override
  List<Object?> get props => [authModel];

}

/// this state represents user has no internet

class PaymentStatusUpdateConnectionError extends PaymentStatusUpdateState {
  @override
  List<Object?> get props => [];
}
/// this state represents user has no internet

class PaymentStatusUpdateTokenExp extends PaymentStatusUpdateState {
  @override
  List<Object?> get props => [];
}
/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class PaymentStatusUpdateFailure extends PaymentStatusUpdateState {
  final AuthModel authModel;
  const PaymentStatusUpdateFailure({required this.authModel});
  @override
  List<Object?> get props => [authModel];
}