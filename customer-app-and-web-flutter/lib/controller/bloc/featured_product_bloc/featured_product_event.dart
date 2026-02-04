

import 'package:equatable/equatable.dart';

abstract class FeaturedProductEvent extends Equatable {
  const FeaturedProductEvent();
}

class FeaturedProduct extends FeaturedProductEvent {

  final String perPage,language,userLat, userLong,token;
  const FeaturedProduct({
    required this.perPage,
    required this.language,
    required this.userLat,
    required this.userLong,
    required this.token,
  });
  @override
  List<Object?> get props => [ perPage,language,userLat, userLong,token];
}

/// this event is triggered when internet
/// connection is not active

class FeaturedConnectionErrorEvent extends FeaturedProductEvent {
  @override
  List<Object?> get props => [];
}
