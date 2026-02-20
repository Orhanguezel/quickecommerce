import 'package:flutter/material.dart';
import 'package:quick_ecommerce/config/strings.dart';
import 'package:quick_ecommerce/data/data_model/address_model.dart';

import '../../data/data_model/cart_model.dart';
import '../../data/data_model/delivery_charge_model.dart';
import '../../data/data_model/extra_charge_model.dart';
import '../../screens/common_widgets/common_funcktion.dart';
import 'currencie_controler.dart';

class CheckoutController with ChangeNotifier {
  final currencyCon=CurrencyController();
  bool _stepTow = false;
  bool get stepsTow => _stepTow;
  void setSteps(bool value) {
    _stepTow = value;
    notifyListeners();
  }

  List<int> _productIds = [];
  List<int> get productIds => _productIds;
  void setProductIds(List<int> value) {
    _productIds = value;
    notifyListeners();
  }


  bool _isDeliveryOptionShow = false;
  bool get isDeliveryOptionShow => _isDeliveryOptionShow;
  void setDeliveryOptionShow(bool value) {
    _isDeliveryOptionShow = value;
    notifyListeners();
  }

  bool _isCouponShow = false;
  bool get isCouponShow => _isCouponShow;
  void setCouponShow(bool value) {
    _isCouponShow = value;
    notifyListeners();
  }

  bool _isSummaryShow = false;
  bool get isSummaryShow => _isSummaryShow;
  void setSummaryShow(bool value) {
    _isSummaryShow = value;
    notifyListeners();
  }


  bool _isWalletActive = false;
  bool get isWalletActive => _isWalletActive;
  void setWalletActive(bool value) {
    _isWalletActive = value;
    notifyListeners();
  }

  double _walletBalance = 0;
  double get walletBalance => _walletBalance;
  void setWalletBalance(double balance) {
    _walletBalance = balance;
    Future.microtask(() {
      notifyListeners();
    });
  }


  String _selectedDeliveryOption = 'Home Delivery';
  String get selectedDeliveryOption => _selectedDeliveryOption;

  void setDeliveryOption(String option) {
    _selectedDeliveryOption = option;
    notifyListeners();
  }

  String _selectedDeliveryAddress = '';
  int _selectedDeliveryAddressId = 0;
  double _selectedAddressLat = 0;
  double _selectedAddressLong = 0;

  String get selectedDeliveryAddress => _selectedDeliveryAddress;
  int get selectedDeliveryAddressId => _selectedDeliveryAddressId;
  double get selectedAddressLat => _selectedAddressLat;
  double get selectedAddressLong => _selectedAddressLong;

  bool _getDeliveryCharge = false;
  bool get getDeliveryCharge => _getDeliveryCharge;
  void setChargeAPIColl(bool isColl) {
    _getDeliveryCharge = isColl;
  }

  String _name = '';
  String get name => _name;
  String _email = '';
  String get email => _email;
  String _contactNumber = '';
  String get contactNumber => _contactNumber;
  void setPicUpPerson(String name,String email,String contactNumber,){
    _name = name;
    _email = email;
    _contactNumber = contactNumber;
  }

/// this function add for delivery address select and show
  final List<AddressListModel> _addressesList = [];
  List<AddressListModel> get addressesList => _addressesList;
    final List<String> _addressesLevelList = [];
  List<String> get addressesLevelList => _addressesLevelList;

  void setAddressList(List<AddressListModel> addresses) {
    // Add only unique addresses (by id)
    for (final address in addresses) {
      if (!_addressesList.any((existing) => existing.id == address.id)) {
        _addressesList.add(address);
        _addressesLevelList.add(address.address);
      }
    }
    if(selectedDeliveryAddress.isEmpty&&selectedDeliveryAddressId==0){
      AddressListModel addData=  addressesList.first;
      setDeliveryAddress(addData.address,addData.id,
          Utils.formatDouble(addData.lat),Utils.formatDouble(addData.long));
    }

    notifyListeners();
  }

