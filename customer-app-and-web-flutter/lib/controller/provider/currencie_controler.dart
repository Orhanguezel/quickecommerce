import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:quick_ecommerce/config/strings.dart';
import 'package:quick_ecommerce/data/data_model/currency_list_model.dart';

class CurrencyController with ChangeNotifier{




  final List<CurrencyData> _currencies = [];
  // Getter
  List<CurrencyData> get currencies => _currencies;

  // Add function
  void addCurrency(List<CurrencyData> currency) {
    _currencies.addAll(currency);
    notifyListeners();
  }

  // clear all
  void clearCurrencies() {
    _currencies.clear();
    notifyListeners();
  }


  loadCurrency(String currenciesCode){
    for(var currencies in _currencies){
      if(currencies.value==currenciesCode){
        _currencyCode=currencies.value;
         _currencyLabel =currencies.label;
         _currencySymbol =currencies.symbol;
         _exchangeRate = Utils.formatDouble(currencies.exchangeRate);
      }else{
        break;
      }
    }
  }

  String _currencyCode = "USD";
  String _currencyLabel = "USD (\$)";
  String _currencySymbol = "\$";
  double _exchangeRate = 1.0;
  get currencyCode => _currencyCode;
  get currencyLabel => _currencyLabel;
  get currencySymbol => _currencySymbol;
  double get exchangeRate => _exchangeRate;
  void setCurrencyCode(String currencyLabel,String currencyCode,String symbol,double exchangeRate){
    _currencyLabel=currencyLabel;
    _currencyCode=currencyCode;
    _currencySymbol=symbol;
    _exchangeRate=exchangeRate;
    notifyListeners();
  }







  String _symbolPosition = "";
  String _decimalPoint = "YES";
  String _commaAdjustment = "";
  String get  decimalPoint=>_decimalPoint;
  get symbolPosition => _symbolPosition;
  void setCurrencySymbol(String position,String decimalPoint,String commaAdjustment) {
    _symbolPosition = position;
    _decimalPoint = decimalPoint;
    _commaAdjustment = commaAdjustment;
    notifyListeners();
  }


  String formatCurrency(String amount) {
    final double parsedAmount = double.tryParse(amount) ?? 0.0;
    final double exchangedAmount = parsedAmount * _exchangeRate;
    // Build pattern dynamically
    final base = _commaAdjustment == "YES" ? "#,##0" : "0";
    final pattern = _decimalPoint == "YES" ? "$base.00" : base;
    final formattedAmount = NumberFormat(pattern).format(exchangedAmount);
    return symbolPosition == "left"
        ? "$_currencySymbol $formattedAmount"
        : "$formattedAmount $_currencySymbol";
  }


}