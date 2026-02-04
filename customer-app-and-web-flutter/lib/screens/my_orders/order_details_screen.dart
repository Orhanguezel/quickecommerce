import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/bloc/save_bloc/save_event.dart';
import 'package:quick_ecommerce/controller/provider/currencie_controler.dart';
import 'package:quick_ecommerce/screens/common_widgets/commn_textfield.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_child_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_dropdown.dart';
import 'package:quick_ecommerce/screens/common_widgets/field_title.dart';
import 'package:quick_ecommerce/screens/common_widgets/no_data_widget.dart';
import 'package:quick_ecommerce/screens/live_chat/chat_page.dart';
import 'package:quick_ecommerce/screens/my_orders/track_order_screen.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/cancel_order_bloc/cancel_order_bloc.dart';
import '../../controller/bloc/cancel_order_bloc/cancel_order_event.dart';
import '../../controller/bloc/cancel_order_bloc/cancel_order_state.dart';
import '../../controller/bloc/notification_bloc/notificatioon_bloc.dart';
import '../../controller/bloc/notification_bloc/notificatioon_event.dart';
import '../../controller/bloc/notification_bloc/notificatioon_state.dart';
import '../../controller/bloc/order_details_bloc/order_details_state.dart';
import '../../controller/bloc/order_details_bloc/order_details_bloc.dart';
import '../../controller/bloc/order_details_bloc/order_details_event.dart';

import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../controller/bloc/save_bloc/save_state.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/message_input_conroller.dart';
import '../../controller/provider/my_orders_controller.dart';
import '../../controller/provider/filter_controller.dart';
import '../../data/data_model/notification_model.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_status_card.dart';
import '../home/item_card.dart';
import '../checkout/checkout_screen.dart';
import 'order_item_card.dart';

class OrderSummaryScreen extends StatefulWidget {
  const OrderSummaryScreen({super.key, required this.orderId});
  final String orderId;
  @override
  State<OrderSummaryScreen> createState() => _OrderSummaryScreenState();
}

class _OrderSummaryScreenState extends State<OrderSummaryScreen>{
  late final OrderDetailsBloc _orderDetailsBloc;
  final TextEditingController noteCon = TextEditingController();
  String _token = '', _language = '';
  bool _isLoaded = false;

  @override
  void initState() {
    super.initState();
    _orderDetailsBloc = context.read<OrderDetailsBloc>();
    getUserToken();
  }

  Future<void> getUserToken() async {
    if (_isLoaded) return;
    _isLoaded = true;
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _token = token ?? "";
    _language = language ?? "";
    _orderDetailsBloc.add(
        OrderDetails(token: _token, id: widget.orderId, language: _language));
  }

