import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class MessageInputProvider extends ChangeNotifier {

  XFile? _selectedImage;
  XFile? get selectedImage => _selectedImage;



  void setSelectedImage(XFile? image) {
    _selectedImage = image;
    notifyListeners();
  }

  void removeSelectedImage() {
    _selectedImage = null;
    notifyListeners();
  }

  int _selectedIndex = 0;
  int get selectedIndex => _selectedIndex;
  void updateIndex(int newIndex) {
    _selectedIndex = newIndex;
    notifyListeners();
  }



  final List<PlatformFile> _selectedFiles = [];

  List<PlatformFile> get selectedFiles => _selectedFiles;

  void addFiles(List<PlatformFile> files) {
    _selectedFiles.addAll(files);
    notifyListeners();
  }

  void removeFileAt(int index) {
    _selectedFiles.removeAt(index);
    notifyListeners();
  }

  void clearAll() {
    _selectedFiles.clear();
    notifyListeners();
  }

  String _name ="";
  String get name => _name;
  String _receiverId ="";
  String get receiverId => _receiverId;
  String _receiverType ="";
  String get receiverType => _receiverType;
  String _userImg ="";
  String get userImg => _userImg;
  bool _isOnline = false;
  bool get isOnline => _isOnline;
  void setUserInfo(String name,String receiverId,String receiverType,String userImg,bool isOnline) {
    _name = name;
    _receiverId = receiverId;
    _receiverType = receiverType;
    _userImg = userImg;
    _isOnline = isOnline;
  notifyListeners();
  }
}
