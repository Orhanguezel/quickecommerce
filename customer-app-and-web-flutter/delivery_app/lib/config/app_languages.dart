import 'package:flutter/material.dart';
import 'icons.dart';

class AppLanguages {
  static const List<Locale> supportedLocales = [
    Locale('en'), // English
    Locale('tr'), // Turkish
    Locale('es'), // Spanish
    Locale('ar'), // Arabic
  ];

  static const Locale defaultLocale = Locale('en');

  // Mapping for display names and flags
  static final Map<String, Map<String, String>> languageDetails = {
    'en': {'name': 'English', 'flag': AssetsIcons.usFlag, 'countryCode': 'US'},
    'tr': {'name': 'Turkish', 'flag': AssetsIcons.trFlag, 'countryCode': 'TR'},
    'es': {'name': 'Spanish', 'flag': AssetsIcons.spain, 'countryCode': 'ES'},
    'ar': {'name': 'Arabic', 'flag': AssetsIcons.arFlag, 'countryCode': 'SA'},
  };
}
