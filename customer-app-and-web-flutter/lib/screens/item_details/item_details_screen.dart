import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/images.dart';
import 'package:quick_ecommerce/config/text_styles.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_fonfirmation_dialog.dart';
import 'package:quick_ecommerce/screens/item_details/atribute_selection.dart';
import 'package:quick_ecommerce/screens/item_details/details_tab.dart';

import '../../config/colors.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_bloc.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_event.dart';
import '../../controller/bloc/favorite_add_bloc/favorite_add_state.dart';
import '../../controller/bloc/payment_gateways_bloc/payment_gateways_bloc.dart';
import '../../controller/bloc/payment_gateways_bloc/payment_gateways_event.dart';
import '../../controller/bloc/payment_gateways_bloc/payment_gateways_state.dart';
import '../../controller/bloc/product_details_bloc/product_details_bloc.dart';
import '../../controller/bloc/product_details_bloc/product_details_event.dart';
import '../../controller/bloc/product_details_bloc/product_details_state.dart';
import '../../controller/provider/cart_controler.dart';
import '../../controller/provider/checkout_controler.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/currencie_controler.dart';
import '../../controller/provider/home_screen_provider.dart';
import '../../controller/provider/item_details_controler.dart';
import '../../data/data_model/cart_model.dart';
import '../../data/data_model/product_details_model.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../auth_screens/login_confirmation_dailog.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/item_title.dart';
import '../home/item_card.dart';

class ProductDisplay extends StatefulWidget {
  const ProductDisplay({super.key, required this.slug});
  final String slug;
  @override
  ProductDisplayState createState() => ProductDisplayState();
}

class ProductDisplayState extends State<ProductDisplay> {
  late final ProductDetailsBloc _productDetailsBloc;
  late final FavoriteAddBloc _favoriteAddBloc;
  String _token = '', _language = '', _emailSettingsOn = "";
  bool _emailVerified = false;
  getUserRout() async {
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    var emailVerification = await UserSharedPreference.getValue(
      SharedPreferenceHelper.emailVerificationSettings,
    );
    var emailVerified = await UserSharedPreference.getBool(
      SharedPreferenceHelper.emailVerified,
    );
    _language = language ?? "";
    _token = token ?? "";
    _emailSettingsOn = emailVerification ?? "";
    _emailVerified = emailVerified ?? false;
    _productDetailsBloc.add(
        ProductDetails(slug: widget.slug, language: _language, token: _token));
  }

