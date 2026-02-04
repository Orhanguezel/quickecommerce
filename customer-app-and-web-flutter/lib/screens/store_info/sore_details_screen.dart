import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/strings.dart';
import 'package:quick_ecommerce/controller/bloc/store_dtails_bloc/store_dtails_event.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/common_widgets/no_data_widget.dart';
import 'package:quick_ecommerce/screens/home/item_card.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_bloc.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_event.dart';
import '../../controller/bloc/store_dtails_bloc/store_dtails_bloc.dart';
import '../../controller/bloc/store_dtails_bloc/store_dtails_state.dart';
import '../../controller/provider/cart_controler.dart';
import '../../data/data_model/cart_model.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../auth_screens/login_confirmation_dailog.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/person_avater.dart';

class StoreDetailScreen extends StatefulWidget {
  const StoreDetailScreen({super.key, required this.slug});
  final String slug;
  @override
  State<StoreDetailScreen> createState() => _StoreDetailScreenState();
}

class _StoreDetailScreenState extends State<StoreDetailScreen> {
  late final StoreDetailsBloc _storeDetailsBloc;
  late final FavoriteAddBloc _favoriteAddBloc;

  final TextEditingController searchCon = TextEditingController();
  String _token = '';
  @override
  void initState() {
    _storeDetailsBloc = context.read<StoreDetailsBloc>();
    _favoriteAddBloc = context.read<FavoriteAddBloc>();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
    _storeDetailsBloc.add(StoreDetails(slug: widget.slug, token: _token));
  }

