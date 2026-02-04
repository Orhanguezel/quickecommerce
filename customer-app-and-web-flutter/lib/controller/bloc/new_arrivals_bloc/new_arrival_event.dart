

import 'package:equatable/equatable.dart';

abstract class NewArrivalEvent extends Equatable {
  const NewArrivalEvent();
}

class NewArrival extends NewArrivalEvent {
  final String categoryId, minPrice,maxPrice, availability,perPage,language,userLat, userLong,token;
  const NewArrival({
    required this.categoryId,
    required this.minPrice,
    required this.maxPrice,
    required this.availability,
    required this.perPage,
    required this.language,
    required this.userLat,
    required this.userLong,
    required this.token,

  });
  @override
  List<Object?> get props => [categoryId,minPrice, maxPrice, availability, perPage,language,userLat, userLong,token];
}


/// this event is triggered when internet
/// connection is not active

class NewArrivalConnectionErrorEvent extends NewArrivalEvent {
  @override
  List<Object?> get props => [];
}
