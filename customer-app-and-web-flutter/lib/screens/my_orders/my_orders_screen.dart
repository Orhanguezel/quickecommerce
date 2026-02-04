import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/colors.dart';
import 'package:quick_ecommerce/screens/my_orders/all_orders_screen.dart';
import 'package:quick_ecommerce/screens/my_orders/ongoing_screen.dart';
import '../../controller/provider/my_orders_controller.dart';
import '../../l10n/app_localizations.dart';
import 'completed_screen.dart';


class MyOrdersScreen extends StatefulWidget {
  const MyOrdersScreen({super.key});

  @override
  State<MyOrdersScreen> createState() => _MyOrdersScreenState();
}

class _MyOrdersScreenState extends State<MyOrdersScreen>  with SingleTickerProviderStateMixin{
  @override
  Widget build(BuildContext context) {
    final ordersController = Provider.of<MyOrdersController>(context);
    return DefaultTabController(
      length: 4, // Number of tabs
      child: Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        appBar: PreferredSize(
          preferredSize:Size(double.infinity, 40.h),
          child: AppBar(
            backgroundColor: CustomColors.baseColor,
            bottom:  TabBar(
              isScrollable: true,
              dividerColor:const Color(0xFFAAAAAA),
              tabAlignment: TabAlignment.start,
              padding: EdgeInsets.symmetric(horizontal:kIsWeb ? 2 :  2.w),
              indicatorColor: CustomColors.baseColor,
              labelPadding: EdgeInsets.symmetric(horizontal:kIsWeb ? 4 : 4.w),
              unselectedLabelColor: const Color(0xFF837C7C),
              labelColor: Colors.black,
              labelStyle: TextStyle(fontSize: kIsWeb ? 14 :14.sp),
              tabs: [
                Tab(
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal:kIsWeb ? 6:  6.w,vertical:kIsWeb ? 8 :  8.h),
                  decoration:  BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(kIsWeb ? 8 : 8.r),
                  ),
                  child: Text('${ AppLocalizations.of(context)!.all} (${ordersController.allOrders.length.toString()})',),
                ),
                ),
                Tab(
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal:kIsWeb ? 6 :  6.w,vertical:kIsWeb ?8 :8.h),
                    decoration:  BoxDecoration(
                      color: const Color(0xFFFFF3CD),
                      borderRadius: BorderRadius.circular(kIsWeb ? 8 : 8.r),
                    ),
                    child: Text('${ AppLocalizations.of(context)!.pending} (${ordersController.pendingOrders.length.toString()})',),
                  ),
                ),
                Tab(
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: kIsWeb ? 6 : 6.w,vertical:kIsWeb ? 8 :  8.h),
                    decoration:  BoxDecoration(
                      color: const Color(0xFFD1ECF1),
                      borderRadius: BorderRadius.circular(kIsWeb ? 8 : 8.r),
                    ),
                    child: Text('${ AppLocalizations.of(context)!.shipped} (${ordersController.shippedOrders.length.toString()})',),
                  ),
                ),
                Tab(
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal:kIsWeb ? 6 :  6.w,vertical:kIsWeb ? 8 :  8.h),
                    decoration:  BoxDecoration(
                      color: const Color(0xFFD4EDDA),
                      borderRadius: BorderRadius.circular(kIsWeb ? 8 : 8.r),
                    ),
                    child: Text('${ AppLocalizations.of(context)!.completed} (${ordersController.deliveredOrders.length.toString()})',),
                  ),
                ),
              ],
            ),
          ),
        ),
        body: const TabBarView(
          children: [
            // Tab views
            AllOrdersScreen(),
            PendingOrdersScreen(),
            OngoingOrdersTab(),
            CompletedScreen(),
          ],
        ),
      ),
    );
  }
}



