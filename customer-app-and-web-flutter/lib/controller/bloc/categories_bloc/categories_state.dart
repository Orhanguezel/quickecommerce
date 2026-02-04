
import 'package:equatable/equatable.dart';

import '../../../data/data_model/categories_model.dart';


abstract class CategoriesState extends Equatable {
  const CategoriesState();
}

class CategoriesInitial extends CategoriesState {
  @override
  List<Object> get props => [];
}

/// this state represents a loading state
/// the data user looking for is being loaded

class CategoriesLoading extends CategoriesState {
  @override
  List<Object> get props => [];
}


/// this state represents a successful state
/// it will take [AuthenticationModel] to show user
/// the required data

class CategoriesLoaded extends CategoriesState{
  final CategoryModel categoryModel;
  final bool hasConnectionError;
  const CategoriesLoaded({required this.categoryModel,this.hasConnectionError=false});
  @override
  List<Object?> get props => [categoryModel];

}

/// this state represents user has no internet

class CategoriesConnectionError extends CategoriesState {
  @override
  List<Object?> get props => [];
}

/// this state represents that something is wrong
/// it will take [AuthenticationModel] to show user
/// why the error occurred

class CategoriesFailure extends CategoriesState {
  final CategoryModel categoryModel;
  const CategoriesFailure({required this.categoryModel});
  @override
  List<Object?> get props => [categoryModel];
}