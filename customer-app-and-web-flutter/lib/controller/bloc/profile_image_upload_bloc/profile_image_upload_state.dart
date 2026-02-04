
import 'package:equatable/equatable.dart';

import '../../../data/data_model/profile_image_upload_model.dart';


abstract class ProfileImageUploadState extends Equatable {
  const ProfileImageUploadState();
}

class UploadInitial extends ProfileImageUploadState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class UploadLoading extends ProfileImageUploadState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class UploadLoaded extends ProfileImageUploadState{
  final ProfileImageUploadModel uploadModel;
  final bool hasConnectionError;
  const UploadLoaded({required this.uploadModel,
  this.hasConnectionError=false
  });
  @override
  List<Object?> get props => [uploadModel];

}

/// this state represents user has no internet

class UploadConnectionError extends ProfileImageUploadState {
  @override
  List<Object?> get props => [];
}
/// this state represents user has no internet

class UploadTokenExp extends ProfileImageUploadState {
  @override
  List<Object?> get props => [];
}
/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class UploadFailure extends ProfileImageUploadState {
  final ProfileImageUploadModel uploadModel;
  const UploadFailure({required this.uploadModel});
  @override
  List<Object?> get props => [uploadModel];
}