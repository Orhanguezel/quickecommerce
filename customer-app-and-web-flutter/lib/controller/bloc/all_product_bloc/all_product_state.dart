
import 'package:equatable/equatable.dart';
import '../../../data/data_model/all_product_model.dart';



abstract class AllProductState extends Equatable {
  const AllProductState();
}

class AllProductInitial extends AllProductState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class AllProductLoading extends AllProductState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class AllProductLoaded extends AllProductState{
  final AllProductModel allProductModel;
  final bool hasConnectionError;
  const AllProductLoaded({
    required this.allProductModel,
     this.hasConnectionError=false,
  });
  @override
  List<Object?> get props => [allProductModel];

}

/// this state represents user has no internet

class AllProductConnectionError extends AllProductState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class AllProductFailure extends AllProductState {
  final AllProductModel allProductModel;
  const AllProductFailure({required this.allProductModel});
  @override
  List<Object?> get props => [allProductModel];
}