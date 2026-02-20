import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/provider/currencie_controler.dart';
import 'package:quick_ecommerce/router/route_name.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_fonfirmation_dialog.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/provider/cart_controler.dart';
import '../../controller/provider/checkout_controler.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../l10n/app_localizations.dart';
import '../auth_screens/email_verification.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/no_data_widget.dart';
import '../home/item_card.dart';
import '../checkout/checkout_screen.dart';

class MyCardScreen extends StatefulWidget {
  const MyCardScreen({super.key});

  @override
  State<MyCardScreen> createState() => _MyCardScreenState();
}

class _MyCardScreenState extends State<MyCardScreen> {
  String _token = '',_emailSettingsOn="";
  bool _emailVerified=false;
  @override
  void initState() {
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    var emailVeSettings = await UserSharedPreference.getValue(
      SharedPreferenceHelper.emailVerificationSettings,
    );
    var emailVerified = await UserSharedPreference.getBool(
      SharedPreferenceHelper.emailVerified,
    );
    _emailSettingsOn = emailVeSettings ?? "";
    _emailVerified = emailVerified ?? false;
    _token = token ?? "";
  }

 Future allItemDeleteDialog(context) {
   final cartCon = Provider.of<CartProvider>(context,listen: false);
   return showDialog(
       context: context,
       builder: (context) {
         return CommonConfirmationDialog(
             title: AppLocalizations.of(context)!.confirmClearCart,
             message: AppLocalizations.of(context)!.allSelectedProductsWillRemoved,
             onConfirm: () {
               cartCon.clearCart();
             });
       });
 }

  Future itemDeleteDialog(context,int itemId) {
    final cartCon = Provider.of<CartProvider>(context,listen: false);
    return showDialog(
        context: context,
        builder: (context) {
          return CommonConfirmationDialog(
              title: AppLocalizations.of(context)!.confirmClearCart,
              message: AppLocalizations.of(context)!.allSelectedProductsWillRemoved,
              onConfirm: () {
                cartCon.deleteItem(itemId);
              });
        });
  }

