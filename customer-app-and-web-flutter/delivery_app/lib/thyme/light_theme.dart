import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:quick_ecommerce/config/colors.dart';
import 'package:quick_ecommerce/config/text_styles.dart';

class LightTheme{
  static ThemeData light = ThemeData(
      indicatorColor: CustomColors.baseColor,
      canvasColor:const Color(0xFFFFFFFF) ,
      ///use oll border
      focusColor: Colors.black,
      disabledColor: CustomColors.baseColor,
      brightness: Brightness.light,
      primarySwatch: Colors.green,
      cardColor: const Color(0xFFFFFFFF),
      dividerColor: const Color(0xFFECEEEF),
      scaffoldBackgroundColor:const Color(0xfffbfcfd),
      colorScheme: const ColorScheme.light(
        brightness: Brightness.light,
        primary: CustomColors.baseColor,
        onPrimary:CustomColors.grey ,
        primaryContainer: Colors.blueGrey,
        onPrimaryContainer:Colors.green,
        secondaryContainer:Colors.greenAccent,
        onSecondaryContainer: Colors.cyan,
        surface: CustomColors.black,
        onSurface: CustomColors.appWhite,
      ),
      sliderTheme: const SliderThemeData(
        valueIndicatorColor: Colors.white, // Background of the label
        valueIndicatorTextStyle: TextStyle(
          color: Colors.black, // Label text color
          fontWeight: FontWeight.bold,
        ),
        activeTrackColor: CustomColors.baseColor,
        inactiveTrackColor:Color(0x4D1A73E8),
      ),

      appBarTheme:  AppBarTheme(
        backgroundColor: CustomColors.baseColor,
        titleTextStyle: CustomTextStyles.mediumText(22.sp,color: Colors.white),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      iconTheme: const IconThemeData(
        color: Colors.black,
      ),
      datePickerTheme:  DatePickerThemeData(
        backgroundColor: const Color(0xFFFFFFFF),
        elevation: 6,
        shadowColor: const Color(0xfffffff1),
        surfaceTintColor: const Color(0xFFFFFFFF),
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.r)
        ),
        headerBackgroundColor: const Color(0xfffffff3),
        headerForegroundColor: const Color(0xFF12408F),
        headerHeadlineStyle: const TextStyle(fontSize: 10),
        headerHelpStyle: const TextStyle(fontSize: 11),
        weekdayStyle: const TextStyle(fontSize: 12),
        dayStyle: const TextStyle(fontSize: 13),
      ),
      inputDecorationTheme:  InputDecorationTheme(
        labelStyle: CustomTextStyles.regularText(12.sp, color: Colors.black),
        hintStyle: CustomTextStyles.mediumText(14.sp, color: Colors.black),
        counterStyle: CustomTextStyles.mediumText(14.sp, color: Colors.black),
        focusColor: Colors.black,
        hoverColor: Colors.white,
        fillColor: const Color(0xFFFFFFFF),
      ),
      navigationBarTheme: const NavigationBarThemeData(
          backgroundColor: CustomColors.baseColor),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor:  Color(0xFFFFFFFF),
          selectedItemColor: Colors.white,
          unselectedItemColor: Colors.black),

      textTheme: TextTheme(
        titleLarge: CustomTextStyles.boldText(22.sp, color: const Color(0xFFFFFFFF)),
        titleMedium: CustomTextStyles.boldText(14.sp, color: Colors.white),
        titleSmall: CustomTextStyles.regularText(14.sp, color: Colors.white),
        bodyLarge: CustomTextStyles.boldText(16.sp, color:const Color(0xFF222222)),
        bodyMedium: CustomTextStyles.mediumText(16.sp, color:const Color(0xFF222222)),
        bodySmall: CustomTextStyles.regularText(16.sp, color: Colors.black),
        displayLarge: CustomTextStyles.boldText(14.sp, color: const Color(0xFF6F6F6F)),
        displayMedium: CustomTextStyles.mediumText(14.sp, color:CustomColors.baseColor),
        displaySmall: CustomTextStyles.regularText(12.sp, color: Colors.black),
        labelLarge: CustomTextStyles.boldText(12.sp, color:const Color(0xFF00A537)),
        labelMedium: CustomTextStyles.mediumText(12.sp, color: Colors.black),
        labelSmall: CustomTextStyles.regularText(12.sp, color: Colors.black),
        headlineLarge: CustomTextStyles.boldText(20.sp, color: const Color(0xFF10458B)),
        headlineMedium: CustomTextStyles.boldText(18.sp, color: const Color(0xFF1A73E8)),
        headlineSmall: CustomTextStyles.boldText(16.sp, color: const Color(0xFF4F547B)),
      )).
  copyWith(
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: <TargetPlatform, PageTransitionsBuilder>{
          TargetPlatform.android: OpenUpwardsPageTransitionsBuilder(),
          TargetPlatform.linux: OpenUpwardsPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: CustomColors.baseColor,
        foregroundColor: CustomColors.baseColor,
      )
  );
}