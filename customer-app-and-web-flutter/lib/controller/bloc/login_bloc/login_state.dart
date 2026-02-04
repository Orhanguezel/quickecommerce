
import 'package:equatable/equatable.dart';

import '../../../data/data_model/login_model.dart';


abstract class LoginState extends Equatable {
  const LoginState();
}

class LoginInitial extends LoginState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class LoginLoading extends LoginState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class LoginLoaded extends LoginState{
  final AuthModel authModel;
  const LoginLoaded({required this.authModel});
  @override
  List<Object?> get props => [authModel];

}

/// this state represents user has no internet

class LoginConnectionError extends LoginState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class LoginFailure extends LoginState {
  final AuthModel authModel;
  const LoginFailure({required this.authModel});
  @override
  List<Object?> get props => [authModel];
}