  void setDeliveryAddress(
      String option, int addressId, double lat, double long) {
    _selectedDeliveryAddress = option;
    _selectedDeliveryAddressId = addressId;
    _selectedAddressLat = lat;
    _selectedAddressLong = long;
    notifyListeners();
  }

  void clearAddressList(){
    _addressesList.clear();
    notifyListeners();
  }


  int _deliveryCharge = 0;
  double _additionalCharge = 0;
  double _taxAmount =0;
  int get deliveryCharge => _deliveryCharge;
  double get additionalCharge => _additionalCharge;
  double get taxAmount => _taxAmount;

  void clearDeliveryAddressAndCharge() {
    _deliveryCharge = 0;
    _selectedDeliveryAddress = '';
    _selectedDeliveryAddressId = 0;
    _selectedAddressLat = 0;
    _selectedAddressLong = 0;
    _isChargeLoaded=false;
    notifyListeners();
  }


  bool _isCreateAccount = false;
  bool get isCreateAccount => _isCreateAccount;
  void createAccountCheckbox(bool value) {
    _isCreateAccount = value;
    notifyListeners();
  }

  bool _isConditionAccept = false;
  bool get isConditionAccept => _isConditionAccept;
  void setConditionAccept(bool value) {
    _isConditionAccept = value;
    notifyListeners();
  }

  List<int> _ariaIds = [];
  List<int> get ariaIds => _ariaIds;
  void setAriaIds(List<int> value) {
    _ariaIds = value;
    notifyListeners();
  }



  //use for coupon discount amount get
  double _subtotalForCoupon = 0.0;
  double get subtotalForCoupon => _subtotalForCoupon;

  double _discountAmount = 0.0;
  String _coupon = "";
  double get discountAmount => _discountAmount;
  String get coupon => _coupon;
  void updateCoupon(double dAmount, String coupon) {
    _discountAmount = dAmount;
    _coupon = coupon;
    notifyListeners();
  }

  final List<CartItem> _byNowItems = [];
  List<CartItem> get byNowItems => _byNowItems;

  void addByNowItem(List<CartItem> byNowItem) {
    _byNowItems.addAll(byNowItem);
    notifyListeners();
  }

  void clearByNowItem() {
    _byNowItems.clear();
  }

  bool _isByNow = false;
  bool get isByNow => _isByNow;
  void setIsByNow(bool isByNow) {
    _isByNow = isByNow;
  }


  bool _isPackageAdd= false;
  bool get isPackageAdd => _isPackageAdd;
  void setPackageAdd(bool isAdd) {
    _isPackageAdd = isAdd;
  }


  List<Package> _package = [];
  List<Package> get package => _package;

  List<Package> _selectedPackage = [];
  List<Package> get selectedPackage => _selectedPackage;
  bool _isFlashSaleQtyRight = true;
  bool get isFlashSaleQtyRight => _isFlashSaleQtyRight;
  double _totalAmount = 0.0;
  double get totalAmount => _totalAmount;
  String _selectedPackageLength ="";
  String get selectedPackageLength => _selectedPackageLength;
  List<FlashSale> _flashSaleList = [];
  List<FlashSale> get flashSaleList => _flashSaleList;

  // Add a package to the list
  void addFlashSaleList(List<FlashSale> fSaleList) {
    _flashSaleList.addAll(fSaleList);
    notifyListeners();
  }

  void clearPackage() {
    _package = [];
    _selectedPackage = [];
    _flashSaleList = [];
    _isConditionAccept = false;
    _stepTow = false;
    _isPackageAdd = false;
    _isFlashSaleQtyRight = true;
    _isChargeLoaded=false;
    _discountAmount=0.0;
    _totalAmount = 0.0;
    notifyListeners();
  }

  // Add a package to the list
  void addPackage(Package package) {
    _package.add(package);
    notifyListeners();
  }

