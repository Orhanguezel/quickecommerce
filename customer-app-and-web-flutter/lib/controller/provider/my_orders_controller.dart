import 'package:flutter/material.dart';
import '../../data/data_model/order_list.dart';

class MyOrdersController extends ChangeNotifier {
  List<OrderData> _allOrders = []; // All orders
  List<OrderData> get allOrders => _allOrders;



// Add a new order to the list
  void addOrder(OrderData order) {
    bool orderExists = _allOrders
        .any((existingOrder) => existingOrder.orderId == order.orderId);
    if (!orderExists) {
      _allOrders.add(order);
      // Sort the list so the largest orderId comes first
      _allOrders.sort((a, b) => b.orderId.compareTo(a.orderId));
      notifyListeners();
    }
  }

  // Set the list of orders (e.g., from an API)
  void setOrders(List<OrderData> orders) {
    _allOrders = orders;
    notifyListeners();
  }

  // Filter orders by status
  List<OrderData> filterOrdersByStatus(String status) {
    return _allOrders
        .where((order) => order.status?.toLowerCase() == status.toLowerCase())
        .toList();
  }

  // Getters for filtered orders
  List<OrderData> get pendingOrders => filterOrdersByStatus('pending');
  List<OrderData> get shippedOrders => filterOrdersByStatus('shipped');
  List<OrderData> get deliveredOrders => filterOrdersByStatus('delivered');

  orderDataClear(){
    allOrders.clear();
    pendingOrders.clear();
    shippedOrders.clear();
    deliveredOrders.clear();
  }

  String _selectedReason = '';
  String get selectedReason => _selectedReason;
  void setReason(String reason) {
    _selectedReason = reason;
    notifyListeners();
  }
}
