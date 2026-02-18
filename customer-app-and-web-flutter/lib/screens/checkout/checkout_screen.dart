import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/bloc/h_mac_key_generate_bloc/hmac_generate_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/h_mac_key_generate_bloc/hmac_generate_event.dart';
import 'package:quick_ecommerce/controller/bloc/h_mac_key_generate_bloc/hmac_generate_state.dart';
import 'package:quick_ecommerce/controller/bloc/payment_status_update_bloc/payment_status_update_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/payment_status_update_bloc/payment_status_update_event.dart';
import 'package:quick_ecommerce/controller/bloc/payment_status_update_bloc/payment_status_update_state.dart';
import 'package:quick_ecommerce/controller/provider/authentication_provider.dart';
import 'package:quick_ecommerce/controller/provider/currencie_controler.dart';
import 'package:quick_ecommerce/screens/checkout/cupon_calculate.dart';
import 'package:quick_ecommerce/screens/common_widgets/commn_textfield.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_disabeld_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_phone_number_field.dart';
import 'package:quick_ecommerce/screens/common_widgets/online_payment_option.dart';
import 'package:quick_ecommerce/screens/checkout/tax_calculation.dart';
import '../../config/colors.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/address_list_bloc/address_list_bloc.dart';
import '../../controller/bloc/address_list_bloc/address_list_event.dart';
import '../../controller/bloc/address_list_bloc/address_list_state.dart';
import '../../controller/bloc/extra_charge_bloc/extra_charge_bloc.dart';
import '../../controller/bloc/extra_charge_bloc/extra_charge_event.dart';
import '../../controller/bloc/extra_charge_bloc/extra_charge_state.dart';
import '../../controller/bloc/place_order_bloc/place_order_bloc.dart';
import '../../controller/bloc/place_order_bloc/place_order_event.dart';
import '../../controller/bloc/place_order_bloc/place_order_state.dart';
import '../../controller/bloc/wallet_bloc/wallet_bloc.dart';
import '../../controller/bloc/wallet_bloc/wallet_event.dart';
import '../../controller/bloc/wallet_bloc/wallet_state.dart';
import '../../controller/provider/cart_controler.dart';
import '../../controller/provider/checkout_controler.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/payment_option_controller.dart';
import '../../data/data_model/address_model.dart';
import '../../data/data_model/extra_charge_model.dart';
import '../../data/service/common_repository.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_child_button.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/field_title.dart';
import '../common_widgets/filter_screen.dart';
import '../common_widgets/payment_funcktion.dart';
import '../delivery_address/add_delivery_address.dart';
import '../home/item_card.dart';

class CommonRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isBold;
  final Color? textColor;

  const CommonRow(
      {super.key,
      required this.label,
      required this.value,
      this.isBold = false,
      this.textColor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: kIsWeb ? 4 : 4.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            "$label :",
            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                fontSize: kIsWeb ? 14 : 14.sp,
                color:
                    textColor ?? Theme.of(context).textTheme.bodyMedium!.color,
                fontWeight: isBold ? FontWeight.w700 : FontWeight.w500),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                fontSize: kIsWeb ? 14 : 14.sp,
                color:
                    textColor ?? Theme.of(context).textTheme.bodyMedium!.color,
                fontWeight: isBold ? FontWeight.w700 : FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

class CheckoutScreens extends StatefulWidget {
  const CheckoutScreens({
    super.key,
    required this.productIds,
  });
  final List<int> productIds;
  @override
  CheckoutScreensState createState() => CheckoutScreensState();
}

class CheckoutScreensState extends State<CheckoutScreens> {
  late final PaymentStatusUpdateBloc _paymentStatusUpdateBloc;
  late final AddressListBloc _addressListBloc;
  late final ExtraChargeBloc _extraChargeBloc;
  late final PlaceOrderBloc _placeOrderBloc;
  late final HMacGenerateBloc _hMacGenerateBloc;

  CommonRepository commonRepository = CommonRepository();
  String _token = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final checkoutCon = context.read<CheckoutController>();
      checkoutCon.clearPackage();
      getUserRout();
    });
    _extraChargeBloc = context.read<ExtraChargeBloc>();
    _addressListBloc = context.read<AddressListBloc>();
    _paymentStatusUpdateBloc = context.read<PaymentStatusUpdateBloc>();
    _placeOrderBloc = context.read<PlaceOrderBloc>();
    _hMacGenerateBloc = context.read<HMacGenerateBloc>();
    getUserRout();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
    _addressListBloc
        .add(AddressList(id: "", type: "", status: "", token: _token));
    _extraChargeBloc.add(ExtraChargeData(productIds: widget.productIds));
  }

  int orderId = 0;
  String hMacKey = '', timestamp = '';
  double discountAmount = 0.0;
  Map<String, dynamic> guestInfo = {};
  final List<Map<String, dynamic>> progressSteps = [
    {"icon": AssetsIcons.cart, "status": "Add to Cart"},
    {"icon": AssetsIcons.delivery, "status": "Check & Proceed"},
    {"icon": AssetsIcons.recive, "status": "Payment"},
    {"icon": AssetsIcons.boxOpen, "status": "Conformation"},
  ];
  List<AddressListModel> deliveryAddresses = [];
  AddressListModel addressesData = AddressListModel();
  int currentStep = 2;

  final TextEditingController passwordCon = TextEditingController();
  final TextEditingController conPasswordCon = TextEditingController();

  @override
  Widget build(BuildContext context) {
    var homeCon = Provider.of<HomeScreenProvider>(context);
    final checkoutCon = context.watch<CheckoutController>();
    final paymentCon = Provider.of<PaymentOptionCon>(context);
    final cartCon = context.watch<CartProvider>();
    var commonProvider = Provider.of<CommonProvider>(context);
    final currencyCon = Provider.of<CurrencyController>(context);
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (checkoutCon.stepsTow) {
          checkoutCon.setSteps(false);
        } else {
          context.pop();
          checkoutCon.setChargeAPIColl(false);
        }
      },
      child: Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        appBar: AppBar(
          leading: IconButton(
              onPressed: () {
                if (checkoutCon.stepsTow) {
                  checkoutCon.setSteps(false);
                } else if (checkoutCon.stepsTow == false) {
                  context.pop();
                  checkoutCon.setChargeAPIColl(false);
                }
              },
              icon: const Icon(
                Icons.arrow_back,
                color: Colors.white,
              )),
          title: Text(
            AppLocalizations.of(context)!.checkout,
            style: Theme.of(context).textTheme.titleLarge!.copyWith(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w600,
                ),
          ),
          //backgroundColor: Colors.white,
          elevation: 1,
          centerTitle: true,
          foregroundColor: Colors.black,
        ),
        body: Padding(
          padding: EdgeInsets.symmetric(horizontal: kIsWeb ? 12 : 12.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              /// Delivery Options
              BlocConsumer<AddressListBloc, AddressListState>(
                builder: (_, state) {
                  if (state is AddressListLoading) {
                    return const SizedBox();
                  } else if (state is AddressListLoaded) {
                    // Extract addresses from state.addressList
                    deliveryAddresses = state.addressList;
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      final data = state.addressList;
                      if (data.isNotEmpty) {
                        checkoutCon.setAddressList(data);
                        addressesData = state.addressList.first;
                        checkoutCon.setChargeAPIColl(true);
                      }
                    });
                  }
                  return Container();
                },
                listener: (context, state) {
                  if (state is AddressListConnectionError) {
                    CommonFunctions.showUpSnack(
                      message: AppLocalizations.of(context)!.noInternet,
                      context: context,
                    );
                  } else if (state is AddressListFailure) {
                    CommonFunctions.showUpSnack(
                      message: "Not Found",
                      context: context,
                    );
                  }
                },
              ),
              checkoutCon.getDeliveryCharge
                  ? GetDeliveryCharge(
                      lat: checkoutCon.selectedAddressLat,
                      long: checkoutCon.selectedAddressLong)
                  : const SizedBox(),
              BlocConsumer<ExtraChargeBloc, ExtraChargeState>(
                builder: (_, state) {
                  if (state is ExtraChargeLoading) {
                    return const SizedBox();
                  } else if (state is ExtraChargeLoaded) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      List<FlashSale> flashSellList =
                          state.extraChargeModel.flashSale ?? [];
                      if (flashSellList.isNotEmpty) {
                        checkoutCon.addFlashSaleList(flashSellList);
                      }
                      if (checkoutCon.package.isEmpty &&
                          checkoutCon.isPackageAdd == false) {
                        checkoutCon.clearPackage();
                        checkoutCon.populatePackages(
                          checkoutCon.isByNow
                              ? checkoutCon.byNowItems
                              : cartCon.cartItems,
                          flashSellList,
                          'standard_delivery',
                          'standard',
                        );
                        checkoutCon.setPackageAdd(true);
                      }
                    });
                  }
                  return Container();
                },
                listener: (context, state) {
                  if (state is ExtraChargeConnectionError) {
                    CommonFunctions.showCustomSnackBar(
                        context, AppLocalizations.of(context)!.noInternet);
                  }
                },
              ),
              SizedBox(height: 8.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(progressSteps.length, (index) {
                  currentStep = checkoutCon.stepsTow ? 3 : 2;
                  bool isCompleted = index < currentStep;
                  bool isCurrent = index == currentStep;

                  return InkWell(
                    onTap: () {
                      if (progressSteps[index]["status"] == "Check & Proceed") {
                        checkoutCon.setSteps(false);
                      }
                    },
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(width: kIsWeb ? 6 : 6.h),
                            CircleAvatar(
                                radius: kIsWeb ? 18 : 18.r,
                                backgroundColor: isCompleted
                                    ? Colors.blue
                                    : isCurrent
                                        ? const Color(0xFFD0DFFF)
                                        : Colors.grey[300],
                                child: ImageIcon(
                                  AssetImage(progressSteps[index]["icon"]),
                                  color:
                                      isCompleted ? Colors.white : Colors.blue,
                                  size: kIsWeb ? 16 : 16.sp,
                                )),
                            SizedBox(width: kIsWeb ? 4 : 4.h),
                            if (index < progressSteps.length - 1)
                              Container(
                                width: kIsWeb ? 40 : 40.w,
                                height: kIsWeb ? 4 : 4.h,
                                decoration: BoxDecoration(
                                  gradient: (index < progressSteps.length - 1 &&
                                          (index == currentStep - 1))
                                      ? const LinearGradient(
                                          colors: [
                                            Colors.blue,
                                            Color(0xFFE8F1FD)
                                          ],
                                          begin: Alignment.centerLeft,
                                          end: Alignment.centerRight,
                                        )
                                      : null, // No gradient when not completed
                                  color: index < progressSteps.length - 1 &&
                                          isCompleted
                                      ? Colors.blue
                                      : Colors.grey[300], // Default color
                                ),
                              ),
                          ],
                        ),
                        SizedBox(height: kIsWeb ? 8 : 8.h),
                        Text(
                          progressSteps[index]["status"],
                          textAlign: TextAlign.justify,
                          style: Theme.of(context)
                              .textTheme
                              .displayLarge!
                              .copyWith(
                                fontSize: kIsWeb ? 10 : 10.sp,
                                fontWeight: FontWeight.w400,
                              ),
                        ),
                      ],
                    ),
                  );
                }),
              ),
              SizedBox(height: kIsWeb ? 10 : 10.h),
              checkoutCon.stepsTow
                  ? Expanded(
                      child: NestedScrollView(
                        headerSliverBuilder:
                            (BuildContext context, bool innerBoxIsScrolled) {
                          return [
                            SliverToBoxAdapter(
                                child: Column(
                              children: [
                                const PaymentMethodWidget(),
                                SizedBox(
                                  height: 6.h,
                                ),
                                FilterTitleWidget(
                                  filterTitle: AppLocalizations.of(context)!
                                      .importYourCoupon,
                                  isShow: checkoutCon.isCouponShow,
                                  onTap: () {
                                    if (checkoutCon.isCouponShow == true) {
                                      checkoutCon.setCouponShow(false);
                                    } else {
                                      checkoutCon.setCouponShow(true);
                                    }
                                  },
                                ),
                                checkoutCon.isCouponShow
                                    ? Column(
                                        children: [
                                          SizedBox(height: 6.h),
                                          const CouponCalculate(),
                                          SizedBox(height: 6.h),
                                        ],
                                      )
                                    : const SizedBox(),
                              ],
                            )),
                          ];
                        },
                        body: const SecondStepPackageAndItm(),
                      ),
                    )
                  : Expanded(
                      child: NestedScrollView(
                        headerSliverBuilder:
                            (BuildContext context, bool innerBoxIsScrolled) {
                          return [
                            SliverToBoxAdapter(
                                child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                SizedBox(height: 10.h),
                                FilterTitleWidget(
                                  filterTitle: AppLocalizations.of(context)!
                                      .deliveryOptions,
                                  isShow: checkoutCon.isDeliveryOptionShow,
                                  onTap: () {
                                    if (checkoutCon.isDeliveryOptionShow ==
                                        true) {
                                      checkoutCon.setDeliveryOptionShow(false);
                                    } else {
                                      checkoutCon.setDeliveryOptionShow(true);
                                    }
                                  },
                                ),

                                checkoutCon.isDeliveryOptionShow
                                    ? CommonCard(
                                        mVertical: 8,
                                        mHorizontal: 0,
                                        pBottom: 4,
                                        widget: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                DeliveryOptionCard(
                                                  value: AppLocalizations.of(
                                                          context)!
                                                      .homeDelivery,
                                                  groupValue: checkoutCon
                                                      .selectedDeliveryOption,
                                                  onChanged: (value) {
                                                    checkoutCon
                                                        .setDeliveryOption(
                                                            value);
                                                    checkoutCon
                                                        .clearDeliveryAddressAndCharge();
                                                    if (checkoutCon
                                                        .selectedDeliveryAddress
                                                        .isEmpty) {
                                                      checkoutCon
                                                          .setDeliveryAddress(
                                                        addressesData.address ??
                                                            "",
                                                        addressesData.id ?? 0,
                                                        double.tryParse(
                                                                addressesData
                                                                        .lat ??
                                                                    "") ??
                                                            0,
                                                        double.tryParse(
                                                                addressesData
                                                                        .long ??
                                                                    "") ??
                                                            0,
                                                      );
                                                      checkoutCon
                                                          .setChargeAPIColl(
                                                              true);
                                                    }
                                                    checkoutCon.selectedAddressLat >
                                                            0
                                                        ? GetDeliveryCharge(
                                                            lat: checkoutCon
                                                                .selectedAddressLat,
                                                            long: checkoutCon
                                                                .selectedAddressLong)
                                                        : const SizedBox();
                                                    checkoutCon
                                                        .calculateTotal();
                                                  },
                                                  label: AppLocalizations.of(
                                                          context)!
                                                      .homeDelivery,
                                                ),
                                                SizedBox(width: 10.w),
                                                DeliveryOptionCard(
                                                  value: AppLocalizations.of(
                                                          context)!
                                                      .pickUpInPerson,
                                                  groupValue: checkoutCon
                                                      .selectedDeliveryOption,
                                                  onChanged: (value) {
                                                    checkoutCon
                                                        .setDeliveryOption(
                                                            value);
                                                    checkoutCon
                                                        .clearDeliveryAddressAndCharge();
                                                    checkoutCon
                                                        .calculateTotal();
                                                    checkoutCon
                                                        .setChargeAPIColl(
                                                            false);
                                                    checkoutCon
                                                        .clearPackageDeliveryCharge();
                                                  },
                                                  label: AppLocalizations.of(
                                                          context)!
                                                      .pickUpInPerson,
                                                ),
                                              ],
                                            ),
                                            SizedBox(height: 12.h),
                                            // Delivery Addresses
                                            checkoutCon.selectedDeliveryOption ==
                                                    "Pick Up in Person"
                                                ? PickUpPerson(
                                                    addressData: addressesData,
                                                  )
                                                : const HomeDeliverySelection(),
                                            SizedBox(height: 6.h),
                                            _token.isEmpty
                                                ? Row(
                                                    children: [
                                                      Checkbox(
                                                        value: checkoutCon
                                                            .isCreateAccount,
                                                        onChanged: (value) {
                                                          checkoutCon
                                                              .createAccountCheckbox(
                                                                  value!);
                                                        },
                                                      ),
                                                      Text(
                                                        AppLocalizations.of(
                                                                context)!
                                                            .createAccountWithExistingInfo,
                                                        style: Theme.of(context)
                                                            .textTheme
                                                            .bodyMedium
                                                            ?.copyWith(
                                                                fontSize: 12.sp,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w400),
                                                      ),
                                                    ],
                                                  )
                                                : const SizedBox(),
                                            if (checkoutCon.isCreateAccount)
                                              Column(
                                                children: [
                                                  CommonTextField(
                                                    controler: passwordCon,
                                                    hint: AppLocalizations.of(
                                                            context)!
                                                        .enterPassword,
                                                    textAlign: TextAlign.start,
                                                    redOnly: false,
                                                    prefixIcon:
                                                        const Icon(Icons.lock),
                                                  ),
                                                  SizedBox(height: 10.h),
                                                  CommonTextField(
                                                    controler: conPasswordCon,
                                                    hint: AppLocalizations.of(
                                                            context)!
                                                        .confirmPassword,
                                                    textAlign: TextAlign.start,
                                                    redOnly: false,
                                                    prefixIcon:
                                                        const Icon(Icons.lock),
                                                  ),
                                                  SizedBox(height: 10.h),
                                                ],
                                              ),
                                          ],
                                        ))
                                    : SizedBox(height: 8.h),
                                // SizedBox(height: 10.h),
                              ],
                            )),
                          ];
                        },
                        body: SingleChildScrollView(
                          child: Column(
                            children: [
                              Container(
                                padding: EdgeInsets.symmetric(
                                    vertical: 4.h, horizontal: 4.w),
                                decoration: BoxDecoration(
                                  color: Theme.of(context).cardColor,
                                  borderRadius: BorderRadius.circular(8.r),
                                  border: Border.all(
                                      width: 1.w,
                                      color: const Color(0xFFEBEBEB)),
                                  boxShadow: const [
                                    BoxShadow(
                                      color: Color(0xFFEBEBEB),
                                      offset: Offset(
                                        0.4,
                                        0.4,
                                      ),
                                      blurRadius: 0.0,
                                      spreadRadius: 0.0,
                                    )
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    Checkbox(
                                      value: checkoutCon.package
                                          .every((p) => p.isSelected),
                                      materialTapTargetSize:
                                          MaterialTapTargetSize.shrinkWrap,
                                      checkColor: Colors.white,
                                      side: BorderSide(
                                        color: checkoutCon.package
                                                .every((p) => p.isSelected)
                                            ? Colors
                                                .blue // Border color when checked
                                            : Colors
                                                .grey, // Border color when unchecked
                                        width: 2.0,
                                      ),
                                      onChanged: (value) {
                                        checkoutCon.selectAll(value!);
                                      },
                                    ),
                                    Text(
                                      "${AppLocalizations.of(context)!.selectAll}(${checkoutCon.selectedPackageLength} ${AppLocalizations.of(context)!.item})",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                              fontSize: 14.sp,
                                              fontWeight: FontWeight.w600),
                                    ),
                                    const Spacer(),
                                    Text(
                                      AppLocalizations.of(context)!.deleteAll,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                              fontSize: 14.sp,
                                              fontWeight: FontWeight.w600),
                                    ),
                                    SizedBox(
                                      width: 10.w,
                                    ),
                                    InkWell(
                                      onTap: () {
                                        showDialog(
                                            context: context,
                                            builder: (context) {
                                              return AllDeleteDialog(
                                                conform: () {
                                                  checkoutCon
                                                      .deleteSelectedItems();
                                                  cartCon.clearCart();
                                                },
                                              );
                                            });
                                      },
                                      child: Container(
                                          padding: EdgeInsets.symmetric(
                                              vertical: 4.h, horizontal: 4.w),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFE8F1FD),
                                            borderRadius:
                                                BorderRadius.circular(8.r),
                                            border: Border.all(
                                                width: 1.w,
                                                color: const Color(0xFFEBEBEB)),
                                            boxShadow: const [
                                              BoxShadow(
                                                color: Color(0xFFEBEBEB),
                                                offset: Offset(
                                                  0.4,
                                                  0.4,
                                                ),
                                                blurRadius: 0.0,
                                                spreadRadius: 0.0,
                                              )
                                            ],
                                          ),
                                          child: Center(
                                            child: Image.asset(
                                              AssetsIcons.delete,
                                              color: Colors.redAccent,
                                              height: 20.h,
                                              width: 20.w,
                                            ),
                                          )),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(
                                height: 4.h,
                              ),
                              const FirstStepPackageAndItem(),
                            ],
                          ),
                        ),
                      ),
                    ),
              Column(
                children: [
                  FilterTitleWidget(
                    filterTitle: AppLocalizations.of(context)!.orderSummary,
                    isShow: checkoutCon.isSummaryShow,
                    onTap: () {
                      if (checkoutCon.isSummaryShow == true) {
                        checkoutCon.setSummaryShow(false);
                      } else {
                        checkoutCon.setSummaryShow(true);
                      }
                    },
                  ),
                  checkoutCon.isSummaryShow
                      ? Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8.w),
                          child: Column(
                            children: [
                              Divider(
                                thickness: 1.h,
                                color: Colors.grey,
                              ),
                              CommonRow(
                                label: AppLocalizations.of(context)!.subTotal,
                                value: currencyCon.formatCurrency(checkoutCon
                                    .subtotalForCoupon
                                    .toStringAsFixed(2)),
                              ),
                              SizedBox(height: 8.h),
                              currentStep == 3
                                  ? CommonRow(
                                      label: AppLocalizations.of(context)!
                                          .couponDiscount,
                                      value:
                                          "(-)${currencyCon.formatCurrency(checkoutCon.discountAmount.toStringAsFixed(2))}",
                                    )
                                  : const SizedBox(),
                              SizedBox(height: 8.h),
                              CommonRow(
                                label: AppLocalizations.of(context)!
                                    .additionalCharge,
                                value:
                                    "(+)${currencyCon.formatCurrency(checkoutCon.additionalCharge.toStringAsFixed(2))}",
                              ),
                              SizedBox(height: 8.h),
                              CommonRow(
                                  label: AppLocalizations.of(context)!.tax,
                                  value:
                                      "(+)${currencyCon.formatCurrency(checkoutCon.taxAmount.toStringAsFixed(2))}"),
                              checkoutCon.selectedDeliveryOption ==
                                      "Pick Up in Person"
                                  ? Column(
                                      children: [
                                        SizedBox(height: 8.h),
                                        CommonRow(
                                            label: AppLocalizations.of(context)!
                                                .deliveryFee,
                                            value: "Free")
                                      ],
                                    )
                                  : Column(
                                      children: [
                                        SizedBox(height: 8.h),
                                        CommonRow(
                                            label: AppLocalizations.of(context)!
                                                .deliveryFee,
                                            value:
                                                "(+)${currencyCon.formatCurrency(checkoutCon.deliveryCharge.toStringAsFixed(2))}")
                                      ],
                                    ),
                              Divider(
                                thickness: 1.h,
                                color: Colors.grey,
                              ),
                            ],
                          ),
                        )
                      : const SizedBox(),
                  SizedBox(height: 6.h),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8.w),
                    child: CommonRow(
                        label: AppLocalizations.of(context)!.totalAmount,
                        value: currencyCon.formatCurrency(
                            checkoutCon.totalAmount.toStringAsFixed(2))),
                  ),
                  SizedBox(height: 6.h),
                  checkoutCon.stepsTow
                      ? Column(
                          children: [
                            // Terms and Conditions
                            InkWell(
                              onTap: () {
                                checkoutCon.setConditionAccept(
                                    !checkoutCon.isConditionAccept);
                              },
                              child: Row(
                                children: [
                                  Checkbox(
                                    value: checkoutCon.isConditionAccept,
                                    checkColor: Colors.white,
                                    side: BorderSide(
                                      color: checkoutCon.isConditionAccept
                                          ? Colors.blue
                                          : Colors.grey,
                                      width: 1.0,
                                    ),
                                    onChanged: (value) {
                                      checkoutCon.setConditionAccept(value!);
                                    },
                                  ),
                                  Expanded(
                                    child: RichText(
                                      text: TextSpan(
                                        text: AppLocalizations.of(context)!
                                            .iAgreePlaces,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium
                                            ?.copyWith(
                                                fontWeight: FontWeight.w400,
                                                fontSize: 10.sp), // Base style
                                        children: [
                                          TextSpan(
                                            text: AppLocalizations.of(context)!
                                                .termsAndConditions,
                                            style: Theme.of(context)
                                                .textTheme
                                                .headlineLarge
                                                ?.copyWith(
                                                    fontWeight: FontWeight.w400,
                                                    fontSize: 12.sp,
                                                    color: Colors
                                                        .blue), // Add a clickable color
                                            recognizer: TapGestureRecognizer()
                                              ..onTap = () {
                                                context.pushNamed(RouteNames
                                                    .termsAndCondition);
                                              },
                                          ),
                                          TextSpan(
                                            text: " & ",
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium
                                                ?.copyWith(
                                                    fontWeight: FontWeight.w400,
                                                    fontSize: 12.sp),
                                          ),
                                          TextSpan(
                                            text: AppLocalizations.of(context)!
                                                .privacyPolicy,
                                            style: Theme.of(context)
                                                .textTheme
                                                .headlineLarge
                                                ?.copyWith(
                                                    fontWeight: FontWeight.w400,
                                                    fontSize: 12.sp,
                                                    color: Colors
                                                        .blue), // Add a clickable color
                                            recognizer: TapGestureRecognizer()
                                              ..onTap = () {
                                                context.pushNamed(
                                                    RouteNames.privacyPolicy);
                                              },
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(height: 2.h),
                            BlocConsumer<PlaceOrderBloc, PlaceOrderState>(
                              listener: (context, state) {
                                if (state is PlaceOrderConnectionError) {
                                  CommonFunctions.showCustomSnackBar(
                                    context,
                                    AppLocalizations.of(context)!.noInternet,
                                  );
                                } else if (state is PlaceOrderFailure) {
                                  CommonFunctions.showCustomSnackBar(
                                    context,
                                    state.authModel.message,
                                  );
                                } else if (state is PlaceOrderLoaded) {
                                  checkoutCon.clearPackage();
                                  cartCon.clearCart();
                                  if (paymentCon.selectedPaymentType ==
                                      "Stripe") {
                                    if (state.authModel.orderMaster != null) {
                                      orderId = state.authModel.orderMaster!.id;
                                      _hMacGenerateBloc.add(HMacGenerate(
                                          orderId: orderId.toString(),
                                          token: _token));
                                      commonProvider.setSecondaryLoading(true);
                                    }
                                  } else if (paymentCon.selectedPaymentType ==
                                          "Cash On Delivery" ||
                                      paymentCon.selectedPaymentType ==
                                          "Wallet") {
                                    context.goNamed(RouteNames.homeScreen);
                                    homeCon.setCurrentIndexHomePage(3);
                                    CommonFunctions.showUpSnack(
                                      message: state.authModel.message,
                                      context: context,
                                    );
                                  }
                                }
                              },
                              builder: (context, state) {
                                if (state is PlaceOrderLoading) {
                                  return const CommonLoadingButton();
                                }
                                return checkoutCon.isConditionAccept &&
                                        paymentCon
                                            .selectedPaymentType.isNotEmpty &&
                                        checkoutCon.totalAmount > 0
                                    ? CommonButton(
                                        buttonText:
                                            AppLocalizations.of(context)!
                                                .placeOrder,
                                        onTap: () {
                                          if (paymentCon
                                              .selectedPaymentType.isNotEmpty) {
                                            String paymentType = '';
                                            if (paymentCon
                                                    .selectedPaymentType ==
                                                "Cash On Delivery") {
                                              paymentType = "cash_on_delivery";
                                            } else if (paymentCon
                                                    .selectedPaymentType ==
                                                "Stripe") {
                                              paymentType = "stripe";
                                            } else if (paymentCon
                                                    .selectedPaymentType ==
                                                "PayPal") {
                                              paymentType = "paypal";
                                            } else if (paymentCon
                                                    .selectedPaymentType ==
                                                "Razorpay") {
                                              paymentType = "razorpay";
                                            } else if (paymentCon
                                                    .selectedPaymentType ==
                                                "Paytm") {
                                              paymentType = "paytm";
                                            } else if (paymentCon
                                                    .selectedPaymentType ==
                                                "Wallet") {
                                              paymentType = "wallet";
                                            }
                                            final formattedData =
                                                formatSelectedPackages(
                                                    checkoutCon
                                                        .selectedPackage);
                                            _placeOrderBloc.add(PlaceOrder(
                                              latitude: checkoutCon
                                                  .selectedAddressLat,
                                              longitude: checkoutCon
                                                  .selectedAddressLong,
                                              addressId: checkoutCon
                                                  .selectedDeliveryAddressId,
                                              name: checkoutCon.name,
                                              email: checkoutCon.email,
                                              contactNumber:
                                                  checkoutCon.contactNumber,
                                              paymentGateway: paymentType,
                                              comment: "",
                                              couponCode: checkoutCon.coupon,
                                              currencyCode:
                                                  currencyCon.currencyCode,
                                              guestInfo: guestInfo,
                                              packages: formattedData,
                                              token: _token,
                                            ));
                                          }
                                        },
                                      )
                                    : CommonDisabledButton(
                                        buttonText:
                                            AppLocalizations.of(context)!
                                                .placeOrder,
                                      );
                              },
                            ),
                          ],
                        )
                      : checkoutCon.selectedPackage.isNotEmpty &&
                              checkoutCon.isFlashSaleQtyRight
                          ? CommonButton(
                              buttonText: AppLocalizations.of(context)!.payment,
                              onTap: () {
                                if (checkoutCon.selectedDeliveryOption ==
                                    "Home Delivery") {
                                  if (checkoutCon
                                          .selectedDeliveryAddress.isNotEmpty &&
                                      checkoutCon.selectedDeliveryAddressId >
                                          0 &&
                                      checkoutCon.isChargeLoaded) {
                                    checkoutCon.setSteps(true);
                                  } else {
                                    CommonFunctions.showCustomSnackBar(
                                        context,
                                        AppLocalizations.of(context)!
                                            .pleaseSelectSelectTheDeliveryAddressForYourOrder);
                                  }
                                } else {
                                  checkoutCon.setSteps(true);
                                }
                              })
                          : CommonDisabledButton(
                              buttonText: AppLocalizations.of(context)!.payment,
                            ),
                  SizedBox(height: 20.h),
                ],
              ),
              if (commonProvider.isSecondaryLoading)
                BlocListener<HMacGenerateBloc, HMacGenerateState>(
                  listener: (context, state) {
                    if (state is HMacGenerateConnectionError) {
                      CommonFunctions.showCustomSnackBar(
                        context,
                        AppLocalizations.of(context)!.noInternet,
                      );
                      commonProvider.setSecondaryLoading(false);
                    } else if (state is HMacGenerateLoaded) {
                      commonProvider.setSecondaryLoading(false);
                      final hMacModel = state.hMacModel;
                      final hasValidKeys =
                          hMacModel.hMac != null && hMacModel.timestamp != null;
                      if (hasValidKeys) {
                        hMacKey = hMacModel.hMac!;
                        timestamp = Utils.formatString(hMacModel.timestamp);
                        if (paymentCon.selectedPaymentType == "Stripe") {
                          double moneyOfUSD = 0.0;
                          if (currencyCon.currencyCode == "USD") {
                            moneyOfUSD = checkoutCon.totalAmount;
                          } else {
                            moneyOfUSD = checkoutCon.totalAmount /
                                currencyCon.exchangeRate;
                          }
                          PaymentFunction.stripePayment(
                            totalAmount: moneyOfUSD,
                            commonRepository: commonRepository,
                            onPaymentSuccess: (String trId) {
                              _paymentStatusUpdateBloc.add(
                                OrderPaymentStatusUpdate(
                                  orderId: orderId.toString(),
                                  transactionId: trId,
                                  timestamp: timestamp,
                                  hMacSignature: hMacKey,
                                  token: _token,
                                ),
                              );
                            },
                          );
                        }
                      }
                    }
                  },
                  child: const SizedBox(),
                ),
              BlocListener<PaymentStatusUpdateBloc, PaymentStatusUpdateState>(
                listener: (context, state) {
                  if (state is PaymentStatusUpdateFailure) {
                    CommonFunctions.showCustomSnackBar(
                      context,
                      state.authModel.message ?? "Something went wrong",
                    );
                  } else if (state is PaymentStatusUpdateLoaded) {
                    CommonFunctions.showUpSnack(
                      message: state.authModel.message,
                      context: context,
                    );
                    context.goNamed(RouteNames.homeScreen);
                    homeCon.setCurrentIndexHomePage(3);
                  }
                },
                child: const SizedBox(), // No UI changes here
              )
            ],
          ),
        ),
      ),
    );
  }

  List<Map<String, dynamic>> formatSelectedPackages(
      List<Package> selectedPackages) {
    var checkoutCon = Provider.of<CheckoutController>(context, listen: false);
    return selectedPackages.map((package) {
      return {
        "store_id": package.storeId,
        "delivery_option": checkoutCon.selectedDeliveryOption == "Home Delivery"
            ? "home_delivery"
            : "takeaway",
        "delivery_type": package.shippingType,
        "delivery_time": "10.00-11.00",
        "items": package.items.where((item) => item.isSelected).map((item) {
          return {
            "product_id": item.productId,
            "variant_id": item.variantId,
            "quantity": item.quantity,
          };
        }).toList(),
      };
    }).toList();
  }
}

