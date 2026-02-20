
import 'package:equatable/equatable.dart';

abstract class BannerEvent extends Equatable {
  const BannerEvent();
}

class BannerList extends BannerEvent {
  final String language;
  const BannerList({
    required this.language,
  });
  @override
  List<Object?> get props => [language];
}


/// this event is triggered when internet
/// connection is not active

class MoveToLoveConnectionErrorEvent extends BannerEvent {
  @override
  List<Object?> get props => [];
}
