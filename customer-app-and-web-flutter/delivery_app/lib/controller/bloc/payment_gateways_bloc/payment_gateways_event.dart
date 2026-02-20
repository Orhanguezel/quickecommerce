
import 'package:equatable/equatable.dart';

abstract class PaymentGatewaysEvent extends Equatable {
  const PaymentGatewaysEvent();
}

class PaymentGateways extends PaymentGatewaysEvent {
  @override
  List<Object?> get props => [];
}
class ProductDetailsSetting extends PaymentGatewaysEvent {
  final String language;
  const ProductDetailsSetting({
    required this.language,
  });
  @override
  List<Object?> get props => [language];
}


/// this event is triggered when internet
/// connection is not active

class PaymentGatewaysConnectionErrorEvent extends PaymentGatewaysEvent {
  @override
  List<Object?> get props => [];
}