  @override
  Widget build(BuildContext context) {
    final cartCon = context.watch<CartProvider>();
    cartCon.loadCartItems();
    var commonCon = Provider.of<CommonProvider>(context);
    final currencyCon = Provider.of<CurrencyController>(context);
    var checkoutCon = Provider.of<CheckoutController>(context);
    final homeCon = Provider.of<HomeScreenProvider>(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(
          AppLocalizations.of(context)!.myCart,
          style: Theme.of(context)
              .textTheme
              .titleLarge!
              .copyWith(fontWeight: FontWeight.w600, fontSize: kIsWeb ? 16 : 16.sp),
        ),
        centerTitle: true,
        actions: [
          if(cartCon.cartItems.isNotEmpty)
          InkWell(
            onTap: (){
              allItemDeleteDialog(context);
            },
            child: Row(
              children: [
                Text( AppLocalizations.of(context)!.clearAll,
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge!
                      .copyWith(fontWeight: FontWeight.w500, fontSize:  kIsWeb ? 14 : 14.sp),
                ),
                SizedBox(width: kIsWeb ? 4 :  4.w,),
                 Icon(Icons.delete,
                size: kIsWeb ? 16 :  16.sp,
                   color: const Color(0xFFEC7373),
                ),
                SizedBox(width: kIsWeb ? 10 : 10.w,),
              ],
            ),
          ),
        ],
      ),
      body: cartCon.cartItems.isEmpty
          ?const Center(child: NoDataWidget())
          : Column(
              children: [
                SizedBox(height: 6.h),
                Expanded(
                  child: ListView.builder(
                    itemCount: cartCon.cartItems.length,
                    itemBuilder: (context, index) {
                      final item = cartCon.cartItems[index];
                      return CommonCard(
                          mVertical: 3,
                          mHorizontal:3,
                          pRight: 6,
                          pLeft: 0,

                          widget:  Row(
                            children: [
                              SizedBox(width: kIsWeb ?4 :  4.h),
                              // Product Image
                              CommonImage(
                                imageUrl: item.image,
                                height: kIsWeb ? 70 : 70.h,
                                width:  kIsWeb ? 70: 70.w,
                              ),
                              SizedBox(width: kIsWeb ?4 :  4.h),
                              // Product Details
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.productName,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium
                                            ?.copyWith(
                                          fontSize: kIsWeb ? 14:  14.sp,
                                          fontWeight: FontWeight.w500,
                                        )),
                                    SizedBox(height: kIsWeb ?5 :  5.h),
                                    RichText(
                                      text: TextSpan(
                                        children: item.variant.split(',').map((entry) {
                                          final parts = entry.split(':');
                                          return [
                                            TextSpan(
                                              text: '${parts[0].trim()}: ',
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium
                                                  ?.copyWith(
                                                fontSize: kIsWeb ? 12 :  12.sp,
                                                fontWeight: FontWeight.w400,
                                              ),
                                            ),
                                            TextSpan(
                                              text: parts[1].trim(),
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium
                                                  ?.copyWith(
                                                fontSize:  kIsWeb ? 10 : 10.sp,
                                                fontWeight: FontWeight.w400,
                                              ),
                                            ),
                                            if (item.variant.split(',').last != entry)
                                              TextSpan(
                                                text: ', ',
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodyMedium
                                                    ?.copyWith(
                                                  fontSize: kIsWeb ? 10 :  10.sp,
                                                  height: 1.5,
                                                  fontWeight: FontWeight.w400,
                                                ),
                                              ),
                                          ];
                                        }).expand((e) => e).toList(),
                                      ),
                                    ),
                                    SizedBox(height: kIsWeb ? 5 :  5.h),
                                    Text(currencyCon.formatCurrency(item.price),
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium
                                            ?.copyWith(
                                          fontSize:  kIsWeb ? 14 : 14.sp,
                                          fontWeight: FontWeight.w600,
                                        )
                                    ),
                                    SizedBox(height: kIsWeb ? 5 :  5.h),
                                    Row(
                                      children: [
                                        InkWell(
                                          onTap: () {
                                            itemDeleteDialog(context,item.productId);
                                          },
                                          child: const ImageIcon(
                                            AssetImage(AssetsIcons.delete),
                                            color: Color(0xFFEC7373),
                                          ),
                                        ),
                                        SizedBox(
                                          width:  kIsWeb ? 10 : 10.w,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: EdgeInsets.symmetric(
                                        horizontal:  kIsWeb ? 6 : 6.w, vertical:  kIsWeb ? 4 : 4.h),
                                    //margin: EdgeInsets.symmetric(horizontal: mHorizontal.w, vertical: mVertical.h),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFAFAFB),
                                      border: Border.all(
                                          width: kIsWeb ?0.3 :  0.3.w,
                                        color: const Color(0xFFCCCFD7),),

                                      borderRadius: BorderRadius.circular( kIsWeb ? 50 : 50.r),

                                    ),
                                    child: Text(
                                      item.storeName,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                          fontSize: kIsWeb ? 10 :  10.sp,
                                          color: const Color(0xFF222222),
                                          fontWeight: FontWeight.w400),
                                    ),
                                  ),
                                  SizedBox(
                                    height:  kIsWeb ? 28 : 28.h,
                                  ),
                                  QuantityControl(
                                      quantity: item.quantity,
                                      onIncrement:  () {
                                        if (item.quantity + 1 <= item.stock) {
                                          cartCon.updateQuantity(item.productId, item.quantity + 1);
                                        } else {
                                          CommonFunctions.showUpSnack(
                                              context: context,
                                              message: "Cannot add more items. Stock limit reached.");
                                        }
                                      },
                                      onDecrement:  () {
                                        if (item.quantity > 1) {
                                          cartCon.updateQuantity(
                                              item.productId, item.quantity - 1);
                                        }
                                      }
                                  ),

                                ],
                              ),
                              // Delete Button
                            ],
                          ));
                    },
                  ),
                ),
                Column(
                  children: [
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: kIsWeb ? 16 :  16.w),
                      child: CommonRow(
                        label: AppLocalizations.of(context)!.totalAmount,
                        value:currencyCon.formatCurrency(cartCon.totalPrice.toStringAsFixed(2))
                      ),
                    ),
                    SizedBox(height: kIsWeb ? 8:  8.h),
                   CommonButton(
                      buttonText:
                      AppLocalizations.of(context)!.checkout,
                      onTap: () {
                        if(commonCon.isLogin||_token.isNotEmpty){
                          if(_emailSettingsOn == "on"&&_emailVerified||_emailSettingsOn == "off"){
                            if (cartCon.cartItems.isNotEmpty) {
                              List<int> productIds = [];
                              List<int> ariaIds = [];
                              for (var cart in cartCon.cartItems) {
                                productIds.add(cart.productId);
                                ariaIds.add(cart.areaId);
                              }
                              checkoutCon.setIsByNow(false);
                              checkoutCon.setAriaIds(ariaIds.toSet().toList());
                              if(kIsWeb ){
                                checkoutCon.clearPackage();
                                checkoutCon.setProductIds(productIds);
                                homeCon.setTabType("Checkout");
                                Navigator.pop(context);
                              }
                              else{
                              context.pushNamed(RouteNames.checkoutScreens,
                                  extra: {"product_ids":productIds}
                              );
                              }
                            }
                          }
                          else{
                            showDialog(
                              context: context,
                              builder: (context) => CommonConfirmationDialog(
                                title: AppLocalizations.of(context)!.emailVerificationRequired,
                                message:
                                '${AppLocalizations.of(context)!.toAccessYour} ${AppLocalizations.of(context)!.checkout},${AppLocalizations.of(context)!.pleaseVerifyYourEmail}',
                                onConfirm: () {
                                  showDialog(
                                    context: context,
                                    builder: (context) =>const AlertDialog(
                                      contentPadding: EdgeInsets.zero,
                                      content: SizedBox(
                                          height: 400,
                                          width: 300,
                                          child: EmailVerification()),
                                    ),
                                  );
                                },
                              ),
                            );
                          }
                        }else{
                          CommonFunctions.showUpSnack(context: context, message: 'Please log in');
                        }

                      },
                    ),
                    SizedBox(height: kIsWeb ? 8 :  8.h,),
                  ],
                ),

              ],
            ),
    );
  }
}


