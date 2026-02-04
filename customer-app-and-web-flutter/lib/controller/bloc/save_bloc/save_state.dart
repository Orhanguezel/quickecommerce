
import 'package:equatable/equatable.dart';

import '../../../data/data_model/login_model.dart';


abstract class SaveState extends Equatable {
  const SaveState();
}

class SaveInitial extends SaveState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class SaveLoading extends SaveState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class SaveLoaded extends SaveState{
  final AuthModel authModel;
  final bool hasConnectionError;
  const SaveLoaded({
    required this.authModel,
     this.hasConnectionError=false,
  });
  @override
  List<Object?> get props => [authModel];

}

/// this state represents user has no internet

class SaveConnectionError extends SaveState {
  @override
  List<Object?> get props => [];
}
/// this state represents user has no internet

class SaveTokenExp extends SaveState {
  @override
  List<Object?> get props => [];
}
/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class SaveFailure extends SaveState {
  final AuthModel authModel;
  const SaveFailure({required this.authModel});
  @override
  List<Object?> get props => [authModel];
}