  bool isProductLoaded = false;
  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ItemDetailsProvider>(context, listen: false)
          .clearSelectedVariant();
    });
    _productDetailsBloc = context.read<ProductDetailsBloc>();
    _favoriteAddBloc = context.read<FavoriteAddBloc>();
    isProductLoaded = false;
    getUserRout();
    super.initState();
  }

  List<RelatedProduct> relatedProduct = [];

  late Product product;

  @override
  Widget build(BuildContext context) {
    var homeCon = Provider.of<HomeScreenProvider>(context, listen: true);
    var commonCon = Provider.of<CommonProvider>(context);
    final currencyCon = Provider.of<CurrencyController>(context);
    var cartCon = Provider.of<CartProvider>(context);
    var checkoutCon = Provider.of<CheckoutController>(context);
    var variantCon = Provider.of<ItemDetailsProvider>(context);
    return Scaffold(
        appBar: AppBar(
          title: Text(AppLocalizations.of(context)!.productDetails),
          centerTitle: true,
          actions: [
            InkWell(
              onTap: () {
                context.pop();
                homeCon.setCurrentIndexHomePage(2);
              },
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Image.asset(
                    AssetsIcons.cart,
                    height: 25.h,
                    width: 25.w,
                    color: Colors.white,
                    fit: BoxFit.fill,
                  ),
                  Positioned(
                    right: -2.0, // Position badge to the top-right of the icon
                    top: 1.0,
                    child: Container(
                      padding: const EdgeInsets.all(4.0),
                      decoration: const BoxDecoration(
                        color: Colors.red, // Badge background color
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16.0,
                        minHeight: 16.0, // Badge size
                      ),
                      child: Center(
                        child: Text(
                          cartCon.cartItems.length.toString(),
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10.0.sp,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              width: 16.w,
            )
          ],
        ),
        body: Column(
          children: [
            BlocConsumer<ProductDetailsBloc, ProductDetailsState>(
              builder: (_, state) {
                if (state is ProductDetailsLoading) {
                  return Expanded(
                    child: ListView.builder(
                      itemCount: 8,
                      itemBuilder: (context, index) {
                        return const ShimmerLoadingWidget();
                      },
                    ),
                  );
                } else if (state is ProductDetailsLoaded) {
                  if (state.hasConnectionError) {
                    CommonFunctions.showCustomSnackBar(
                        context, AppLocalizations.of(context)!.noInternet);
                  }
                  isProductLoaded = true;
                  product = state.productDetailsModel.data;
                  relatedProduct =
                      state.productDetailsModel.relatedProducts ?? [];
                  // print("relatedProduct Before $relatedProduct");

                  //  print("relatedProduct after $relatedProduct");
                  if (product.flashSale != null) {
                    variantCon.setFlashSale(product.flashSale!);
                  }
                  if (product.variants != null) {
                    variantCon.initializeVariants(product.variants!);
                  }

                  variantCon.setThumnilImage(VariantImage(
                      id: 100000, imageUrl: product.imageUrl ?? ""));
                  String warranty = '';
                  final jsonString = product.warranty;
                  // Decode the JSON string
                  final parsedData = json.decode(jsonString);
                  if (parsedData is List && parsedData.isNotEmpty) {
                    final firstItem = parsedData[0];
                    final warrantyPeriod = firstItem['warranty_period'];
                    final warrantyText = firstItem['warranty_text'];
                    warranty = '${warrantyPeriod.toString()} $warrantyText';
                  }
                  return Expanded(
                    child: NestedScrollView(
                      headerSliverBuilder:
                          (BuildContext context, bool innerBoxIsScrolled) {
                        return [
                          SliverToBoxAdapter(
                              child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SingleChildScrollView(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    //   SizedBox(height: 12.h),
                                    CommonCard(
                                        mVertical: 4,
                                        pRight: 12,
                                        pLeft: 12,
                                        pBottom: 0,
                                        widget: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            // Main product image
                                            MainProductImage(
                                                imageUrl:
                                                    variantCon.selectedImage ??
                                                        "",
                                                itemId: Utils.formatString(
                                                    product.id)),
                                            SizedBox(height: 8.h),
                                            // Variant selection
                                            _buildVariantSelection(
                                                variantCon.imageLists),
                                            SizedBox(height: 10.h),

                                            SizedBox(height: 6.h),
                                            Text(
                                              Utils.formatString(product.name),
                                              maxLines: 1,
                                              textAlign: TextAlign.start,
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium
                                                  ?.copyWith(
                                                      fontSize: 22.sp,
                                                      fontWeight:
                                                          FontWeight.w700),
                                            ),
                                            SizedBox(height: 8.h),
                                            // Product details
                                            _buildProductReview(
                                                context, product, variantCon),
                                            SizedBox(height: 10.h),
                                            SingleChildScrollView(
                                              scrollDirection: Axis.horizontal,
                                              child: Row(
                                                children: [
                                                  Text(
                                                    currencyCon.formatCurrency(
                                                        variantCon.spPrice > 0
                                                            ? variantCon.spPrice
                                                                .toString()
                                                            : variantCon.price
                                                                .toString()),
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .bodyMedium
                                                        ?.copyWith(
                                                          fontSize: 20.sp,
                                                        ),
                                                  ),
                                                  SizedBox(width: 4.w),
                                                  if (variantCon.spPrice > 0)
                                                    Text(
                                                      currencyCon
                                                          .formatCurrency(
                                                              variantCon.price
                                                                  .toString()),
                                                      style: Theme.of(context)
                                                          .textTheme
                                                          .bodyMedium
                                                          ?.copyWith(
                                                            fontSize: 14.sp,
                                                            color: const Color(
                                                                0xFF627D98),
                                                            decorationColor:
                                                                const Color(
                                                                    0xFF627D98),
                                                            decorationThickness:
                                                                2.0,
                                                            decoration:
                                                                TextDecoration
                                                                    .lineThrough,
                                                          ),
                                                    ),
                                                  SizedBox(width: 12.w),
                                                ],
                                              ),
                                            ),
                                            Divider(
                                              thickness: .2.h,
                                              color: Colors.grey,
                                            ),
                                            LabelWithValue(
                                              label:
                                                  AppLocalizations.of(context)!
                                                      .sKU,
                                              value: variantCon.sku,
                                            ),
                                            LabelWithValue(
                                              label:
                                                  AppLocalizations.of(context)!
                                                      .category,
                                              value: Utils.formatString(product
                                                  .category?.categoryName),
                                            ),
                                            product.warranty != null
                                                ? LabelWithValue(
                                                    label: AppLocalizations.of(
                                                            context)!
                                                        .warranty,
                                                    value: warranty,
                                                  )
                                                : const SizedBox(),
                                            product.brand != null
                                                ? LabelWithValue(
                                                    label: AppLocalizations.of(
                                                            context)!
                                                        .brand,
                                                    value: Utils.formatString(
                                                        product.brand?.label),
                                                  )
                                                : const SizedBox(),
                                            LabelWithValue(
                                              label:
                                                  AppLocalizations.of(context)!
                                                      .returnInDays,
                                              value: Utils.formatString(
                                                  product.returnInDays),
                                            ),
                                            LabelWithValue(
                                              label:
                                                  AppLocalizations.of(context)!
                                                      .returnPolicy,
                                              value: Utils.formatString(
                                                  product.returnText),
                                            ),
                                            LabelWithValue(
                                              label:
                                                  AppLocalizations.of(context)!
                                                      .changeOfMindAllowed,
                                              value:
                                                  product.allowChangeInMind ==
                                                          "0"
                                                      ? "No"
                                                      : "Yes",
                                            ),
                                            LabelWithValue(
                                              label:
                                                  AppLocalizations.of(context)!
                                                      .cashOnDelivery,
                                              value:
                                                  product.cashOnDelivery == "0"
                                                      ? "No"
                                                      : "Yes",
                                            ),
                                            LabelWithValue(
                                              label:
                                                  AppLocalizations.of(context)!
                                                      .deliveryNote,
                                              value: Utils.formatString(
                                                  product.deliveryTimeText),
                                            ),
                                            LabelWithValue(
                                              label:
                                                  AppLocalizations.of(context)!
                                                      .deliveryTime,
                                              value:
                                                  "${Utils.formatString(product.deliveryTimeMin)}-${Utils.formatString(product.deliveryTimeMax)}",
                                            ),
                                            LabelWithValue(
                                              label:
                                                  AppLocalizations.of(context)!
                                                      .availableStartTime,
                                              value:
                                                  "${Utils.formatDate(product.availableTimeStarts)} ${Utils.formatTime(product.availableTimeStarts)}",
                                            ),
                                            LabelWithValue(
                                              label:
                                                  AppLocalizations.of(context)!
                                                      .availableEndTime,
                                              value:
                                                  "${Utils.formatDate(product.availableTimeEnds)} ${Utils.formatTime(product.availableTimeEnds)}",
                                            ),
                                            Divider(
                                              thickness: .2.h,
                                              color: Colors.grey,
                                            ),
                                            SizedBox(height: 4.h),
                                            const AttributeOptionsSelector(),
                                            SizedBox(height: 12.h),
                                          ],
                                        )),

                                    // Product details tab
                                    DetailsTab(product: product),
                                    SizedBox(height: 8.h),
                                    CommonCard(
                                      mHorizontal: 12,
                                      mVertical: 0,
                                      widget: Row(
                                        children: [
                                          // Seller Logo
                                          CircleAvatar(
                                            radius: 30.r,
                                            child: Image.network(
                                              product.store!.logo ?? "",
                                              loadingBuilder: (context, child,
                                                  loadingProgress) {
                                                if (loadingProgress == null) {
                                                  return child; // Image loaded
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
                                              width: 70.w,
                                              height: 70.h,
                                              fit: BoxFit.cover,
                                              errorBuilder:
                                                  (context, error, stackTrace) {
                                                return Image.asset(
                                                  Images.noImage,
                                                  fit: BoxFit.cover,
                                                  width: 70.w,
                                                  height: 70.h,
                                                ); // Fallback image
                                              },
                                            ), // Replace with your image path
                                          ),
                                          SizedBox(width: 8.w),

                                          // Seller Info
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(product.store!.name ?? "",
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .bodyMedium!
                                                        .copyWith(
                                                          fontSize: 16.sp,
                                                          color: CustomColors
                                                              .baseColor,
                                                          fontWeight:
                                                              FontWeight.w600,
                                                        )),
                                                SizedBox(height: 8.h),
                                                Row(
                                                  children: [
                                                    Row(
                                                      children: [
                                                        StarRating(
                                                            rating: product
                                                                .store!.rating
                                                                .toString()),
                                                        SizedBox(width: 2.h),
                                                        Text(
                                                          "(${product.store!.rating})",
                                                          style: Theme.of(
                                                                  context)
                                                              .textTheme
                                                              .headlineSmall!
                                                              .copyWith(
                                                                fontSize: 14.sp,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w400,
                                                              ),
                                                        ),
                                                      ],
                                                    ),
                                                    const Spacer(),
                                                    // Visit Store Button
                                                    InkWell(
                                                      onTap: () {
                                                        context.pushNamed(
                                                            RouteNames
                                                                .storeDetailScreen,
                                                            extra: {
                                                              'slug': product
                                                                  .store!.slug
                                                            });
                                                      },
                                                      child: Container(
                                                        padding: EdgeInsets
                                                            .symmetric(
                                                                horizontal:
                                                                    12.w,
                                                                vertical: 8.h),
                                                        decoration:
                                                            BoxDecoration(
                                                          color: const Color(
                                                              0xFFE8F1FD),
                                                          borderRadius:
                                                              BorderRadius
                                                                  .circular(
                                                                      8.r),
                                                        ),
                                                        child: Text(
                                                          AppLocalizations.of(
                                                                  context)!
                                                              .visitStore,
                                                          style: TextStyle(
                                                            fontSize: 12.sp,
                                                            color: CustomColors
                                                                .baseColor,
                                                          ),
                                                        ),
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
                                    SizedBox(height: 8.h),
                                    const ProductDetailsSettings(),
                                  ],
                                ),
                              ),
                              SizedBox(height: 12.h),
                              Padding(
                                padding: EdgeInsets.symmetric(horizontal: 12.w),
                                child: ItemTitle(
                                    title:
                                        AppLocalizations.of(context)!.related,
                                    subTitle:
                                        AppLocalizations.of(context)!.products,
                                    onTap: () {
                                      context.pop();
                                      homeCon.setCurrentIndexHomePage(1);
                                    }),
                              ),
                              SizedBox(height: 12.h),
                            ],
                          )),
                        ];
                      },
                      body: Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12.w),
                        child: GridView.builder(
                          padding: EdgeInsets.zero,
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2, // Two columns
                                  crossAxisSpacing: 0, // Spacing between columns
                                  mainAxisSpacing: 0.0, // Spacing between rows
                                  childAspectRatio: 0.5, // Adjust for item height/width ratio
                                  mainAxisExtent: 350),
                          itemCount: relatedProduct.length,
                          itemBuilder: (context, index) {
                            final item = relatedProduct[index];
                            bool isFlashSale =
                                item.flashSale != null ? true : false;
                            double price = Utils.formatDouble(item.price);
                            double spPrice =
                                Utils.formatDouble(item.specialPrice);
                            int flashSalePrice = 0;
                            if (isFlashSale) {
                              final result = Utils.flashSalePriceCalculate(
                                  price, spPrice, item.flashSale);
                              flashSalePrice =
                                  Utils.formatInt(result.flashSalePrice);
                            } else {
                              flashSalePrice = spPrice.round();
                            }
                            return ItemCart(
                              details: () {
                                context.pushNamed(RouteNames.productDisplay,
                                    extra: {
                                      "slug": item.slug,
                                    });
                              },
                              addToCart: () {
                                if (item.singleVariant!.isNotEmpty) {
                                  var variantId = item.singleVariant!.first.id;
                                  var stockQty =
                                      item.singleVariant!.first.stockQuantity;
                                  if (item.id != null && variantId != null) {
                                    final Map<String, dynamic> attributesMap =
                                        jsonDecode(item
                                            .singleVariant!.first.attributes);

                                    String finalPrice = isFlashSale
                                        ? flashSalePrice.toString()
                                        : spPrice > 0
                                            ? item.specialPrice!
                                            : item.price;
                                    cartCon.addToCart(
                                        CartItem(
                                            storeId:
                                                Utils.formatInt(item.storeId),
                                            areaId:
                                                Utils.formatInt(item.areaId),
                                            flashSaleId: Utils.formatInt(
                                                item.flashSale?.flashSaleId),
                                            storeName: Utils.formatString(
                                                product.store?.name),
                                            storeTaxP: Utils.formatString(
                                                product.store!.tax),
                                            chargeAmount: Utils.formatString(
                                                product.store!
                                                    .additionalChargeAmount),
                                            chargeType: Utils.formatString(
                                                product.store!
                                                    .additionalChargeType),
                                            productId: Utils.formatInt(item.id),
                                            stock: stockQty,
                                            variantId: variantId,
                                            productName:
                                                Utils.formatString(item.name),
                                            variant: attributesMap.entries
                                                .map((e) => '${e.key}: ${e.value}')
                                                .join(','),
                                            price: finalPrice,
                                            quantity: 1,
                                            cartMaxQuantity: product.maxCartQty,
                                            image: Utils.formatString(item.imageUrl)),
                                        context);
                                  }
                                  cartCon.loadCartItems();
                                } else {
                                  context.pushNamed(RouteNames.productDisplay,
                                      extra: {
                                        "slug": item.slug,
                                      });
                                }
                              },
                              favorite: () {
                                _handleFavoriteToggle(
                                    item.wishlist, item.id.toString());
                              },
                              compare: () {},
                              imageUrl: Utils.formatString(item.imageUrl),
                              title: Utils.formatString(item.name),
                              originalPrice: isFlashSale && spPrice > 0
                                  ? Utils.formatString(item.specialPrice)
                                  : Utils.formatString(item.price),
                              discountedPrice: isFlashSale
                                  ? flashSalePrice.toString()
                                  : Utils.formatString(item.specialPrice),
                              rating: Utils.formatString(item.rating),
                              reviewsCount: Utils.formatInt(item.reviewCount),
                              stockCount: Utils.formatInt(item.stock),
                              isWishList: item.wishlist,
                              isFlashSale: isFlashSale,
                              itemId: Utils.formatInt(item.id),
                              discountPercent: item.discountPercentage ?? 0,
                            );
                          },
                        ),
                      ),
                    ),
                  );
                }
                return Container();
              },
              listener: (context, state) {
                if (state is ProductDetailsConnectionError) {
                  CommonFunctions.showUpSnack(
                    message: AppLocalizations.of(context)!.noInternet,
                    context: context,
                  );
                } else if (state is ProductDetailsFailure) {
                  CommonFunctions.showUpSnack(
                    message: state.productDetailsModel.message.isNotEmpty
                        ? state.productDetailsModel.message
                        : "An error occurred",
                    context: context,
                  );
                }
              },
            ),
            SizedBox(
              height: 10.h,
            ),
            if (isProductLoaded)
              _buildActionButtons(context,
                  // add to card
                  () async {
                int storeId = Utils.formatInt(product.store!.id);
                int areaId = Utils.formatInt(product.store!.areaId);
                int productId = Utils.formatInt(product.id);
                int variantId = Utils.formatInt(variantCon.variantId);
                int flashSaleId =
                    Utils.formatInt(product.flashSale?.flashSaleId);
                if (variantCon.stock == 'In Stock') {
                  if (storeId > 0 &&
                          areaId > 0 &&
                          productId > 0 &&
                          variantId > 0 &&
                          variantCon.spPrice > 0 ||
                      variantCon.price > 0) {
                    await cartCon.addToCart(
                        CartItem(
                            storeId: storeId,
                            areaId: areaId,
                            flashSaleId: flashSaleId,
                            storeName: product.store!.name,
                            storeTaxP: product.store!.tax,
                            chargeAmount: Utils.formatString(
                                product.store!.additionalChargeAmount),
                            chargeType: Utils.formatString(
                                product.store!.additionalChargeType),
                            productId: productId,
                            stock: variantCon.stockQty,
                            variantId: variantId,
                            productName: product.name,
                            variant: variantCon.variant,
                            price: variantCon.spPrice > 0
                                ? variantCon.spPrice.toString()
                                : variantCon.price.toString(),
                            quantity: 1,
                            cartMaxQuantity:
                                Utils.formatInt(product.maxCartQty),
                            image:
                                Utils.formatString(variantCon.selectedImage)),
                        context);
                  }
                } else {
                  CommonFunctions.showCustomSnackBar(context, "Out of Stock");
                }
              },
                  //By Now Button
                  () {
                if (commonCon.isLogin) {
                  if (variantCon.stock == 'In Stock') {
                    if (_emailSettingsOn == "on") {
                      if (_emailVerified) {
                        List<CartItem> cart = [];
                        checkoutCon.clearByNowItem();
                        int areaId = Utils.formatInt(product.store!.areaId);
                        cart.add(CartItem(
                            storeId: product.store!.id,
                            areaId: areaId,
                            flashSaleId: product.flashSale?.flashSaleId ?? 0,
                            storeName: product.store!.name,
                            storeTaxP: product.store!.tax,
                            chargeAmount: Utils.formatString(
                                product.store!.additionalChargeAmount),
                            chargeType:
                                product.store!.additionalChargeType ?? "",
                            productId: product.id,
                            stock: variantCon.stockQty,
                            variantId: variantCon.variantId,
                            productName: product.name,
                            variant: variantCon.variant,
                            price: variantCon.spPrice > 0
                                ? variantCon.spPrice.toString()
                                : variantCon.price.toString(),
                            quantity: 1,
                            cartMaxQuantity:
                                Utils.formatInt(product.maxCartQty),
                            image: product.imageUrl));
                        checkoutCon.addByNowItem(cart);
                        checkoutCon.setIsByNow(true);
                        List<int> productIds = [];
                        List<int> ariaIds = [];
                        ariaIds.add(areaId);
                        checkoutCon.setAriaIds(ariaIds);
                        productIds.add(product.id);
                        context.pushNamed(RouteNames.checkoutScreens,
                            extra: {"product_ids": productIds});
                        return;
                      } else {
                        showDialog(
                          context: context,
                          builder: (context) => CommonConfirmationDialog(
                            title: AppLocalizations.of(context)!
                                .emailVerificationRequired,
                            message:
                                '${AppLocalizations.of(context)!.toAccessYour} ${AppLocalizations.of(context)!.buyNow},${AppLocalizations.of(context)!.pleaseVerifyYourEmail}',
                            onConfirm: () {
                              context.pushNamed(RouteNames.emailVerification);
                            },
                          ),
                        );
                      }
                    } else {
                      List<CartItem> cart = [];
                      checkoutCon.clearByNowItem();
                      int areaId = Utils.formatInt(product.store!.areaId);
                      cart.add(CartItem(
                          storeId: product.store!.id,
                          areaId: areaId,
                          flashSaleId: product.flashSale?.flashSaleId ?? 0,
                          storeName: product.store!.name,
                          storeTaxP: product.store!.tax,
                          chargeAmount: Utils.formatString(
                              product.store!.additionalChargeAmount),
                          chargeType: product.store!.additionalChargeType ?? "",
                          productId: product.id,
                          stock: variantCon.stockQty,
                          variantId: variantCon.variantId,
                          productName: product.name,
                          variant: variantCon.variant,
                          price: variantCon.spPrice > 0
                              ? variantCon.spPrice.toString()
                              : variantCon.price.toString(),
                          quantity: variantCon.quantity,
                          cartMaxQuantity: Utils.formatInt(product.maxCartQty),
                          image: product.imageUrl));
                      checkoutCon.addByNowItem(cart);
                      checkoutCon.setIsByNow(true);
                      List<int> productIds = [];
                      List<int> ariaIds = [];
                      ariaIds.add(areaId);
                      checkoutCon.setAriaIds(ariaIds);
                      productIds.add(product.id);
                      context.pushNamed(RouteNames.checkoutScreens,
                          extra: {"product_ids": productIds});
                    }
                  } else {
                    CommonFunctions.showCustomSnackBar(context, "Out of Stock");
                  }
                } else {
                  showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return const ConfirmationDialog();
                    },
                  );
                }
              }, Utils.formatInt(product.id)),
            SizedBox(
              height: 10.h,
            ),
          ],
        ));
  }

  Widget _buildVariant(String imageUrl, {bool isSelected = false}) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4.0),
      padding: const EdgeInsets.all(4.0),
      decoration: BoxDecoration(
        border: Border.all(
          color: isSelected ? CustomColors.baseColor : Colors.grey.shade200,
          width: 2,
        ),
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: imageUrl.isNotEmpty
          ? Image.network(
              imageUrl,
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) {
                  return child; // Image loaded
                }
                return Center(
                  child: CircularProgressIndicator(
                    value: loadingProgress.expectedTotalBytes != null
                        ? loadingProgress.cumulativeBytesLoaded /
                            (loadingProgress.expectedTotalBytes ?? 1)
                        : null,
                  ),
                );
              },
              width: 50,
              height: 50,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Image.asset(
                  Images.noImage,
                  fit: BoxFit.cover,
                  width: 50,
                  height: 50,
                ); // Fallback image
              },
            )
          : Image.asset(
              Images.noImage,
              fit: BoxFit.cover,
              width: 50,
              height: 50,
            ),
    );
  }

  Widget _buildVariantSelection(List<VariantImage> imageList) {
    return Consumer<ItemDetailsProvider>(
      builder: (context, variantProvider, child) {
        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: imageList.map((imageUrl) {
              final isSelected =
                  variantProvider.selectedImage == imageUrl.imageUrl;
              return GestureDetector(
                onTap: () => variantProvider.setSelectImage(imageUrl.imageUrl),
                child: _buildVariant(imageUrl.imageUrl, isSelected: isSelected),
              );
            }).toList(),
          ),
        );
      },
    );
  }

  Widget _buildProductReview(
      BuildContext context, Product product, ItemDetailsProvider variantCon) {
    return Row(
      children: [
        StarRating(rating: product.rating.toString()),
        SizedBox(width: 4.w),
        Text(
          Utils.formatString(product.rating),
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(fontSize: 16.sp, fontWeight: FontWeight.w600),
        ),
        SizedBox(width: 4.h),
        Text(
          "(${Utils.formatString(product.reviewCount)} review)",
          style: Theme.of(context).textTheme.displayLarge!.copyWith(
                fontSize: 15.sp,
                fontWeight: FontWeight.w400,
              ),
        ),
        const Spacer(),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
          decoration: BoxDecoration(
            color: const Color(0xFFF4F8F5),
            borderRadius: BorderRadius.circular(10.r),
            border: Border.all(
              width: .3,
              color: const Color(0xFFC5E7C4),
            ),
          ),
          child: Text(
            variantCon.stock,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  fontSize: 10.sp,
                  color: variantCon.stock == 'In Stock'
                      ? const Color(0xFF00A537)
                      : const Color(0xFFFF2929),
                  fontWeight: FontWeight.w600,
                ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context, VoidCallback addToCart,
      VoidCallback byNow, int productId) {
    final cartCon = Provider.of<CartProvider>(context, listen: false);
    final CartItem? existItem = cartCon.cartItems
        .cast<CartItem?>()
        .firstWhere((item) => item?.productId == productId, orElse: () => null);
    return Row(
      children: [
        const SizedBox(width: 12),
        Expanded(
            child: existItem != null
                ? QuantityControl(
                    quantity: existItem.quantity,
                    onIncrement: () {
                      if (existItem.quantity + 1 <= existItem.cartMaxQuantity) {
                        cartCon.updateQuantity(
                            existItem.productId, existItem.quantity + 1);
                      } else {
                        CommonFunctions.showUpSnack(
                            context: context,
                            message:
                                "Cannot add more items. Stock limit reached.");
                      }
                    },
                    onDecrement: () {
                      if (existItem.quantity > 1) {
                        cartCon.updateQuantity(
                            existItem.productId, existItem.quantity - 1);
                      }
                    },
                  )
                : InkWell(
                    onTap: addToCart,
                    child: Container(
                      height: 38.h,
                      decoration: BoxDecoration(
                        color: const Color(0xFFECF5FF),
                        border: Border.all(
                          color: Colors.grey.shade200,
                          width: .8,
                        ),
                        borderRadius: BorderRadius.circular(4.r),
                      ),
                      child: Center(
                        child: Text(
                          AppLocalizations.of(context)!.addToCart,
                          style: CustomTextStyles.boldText(
                            16.sp,
                            color: const Color(0xFF2563EB),
                          ),
                        ),
                      ),
                    ),
                  )),
        const SizedBox(width: 12),
        Expanded(
          child: InkWell(
            onTap: byNow,
            child: Container(
              height: 38.h,
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB),
                borderRadius: BorderRadius.circular(4.r),
              ),
              child: Center(
                child: Text(
                  AppLocalizations.of(context)!.buyNow,
                  style: CustomTextStyles.boldText(16.sp, color: Colors.white),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
      ],
    );
  }

  void _handleFavoriteToggle(bool isWishlist, String id) {
    if (_token.isEmpty) {
      CommonFunctions.showUpSnack(context: context, message: 'Please log in');
      return;
    }

    if (isWishlist) {
      _favoriteAddBloc.add(DeleteFavorites(productId: id, token: _token));
    } else {
      _favoriteAddBloc.add(AddFavorites(productId: id, token: _token));
    }
  }
}

class MainProductImage extends StatefulWidget {
  final String imageUrl;
  final String itemId;

  const MainProductImage({
    super.key,
    required this.imageUrl,
    required this.itemId,
  });

  @override
  State<MainProductImage> createState() => _MainProductImageState();
}

class _MainProductImageState extends State<MainProductImage> {
  late final FavoriteAddBloc _favoriteAddBloc;
  String _token = '';
  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
  }

  @override
  void initState() {
    _favoriteAddBloc = context.read<FavoriteAddBloc>();
    getUserRout();
    super.initState();
  }

  @override
  @override
  Widget build(BuildContext context) {
    var variantCon = Provider.of<ItemDetailsProvider>(context);
    return Stack(
      children: [
        Center(
          child: InteractiveViewer(
            clipBehavior: Clip.none,
            minScale: 1.0,
            maxScale: 4.0,
            panEnabled: true,
            scaleEnabled: true,
            boundaryMargin: EdgeInsets.zero,
            child: (variantCon.selectedImage != null &&
                    Uri.tryParse(variantCon.selectedImage!)?.hasAbsolutePath ==
                        true)
                ? Image.network(
                    widget.imageUrl,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) {
                        return child; // Image loaded
                      }
                      return SizedBox(
                        height: 200.h,
                        child: Center(
                          child: CircularProgressIndicator(
                            value: loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                    (loadingProgress.expectedTotalBytes ?? 1)
                                : null,
                          ),
                        ),
                      );
                    },
                    height: 200.h,
                    width: 370.w,
                    fit: BoxFit.fill,
                    errorBuilder: (context, error, stackTrace) {
                      return Image.asset(
                        Images.noImage,
                        fit: BoxFit.cover,
                        height: 200,
                        width: double.infinity,
                      ); // Fallback image
                    },
                  )
                : Image.asset(
                    Images.noImage,
                    fit: BoxFit.cover,
                    height: 200,
                    width: double.infinity,
                  ),
          ),
        ),
        Positioned(
          right: 2.0,
          top: 6.0,
          child: Column(
            children: [
              BlocConsumer<FavoriteAddBloc, FavoriteAddState>(
                listener: (context, state) {
                  if (state is FavoriteAddConnectionError) {
                    CommonFunctions.showCustomSnackBar(
                      context,
                      AppLocalizations.of(context)!.noInternet,
                    );
                  } else if (state is FavoriteAddFailure) {
                    CommonFunctions.showCustomSnackBar(
                      context,
                      state.authModel.message,
                    );
                  } else if (state is FavoriteAddLoaded) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      CommonFunctions.showUpSnack(
                        context: context,
                        message: state.authModel.message,
                      );
                    });
                  }
                },
                builder: (context, state) {
                  if (state is FavoriteAddLoading) {
                    return CircleAvatar(
                      radius: 20.r,
                      backgroundColor: Colors.white,
                      child: ImageIcon(
                        const AssetImage(
                          AssetsIcons.favoriteOutline,
                        ),
                        color: Colors.grey,
                        size: 20.sp,
                      ),
                    );
                  }
                  return InkWell(
                    onTap: () {
                      getUserRout();
                      if (_token.isEmpty) {
                        CommonFunctions.showUpSnack(
                            context: context, message: 'Please log in');
                        return;
                      } else if (_token.isNotEmpty) {
                        if (variantCon.isWishList) {
                          _favoriteAddBloc.add(DeleteFavorites(
                              productId: widget.itemId, token: _token));
                          variantCon.setWishList(false);
                        } else {
                          _favoriteAddBloc.add(AddFavorites(
                              productId: widget.itemId, token: _token));
                          variantCon.setWishList(true);
                        }
                      }
                    },
                    child: CircleAvatar(
                      radius: 20.r,
                      backgroundColor: Colors.white,
                      child: ImageIcon(
                        AssetImage(
                          variantCon.isWishList
                              ? AssetsIcons.favorite
                              : AssetsIcons.favoriteOutline,
                        ),
                        color: variantCon.isWishList
                            ? CustomColors.baseColor
                            : Colors.grey,
                        size: 20.sp,
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 12),
              InkWell(
                onTap: () => _showShareDialog(context),
                child: const CircleAvatar(
                  radius: 20,
                  backgroundColor: Colors.white,
                  child: Icon(Icons.share, color: Colors.black),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showShareDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          title: Row(
            children: [
              const Text('Share this product', style: TextStyle(fontSize: 18)),
              const Spacer(),
              Image.asset(
                AssetsIcons.share,
                height: 22.h,
                width: 22.w,
                fit: BoxFit.contain,
              )
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: Image.asset(
                  AssetsIcons.whatsapp,
                  height: 25.h,
                  width: 25.w,
                  fit: BoxFit.contain,
                ),
                title: Text(
                  'WhatsApp',
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w400,
                      ),
                ),
                onTap: () {},
              ),
              ListTile(
                leading: Image.asset(
                  AssetsIcons.facebook,
                  height: 25.h,
                  width: 25.w,
                  fit: BoxFit.contain,
                ),
                title: Text(
                  'Facebook',
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w400,
                      ),
                ),
                onTap: () {},
              ),
              ListTile(
                leading: Image.asset(
                  AssetsIcons.gmail,
                  height: 25.h,
                  width: 25.w,
                  fit: BoxFit.contain,
                ),
                title: Text(
                  'Email',
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w400,
                      ),
                ),
                onTap: () {},
              ),
            ],
          ),
        );
      },
    );
  }
}

class LabelWithValue extends StatelessWidget {
  final String label;
  final String value;

  const LabelWithValue({
    super.key,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4.h),
      child: RichText(
        text: TextSpan(
          text: '$label: ',
          style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
          children: [
            TextSpan(
              text: value,
              style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class ProductDetailsSettings extends StatefulWidget {
  const ProductDetailsSettings({super.key});

  @override
  State<ProductDetailsSettings> createState() => _ProductDetailsSettingsState();
}

class _ProductDetailsSettingsState extends State<ProductDetailsSettings> {
  late final PaymentGatewaysBloc _gatewaysBloc;
  String _language = '';
  @override
  void initState() {
    _gatewaysBloc = context.read<PaymentGatewaysBloc>();
    _gatewaysBloc.add(ProductDetailsSetting(language: _language));
    // TODO: implement initState
    super.initState();
  }

  getUserRout() async {
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _language = language ?? "";
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<PaymentGatewaysBloc, PaymentGatewaysState>(
      listener: (context, state) {
        if (state is PaymentGatewaysConnectionError) {
          CommonFunctions.showUpSnack(
              context: context,
              message: AppLocalizations.of(context)!.noInternet);
        } else if (state is PaymentGatewaysFailure) {}
      },
      builder: (context, state) {
        if (state is PaymentGatewaysLoading) {
          return const ShimmerLoadingWidget();
        } else if (state is ProductDetailsSettingLoaded) {
          if (state.hasConnectionError) {
            CommonFunctions.showCustomSnackBar(
                context, AppLocalizations.of(context)!.noInternet);
          }
          final data = state.productDetailsSettingsModel.data;
          return CommonCard(
            mHorizontal: 12,
            mVertical: 0,
            widget: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: data.comProductDetailsPageDeliveryEnableDisable == "on"
                      ? FeatureItem(
                          icon: Icons.local_shipping,
                          title: data.comProductDetailsPageDeliveryTitle ?? "",
                          subtitle:
                              data.comProductDetailsPageDeliverySubtitle ?? "",
                        )
                      : const SizedBox(),
                ),
                SizedBox(
                  width: 12.w,
                ),
                Expanded(
                  child: data.comProductDetailsPageReturnRefundEnableDisable ==
                          "on"
                      ? FeatureItem(
                          icon: Icons.autorenew,
                          title:
                              data.comProductDetailsPageReturnRefundTitle ?? "",
                          subtitle:
                              data.comProductDetailsPageReturnRefundSubtitle ??
                                  "",
                        )
                      : const SizedBox(),
                ),
              ],
            ),
          );
        }

        return const SizedBox();
      },
    );
  }
}

class FeatureItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const FeatureItem({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 30.sp, color: Colors.blue),
        SizedBox(height: 8.h),
        Text(
          title,
          style: TextStyle(
            fontSize: 10.sp,
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(height: 4.h),
        Text(
          subtitle,
          maxLines: 3,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 10.sp,
            fontWeight: FontWeight.w400,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }
}
