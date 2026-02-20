import 'package:flutter/material.dart';
import 'package:quick_ecommerce/data/data_model/payment_gateways_model.dart';

class PaymentOptionCon with ChangeNotifier{

  final List<PaymentGateway> _paymentGateways = [];
  List<PaymentGateway> get paymentGateways => _paymentGateways;
  bool _isCashOnDeliveryActive = false;
  bool get isCashOnDeliveryActive => _isCashOnDeliveryActive;
  void addPaymentGateway(List<PaymentGateway> gateways) {
    // Clear existing gateways if needed
    _paymentGateways.clear();

    // Check for "Cash On Delivery"
    final hasCashOnDelivery = gateways.any((g) => g.name == "Cash On Delivery");

    // Set the flag
    _isCashOnDeliveryActive = hasCashOnDelivery;

    // Filter out "Cash On Delivery" from the list
    final filteredGateways = gateways
        .where((g) => g.name != "Cash On Delivery")
        .toList();

    // Add filtered gateways to the list
    _paymentGateways.addAll(filteredGateways);

    notifyListeners();
  }


  String _selectedPaymentType = '';
  String get selectedPaymentType => _selectedPaymentType;
  void setPaymentType(String type) {
    _selectedPaymentType = type;
    notifyListeners();
  }



  bool _isWalletActive = false;
  bool get isWalletActive => _isWalletActive;
  void setWalletActive(bool value) {
    _isWalletActive = value;
    notifyListeners();
  }
  double _walletBalance = 0;
  double get walletBalance => _walletBalance;
  void setWalletBalance(double balance) {
    _walletBalance = balance;
    Future.microtask(() {
      notifyListeners();
    });
  }



  int _walletHistoryId= -1;
  int get walletHistoryId => _walletHistoryId;
  void setWalletHistoryId(int id) {
    _walletHistoryId = id;
    Future.microtask(() {
      notifyListeners();
    });
  }




}