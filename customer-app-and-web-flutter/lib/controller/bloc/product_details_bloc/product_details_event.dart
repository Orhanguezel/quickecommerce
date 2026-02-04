

import 'package:equatable/equatable.dart';

abstract class ProductDetailsEvent extends Equatable {
  const ProductDetailsEvent();
}



class ProductDetails extends ProductDetailsEvent {

  final String slug,language,token;
  const ProductDetails({
    required this.slug,
    required this.language,
    required this.token,
  });
  @override
  List<Object?> get props => [slug,language,token];
}


class TopDealProductDetails extends ProductDetailsEvent {
// String dateFilter,
//       String perPage,
  final String id,categoryId,minPrice, maxPrice,brandId,availability,sort,dateFilter,perPage;
  const TopDealProductDetails({
    required this.id,
    required this.categoryId,
    required this.minPrice,
    required this.maxPrice,
    required this.brandId,
    required this.availability,
    required this.sort,
    required this.dateFilter,
    required this.perPage,
  });
  @override
  List<Object?> get props => [id,categoryId,minPrice, maxPrice,brandId,availability,sort,dateFilter,perPage];
}

/// this event is triggered when internet
/// connection is not active

class ProductDetailsConnectionErrorEvent extends ProductDetailsEvent {
  @override
  List<Object?> get props => [];
}
