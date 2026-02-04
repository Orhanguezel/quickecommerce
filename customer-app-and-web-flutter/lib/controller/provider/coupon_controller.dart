import 'package:flutter/material.dart';

class CouponController with ChangeNotifier {
  String _couponFilter = "";
  get couponFilter => _couponFilter;
  void setCouponFilter(String status) {
    _couponFilter = status;
    Future.microtask(() {
      notifyListeners();
    });
  }


  int _couponCurrentPage = 1;
  int _couponTotalPages=0;

  int get couponCurrentPage => _couponCurrentPage;
  int get couponTotalPages => _couponTotalPages;

  void setCouponTotalPage(int totalPage) {
    _couponTotalPages=totalPage;
    Future.microtask(() {
      notifyListeners();
    });
  }

  void goToCouponNextPage() {
    if (_couponCurrentPage < _couponTotalPages) {
      _couponCurrentPage++;
      notifyListeners();
    }
  }

  void goToCouponPreviousPage() {
    if (_couponCurrentPage > 1) {
      _couponCurrentPage--;
      notifyListeners();
    }
  }


}