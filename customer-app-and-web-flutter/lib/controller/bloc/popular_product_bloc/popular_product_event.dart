

import 'package:equatable/equatable.dart';

abstract class PopularProductEvent extends Equatable {
  const PopularProductEvent();
}

class PopularProduct extends PopularProductEvent {

  final String id,categoryId, perPage,brandId,language,userLat, userLong,token;
  const PopularProduct({
    required this.id,
    required this.categoryId,
    required this.perPage,
    required this.brandId,
    required this.language,
    required this.userLat,
    required this.userLong,
    required this.token,
  });
  @override
  List<Object?> get props => [id,categoryId, perPage,brandId,language,userLat, userLong,token];
}

/// this event is triggered when internet
/// connection is not active

class SaveConnectionErrorEvent extends PopularProductEvent {
  @override
  List<Object?> get props => [];
}
