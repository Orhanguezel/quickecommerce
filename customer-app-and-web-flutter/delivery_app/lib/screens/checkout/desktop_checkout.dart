
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/checkout/tax_calculation.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/address_list_bloc/address_list_bloc.dart';
import '../../controller/bloc/address_list_bloc/address_list_event.dart';
import '../../controller/bloc/address_list_bloc/address_list_state.dart';
import '../../controller/bloc/extra_charge_bloc/extra_charge_bloc.dart';
import '../../controller/bloc/extra_charge_bloc/extra_charge_event.dart';
import '../../controller/bloc/extra_charge_bloc/extra_charge_state.dart';
import '../../controller/bloc/h_mac_key_generate_bloc/hmac_generate_bloc.dart';
import '../../controller/bloc/h_mac_key_generate_bloc/hmac_generate_event.dart';
import '../../controller/bloc/h_mac_key_generate_bloc/hmac_generate_state.dart';
import '../../controller/bloc/payment_status_update_bloc/payment_status_update_bloc.dart';
import '../../controller/bloc/payment_status_update_bloc/payment_status_update_state.dart';
import '../../controller/bloc/place_order_bloc/place_order_bloc.dart';
import '../../controller/bloc/place_order_bloc/place_order_event.dart';
import '../../controller/bloc/place_order_bloc/place_order_state.dart';
import '../../controller/provider/cart_controler.dart';
import '../../controller/provider/checkout_controler.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/currencie_controler.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/payment_option_controller.dart';
import '../../data/data_model/address_model.dart';
import '../../data/data_model/extra_charge_model.dart';
import '../../data/service/common_repository.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/commn_textfield.dart';
import '../common_widgets/common_button.dart';
import '../common_widgets/common_card.dart';
import '../common_widgets/common_disabeld_button.dart';
import '../common_widgets/common_funcktion.dart';
import 'checkout_screen.dart';
import 'cupon_calculate.dart';

class WebCheckoutScreens extends StatefulWidget {
  const WebCheckoutScreens({
    super.key,
  });
  @override
  WebCheckoutScreensState createState() => WebCheckoutScreensState();
}

