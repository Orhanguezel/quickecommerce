import 'package:equatable/equatable.dart';

abstract class EmailVerificationEvent extends Equatable {
  const EmailVerificationEvent();
}

/// this event is responsible for login into app
/// it takes [userId] and [password] as parameter

class SendEmailVerification extends EmailVerificationEvent {
  final String email,token;
  const SendEmailVerification({
    required this.email,
    required this.token,
  });
  @override
  List<Object?> get props => [email];
}


class ResendEmailVerification extends EmailVerificationEvent {
  final String email,token;
  const ResendEmailVerification({
    required this.email,
    required this.token,
  });
  @override
  List<Object?> get props => [email];
}


/// this event is triggered when internet
/// connection is not active

class EmailVerificationConnectionErrorEvent extends EmailVerificationEvent {
  @override
  List<Object?> get props => [];
}
