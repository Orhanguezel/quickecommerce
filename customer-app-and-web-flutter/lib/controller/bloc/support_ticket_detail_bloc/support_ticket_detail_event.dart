
import 'package:equatable/equatable.dart';

abstract class SupportTicketDetailEvent extends Equatable {
  const SupportTicketDetailEvent();
}

class TicketDetails extends SupportTicketDetailEvent {
  final String id, token;
  const TicketDetails({
    required this.id,
    required this.token,
  });
  @override
  List<Object?> get props => [id,token];
}



/// this event is triggered when internet
/// connection is not active

class SupportTicketListConnectionErrorEvent extends SupportTicketDetailEvent {
  @override
  List<Object?> get props => [];
}
