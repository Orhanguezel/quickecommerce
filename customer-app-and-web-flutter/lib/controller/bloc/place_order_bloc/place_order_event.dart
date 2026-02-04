import 'package:equatable/equatable.dart';

abstract class PlaceOrderEvent extends Equatable {
  const PlaceOrderEvent();
}

class PlaceOrder extends PlaceOrderEvent {
  final String name,email,contactNumber,paymentGateway, comment, couponCode,currencyCode, token;
  final int addressId;
  final Map<String, dynamic> guestInfo;
  final List packages;
  final double latitude, longitude;
  const PlaceOrder(
      {required this.latitude,
        required this.longitude,
        required this.addressId,
        required this.name,
        required this.email,
        required this.contactNumber,
        required this.paymentGateway,
        required this.comment,
        required this.couponCode,
        required this.currencyCode,
        required this.guestInfo,
        required this.packages,
        required this.token});
  @override
  List<Object?> get props => [
    latitude,
    longitude,
    addressId,
    name,email,contactNumber,
    paymentGateway,
    comment,
    couponCode,
    currencyCode,
    packages,
    token
  ];
}

/// this event is triggered when internet
/// connection is not active

class PlaceOrderConnectionErrorEvent extends PlaceOrderEvent {
  @override
  List<Object?> get props => [];
}