class WebCheckoutScreensState extends State<WebCheckoutScreens> {
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
    final checkoutCon = context.read<CheckoutController>();
    _addressListBloc
        .add(AddressList(id: "", type: "", status: "", token: _token));
    _extraChargeBloc.add(ExtraChargeData(productIds: checkoutCon.productIds));
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
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal:12 ),
          child: SingleChildScrollView(
            scrollDirection: Axis.vertical,
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
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
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
                              const SizedBox(width:6),
                              CircleAvatar(
                                  radius: 18,
                                  backgroundColor: isCompleted
                                      ? Colors.blue
                                      : isCurrent
                                      ? const Color(0xFFD0DFFF)
                                      : Colors.grey[300],
                                  child: ImageIcon(
                                    AssetImage(progressSteps[index]["icon"]),
                                    color:
                                    isCompleted ? Colors.white : Colors.blue,
                                    size: 16,
                                  )),
                              const SizedBox(width: 4 ),
                              if (index < progressSteps.length - 1)
                                Container(
                                  width: 60.w,
                                  height:4,
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
                          const SizedBox(height: 8),
                          Text(
                            progressSteps[index]["status"],
                            textAlign: TextAlign.justify,
                            style: Theme.of(context)
                                .textTheme
                                .displayLarge!
                                .copyWith(
                              fontSize:  10,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ),
                const SizedBox(height:10),
                checkoutCon.stepsTow
                    ?Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                  const Expanded(
                  flex: 3,
                child:  SecondStepPackageAndItm()
            ),
                  const SizedBox(width: 10,),
                  Expanded(
                    flex: 2,
                      child: Column(
                        children: [
                          const PaymentMethodWidget(),
                          const SizedBox(
                            height: 6,
                          ),
                          const SizedBox(height: 6),
                          const CouponCalculate(),
                          const SizedBox(height: 6),
                          CommonCard(
                            mHorizontal: 0,
                              mVertical: 4,
                              widget: Column(
                                children: [
                                  const Divider(
                                    thickness: 1,
                                    color: Colors.grey,
                                  ),
                                  CommonRow(
                                    label: AppLocalizations.of(context)!.subTotal,
                                    value: currencyCon.formatCurrency(checkoutCon
                                        .subtotalForCoupon
                                        .toStringAsFixed(2)),
                                  ),
                                  const SizedBox(height: 8),
                                  currentStep == 3
                                      ? CommonRow(
                                    label: AppLocalizations.of(context)!
                                        .couponDiscount,
                                    value:
                                    "(-)${currencyCon.formatCurrency(checkoutCon.discountAmount.toStringAsFixed(2))}",
                                  )
                                      : const SizedBox(),
                                  const SizedBox(height: 8),
                                  CommonRow(
                                    label: AppLocalizations.of(context)!
                                        .additionalCharge,
                                    value:
                                    "(+)${currencyCon.formatCurrency(checkoutCon.additionalCharge.toStringAsFixed(2))}",
                                  ),
                                  const SizedBox(height: 8),
                                  CommonRow(
                                      label: AppLocalizations.of(context)!.tax,
                                      value:
                                      "(+)${currencyCon.formatCurrency(checkoutCon.taxAmount.toStringAsFixed(2))}"),
                                  checkoutCon.selectedDeliveryOption ==
                                      "Pick Up in Person"
                                      ? Column(
                                    children: [
                                      const SizedBox(height: 8),
                                      CommonRow(
                                          label: AppLocalizations.of(context)!
                                              .deliveryFee,
                                          value: "Free")
                                    ],
                                  )
                                      : Column(
                                    children: [
                                      const SizedBox(height: 8),
                                      CommonRow(
                                          label: AppLocalizations.of(context)!
                                              .deliveryFee,
                                          value:
                                          "(+)${currencyCon.formatCurrency(checkoutCon.deliveryCharge.toStringAsFixed(2))}")
                                    ],
                                  ),
                                  const Divider(
                                    thickness: 1,
                                    color: Colors.grey,
                                  ),
                                  const SizedBox(height: 6),
                                  CommonRow(
                                      label: AppLocalizations.of(context)!.totalAmount,
                                      value: currencyCon.formatCurrency(
                                          checkoutCon.totalAmount.toStringAsFixed(2))),
                                  const SizedBox(height: 6),
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
                                                  fontSize: 10), // Base style
                                              children: [
                                                TextSpan(
                                                  text: AppLocalizations.of(context)!
                                                      .termsAndConditions,
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .headlineLarge
                                                      ?.copyWith(
                                                      fontWeight: FontWeight.w400,
                                                      fontSize: 12,
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
                                                      fontSize: 12),
                                                ),
                                                TextSpan(
                                                  text: AppLocalizations.of(context)!
                                                      .privacyPolicy,
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .headlineLarge
                                                      ?.copyWith(
                                                      fontWeight: FontWeight.w400,
                                                      fontSize: 12,
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
                                  const SizedBox(height: 2),
                                  BlocConsumer<PlaceOrderBloc, PlaceOrderState>(
                                    listener: (context, state) {
                                      if (state is PlaceOrderConnectionError) {
                                        CommonFunctions.showCustomSnackBar(
                                          context,
                                          AppLocalizations.of(context)!.noInternet,
                                        );
                                      }
                                      else if (state is PlaceOrderFailure) {
                                        CommonFunctions.showCustomSnackBar(
                                          context,
                                          state.authModel.message,
                                        );
                                      }
                                      else if (state is PlaceOrderLoaded) {
                                        checkoutCon.clearPackage();
                                        cartCon.clearCart();
                                        if (paymentCon.selectedPaymentType ==
                                            "Stripe") {
                                          if (state.authModel.orderMaster != null) {
                                            orderId = state.authModel.orderMaster!.id;
                                            _hMacGenerateBloc.add(CreateStripeSession(
                                                currencyCode:"USD",
                                                orderMasterId: orderId.toString(),
                                                token: _token
                                            ));
                                            commonProvider.setSecondaryLoading(true);
                                          }
                                        }
                                        else if (paymentCon.selectedPaymentType ==
                                            "Cash On Delivery" ||
                                            paymentCon.selectedPaymentType ==
                                                "Wallet") {
                                            context.goNamed(RouteNames.homeScreen);
                                            homeCon.setTabType("Menu");
                                            homeCon.setMenuName("MyOrder");
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
                          ),

                        ]
                      )
                  )
                ],)
                    : Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                  Expanded(
                      flex: 3,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          const SizedBox(height:10),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                vertical: 4, horizontal: 4),
                            decoration: BoxDecoration(
                              color: Theme.of(context).cardColor,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                  width: 1,
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
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600),
                                ),
                                const Spacer(),
                                Text(
                                  AppLocalizations.of(context)!.deleteAll,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(
                                  width: 10,
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
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 4, horizontal: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFE8F1FD),
                                        borderRadius:
                                        BorderRadius.circular(8),
                                        border: Border.all(
                                            width: 1,
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
                                          height: 20,
                                          width: 20,
                                        ),
                                      )),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(
                            height: 4,
                          ),
                          const FirstStepPackageAndItem(),
                        ],
                      )
                  ),
                  const SizedBox(width: 10,),
                  Expanded(
                    flex: 2,
                      child: Column(
                          children: [
                          CommonCard(
                                mVertical: 8,
                                mHorizontal: 0,
                                pBottom: 4,
                                widget: Column(
                                  crossAxisAlignment:
                                  CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      AppLocalizations.of(context)!
                                        .deliveryOptions,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600),
                                    ),

                                    const Divider(
                                      thickness: 1,
                                      color: Colors.grey,
                                    ),
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
                                        const SizedBox(width: 10),
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
                                    const SizedBox(height: 12),
                                    // Delivery Addresses
                                    checkoutCon.selectedDeliveryOption ==
                                        "Pick Up in Person"
                                        ? PickUpPerson(
                                      addressData: addressesData,
                                    )
                                        : const HomeDeliverySelection(),
                                    const SizedBox(height: 6),
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
                                              fontSize: 12,
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
                                          const SizedBox(height: 10),
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
                                          const SizedBox(height: 10),
                                        ],
                                      ),
                                  ],
                                )),
                            CommonCard(
                                mVertical: 8,
                                mHorizontal: 0,
                                widget: Column(
                                  children: [
                                    Text(
                                      AppLocalizations.of(context)!
                                          .orderSummary,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600),
                                    ),
                                    const Divider(
                                      thickness: 1,
                                      color: Colors.grey,
                                    ),
                                    CommonRow(
                                      label: AppLocalizations.of(context)!.subTotal,
                                      value: currencyCon.formatCurrency(checkoutCon
                                          .subtotalForCoupon
                                          .toStringAsFixed(2)),
                                    ),
                                    const SizedBox(height: 8),
                                    currentStep == 3
                                        ? CommonRow(
                                      label: AppLocalizations.of(context)!
                                          .couponDiscount,
                                      value:
                                      "(-)${currencyCon.formatCurrency(checkoutCon.discountAmount.toStringAsFixed(2))}",
                                    )
                                        : const SizedBox(),
                                    const SizedBox(height: 8),
                                    CommonRow(
                                      label: AppLocalizations.of(context)!
                                          .additionalCharge,
                                      value:
                                      "(+)${currencyCon.formatCurrency(checkoutCon.additionalCharge.toStringAsFixed(2))}",
                                    ),
                                    const SizedBox(height: 8),
                                    CommonRow(
                                        label: AppLocalizations.of(context)!.tax,
                                        value:
                                        "(+)${currencyCon.formatCurrency(checkoutCon.taxAmount.toStringAsFixed(2))}"),
                                    checkoutCon.selectedDeliveryOption ==
                                        "Pick Up in Person"
                                        ? Column(
                                      children: [
                                        const SizedBox(height: 8),
                                        CommonRow(
                                            label: AppLocalizations.of(context)!
                                                .deliveryFee,
                                            value: "Free")
                                      ],
                                    )
                                        : Column(
                                      children: [
                                        const SizedBox(height: 8),
                                        CommonRow(
                                            label: AppLocalizations.of(context)!
                                                .deliveryFee,
                                            value:
                                            "(+)${currencyCon.formatCurrency(checkoutCon.deliveryCharge.toStringAsFixed(2))}")
                                      ],
                                    ),
                                    const Divider(
                                      thickness: 1,
                                      color: Colors.grey,
                                    ),
                                    const SizedBox(height: 6),
                                    CommonRow(
                                        label: AppLocalizations.of(context)!.totalAmount,
                                        value: currencyCon.formatCurrency(
                                            checkoutCon.totalAmount.toStringAsFixed(2))),
                                    const SizedBox(height: 6),
                                    checkoutCon.selectedPackage.isNotEmpty &&
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
                                  ],
                                )
                            )
                          ]
                      )
                  )
                ],),
                if (commonProvider.isSecondaryLoading)
                  BlocListener<HMacGenerateBloc, HMacGenerateState>(
                    listener: (context, state) {
                      if (state is HMacGenerateConnectionError) {
                        CommonFunctions.showCustomSnackBar(
                          context,
                          AppLocalizations.of(context)!.noInternet,
                        );
                        commonProvider.setSecondaryLoading(false);
                      }
                      else if (state is HMacGenerateLoaded){
                        final hMacModel = state.hMacModel;
                        final checkoutUrl = hMacModel.data?.checkoutUrl;
                        if (checkoutUrl != null && checkoutUrl.isNotEmpty) {
                          _launchCheckoutUrl(checkoutUrl);
                        }
                        commonProvider.setSecondaryLoading(false);
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
                      context.goNamed(RouteNames.webHomeScreen);
                    }
                  },
                  child: const SizedBox(), // No UI changes here
                )
              ],
            ),
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

  Future<void> _launchCheckoutUrl(String url) async {
    final Uri uri = Uri.parse(url);

    if (await canLaunchUrl(uri)) {
      await launchUrl(
        uri,
        mode: LaunchMode.externalApplication, // Opens in browser
      );
    } else {
      throw 'Could not launch $url';
    }
  }


}