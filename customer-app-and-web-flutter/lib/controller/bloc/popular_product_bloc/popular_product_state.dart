
import 'package:equatable/equatable.dart';
import '../../../data/data_model/popular_products_model.dart';


abstract class PopularProductState extends Equatable {
  const PopularProductState();
}

class  PopularProductInitial extends PopularProductState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class PopularProductLoading extends PopularProductState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class PopularProductLoaded extends PopularProductState{
  final PopularProductsModel popularProductsModel;
  final bool hasConnectionError;
  const PopularProductLoaded({
    required this.popularProductsModel,
  this.hasConnectionError=false
  });
  @override
  List<Object?> get props => [popularProductsModel];

}

/// this state represents user has no internet

class PopularProductConnectionError extends PopularProductState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class PopularProductFailure extends PopularProductState {
  final PopularProductsModel popularProductsModel;
  const PopularProductFailure({required this.popularProductsModel});
  @override
  List<Object?> get props => [popularProductsModel];
}