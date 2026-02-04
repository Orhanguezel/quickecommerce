
import 'package:equatable/equatable.dart';

abstract class SupportTicketListEvent extends Equatable {
  const SupportTicketListEvent();
}

class SupportTicketList extends SupportTicketListEvent {
  final String departmentId, status,perPage,token;
  const SupportTicketList({
    required this.departmentId,
    required this.status,
    required this.perPage,
    required this.token,
  });
  @override
  List<Object?> get props => [departmentId,status,perPage,token];
}



/// this event is triggered when internet
/// connection is not active

class SupportTicketListConnectionErrorEvent extends SupportTicketListEvent {
  @override
  List<Object?> get props => [];
}
