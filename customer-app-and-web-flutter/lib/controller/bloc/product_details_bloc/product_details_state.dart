
import 'package:equatable/equatable.dart';
import '../../../data/data_model/product_details_model.dart';



abstract class ProductDetailsState extends Equatable {
  const ProductDetailsState();
}

class ProductDetailsInitial extends ProductDetailsState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class ProductDetailsLoading extends ProductDetailsState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class ProductDetailsLoaded extends ProductDetailsState{
  final ProductDetailsModel productDetailsModel;
  final bool hasConnectionError;
  const ProductDetailsLoaded({required this.productDetailsModel,
    this.hasConnectionError = false,});
  @override
  List<Object?> get props => [productDetailsModel];

}

/// this state represents user has no internet

class ProductDetailsConnectionError extends ProductDetailsState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class ProductDetailsFailure extends ProductDetailsState {
  final ProductDetailsModel productDetailsModel;
  const ProductDetailsFailure({required this.productDetailsModel});
  @override
  List<Object?> get props => [productDetailsModel];
}