import 'package:equatable/equatable.dart';

abstract class LoginEvent extends Equatable {
  const LoginEvent();
}

/// this event is responsible for login into app
/// it takes [userId] and [password] as parameter

class RegistrationWithUsernameAndEmail extends LoginEvent {
  final String firstName, lastName, email, password, token;
  final Map role;
  const RegistrationWithUsernameAndEmail(
      {required this.firstName,
      required this.lastName,
      required this.email,
      required this.password,
      required this.token,
      required this.role});
  @override
  List<Object?> get props =>
      [firstName, lastName, email, password, role, token];
}

class LoginWithEmailAndPassword extends LoginEvent {
  final String email, password,fcToken;
  const LoginWithEmailAndPassword(
      {required this.email, required this.password,required this.fcToken});
  @override
  List<Object?> get props => [email, password,fcToken];
}

class Logout extends LoginEvent {
  const Logout();
  @override
  List<Object?> get props => [];
}


class LoginWithGoogle extends LoginEvent {
  final String idToken,email, fcmToken;
  const LoginWithGoogle({required this.idToken,required this.email,required this. fcmToken});
  @override
  List<Object?> get props => [];
}

class LoginWithFacebook extends LoginEvent {
  @override
  // TODO: implement props
  List<Object?> get props => throw UnimplementedError();
}

/// this event is triggered when internet
/// connection is not active

class LoginConnectionErrorEvent extends LoginEvent {
  @override
  List<Object?> get props => [];
}
