import 'package:equatable/equatable.dart';

abstract class AllProductEvent extends Equatable {
  const AllProductEvent();
}

class AllProduct extends AllProductEvent {

  final String search, perPage, minPrice, maxPrice,
      availability,sort,minRating, language,userLat, userLong,token;
  final List categoryId,brandId,type;
  final int  page,flashSaleId;
  final bool isFeatured, bestSelling, popularProducts, flashSale;

  const AllProduct({
    required this.categoryId,
    required this.search,
    required this.perPage,
    required this.page,
    required this.minPrice,
    required this.maxPrice,
    required this.brandId,
    required this.availability,
    required this.sort,
    required this.type,
    required this.minRating,
    required this.language,
    required this.isFeatured,
    required this.bestSelling,
    required this.popularProducts,
    required this.flashSale,
    required this.flashSaleId,
    required this.userLat,
    required this.userLong,
    required this.token,
  });
  @override
  List<Object?> get props => [
        categoryId,
         search,
        perPage,
        minPrice,
        maxPrice,
        brandId,
        availability,
        sort,
        type,
    minRating,
    userLat,
    userLong
    ,token
      ];
}

/// this event is triggered when internet
/// connection is not active

class SaveConnectionErrorEvent extends AllProductEvent {
  @override
  List<Object?> get props => [];
}
