
import 'package:equatable/equatable.dart';
import '../../../data/data_model/ticket_detail_model.dart';



abstract class SupportTicketDetailState extends Equatable {
  const SupportTicketDetailState();
}

class TicketDetailInitial extends SupportTicketDetailState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class TicketDetailLoading extends SupportTicketDetailState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class TicketDetailLoaded extends SupportTicketDetailState{
  final TicketDetailsModel ticketDetailsModel;
  final bool hasConnectionError;
  const TicketDetailLoaded({required this.ticketDetailsModel,this.hasConnectionError=false});
  @override
  List<Object?> get props => [ticketDetailsModel];

}


/// this state represents user has no internet

class TicketDetailConnectionError extends SupportTicketDetailState {
  @override
  List<Object?> get props => [];
}



class TicketDetailTokenExp extends SupportTicketDetailState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class TicketDetailFailure extends SupportTicketDetailState {
  final TicketDetailsModel ticketDetailsModel;
  const TicketDetailFailure({required this.ticketDetailsModel});
  @override
  List<Object?> get props => [ticketDetailsModel];
}