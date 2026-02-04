
import 'package:equatable/equatable.dart';

abstract class FavoritesEvent extends Equatable {
  const FavoritesEvent();
}

class WishList extends FavoritesEvent {
  final String token;
  const WishList({
    required this.token,
  });
  @override
  List<Object?> get props => [];
}


class StoreType extends FavoritesEvent {
  @override
  List<Object?> get props => [];
}


/// this event is triggered when internet
/// connection is not active

class FavoritesConnectionErrorEvent extends FavoritesEvent {
  @override
  List<Object?> get props => [];
}
