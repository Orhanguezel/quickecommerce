import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:quick_ecommerce/config/colors.dart';
import 'package:quick_ecommerce/config/text_styles.dart';

class DarkTheme{

  static ThemeData dark = ThemeData(
      indicatorColor: CustomColors.appWhite,
      canvasColor:const Color(0xFF152841 ) ,
      ///use oll border
      focusColor: Colors.white,
      disabledColor: Colors.black,
      dividerColor: const Color(0xFF35485B),
      brightness: Brightness.dark,
      cardColor: const Color(0xFF152943),
      primarySwatch: Colors.blue,
      scaffoldBackgroundColor:const Color(0xFF09111A),
      colorScheme:  const ColorScheme.dark(
        brightness: Brightness.dark,
        primary: CustomColors.grey,
        onPrimary:CustomColors.grey ,
        primaryContainer: Colors.yellow,
        onPrimaryContainer: Colors.black,
        secondaryContainer: CustomColors.grey,
        onSecondaryContainer:Colors.pinkAccent,
        surface: CustomColors.black,
        onSurface: CustomColors.appWhite,
      ),
      appBarTheme:  AppBarTheme(
        backgroundColor: CustomColors.baseColor,
        titleTextStyle: CustomTextStyles.boldText(22.sp,color: CustomColors.appWhite),
        iconTheme: const IconThemeData(color: CustomColors.appWhite),
      ),
      sliderTheme: const SliderThemeData(
        valueIndicatorColor:CustomColors.appWhite,
        valueIndicatorTextStyle: TextStyle(
          color: Colors.black, // Label text color
          fontWeight: FontWeight.bold,
        ),
        activeTrackColor: CustomColors.baseColor,
        inactiveTrackColor: Color(0x4D1A73E8),
      ),
      datePickerTheme:  DatePickerThemeData(
        backgroundColor: const Color(0xFF202122),
        elevation: 6,
        shadowColor:CustomColors.appWhite,
        surfaceTintColor:CustomColors.appWhite,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.r)
        ),

        dayStyle: const TextStyle(fontSize: 13),
        todayBorder: const BorderSide(width:0),
      ),

      iconTheme: const IconThemeData(
        color: Colors.black,
      ),
      inputDecorationTheme:  InputDecorationTheme(
        labelStyle: CustomTextStyles.regularText(12.sp, color: CustomColors.appWhite),
        hintStyle: CustomTextStyles.mediumText(14.sp, color: CustomColors.appWhite),
        counterStyle: CustomTextStyles.mediumText(14.sp, color:CustomColors.appWhite),
        focusColor:CustomColors.appWhite,
        hoverColor: CustomColors.appWhite,
      ),
      navigationBarTheme:
      const NavigationBarThemeData(backgroundColor: Colors.black),
      bottomNavigationBarTheme:  BottomNavigationBarThemeData(
          backgroundColor: Colors.black,
          selectedLabelStyle: CustomTextStyles.boldText(12.sp,
              color: const Color(0xFF112864)),
          selectedItemColor:CustomColors.appWhite,
          unselectedItemColor: Colors.grey),

      textSelectionTheme: const TextSelectionThemeData(
        selectionColor:CustomColors.baseColor,
        cursorColor: Colors.red,
        selectionHandleColor: CustomColors.baseColor,
      ),
      textTheme: TextTheme(
        ///title for appBar
        titleLarge: CustomTextStyles.boldText(22.sp, color:CustomColors.appWhite),
        titleMedium: CustomTextStyles.boldText(14.sp, color:CustomColors.appWhite),
        titleSmall: CustomTextStyles.regularText(14.sp, color:CustomColors.appWhite),

        bodyLarge: CustomTextStyles.boldText(16.sp, color:CustomColors.appWhite),
        bodyMedium: CustomTextStyles.mediumText(16.sp, color:CustomColors.appWhite),
        bodySmall: CustomTextStyles.regularText(16.sp, color:CustomColors.appWhite),

        displayLarge: CustomTextStyles.boldText(14.sp, color:CustomColors.appWhite),
        displayMedium: CustomTextStyles.mediumText(14.sp, color:CustomColors.baseColor),
        displaySmall: CustomTextStyles.regularText(12.sp, color:CustomColors.appWhite),

        labelLarge: CustomTextStyles.boldText(12.sp, color:CustomColors.primaryGreen),
        labelMedium: CustomTextStyles.mediumText(12.sp, color:CustomColors.appWhite),
        labelSmall: CustomTextStyles.regularText(12.sp, color:CustomColors.appWhite),
        headlineLarge: CustomTextStyles.boldText(20.sp, color:CustomColors.baseColor),
        headlineMedium: CustomTextStyles.boldText(18.sp, color:CustomColors.appWhite),
        headlineSmall: CustomTextStyles.boldText(16.sp, color:CustomColors.appWhite),
      )).copyWith(
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