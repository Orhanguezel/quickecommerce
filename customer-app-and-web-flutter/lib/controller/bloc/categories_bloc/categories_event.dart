

import 'package:equatable/equatable.dart';

abstract class CategoriesEvent extends Equatable {
  const CategoriesEvent();
}

class Categories extends CategoriesEvent {

  final String limit, language,searchKey, sortField,sort;
  final bool all;
  const Categories({
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

class SaveConnectionErrorEvent extends CategoriesEvent {
  @override
  List<Object?> get props => [];
}
