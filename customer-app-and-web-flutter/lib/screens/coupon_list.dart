import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_dropdown.dart';
import '../config/images.dart';
import '../config/shared_preference_helper.dart';
import '../config/text_styles.dart';
import '../config/user_shared_preference.dart';
import '../controller/bloc/general_info_bloc/general_info_bloc.dart';
import '../controller/bloc/general_info_bloc/general_info_event.dart';
import '../controller/bloc/general_info_bloc/general_info_state.dart';
import '../controller/provider/coupon_controller.dart';
import '../l10n/app_localizations.dart';
import 'common_widgets/common_funcktion.dart';
import 'common_widgets/common_loading.dart';
import 'common_widgets/common_search_widget.dart';

class CouponList extends StatefulWidget {
  const CouponList({super.key});

  @override
  State<CouponList> createState() => _CouponListState();
}

class _CouponListState extends State<CouponList> {
  late final GeneralInfoBloc _generalInfoBloc;
  String _token = '',_language='';

  getUserToken() async {
    String? token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    String? language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _token = token ?? '';
    _language = language ?? '';
    _generalInfoBloc.add(CouponDataEvent(
        token: _token,
        searchKey: '',
        discountType: '',
        expireSoon: false,
        newest: true,
        page: 1,
        language: _language));
  }

  Future<void> _refresh() async {
    await Future.delayed(const Duration(microseconds: 100));
    _generalInfoBloc.add(CouponDataEvent(
        token: _token,
        searchKey: '',
        discountType: '',
        expireSoon: false,
        newest: true,
        page: 1,
        language: _language));
  }

  @override
  void initState() {
    getUserToken();
    _generalInfoBloc = context.read<GeneralInfoBloc>();
    super.initState();
  }

  List couponFilterList = ["Newest", "Expire soon"];

