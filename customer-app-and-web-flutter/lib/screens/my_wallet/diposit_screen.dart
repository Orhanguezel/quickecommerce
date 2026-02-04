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
import 'package:quick_ecommerce/controller/bloc/save_bloc/save_event.dart';

import 'package:quick_ecommerce/controller/bloc/wallet_bloc/wallet_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/wallet_bloc/wallet_event.dart';
import 'package:quick_ecommerce/controller/provider/currencie_controler.dart';
import 'package:quick_ecommerce/controller/provider/payment_option_controller.dart';
import 'package:quick_ecommerce/screens/common_widgets/commn_textfield.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/online_payment_option.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../controller/bloc/save_bloc/save_state.dart';
import '../../controller/provider/common_provider.dart';
import '../../data/sirvice/common_repository.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/payment_funcktion.dart';

class DepositScreen extends StatefulWidget {
  const DepositScreen({super.key, required this.walletId, required this.maxDepositAmount});
  final int walletId;
  final String maxDepositAmount;
  @override
  State<DepositScreen> createState() => _DepositScreenState();
}

class _DepositScreenState extends State<DepositScreen> {
  final TextEditingController amountCon = TextEditingController();

  CommonRepository commonRepository = CommonRepository();


  late final SaveBloc _saveBloc;
  late final WalletBloc _walletBloc;
  late final PaymentStatusUpdateBloc _paymentStatusUpdateBloc;
  late final HMacGenerateBloc _hMacGenerateBloc;

  String _token = '',hMacKey = '';
  int timestamp =0;
  @override
  void initState() {
    _saveBloc = context.read<SaveBloc>();
    _walletBloc = context.read<WalletBloc>();
    _paymentStatusUpdateBloc = context.read<PaymentStatusUpdateBloc>();
    _hMacGenerateBloc = context.read<HMacGenerateBloc>();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
  }
  double _calculateMaxInput(String maxDepositAmount, String currencyCode, double exchangeRate) {
    final double haveValue = double.tryParse(maxDepositAmount) ?? 0.0;
    if (haveValue == 0.0) return 0.0;
    // If USD, keep as is
    if (currencyCode == "USD") {
      return haveValue;
    }
    return haveValue * exchangeRate;
  }
  @override
  Widget build(BuildContext context) {
    var commonProvider = Provider.of<CommonProvider>(context);
    final currencyCon = Provider.of<CurrencyController>(context);
    final paymentOpCon = Provider.of<PaymentOptionCon>(context);
    double maxInput = _calculateMaxInput(widget.maxDepositAmount, currencyCon.currencyCode, currencyCon.exchangeRate);
    return Scaffold(
      appBar: AppBar(
        title: Text(
          AppLocalizations.of(context)!.deposit,
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.w700, fontSize: 18.sp),
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: EdgeInsets.all(8.0.sp),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 16.h,
            ),
            Text(
              AppLocalizations.of(context)!.depositAmount,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w600, fontSize: 16.sp),
            ),
            SizedBox(
              height: 6.h,
            ),
            CommonTextField(
                controler: amountCon,
                inputType: TextInputType.number,
                inputFormatters: [
                  MaxAmountInputFormatter(maxInput),],
                hint: " ${AppLocalizations.of(context)!.enterDepositAmount} (${AppLocalizations.of(context)!.max}${currencyCon.formatCurrency(widget.maxDepositAmount)})",
                textAlign: TextAlign.start,
                redOnly: false),
            SizedBox(
              height: 10.h,
            ),
            Text(
              AppLocalizations.of(context)!.choosePaymentMethod,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w600, fontSize: 16.sp),
            ),
            SizedBox(
              height: 20.h,
            ),
            const OnlinePaymentOption(isShowCashOnDelivery: false,),
            SizedBox(
              height: 20.h,
            ),
            BlocConsumer<SaveBloc, SaveState>(
              listener: (context, state) {
                if (state is SaveFailure) {
                  CommonFunctions.showCustomSnackBar(context,
                      state.authModel.message ?? "Something went wrong");
                }
                else if (state is SaveLoaded) {
                  paymentOpCon.setWalletHistoryId(
                      Utils.formatInt(state.authModel.walletHistoryId));
                  _hMacGenerateBloc.add(WalletHMacGenerate(
                      historyId:Utils.formatString(state.authModel.walletHistoryId),
                      token: _token));
                  commonProvider.setSecondaryLoading(true);
                }
              },
              builder: (context, state) {
                if (state is SaveLoading) {
                  return const CommonLoadingButton();
                }
                return  CommonButton(
                        buttonText: AppLocalizations.of(context)!.deposit,
                        onTap: () {
                          if (amountCon.text.trim().isNotEmpty) {
                            if (paymentOpCon.selectedPaymentType.isNotEmpty) {
                              double depositAmount = 0.0;
                              final input =Utils.formatDouble(amountCon.text);
                              if(input>0){
                                if (currencyCon.decimalPoint == "YES") {
                                  depositAmount = input;
                                }
                                else {
                                  depositAmount = input.roundToDouble();
                                }
                                _saveBloc.add(Deposit(
                                  walletId: widget.walletId,
                                  transactionId: "",
                                  transactionDetails: 'Deposit funds to wallet',
                                  amount: depositAmount,
                                  currencyCode: currencyCon.currencyCode,
                                  type: 'credit',
                                  purpose: 'order',
                                  paymentGateway: paymentOpCon.selectedPaymentType,
                                  status: 0,
                                  token: _token,
                                ));
                              }

                            } else {
                              CommonFunctions.showCustomSnackBar(context,
                                  "${AppLocalizations.of(context)!.paymentMethod} ${AppLocalizations.of(context)!.fieldRequired}");
                            }
                          } else {
                            CommonFunctions.showCustomSnackBar(context,
                                "${AppLocalizations.of(context)!.amount} ${AppLocalizations.of(context)!.fieldRequired}");
                          }
                        });
              },
            ),
            if(commonProvider.isSecondaryLoading )
              BlocListener<HMacGenerateBloc, HMacGenerateState>(
                listener: (context, state) {
                  if (state is HMacGenerateConnectionError) {
                    CommonFunctions.showCustomSnackBar(
                      context,
                      AppLocalizations.of(context)!.noInternet,
                    );
                    commonProvider.setSecondaryLoading(false);
                  }
                  else if (state is HMacGenerateLoaded) {
                    final hMacModel = state.hMacModel;
                    final hasValidKeys = hMacModel.hMac != null &&
                        hMacModel.timestamp != null;
                    if (hasValidKeys) {
                      hMacKey = hMacModel.hMac!;
                      timestamp = hMacModel.timestamp;
                      if (paymentOpCon.selectedPaymentType == "Stripe") {
                        double depositAmount =Utils.formatDouble(amountCon.text);
                        double moneyOfUSD=0.0;
                        if(currencyCon.currencyCode=="USD"){
                           moneyOfUSD=depositAmount;
                        }else{
                          moneyOfUSD=depositAmount/currencyCon.exchangeRate;
                        }

                        PaymentFunction.stripePayment(
                            totalAmount: moneyOfUSD,
                            onPaymentSuccess: (String trId) {
                              _paymentStatusUpdateBloc.add(DepositUpdate(
                                walletHistoryId: paymentOpCon.walletHistoryId,
                                transactionId: trId,
                                transactionDetails: 'Deposit funds to wallet',
                                hMacSignature: hMacKey,
                                timestamp: timestamp,
                                token: _token,
                              ));
                              commonProvider.setSecondaryLoading(true);
                            },
                            commonRepository: commonRepository);
                      }
                    }
                    commonProvider.setSecondaryLoading(false);
                  }
                },
                child: const SizedBox(),
              ),
            BlocConsumer<PaymentStatusUpdateBloc, PaymentStatusUpdateState>(
              listener: (context, state) {
                if (state is PaymentStatusUpdateFailure) {
                  CommonFunctions.showCustomSnackBar(context,
                      state.authModel.message ?? "Something went wrong");
                }
                else if (state is PaymentStatusUpdateLoaded) {
                  context.pop();
                  commonProvider.setSecondaryLoading(false);
                  CommonFunctions.showUpSnack(
                    message: state.authModel.message,
                    context: context,
                  );
                  _walletBloc.add(Wallet(token: _token));
                }
              },
              builder: (context, state) {
                if (state is SaveLoading) {
                  return const SizedBox();
                }
                return const SizedBox();
              },
            )
          ],
        ),
      ),
    );
  }
}


