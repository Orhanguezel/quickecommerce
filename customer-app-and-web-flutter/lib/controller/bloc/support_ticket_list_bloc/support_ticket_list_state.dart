
import 'package:equatable/equatable.dart';
import '../../../data/data_model/support_ticket_model.dart';



abstract class SupportTicketListState extends Equatable {
  const SupportTicketListState();
}

class SupportTicketListInitial extends SupportTicketListState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class SupportTicketListLoading extends SupportTicketListState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class SupportTicketListLoaded extends SupportTicketListState{
  final SupportTicketModel supportTicketModel;
  final bool hasConnectionError;
  const SupportTicketListLoaded({
    required this.supportTicketModel,
  this.hasConnectionError=false
  });
  @override
  List<Object?> get props => [supportTicketModel];

}


/// this state represents user has no internet

class SupportTicketListConnectionError extends SupportTicketListState {
  @override
  List<Object?> get props => [];
}



class SupportTicketListTokenExp extends SupportTicketListState {
  @override
  List<Object?> get props => [];
}


class SupportTicketListEmailValidity extends SupportTicketListState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class SupportTicketListFailure extends SupportTicketListState {
  final SupportTicketModel supportTicketModel;
  const SupportTicketListFailure({required this.supportTicketModel});
  @override
  List<Object?> get props => [supportTicketModel];
}