class AllDeleteDialog extends StatelessWidget {
  const AllDeleteDialog({super.key, required this.conform});
  final VoidCallback conform;
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      title: Text(
        AppLocalizations.of(context)!.areYouSureDeleteAllItems,
        textAlign: TextAlign.center,
        style: Theme.of(context)
            .textTheme
            .bodyMedium
            ?.copyWith(fontWeight: FontWeight.w600, fontSize:kIsWeb ? 12 :  12.sp),
      ),
      content: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          ChildButton(
            color: Colors.red,
              widget: Text(
                AppLocalizations.of(context)!.no,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w400,
                      fontSize: kIsWeb ? 14 : 14.sp,
                    ),
              ),
              onPressed: () {
                Navigator.pop(context);
              }),
          SizedBox(
            width: kIsWeb ? 20 : 20.w,
          ),
          ChildButton(
              widget: Text(
                AppLocalizations.of(context)!.yes,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w400,
                      fontSize: kIsWeb ? 14 : 14.sp,
                    ),
              ),
              onPressed: conform),
        ],
      ),
    );
  }
}

class PickUpPerson extends StatefulWidget {
  const PickUpPerson({super.key, required this.addressData});
  final AddressListModel addressData;

  @override
  State<PickUpPerson> createState() => _PickUpPersonState();
}