class DepositDialog extends StatefulWidget {
  const DepositDialog({super.key, required this.walletId, required this.maxDepositAmount});
  final int walletId;
  final String maxDepositAmount;
  @override
  State<DepositDialog> createState() => _DepositDialogState();
}

class _DepositDialogState extends State<DepositDialog> {
  final TextEditingController amountCon = TextEditingController();

  CommonRepository commonRepository = CommonRepository();


  late final SaveBloc _saveBloc;
  late final WalletBloc _walletBloc;
  late final PaymentStatusUpdateBloc _paymentStatusUpdateBloc;
  late final HMacGenerateBloc _hMacGenerateBloc;

  String _token = '',hMacKey = '';
  int timestamp =0;
  @override
  void initState() {
    _saveBloc = context.read<SaveBloc>();
    _walletBloc = context.read<WalletBloc>();
    _paymentStatusUpdateBloc = context.read<PaymentStatusUpdateBloc>();
    _hMacGenerateBloc = context.read<HMacGenerateBloc>();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
  }
  double _calculateMaxInput(String maxDepositAmount, String currencyCode, double exchangeRate) {
    final double haveValue = double.tryParse(maxDepositAmount) ?? 0.0;
    if (haveValue == 0.0) return 0.0;

    if (currencyCode == "USD") {
      return haveValue;
    }
    return haveValue * exchangeRate;
  }
  @override
  Widget build(BuildContext context) {
    var commonProvider = Provider.of<CommonProvider>(context);
    final currencyCon = Provider.of<CurrencyController>(context);
    final paymentOpCon = Provider.of<PaymentOptionCon>(context);
    double maxInput = _calculateMaxInput(widget.maxDepositAmount, currencyCon.currencyCode, currencyCon.exchangeRate);
    return AlertDialog(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      insetPadding: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(0)),
      content: Padding(
        padding: const EdgeInsets.all(8),
        child: SizedBox(
          height: 300,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(
                height: 16,
              ),
              Text(
                AppLocalizations.of(context)!.depositAmount,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w600, fontSize: 16),
              ),
              const SizedBox(
                height: 6,
              ),
              CommonTextField(
                  controler: amountCon,
                  inputType: TextInputType.number,
                  inputFormatters: [
                    MaxAmountInputFormatter(maxInput),],
                  hint: " ${AppLocalizations.of(context)!.enterDepositAmount} (${AppLocalizations.of(context)!.max}${currencyCon.formatCurrency(widget.maxDepositAmount)})",
                  textAlign: TextAlign.start,
                  redOnly: false),
              const SizedBox(
                height: 10,
              ),
              Text(
                AppLocalizations.of(context)!.choosePaymentMethod,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w600, fontSize: 16),
              ),
              const SizedBox(
                height: 20,
              ),
              const OnlinePaymentOption(isShowCashOnDelivery: false,),
              const SizedBox(
                height: 20,
              ),
              BlocConsumer<SaveBloc, SaveState>(
                listener: (context, state) {
                  if (state is SaveFailure) {
                    CommonFunctions.showCustomSnackBar(context,
                        state.authModel.message ?? "Something went wrong");
                  }
                  else if (state is SaveLoaded) {
                    paymentOpCon.setWalletHistoryId(
                        Utils.formatInt(state.authModel.walletHistoryId));
                    _hMacGenerateBloc.add(CreateWalletStripeSession(
                      historyId:Utils.formatString(state.authModel.walletHistoryId),
                        walletId:Utils.formatString(widget.walletId),
                        token: _token, ));
                    commonProvider.setSecondaryLoading(true);
                  }
                },
                builder: (context, state) {
                  if (state is SaveLoading) {
                    return const CommonLoadingButton();
                  }

                  return commonProvider.isSecondaryLoading == false
                      ? CommonButton(
                      buttonText: AppLocalizations.of(context)!.deposit,
                      onTap: () {
                        if (amountCon.text.trim().isNotEmpty) {
                          if (paymentOpCon.selectedPaymentType.isNotEmpty) {
                            double depositAmount = 0.0;
                            final input =Utils.formatDouble(amountCon.text);
                            if(input>0){
                              if (currencyCon.decimalPoint == "YES") {
                                depositAmount = input;
                              }
                              else {
                                depositAmount = input.roundToDouble();
                              }
                              _saveBloc.add(Deposit(
                                walletId: widget.walletId,
                                transactionId: "",
                                transactionDetails: 'Deposit funds to wallet',
                                amount: depositAmount,
                                currencyCode: currencyCon.currencyCode,
                                type: 'credit',
                                purpose: 'order',
                                paymentGateway: paymentOpCon.selectedPaymentType,
                                status: 0,
                                token: _token,
                              ));
                            }

                          } else {
                            CommonFunctions.showCustomSnackBar(context,
                                "${AppLocalizations.of(context)!.paymentMethod} ${AppLocalizations.of(context)!.fieldRequired}");
                          }
                        } else {
                          CommonFunctions.showCustomSnackBar(context,
                              "${AppLocalizations.of(context)!.amount} ${AppLocalizations.of(context)!.fieldRequired}");
                        }
                      })
                      : const SizedBox();
                },
              ),
              if(commonProvider.isSecondaryLoading )
                BlocListener<HMacGenerateBloc, HMacGenerateState>(
                  listener: (context, state) {
                    if (state is HMacGenerateConnectionError) {
                      CommonFunctions.showCustomSnackBar(
                        context,
                        AppLocalizations.of(context)!.noInternet,
                      );
                      commonProvider.setSecondaryLoading(false);
                    }
                    else if (state is HMacGenerateLoaded) {
                      final hMacModel = state.hMacModel;
                      final checkoutUrl = hMacModel.data?.checkoutUrl;
                      if (checkoutUrl != null && checkoutUrl.isNotEmpty) {
                        _launchCheckoutUrl(checkoutUrl);
                      }
                      Navigator.pop(context);
                      commonProvider.setSecondaryLoading(false);
                    }
                  },
                  child: const SizedBox(),
                ),
              BlocConsumer<PaymentStatusUpdateBloc, PaymentStatusUpdateState>(
                listener: (context, state) {
                  if (state is PaymentStatusUpdateFailure) {
                    CommonFunctions.showCustomSnackBar(context,
                        state.authModel.message ?? "Something went wrong");
                  }
                  else if (state is PaymentStatusUpdateLoaded) {
                    context.pop();
                    commonProvider.setSecondaryLoading(false);
                    CommonFunctions.showUpSnack(
                      message: state.authModel.message,
                      context: context,
                    );
                    _walletBloc.add(Wallet(token: _token));
                  }
                },
                builder: (context, state) {
                  if (state is SaveLoading) {
                    return const SizedBox();
                  }
                  return const SizedBox();
                },
              )
            ],
          ),
        ),
      ),
    );
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