  @override
  Widget build(BuildContext context) {
    final currencyCon = Provider.of<CurrencyController>(context);
    var filterCon = Provider.of<FilterController>(context);
    final homeCon = Provider.of<HomeScreenProvider>(context);
    var messageCon = Provider.of<MessageInputProvider>(context);
    return Scaffold(
        appBar:!kIsWeb? AppBar(
          title: Text(
            AppLocalizations.of(context)!.orderDetails,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontSize: 18.sp,
                ),
          ),
          centerTitle: true,
          elevation: 0,
          titleTextStyle: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.w600, fontSize: 18.sp),
        ):null,
        body: BlocConsumer<OrderDetailsBloc, OrderDetailsState>(
          builder: (context, state) {
            if (state is OrderDetailsLoading) {
              return ListView.builder(
                itemCount: 10,
                itemBuilder: (context, index) {
                  return const ShimmerLoadingWidget();
                },
              );
            }
            else if (state is OrderDetailsLoaded) {
              if (state.hasConnectionError) {
                CommonFunctions.showCustomSnackBar(
                    context, AppLocalizations.of(context)!.noInternet);
              }
              final orderData = state.orderDetailsModel.orderData;
              final orderSummary = state.orderDetailsModel.orderSummary;
              final orderMuster =
                  state.orderDetailsModel.orderData!.orderMaster;
              final refund = state.orderDetailsModel.refund;
              final orderTracking = state.orderDetailsModel.orderTracking;
              double height = 50;
              if (orderData!.orderDetails != null) {
                height = (orderData.orderDetails!.length * 85) + 50;
              }
              return SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height:kIsWeb?4 :4.h),
                    CommonCard(
                        mVertical: kIsWeb?4 :4.h,
                        mHorizontal:kIsWeb?0:12,
                        pRight: kIsWeb?20:12,
                        pLeft: kIsWeb?20:12,
                        widget: Column(
                          children: [
                            Row(
                              children: [
                                Text(
                                  "${AppLocalizations.of(context)!.orderId}: ",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                          fontSize:kIsWeb?20 : 20.sp,
                                          fontWeight: FontWeight.w600),
                                ),
                                Text(
                                  orderData.orderId.toString(),
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                          fontSize: kIsWeb?20 :20.sp,
                                          fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                            SizedBox(
                              height: kIsWeb?10:10.h,
                            ),
                            buildOrderMasterRow(
                                AppLocalizations.of(context)!.orderAmount,
                                currencyCon
                                    .formatCurrency(orderData.orderAmount),
                                const Color(0xFFDADFE3)),
                            statusOrderMasterRow(
                              AppLocalizations.of(context)!.orderStatus,
                              orderData.status,
                            ),
                            buildOrderMasterRow(
                                AppLocalizations.of(context)!.paymentGetaway,
                                Utils.formatUnderscore(
                                    orderData.orderMaster?.paymentGateway),
                                const Color(0xFFDADFE3)),
                            statusOrderMasterRow(
                                AppLocalizations.of(context)!.paymentStatus,
                                orderData.paymentStatus),
                            buildOrderMasterRow(
                                AppLocalizations.of(context)!.orderDate,
                                Utils.formatDate(orderData.orderDate),
                                const Color(0xFFDADFE3)),
                            SizedBox(height: kIsWeb?10 :10.h),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                const Spacer(),
                                if (orderData.status == "delivered" &&
                                    orderData.deliverymanReviewStatus == false)
                                  ChildButton(
                                      padding: EdgeInsets.symmetric(
                                          horizontal: kIsWeb?6 :6.w, vertical:kIsWeb?10 : 10.h),
                                      color: const Color(0xFFFF5555),
                                      widget: Text(
                                        AppLocalizations.of(context)!.review,
                                        style: Theme.of(context)
                                            .textTheme
                                            .titleLarge
                                            ?.copyWith(
                                                fontWeight: FontWeight.w400,
                                                fontSize: kIsWeb?11 :11.sp),
                                      ),
                                      onPressed: () {
                                        filterCon.clearRatings();
                                        showDialog(
                                          context: context,
                                          builder: (context) => ReviewDialog(
                                            orderId: Utils.formatString(
                                                orderData.orderId),
                                            storeId: Utils.formatString(
                                                orderData.storeDetails!.id),
                                            reviewableId: Utils.formatString(
                                                orderData.deliveryman?.id),
                                            type: "delivery_man",
                                          ),
                                        );
                                      }),
                                SizedBox(
                                  width: 4.w,
                                ),
                                if (orderData.status == "delivered" &&
                                    orderData.refundStatus == null)
                                  ChildButton(
                                      padding: EdgeInsets.symmetric(
                                          horizontal: kIsWeb?6 :6.w, vertical:kIsWeb?10 : 10.h),
                                      color: const Color(0xFFFF5555),
                                      widget: Text(
                                        AppLocalizations.of(context)!
                                            .refundRequested,
                                        style: Theme.of(context)
                                            .textTheme
                                            .titleLarge
                                            ?.copyWith(
                                                fontWeight: FontWeight.w400,
                                                fontSize:kIsWeb?11 : 11.sp),
                                      ),
                                      onPressed: () {
                                        _showAlertDialog(context,
                                            orderData.orderId.toString());
                                      }),
                                if (orderData.status != "delivered" &&
                                    orderData.status != "cancelled") ...[
                                  SizedBox(width: kIsWeb?10 :10.w),
                                  ChildButton(
                                      padding: EdgeInsets.symmetric(
                                          horizontal: kIsWeb?6 :6.w, vertical:kIsWeb?8 : 8.h),
                                      color: const Color(0xFFE8F1FD),
                                      widget: Row(
                                        children: [
                                          Image.asset(
                                            AssetsIcons.trackOrder,
                                            height: kIsWeb?14 :14.h,
                                            width: kIsWeb?14 :14.w,
                                          ),
                                          SizedBox(
                                            width: kIsWeb?4 :5.w,
                                          ),
                                          Text(
                                            AppLocalizations.of(context)!
                                                .trackOrder,
                                            style: Theme.of(context)
                                                .textTheme
                                                .headlineLarge
                                                ?.copyWith(
                                                    fontWeight: FontWeight.w400,
                                                    fontSize:kIsWeb?11: 11.sp),
                                          ),
                                        ],
                                      ),
                                      onPressed: () {
                                        if(kIsWeb){
                                          showDialog(
                                            context: context,
                                            builder: (BuildContext context) {
                                              return AlertDialog(
                                                contentPadding: const EdgeInsets.all(0),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(16),
                                                ),
                                                content: SizedBox(
                                                  width: MediaQuery.of(context).size.width * 0.5,
                                                  child: TrackOrderScreen(
                                                    orderId: Utils.formatString(orderData.orderId),
                                                    orderStatus: Utils.formatString(orderData.status),
                                                    storeLat: Utils.formatDouble(orderData.storeDetails!.latitude),
                                                    storeLong: Utils.formatDouble(orderData.storeDetails!.longitude),
                                                    orderTracking: orderTracking!,
                                                  ),
                                                ),
                                              );
                                            },
                                          );
                                        }else{
                                          context.pushNamed(
                                              RouteNames.trackOrderScreen,
                                              extra: {
                                                "order_id":Utils.formatString(orderData.orderId),
                                                "order_status":Utils.formatString(orderData.status),
                                                "store_lat":Utils.formatDouble(orderData.storeDetails!.latitude),
                                                "store_long":Utils.formatDouble(orderData.storeDetails!.longitude),
                                                "d_lat":Utils.formatDouble(orderData.storeDetails!.longitude),
                                                "d_long":Utils.formatDouble(orderData.storeDetails!.longitude),
                                                "order_tracking":orderTracking,
                                              });
                                        }
                                      }),
                                  SizedBox(width: kIsWeb?10 :10.w),
                                  ChildButton(
                                      padding: EdgeInsets.symmetric(
                                          horizontal: kIsWeb?6 :6.w, vertical: kIsWeb?10 :10.h),
                                      color: const Color(0xFFFFECE5),
                                      borderColor: const Color(0xFFFF5555),
                                      widget: Text(
                                        AppLocalizations.of(context)!
                                            .cancelOrder,
                                        style: Theme.of(context)
                                            .textTheme
                                            .headlineLarge
                                            ?.copyWith(
                                            fontWeight: FontWeight.w400,
                                            color:
                                            const Color(0xFFFF5555),
                                            fontSize: kIsWeb?11 :11.sp),
                                      ),
                                      onPressed: () {
                                        _cancelDialog(context,Utils.formatString(orderData.orderId));
                                      }),
                                ],
                              ],
                            ),
                          ],
                        )
                    ),
                    if (refund != null)
                      CommonCard(
                          mVertical: 4,
                          mHorizontal:kIsWeb?0:12,
                          widget: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                AppLocalizations.of(context)!.refundRequested,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                        fontWeight: FontWeight.w600,
                                        fontSize:kIsWeb?18 : 18.sp),
                              ),
                              Text(
                                AppLocalizations.of(context)!.orderSummary,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                        fontWeight: FontWeight.w400,
                                        fontSize: kIsWeb?14 :14.sp),
                              ),
                              Text(
                                "${AppLocalizations.of(context)!.reason}:   Wrong product",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                        fontWeight: FontWeight.w400,
                                        fontSize: kIsWeb?14 :14.sp),
                              ),
                              Text(
                                "${AppLocalizations.of(context)!.amount}: \$1000",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                        fontWeight: FontWeight.w400,
                                        fontSize:kIsWeb?14 : 14.sp),
                              ),
                              SizedBox(height: kIsWeb?4 :4.h),
                              Row(
                                children: [
                                  Text(
                                    AppLocalizations.of(context)!.status,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                            fontWeight: FontWeight.w400,
                                            fontSize:kIsWeb?14 : 14.sp),
                                  ),
                                  SizedBox(width:kIsWeb?10 : 10.w),
                                  OrderStatusCard(
                                    text: Utils.capitalizeFirstLetter(
                                        refund.status),
                                    status: refund.status,
                                  )
                                ],
                              ),
                              SizedBox(
                                height:kIsWeb?10 : 10.h,
                              ),
                              Row(
                                children: [
                                  Text(
                                    AppLocalizations.of(context)!.file,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                            fontWeight: FontWeight.w400,
                                            fontSize:kIsWeb?14 : 14.sp),
                                  ),
                                  SizedBox(width: kIsWeb?10 :10.w),
                                  InkWell(
                                    onTap: () {
                                      //  _showFileDialog(context);
                                    },
                                    child: const CommonStatusCard(
                                        borderColor: Color(0xFFFD4600),
                                        backgroundColor: Color(0xFFFFECE5),
                                        text: "Pending"),
                                  )
                                ],
                              ),
                            ],
                          )),
                    SizedBox(
                      height:kIsWeb? height : height.h,
                      child: CommonCard(
                          mVertical:kIsWeb?4 : 4.h,
                          mHorizontal:kIsWeb?0:12,
                          widget: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                AppLocalizations.of(context)!.itemDetails,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                        fontWeight: FontWeight.w600,
                                        fontSize: kIsWeb?16 :16.sp),
                              ),
                              Divider(
                                thickness:kIsWeb?1 : 1.h,
                                color: Colors.grey.shade200,
                              ),
                              Expanded(
                                child: ListView.builder(
                                    physics:
                                        const NeverScrollableScrollPhysics(),
                                    shrinkWrap: true,
                                    itemCount: orderData.orderDetails!.length,
                                    itemBuilder: (context, index) {
                                      final data =
                                          orderData.orderDetails![index];
                                      String variant = '';
                                      if (data.variantDetails != null &&
                                          data.variantDetails is String) {
                                        // Decode the JSON string
                                        final Map<String, dynamic>
                                            attributesMap = jsonDecode(
                                                data.variantDetails as String);

                                        // Map to a string format
                                        variant = attributesMap.entries
                                            .map((e) => '${e.key}: ${e.value}')
                                            .join(',');
                                      } else if (data.variantDetails
                                          is Map<String, dynamic>) {
                                        // If already a map, use it directly
                                        final Map<String, dynamic>
                                            attributesMap = data.variantDetails
                                                as Map<String, dynamic>;

                                        // Map to a string format
                                        variant = attributesMap.entries
                                            .map((e) => '${e.key}: ${e.value}')
                                            .join(',');
                                      } else {
                                        // Handle cases where variantDetails is null or not a valid type
                                        variant = 'No details available';
                                      }
                                      return Column(
                                        children: [
                                          Row(
                                            children: [
                                              CommonImage(
                                                imageUrl:
                                                    data.productImageUrl ?? '',
                                                height:kIsWeb?50 : 50.h,
                                                width:kIsWeb?53 : 53.w,
                                              ),
                                              SizedBox(width:kIsWeb?6 : 6.w),
                                              Expanded(
                                                  flex: 2,
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        data.productName ?? "",
                                                        style: Theme.of(context)
                                                            .textTheme
                                                            .bodyMedium
                                                            ?.copyWith(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w600,
                                                                fontSize:
                                                                kIsWeb?12 : 12.sp),
                                                      ),
                                                      SizedBox(height:kIsWeb?6 : 6.h),
                                                      Text(
                                                        variant,
                                                        maxLines: 3,
                                                        style: Theme.of(context)
                                                            .textTheme
                                                            .bodyMedium
                                                            ?.copyWith(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w400,
                                                                fontSize:
                                                                kIsWeb?10 :10.sp),
                                                      ),
                                                      SizedBox(height: kIsWeb?6 :6.h),
                                                      data.reviewStatus == false&&orderData.status=="delivered"
                                                          ? InkWell(
                                                              onTap: () {
                                                                filterCon
                                                                    .clearRatings();
                                                                showDialog(
                                                                  context:
                                                                      context,
                                                                  builder:
                                                                      (context) =>
                                                                          ReviewDialog(
                                                                    orderId:
                                                                        data.orderId ??
                                                                            "",
                                                                    storeId:
                                                                        data.storeId ??
                                                                            "",
                                                                    reviewableId:
                                                                        data.productId ??
                                                                            "",
                                                                    type:
                                                                        "product",
                                                                  ),
                                                                );
                                                              },
                                                              child: Text(
                                                                AppLocalizations.of(
                                                                        context)!
                                                                    .review,
                                                                style: Theme.of(
                                                                        context)
                                                                    .textTheme
                                                                    .headlineLarge
                                                                    ?.copyWith(
                                                                        fontWeight:
                                                                            FontWeight
                                                                                .w700,
                                                                        fontSize:
                                                                        kIsWeb?10 : 10.sp),
                                                              ),
                                                            )
                                                          : const SizedBox(),
                                                    ],
                                                  )),
                                              SizedBox(width:kIsWeb?6: 6.h),
                                              Expanded(
                                                flex: 2,
                                                child: Column(
                                                  children: [
                                                    Row(
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .spaceBetween,
                                                      children: [
                                                        Text(
                                                          "${AppLocalizations.of(context)!.price}: ",
                                                          style: Theme.of(
                                                                  context)
                                                              .textTheme
                                                              .bodyMedium
                                                              ?.copyWith(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w400,
                                                                  fontSize:
                                                                  kIsWeb?10 : 10.sp),
                                                        ),
                                                        Text(
                                                          currencyCon
                                                              .formatCurrency(data
                                                                  .price
                                                                  .toString()),
                                                          style: Theme.of(
                                                                  context)
                                                              .textTheme
                                                              .bodyMedium
                                                              ?.copyWith(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w500,
                                                                  fontSize:
                                                                  kIsWeb?10 : 10.sp),
                                                        ),
                                                      ],
                                                    ),
                                                    SizedBox(height:kIsWeb?6 : 6.h),
                                                    Row(
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .spaceBetween,
                                                      children: [
                                                        Text(
                                                          "${AppLocalizations.of(context)!.qty}:",
                                                          style: Theme.of(
                                                                  context)
                                                              .textTheme
                                                              .bodyMedium
                                                              ?.copyWith(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w400,
                                                                  fontSize:
                                                                  kIsWeb?10 :10.sp),
                                                        ),
                                                        Text(Utils.formatString(data.quantity),
                                                          style: Theme.of(
                                                                  context)
                                                              .textTheme
                                                              .bodyMedium
                                                              ?.copyWith(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w500,
                                                                  fontSize:
                                                                  kIsWeb?10 :10.sp),
                                                        ),
                                                      ],
                                                    ),
                                                    SizedBox(height: kIsWeb?6 :6.h),
                                                    SingleChildScrollView(
                                                      scrollDirection: Axis.horizontal,
                                                      child: Row(
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .spaceBetween,
                                                        children: [
                                                          Text(
                                                            "${AppLocalizations.of(context)!.totalPrice}:",
                                                            style: Theme.of(
                                                                    context)
                                                                .textTheme
                                                                .bodyMedium
                                                                ?.copyWith(
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w400,
                                                                    fontSize:
                                                                    kIsWeb?10 : 10.sp),
                                                          ),
                                                          Text(
                                                            currencyCon
                                                                .formatCurrency(data
                                                                    .lineTotalPriceWithQty
                                                                    .toString()),
                                                            overflow: TextOverflow
                                                                .ellipsis,
                                                            style: Theme.of(
                                                                    context)
                                                                .textTheme
                                                                .bodyMedium
                                                                ?.copyWith(
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w500,
                                                                    fontSize:
                                                                    kIsWeb?10 :10.sp),
                                                          ),
                                                        ],
                                                      ),

                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                          if (index <
                                              orderData.orderDetails!.length -
                                                  1)
                                            Divider(
                                              thickness: kIsWeb?1 :1.h,
                                              color: Colors.grey.shade200,
                                            )
                                        ],
                                      );
                                    }),
                              ),
                            ],
                          )),
                    ),
                    CommonCard(
                        mVertical:kIsWeb?4 : 4.h,
                        mHorizontal:kIsWeb?0:12,
                        widget: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              AppLocalizations.of(context)!.orderSummary,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(
                                      fontWeight: FontWeight.w600,
                                      fontSize: kIsWeb?16 :16.sp),
                            ),
                            Divider(
                              thickness:kIsWeb?1 : 1.h,
                              color: Colors.grey,
                            ),
                            CommonRow(
                              label: AppLocalizations.of(context)!.subTotal,
                              value: currencyCon.formatCurrency(
                                  orderSummary!.subtotal.toString()),
                            ),
                            CommonRow(
                              label:
                                  AppLocalizations.of(context)!.couponDiscount,
                              value: currencyCon.formatCurrency(
                                  orderSummary.couponDiscount.toString()),
                            ),
                            CommonRow(
                              label: AppLocalizations.of(context)!.tax,
                              value: currencyCon.formatCurrency(
                                  orderSummary.totalTaxAmount.toString()),
                            ),
                            CommonRow(
                              label: AppLocalizations.of(context)!
                                  .additionalCharge,
                              value:
                                  '(+) ${currencyCon.formatCurrency(orderSummary.additionalCharge.toString())}',
                            ),
                            CommonRow(
                              label: AppLocalizations.of(context)!.deliveryFee,
                              value:
                                  '(+)${currencyCon.formatCurrency(orderSummary.shippingCharge.toString())}',
                            ),
                            Divider(
                              thickness: kIsWeb?1 :1.w,
                              color: const Color(0xFFC1C1C1),
                            ),
                            CommonRow(
                              label: AppLocalizations.of(context)!.totalAmount,
                              value: currencyCon.formatCurrency(
                                  orderSummary.totalAmount.toString()),
                              isBold: true,
                              textColor: const Color(0xFF2563EB),
                            ),
                          ],
                        )),
                    orderMuster?.orderNotes != null
                        ? CommonCard(
                            mVertical: kIsWeb?4 :4.h,
                        mHorizontal:kIsWeb?0:12,
                            widget: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  AppLocalizations.of(context)!.orderNote,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                          fontWeight: FontWeight.w600,
                                          fontSize: kIsWeb?16:16.sp),
                                ),
                                Divider(
                                  thickness:kIsWeb?1 : 1.h,
                                  color: Colors.grey,
                                ),
                                Text(
                                  "Please ensure the order is securely packaged to prevent damage during transit. Delivery should be made between 10:00 AM and 4:00 PM  on weekdays only. Kindly contact me at 0170000000 before arriving for delivery confirmation. ",
                                  style: Theme.of(context)
                                      .textTheme
                                      .displayLarge
                                      ?.copyWith(
                                          fontWeight: FontWeight.w400,
                                          fontSize:kIsWeb?12 : 12.sp),
                                ),
                              ],
                            ))
                        : const SizedBox(),
                    CommonCard(
                        mVertical: kIsWeb?4 :4.h,
                        mHorizontal:kIsWeb?0:12,
                        widget: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Image.asset(
                                  AssetsIcons.delivery,
                                  height:kIsWeb?26 : 26.h,
                                  width: kIsWeb?26 :26.w,
                                  color: Colors.black,
                                ),
                                SizedBox(
                                  width:kIsWeb?15 : 15.w,
                                ),
                                Text(
                                  AppLocalizations.of(context)!.deliveryInfo,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                          fontWeight: FontWeight.w600,
                                          fontSize: kIsWeb?16 :16.sp),
                                ),
                              ],
                            ),
                            buildOrderMasterRow(
                                AppLocalizations.of(context)!.deliveryType,
                                Utils.formatString(orderData.deliveryType),
                                const Color(0xFFDADFE3)),
                            buildOrderMasterRow(
                                AppLocalizations.of(context)!.deliveryFee,
                                currencyCon.formatCurrency(
                                    Utils.formatString(
                                        orderData.shippingCharge)),
                                const Color(0xFFDADFE3)),
                            buildOrderMasterRow(
                                AppLocalizations.of(context)!.deliveryTime,
                                Utils.formatString(orderData.deliveryTime),
                                orderData.deliveryTime != null
                                    ? const Color(0xFFDADFE3)
                                    : Theme.of(context)
                                        .scaffoldBackgroundColor),
                          ],
                        )),
                    if(orderData.deliveryman!=null)
                    CommonCard(
                        mVertical:kIsWeb?4: 4.h,
                        mHorizontal:kIsWeb?0:12,
                        widget: Column(
                          children: [
                            Row(
                              children: [
                                Image.asset(
                                  AssetsIcons.person,
                                  height:kIsWeb?26 : 26.h,
                                  width: kIsWeb?26 :26.w,
                                ),
                                SizedBox(
                                  width: kIsWeb?5 :5.w,
                                ),
                                Text(
                                  AppLocalizations.of(context)!.deliverymanInfo,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                          fontWeight: FontWeight.w600,
                                          fontSize: kIsWeb?14 :14.sp),
                                ),
                                const Spacer(),
                                MessagesButton(
                                  onTap: () {
                                    Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (_) =>
                                                ChatPage(
                                                  name: Utils.capitalizeFirstLetter(
                                                      orderData.deliveryman?.name),
                                                  isOnline: false,
                                                  receiverId: Utils.formatString(
                                                      orderData.deliveryman?.id),
                                                  receiverType: Utils.formatString(
                                                      "deliveryman"),
                                                  userImg: Utils.formatString(
                                                      ""),
                                                )));
                                  },
                                ),
                              ],
                            ),
                            SizedBox(height:kIsWeb?13 : 13.h),
                            Row(
                              children: [
                                SizedBox(width:kIsWeb?30 : 30.h),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    RichText(
                                      text: TextSpan(
                                        text:
                                            '${AppLocalizations.of(context)!.name}:  ', // First part
                                        style: Theme.of(context)
                                            .textTheme
                                            .displayLarge
                                            ?.copyWith(
                                                fontWeight: FontWeight.w400,
                                                fontSize:kIsWeb?14 : 14.sp),
                                        children: <TextSpan>[
                                          TextSpan(
                                            text: orderData.deliveryman?.name ??
                                                "Not Found",
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium
                                                ?.copyWith(
                                                    fontWeight: FontWeight.w500,
                                                    fontSize:kIsWeb?14 : 14.sp),
                                          ),
                                        ],
                                      ),
                                    ),
                                    SizedBox(height:kIsWeb?12 : 12.h),
                                    RichText(
                                      text: TextSpan(
                                        text: AppLocalizations.of(context)!
                                            .contact, // First part
                                        style: Theme.of(context)
                                            .textTheme
                                            .displayLarge
                                            ?.copyWith(
                                                fontWeight: FontWeight.w400,
                                                fontSize:kIsWeb?14 : 14.sp),
                                        children: <TextSpan>[
                                          TextSpan(
                                            text: ': ',
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium
                                                ?.copyWith(
                                                    fontWeight: FontWeight.w500,
                                                    fontSize: kIsWeb?16 :16.sp),
                                          ),
                                          TextSpan(
                                            text:
                                                orderData.deliveryman?.phone ??
                                                    "Not Found",
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium
                                                ?.copyWith(
                                                    fontWeight: FontWeight.w500,
                                                    fontSize:kIsWeb?14 : 14.sp),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            SizedBox(height:kIsWeb?10 : 10.h),
                            Divider(
                              thickness: kIsWeb?1 :1.h,
                              color: const Color(0xFFC1C1C1),
                            ),
                            SizedBox(height:kIsWeb?4 : 4.h),
                            InkWell(
                              onTap: () {
                                context.pushNamed(
                                    RouteNames.trackOrderScreen,
                                    extra: {
                                      "order_id":Utils.formatString(orderData.orderId),
                                      "order_status":Utils.formatString(orderData.status),
                                      "store_lat":Utils.formatDouble(orderData.storeDetails!.latitude),
                                      "store_long":Utils.formatDouble(orderData.storeDetails!.longitude),
                                      "order_tracking":orderTracking,
                                    });
                              },
                              child: Row(
                                children: [
                                  Image.asset(
                                    AssetsIcons.person,
                                    height: kIsWeb?26 :26.h,
                                    width: kIsWeb?26 :26.w,
                                  ),
                                  SizedBox(
                                    width: kIsWeb?5 :5.w,
                                  ),
                                  RichText(
                                    text: TextSpan(
                                      text:
                                          '${AppLocalizations.of(context)!.location}:', // First part
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                              fontWeight: FontWeight.w400,
                                              fontSize: kIsWeb?16 :16.sp),
                                      children: <TextSpan>[
                                        TextSpan(
                                          text: ' View Map',
                                          style: Theme.of(context)
                                              .textTheme
                                              .headlineLarge
                                              ?.copyWith(
                                                  fontWeight: FontWeight.w500,
                                                  fontSize: kIsWeb?16 :16.sp),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        )),
                   if( orderData.storeDetails!=null)
                    CommonCard(
                        mVertical: kIsWeb?4 :4.h,
                        mHorizontal:kIsWeb?0:12,
                        widget: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Row(
                              children: [
                                Image.asset(
                                  AssetsIcons.person,
                                  height: kIsWeb?26 :26.h,
                                  width: kIsWeb?26 :26.w,
                                ),
                                SizedBox(
                                  width: kIsWeb?12 :12.w,
                                ),
                                Text(
                                  AppLocalizations.of(context)!.storeInfo,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                          fontWeight: FontWeight.w600,
                                          fontSize:kIsWeb?16 : 16.sp),
                                ),
                                const Spacer(),
                                if (orderData.storeDetails?.liveChat)

                                  MessagesButton(
                                    onTap: () {
                                      if(kIsWeb){
                                        homeCon.setTabType("Menu");
                                        homeCon.setMenuName("ChatList");
                                        messageCon.setUserInfo(
                                            Utils.capitalizeFirstLetter(
                                                orderData.storeDetails?.name),
                                            Utils.formatString(
                                                orderData.storeDetails?.id),
                                            "store",
                                            Utils.formatString(
                                                orderData.storeDetails?.logo),
                                            false
                                        );
                                      }
                                      else{
                                      Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                              builder: (_) =>
                                                   ChatPage(
                                                    name: Utils.capitalizeFirstLetter(
                                                        orderData.storeDetails?.name),
                                                    isOnline: false,
                                                    receiverId: Utils.formatString(
                                                        orderData.storeDetails?.id??""),
                                                    receiverType:"store",
                                                    userImg: Utils.formatString(
                                                        orderData.storeDetails?.logo),
                                                  )));}
                                    },
                                  ),
                              ],
                            ),
                            Row(
                              children: [
                                SizedBox(
                                  width:kIsWeb?20 : 20.w,
                                ),
                                CommonImage(
                                  imageUrl: orderData.storeDetails?.logo ?? "",
                                  height: kIsWeb?60 :60.h,
                                  width: kIsWeb?57 :57.w,
                                ),
                                SizedBox(
                                  width: kIsWeb?5 :5.w,
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      orderData.storeDetails?.name ?? "",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                              fontWeight: FontWeight.w600,
                                              fontSize: kIsWeb?17 :17.sp),
                                    ),
                                    SizedBox(
                                      height: kIsWeb?12 :12.w,
                                    ),
                                    StarRating(
                                        rating: orderData.storeDetails?.rating
                                                .toString() ??
                                            "00"),
                                  ],
                                )
                              ],
                            )
                          ],
                        )),
                    SizedBox(height:kIsWeb?4 : 4.h),
                  ],
                ),
              );
            }
            return const NoDataWidget();
          },
          listener: (context, state) {
            if (state is OrderDetailsConnectionError) {
              CommonFunctions.showUpSnack(
                message: AppLocalizations.of(context)!.noInternet,
                context: context,
              );
            }
          },
        ));
  }

  Widget buildOrderMasterRow(String title, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          "$title:",
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(fontSize:kIsWeb?14 : 14.sp, fontWeight: FontWeight.w500),
        ),
        value.isNotEmpty
            ? Container(
                margin: EdgeInsets.symmetric(vertical:kIsWeb?2 : 2.h),
                padding: EdgeInsets.symmetric(vertical: kIsWeb?6 :6.h, horizontal:kIsWeb?8 : 8.w),
                decoration: BoxDecoration(
                    color: color, borderRadius: BorderRadius.circular(kIsWeb?5 :5.r)),
                child: Text(
                  value,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(fontSize: kIsWeb?12 :12.sp, fontWeight: FontWeight.w500),
                ),
              )
            : const SizedBox(),
      ],
    );
  }

  Widget statusOrderMasterRow(String title, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 2.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            "$title:",
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(fontSize:kIsWeb?14 : 14.sp, fontWeight: FontWeight.w500),
          ),
          value.isNotEmpty
              ? OrderStatusCard(
                  text: Utils.capitalizeFirstLetter(value),
                  status: value,
                )
              : const SizedBox(),
        ],
      ),
    );
  }

  void _showAlertDialog(BuildContext context, String orderId) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          contentPadding: EdgeInsets.all(0.sp),
          content: RefundDialog(
            orderId: orderId,
          ),
        );
      },
    );
  }
  void _cancelDialog(BuildContext context, String orderId) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          contentPadding: EdgeInsets.all(0.sp),
          content: CancelDialog(
            orderId: orderId,
          ),
        );
      },
    );
  }
}

