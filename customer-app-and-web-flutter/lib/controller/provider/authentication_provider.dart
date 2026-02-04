
import 'package:flutter/material.dart';

class AuthenticationProvider with ChangeNotifier {

  bool _validPassAndCofPass = false;
  bool _validPass = false;
  bool _validCofPass = false;
  bool _validOtp = false;
  bool _loginOtpBox = false;
  bool _validEmail = false;
  String _otpText = '';


  get isValidOtp => _validOtp;
  get otpText => _otpText;
  get loginOtpBox => _loginOtpBox;
  get isValidPassAndCofPass => _validPassAndCofPass;
  get isValidPass => _validPass;
  get isValidCofPass => _validCofPass;
  get isValidEmail => _validEmail;


  /// this function is checking whether the password
  /// is minimum of 3 digit or not. we just have to pass
  /// the [text] (password) as a parameter.

  void checkPassAndConfPass(String password, String conPassword) {
    if (password.length >= 8 &&
        password.length <= 32 &&
        conPassword.length >= 8 &&
        conPassword.length <= 32) {
      // Check minimum length
      if (password == conPassword) {
        // Check if both passwords match
        _validPassAndCofPass = true;
      } else {
        _validPassAndCofPass = false;
      }
    } else {
      _validPassAndCofPass = false;
    }
    notifyListeners();
  }



  void checkPass(String password) {
    if (password.length >= 8 &&
        password.length <= 32) {
      _validPass=true;
    } else {
      _validPass = false;
    }
    notifyListeners();
  }

  void checkConfPass(String conPassword) {
    if (conPassword.length >= 8 &&
        conPassword.length <= 32) {
      _validCofPass = true;
    } else {
      _validCofPass = false;
    }
    notifyListeners();
  }

  void setLoginOTPBox(bool value) {
    _loginOtpBox = value;
    notifyListeners();
  }

  void checkOtp(String userOtp) {
    if (userOtp.length == 6) {
      // Check minimum length
      _otpText = userOtp;
      _validOtp = true;
    } else {
      _validOtp = false;
    }
    notifyListeners();
  }


  /// this function is checking whether given email is valid or not
  /// we used a regular expression for checking the validity
  /// we just have to pass the [email] as parameter.

  void checkEmailValidity(String email) {
    final emailRegex = RegExp(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    bool emailValid = emailRegex.hasMatch(email);
    _validEmail = emailValid;
    notifyListeners(); // Notify listeners for state updates
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
}