  void populatePackages(List<CartItem> cart, List<FlashSale> flashSaleList,
      String deliveryType, String shippingType) {
    final groupedPackages = <int, Map<String, dynamic>>{};
    final flashSaleQuantities =
        <String, int>{}; // Track total quantities per flashSaleId
    for (var item in cart) {
      double? price = double.tryParse(item.price);
      double lineAmount = (price ?? 0) * item.quantity;
      final int storeId = item.storeId;
      FlashSale? matchingFlashSale;
      bool isMatchingFlashSale = false;
      if (flashSaleList.isNotEmpty) {
        matchingFlashSale = flashSaleList.firstWhere(
            (fList) => item.flashSaleId == fList.flashSaleId,
            orElse: () => FlashSale(
                  flashSaleId: 0,
                  discountType: '',
                  discountAmount: 0,
                  purchaseLimit: 0,
                ));

        if (matchingFlashSale.flashSaleId != 0 &&
            item.flashSaleId == matchingFlashSale.flashSaleId) {
          isMatchingFlashSale = true;
          // Initialize or update total quantity for the matching flash sale
          final flashSaleIdStr = item.flashSaleId.toString();
          final itemQuantity = item.quantity is String
              ? int.tryParse(item.quantity.toString()) ?? 0
              : item.quantity;
          flashSaleQuantities[flashSaleIdStr] =
              (flashSaleQuantities[flashSaleIdStr] ?? 0) + itemQuantity;

          // Check if the total quantity exceeds the purchase limit
          final totalQuantity = flashSaleQuantities[flashSaleIdStr] ?? 0;
          // Convert purchaseLimit to an integer or double
          final purchaseLimit = matchingFlashSale.purchaseLimit is String
              ? int.tryParse(matchingFlashSale.purchaseLimit) ?? 0
              : matchingFlashSale.purchaseLimit;
          if (totalQuantity > purchaseLimit) {
            _isFlashSaleQtyRight = false;
            //return; // Exit early
          }
        }
      }
      int pLimit=0;
if(matchingFlashSale!=null&&matchingFlashSale.purchaseLimit.toString().isNotEmpty){
   pLimit=int.tryParse(matchingFlashSale.purchaseLimit.toString()) ?? 0;
}

      if (!groupedPackages.containsKey(storeId)) {
        groupedPackages[storeId] = {
          'store_id': storeId,
          'charge': 0,
          'store_name': item.storeName,
          'delivery_type': deliveryType,
          'shipping_type': shippingType,
          'store_area_id': item.areaId,
          'store_tax': item.storeTaxP,
          'charge_amount': item.chargeAmount,
          'charge_type': item.chargeType,
          'additional_line_amount': 0.0,
          'items': []
        };
      }
      groupedPackages[storeId]!['items'].add({
        'cart_id': item.id,
        'store_tax': item.storeTaxP,
        'product_id': item.productId,
        'variant_id': item.variantId,
        'flash_sale_id': item.flashSaleId,
        'is_flash_deal': isMatchingFlashSale,
        'quantity': item.quantity,
        'cart_max_quantity': item.cartMaxQuantity,
        'name': item.productName,
        'variant': item.variant,
        'price': item.price,
        'stock': item.stock,
        'image': item.image,
        'line_amount': lineAmount,
        "discount_type": matchingFlashSale?.discountType ?? "",
        "discount_amount": matchingFlashSale?.discountAmount ?? "",
        "purchase_limit": pLimit,
      });
    }

    // Convert grouped data into a List<Package>
    final List<Package> newPackages = groupedPackages.values.map((packageData) {
      final items = (packageData['items'] as List)
          .map((item) => PackageItem(
                cartId: item['cart_id'],
                productId: item['product_id'],
                variantId: item['variant_id'],
                flashSaleId: item['flash_sale_id'],
                quantity: item['quantity'],
                cartMaxQuantity: item['cart_max_quantity'],
                productName: item['name'],
                variant: item['variant'],
                price: item['price'],
                image: item['image'],
                lineAmount: item['line_amount'],
                discountType: item['discount_type'] ?? '',
                discountAmount: item['discount_amount'].toString(),
                purchaseLimit: item['purchase_limit'] ?? 0,
                stock: item['stock'] ?? 00,
                isFlashDeal: item['is_flash_deal'],
                flashPrice: 000,
              ))
          .toList();

      return Package(
        storeId: packageData['store_id'],
        deliveryType: packageData['delivery_type'],
        shippingType: packageData['shipping_type'],
        storeName: packageData['store_name'],
        charge: packageData['charge'],
        storeTaxP: packageData['store_tax'],
        chargeAmount: packageData['charge_amount'],
        chargeType: packageData['charge_type'],
        additionalLineAmount: packageData['additional_line_amount'],
        storeAreaId: packageData['store_area_id'],
        items: items,
      );
    }).toList();

    // Add only non-duplicate packages
    for (var newPackage in newPackages) {
      if (!_package.any((existingPackage) =>
          existingPackage.storeId == newPackage.storeId &&
          existingPackage.deliveryType == newPackage.deliveryType &&
          existingPackage.shippingType == newPackage.shippingType)) {
        addPackage(newPackage);
      }
    }
    selectAll(true);
  }

