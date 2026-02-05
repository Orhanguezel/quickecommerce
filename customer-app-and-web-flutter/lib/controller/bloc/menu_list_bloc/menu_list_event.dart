import 'package:equatable/equatable.dart';

abstract class MenuListEvent extends Equatable {
  const MenuListEvent();

  @override
  List<Object?> get props => [];
}

class MenuList extends MenuListEvent {
  final String language;
  const MenuList({required this.language});

  @override
  List<Object?> get props => [language];
}

class MenuListConnectionErrorEvent extends MenuListEvent {}
