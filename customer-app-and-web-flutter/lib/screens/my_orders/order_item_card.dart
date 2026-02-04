import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/bloc/save_bloc/save_event.dart';
import 'package:quick_ecommerce/controller/provider/currencie_controler.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';

import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../controller/bloc/save_bloc/save_state.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/filter_controller.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/commn_textfield.dart';
import '../common_widgets/common_button.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_status_card.dart';
import '../common_widgets/field_title.dart';
import '../home/item_card.dart';
import 'order_details_screen.dart';

class OrderCard extends StatelessWidget {
  final String invoiceNumber;
  final String orderDate;
  final String orderAmount;
  final String status;
  final int orderId;

  const OrderCard({
    super.key,
    required this.invoiceNumber,
    required this.orderDate,
    required this.orderAmount,
    required this.status,
    required this.orderId,
  });

  @override
  Widget build(BuildContext context) {
    final currencyCon = Provider.of<CurrencyController>(context);
    final homeCon = Provider.of<HomeScreenProvider>(context);
    return CommonCard(
        mVertical: 3,
        mHorizontal:kIsWeb ?0 :12 ,
        widget: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "${AppLocalizations.of(context)!.invoiceNumber}: ",
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w700, fontSize:kIsWeb ? 12 : 12.sp),
                  ),
                  SizedBox(
                    height:kIsWeb ?6 : 6.h,
                  ),
                  Text(
                    invoiceNumber,
                    maxLines: 1,
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        fontWeight: FontWeight.w400, fontSize: kIsWeb ? 11 :11.5.sp),
                  ),
                  SizedBox(
                    height: kIsWeb ?6 :6.h,
                  ),
                  Text(
                    Utils.formatDate(orderDate),
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        fontWeight: FontWeight.w500, fontSize:kIsWeb ? 11 : 11.sp),
                  ),
                  SizedBox(
                    height: kIsWeb ? 12 :12.h,
                  ),
                  Row(
                    children: [
                      Text(
                        "${AppLocalizations.of(context)!.orderStatus}:",
                        style: Theme.of(context)
                            .textTheme
                            .displayLarge
                            ?.copyWith(
                                fontWeight: FontWeight.w400, fontSize:kIsWeb ? 11 : 11.sp),
                      ),
                      SizedBox(
                        width:kIsWeb ?5 : 5.w,
                      ),
                      OrderStatusCard(
                        text:Utils.capitalizeFirstLetter(status),
                        status: status,
                      ),
                    ],
                  )
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  "${AppLocalizations.of(context)!.orderAmount}:",
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(fontWeight: FontWeight.w400, fontSize:kIsWeb ? 11 : 11.sp),
                ),
                SizedBox(
                  height:kIsWeb ? 6: 6.h,
                ),
                Text(
                  currencyCon.formatCurrency(orderAmount.toString()),
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(fontWeight: FontWeight.w600, fontSize:kIsWeb ? 14 : 14.sp),
                ),
                SizedBox(
                  height: kIsWeb ? 25 :25.h,
                ),
                Row(
                  children: [
                    InkWell(
                      onTap: () {
                        if(kIsWeb){
                          homeCon.setOrderId(orderId.toString());
                          homeCon.setMenuName("OrderDetails");
                        }
                        else {
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => OrderSummaryScreen(
                                      orderId: orderId.toString(),
                                    )));}
                      },
                      child: Container(
                        height: kIsWeb ? 22 :22.h,
                        width: kIsWeb ? 30 :22.w,
                        padding: EdgeInsets.symmetric(
                            vertical:kIsWeb ? 5 : 5.h, horizontal:kIsWeb ? 4 : 4.w),
                        decoration: BoxDecoration(
                            color: const Color(0xffE8F8FA),
                            border: Border.all(
                                width: kIsWeb ? 0.3 :0.3.w, color: const Color(0xFF16B4CD)),
                            borderRadius: BorderRadius.circular(kIsWeb ?4:4.r)),
                        child: Image.asset(
                          color: const Color(0xFF16B4CD),
                          AssetsIcons.eyeSee,
                          height: kIsWeb ? 25 :15.h,
                          width: kIsWeb ? 30 :15.w,
                        ),
                      ),
                    ),
                  ],
                )
              ],
            ),
          ],
        ));
  }
}

