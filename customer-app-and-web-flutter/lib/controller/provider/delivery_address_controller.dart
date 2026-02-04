import 'package:flutter/cupertino.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';


class DeliveryAddressController extends ChangeNotifier{
  String _selectedAddressType = 'Home';
  String get selectedAddressType => _selectedAddressType;

  void setAddressType(String option) {
    _selectedAddressType = option;
    notifyListeners();
  }
   LatLng _initialPosition =  const LatLng(23.8103, 90.4125);
  LatLng get initialPosition => _initialPosition;
  bool _isLocationSet = false;
  bool get isLocationSet => _isLocationSet;
  void setLatLong(LatLng initialPosition,bool location ) {
    _initialPosition = initialPosition;
    _isLocationSet=location;
    notifyListeners();
  }
  void clearIsLocationSet(){
    _isLocationSet = false;
    _initialPosition=const LatLng(23.8103, 90.4125);
    notifyListeners();
  }

  String _selectedAddress = '';
  String get selectedAddress => _selectedAddress;
  void setAddress(String address) {
    _selectedAddress = address;
    notifyListeners();
  }
}


