import 'package:flutter/material.dart';

import '../../data/data_model/cart_model.dart';
import '../../data/service/local_database_repository.dart';
import '../../screens/common_widgets/common_funcktion.dart';

class CartProvider with ChangeNotifier {
  //final CartDatabaseHelper _cartHelper = CartDatabaseHelper();
  final CartDatabaseHelpers _cartHelper = CartDatabaseHelpers();
  List<CartItem> _cartItems = [];
  List<CartItem> get cartItems => _cartItems;

  Future<void> loadCartItems() async {
    final items = await _cartHelper.getItems(); // Implement this to fetch all items from DB
    _cartItems = items.map((item) {
      return CartItem.fromMap(item);
    }).toList(); // Update local state
    notifyListeners();
  }

  /// Add a product to the cart or update its quantity
  Future<void> addToCart(CartItem product, BuildContext context) async {
    // Check if the product already exists in the cart
    CartItem? existingItem;
    for (var item in _cartItems) {
      if (item.productId == product.productId) {
        existingItem = item;
        break;
      }
    }

    if (existingItem != null) {
      // If the product exists, update its quantity
      final newQuantity = existingItem.quantity + 1;
      await _cartHelper.updateItemQuantity(existingItem.id, newQuantity);
      //existingItem.quantity = newQuantity; // Update in-memory state
      notifyListeners();
      if (!context.mounted) return;
      CommonFunctions.showUpSnack(
        message: 'This product already added',
        context: context,
      );
    } else {
      // If the product does not exist, add it to the cart
     await _cartHelper.insertItem(product); // Save to DB
     loadCartItems();
      notifyListeners();
     if (!context.mounted) return;
     CommonFunctions.showUpSnack(
       message: 'Product Successfully added',
       context: context,
     );
    }
  }
  //Update quantity in the database and state
  Future<void> updateQuantity(int productId, int quantity) async {
    if (quantity < 1) return; // Prevent decreasing below 1
     await _cartHelper.updateItemQuantity(productId, quantity);
    loadCartItems();
    notifyListeners();
  }


  Future<void> deleteItem(int id)async {
   await _cartHelper.deleteItem(id);
   loadCartItems();
    notifyListeners();
  }

  Future<void> clearCart() async {
    await _cartHelper.clearCart();
    _cartItems.clear();
    loadCartItems();
    notifyListeners();
  }
  double get totalPrice {
    return _cartItems.fold(
      0.0,
          (sum, item) => sum + (double.tryParse(item.price) ?? 0.0) * item.quantity,
    );
  }
}