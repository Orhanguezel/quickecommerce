import 'dart:async';
import 'package:flutter/material.dart';
class ResetPasswordCon with ChangeNotifier{




  String _otpText='';
  bool _validOtp = false;
  bool _openOtpField = false;

  get otpText => _otpText;
  get isValidOtp => _validOtp;
  get isOpenOTPField=> _openOtpField;


  void setOtpFieldTrue(bool otpField){
    _openOtpField=otpField;
    notifyListeners();
  }

  void checkOtp(String userOtp) {
    if ( userOtp.length == 6) {// Check minimum length
      _otpText=userOtp;
      _validOtp = true;
    } else {
      _validOtp = false;
    }
    notifyListeners();
  }




  int _secondsRemaining = 0;
  Timer? _timer;

  int get secondsRemaining => _secondsRemaining;
  String get remainingTime {
    int minutes = _secondsRemaining ~/ 60;
    int seconds = _secondsRemaining % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }
  void startTimer(int seconds) {
    _secondsRemaining = seconds;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        _secondsRemaining--;
        notifyListeners();
      } else {
        _timer!.cancel();
      }
    });
  }

  void stopTimer() {
    _timer?.cancel();
    _secondsRemaining = 0;
    notifyListeners();
  }


  ///this function used for old password hidden
  bool _isOldPasswordHidden = true;
  bool get isOldPasswordHidden => _isOldPasswordHidden;

  void oldPasswordHidden(bool oldPassword) {
    _isOldPasswordHidden = oldPassword;
    notifyListeners();
  }

  ///this function used for Conform password hidden
  bool _isPasswordHidden = true;
  bool get isPasswordHidden => _isPasswordHidden;

  void passwordHidden(bool isPass) {
    _isPasswordHidden = isPass;
    notifyListeners();
  }
  ///this function used for Conform password hidden
  bool _isConfPasswordHidden = true;
  bool get isConfPasswordHidden => _isConfPasswordHidden;

  void confPasswordHidden(bool isPass) {
    _isConfPasswordHidden = isPass;
    notifyListeners();
  }


  ///this function used for Token Field Open
  bool _isTokenFieldOpen = false;
  bool get isTokenFieldOpen => _isTokenFieldOpen;
  void setTokenFieldOpen(bool isToken) {
    _isTokenFieldOpen = isToken;
    notifyListeners();
  }

  ///this function used for Conform password hidden
  bool _isNewEmailFieldOpen = true;
  bool get isNewEmailFieldOpen => _isNewEmailFieldOpen;
  void setNewEmailFieldOpen(bool isToken) {
    _isNewEmailFieldOpen = isToken;
    notifyListeners();
  }
}