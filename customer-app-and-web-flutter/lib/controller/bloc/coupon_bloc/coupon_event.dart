

import 'package:equatable/equatable.dart';

abstract class CouponEvent extends Equatable {
  const CouponEvent();
}

class Coupons extends CouponEvent {

  final String couponCode,subtotal,currencyCode,token;
  const Coupons({
    required this.couponCode,
    required this.subtotal,
    required this.currencyCode,
    required this.token,
  });
  @override
  List<Object?> get props => [couponCode,subtotal,currencyCode,token];
}


/// this event is triggered when internet
/// connection is not active

class CouponConnectionErrorEvent extends CouponEvent {
  @override
  List<Object?> get props => [];
}