class _PickUpPersonState extends State<PickUpPerson> {
  String _name = '';

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  Future<void> _initializeData() async {
    _name = await UserSharedPreference.getValue(
            SharedPreferenceHelper.customerName) ??
        "";
    // Check if the widget is still mounted before using context
    if (!mounted) {
      return; // Widget is no longer in the tree, so don't use its context
    }
    final checkoutCon = Provider.of<CheckoutController>(context, listen: false);
    checkoutCon.setPicUpPerson(
      _name,
      Utils.formatString(widget.addressData.email),
      Utils.formatString(widget.addressData.contactNumber),
    );
  }

  @override
  Widget build(BuildContext context) {
    var checkoutCon = Provider.of<CheckoutController>(context);
    return Container(
      padding: EdgeInsets.all(kIsWeb ? 12 : 12.0.sp),
      decoration: BoxDecoration(
        border: Border.all(width: kIsWeb ? 1 : 1.w, color: Colors.grey),
        borderRadius: BorderRadius.circular(kIsWeb ? 10 : 10.r),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(
                Icons.person,
                color: Colors.blue,
              ),
              SizedBox(
                width: kIsWeb ? 6 : 6.w,
              ),
              Text(
                checkoutCon.name,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontSize: kIsWeb ? 10 : 10.sp, fontWeight: FontWeight.w400),
              ),
              const Spacer(),
              InkWell(
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (context) => const AddressEditDialog(),
                  );
                },
                child: const Icon(
                  Icons.edit,
                  color: Colors.blue,
                ),
              ),
            ],
          ),
          SizedBox(
            height: kIsWeb ? 10 : 10.w,
          ),
          Row(
            children: [
              const Icon(
                Icons.phone,
                color: Colors.blue,
              ),
              SizedBox(
                width: kIsWeb ? 6 : 6.w,
              ),
              Text(
                checkoutCon.contactNumber,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontSize: kIsWeb ? 10 : 10.sp, fontWeight: FontWeight.w400),
              ),
            ],
          ),
          SizedBox(
            height: kIsWeb ? 10 : 10.w,
          ),
          Row(
            children: [
              const Icon(
                Icons.email,
                color: Colors.blue,
              ),
              SizedBox(
                width: kIsWeb ? 6 : 6.w,
              ),
              Text(
                checkoutCon.email,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontSize: kIsWeb ? 10 : 10.sp, fontWeight: FontWeight.w400),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class AddressEditDialog extends StatefulWidget {
  const AddressEditDialog({super.key});

  @override
  State<AddressEditDialog> createState() => _AddressEditDialogState();
}

class _AddressEditDialogState extends State<AddressEditDialog> {
  late final TextEditingController nameController;
  late final TextEditingController emailController;
  late final TextEditingController phoneController;

  @override
  void initState() {
    super.initState();
    final checkoutCon = Provider.of<CheckoutController>(context, listen: false);
    nameController = TextEditingController(text: checkoutCon.name);
    emailController = TextEditingController(text: checkoutCon.email);
    phoneController = TextEditingController(text: checkoutCon.contactNumber);
  }

  String completeNumber = '';
  String initialCountryCode = "BD";
  @override
  void dispose() {
    nameController.dispose();
    emailController.dispose();
    phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    var checkoutCon = Provider.of<CheckoutController>(context);
    var authProvider = Provider.of<AuthenticationProvider>(context);
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
          FieldTitle(title: AppLocalizations.of(context)!.name, star: "*"),
          CommonTextField(
            controler: nameController,
            hint: AppLocalizations.of(context)!.enterFullName,
            textAlign: TextAlign.start,
          ),
          SizedBox(height: 8.h),
          FieldTitle(title: AppLocalizations.of(context)!.phone, star: "*"),
          CommonPhoneField(
            controller: phoneController,
            initialCountryCode: initialCountryCode,
            hintText: AppLocalizations.of(context)!.enterPhone,
            onChanged: (value) {
              completeNumber = value.completeNumber;
            },
          ),
          SizedBox(height: 8.h),
          FieldTitle(title: AppLocalizations.of(context)!.email, star: "*"),
          CommonTextField(
            controler: emailController,
            hint: AppLocalizations.of(context)!.enterEmail,
            textAlign: TextAlign.start,
            inputType: TextInputType.emailAddress,
          ),
          SizedBox(height: 12.h),
          CommonButton(
              buttonText: AppLocalizations.of(context)!.saveChanges,
              onTap: () {
                authProvider.checkEmailValidity(emailController.text);
                bool validUserEmail = authProvider.isValidEmail;
                if (nameController.text.trim().isNotEmpty) {
                  if (emailController.text.trim().isNotEmpty) {
                    if (validUserEmail) {
                      if (completeNumber.trim().isNotEmpty) {
                        Navigator.pop(context);
                        checkoutCon.setPicUpPerson(nameController.text,
                            emailController.text, completeNumber);
                      } else {
                        CommonFunctions.showCustomSnackBar(context,
                            "${AppLocalizations.of(context)!.phone} ${AppLocalizations.of(context)!.fieldRequired}");
                      }
                    } else {
                      CommonFunctions.showCustomSnackBar(context,
                          AppLocalizations.of(context)!.enterValidEmail);
                    }
                  } else {
                    CommonFunctions.showCustomSnackBar(context,
                        "${AppLocalizations.of(context)!.email} ${AppLocalizations.of(context)!.fieldRequired}");
                  }
                } else {
                  CommonFunctions.showCustomSnackBar(context,
                      "${AppLocalizations.of(context)!.name} ${AppLocalizations.of(context)!.fieldRequired}");
                }
              })
        ],
      ),
    );
  }
}

