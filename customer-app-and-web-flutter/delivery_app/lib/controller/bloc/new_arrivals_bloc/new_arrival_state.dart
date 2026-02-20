import 'package:equatable/equatable.dart';

import '../../../data/data_model/new_arrival_model.dart';


abstract class NewArrivalState extends Equatable {
  const NewArrivalState();
}

class NewArrivalInitial extends NewArrivalState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class NewArrivalLoading extends NewArrivalState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class NewArrivalLoaded extends NewArrivalState{
  final NewArrivalModel newArrivalModel;
  final bool hasConnectionError;
  const NewArrivalLoaded({required this.newArrivalModel,
    this.hasConnectionError = false,});
  @override
  List<Object?> get props => [newArrivalModel];

}

/// this state represents user has no internet

class NewArrivalConnectionError extends NewArrivalState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class NewArrivalFailure extends NewArrivalState {
  final NewArrivalModel newArrivalModel;
  const NewArrivalFailure({required this.newArrivalModel});
  @override
  List<Object?> get props => [newArrivalModel];
}