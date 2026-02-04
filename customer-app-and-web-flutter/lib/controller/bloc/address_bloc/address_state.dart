
import 'package:equatable/equatable.dart';

import '../../../data/data_model/login_model.dart';


abstract class AddressState extends Equatable {
  const AddressState();
}

class AddressInitial extends AddressState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class AddressLoading extends AddressState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class AddressLoaded extends AddressState{
  final AuthModel authModel;
  final bool hasConnectionError;
  const AddressLoaded({
    required this.authModel,
     this.hasConnectionError=false,
  });
  @override
  List<Object?> get props => [authModel];

}

/// this state represents user has no internet

class AddressConnectionError extends AddressState {
  @override
  List<Object?> get props => [];
}
/// this state represents user has no internet

class AddressTokenExp extends AddressState {
  @override
  List<Object?> get props => [];
}
/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class AddressFailure extends AddressState {
  final AuthModel authModel;
  const AddressFailure({required this.authModel});
  @override
  List<Object?> get props => [authModel];
}