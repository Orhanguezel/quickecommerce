import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/colors.dart';
import 'package:quick_ecommerce/config/icons.dart';
import 'package:quick_ecommerce/controller/bloc/wallet_bloc/wallet_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/wallet_bloc/wallet_event.dart';
import 'package:quick_ecommerce/controller/bloc/wallet_transaction_bloc/wallet_transaction_event.dart';
import 'package:quick_ecommerce/controller/provider/currencie_controler.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';

import 'package:quick_ecommerce/screens/common_widgets/common_status_card.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/refresh_token/refresh_token_bloc.dart';
import '../../controller/bloc/wallet_bloc/wallet_state.dart';
import '../../controller/bloc/wallet_transaction_bloc/wallet_transaction_bloc.dart';
import '../../controller/bloc/wallet_transaction_bloc/wallet_transaction_state.dart';
import '../../controller/provider/checkout_controler.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_child_button.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/no_data_widget.dart';
import '../home/item_card.dart';
import 'diposit_screen.dart';

class MyWallet extends StatefulWidget {
  const MyWallet({super.key});

  @override
  State<MyWallet> createState() => _MyWalletState();
}

class _MyWalletState extends State<MyWallet> {
  late final WalletBloc _walletBloc;
  late final WalletTransactionBloc _transactionBloc;
  late final RefreshTokenBloc _refreshTokenBloc;
  String _token = '';
  @override
  void initState() {
    _walletBloc = context.read<WalletBloc>();
    _transactionBloc = context.read<WalletTransactionBloc>();
    _refreshTokenBloc = context.read<RefreshTokenBloc>();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
    _walletBloc.add(Wallet(token: _token));
    _transactionBloc.add(WalletTransaction(token: _token));
  }

