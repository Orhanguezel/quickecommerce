

import 'package:equatable/equatable.dart';

abstract class GeneralInfoEvent extends Equatable {
  const GeneralInfoEvent();
}

class GeneralInfoDataEvent extends GeneralInfoEvent {
  @override
  List<Object?> get props => [];
}

class CouponDataEvent extends GeneralInfoEvent {
  final String searchKey, discountType,language,token;
 final bool expireSoon,newest;
 final int page;
  const CouponDataEvent({
    required this.searchKey,
    required this.discountType,
    required this.expireSoon,
    required this.newest,
    required this.page,
    required this.language,
    required this.token,
  });
  @override
  List<Object?> get props => [searchKey, discountType,expireSoon,newest,language,token];
}


/// this event is triggered when internet
/// connection is not active

class GeneralInfoConnectionErrorEvent extends GeneralInfoEvent {
  @override
  List<Object?> get props => [];
}