  bool checkFlashSaleLimit(int flashSaleId, int itemQuantity) {
    FlashSale? matchingFlashSale;
    if (flashSaleList.isNotEmpty) {
      matchingFlashSale =
          flashSaleList.firstWhere((fList) => flashSaleId == fList.flashSaleId,
              orElse: () => FlashSale(
                    flashSaleId: 0,
                    discountType: '',
                    discountAmount: 0,
                    purchaseLimit: 0,
                  ) // Handle cases where no matching flash sale is found
              );
      if (matchingFlashSale.flashSaleId != 0 &&
          flashSaleId == matchingFlashSale.flashSaleId) {
        // Calculate the total quantity for the flash sale
        final totalQuantity = calculateTotalFlashQuantity(flashSaleId);
        final purchaseLimit = matchingFlashSale.purchaseLimit is String
            ? int.tryParse(matchingFlashSale.purchaseLimit as String) ?? 0
            : matchingFlashSale.purchaseLimit as int;
        // Check if the total quantity exceeds the purchase limit
        if (totalQuantity > purchaseLimit) {
          _isFlashSaleQtyRight = false;
        } else {
          _isFlashSaleQtyRight = true;
        }
      }
    }
    return _isFlashSaleQtyRight; // Within limit
  }

  bool _isChargeLoaded = false;
  bool get isChargeLoaded => _isChargeLoaded;
  void updatePackageDeliveryCharges(List<DeliveryChargeModel> deliveryChargeList) {
    for (var charge in deliveryChargeList) {
      for (var pkg in _package) {
        if (pkg.storeAreaId == charge.areaId) {
          pkg.charge = (charge.deliveryCharge?.deliveryCharge?.toInt()) ?? 0;
        }
      }
      for (var pkg in _selectedPackage) {
        if (pkg.storeAreaId == charge.areaId) {
          pkg.charge = (charge.deliveryCharge?.deliveryCharge?.toInt()) ?? 0;
        }
      }
    }
    _isChargeLoaded=true;
    calculateTotal();
  }
  void clearPackageDeliveryCharge() {
    if (_selectedDeliveryOption == 'Pick Up in Person') {
      // Set charge to 0 for all packages in _package
      for (var pkg in _package) {
        pkg.charge = 0;
      }

      // Set charge to 0 for all packages in _selectedPackage
      for (var pkg in _selectedPackage) {
        pkg.charge = 0;
      }
      // Recalculate the total after clearing charges
      calculateTotal();
    }
  }


  int calculateTotalFlashQuantity(int flashSaleId) {
    int total = 0;
    for (final package in _package) {
      for (final item in package.items) {
        // Check if the item belongs to the flash sale and is selected
        if (item.flashSaleId == flashSaleId && (item.isSelected)) {
          // Add the quantity to the total
          total += item.quantity;
        }
      }
    }
    return total;
  }