class RefundDialog extends StatefulWidget {
  final String orderId;
  const RefundDialog({super.key, required this.orderId});

  @override
  State<RefundDialog> createState() => _RefundDialogState();
}

class _RefundDialogState extends State<RefundDialog> {
  final TextEditingController noteCon = TextEditingController();
  late final SaveBloc _saveBloc;
  late final NotificationBloc _notificationBloc;
  late final OrderDetailsBloc _orderDetailsBloc;
  String _token = '',_language='';
  @override
  void initState() {
    super.initState();
    _saveBloc = context.read<SaveBloc>();
    _notificationBloc = context.read<NotificationBloc>();
    _orderDetailsBloc = context.read<OrderDetailsBloc>();
    getUserToken();
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
    _notificationBloc.add(RefundReasonListEvent(
      token: _token,
    ));
  }

  XFile? pickedFile;
  Future<void> _pickImage() async {
    final picker = ImagePicker();
    pickedFile = await picker.pickImage(
      source: ImageSource.gallery, // Or ImageSource.camera
      maxWidth: 300,
      maxHeight: 300,
    );
  }

  List<NotificationData> reasonData = [];
  List<String> reasonList = [];
  String reasonId = '';

  @override
  Widget build(BuildContext context) {
    final ordersController = Provider.of<MyOrdersController>(context);
    var commonProvider = Provider.of<CommonProvider>(context);
    return Container(
      height: 350.h,
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 10.h),
      decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12.r),
          color: Theme.of(context).scaffoldBackgroundColor),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            height: 6.h,
          ),
          Image.asset(
            AssetsIcons.warning,
            height: 26.h,
            width: 26.w,
          ),
          SizedBox(
            height: 10.h,
          ),
          Text(
            AppLocalizations.of(context)!.areYouSureToRefund,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(fontWeight: FontWeight.w600, fontSize: 20.sp),
          ),
          SizedBox(
            height: 6.h,
          ),
          Text(
            AppLocalizations.of(context)!.youWantToRefundThisOrder,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(fontWeight: FontWeight.w400, fontSize: 14.sp),
          ),
          SizedBox(
            height: 6.h,
          ),
          BlocConsumer<NotificationBloc, NotificationState>(
            builder: (context, state) {
              if (state is NotificationLoading) {
                return const SizedBox();
              }
              if (state is NotificationTokenExp) {
                CommonFunctions.logOut();
                context.goNamed(RouteNames.loginScreen);
                return const SizedBox();
              }
              if (state is NotificationLoaded) {
                final data = state.notificationModel.data ?? [];
                reasonData = data; // Update reasonData list
                reasonList = data.map((item) => item.label.toString()).toList();

                if (reasonList.isEmpty) {
                  return Text(
                    AppLocalizations.of(context)!.email,
                    style: Theme.of(context).textTheme.bodyMedium,
                  );
                }

                return CommonDropdown(
                  title: AppLocalizations.of(context)!.reason,
                  dropdownValue: ordersController.selectedReason.isNotEmpty
                      ? ordersController.selectedReason
                      : null, // Allow null initially
                  dList: reasonList,
                  onChanged: (String? value) {
                    if (value != null) {
                      ordersController.setReason(value);

                      reasonId = reasonData
                          .firstWhere(
                              (e) => e.label == ordersController.selectedReason)
                          .id
                          .toString();
                    }
                  },
                );
              }
              return const SizedBox(); // Default fallback widget
            },
            listener: (context, state) {
              if (state is NotificationConnectionError) {
                CommonFunctions.showUpSnack(
                  message: AppLocalizations.of(context)!.noInternet,
                  context: context,
                );
              }
            },
          ),
          FieldTitle(
            title: AppLocalizations.of(context)!.notes,
          ),
          CommonTextFields(
              controler: noteCon,
              hint: "hint",
              textAlign: TextAlign.start,
              redOnly: false),
          SizedBox(
            height: 6.h,
          ),
          InkWell(
            onTap: () {
              _pickImage();
            },
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  AppLocalizations.of(context)!.file,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(fontWeight: FontWeight.w500, fontSize: 14.sp),
                ),
                Image.asset(
                  AssetsIcons.file,
                  height: 20.h,
                  width: 20.w,
                ),
              ],
            ),
          ),
          SizedBox(
            height: 6.h,
          ),
          BlocConsumer<SaveBloc, SaveState>(
            listener: (context, state) {
              if (state is SaveConnectionError) {
                CommonFunctions.showCustomSnackBar(
                    context, AppLocalizations.of(context)!.noInternet);
              } else if (state is SaveFailure) {
                CommonFunctions.showCustomSnackBar(
                    context, state.authModel.message);
              } else if (state is SaveLoaded) {
                CommonFunctions.showUpSnack(
                  message: state.authModel.message,
                  context: context,
                );
                _orderDetailsBloc.add(OrderDetails(
                    token: _token,
                    id: widget.orderId,
                    language: _language));
                context.pop();
              }
            },
            builder: (context, state) {
              if (state is SaveLoading) {
                return const CommonLoadingButton();
              }
              return Align(
                alignment: Alignment.centerLeft,
                child: ChildButton(
                    padding:
                        EdgeInsets.symmetric(horizontal: 4.w, vertical: 8.h),
                    color: const Color(0xFF165CBA),
                    widget: Text(
                      AppLocalizations.of(context)!.confirmRejection,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w500, fontSize: 14.sp),
                    ),
                    onPressed: () {
                      if (ordersController.selectedReason.isNotEmpty) {
                        commonProvider.setLoading(true);
                        _saveBloc.add(RequestRefundEvent(
                            orderId: widget.orderId,
                            reasonId: reasonId,
                            note: noteCon.text,
                            image: pickedFile,
                            token: _token));
                      } else {
                        CommonFunctions.showCustomSnackBar(
                            context, "Please select rezone");
                      }
                    }),
              );
            },
          )
        ],
      ),
    );
  }
}



