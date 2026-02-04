import 'package:flutter/material.dart';



class CommonProvider with ChangeNotifier {
  bool _isLoading = false;
  bool _isSecondaryLoading = false;

  get isLoading => _isLoading;
  get isSecondaryLoading => _isSecondaryLoading;

  void setLoading(bool loading) {
    _isLoading = loading;
    Future.microtask(() {
      notifyListeners();
    });
  }

  void setSecondaryLoading(bool loading) {
    _isSecondaryLoading = loading;
    Future.microtask(() {
      notifyListeners();
    });
  }


  bool _isLogin = false;
  bool _isEmailVerified = false;
  get isLogin => _isLogin;
  get isEmailVerified => _isEmailVerified;
  void setLogin(bool login) {
    _isLogin = login;
    Future.microtask(() {
      notifyListeners();
    });
  }
  void setEmailVerified(bool emailVerified) {
    _isEmailVerified = emailVerified;
    Future.microtask(() {
      notifyListeners();
    });
  }

  bool _isSearch = false;
  get isSearch => _isSearch;
  void setIsSearch(bool search) {
    _isSearch = search;
    Future.microtask(() {
      notifyListeners();
    });
  }

  String _priority = "";
  get selectedPriority => _priority;
  void setPriority(String priority) {
    _priority = priority;
    notifyListeners();
  }

  String _status = "";
  get selectedStatus => _status;
  void setStatus(String status) {
    _status = status;
    notifyListeners();
  }


  String _gender = "";
  get selectedGender => _gender;
  void setGender(String gender) {
    _gender = gender;
    notifyListeners();
  }



  String _department = "";
  String _departmentId = "";
  get selectedDepartment => _department;
  get selectedDepartmentId => _departmentId;
  void setDepartment(String department,String departmentId) {
    _department = department;
    _departmentId = departmentId;
    notifyListeners();
  }


  String _selectedReason = "";
  get selectedReason => _selectedReason;
  void setReason(String status) {
    _selectedReason = status;
    Future.microtask(() {
      notifyListeners();
    });
  }


  String _accountStatus = "";
  get selectedAccountStatus => _accountStatus;
  void setAccountStatus(String status) {
    _accountStatus = status;
    Future.microtask(() {
      notifyListeners();
    });
  }

  int _imageId = 0;
  String _imageUrl = "";
int  get imageId => _imageId;
String  get imageUrl => _imageUrl;
  void setImageId(int imageId,String image) {
    _imageId = imageId;
    _imageUrl = image;
    Future.microtask(() {
      notifyListeners();
    });
  }


  String _profileUrl = "";
  String  get profileUrl => _profileUrl;
  void setProfile(String image) {
    _profileUrl = image;
    Future.microtask(() {
      notifyListeners();
    });
  }

  int _currentPage = 1;
  int _totalPages=0;

  int get currentPage => _currentPage;
  int get totalPages => _totalPages;

  void setTotalPage(int totalPage) {
    _totalPages=totalPage;
    Future.microtask(() {
      notifyListeners();
    });
  }

  void goToNextPage() {
    if (_currentPage < _totalPages) {
      _currentPage++;
      notifyListeners();
    }
  }

  void goToPreviousPage() {
    if (_currentPage > 1) {
      _currentPage--;
      notifyListeners();
    }
  }



  int _trendingCurrentPage = 1;
  int _trendingTotalPages=0;

  int get trendingCurrentPage => _trendingCurrentPage;
  int get trendingTotalPages => _trendingTotalPages;

  void setTrendingTotalPage(int totalPage) {
    _trendingTotalPages=totalPage;
    Future.microtask(() {
      notifyListeners();
    });
  }

  void goToTrendingNextPage() {
    if (_trendingCurrentPage < _trendingTotalPages) {
      _trendingCurrentPage++;
      notifyListeners();
    }
  }

  void goToTrendingPreviousPage() {
    if (_trendingCurrentPage > 1) {
      _trendingCurrentPage--;
      notifyListeners();
    }
  }



  int _messagesCurrentPage = 1;
  int _messagesTotalPages=0;

  int get messagesCurrentPage => _messagesCurrentPage;
  int get messagesTotalPages => _messagesTotalPages;

  void setMessageTotalPage(int totalPage) {
    _messagesTotalPages=totalPage;
    Future.microtask(() {
      notifyListeners();
    });
  }

  void goToMessageNextPage() {
    if (_messagesCurrentPage < _messagesTotalPages) {
      _messagesCurrentPage++;
      notifyListeners();
    }
  }

  void goToMessagePreviousPage() {
    if (_messagesCurrentPage > 1) {
      _messagesCurrentPage--;
      notifyListeners();
    }
  }



  String _year = "";
  get year => _year;
  String _month = "";
  get month => _month;
  String _day = "";
  get day => _day;
  void setYear(String year) {
    _year = year;
    notifyListeners();
  }

  void setMonth(String month) {
    _month = month;
    notifyListeners();
  }

  void setDay(String day) {
    _day = day;
    notifyListeners();
  }


}