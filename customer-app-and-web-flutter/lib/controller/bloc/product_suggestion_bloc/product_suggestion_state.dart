import 'package:equatable/equatable.dart';
import '../../../data/data_model/categories_model.dart';
import '../../../data/data_model/product_suggestion.dart';


abstract class ProductSuggestionState extends Equatable {
  const ProductSuggestionState();
}

class ProductSuggestionInitial extends ProductSuggestionState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class ProductSuggestionLoading extends ProductSuggestionState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class ProductSuggestionLoaded extends ProductSuggestionState{
  final ProductSuggestionModel productSuggestionModel;
  const ProductSuggestionLoaded({required this.productSuggestionModel});
  @override
  List<Object?> get props => [productSuggestionModel];
}



class CategoriesListLoaded extends ProductSuggestionState{
  final CategoryModel categoryModel;
  const CategoriesListLoaded({required this.categoryModel});
  @override
  List<Object?> get props => [categoryModel];
}
/// this state represents user has no internet

class ProductSuggestionConnectionError extends ProductSuggestionState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class ProductSuggestionFailure extends ProductSuggestionState {
  final ProductSuggestionModel productSuggestionModel;
  const ProductSuggestionFailure({required this.productSuggestionModel});
  @override
  List<Object?> get props => [productSuggestionModel];
}