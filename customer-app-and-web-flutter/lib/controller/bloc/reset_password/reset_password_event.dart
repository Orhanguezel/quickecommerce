import 'package:equatable/equatable.dart';

abstract class ResetPassEvent extends Equatable {
  const ResetPassEvent();
}

/// this event is responsible for login into app
/// it takes [userId] and [password] as parameter

class ResetPassWithEmail extends ResetPassEvent {
  final String email;

  const ResetPassWithEmail({
    required this.email,
  });
  @override
  List<Object?> get props => [email];
}

class VerifyToken extends ResetPassEvent {
  final String email, token;
  const VerifyToken({required this.email, required this.token});
  @override
  List<Object?> get props => [email, token];
}

class SetPassword extends ResetPassEvent {
  final String email, token, password, conPassword;
  const SetPassword(
      {required this.email,
      required this.token,
      required this.password,
      required this.conPassword});
  @override
  List<Object?> get props => [email, token, password, conPassword];
}


class ChangePassword extends ResetPassEvent {
  final String  oldPassword, newPassword,newConPassword,token;
  const ChangePassword(
      {
        required this.oldPassword,
        required this.newPassword,
        required this.newConPassword,
        required this.token,
      });
  @override
  List<Object?> get props => [ oldPassword, newPassword,newConPassword,token];
}



class ChangeEmails extends ResetPassEvent {
  final String  email,vToken,token;
  const ChangeEmails(
      {
        required this.email,required this.vToken,required this.token,});
  @override
  List<Object?> get props => [ email,vToken,token];
}


class VerifyEmails extends ResetPassEvent {
  final String  vToken,token;
  const VerifyEmails(
      {required this.vToken,required this.token,});
  @override
  List<Object?> get props => [vToken,token];
}


class SendVerificationEmails extends ResetPassEvent {
  final String  email,token;
  const SendVerificationEmails(
      {
        required this.email,required this.token,});
  @override
  List<Object?> get props => [ email,token];
}





/// this event is triggered when internet
/// connection is not active

class ResetPassConnectionErrorEvent extends ResetPassEvent {
  @override
  List<Object?> get props => [];
}
