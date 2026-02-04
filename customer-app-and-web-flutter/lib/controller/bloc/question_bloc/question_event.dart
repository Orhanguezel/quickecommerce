
import 'package:equatable/equatable.dart';

abstract class QuestionEvent extends Equatable {
  const QuestionEvent();
}

class QuestionDadaEvent extends QuestionEvent {

  final String productId, search,perPage;
  const QuestionDadaEvent({
    required this.productId,
    required this.search,
    required this.perPage,

  });
  @override
  List<Object?> get props => [productId,search, perPage];
}

/// this event is triggered when internet
/// connection is not active

class QuestionConnectionErrorEvent extends QuestionEvent {
  @override
  List<Object?> get props => [];
}
