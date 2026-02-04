import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controller/provider/my_orders_controller.dart';
import '../common_widgets/no_data_widget.dart';
import 'order_item_card.dart';

class OngoingOrdersTab extends StatefulWidget {
  const OngoingOrdersTab({super.key});

  @override
  State<OngoingOrdersTab> createState() => _OngoingOrdersTabState();
}

class _OngoingOrdersTabState extends State<OngoingOrdersTab> {
  @override
  Widget build(BuildContext context) {
    final ordersController = Provider.of<MyOrdersController>(context);
    return Scaffold(
      body: ordersController.shippedOrders.isNotEmpty
          ? ListView.builder(
        itemCount: ordersController.shippedOrders.length,
        itemBuilder: (context, index) {
          final data = ordersController.shippedOrders[index];
          return OrderCard(
            invoiceNumber: data.invoiceNumber.toString(),
            orderAmount: data.orderAmount,
            orderDate: data.orderDate,
            orderId: data.orderId,
            status: data.status,
          );
        },
      )
          :const Center(child: NoDataWidget()),
    );
  }
}