  @override
  Widget build(BuildContext context) {
    var couponCon = Provider.of<CouponController>(context);
    return Scaffold(
      appBar: AppBar(
        // backgroundColor: Colors.white,
        title: Text(
          AppLocalizations.of(context)!.couponList,
          style: Theme.of(context)
              .textTheme
              .titleLarge!
              .copyWith(fontSize: 18.sp, fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Row(
            children: [
              SizedBox(
                width: 8.w,
              ),
              Expanded(
                child: CommonSearchWidget(
                    onSearch: (value) {
                  if (value.length > 3) {
                    _generalInfoBloc.add(CouponDataEvent(
                        token: _token,
                        searchKey: value,
                        discountType: '',
                        expireSoon: false,
                        newest: true,
                        page: 1,
                        language: _language));
                  }
                },
                  hint: AppLocalizations.of(context)!.searchProductsHere,
                ),
              ),
              SizedBox(
                width: 8.w,
              ),
              Expanded(
                child: CommonDropdown(
                    dropdownValue: couponCon.couponFilter,
                    dList: couponFilterList,
                    onChanged: (String? value) {
                      couponCon.setCouponFilter(value!);
                      if (couponCon.couponFilter == "Newest") {
                        _generalInfoBloc.add(CouponDataEvent(
                            token: _token,
                            searchKey: "",
                            discountType: '',
                            expireSoon: false,
                            newest: true,
                            page: 0,
                            language: _language));
                      } else {
                        _generalInfoBloc.add(CouponDataEvent(
                            token: _token,
                            searchKey: "",
                            discountType: '',
                            expireSoon: true,
                            newest: false,
                            page: 0,
                            language: _language));
                      }
                    }),
              ),
              SizedBox(
                width: 8.w,
              ),
            ],
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: RefreshIndicator(
                backgroundColor: Colors.white,
                onRefresh: _refresh,
                child: BlocConsumer<GeneralInfoBloc, GeneralInfoState>(
                  listener: (context, state) {
                    if (state is GeneralInfoConnectionError) {
                      CommonFunctions.showUpSnack(
                          context: context, message: AppLocalizations.of(context)!.noInternet);
                    } else if (state is CouponFailure) {}
                  },
                  builder: (context, state) {
                    if (state is GeneralInfoLoading) {
                      return const CommonLoading();
                    } else if (state is CouponLoaded) {
                      return state.couponListModel.data.isNotEmpty
                          ? GridView.builder(
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2, // Two columns
                                crossAxisSpacing:
                                    8.0, // Spacing between columns
                                mainAxisSpacing: 8.0, // Spacing between rows
                                childAspectRatio:
                                    0.5, // Adjust for item height/width ratio
                                mainAxisExtent: 316,
                              ),
                              itemCount: state.couponListModel.data
                                  .length, // Add 1 for "See More" button
                              itemBuilder: (context, index) {
                                final data = state.couponListModel.data[index];
                                final DateTime currentTime = DateTime.now();
                                final DateTime expiryTime =
                                    parseDate(data.endDate ?? "");
                                final bool isExpiringSoon =
                                    expiryTime.difference(currentTime).inDays <
                                        3;
                                return Container(
                                  margin: EdgeInsets.all(4.sp),
                                  padding: EdgeInsets.symmetric(
                                      horizontal: 6.w, vertical: 5.h),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8.r),
                                    border: Border.all(
                                        width: 1, color: Colors.grey.shade400),
                                    color: Colors.white,
                                  ),
                                  child: Column(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Expanded(
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.only(
                                            topLeft: Radius.circular(12.r),
                                            topRight: Radius.circular(12.r),
                                          ),
                                          child: data.couponImageUrl != null
                                              ? Image.network(
                                                  data.couponImageUrl!,
                                                  height: 180.h,
                                                  width: double.infinity,
                                                  fit: BoxFit.fill,
                                                  loadingBuilder: (context,
                                                      child, loadingProgress) {
                                                    if (loadingProgress == null) {
                                                      return child;
                                                    }
                                                    return Center(
                                                      child:
                                                          CircularProgressIndicator(
                                                        value: loadingProgress
                                                                    .expectedTotalBytes !=
                                                                null
                                                            ? loadingProgress
                                                                    .cumulativeBytesLoaded /
                                                                (loadingProgress
                                                                        .expectedTotalBytes ??
                                                                    1)
                                                            : null,
                                                      ),
                                                    );
                                                  },
                                                  errorBuilder: (context, error,
                                                      stackTrace) {
                                                    return Image.asset(
                                                      Images.noImage,
                                                      fit: BoxFit.fill,
                                                      height: 180.h,
                                                      width: double.infinity,
                                                    );
                                                  },
                                                )
                                              : Image.asset(
                                                  Images.noImage,
                                                  fit: BoxFit.cover,
                                                  width: double.infinity,
                                                  height: 180.h,
                                                ),
                                        ),
                                      ),
                                      Column(
                                        children: [
                                          SizedBox(height: 8.h),
                                          Text(
                                            data.couponTitle,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium!
                                                .copyWith(
                                                  fontSize: 14.sp,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                          ),
                                          SizedBox(height: 6.h),
                                          Text(
                                            data.couponDescription,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium!
                                                .copyWith(
                                                  fontSize: 12.sp,
                                                  fontWeight: FontWeight.w400,
                                                ),
                                          ),
                                          SizedBox(height: 4.h),
                                          Text(
                                            '${AppLocalizations.of(context)!.expiresOn}: ${DateFormat('MM/dd/yyyy, hh:mm a').format(expiryTime)}',
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium!
                                                .copyWith(
                                                  fontSize: 12.sp,
                                                  fontWeight: FontWeight.w400,
                                                  color: isExpiringSoon
                                                      ? Colors.red
                                                      : Colors.grey,
                                                ),
                                            maxLines: 1,
                                          ),
                                          SizedBox(height: 8.h),
                                          GestureDetector(
                                            onTap: () {
                                              _showCodeAndCopy(
                                                  context, data.couponCode);
                                            },
                                            child: Container(
                                              width: double.infinity,
                                              height: 30.h,
                                              decoration: BoxDecoration(
                                                color: Theme.of(context)
                                                    .disabledColor,
                                                borderRadius:
                                                    BorderRadius.circular(6.r),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  AppLocalizations.of(context)!
                                                      .addToCart,
                                                  style: CustomTextStyles
                                                      .regularText(
                                                    14.sp,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          )
                                        ],
                                      ),
                                    ],
                                  ),
                                );
                              },
                            )
                          : const Center(child: Text("Coupon Not Found"));
                    }

                    return const SizedBox();
                  },
                ),
              ),
            ),
          ),
          couponCon.couponCurrentPage == couponCon.couponTotalPages
              ? Center(
                  child: Padding(
                    padding: EdgeInsets.all(8.0.sp),
                    child: Text(
                      "See More",
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey.shade500,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                )
              : Padding(
                padding: const EdgeInsets.all(8.0),
                child: Center(
                    child: InkWell(
                    onTap: () {
                      couponCon.goToCouponNextPage();
                      _generalInfoBloc.add(CouponDataEvent(
                          token: _token,
                          searchKey: '',
                          discountType: '',
                          expireSoon: false,
                          newest: true,
                          page: couponCon.couponCurrentPage,
                          language: _language));
                    },
                    child: Text(
                      AppLocalizations.of(context)!.seeMore,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context).primaryColor,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  )),
              ),
        ],
      ),
    );
  }

  DateTime parseDate(String date) {
    try {
      return DateTime.parse(date);
    } catch (_) {
      return DateTime.now(); // Default fallback
    }
  }

  void _showCodeAndCopy(BuildContext context, String code) {
    Clipboard.setData(ClipboardData(text: code));
    CommonFunctions.showUpSnack(
        context: context, message: 'Coupon Code "$code" copied to clipboard!');
  }
}
