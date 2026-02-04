import 'package:equatable/equatable.dart';

abstract class CancelOrderEvent extends Equatable {
  const CancelOrderEvent();
}


class OrderCancel extends CancelOrderEvent {
  final String orderId, token;
  const OrderCancel({required this.orderId, required this.token});
  @override
  List<Object?> get props => [orderId, token];
}
/// this event is triggered when internet
/// connection is not active

class CancelOrderConnectionErrorEvent extends CancelOrderEvent {
  @override
  List<Object?> get props => [];
}
