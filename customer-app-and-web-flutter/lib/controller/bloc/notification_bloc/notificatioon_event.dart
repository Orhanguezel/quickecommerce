
import 'package:equatable/equatable.dart';

abstract class NotificationEvent extends Equatable {
  const NotificationEvent();
}

class NotificationDataEvent extends NotificationEvent {
  final String language, token;
  const NotificationDataEvent({
    required this.language,
    required this.token,
  });
  @override
  List<Object?> get props => [language,token];
}


class RefundReasonListEvent extends NotificationEvent {
  final String token;
  const RefundReasonListEvent({
    required this.token,
  });
  @override
  List<Object?> get props => [token];
}

/// this event is triggered when internet
/// connection is not active

class NotificationConnectionErrorEvent extends NotificationEvent {
  @override
  List<Object?> get props => [];
}
