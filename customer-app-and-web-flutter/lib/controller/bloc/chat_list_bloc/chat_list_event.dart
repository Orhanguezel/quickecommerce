
import 'package:equatable/equatable.dart';

abstract class ChatListEvent extends Equatable {
  const ChatListEvent();
}

class ChatListDataEvent extends ChatListEvent {
  final String search,type,token;
  const ChatListDataEvent({
    required this.search,
    required this.type,
    required this.token,
  });
  @override
  List<Object?> get props => [search,type,token];
}


/// this event is triggered when internet
/// connection is not active

class DashboardConnectionErrorEvent extends ChatListEvent {
  @override
  List<Object?> get props => [];
}
