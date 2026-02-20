import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controller/provider/my_orders_controller.dart';
import '../common_widgets/no_data_widget.dart';
import 'order_item_card.dart';

class CompletedScreen extends StatefulWidget {
  const CompletedScreen({super.key});

  @override
  State<CompletedScreen> createState() => _CompletedScreenState();
}

class _CompletedScreenState extends State<CompletedScreen> {

  @override
  Widget build(BuildContext context) {
    final ordersController = Provider.of<MyOrdersController>(context);
    return Scaffold(
      body:ordersController.deliveredOrders.isNotEmpty
          ? ListView.builder(
        itemCount: ordersController.deliveredOrders.length,
        itemBuilder: (context, index) {
          final data = ordersController.deliveredOrders[index];
          return OrderCard(
            invoiceNumber: data.invoiceNumber.toString(),
            orderAmount: data.orderAmount,
            orderDate: data.orderDate,
            orderId: data.orderId,
            status: data.status,
          );
        },
      )
          : const Center(child: NoDataWidget()),
    );
  }
}


//class CompletedScreen extends StatefulWidget {
//   const CompletedScreen({super.key});
//
//   @override
//   State<CompletedScreen> createState() => _CompletedScreenState();
// }
//
// class _CompletedScreenState extends State<CompletedScreen> {
//
//   String _token = '';
//   late final OrderListBloc _orderListBloc;
//   @override
//   void initState() {
//     super.initState();
//     _orderListBloc = context.read<OrderListBloc>();
//     getUserToken();
//   }
//
//   Future<void> getUserToken() async {
//     var token = await UserSharedPreference.getValue(
//       SharedPreferenceHelper.token,
//     );
//     _token = token ?? "";
//     _orderListBloc.add(OrderList(status: "delivered",token: _token));
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     final ordersController = Provider.of<MyOrdersController>(context);
//     return Scaffold(
//       body:BlocConsumer<OrderListBloc, OrderListState>(
//         builder: (context, state) {
//           if (state is OrderListLoading) {
//             return const CommonLoading();
//           } else if (state is OrderListLoaded) {
//             return state.orderListModel.data!.isNotEmpty
//                 ? ListView.builder(
//               itemCount: state.orderListModel.data!.length,
//               itemBuilder: (context, index) {
//                 final data = state.orderListModel.data![index];
//                 return OrderCard(
//                   invoiceNumber: data.invoiceNumber.toString(),
//                   orderAmount: data.orderAmount,
//                   orderDate: data.orderDate,
//                   orderId: data.orderId,
//                   status: data.status,
//                 );
//               },
//             )
//                 : Center(
//               child: Text(
//                 "Order data not found",
//                 style: Theme.of(context).textTheme.bodyMedium?.copyWith(
//                   fontWeight: FontWeight.w500,
//                   fontSize: 16.sp,
//                 ),
//               ),
//             );
//           }
//           return const Center(
//             child: Text('No data available'),
//           );
//         },
//         listener: (context, state) {
//           if (state is OrderListConnectionError) {
//             CommonFunctions.showUpSnack(
//               message: AllString.noInternet,
//               context: context,
//             );
//           }
//         },
//       )
//     );
//   }
// }