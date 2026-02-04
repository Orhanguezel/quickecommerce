
import 'package:equatable/equatable.dart';

abstract class PolicyEvent extends Equatable {
  const PolicyEvent();
}

class PolicyData extends PolicyEvent {
 final String base,language, token;
  const PolicyData({
    required this.base,
    required this.language,
    required this.token,
  });
  @override
  List<Object?> get props => [base,language, token];
}


/// this event is triggered when internet
/// connection is not active

class PolicyConnectionErrorEvent extends PolicyEvent {
  @override
  List<Object?> get props => [];
}
