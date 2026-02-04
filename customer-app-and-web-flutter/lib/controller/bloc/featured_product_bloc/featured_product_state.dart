
import 'package:equatable/equatable.dart';
import '../../../data/data_model/featured_product_model.dart';

abstract class FeaturedProductState extends Equatable {
  const FeaturedProductState();
}

class FeaturedProductInitial extends FeaturedProductState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class FeaturedProductLoading extends FeaturedProductState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class FeaturedProductLoaded extends FeaturedProductState{
  final FeaturedProductModel featuredProductModel;
  final bool hasConnectionError;
  const FeaturedProductLoaded({
    required this.featuredProductModel,
  this.hasConnectionError=false
  });
  @override
  List<Object?> get props => [featuredProductModel];

}

/// this state represents user has no internet

class FeaturedProductConnectionError extends FeaturedProductState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class FeaturedProductFailure extends FeaturedProductState {
  final FeaturedProductModel featuredProductModel;
  const FeaturedProductFailure({required this.featuredProductModel});
  @override
  List<Object?> get props => [featuredProductModel];
}