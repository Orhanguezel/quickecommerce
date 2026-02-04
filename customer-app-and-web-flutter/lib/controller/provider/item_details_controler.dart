import 'package:flutter/material.dart';
import 'package:quick_ecommerce/config/strings.dart';

import '../../data/data_model/all_product_model.dart';
import '../../data/data_model/product_details_model.dart';

class ItemDetailsProvider with ChangeNotifier {


  bool _isQuestionListShow = true;
  get isQuestionListShow => _isQuestionListShow;
  void setQuestionListShow(bool show) {
    _isQuestionListShow = show;
    Future.microtask(() {
      notifyListeners();
    });
  }



  String? _selectedImage;
  String? get selectedImage => _selectedImage;
  void setSelectImage(String imageUrl) {
    _selectedImage = imageUrl;
    Future.microtask(() {
      notifyListeners();
    });
  }

  bool _isWishList=false;
  bool get isWishList => _isWishList;
  void setWishList(bool value) {
    _isWishList = value;
    Future.microtask(() {
      notifyListeners();
    });
  }

  final List<VariantImage> _imageLists = [];
  List<VariantImage> get imageLists => _imageLists;

  void setThumnilImage(VariantImage imageUrl) {
    bool alreadyExists = _imageLists.any((image) => image.id == imageUrl.id);
    if (!alreadyExists) {
      _imageLists.add(imageUrl);
      Future.microtask(() {
        notifyListeners();
      });
    }
  }

  List<Variant> _variants = [];
  Map<String, List<String>> _attributeValues = {};
  Map<String, String> _selectedOptions = {};
  Variant? _selectedVariant;

  List<Variant> get variants => _variants;
  Map<String, List<String>> get attributeValues => _attributeValues;
  Map<String, String> get selectedOptions => _selectedOptions;
  Variant? get selectedVariant => _selectedVariant;

  void initializeVariants(List<Variant> variants) {
    _variants = variants;
    initializeAttributes(variants);

    if (_selectedOptions.isEmpty) {
      _initializeDefaultSelections();
    }
    if (variants.isNotEmpty) {
      _imageLists.clear();
      for (var variant in variants) {
        bool alreadyExists = _imageLists.any((image) => image.id == variant.id);
        if (!alreadyExists) {
          _imageLists.add(
            VariantImage(
              id: variant.id,
              imageUrl: variant.imageUrl ?? "",
            ),
          );
        }
      }
    }
    Future.microtask(() {
      notifyListeners();
    });
  }

  FlashSale? _flashSale;
  setFlashSale(FlashSale flashSale){
    _flashSale=flashSale;
  }

  void initializeAttributes(List<Variant> variants) {
    Map<String, Set<String>> attributes = {};

    for (var variant in variants) {
      variant.attributes?.forEach((key, value) {
        if (value is String) {
          attributes.putIfAbsent(key, () => <String>{}).add(value);
        }
      });
    }

    _attributeValues =
        attributes.map((key, value) => MapEntry(key, value.toList()));
    Future.microtask(() {
      notifyListeners();
    });
  }

  void _initializeDefaultSelections() {
    // Set default values for selected options based on the first available value
    _selectedOptions =
        _attributeValues.map((key, values) => MapEntry(key, values.first));

    // Update the selected variant
    _updateSelectedVariant();
    Future.microtask(() {
      notifyListeners();
    });
  }

  void handleOptionSelect(String attributeKey, String value) {
    _selectedOptions[attributeKey] = value;
    _updateSelectedVariant();
    Future.microtask(() {
      notifyListeners();
    });
  }

  void _updateSelectedVariant() {
    _selectedVariant = getSelectedVariant();
    updateVariantPriceAndStock();
  }

  int _quantity = 1;
  int get quantity => _quantity;
  void increaseQuantity() {
    if(stock=="In Stock"&& quantity < stockQty){
      _quantity++;
    }
    notifyListeners();
  }

  void decreaseQuantity() {
    if (_quantity > 1) {
      _quantity--;
      notifyListeners();
    }
  }



  double _price = 0.0;
  double _spPrice = 0.0;
  int _variantId = 0;
  int _stockQty = 0;
  String _variant = "";
  String _sku = "";
  String _stock = "Out of Stock";
  double get price => _price;
  double get spPrice => _spPrice;
  int get variantId => _variantId;
  int get stockQty => _stockQty;
  String get variant => _variant;
  String get sku => _sku;
  String get stock => _stock;
  void updateVariantPriceAndStock() {
    if (_selectedVariant != null) {
      final data = _selectedVariant!;
      int stockQty=int.tryParse(data.stockQuantity.toString())??0;
      if (data.price != null &&
          data.attributes != null &&
          stockQty > 0) {
        // Convert price and specialPrice to double
        double price=double.tryParse(data.price.toString()) ?? 0.0;
        double spPrice = double.tryParse(data.specialPrice.toString()) ?? 0.0;

        final result= Utils.flashSalePriceCalculate(price,spPrice, _flashSale);
        if(result.isFlashSale){
          _price = spPrice>0?spPrice:price;
          _spPrice = Utils.formatDouble(result.flashSalePrice);
        }else{
          _price =price;
          _spPrice = spPrice;
        }
        _variantId = data.id;
        _stockQty=stockQty;
         _selectedImage = data.imageUrl;
        _variant = data.attributes!.entries
            .map((e) => '${e.key}: ${e.value}')
            .join(',');
        _stock = "In Stock";
        _sku=data.sku;
      } else {
        _price = 0.0;
        _spPrice = 0.0;
        _stock = "Out of Stock"; // Modify if needed
      }
    } else {
      // Handle the case where selectedVariant is null
      _price = 0.0;
      _spPrice = 0.0;
      _stock = "Out of Stock";
    }
    Future.microtask(() {
      notifyListeners();
    });
  }

  Variant? getSelectedVariant() {
    try {
      return _variants.firstWhere(
        (variant) {
          return _selectedOptions.entries.every((entry) {
            String key = entry.key;
            String selectedValue = entry.value;
            return variant.attributes?[key] == selectedValue;
          });
        },
      );
    } catch (e) {
      return null;
    }
  }



  void clearSelectedVariant(){
    _price = 0.0;
    _spPrice = 0.0;
    _stock = "";
    _quantity=1;
    _selectedOptions.clear();
    _selectedImage=null;
    _variants.clear();
    _flashSale=null;
    Future.microtask(() {
      notifyListeners();
    });
   }

  int _like = 1;
  int get like => _like;
  int _dislike = 1;
  int get dislike => _dislike;

  bool hasLiked = false;
  bool hasDisliked = false;
  void setLikeDislike(int like,int dislike){
    _like=like;
    _dislike=dislike;
  }

  void increaseLike() {
    if (!hasLiked && !hasDisliked) {
      _like++;
      hasLiked = true; // Mark as liked
      notifyListeners();
    }
  }

  void increaseDislike() {
    if (!hasLiked && !hasDisliked) {
      _dislike++;
      hasDisliked = true; // Mark as disliked
      notifyListeners();
    }
  }

  void resetActions() {
    hasLiked = false;
    hasDisliked = false;
    notifyListeners();
  }





}




class VariantImage {
  final int id;
  final String imageUrl;

  VariantImage({required this.id, required this.imageUrl});
}

