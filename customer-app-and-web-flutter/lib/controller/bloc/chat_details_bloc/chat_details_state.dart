import 'package:equatable/equatable.dart';
import 'package:quick_ecommerce/data/data_model/chat_details_model.dart';



abstract class ChatDetailsState extends Equatable {
  const ChatDetailsState();
}

class ChatDetailsInitial extends ChatDetailsState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class ChatDetailsLoading extends ChatDetailsState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class ChatDetailsLoaded extends ChatDetailsState{
  final MessagesDetailsModel messagesDetailsModel;
  final bool hasConnectionError;
  const ChatDetailsLoaded({
    required this.messagesDetailsModel,
     this.hasConnectionError=false,

  });
  @override
  List<Object?> get props => [messagesDetailsModel];

}

/// this state represents user has no internet

class ChatDetailsConnectionError extends ChatDetailsState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class ChatDetailsFailure extends ChatDetailsState {
  final MessagesDetailsModel messagesDetailsModel;
  const ChatDetailsFailure({required this.messagesDetailsModel});
  @override
  List<Object?> get props => [messagesDetailsModel];
}