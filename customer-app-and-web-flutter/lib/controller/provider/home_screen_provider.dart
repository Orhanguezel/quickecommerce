import 'package:flutter/material.dart';

class HomeScreenProvider with ChangeNotifier {
  int _currentIndexHomePage = 0;

  get currentIndexHomePage => _currentIndexHomePage;

  //===========controlling the Company bottom bar===========
  //---------------------------------------------------------
  setCurrentIndexHomePage(int index) {
    _currentIndexHomePage = index;
    notifyListeners();
  }


  int _currentIndex = 0;

  int get currentIndex => _currentIndex;

  void updateIndex(int index) {
    _currentIndex = index;
    notifyListeners();
  }

  String _tabType = "Home";

  String get tabType => _tabType;

  void setTabType(String type) {
    _tabType = type;
      notifyListeners();
  }
  String _drawerType = "Profile";
  String get drawerType => _drawerType;
  void setDrawerTypeType(String type) {
    _drawerType = type;
    notifyListeners();
  }


  String _menuName= "";
  String get menuName => _menuName;
  void setMenuName(String type) {
    if (_menuName != type) {
      _menuName = type;
      Future.microtask(() {
        notifyListeners();
      });
    }
  }
  String _orderId= "";
  String get orderId => _orderId;
  void setOrderId(String type) {
    _orderId = type;
    notifyListeners();
  }

  String _settingsMenuName= "Email";
  String get settingsMenuName => _settingsMenuName;
  void setSettingsMenuName(String type) {
    _settingsMenuName = type;
    notifyListeners();
  }

}
