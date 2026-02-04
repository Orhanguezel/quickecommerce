import 'package:flutter/material.dart';

import '../../data/data_model/all_product_model.dart';

class AllProductController with ChangeNotifier {


  int _allPCurrentPage = 1;
  int _allPTotalPages = 0;

  int get allPCurrentPage => _allPCurrentPage;

  int get allPTotalPages => _allPTotalPages;

  void setAllPTotalPage(int totalPage,int currentPage) {
    _allPTotalPages = totalPage;
    Future.microtask(() {
      notifyListeners();
    });
  }

  void goToAllPNextPage() {
    if (_allPCurrentPage < _allPTotalPages) {
      _allPCurrentPage++;
      notifyListeners();
    }
  }


  final List<ProductData> _allProducts = [];
  List<ProductData> get allProducts => _allProducts;

// Add a new order to the list
  void addAllProduct(ProductData product) {
    bool orderExists = _allProducts
        .any((existingProduct) => existingProduct.id == product.id);
    if (!orderExists) {
      _allProducts.add(product);
      notifyListeners();
    }
  }


  void updateProductWishlist(int productId, bool isWishlist) {
    final index = _allProducts.indexWhere((product) => product.id == productId);
    if (index != -1) {
      _allProducts[index].wishlist = isWishlist;
      notifyListeners();
    }
  }


  void allProductClear(){
    _allProducts.clear();
    notifyListeners();
  }


}