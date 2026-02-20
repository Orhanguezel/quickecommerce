
import 'package:equatable/equatable.dart';
import '../../../data/data_model/department_model.dart';
import '../../../data/data_model/profile_model.dart';


abstract class ProfileState extends Equatable {
  const ProfileState();
}

class ProfileInitial extends ProfileState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class ProfileLoading extends ProfileState {
  @override
  List<Object> get props => [];
}


class TokenExp extends ProfileState {
  @override
  List<Object> get props => [];
}

/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class ProfileLoaded extends ProfileState{
  final ProfileModel profileModel;
  final bool hasConnectionError;
  const ProfileLoaded({
    required this.profileModel,
  this.hasConnectionError=false
  });
  @override
  List<Object?> get props => [profileModel];

}

/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class DepartmentLoaded extends ProfileState{
  final DepartmentModel departmentModel;
  const DepartmentLoaded({required this.departmentModel});
  @override
  List<Object?> get props => [departmentModel];

}

/// this state represents user has no internet

class ProfileConnectionError extends ProfileState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class ProfileFailure extends ProfileState {
  final ProfileModel profileModel;
  const ProfileFailure({required this.profileModel});
  @override
  List<Object?> get props => [profileModel];
}