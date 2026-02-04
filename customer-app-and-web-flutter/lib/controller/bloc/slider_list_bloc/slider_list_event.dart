
import 'package:equatable/equatable.dart';

abstract class SliderListEvent extends Equatable {
  const SliderListEvent();
}

class SliderList extends SliderListEvent {
  final String language;
  const SliderList({
    required this.language,
  });
  @override
  List<Object?> get props => [];
}


/// this event is triggered when internet
/// connection is not active

class SliderListConnectionErrorEvent extends SliderListEvent {
  @override
  List<Object?> get props => [];
}
