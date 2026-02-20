import 'package:equatable/equatable.dart';
import 'package:quick_ecommerce/data/data_model/chat_list_model.dart';



abstract class ChatListState extends Equatable {
  const ChatListState();
}

class ChatListInitial extends ChatListState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class ChatListLoading extends ChatListState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class ChatListLoaded extends ChatListState{
  final ChatListModel chatListModel;
  final bool hasConnectionError;
  const ChatListLoaded({
    required this.chatListModel,
     this.hasConnectionError=false,

  });
  @override
  List<Object?> get props => [chatListModel];

}

/// this state represents user has no internet

class ChatListConnectionError extends ChatListState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class ChatListFailure extends ChatListState {
  final ChatListModel chatListModel;
  const ChatListFailure({required this.chatListModel});
  @override
  List<Object?> get props => [chatListModel];
}