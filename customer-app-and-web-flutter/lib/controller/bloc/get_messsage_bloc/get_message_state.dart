
import 'package:equatable/equatable.dart';
import '../../../data/data_model/tax_info_model.dart';
import '../../../data/data_model/tickate_message_model.dart';



abstract class GetMessageState extends Equatable {
  const GetMessageState();
}

class GetMessageInitial extends GetMessageState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class GetMessageLoading extends GetMessageState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class GetMessageLoaded extends GetMessageState{
  final TicketMessageModel ticketMessageModel;
  final bool hasConnectionError;
  const GetMessageLoaded({required this.ticketMessageModel,this.hasConnectionError=false});
  @override
  List<Object?> get props => [ticketMessageModel];
}

class GetTaxInfoLoaded extends GetMessageState{
  final TaxModel taxModel;
  const GetTaxInfoLoaded({required this.taxModel});
  @override
  List<Object?> get props => [taxModel];
}

/// this state represents user has no internet

class GetMessageConnectionError extends GetMessageState {
  @override
  List<Object?> get props => [];
}



class GetMessageTokenExp extends GetMessageState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class GetMessageFailure extends GetMessageState {
  final TicketMessageModel ticketMessageModel;
  const GetMessageFailure({required this.ticketMessageModel});
  @override
  List<Object?> get props => [ticketMessageModel];
}