

import 'package:equatable/equatable.dart';

abstract class BrandEvent extends Equatable {
  const BrandEvent();
}

class Brand extends BrandEvent {
  @override
  List<Object?> get props => [];
}




/// this event is triggered when internet
/// connection is not active

class BrandConnectionErrorEvent extends BrandEvent {
  @override
  List<Object?> get props => [];
}