class ReviewDialog extends StatefulWidget {
  const ReviewDialog({
    super.key,
    required this.orderId,
    required this.storeId,
    required this.reviewableId,
    required this.type,
  });
  final String orderId, storeId, reviewableId, type;
  @override
  State<ReviewDialog> createState() => _ReviewDialogState();
}

class _ReviewDialogState extends State<ReviewDialog> {
  final TextEditingController reviewController = TextEditingController();

  late final SaveBloc _saveBloc;
  String _token = '';
  @override
  void initState() {
    _saveBloc = context.read<SaveBloc>();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
  }

  @override
  Widget build(BuildContext context) {
    var commonProvider = Provider.of<CommonProvider>(context);
    var filterCon = Provider.of<FilterController>(context);
    return AlertDialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      contentPadding: const EdgeInsets.all(16),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FieldTitle(
            title: AppLocalizations.of(context)!.review,
            star: "*",
          ),
          CommonTextField(
              controler: reviewController,
              hint: AppLocalizations.of(context)!.review,
              textAlign: TextAlign.start,
              redOnly: false),
          SizedBox(
            height: kIsWeb ? 20 :20.h,
          ),
          Center(
              child: Text(
            "${AppLocalizations.of(context)!.yourAverageRatingIs}: ${filterCon.ratings}",
            style: Theme.of(context)
                .textTheme
                .displayLarge
                ?.copyWith(fontWeight: FontWeight.w400, fontSize: kIsWeb ? 11 :11.sp),
          )),
          SizedBox(
            height: kIsWeb ? 20:20.h,
          ),
          // Rating bar
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              for (int i = 1; i <= 5; i++)
                GestureDetector(
                  onTap: () {
                    filterCon.setRatings(i);
                  },
                  child: Icon(
                    Icons.star,
                    size:kIsWeb ? 28 : 28.sp,
                    color: i <= filterCon.ratings ? Colors.orange : Colors.grey,
                  ),
                ),
            ],
          ),
          SizedBox(height: 12.h),
          commonProvider.isLoading
              ? BlocConsumer<SaveBloc, SaveState>(
                  listener: (context, state) {
                    if (state is SaveConnectionError) {
                      CommonFunctions.showCustomSnackBar(
                          context, AppLocalizations.of(context)!.noInternet);
                      commonProvider.setLoading(false);
                    } else if (state is SaveFailure) {
                      CommonFunctions.showCustomSnackBar(
                          context, state.authModel.message);
                      commonProvider.setLoading(false);
                    }
                  },
                  builder: (context, state) {
                    if (state is SaveLoading) {
                      return const ShimmerLoadingWidget();
                    } else if (state is SaveLoaded) {
                      commonProvider.setLoading(false);
                      CommonFunctions.showCustomSnackBar(
                          context, state.authModel.message);
                      Navigator.pop(context);
                    }

                    return const SizedBox();
                  },
                )
              : CommonButton(
                  buttonText: AppLocalizations.of(context)!.submit,
                  onTap: () {
                    if (filterCon.ratings >= 1) {
                      commonProvider.setLoading(true);
                      _saveBloc.add(ReviewAdd(
                          orderId: widget.orderId,
                          storeId: widget.storeId,
                          reviewableId: widget.reviewableId,
                          review: reviewController.text,
                          type: widget.type,
                          rating: filterCon.ratings.toString(),
                          token: _token));
                    } else {
                      CommonFunctions.showUpSnack(
                          context: context, message: "Id null");
                    }
                  })
        ],
      ),
    );
  }
}
