import 'package:flutter/material.dart';
import 'package:quick_ecommerce/thyme/dark_theme.dart';
import 'package:quick_ecommerce/thyme/light_theme.dart';

import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';


class ThemeProvider extends ChangeNotifier {
  ThemeData _themeData;

  ThemeProvider(this._themeData);

  ThemeData getTheme() => _themeData;
  String _themeMode = 'light';
  String get themeMode => _themeMode;
  // Function to save the selected theme to SharedPreferences
  Future<void> saveThemeData(ThemeData themeData) async {
    _themeData = themeData;
    _themeMode= _themeData.brightness == Brightness.dark ? "dark" : "light";
    notifyListeners();

    // Save the selected theme to SharedPreferences
    await UserSharedPreference.putValue(
        SharedPreferenceHelper.theme,
        _themeData.brightness == Brightness.dark ? "dark" : "light"
    );

  }

  // Function to retrieve the selected theme from SharedPreferences
  Future<void> loadThemeData() async {
    // get the selected theme to SharedPreferences
    var theme = await UserSharedPreference.getValue(
      SharedPreferenceHelper.theme,
    );
    _themeMode = theme ?? 'light';
    _themeData = theme == 'dark' ?  DarkTheme.dark : LightTheme.light;
    notifyListeners();
  }



// language controler

  Locale _appLocale = const Locale("en");

  Locale get appLocale => _appLocale;


  fetchLocale() async {
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    if (language == null) {
      _appLocale = const Locale('en');
      return null;
    }
    String local = language;
    _appLocale = Locale(local.toString());
    return null;
  }

  Future<void> changeLanguage(Locale type) async {
    if (_appLocale.languageCode == type.languageCode) return;
    // set new locale
    _appLocale = Locale(type.languageCode);
    // save language code & country code to shared preferences
    await UserSharedPreference.putValue(
      SharedPreferenceHelper.languageCode,
      type.languageCode,
    );
    notifyListeners();
  }


}