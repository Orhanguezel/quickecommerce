
import 'package:equatable/equatable.dart';

import '../../../data/data_model/login_model.dart';


abstract class EmailVerificationState extends Equatable {
  const EmailVerificationState();
}

class EmailVerificationInitial extends EmailVerificationState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class EmailVerificationLoading extends EmailVerificationState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class EmailVerificationLoaded extends EmailVerificationState{
  final AuthModel authModel;
  final bool hasConnectionError;
  const EmailVerificationLoaded({required this.authModel,this.hasConnectionError=false,});
  @override
  List<Object?> get props => [authModel];

}

/// this state represents user has no internet

class EmailVerificationConnectionError extends EmailVerificationState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class EmailVerificationFailure extends EmailVerificationState {
  final AuthModel authModel;
  const EmailVerificationFailure({required this.authModel});
  @override
  List<Object?> get props => [authModel];
}