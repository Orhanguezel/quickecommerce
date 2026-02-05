import 'package:equatable/equatable.dart';
import '../../../data/data_model/menu_model.dart';

abstract class MenuListState extends Equatable {
  const MenuListState();

  @override
  List<Object?> get props => [];
}

class MenuListInitial extends MenuListState {}

class MenuListLoading extends MenuListState {}

class MenuListLoaded extends MenuListState {
  final MenuListModel menuListModel;
  final bool hasConnectionError;

  const MenuListLoaded({
    required this.menuListModel,
    this.hasConnectionError = false,
  });

  @override
  List<Object?> get props => [menuListModel, hasConnectionError];
}

class MenuListConnectionError extends MenuListState {}

class MenuListFailure extends MenuListState {
  final MenuListModel menuListModel;
  const MenuListFailure({required this.menuListModel});

  @override
  List<Object?> get props => [menuListModel];
}
