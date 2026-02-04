import 'package:equatable/equatable.dart';
import 'package:image_picker/image_picker.dart';


abstract class ProfileImageUploadEvent extends Equatable {
  const ProfileImageUploadEvent();
}


class UploadImage extends ProfileImageUploadEvent {
  final String token;
  final XFile image;
  const UploadImage( {required this.image, required this.token,});
  @override
  List<Object?> get props => [image, token];
}



class ResendOtpEvent extends ProfileImageUploadEvent {
  final String phone,region;
  const ResendOtpEvent(
      {required this.phone,
        required this.region,
      });
  @override
  List<Object?> get props => [phone,region];
}

/// this event is triggered when internet
/// connection is not active

class UploadConnectionErrorEvent extends ProfileImageUploadEvent {
  @override
  List<Object?> get props => [];
}
