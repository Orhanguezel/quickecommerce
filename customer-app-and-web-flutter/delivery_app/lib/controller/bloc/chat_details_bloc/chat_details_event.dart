
import 'package:equatable/equatable.dart';
import 'package:quick_ecommerce/data/data_model/chat_details_model.dart';


abstract class ChatDetailsEvent extends Equatable {
  const ChatDetailsEvent();
}

class ChatDetailsDataEvent extends ChatDetailsEvent {
  final String receiverId, receiverType,search,token;
  const ChatDetailsDataEvent({
    required this.receiverId,
    required this.receiverType,
    required this.search,
    required this.token,
  });
  @override
  List<Object?> get props => [receiverId,receiverType,search,token];
}

class NewMessageReceivedEvent extends ChatDetailsEvent {
  final MessagesData newMessage;
  const NewMessageReceivedEvent({required this.newMessage});
  @override
  List<Object?> get props => [newMessage];
}
/// this event is triggered when internet
/// connection is not active

class ChatDetailsConnectionErrorEvent extends ChatDetailsEvent {
  @override
  List<Object?> get props => [];
}