class HomeDeliverySelection extends StatefulWidget {
  const HomeDeliverySelection({super.key});
  @override
  State<HomeDeliverySelection> createState() => _HomeDeliverySelectionState();
}

class _HomeDeliverySelectionState extends State<HomeDeliverySelection> {
  AddressListModel? addressesData;

  @override
  void initState() {
    final controller = context.read<CheckoutController>();
    if (controller.addressesList.isNotEmpty) {
      addressesData = controller.addressesList.first;
    }
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final checkoutCon = context.watch<CheckoutController>();
    return Column(
      children: [
        Row(
          children: [
            Text(
              AppLocalizations.of(context)!.deliveryAddresses,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontSize: kIsWeb ? 16 : 16.sp, fontWeight: FontWeight.w600),
            ),
            const Spacer(),
            InkWell(
              onTap: () {
                if (kIsWeb) {
                  showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return AlertDialog(
                          insetPadding: EdgeInsets.zero,
                          contentPadding: const EdgeInsets.all(0),
                          backgroundColor:
                              Theme.of(context).scaffoldBackgroundColor,
                          content: const SizedBox(
                              width: 400, child: AddDeliveryAddress()));
                    },
                  );
                } else {
                  checkoutCon.clearDeliveryAddressAndCharge();
                  checkoutCon.clearAddressList();
                  context.pushNamed(RouteNames.addDeliveryAddress);
                }
              },
              child: Container(
                padding: EdgeInsets.symmetric(
                    vertical: kIsWeb ? 4 : 4.h, horizontal: kIsWeb ? 10 : 10.w),
                decoration: BoxDecoration(
                  color: const Color(0xFF1A73E8),
                  borderRadius: BorderRadius.circular(kIsWeb ? 2 : 2.r),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.add,
                      size: kIsWeb ? 16 : 16.sp,
                      color: Colors.white,
                    ),
                    SizedBox(width: kIsWeb ? 8 : 8.h),
                    Text(
                      AppLocalizations.of(context)!.address,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontSize: kIsWeb ? 10 : 10.sp,
                            color: const Color(0xFFFFFFFF),
                            fontWeight: FontWeight.w400,
                          ),
                    ),
                  ],
                ),
              ),
            )
          ],
        ),
        SizedBox(height: kIsWeb ? 10 : 10.h),
        Divider(
          thickness: kIsWeb ? 1 : 1.h,
          color: Theme.of(context).dividerColor,
        ),
        Container(
          padding: EdgeInsets.only(top: kIsWeb ? 8 : 8.h),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(kIsWeb ? 10 : 10.r),
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  children: [
                    const Icon(
                      Icons.location_on,
                      color: Colors.blue,
                    ),
                    SizedBox(
                      width: kIsWeb ? 6 : 6.w,
                    ),
                    Expanded(
                      child: checkoutCon.addressesList.isNotEmpty
                          ? Text(
                              checkoutCon.selectedDeliveryAddress,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(
                                      fontSize: kIsWeb ? 14 : 14.sp,
                                      fontWeight: FontWeight.w400),
                            )
                          : Text(
                              AppLocalizations.of(context)!
                                  .noAddressAvailablePleaseAddAddress,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context)
                                  .textTheme
                                  .displayLarge
                                  ?.copyWith(
                                      fontSize: kIsWeb ? 12 : 12.sp,
                                      fontWeight: FontWeight.w400),
                            ),
                    ),
                    InkWell(
                      onTap: () {
                        if (kIsWeb) {
                          showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return AlertDialog(
                                  insetPadding: EdgeInsets.zero,
                                  backgroundColor:
                                      Theme.of(context).scaffoldBackgroundColor,
                                  content: SizedBox(
                                      width: 400,
                                      child: AddDeliveryAddress(
                                        id: Utils.formatString(
                                            addressesData!.id),
                                        title: Utils.formatString(
                                            addressesData!.title),
                                        type: Utils.formatString(
                                            addressesData!.type),
                                        email: Utils.formatString(
                                            addressesData!.email),
                                        contactNumber: Utils.formatString(
                                            addressesData!.contactNumber),
                                        countryCode: Utils.formatString(
                                            addressesData!.isoCountryCode ??
                                                "BD"),
                                        address: Utils.formatString(
                                            addressesData!.address),
                                        lat: Utils.formatString(
                                            addressesData!.lat),
                                        long: Utils.formatString(
                                            addressesData!.long),
                                        area: Utils.formatInt(
                                            addressesData!.area),
                                        road: Utils.formatString(
                                            addressesData!.road),
                                        house: Utils.formatString(
                                            addressesData!.house),
                                        floor: Utils.formatString(
                                            addressesData!.floor),
                                        postalCode: Utils.formatString(
                                            addressesData!.postalCode),
                                        isDefault:
                                            addressesData!.isDefault ?? false,
                                        status: Utils.formatString(
                                            addressesData!.status),
                                      )));
                            },
                          );
                        } else {
                          if (addressesData != null) {
                            checkoutCon.clearDeliveryAddressAndCharge();
                            checkoutCon.clearAddressList();
                            context.pushNamed(
                              RouteNames.addDeliveryAddress,
                              extra: {
                                'id': Utils.formatString(addressesData!.id),
                                'title':
                                    Utils.formatString(addressesData!.title),
                                'type': Utils.formatString(addressesData!.type),
                                'email':
                                    Utils.formatString(addressesData!.email),
                                'contactNumber': Utils.formatString(
                                    addressesData!.contactNumber),
                                'country_code': Utils.formatString(
                                    addressesData!.isoCountryCode ?? "BD"),
                                'address':
                                    Utils.formatString(addressesData!.address),
                                'lat': Utils.formatString(addressesData!.lat),
                                'long': Utils.formatString(addressesData!.long),
                                'area': Utils.formatInt(addressesData!.area),
                                'road': Utils.formatString(addressesData!.road),
                                'house':
                                    Utils.formatString(addressesData!.house),
                                'floor':
                                    Utils.formatString(addressesData!.floor),
                                'postalCode': Utils.formatString(
                                    addressesData!.postalCode),
                                'isDefault': addressesData!.isDefault ?? false,
                                'status': addressesData!.status ?? 0,
                              },
                            );
                          } else {
                            CommonFunctions.showCustomSnackBar(
                                context,
                                AppLocalizations.of(context)!
                                    .deliveryAddressesNotFound);
                          }
                        }
                      },
                      child: Image.asset(
                        AssetsIcons.edit,
                        height: kIsWeb ? 20 : 20.h,
                        width: kIsWeb ? 20 : 20.w,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(
                height: kIsWeb ? 8 : 8.h,
              ),
              PopupMenuButton<String>(
                color: Colors.white,
                position: PopupMenuPosition.under,
                onSelected: (value) {
                  addressesData = checkoutCon.addressesList
                      .firstWhere((e) => e.address == value);
                  if (addressesData != null) {
                    checkoutCon.clearDeliveryAddressAndCharge();
                    checkoutCon.setDeliveryAddress(
                      addressesData!.address,
                      addressesData!.id,
                      double.tryParse(addressesData!.lat)!,
                      double.tryParse(addressesData!.long)!,
                    );
                    if (addressesData!.lat != null &&
                        addressesData!.long != null) {
                      checkoutCon.setChargeAPIColl(true);
                      checkoutCon.getDeliveryCharge
                          ? GetDeliveryCharge(
                              lat: checkoutCon.selectedAddressLat,
                              long: checkoutCon.selectedAddressLong)
                          : const SizedBox();
                      checkoutCon.setChargeAPIColl(false);
                    }
                  }
                },
                itemBuilder: (context) => checkoutCon.addressesLevelList
                    .map((address) => PopupMenuItem<String>(
                          value: address,
                          child: Text(
                            address,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                    fontWeight: FontWeight.w400,
                                    fontSize: kIsWeb ? 14 : 14.sp,
                                    color: Colors.black),
                          ),
                        ))
                    .toList(),
                icon: Container(
                  height: kIsWeb ? 40 : 40.h,
                  decoration: BoxDecoration(
                    border: Border.all(
                        width: kIsWeb ? 1 : 1.w,
                        color: Theme.of(context).dividerColor),
                    borderRadius: BorderRadius.circular(kIsWeb ? 10 : 10.r),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Padding(
                          padding: EdgeInsets.all(kIsWeb ? 8 : 8.0.sp),
                          child: Text(
                            checkoutCon.selectedDeliveryAddress.isEmpty
                                ? AppLocalizations.of(context)!
                                    .pleaseSelectSelectTheDeliveryAddressForYourOrder
                                : checkoutCon.selectedDeliveryAddress,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                    fontSize: kIsWeb ? 12 : 12.sp,
                                    fontWeight: FontWeight.w400),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                      const Align(
                        alignment: Alignment.centerRight,
                        child: Icon(Icons.keyboard_arrow_down),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class PaymentMethodWidget extends StatefulWidget {
  const PaymentMethodWidget({super.key});

  @override
  State<PaymentMethodWidget> createState() => _PaymentMethodWidgetState();
}

class _PaymentMethodWidgetState extends State<PaymentMethodWidget> {
  late final WalletBloc _walletBloc;
  bool hasCashOnDelivery = false;
  String _token = '';
  @override
  void initState() {
    _walletBloc = context.read<WalletBloc>();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
    _walletBloc.add(Wallet(token: _token));
  }

  @override
  Widget build(BuildContext context) {
    final checkoutCon = context.watch<CheckoutController>();
    final currencyCon = Provider.of<CurrencyController>(context);
    final paymentCon = Provider.of<PaymentOptionCon>(context);
    return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(kIsWeb ? 5 : 5.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          BlocConsumer<WalletBloc, WalletState>(
            listener: (context, state) {
              if (state is WalletConnectionError) {
                CommonFunctions.showCustomSnackBar(
                    context, AppLocalizations.of(context)!.noInternet);
              } else if (state is WalletFailure) {
                CommonFunctions.showCustomSnackBar(
                    context, "Something went wrong");
              }
            },
            builder: (context, state) {
              if (state is WalletLoading) {
                return const SizedBox();
              } else if (state is WalletLoaded) {
                final data = state.walletsModel.wallets;
                double balance = Utils.formatDouble(data.totalBalance);
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  checkoutCon.setWalletBalance(balance);
                  checkoutCon
                      .setWalletActive(data.status == "active" ? true : false);
                });
              }
              return const SizedBox();
            },
          ),
          SizedBox(height: kIsWeb ? 2 : 2.h),
          FieldTitle(
            title: AppLocalizations.of(context)!.paymentMethod,
            star: "*",
          ),
          Row(
            children: [
              Expanded(
                child: paymentCon.isCashOnDeliveryActive
                    ? _buildPaymentOption(
                        context: context,
                        icon: AssetsIcons.money,
                        label: 'Cash On Delivery',
                      )
                    : const SizedBox(),
              ),
              SizedBox(width: kIsWeb ? 8 : 8.w),
              Expanded(
                child: checkoutCon.walletBalance >= checkoutCon.totalAmount &&
                        checkoutCon.isWalletActive
                    ? _buildPaymentOption(
                        context: context,
                        icon: AssetsIcons.wallet,
                        label: 'Wallet',
                        amount: checkoutCon.walletBalance.toString())
                    : Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: Colors.grey.shade300,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Image.asset(
                              AssetsIcons.wallet,
                              width: kIsWeb ? 24 : 24.w,
                              height: kIsWeb ? 24 : 24.h,
                              fit: BoxFit.cover,
                            ),
                            SizedBox(width: kIsWeb ? 8 : 8.w),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  AppLocalizations.of(context)!.wallet,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                        color: Colors.grey,
                                        fontWeight: FontWeight.w400,
                                        fontSize: kIsWeb ? 10 : 12.sp,
                                      ),
                                ),
                                SizedBox(height: kIsWeb ? 4 : 4.h),
                                Text(
                                  currencyCon.formatCurrency(
                                      checkoutCon.walletBalance.toString()),
                                  style: Theme.of(context)
                                      .textTheme
                                      .displayLarge
                                      ?.copyWith(
                                        fontWeight: FontWeight.w400,
                                        fontSize: kIsWeb ? 10 : 10.sp,
                                      ),
                                ),
                              ],
                            )
                          ],
                        ),
                      ),
              ),
            ],
          ),
          SizedBox(height: kIsWeb ? 16 : 16.h),
          const OnlinePaymentOption(
            isShowCashOnDelivery: true,
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption({
    required BuildContext context,
    required String icon,
    required String label,
    String amount = "0",
  }) {
    final currencyCon = Provider.of<CurrencyController>(context);
    return Consumer<PaymentOptionCon>(
      builder: (context, checkoutCon, child) {
        return GestureDetector(
          onTap: () {
            checkoutCon.setPaymentType(label);
          },
          child: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              border: Border.all(
                color: checkoutCon.selectedPaymentType == label
                    ? Colors.blue
                    : Colors.grey.shade300,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Image.asset(
                  icon,
                  width: kIsWeb ? 24 : 24.w,
                  height: kIsWeb ? 24 : 24.h,
                  fit: BoxFit.cover,
                ),
                SizedBox(width: kIsWeb ? 8 : 8.w),
                label == "Wallet"
                    ? Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            label,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  color:
                                      checkoutCon.selectedPaymentType == label
                                          ? Colors.blue
                                          : Colors.black,
                                  fontWeight:
                                      checkoutCon.selectedPaymentType == label
                                          ? FontWeight.w500
                                          : FontWeight.w400,
                                  fontSize: kIsWeb ? 12 : 12.sp,
                                ),
                          ),
                          SizedBox(height: kIsWeb ? 4 : 4.h),
                          Text(
                            currencyCon.formatCurrency(amount),
                            style: Theme.of(context)
                                .textTheme
                                .displayLarge
                                ?.copyWith(
                                  fontWeight: FontWeight.w400,
                                  fontSize: kIsWeb ? 10 : 10.sp,
                                ),
                          ),
                        ],
                      )
                    : Expanded(
                      child: Text(
                          label,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: checkoutCon.selectedPaymentType == label
                                    ? Colors.blue
                                    : Colors.black,
                                fontWeight:
                                    checkoutCon.selectedPaymentType == label
                                        ? FontWeight.w500
                                        : FontWeight.w400,
                                fontSize: kIsWeb ? 12 : 12.sp,
                              ),
                                        overflow: TextOverflow.ellipsis,
                        ),
                    ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class DeliveryOptionCard extends StatelessWidget {
  final String value;
  final String groupValue;
  final Function(String) onChanged;
  final String label;

  const DeliveryOptionCard({
    super.key,
    required this.value,
    required this.groupValue,
    required this.onChanged,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;

    return Expanded(
      child: GestureDetector(
        onTap: () => onChanged(value),
        child: Container(
          padding: EdgeInsets.only(
              right: kIsWeb ? 8 : 8.w,
              top: kIsWeb ? 4 : 4.h,
              bottom: kIsWeb ? 4 : 4.h),
          decoration: BoxDecoration(
            border: Border.all(
              color: isSelected ? Colors.blue : Colors.grey,
            ),
            borderRadius: BorderRadius.circular(10),
            color: isSelected ? const Color(0xFFDDEAFC) : Colors.white,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Radio<String>(
                value: value,
                groupValue: groupValue,
                activeColor: Colors.blue,
                fillColor: WidgetStateProperty.resolveWith<Color>(
                  (Set<WidgetState> states) {
                    if (states.contains(WidgetState.selected)) {
                      return Colors
                          .blue; // Color when the radio button is selected
                    }
                    return Colors.grey; // Default fill color
                  },
                ),
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                onChanged: (selectedValue) => onChanged(selectedValue!),
              ),
              Text(
                label,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                      fontSize: kIsWeb ? 12 : 12.sp,
                      color: Colors.black,
                      fontWeight: FontWeight.w400,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class FirstStepPackageAndItem extends StatelessWidget {
  const FirstStepPackageAndItem({super.key});

  @override
  Widget build(BuildContext context) {
    final currencyCon = Provider.of<CurrencyController>(context);
    final cartCon = context.watch<CartProvider>();
    return Consumer<CheckoutController>(
      builder: (context, packageProvider, child) {
        final packages = packageProvider.package;
        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: packages.length,
          itemBuilder: (context, packageIndex) {
            final package = packages[packageIndex];
            return CommonCard(
              pLeft: 0,
              pRight: 4,
              pTop: 4,
              pBottom: 4,
              mHorizontal: 0,
              mVertical: 4,
              widget: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Checkbox(
                          value: package.isSelected,
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                          checkColor: Colors.white,
                          side: BorderSide(
                            color: packageProvider.package
                                    .every((p) => p.isSelected)
                                ? Colors.blue // Border color when checked
                                : Colors.grey, // Border color when unchecked
                            width: 1.0,
                          ),
                          onChanged: (value) {
                            packageProvider.togglePackageSelection(
                                packageIndex, value!);
                          },
                        ),
                        Text(
                          '${AppLocalizations.of(context)!.package}: ${packageIndex + 1} Of ${packages.length.toString()}',
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(
                                  fontSize: kIsWeb ? 12 : 12.sp,
                                  color: Colors.black),
                        ),
                        const Spacer(),
                        Icon(Icons.store_outlined,
                            color: Colors.green, size: kIsWeb ? 14 : 14.sp),
                        SizedBox(
                          width: 4.h,
                        ),
                        Text(
                          package.storeName,
                          style: Theme.of(context)
                              .textTheme
                              .headlineLarge
                              ?.copyWith(
                                  fontSize: kIsWeb ? 12 : 12.sp,
                                  color: Colors.black),
                        ),
                      ],
                    ),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: package.items.length,
                      itemBuilder: (context, itemIndex) {
                        final item = package.items[itemIndex];
                        return Column(
                          children: [
                            Row(
                              children: [
                                Checkbox(
                                  value: item.isSelected,
                                  materialTapTargetSize:
                                      MaterialTapTargetSize.shrinkWrap,
                                  checkColor: Colors.white,
                                  side: BorderSide(
                                    color: packageProvider.package
                                            .every((p) => p.isSelected)
                                        ? Colors.blue
                                        : Colors.grey,
                                    width: 1.0,
                                  ),
                                  onChanged: (value) {
                                    packageProvider.toggleItemSelection(
                                        packageIndex, itemIndex, value!);
                                  },
                                ),
                                CommonImage(
                                  imageUrl: item.image,
                                  height: kIsWeb ? 79 : 79.h,
                                  width: kIsWeb ? 66 : 66.w,
                                ),
                                SizedBox(width: kIsWeb ? 8 : 8.h),
                                Expanded(
                                    child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          item.productName.toString(),
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyMedium
                                              ?.copyWith(
                                                fontSize: kIsWeb ? 12 : 12.sp,
                                                fontWeight: FontWeight.w600,
                                              ),
                                        ),
                                        const Spacer(),
                                        item.isFlashDeal
                                            ? Image.asset(
                                                AssetsIcons.flash,
                                                height: kIsWeb ? 15 : 15.h,
                                                width: kIsWeb ? 15 : 15.w,
                                              )
                                            : const SizedBox(),
                                      ],
                                    ),
                                    RichText(
                                      text: TextSpan(
                                        children: item.variant
                                            .split(',')
                                            .map((entry) {
                                              final parts = entry.split(':');
                                              return [
                                                TextSpan(
                                                  text: '${parts[0].trim()}: ',
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyMedium
                                                      ?.copyWith(
                                                        fontSize:
                                                            kIsWeb ? 12 : 12.sp,
                                                        fontWeight:
                                                            FontWeight.w500,
                                                      ),
                                                ),
                                                TextSpan(
                                                  text: parts[1].trim(),
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .bodyMedium
                                                      ?.copyWith(
                                                        fontSize:
                                                            kIsWeb ? 10 : 10.sp,
                                                        fontWeight:
                                                            FontWeight.w400,
                                                      ),
                                                ),
                                                if (item.variant
                                                        .split(',')
                                                        .last !=
                                                    entry) // Add a comma if not the last
                                                  TextSpan(
                                                    text: ', ',
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .bodyMedium
                                                        ?.copyWith(
                                                          fontSize: kIsWeb
                                                              ? 10
                                                              : 10.sp,
                                                          fontWeight:
                                                              FontWeight.w400,
                                                        ),
                                                  ),
                                              ];
                                            })
                                            .expand((e) => e)
                                            .toList(),
                                      ),
                                    ),
                                    SizedBox(
                                      height: kIsWeb ? 4 : 4.h,
                                    ),
                                    Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      children: [
                                        Text(
                                          "${AppLocalizations.of(context)!.price}: ",
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyMedium
                                              ?.copyWith(
                                                  fontWeight: FontWeight.w300,
                                                  fontSize:
                                                      kIsWeb ? 10 : 10.sp),
                                        ),
                                        Text(
                                          currencyCon
                                              .formatCurrency(item.price),
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyMedium
                                              ?.copyWith(
                                                  fontWeight: FontWeight.w400,
                                                  fontSize:
                                                      kIsWeb ? 10 : 10.sp),
                                        ),
                                      ],
                                    ),
                                    SizedBox(
                                      height: kIsWeb ? 2 : 2.h,
                                    ),
                                    Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      children: [
                                        Text(
                                          "${AppLocalizations.of(context)!.total}: ",
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyMedium
                                              ?.copyWith(
                                                  fontWeight: FontWeight.w400,
                                                  fontSize:
                                                      kIsWeb ? 10 : 10.sp),
                                        ),
                                        Text(
                                          currencyCon.formatCurrency(item
                                              .lineAmount
                                              .toStringAsFixed(2)),
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyMedium
                                              ?.copyWith(
                                                  fontWeight: FontWeight.w600,
                                                  fontSize:
                                                      kIsWeb ? 12 : 12.sp),
                                        ),
                                      ],
                                    ),
                                    SizedBox(
                                      height: 4.h,
                                    ),
                                    Row(
                                      children: [
                                        item.isSelected
                                            ? QuantityControl(
                                                quantity: item.quantity,
                                                onIncrement: () {
                                                  packageProvider
                                                      .incrementQuantity(
                                                          packageIndex,
                                                          itemIndex,
                                                          context);
                                                },
                                                onDecrement: () {
                                                  packageProvider
                                                      .decrementQuantity(
                                                          packageIndex,
                                                          itemIndex);
                                                })
                                            : Container(
                                                padding: EdgeInsets.all(
                                                    kIsWeb ? 4 : 4.w),
                                                decoration: BoxDecoration(
                                                  borderRadius:
                                                      BorderRadius.circular(
                                                          kIsWeb ? 4 : 4.r),
                                                  border: Border.all(
                                                      width:
                                                          kIsWeb ? .36 : 0.36.w,
                                                      color: CustomColors.grey),
                                                ),
                                                child: Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .spaceBetween,
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.center,
                                                  children: [
                                                    Container(
                                                      height:
                                                          kIsWeb ? 22 : 22.h,
                                                      padding: EdgeInsets.all(
                                                          kIsWeb ? 4 : 4.w),
                                                      decoration: BoxDecoration(
                                                        color: Colors.grey,
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(kIsWeb
                                                                    ? 4
                                                                    : 4.r),
                                                        border: Border.all(
                                                            width: kIsWeb
                                                                ? .36
                                                                : 0.36.w,
                                                            color: Colors.grey),
                                                      ),
                                                      child: Icon(
                                                        size:
                                                            kIsWeb ? 12 : 12.sp,
                                                        Icons.remove,
                                                        color: Colors.white,
                                                      ),
                                                    ),
                                                    SizedBox(
                                                        width:
                                                            kIsWeb ? 5 : 5.h),
                                                    Text(
                                                      '${item.quantity}',
                                                      style: TextStyle(
                                                          fontSize: kIsWeb
                                                              ? 16
                                                              : 16.sp),
                                                    ),
                                                    SizedBox(
                                                        width:
                                                            kIsWeb ? 5 : 5.h),
                                                    Container(
                                                      height:
                                                          kIsWeb ? 22 : 22.h,
                                                      padding: EdgeInsets.all(
                                                          kIsWeb ? 4 : 4.w),
                                                      decoration: BoxDecoration(
                                                        color: Colors.grey,
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(kIsWeb
                                                                    ? 4
                                                                    : 4.r),
                                                        border: Border.all(
                                                            width: kIsWeb
                                                                ? .36
                                                                : 0.36.w,
                                                            color: Colors.grey),
                                                      ),
                                                      child: Icon(
                                                        Icons.add,
                                                        size:
                                                            kIsWeb ? 12 : 12.sp,
                                                        color: Colors.white,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                        const Spacer(),
                                        InkWell(
                                            onTap: () {
                                              cartCon.deleteItem(item.cartId);
                                              packageProvider.removeItem(
                                                  packageIndex, itemIndex);
                                            },
                                            child: Image.asset(
                                              AssetsIcons.delete,
                                              height: kIsWeb ? 20 : 20.h,
                                              width: kIsWeb ? 20 : 20.w,
                                              color: Colors.grey,
                                            ))
                                      ],
                                    ),
                                  ],
                                ))
                              ],
                            ),
                            if (itemIndex < package.items.length - 1)
                              const Divider(
                                color: Color(0xFFD9D9D9),
                              ),
                          ],
                        );
                      },
                    ),
                    SizedBox(height: kIsWeb ? 5 : 5.h),
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.symmetric(
                          vertical: kIsWeb ? 8 : 8.h,
                          horizontal: kIsWeb ? 10 : 10.w),
                      decoration: BoxDecoration(
                        border: Border.all(
                            width: kIsWeb ? .2 : .2.w, color: Colors.grey),
                        borderRadius: BorderRadius.circular(kIsWeb ? 4 : 4.r),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              RichText(
                                text: TextSpan(children: [
                                  TextSpan(
                                    text: AppLocalizations.of(context)!
                                        .deliveryType,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          fontSize: kIsWeb ? 12 : 12.sp,
                                          fontWeight: FontWeight.w500,
                                        ),
                                  ),
                                  TextSpan(
                                    text: " : ",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          fontSize: kIsWeb ? 10 : 10.sp,
                                          fontWeight: FontWeight.w400,
                                        ),
                                  ),
                                  TextSpan(
                                    text: Utils.capitalizeFirstLetter(
                                        package.shippingType),
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          fontSize: kIsWeb ? 10 : 10.sp,
                                          fontWeight: FontWeight.w400,
                                        ),
                                  ),
                                ]),
                              ),
                              const Spacer(),
                              RichText(
                                text: TextSpan(children: [
                                  TextSpan(
                                    text: AppLocalizations.of(context)!.tax,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          fontSize: kIsWeb ? 12 : 12.sp,
                                          fontWeight: FontWeight.w500,
                                        ),
                                  ),
                                  TextSpan(
                                    text: " : ",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          fontSize: kIsWeb ? 10 : 10.sp,
                                          fontWeight: FontWeight.w400,
                                        ),
                                  ),
                                  TextSpan(
                                    text:
                                        "${Utils.formatString(package.storeTaxP)} %",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          fontSize: kIsWeb ? 10 : 10.sp,
                                          fontWeight: FontWeight.w400,
                                        ),
                                  ),
                                ]),
                              ),
                            ],
                          ),
                          SizedBox(
                            height: kIsWeb ? 4 : 4.h,
                          ),
                          Row(
                            children: [
                              if (packageProvider.selectedDeliveryOption ==
                                  "Home Delivery")
                                RichText(
                                  text: TextSpan(children: [
                                    TextSpan(
                                      text: AppLocalizations.of(context)!
                                          .deliveryCharge,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                            fontSize: kIsWeb ? 12 : 12.sp,
                                            fontWeight: FontWeight.w500,
                                          ),
                                    ),
                                    TextSpan(
                                      text: " : ",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                            fontSize: kIsWeb ? 10 : 10.sp,
                                            fontWeight: FontWeight.w400,
                                          ),
                                    ),
                                    TextSpan(
                                      text: currencyCon.formatCurrency(
                                          package.charge.toStringAsFixed(2)),
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                            fontSize: kIsWeb ? 10 : 10.sp,
                                            fontWeight: FontWeight.w400,
                                          ),
                                    ),
                                  ]),
                                ),
                              const Spacer(),
                              RichText(
                                text: TextSpan(children: [
                                  TextSpan(
                                    text: AppLocalizations.of(context)!
                                        .additionalCharge,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          fontSize: kIsWeb ? 12 : 12.sp,
                                          fontWeight: FontWeight.w500,
                                        ),
                                  ),
                                  TextSpan(
                                    text: " : ",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          fontSize: kIsWeb ? 10 : 10.sp,
                                          fontWeight: FontWeight.w400,
                                        ),
                                  ),
                                  TextSpan(
                                    text: currencyCon.formatCurrency(package
                                        .additionalLineAmount
                                        .toString()),
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          fontSize: kIsWeb ? 10 : 10.sp,
                                          fontWeight: FontWeight.w400,
                                        ),
                                  ),
                                ]),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class SecondStepPackageAndItm extends StatelessWidget {
  const SecondStepPackageAndItm({super.key});

  @override
  Widget build(BuildContext context) {
    final currencyCon = Provider.of<CurrencyController>(context);
    return Consumer<CheckoutController>(
      builder: (context, packageProvider, child) {
        final packages = packageProvider.selectedPackage;
        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: packages.length,
          itemBuilder: (context, packageIndex) {
            final data = packageProvider.selectedPackage[packageIndex];
            return Container(
              margin: EdgeInsets.symmetric(vertical: kIsWeb ? 4 : 4.h),
              padding: EdgeInsets.only(
                  bottom: kIsWeb ? 0 : 0.h,
                  left: kIsWeb ? 4 : 4.w,
                  right: kIsWeb ? 4 : 4.w,
                  top: kIsWeb ? 16 : 16.h),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10.r),
                border: Border.all(
                  color: Colors.blue, // Highlight 2nd item
                  width: kIsWeb ? 1 : 1.w,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.shade200,
                    blurRadius: kIsWeb ? 6 : 6.r,
                    offset: Offset(0, 3.h),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                          '${AppLocalizations.of(context)!.package}:${packageIndex + 1} Of ${packages.length.toString()}',
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    fontSize: kIsWeb ? 14 : 14.sp,
                                    color: Colors.black,
                                    fontWeight: FontWeight.w600,
                                  )),
                      const Spacer(),
                      Icon(Icons.local_shipping, size: kIsWeb ? 16 : 16.sp),
                      SizedBox(width: 4.w),
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                                text: AppLocalizations.of(context)!.shippedBy,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                      fontSize: kIsWeb ? 10 : 10.sp,
                                      color: Colors.black,
                                      fontWeight: FontWeight.w600,
                                    )),
                            TextSpan(
                                text: ":  ",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                      fontSize: kIsWeb ? 10 : 10.sp,
                                      color: Colors.black,
                                      fontWeight: FontWeight.w600,
                                    )),
                            TextSpan(
                                text: data.storeName,
                                style: Theme.of(context)
                                    .textTheme
                                    .headlineLarge
                                    ?.copyWith(
                                      fontSize: kIsWeb ? 10 : 10.sp,
                                      fontWeight: FontWeight.w600,
                                    )),
                          ],
                        ),
                      ),
                      SizedBox(width: kIsWeb ? 10 : 10.w),
                    ],
                  ),
                  SizedBox(height: kIsWeb ? 8 : 8.h),
                  Container(
                    padding: EdgeInsets.symmetric(
                        vertical: kIsWeb ? 8 : 8.h,
                        horizontal: kIsWeb ? 6 : 6.w),
                    decoration: BoxDecoration(
                        border: Border.all(width: .1.w, color: Colors.grey),
                        borderRadius: BorderRadius.circular(kIsWeb ? 5 : 5.r),
                        color: const Color(0xFFE4E8EF)),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                              "${AppLocalizations.of(context)!.deliveryType}: ${data.deliveryType == "standard_delivery" ? "Standard" : data.deliveryType} | Charge:${currencyCon.formatCurrency(data.charge.toString())}",
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(
                                    fontSize: kIsWeb ? 10 : 10.sp,
                                    color: Colors.black,
                                    fontWeight: FontWeight.w400,
                                  )),
                        ),
                        Text("",
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  fontSize: kIsWeb ? 10 : 10.sp,
                                  fontWeight: FontWeight.w400,
                                )),
                      ],
                    ),
                  ),
                  SizedBox(height: kIsWeb ? 6 : 6.h),
                  ListView.builder(
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: data.items.length,
                      shrinkWrap: true,
                      itemBuilder: (context, itemIndex) {
                        final itemData = data.items[itemIndex];
                        return Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Row(
                            children: [
                              CommonImage(
                                imageUrl: itemData.image,
                                width: kIsWeb ? 57 : 57.w,
                                height: kIsWeb ? 61 : 61.h,
                              ),
                              // Item Image
                              SizedBox(width: kIsWeb ? 12 : 12.w),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(itemData.productName,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium
                                            ?.copyWith(
                                              fontSize: kIsWeb ? 12 : 12.sp,
                                              color: Colors.black,
                                              fontWeight: FontWeight.w600,
                                            )),
                                    SizedBox(height: kIsWeb ? 10 : 10.h),
                                    RichText(
                                      text: TextSpan(
                                        children: itemData.variant
                                            .split(',')
                                            .map((entry) {
                                              final parts = entry.split(':');
                                              return [
                                                TextSpan(
                                                  text: '${parts[0].trim()}: ',
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .displayLarge
                                                      ?.copyWith(
                                                        fontSize:
                                                            kIsWeb ? 12 : 12.sp,
                                                        fontWeight:
                                                            FontWeight.w500,
                                                      ),
                                                ),
                                                TextSpan(
                                                  text: parts[1].trim(),
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .displayLarge
                                                      ?.copyWith(
                                                        fontSize:
                                                            kIsWeb ? 10 : 10.sp,
                                                        fontWeight:
                                                            FontWeight.w400,
                                                      ),
                                                ),
                                                if (itemData.variant
                                                        .split(',')
                                                        .last !=
                                                    entry) // Add a comma if not the last
                                                  TextSpan(
                                                    text: ', ',
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .displayLarge
                                                        ?.copyWith(
                                                          fontSize: kIsWeb
                                                              ? 10
                                                              : 10.sp,
                                                          fontWeight:
                                                              FontWeight.w400,
                                                        ),
                                                  ),
                                              ];
                                            })
                                            .expand((e) => e)
                                            .toList(),
                                      ),
                                    ),
                                    SizedBox(height: kIsWeb ? 8 : 8.h),
                                    Container(
                                      //width: 200.w,
                                      padding: EdgeInsets.symmetric(
                                          vertical: kIsWeb ? 5 : 5.h,
                                          horizontal: kIsWeb ? 6 : 6.w),
                                      decoration: BoxDecoration(
                                          border: Border.all(
                                              width: kIsWeb ? .1 : .1.w,
                                              color: Colors.grey),
                                          borderRadius: BorderRadius.circular(
                                              kIsWeb ? 5 : 5.r),
                                          color: const Color(0xFFE9EBF3)),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                              "${AppLocalizations.of(context)!.price}: ${currencyCon.formatCurrency(itemData.price.toString())}",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium
                                                  ?.copyWith(
                                                    fontSize:
                                                        kIsWeb ? 10 : 10.sp,
                                                    color: Colors.black,
                                                    fontWeight: FontWeight.w600,
                                                  )),
                                          Text(
                                              "${AppLocalizations.of(context)!.qty}: ${itemData.quantity.toString()}",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium
                                                  ?.copyWith(
                                                    fontSize: kIsWeb ? 9 : 9.sp,
                                                    color: Colors.black,
                                                    fontWeight: FontWeight.w500,
                                                  )),
                                          SizedBox(
                                            width: kIsWeb ? 8 : 8.w,
                                          ),
                                          Text(
                                              "${AppLocalizations.of(context)!.total}: ${currencyCon.formatCurrency(itemData.lineAmount.toString())}",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .displayLarge
                                                  ?.copyWith(
                                                    fontSize:
                                                        kIsWeb ? 10 : 10.sp,
                                                    color: Colors.black,
                                                    fontWeight: FontWeight.w600,
                                                  )),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      })
                ],
              ),
            );
          },
        );
      },
    );
  }
}
