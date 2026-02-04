import 'package:equatable/equatable.dart';

abstract class FavoriteAddEvent extends Equatable {
  const FavoriteAddEvent();
}

class AddFavorites extends FavoriteAddEvent {
  final String productId, token;
  // final File  image;
  const AddFavorites({required this.productId, required this.token});
  @override
  List<Object?> get props => [productId, token];
}

class DeleteFavorites extends FavoriteAddEvent {
  final String productId, token;
  // final File  image;
  const DeleteFavorites({required this.productId, required this.token});
  @override
  List<Object?> get props => [productId, token];
}

/// this event is triggered when internet
/// connection is not active

class FavoriteAddConnectionErrorEvent extends FavoriteAddEvent {
  @override
  List<Object?> get props => [];
}
