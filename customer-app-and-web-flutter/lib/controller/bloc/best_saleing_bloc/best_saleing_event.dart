
import 'package:equatable/equatable.dart';

abstract class BestSaleEvent extends Equatable {
  const BestSaleEvent();
}

class BestSale extends BestSaleEvent {

  final String id,categoryId, brandId,limit,language, userLat, userLong,token;
  const BestSale({
    required this.id,
    required this.categoryId,
    required this.brandId,
    required this.limit,
    required this.language,
    required this.userLat,
    required this.userLong,
    required this.token,

  });
  @override
  List<Object?> get props => [id,categoryId, brandId,limit,language,userLat, userLong,token];
}


/// this event is triggered when internet
/// connection is not active

class MoveToLoveConnectionErrorEvent extends BestSaleEvent {
  @override
  List<Object?> get props => [];
}
