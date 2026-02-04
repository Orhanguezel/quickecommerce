
import 'package:equatable/equatable.dart';

abstract class OrderDetailsEvent extends Equatable {
  const OrderDetailsEvent();
}

class OrderDetails extends OrderDetailsEvent {
  final String language,id,token;
  const OrderDetails({
    required this.language,
    required this.id,
    required this.token,
  });
  @override
  List<Object?> get props => [language,id,token];
}



/// this event is triggered when internet
/// connection is not active

class OrderDetailsConnectionErrorEvent extends OrderDetailsEvent {
  @override
  List<Object?> get props => [];
}
