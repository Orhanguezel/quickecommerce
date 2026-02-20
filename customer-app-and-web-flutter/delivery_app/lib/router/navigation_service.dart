import 'package:flutter/material.dart';

//============ this is global navigator key ================
//----------------------------------------------------------
class NavigationService with ChangeNotifier{
  static GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
}