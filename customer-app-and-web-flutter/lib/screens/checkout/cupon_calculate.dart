import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/provider/currencie_controler.dart';
import '../../config/colors.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/coupon_bloc/coupon_bloc.dart';
import '../../controller/bloc/coupon_bloc/coupon_event.dart';
import '../../controller/bloc/coupon_bloc/coupon_state.dart';
import '../../controller/provider/checkout_controler.dart';
import '../../controller/provider/common_provider.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_loading.dart';

class CouponCalculate extends StatefulWidget {
  const CouponCalculate({super.key});

  @override
  State<CouponCalculate> createState() => _CouponCalculateState();
}

class _CouponCalculateState extends State<CouponCalculate> {
  late final CouponBloc _couponBloc;
  final TextEditingController couponCon = TextEditingController();
  String _token = '';
  @override
  void initState() {
    super.initState();
    _couponBloc = context.read<CouponBloc>();
    getUserRout();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
  }

  @override
  Widget build(BuildContext context) {
    final checkoutCon = context.watch<CheckoutController>();
    var commonProvider = Provider.of<CommonProvider>(context);
    final currencyCon = Provider.of<CurrencyController>(context);
    return commonProvider.isLoading
            ? BlocConsumer<CouponBloc, CouponState>(
                listener: (context, state) {
                  if (state is CouponConnectionError) {
                    CommonFunctions.showUpSnack(
                      context: context,
                      message: AppLocalizations.of(context)!.noInternet,
                    );
                    commonProvider.setLoading(false);
                  } else if (state is CouponFailure) {
                    CommonFunctions.showUpSnack(
                      context: context,
                      message:
                          state.couponModel.message ?? "Something went wrong",
                    );
                    commonProvider.setLoading(false);
                  } else if (state is CouponLoaded) {
                    final data = state.couponModel.coupon;
                    if (data != null && data.discountedAmount != null) {
                      checkoutCon.updateCoupon(
                        Utils.formatDouble(data.discountedAmount),
                        data.code,
                      );
                      checkoutCon.calculateTotal();
                    }
                    CommonFunctions.showUpSnack(
                      context: context,
                      message: state.couponModel.message ??
                          "Coupon applied successfully!",
                    );
                    commonProvider.setLoading(false);
                  }
                },
                builder: (context, state) {
                  if (state is CouponLoading) {
                    return const CommonLoading();
                  }
                  return const SizedBox();
                },
              )
            : Container(
                height:kIsWeb ? 50 : 50.h,
                padding: EdgeInsets.symmetric(vertical:kIsWeb ? 8 : 8.h, horizontal:kIsWeb ? 10 : 10.w),
                decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  border: Border.all(width: kIsWeb ? 1 :1.w, color: Colors.grey),
                  borderRadius: BorderRadius.circular(kIsWeb ? 10 :10.r),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    const ImageIcon(
                      AssetImage(AssetsIcons.payment),
                      color: CustomColors.baseColor,
                    ),
                    SizedBox(
                      width: kIsWeb ? 12 :12.w,
                    ),
                    Expanded(
                        child: TextFormField(
                      controller: couponCon,
                      style: Theme.of(context)
                          .textTheme
                          .bodyMedium
                          ?.copyWith(fontSize: 12, fontWeight: FontWeight.w400),
                      decoration: InputDecoration(
                          contentPadding: EdgeInsets.only(
                              left: kIsWeb ? 12 :12.w, top: 0.h, bottom: 0.h, right: kIsWeb ? 12 :12.w),
                          hintText: AppLocalizations.of(context)!.addCouponCode,
                          hintStyle: Theme.of(context)
                              .textTheme
                              .displayLarge
                              ?.copyWith(
                                  fontSize: 14, fontWeight: FontWeight.w400),
                          border: const OutlineInputBorder(
                            borderSide: BorderSide.none,
                          )),
                    )),
                    SizedBox(
                      width: kIsWeb ? 12 :12.w,
                    ),
                    InkWell(
                      onTap: () {
                        if (couponCon.text.trim().isNotEmpty) {
                          commonProvider.setLoading(true);
                          _couponBloc.add(Coupons(
                            couponCode: couponCon.text.trim(),
                            subtotal: checkoutCon.subtotalForCoupon.toString(),
                            currencyCode:currencyCon.currencyCode,
                            token: _token,
                          ));
                        } else {
                          CommonFunctions.showCustomSnackBar(context,
                              "${AppLocalizations.of(context)!.coupon} ${AppLocalizations.of(context)!.fieldRequired}");
                        }
                      },
                      child: Text(
                        AppLocalizations.of(context)!.apply,
                        style: Theme.of(context)
                            .textTheme
                            .headlineLarge
                            ?.copyWith(
                                fontSize: kIsWeb ? 14 :14.sp, fontWeight: FontWeight.w600),
                      ),
                    ),
                    SizedBox(
                      width:kIsWeb ? 12 : 12.w,
                    ),
                  ],
                ),
              );
  }
}
