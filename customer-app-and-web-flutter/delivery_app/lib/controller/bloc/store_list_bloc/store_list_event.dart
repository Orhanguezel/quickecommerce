
import 'package:equatable/equatable.dart';

abstract class StoreListEvent extends Equatable {
  const StoreListEvent();
}

class StoreList extends StoreListEvent {
  final String storeType,isFeatured,language;
  final bool topRated;
  const StoreList({
    required this.storeType,
    required this.isFeatured,
    required this.topRated,
    required this.language,
  });
  @override
  List<Object?> get props => [];
}



/// this event is triggered when internet
/// connection is not active

class StoreListConnectionErrorEvent extends StoreListEvent {
  @override
  List<Object?> get props => [];
}
