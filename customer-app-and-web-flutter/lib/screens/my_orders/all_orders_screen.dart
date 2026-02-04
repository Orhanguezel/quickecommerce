import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/colors.dart';
import 'package:quick_ecommerce/controller/bloc/order_list_bloc/order_list_event.dart';
import 'package:quick_ecommerce/router/route_name.dart';
import 'package:quick_ecommerce/screens/my_orders/order_item_card.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/order_list_bloc/order_list_bloc.dart';
import '../../controller/bloc/order_list_bloc/order_list_state.dart';
import '../../controller/bloc/refresh_token/refresh_token_bloc.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/my_orders_controller.dart';
import '../../data/data_model/order_list.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/no_data_widget.dart';
import '../home/item_card.dart';

class AllOrdersScreen extends StatefulWidget {
  const AllOrdersScreen({super.key});

  @override
  State<AllOrdersScreen> createState() => _AllOrdersScreenState();
}

class _AllOrdersScreenState extends State<AllOrdersScreen> {
  String _token = '',_language='';
  late final OrderListBloc _orderListBloc;
  late final RefreshTokenBloc _refreshTokenBloc;
  final ScrollController _scrollController = ScrollController();
  @override
  void initState() {
    super.initState();
    _orderListBloc = context.read<OrderListBloc>();
    _scrollController.addListener(_onScroll);
    _refreshTokenBloc = context.read<RefreshTokenBloc>();
    getUserToken();
  }

  Timer? _debounce;
  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _debounce?.cancel();
    super.dispose();
  }
  void _onScroll() {
    if (_scrollController.position.pixels ==
        _scrollController.position.maxScrollExtent) {
      _loadMoreOrders();
    }
  }

  void _loadMoreOrders() {
    var commonCon = Provider.of<CommonProvider>(context,listen: false);
    if (commonCon.trendingCurrentPage < commonCon.trendingTotalPages) {
      commonCon.goToTrendingNextPage();
      _orderListBloc.add(OrderList(
        status: "",
        page: commonCon.trendingCurrentPage,
        token: _token, language: _language,
      ));
      commonCon.setLoading(true);

    }
  }

  Future<void> getUserToken() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _token = token ?? "";
    _language = language ?? "";
    _orderListBloc.add(OrderList(status: "", page: 1, token: _token, language:_language));
    if (!mounted) return;
     Provider.of<CommonProvider>(context,listen: false).setLoading(true);
  }

  List<OrderData> allOrders = [];
  bool isFetching = false;
  bool isLoading = true;

  @override
  Widget build(BuildContext context) {
    final ordersController = Provider.of<MyOrdersController>(context);
    var commonCon = Provider.of<CommonProvider>(context);
    return Column(
      children: [
        Expanded(
          child: ordersController.allOrders.isNotEmpty
              ? ListView.builder(
                 controller:_scrollController,
                  itemCount: ordersController.allOrders.length,
                  itemBuilder: (context, index) {
                    final data = ordersController.allOrders[index];
                    return OrderCard(
                      invoiceNumber: data.invoiceNumber.toString(),
                      orderAmount: data.orderAmount,
                      orderDate: data.orderDate,
                      orderId: data.orderId,
                      status: data.status,
                    );
                  },
                )
              :isLoading?ListView.builder(
            itemCount: 10,
            itemBuilder: (context, index) {
              return const ShimmerLoadingWidget();
            },
          ) :const Center(child: NoDataWidget()),
        ),
        SizedBox(
          height: 10.h,
        ),
        BlocConsumer<OrderListBloc, OrderListState>(
          builder: (context, state) {
            if (state is OrderListLoading&&isFetching) {
              return  CircularProgressIndicator(
                strokeWidth: .1.w,
                color: CustomColors.baseColor,
              );
            }
           else if (state is OrderListTokenExp) {
              CommonFunctions.checkTokenAndProceeds(
                refreshTokenBloc: _refreshTokenBloc,
                onProceed:() async {
                  _orderListBloc.add(OrderList(status: "", page: 1, token: _token, language:_language));
                },
             onLogout: ()async{
                  context.goNamed(RouteNames.loginScreen);
             }
              );
            }
            else if (state is OrderListLoaded) {
              if (state.hasConnectionError) {
                CommonFunctions.showCustomSnackBar(
                    context, AppLocalizations.of(context)!.noInternet
                );
              }
              isLoading=false;
              commonCon.setLoading(false);
              WidgetsBinding.instance.addPostFrameCallback((_) {
                for (var data in state.orderListModel.data!) {
                  ordersController.addOrder(data);
                }
              });
              final meta = state.orderListModel.meta;
              if (meta != null) {
                commonCon.setTrendingTotalPage(meta.lastPage);
              }
            }
            return const SizedBox();
          },
          listener: (context, state) {
            if (state is OrderListConnectionError) {
              CommonFunctions.showUpSnack(
                message: AppLocalizations.of(context)!.noInternet,
                context: context,
              );
              commonCon.setLoading(false);
            }
          },
        )
      ],
    );
  }
}

class PendingOrdersScreen extends StatelessWidget {
  const PendingOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ordersController = Provider.of<MyOrdersController>(context);
    return ordersController.pendingOrders.isNotEmpty
        ? ListView.builder(
            itemCount: ordersController.pendingOrders.length,
            itemBuilder: (context, index) {
              final data = ordersController.pendingOrders[index];
              return OrderCard(
                invoiceNumber: data.invoiceNumber.toString(),
                orderAmount: data.orderAmount,
                orderDate: data.orderDate,
                orderId: data.orderId,
                status: data.status,
              );
            },
          )
        : const Center(child: NoDataWidget());
  }
}
