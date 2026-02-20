import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class NotificationController with ChangeNotifier {
  int _unreadCount = 0;

  int get unreadCount => _unreadCount;

  NotificationController() {
    loadCount();
  }

  void increment() {
    _unreadCount++;
    saveCount();
    notifyListeners();
  }
  void setUnreadCount(int count) {
    _unreadCount=count;
    notifyListeners();
  }

  void reset() {
    _unreadCount = 0;
    saveCount();
    notifyListeners();
  }

  void saveCount() async {
    final prefs = await SharedPreferences.getInstance();
    prefs.setInt('unread_count', _unreadCount);
  }

  void loadCount() async {
    final prefs = await SharedPreferences.getInstance();
    _unreadCount = prefs.getInt('unread_count') ?? 0;
    notifyListeners();
  }
}
