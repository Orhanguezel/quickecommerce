import 'package:equatable/equatable.dart';

abstract class RefreshTokenEvent extends Equatable {
  const RefreshTokenEvent();
}

class RefreshTokenDataEvent extends RefreshTokenEvent {
  final String  token;
  const RefreshTokenDataEvent(
      {
        required this.token});
  @override
  List<Object?> get props => [token];
}


/// this event is triggered when internet
/// connection is not active

class RefreshConnectionErrorEvent extends RefreshTokenEvent {
  @override
  List<Object?> get props => [];
}