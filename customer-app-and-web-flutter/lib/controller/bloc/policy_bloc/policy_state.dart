
import 'package:equatable/equatable.dart';
import '../../../data/data_model/trams_condition_model.dart';



abstract class PolicyState extends Equatable {
  const PolicyState();
}

class PolicyInitial extends PolicyState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class PolicyLoading extends PolicyState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class PolicyLoaded extends PolicyState{
  final PrivacyPolicyModel policyModel;
  final bool hasConnectionError;
  const PolicyLoaded({required this.policyModel,
    this.hasConnectionError=false,
  });
  @override
  List<Object?> get props => [policyModel];

}


/// this state represents user has no internet

class PolicyConnectionError extends PolicyState {
  @override
  List<Object?> get props => [];
}


/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class PolicyFailure extends PolicyState {
  final PrivacyPolicyModel policyModel;
  const PolicyFailure({required this.policyModel});
  @override
  List<Object?> get props => [policyModel];
}