class CancelDialog extends StatefulWidget {
  final String orderId;
  const CancelDialog({super.key, required this.orderId});

  @override
  State<CancelDialog> createState() => _CancelDialogState();
}

class _CancelDialogState extends State<CancelDialog> {
  final TextEditingController noteCon = TextEditingController();
  late final CancelOrderBloc _cancelOrderBloc;
  late final OrderDetailsBloc _orderDetailsBloc;
  String _token = '',_language='';
  @override
  void initState() {
    super.initState();
    _cancelOrderBloc = context.read<CancelOrderBloc>();
    _orderDetailsBloc = context.read<OrderDetailsBloc>();
    getUserToken();
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
  }

  @override
  Widget build(BuildContext context) {
    final ordersController = Provider.of<MyOrdersController>(context);
    return Container(
      height:kIsWeb?200 : 180.h,
      padding: EdgeInsets.symmetric(horizontal: kIsWeb?10 :10.w, vertical:kIsWeb?10 : 10.h),
      decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(kIsWeb?12 :12.r),
          color: Theme.of(context).scaffoldBackgroundColor),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            height:kIsWeb?6 : 6.h,
          ),
          Image.asset(
            AssetsIcons.warning,
            height:kIsWeb?26 : 26.h,
            width:kIsWeb?26 : 26.w,
          ),
          SizedBox(
            height: kIsWeb?10 :10.h,
          ),
          Text(
            AppLocalizations.of(context)!.confirmCancellation,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(fontWeight: FontWeight.w600, fontSize:kIsWeb?20 : 20.sp),
          ),
          SizedBox(
            height:kIsWeb?10 : 10.h,
          ),
          Text(
            AppLocalizations.of(context)!.yourOrderWillPermanentlyCanceled,
            maxLines: 2,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(fontWeight: FontWeight.w400, fontSize:kIsWeb?14 : 14.sp),
          ),
          SizedBox(
            height:kIsWeb?25 : 25.h,
          ),