  void incrementQuantity(
      int packageIndex, int itemIndex, BuildContext context) {
    final packages = package[packageIndex];
    final item = packages.items[itemIndex];
    if (item.isSelected) {
      if (item.quantity + 1 <= item.stock) {
        // Check flash sale limits
        if (item.isFlashDeal) {
          final totalFlashQty = calculateTotalFlashQuantity(item.flashSaleId);
          if (totalFlashQty + 1 <= item.purchaseLimit) {
            item.quantity++;
          } else {
            CommonFunctions.showCustomSnackBar(context,
                "You have reached the purchase limit of ${item.purchaseLimit} items for this flash sale.");
          }
        } else {
          item.quantity++;
        }
      } else {
        CommonFunctions.showCustomSnackBar(
            context, "You have reached the purchase limit of ${item.stock}");
      }
    }
    calculateTotal();
    notifyListeners();
  }

  void decrementQuantity(int packageIndex, int itemIndex) {
    if (packageIndex < package.length &&
        itemIndex < package[packageIndex].items.length) {
      if (package[packageIndex].items[itemIndex].isSelected) {
        if (package[packageIndex].items[itemIndex].quantity > 1) {
          package[packageIndex].items[itemIndex].quantity--;
          // Get the current item being toggled
          final currentItem = package[packageIndex].items[itemIndex];

          checkFlashSaleLimit(currentItem.flashSaleId, currentItem.quantity);

          calculateTotal();
          notifyListeners();
        }
      }
    }
  }

  void removeItem(int packageIndex, int itemIndex) {
    // Check if packageIndex is within bounds
    if (packageIndex >= 0 && packageIndex < package.length) {
      // Check if itemIndex is within bounds for the specific package's items
      if (itemIndex >= 0 && itemIndex < package[packageIndex].items.length) {
        package[packageIndex].items.removeAt(itemIndex);
        // If the package has no items left, remove the entire package
        if (package[packageIndex].items.isEmpty) {
          package.removeAt(packageIndex);
        }
      }
    }
    if (packageIndex >= 0 && packageIndex < selectedPackage.length) {
      // Check if itemIndex is within bounds for the specific package's items
      if (itemIndex >= 0 &&
          itemIndex < selectedPackage[packageIndex].items.length) {
        selectedPackage[packageIndex].items.removeAt(itemIndex);
        // If the package has no items left, remove the entire package
        if (selectedPackage[packageIndex].items.isEmpty) {
          selectedPackage.removeAt(packageIndex);
        }

        for (var package in selectedPackage) {
          for (var item in package.items) {
            checkFlashSaleLimit(item.flashSaleId, item.quantity);
          }
        }
      }
    }
    calculateTotal();
    notifyListeners();
  }

  void togglePackageSelection(int packageIndex, bool isSelected) {
    package[packageIndex].isSelected = isSelected;
    for (var item in package[packageIndex].items) {
      item.isSelected = isSelected;
    }
    addSelectedItem();
    notifyListeners();
  }

  void toggleItemSelection(int packageIndex, int itemIndex, bool isSelected) {
    package[packageIndex].items[itemIndex].isSelected = isSelected;
    // Update package checkbox if all items are selected
    package[packageIndex].isSelected =
        package[packageIndex].items.every((item) => item.isSelected);
    // Get the current item being toggled
    final currentItem = package[packageIndex].items[itemIndex];

    checkFlashSaleLimit(currentItem.flashSaleId, currentItem.quantity);

    addSelectedItem();
    notifyListeners();
  }

  void selectAll(bool isSelected) {
    for (var package in package) {
      package.isSelected = isSelected;
      for (var item in package.items) {
        item.isSelected = isSelected;
      }
    }
    if (isSelected) {
      addSelectedItem();
    } else {
      _selectedPackage = [];
    }
    calculateTotal();
    notifyListeners();
  }

  void addSelectedItem() {
    _selectedPackage = []; // Reset the list before adding new items.
    for (var pkg in package) {
      var selectedItems = pkg.items.where((item) => item.isSelected).toList();
      if (selectedItems.isNotEmpty) {
        // Add the package with only the selected items to _selectedPackage
        _selectedPackage.add(
          Package(
            storeId: pkg.storeId,
            storeName: pkg.storeName,
            isSelected: true, // Mark the package as selected
            deliveryType: pkg.deliveryType,
            shippingType: pkg.shippingType,
            items: selectedItems,
            charge: pkg.charge,
            storeTaxP: pkg.storeTaxP,
            chargeAmount: pkg.chargeAmount,
            chargeType: pkg.chargeType,
            additionalLineAmount: 0,
            storeAreaId: pkg.storeAreaId,
          ),
        );
      }
    }
    calculateTotal();
    notifyListeners(); // Notify listeners if using a state management approach
  }

