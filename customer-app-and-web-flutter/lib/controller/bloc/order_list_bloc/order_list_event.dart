
import 'package:equatable/equatable.dart';

abstract class OrderListEvent extends Equatable {
  const OrderListEvent();
}

class OrderList extends OrderListEvent {
  final String language, status,token;
  final int page;
  const OrderList({
    required this.language,
    required this.status,
    required this.page,
    required this.token,
  });
  @override
  List<Object?> get props => [language,status,page,token];
}

/// this event is triggered when internet
/// connection is not active

class OrderListConnectionErrorEvent extends OrderListEvent {
  @override
  List<Object?> get props => [];
}
