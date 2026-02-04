
import 'package:equatable/equatable.dart';

import '../../../data/data_model/login_model.dart';


abstract class RefreshTokenState extends Equatable {
  const RefreshTokenState();
}

class RefreshTokenInitial extends RefreshTokenState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class RefreshTokenLoading extends RefreshTokenState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class RefreshTokenLoaded extends RefreshTokenState{
  final AuthModel authModel;
  final bool hasConnectionError;
  const RefreshTokenLoaded({
    required this.authModel,
    this.hasConnectionError=false
  });
  @override
  List<Object?> get props => [authModel,hasConnectionError];

}

/// this state represents user has no internet

class RefreshTokenConnectionError extends RefreshTokenState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class RefreshTokenFailure extends RefreshTokenState {
  final AuthModel authModel;
  const RefreshTokenFailure({required this.authModel});
  @override
  List<Object?> get props => [authModel];
}