          BlocConsumer<CancelOrderBloc, CancelOrderState>(
            listener: (context, state) {
              if (state is CancelOrderConnectionError) {
                CommonFunctions.showCustomSnackBar(
                    context, AppLocalizations.of(context)!.noInternet);
              }
              else if (state is CancelOrderFailure) {
                CommonFunctions.showCustomSnackBar(
                    context, state.authModel.message);
              }
              else if (state is CancelOrderLoaded) {
                CommonFunctions.showUpSnack(
                  message: state.authModel.message,
                  context: context,
                );
                _orderDetailsBloc.add(OrderDetails(
                    token: _token,
                    id: widget.orderId,
                    language: _language));
                context.pop();
                ordersController.orderDataClear();
              }
            },
            builder: (context, state) {
              if (state is CancelOrderLoading) {
                return const CommonLoadingButton();
              }
              return Row(
                children: [
                  ChildButton(
                      color: const Color(0xFF969BA2),
                      widget: Text(
                        AppLocalizations.of(context)!.no,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w400,
                          fontSize:kIsWeb?14 : 14.sp,
                        ),
                      ),
                      onPressed: () {
                        context.pop();
                      }),
                  SizedBox(
                    width: kIsWeb?14 :14.w,
                  ),
                  ChildButton(
                      color: const Color(0xFFEC7373),
                      widget: Text(
                        AppLocalizations.of(context)!.yes,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w500, fontSize:kIsWeb?14 : 14.sp),
                      ),
                      onPressed: () {
                        _cancelOrderBloc.add(OrderCancel(
                            orderId: widget.orderId,
                            token: _token));
                      }),
                ],
              );
            },
          )
        ],
      ),
    );
  }
}

class MessagesButton extends StatelessWidget {
  const MessagesButton({super.key, required this.onTap});
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal:kIsWeb?6 : 6.w,vertical:kIsWeb?6 : 6.h,),
        decoration: BoxDecoration(
            color: const Color(0xFFE8F1FD),
            borderRadius: BorderRadius.circular(kIsWeb?3 :3.r)),
        child: Row(
          children: [

            Center(
              child: Image.asset(
                AssetsIcons.message,
                height: kIsWeb?20 :20.h,
                width: kIsWeb?20 :20.w,
              ),
            ),
            SizedBox(
              width:kIsWeb?8 : 8.w,
            ),
            Text(
              AppLocalizations.of(context)!.chat,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w300, fontSize:kIsWeb?12 : 12.sp),
            ),
          ],
        ),
      ),
    );
  }
}