  @override
  Widget build(BuildContext context) {
    var cartCon = Provider.of<CartProvider>(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(
          AppLocalizations.of(context)!.storeDetails,
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
      ),
      body: BlocConsumer<StoreDetailsBloc, StoreDetailsState>(
        listener: (context, state) {
          if (state is StoreDetailsConnectionError) {
            CommonFunctions.showUpSnack(
                context: context, message: AppLocalizations.of(context)!.noInternet);
          }
          else if (state is StoreDetailsFailure) {
            CommonFunctions.showUpSnack(
                context: context, message: state.storeDetailsModel.message);
          }
        },
        builder: (context, state) {
          if (state is StoreDetailsLoading) {
            return ListView.builder(
              itemCount: 10,
              itemBuilder: (context, index) {
                return const ShimmerLoadingWidget();
              },
            );
          }
          else if (state is StoreDetailsLoaded) {
            var data = state.storeDetailsModel.data!;
            return Column(
              children: [
                CommonShopInfoCard(
                    storeName: Utils.formatString(data.name),
                    phone: Utils.formatString(data.phone),
                    email: Utils.formatString(data.email),
                    logo: Utils.formatString(data.logoUrl),
                    rating: Utils.formatString(data.rating)
                ),
                Expanded(
                  child:data.allProducts!=null&&data.allProducts!.isEmpty
                      ?const Center(child: NoDataWidget()):
          GridView.builder(
                    shrinkWrap: true,
                    physics: const AlwaysScrollableScrollPhysics(),
                    itemCount:
                        data.allProducts!.length, // Total number of products
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                      childAspectRatio: 0.7,
                    ),
                    itemBuilder: (context, index) {
                      var pData = data.allProducts![index];
                      bool isFlashSale=pData.flashSale!=null?true:false;
                      double price=Utils.formatDouble(pData.price);
                      double spPrice = Utils.formatDouble(pData.specialPrice);
                      int flashSalePrice = 0;
                      if(isFlashSale){
                        final result= Utils.flashSalePriceCalculate(price,spPrice, pData.flashSale);
                        flashSalePrice = Utils.formatInt(result.flashSalePrice);
                      }else{
                        flashSalePrice = spPrice.round();
                      }
                      return ItemCart(
                        details: () {
                          context.pushNamed(RouteNames.productDisplay, extra: {
                            "slug": pData.slug,
                          });
                        },
                        addToCart: () {
                          if (pData.singleVariant!.isNotEmpty) {
                            var variantId = pData.singleVariant!.first.id;
                            var stockQty =
                                pData.singleVariant!.first.stockQuantity;
                            if (pData.id != null && variantId != null) {
                              final Map<String, dynamic> attributesMap =
                                  jsonDecode(
                                      pData.singleVariant!.first.attributes);
                              String finalPrice=isFlashSale?flashSalePrice.toString():spPrice>0? pData.specialPrice! : pData.price;
                              cartCon.addToCart(
                                  CartItem(
                                      storeId: Utils.formatInt(data.id),
                                      areaId:Utils.formatInt(data.areaId),
                                      flashSaleId:Utils.formatInt(pData.flashSale!.flashSaleId),
                                      storeName: Utils.formatString(data.name),
                                      storeTaxP: Utils.formatString(data.tax),
                                      chargeAmount:Utils.formatString(data.additionalChargeAmount),
                                      chargeType:Utils.formatString(data.additionalChargeType),
                                      productId:Utils.formatInt(pData.id),
                                      stock: Utils.formatInt(stockQty),
                                      variantId: variantId,
                                      productName:Utils.formatString( pData.name),
                                      variant: attributesMap.entries
                                          .map((e) => '${e.key}: ${e.value}')
                                          .join(','),
                                      price: finalPrice,
                                      quantity: 1,
                                      cartMaxQuantity: Utils.formatInt(pData.maxCartQty),
                                      image:Utils.formatString(pData.imageUrl)),
                                  context);
                            }
                            cartCon.loadCartItems();
                          } else {
                            context
                                .pushNamed(RouteNames.productDisplay, extra: {
                              "slug": pData.slug,
                            });
                          }
                        },
                        favorite: () {
                          _handleFavoriteToggle(
                              pData.wishlist, pData.id.toString());
                        },
                        compare: () {},
                        imageUrl: Utils.formatString(pData.imageUrl),
                        title:Utils.formatString(pData.name),
                        originalPrice:isFlashSale&&spPrice>0?Utils.formatString(pData.specialPrice):Utils.formatString(pData.price),
                        discountedPrice:isFlashSale?flashSalePrice.toString() :Utils.formatString(pData.specialPrice),
                        rating:Utils.formatString( pData.rating),
                        reviewsCount: Utils.formatInt(pData.reviewCount),
                        stockCount:Utils.formatInt(pData.stock),
                        itemId: Utils.formatInt(pData.id),
                        isFeatured: pData.isFeatured??false,
                        isWishList: pData.wishlist ?? false,
                        discountPercent: pData.discountPercentage ?? 0.0,
                      );
                    },
                  ),
                ),
              ],
            );
          }

          return const SizedBox();
        },
      ),
    );
  }

  Widget _buildShopInfoCard(String storeName, String phone, String email,
      String logo, String rating) {
    return CommonCard(
        widget: Row(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(50.r),
          child: Image.network(
            logo,
            width: 70,
            height: 70,
          ),
        ),
        SizedBox(width: 6.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                storeName,
                style: TextStyle(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 2.h),
              Row(
                children: [
                   Icon(
                    Icons.phone,
                    color: Colors.grey,
                    size: 14.sp,
                  ),
                  SizedBox(width: 4.h),
                  Text(
                    phone,
                    style: TextStyle(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 4.h),
              Row(
                children: [
                   Icon(
                    Icons.email,
                    color: Colors.grey,
                    size: 14.sp,
                  ),
                  SizedBox(width: 4.h),
                  Text(
                    email,
                    style: TextStyle(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 2.h),
              Row(
                children: [
                  StarRating(rating: rating),
                  SizedBox(width: 4.w),
                  Text(
                    rating,
                    style: TextStyle(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    )
    );
  }

  void _handleFavoriteToggle(bool isWishlist, String id) {
    if (_token.isEmpty) {
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return const ConfirmationDialog();
        },
      );
      return;
    }

    if (isWishlist) {
      _favoriteAddBloc.add(DeleteFavorites(productId: id, token: _token));
    } else {
      _favoriteAddBloc.add(AddFavorites(productId: id, token: _token));
    }
  }
}

class CommonShopInfoCard extends StatelessWidget {
  final String storeName;
  final String phone;
  final String email;
  final String logo;
  final String rating;

  const CommonShopInfoCard({
    super.key,
    required this.storeName,
    required this.phone,
    required this.email,
    required this.logo,
    required this.rating,
  });

  @override
  Widget build(BuildContext context) {
    return CommonCard(
      widget: Padding(
        padding: EdgeInsets.all(kIsWeb ? 8 : 8.r),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AvatarWidget(
              imageUrl: logo,
              radius: kIsWeb ? 50 : 50.r,
            ),
            SizedBox(width: kIsWeb ? 10 : 10.w),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  /// Store name
                  Text(
                    storeName,
                    style: TextStyle(
                      fontSize: kIsWeb ? 16 : 16.sp,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: kIsWeb ? 4 : 4.h),

                  /// Phone
                  Row(
                    children: [
                       Icon(
                        Icons.phone,
                        color: Colors.grey,
                        size: kIsWeb ? 14 :14.sp,
                      ),
                      SizedBox(width: kIsWeb ? 4 : 4.w),
                      Text(
                        phone,
                        style: TextStyle(
                          fontSize: kIsWeb ? 12 : 12.sp,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: kIsWeb ? 4 : 4.h),

                  /// Email
                  Row(
                    children: [
                       Icon(
                        Icons.email,
                        color: Colors.grey,
                        size:  kIsWeb ? 14 :14.sp,
                      ),
                      SizedBox(width: kIsWeb ? 4 : 4.w),
                      Text(
                        email,
                        style: TextStyle(
                          fontSize: kIsWeb ? 12 : 12.sp,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: kIsWeb ? 4 : 4.h),

                  /// Rating
                  Row(
                    children: [
                      StarRating(rating: rating),
                      SizedBox(width: kIsWeb ? 4 : 4.w),
                      Text(
                        rating,
                        style: TextStyle(
                          fontSize: kIsWeb ? 12 : 12.sp,
                          fontWeight: FontWeight.w400,
                        ),
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
  }
}