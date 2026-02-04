import 'package:flutter/material.dart';

class FilterController extends ChangeNotifier {
  int _ratings = 0;
  String _category = '';
  String _categoryId = '';
  int get ratings => _ratings;
  String get selectedCategory => _category;
  String get selectedCategoryId => _categoryId;




  RangeValues _priceRange = const RangeValues(1, 5000);
  RangeValues get priceRange => _priceRange;


  // Selected Rating
  int _selectedRating = 0;
  int get selectedRating => _selectedRating;

  // Selected Size
  String _selectedSize = '';
  String get selectedSize => _selectedSize;

  // Selected Color
   Color? _selectedColor;
  Color? get selectedColor => _selectedColor;


  // Method to set the rating value and update the selected reason.
  void setRatings(int value) {
    _ratings = value;
    notifyListeners();
  }

clearRatings(){
  _ratings = 0;
  notifyListeners();
}

  // Update Size
  void updateCategories(String categories,String categoryId ) {
    _category = categories;
    _categoryId=categoryId;
    notifyListeners();
  }


  final List<String> _selectedCategories = [];
  final List<String> _categoriesId = [];

  List<String> get selectedCategories => _selectedCategories;
  List<String> get categoriesId => _categoriesId;

  // Toggle a category or subcategory
  void toggleCategory(String category, String id,
      {String? parentCategory, List<dynamic>? subcategories}) {
    if (_selectedCategories.contains(category)) {
      // If the category is already selected, remove it
      _selectedCategories.remove(category);
      _categoriesId.remove(id);
    } else {
      // Add the category
      _selectedCategories.add(category);
      _categoriesId.add(id);

      // If a parent is provided, deselect it
      if (parentCategory != null &&
          _selectedCategories.contains(parentCategory)) {
        _selectedCategories.remove(parentCategory);
      }

      // If subcategories are provided, deselect all of them
      if (subcategories != null) {
        for (final subcategory in subcategories) {
          _selectedCategories.remove(subcategory);
        }
      }
    }
    notifyListeners();
  }


  final List<String> _selectedBrands = [];
  final List<String> _brandIds = [];

  List<String> get selectedBrands => _selectedBrands;
  List<String> get brandIds => _brandIds;

  // Toggle the selected state of a brand
  void toggleBrand(String brand, String id) {
    if (_selectedBrands.contains(brand)) {
      _selectedBrands.remove(brand);
      _brandIds.remove(id);
    } else {
      _selectedBrands.add(brand);
      _brandIds.add(id);
    }
    notifyListeners();
  }




  final List<String> _selectedStoreTypes = [];
  final List<String> _selectedStoreTypeIds = [];

  List<String> get selectedStoreTypes => _selectedStoreTypes;
  List<String> get selectedStoreTypeIds => _selectedStoreTypeIds;

  void toggleStoreType(String storeType, String storeTypeId) {
    if (_selectedStoreTypes.contains(storeType)) {
      _selectedStoreTypes.remove(storeType);
      _selectedStoreTypeIds.remove(storeTypeId);
    } else {
      _selectedStoreTypes.add(storeType);
      _selectedStoreTypeIds.add(storeTypeId);
    }
    notifyListeners();
  }

  static const double minPrice = 1;
  static const double maxPrice = 50000;
  // Update Price Range
  void updatePriceRange(RangeValues newRange) {
    double start = newRange.start.clamp(minPrice, maxPrice);
    double end = newRange.end.clamp(minPrice, maxPrice);

    _priceRange = RangeValues(start, end);
    notifyListeners();
  }

  // Update Rating
  void updateRating(int rating) {
    _selectedRating = rating;
    notifyListeners();
  }

  // Update Size
  void updateSize(String size) {
    _selectedSize = size;
    notifyListeners();
  }


 bool  isCleare=false;
  bool get isCleared => isCleare;
  // Reset Filters
  void resetFilters() {
    _priceRange = const RangeValues(1, 50000);
    _selectedRating = 0;
    _category='';
    _categoryId="";
    _selectedSize = '';
    _selectedCategories.clear();
    _categoriesId.clear();
    _selectedColor = null;
    _brandIds.clear();
    _selectedBrands.clear();
    _selectedStoreTypes.clear();
    _selectedStoreTypeIds.clear();
    isCleare=true;
    _selectedValue='newest';
    _shortValue='';
    _isFeatured = false;
    _bestSelling =false;
    _popularProducts = false;
    _flashSale = false;
    notifyListeners();
  }


  int _selectedIndex = -1;

  int get selectedIndex => _selectedIndex;

  void toggleSelectedIndex(int index) {
    if (_selectedIndex == index) {
      _selectedIndex = -1; // Collapse if already expanded
    } else {
      _selectedIndex = index; // Expand the clicked category
    }
    notifyListeners();
  }


  bool _isFeatured = false;
  bool get isFeatured => _isFeatured;
  bool _bestSelling = false;
  bool get bestSelling => _bestSelling;
  bool _popularProducts = false;
  bool get popularProducts => _popularProducts;
  bool _flashSale = false;
  bool get flashSale => _flashSale;
  int _flashSaleId = 0;
  int get flashSaleId => _flashSaleId;
  void setProductType(String value,{int? flashSaleId}) {
    _isFeatured = value == "Is Featured";
    _bestSelling = value == "Best Selling";
    _popularProducts = value == "Popular Products";
    _flashSale = value == "Flash Sale";
    if (flashSaleId != null && _flashSale) {
      _flashSaleId = flashSaleId;
    }
      notifyListeners();
  }

  String _searchValue = '';
  String get searchValue => _searchValue;
  void setSearchValue(String value) {
      _searchValue = value;
      notifyListeners();
  }


  String _selectedValue = 'Newest';
  String get selectedValue => _selectedValue;
  String _shortValue = 'newest';
  String get shortValue => _shortValue;

  // Method to update the selected value
  void updateSelectedValue(String value) {
    if (_selectedValue != value) {
      _selectedValue = value;
      if(value=="Price High to Low"||value=="Price Low to High"||value=="Newest"){
       if(value=="Price High to Low"){
         _shortValue="price_high_low";
       }else if(value=="Price Low to High"){
         _shortValue="price_low_high";
       }else {
         _shortValue="newest";
       }
      }
      notifyListeners();
    }
  }
  bool _isProductTypeShow = false;
  bool get isProductTypeFilterShow => _isProductTypeShow;
  void setProductTypeShow(bool value) {
    _isProductTypeShow = value;
    notifyListeners();
  }
  bool _isPriceShow = false;
  bool get isPriceFilterShow => _isPriceShow;
  void setPriceFilterShow(bool value) {
    _isPriceShow = value;
    notifyListeners();
  }

  bool _isBrandFilterShow = false;
  bool get isBrandFilterShow => _isBrandFilterShow;
  void setBrandFilterShow(bool value) {
    _isBrandFilterShow = value;
    notifyListeners();
  }
  bool _isVendorFilterShow = false;
  bool get isVendorFilterShow => _isVendorFilterShow;
  void setVendorFilterShow(bool value) {
    _isVendorFilterShow = value;
    notifyListeners();
  }
  bool _isRatingFilterShow = false;
  bool get isRatingFilterShow => _isRatingFilterShow;
  void setRatingFilterShow(bool value) {
    _isRatingFilterShow = value;
    notifyListeners();
  }

  bool _isSizeFilterShow = false;
  bool get isSizeFilterShow => _isSizeFilterShow;
  void setSizeFilterShow(bool value) {
    _isSizeFilterShow = value;
    notifyListeners();
  }

}
