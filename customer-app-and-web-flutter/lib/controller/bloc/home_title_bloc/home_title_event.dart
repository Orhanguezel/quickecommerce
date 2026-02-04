
import 'package:equatable/equatable.dart';

abstract class HomeTitleEvent extends Equatable {
  const HomeTitleEvent();
}

class HomeTitleDataEvent extends HomeTitleEvent {
  @override
  List<Object?> get props => [];
}



/// this event is triggered when internet
/// connection is not active

class HomeTitleConnectionErrorEvent extends HomeTitleEvent {
  @override
  List<Object?> get props => [];
}
