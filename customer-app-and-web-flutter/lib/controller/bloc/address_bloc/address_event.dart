import 'package:equatable/equatable.dart';

abstract class AddressEvent extends Equatable {
  const AddressEvent();
}

class AddDAddress extends AddressEvent {
  final String title,
      type,
      email,
      contactNumber,
      address,
      latitude,
      longitude,
      road,
      house,
      floor,
      postalCode,
      token;
  final int status, areaId;
  final bool isDefault;
  const AddDAddress(
      {required this.title,
      required this.type,
      required this.email,
      required this.contactNumber,
      required this.address,
      required this.latitude,
      required this.longitude,
      required this.areaId,
      required this.road,
      required this.house,
      required this.floor,
      required this.postalCode,
      required this.isDefault,
      required this.status,
      required this.token});
  @override
  List<Object?> get props => [
        title,
        type,
        contactNumber,
        address,
        latitude,
        longitude,
        areaId,
        road,
        house,
        floor,
        postalCode,
        isDefault,
        status,
        token
      ];
}

class UpdateDAddress extends AddressEvent {
  final String id,
      title,
      type,
      email,
      contactNumber,
      address,
      latitude,
      longitude,
      road,
      house,
      floor,
      postalCode,
      token;
  final int status;
  final bool isDefault;
  const UpdateDAddress(
      {required this.id,
      required this.title,
      required this.type,
      required this.email,
      required this.contactNumber,
      required this.address,
      required this.latitude,
      required this.longitude,
      required this.road,
      required this.house,
      required this.floor,
      required this.postalCode,
      required this.isDefault,
      required this.status,
      required this.token});
  @override
  List<Object?> get props => [
        id,
        title,
        type,
    email,
        contactNumber,
        address,
        latitude,
        longitude,
        road,
        house,
        floor,
        postalCode,
        isDefault,
        status,
        token
      ];
}

class DeleteAddress extends AddressEvent {
  final String id, token;
  const DeleteAddress({required this.id, required this.token});
  @override
  List<Object?> get props => [id, token];
}

/// this event is triggered when internet
/// connection is not active

class AddressConnectionErrorEvent extends AddressEvent {
  @override
  List<Object?> get props => [];
}
