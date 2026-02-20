
import 'package:equatable/equatable.dart';

abstract class ProductSuggestionEvent extends Equatable {
  const ProductSuggestionEvent();
}



class CategoriesList extends ProductSuggestionEvent {

  final String limit, language,searchKey, sortField,sort;
  final bool all;
  const CategoriesList({
    required this.limit,
    required this.language,
    required this.searchKey,
    required this.sortField,
    required this.sort,
    required this.all,

  });
  @override
  List<Object?> get props => [limit, language, searchKey, sortField,sort,all];
}
/// this event is triggered when internet
/// connection is not active

class ProductSuggestionConnectionErrorEvent extends ProductSuggestionEvent {
  @override
  List<Object?> get props => [];
}