  @override
  Widget build(BuildContext context) {
    final currencyCon = Provider.of<CurrencyController>(context);
    final checkoutCon = context.watch<CheckoutController>();
    return Scaffold(
      appBar:! kIsWeb ?  AppBar(
        title: Text(
          AppLocalizations.of(context)!.myWallet,
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(
              fontWeight: FontWeight.w700, fontSize: 18.sp),
        ),
        centerTitle: true,
        elevation: 0,
        backgroundColor: CustomColors.baseColor,
        foregroundColor: Colors.black,
      ):null,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
           SizedBox(height: kIsWeb ?6:6.h,),
          BlocConsumer<WalletBloc, WalletState>(
            listener: (context, state) {
              if (state is WalletConnectionError) {
                CommonFunctions.showCustomSnackBar(
                    context, AppLocalizations.of(context)!.noInternet
                );
              }
              else if (state is WalletFailure) {
                CommonFunctions.showCustomSnackBar(
                    context, "Something went wrong"
                );
              }
            },
            builder: (context, state) {
              if (state is WalletLoading) {
                return const CommonCard(
                    mHorizontal:kIsWeb ?0 :12 ,
                    widget: ShimmerLoadingWidget()
                );
              }
              else if (state is WalletTokenExp) {
                CommonFunctions.checkTokenAndProceeds(
                  refreshTokenBloc: _refreshTokenBloc,
                  onProceed:() async {
                    _walletBloc.add(Wallet(token: _token));
                  },
                    onLogout: ()async{
                      context.goNamed(RouteNames.loginScreen);
                    }
                );
              }
              else if (state is WalletLoaded) {
                if (state.hasConnectionError) {
                  CommonFunctions.showCustomSnackBar(
                      context, AppLocalizations.of(context)!.noInternet
                  );
                }
                final data = state.walletsModel.wallets;

                WidgetsBinding.instance.addPostFrameCallback((_) {
                  double balance = Utils.formatDouble(data.totalBalance);
                  checkoutCon.setWalletBalance(balance);
                  checkoutCon.setWalletActive(data.status == "active");
                });
                return CommonCard(
                  mVertical: 4,
                    mHorizontal:kIsWeb ?0 :12 ,
                    widget: Column(
                      children: [
                        Row(
                          children: [
                            Text(
                              AppLocalizations.of(context)!.myWallet,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(
                                  fontWeight: FontWeight.w700, fontSize: kIsWeb ?20: 20.sp),
                            ),
                          ],
                        ),
                        SizedBox(height: kIsWeb ?6 :6.h),
                        Divider(thickness: kIsWeb ?1 :1.h, color: const Color(0xFFCECECE)),
                        SizedBox(height: kIsWeb ?6 :6.h),
                        Row(
                          children: [
                            CommonRow(
                                title:
                                AppLocalizations.of(context)!.availableBalance,
                                value:currencyCon.formatCurrency(data.totalBalance.toString()),
                                icon: AssetsIcons.available,
                                color: const Color(0xFFDEF2E8)),
                            ChildButton(
                                padding: EdgeInsets.symmetric(horizontal:kIsWeb ?8 :8.w,vertical: kIsWeb ?6 :6.h ),
                                widget: Row(
                                  children: [
                                    Image.asset(
                                      AssetsIcons.withdraw,
                                      height:kIsWeb ?20 : 20.h,
                                      width: kIsWeb ?20 :20.w,
                                    ),
                                    SizedBox(width:kIsWeb ?6 : 6.w),
                                    Text(
                                      AppLocalizations.of(context)!.deposit,
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleLarge
                                          ?.copyWith(
                                          fontWeight: FontWeight.w600,
                                          fontSize: kIsWeb ?12:12.sp),
                                    ),
                                  ],
                                ),
                                color: const Color(0xFF1A73E8),
                                onPressed: () {
                                  if(kIsWeb){
                                    showDialog(
                                      context: context,
                                      barrierColor: Colors.transparent,
                                      builder: (BuildContext context) {
                                       return DepositDialog(
                                         walletId: data.id,
                                         maxDepositAmount: state.walletsModel.maxDepositPerTransaction,
                                       );
                                      },
                                    );
                                  }else{
                                    context.pushNamed(RouteNames.depositScreen,
                                      extra:{'wallet_id': data.id,
                                        "max_deposit_amount":state.walletsModel.maxDepositPerTransaction,
                                      },
                                    );
                                  }

                                })
                          ],
                        ),
                      ],
                    ));
              }

              return const SizedBox();
            },
          ),
          BlocConsumer<WalletTransactionBloc, WalletTransactionState>(
            listener: (context, state) {
              if (state is WalletTransactionConnectionError) {
                CommonFunctions.showCustomSnackBar(
                    context, AppLocalizations.of(context)!.noInternet);
              } else if (state is WalletTransactionFailure) {
                CommonFunctions.showCustomSnackBar(
                    context, "Something went wrong");
              }
            },
            builder: (context, state) {
              if (state is WalletTransactionLoading) {
                return Expanded(
                  child: CommonCard(
                      mHorizontal:kIsWeb ?0 :12 ,
                      widget: ListView.builder(
                        itemCount: 10, // Number of shimmer items
                        itemBuilder: (context, index) {
                          return const ShimmerLoadingWidget();
                        },
                      )),
                );
              }
              else if (state is WalletTransactionTokenExp) {
                CommonFunctions.checkTokenAndProceeds(
                  refreshTokenBloc: _refreshTokenBloc,
                  onProceed:() async {
                    _transactionBloc.add(WalletTransaction(token: _token));
                  },
                    onLogout: ()async{
                      context.goNamed(RouteNames.loginScreen);
                    }
                );
              }
              else if (state is WalletTransactionLoaded) {
                if (state.hasConnectionError) {
                  CommonFunctions.showCustomSnackBar(
                      context, AppLocalizations.of(context)!.noInternet
                  );
                }
                return Expanded(
                    child: state.walletsTransactionModel.wallets!.isEmpty?
                    const Center(child: NoDataWidget())
                        : CommonCard(
                            mVertical: 4,
                            mHorizontal:kIsWeb ?0 :12 ,
                            widget: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  AppLocalizations.of(context)!.history,
                                  style: TextStyle(
                                    fontSize: kIsWeb ?18:18.sp,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height:kIsWeb ?12 : 12.h),
                                Expanded(child:ListView.builder(
                                  itemCount: state.walletsTransactionModel.wallets!.length,
                                  itemBuilder: (context, index) {
                                    final data =
                                    state.walletsTransactionModel.wallets![index];
                                    bool isShow=false;
                                    if (index <
                                        state.walletsTransactionModel.wallets!.length - 1){
                                      isShow=true;
                                    }
                                    return _transactionTile(
                                        amount: data.amount.toString(),
                                        date: data.createdAt.toString(),
                                        time: "",
                                        type: data.type,
                                        purpose: data.purpose,
                                        status: data.paymentStatus,
                                        isShow: isShow
                                    );
                                  },
                                )),
                              ],
                            )
                        )
                );

              }
              return const SizedBox();
            },
          ),

        ],
      ),
    );
  }
  Widget _transactionTile({
    required String amount,
    required String date,
    required String time,
    required String type,
    required String purpose,
    required String status,
    required bool isShow,
  }) {
    String typeFormat=capitalize(type);
    String purposeFormat=capitalize(purpose);
    final currencyCon = Provider.of<CurrencyController>(context,listen: false);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            RichText(
              text: TextSpan(
                text: "${AppLocalizations.of(context)!.amount}: ",
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w600, fontSize:kIsWeb ?14 : 14.sp),
                children: [
                  TextSpan(
                    text:currencyCon.formatCurrency(amount),
                    style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                        fontWeight: FontWeight.w600, fontSize:kIsWeb ?12 : 12.sp),
                  ),
                ],
              ),
            ),
         OrderStatusCard(
           text: Utils.capitalizeFirstLetter(status),
             status:status,
         ),
          ],
        ),
        SizedBox(height:kIsWeb ?4: 4.h),
        Text(
          "$date   $time",
          style: Theme.of(context)
              .textTheme
              .displayLarge
              ?.copyWith(fontWeight: FontWeight.w500, fontSize:kIsWeb ?11 : 11.sp),
        ),
        SizedBox(height:kIsWeb ?8 : 8.h),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            RichText(
              text: TextSpan(
                text: "${AppLocalizations.of(context)!.type}: ",
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w500, fontSize:kIsWeb ?14 : 14.sp),
                children: [
                  TextSpan(
                    text: typeFormat,
                    style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF75C67F),
                        fontSize: kIsWeb ?12 :12.sp),
                  ),
                ],
              ),
            ),
            RichText(
              text: TextSpan(
                text: "${AppLocalizations.of(context)!.purpose}: ",
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w400, fontSize: kIsWeb ?11 :11.sp),
                children: [
                  TextSpan(
                    text: purposeFormat,
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        fontWeight: FontWeight.w400, fontSize:kIsWeb ?10 : 10.sp),
                  ),
                ],
              ),
            ),
          ],
        ),
        if(isShow)
          Divider(thickness: 1.h, color: const Color(0xFFCECECE)),
      ],
    );
  }
  String capitalize(String input) {
    if (input.isEmpty) return input; // Handle empty string case
    return input[0].toUpperCase() + input.substring(1).toLowerCase();
  }
}


class CommonRow extends StatelessWidget {
  final String title;
  final String value;
  final String icon;
  final Color color;

  const CommonRow({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Row(
        children: [
          Container(
            height: kIsWeb ?38 :38.h,
            width: kIsWeb ?38 :38.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color,
            ),
            child: Center(
              child: Image.asset(
                icon,
                height:kIsWeb ?20 : 20.h,
                width: kIsWeb ?20 :20.w,
                fit: BoxFit.contain,
              ),
            ),
          ),
          SizedBox(width:kIsWeb ?10 : 10.w),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  fontSize: kIsWeb ?16 :16.sp,
                ),
              ),
              SizedBox(height:kIsWeb ?4 : 4.h),
              Text(
                title,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w400,
                  fontSize:kIsWeb ?10 : 10.sp,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}


