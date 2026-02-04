
import 'package:equatable/equatable.dart';

import '../../../data/data_model/login_model.dart';


abstract class ResetPassState extends Equatable {
  const ResetPassState();
}

class ResetPassInitial extends ResetPassState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class ResetPassLoading extends ResetPassState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class ResetPassLoaded extends ResetPassState{
  final AuthModel authModel;
  const ResetPassLoaded({required this.authModel});
  @override
  List<Object?> get props => [authModel];

}

/// this state represents user has no internet

class ResetPassConnectionError extends ResetPassState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class ResetPassFailure extends ResetPassState {
  final AuthModel authModel;
  const ResetPassFailure({required this.authModel});
  @override
  List<Object?> get props => [authModel];
}