  void deleteSelectedItems() {
    // Function to clean up a list of packages by removing selected items and empty packages
    void cleanPackages(List<Package> packages) {
      for (var pkg in packages) {
        pkg.items.removeWhere((item) => item.isSelected);
      }
      packages.removeWhere((pkg) => pkg.items.isEmpty);
    }
    // Clean up both 'package' and 'selectedPackage' lists
    cleanPackages(package);
    cleanPackages(selectedPackage);

    // Recalculate total and notify listeners
    calculateTotal();
    notifyListeners();
  }

  double calculateTotal() {
    // Initialize totals and other variables
    double total = 0.0;
    double subTotalForCoupon = 0.0;
    double taxAmount = 0;
    double totalAdditionalChargeAmount = 0.0;
    int deliveryCharge = 0;
    int totalItemCount = 0;

    for (var pack in selectedPackage) {
      // Add delivery charge if applicable
      if (selectedDeliveryOption == 'Home Delivery') {
        deliveryCharge += pack.charge;
      }
      totalItemCount += pack.items.length;
      double packageAdditionalCharge = 0.0;
      for (var item in pack.items) {
        // Parse necessary values with fallbacks
        double price = double.tryParse(item.price) ?? 0.0;
        int quantity = int.tryParse(item.quantity.toString()) ?? 0;
        double taxPercentage = double.tryParse(pack.storeTaxP) ?? 0.0;
        double additionalChargeRate = double.tryParse(pack.chargeAmount) ?? 0.0;
        // Calculate initial line amount
        double lineAmount = price * quantity;
        // Update item line amount for reference
        item.lineAmount = lineAmount;

        // Accumulate subtotal for coupon
        subTotalForCoupon += lineAmount;

        // Calculate additional charge
        double additionalCharge = (pack.chargeType == "percentage")
            ? (lineAmount * additionalChargeRate) / 100
            : additionalChargeRate;

        packageAdditionalCharge += additionalCharge;

        // Calculate tax
        double itemTax = (lineAmount * taxPercentage) / 100;
        taxAmount +=currencyCon.decimalPoint == "YES"?itemTax :itemTax.roundToDouble();
      }
      
      for (var pkg in package){
      if(pack.storeId==pkg.storeId){
        pkg.additionalLineAmount = currencyCon.decimalPoint == "YES"
            ?packageAdditionalCharge
            :packageAdditionalCharge.roundToDouble() ;
      }
      }
      // Accumulate global additional charge
      totalAdditionalChargeAmount += packageAdditionalCharge;
    }

    // Update the total item count
    _selectedPackageLength = totalItemCount.toString();
    // Calculate the final total (ensure discountAmount is defined)
    total = subTotalForCoupon + taxAmount + deliveryCharge + totalAdditionalChargeAmount - discountAmount;
    // Update class variables
    _subtotalForCoupon = subTotalForCoupon;
    _taxAmount = taxAmount;
    _totalAmount = total;
    _deliveryCharge = deliveryCharge;
    _additionalCharge = totalAdditionalChargeAmount;
    return total;
  }


}

class Package {
  final int storeId;
  final String storeName;
  bool isSelected;
  final String deliveryType; // standard_delivery, parcel, takeaway
  final String shippingType; // standard, express, freight
  int charge;
  final String storeTaxP;
  final String chargeAmount;
  final String chargeType;
  double additionalLineAmount;
  final int storeAreaId;
  late final List<PackageItem> items;

  Package({
    required this.storeId,
    required this.storeName,
    this.isSelected = false,
    required this.deliveryType,
    required this.shippingType,
    required this.charge,
    required this.storeTaxP,
    required this.chargeAmount,
    required this.chargeType,
    required this.additionalLineAmount,
    required this.storeAreaId,
    required this.items,
  });

  // Factory constructor to create an instance from a Map
  factory Package.fromMap(Map<String, dynamic> map) {
    return Package(
      storeId: map['store_id'] ?? 0,
      storeName: map['store_name'],
      deliveryType: map['delivery_type'] ?? '',
      shippingType: map['shipping_type'] ?? '',
      charge: map['charge'] ?? '',
      storeTaxP: map['store_tax'] ?? "",
      chargeAmount: map['charge_amount'] ?? "",
      chargeType: map['charge_type'] ?? "",
      additionalLineAmount: map['additional_line_amount'] ?? "",
      storeAreaId: map['store_area_id'] ?? '',
      items: (map['items'] as List)
          .map((itemMap) => PackageItem.fromMap(itemMap))
          .toList(),
    );
  }

  // Method to convert an instance to a Map
  Map<String, dynamic> toMap() {
    return {
      'store_id': storeId,
      'store_name': storeName,
      'delivery_type': deliveryType,
      'shipping_type': shippingType,
      'charge': charge,
      'store_tax': storeTaxP,
      'charge_amount': chargeAmount,
      'charge_type': chargeType,
      'additional_line_amount': additionalLineAmount,
      'store_area_id': storeAreaId,
      'items': items.map((item) => item.toMap()).toList(),
    };
  }
}

class PackageItem {
  final dynamic cartId;
  bool isSelected;
  final int productId;
  final int variantId;
  final int stock;
  final int flashSaleId;
  final bool isFlashDeal;
  final double flashPrice;
  final String productName;
  final String image;
  final String variant;
  final String price;
  final String discountType;
  final String discountAmount;
  int quantity;
  int cartMaxQuantity;
  int purchaseLimit;
  double lineAmount;

  PackageItem({
    this.cartId,
    this.isSelected = false,
    required this.productId,
    required this.variantId,
    required this.stock,
    required this.isFlashDeal,
    required this.flashPrice,
    required this.flashSaleId,
    required this.quantity,
    required this.cartMaxQuantity,
    required this.purchaseLimit,
    required this.productName,
    required this.variant,
    required this.price,
    required this.discountType,
    required this.discountAmount,
    required this.image,
    required this.lineAmount,
  });

  // Factory constructor to create an instance from a Map
  factory PackageItem.fromMap(Map<String, dynamic> map) {
    return PackageItem(
      cartId: map['cart_id'] ?? 0,
      productId: map['product_id'] ?? 0,
      variantId: map['variant_id'] ?? 0,
      flashSaleId: map['flash_sale_id'] ?? 0,
      stock: map['stock'] ?? 0,
      isFlashDeal: map['is_flash_deal'] ?? 0,
      flashPrice: map['flash_price'] ?? 0,
      quantity: map['quantity'] ?? 0,
      cartMaxQuantity: map['cart_max_quantity'] ?? 0,
      productName: map['name'] ?? '',
      variant: map['variant'] ?? '',
      price: map['price'] ?? 0.0,
      image: map['image'] ?? '',
      lineAmount: map['line_amount'] ?? '',
      discountType: map['discount_type'] ?? '',
      discountAmount: map['discount_amount'] ?? '',
      purchaseLimit: map['purchase_limit'] ?? '',
    );
  }

  // Method to convert an instance to a Map
  Map<String, dynamic> toMap() {
    return {
      'cart_id': cartId,
      'product_id': productId,
      'variant_id': variantId,
      'flash_sale_id': flashSaleId,
      'stock': stock,
      'is_flash_deal': isFlashDeal,
      'flash_price': flashPrice,
      'quantity': quantity,
      'cart_max_quantity': cartMaxQuantity,
      'name': productName,
      'variant': variant,
      'price': price,
      'image': image,
      'line_amount': lineAmount,
      "discount_type": discountType,
      "discount_amount": discountAmount,
      "purchase_limit": purchaseLimit
    };
  }
}
