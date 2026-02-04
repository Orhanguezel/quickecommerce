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
import 'package:quick_ecommerce/screens/common_widgets/person_avater.dart';

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
import '../auth_screens/email_verification.dart';
import '../auth_screens/login_confirmation_dailog.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/item_title.dart';
import '../desktop_home/item_card.dart';
import '../home/item_card.dart';
import 'atribute_selection.dart';
import 'details_tab.dart';

class DesktopProductDisplay extends StatefulWidget {
  const DesktopProductDisplay({super.key, required this.slug});
  final String slug;
  @override
  DesktopProductDisplayState createState() => DesktopProductDisplayState();
}

class DesktopProductDisplayState extends State<DesktopProductDisplay> {
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

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ItemDetailsProvider>(context, listen: false)
          .clearSelectedVariant();
    });
    _productDetailsBloc = context.read<ProductDetailsBloc>();
    _favoriteAddBloc = context.read<FavoriteAddBloc>();

    getUserRout();
    super.initState();
  }

  List<RelatedProduct> relatedProduct = [];

  late Product product;

  @override
  Widget build(BuildContext context) {
    var homeCon = Provider.of<HomeScreenProvider>(context);
    var cartCon = Provider.of<CartProvider>(context);
    var variantCon = Provider.of<ItemDetailsProvider>(context);
    return Scaffold(
      body: BlocConsumer<ProductDetailsBloc, ProductDetailsState>(
        builder: (_, state) {
          if (state is ProductDetailsLoading) {
            return Expanded(
              child: ListView.builder(
                itemCount: 8,
                itemBuilder: (context, index) {
                  return const DesktopShimmerLoadingWidget();
                },
              ),
            );
          }
          else if (state is ProductDetailsLoaded) {
            if (state.hasConnectionError) {
              CommonFunctions.showCustomSnackBar(
                  context, AppLocalizations.of(context)!.noInternet);
            }
            product = state.productDetailsModel.data;
            relatedProduct = state.productDetailsModel.relatedProducts ?? [];
            if (product.flashSale != null) {
              variantCon.setFlashSale(product.flashSale!);
            }
            if (product.variants != null) {
              variantCon.initializeVariants(product.variants!);
            }

            variantCon.setThumnilImage(
                VariantImage(id: 100000, imageUrl: product.imageUrl ?? ""));
            double screenWidth = MediaQuery.of(context).size.width;
            final bool isMobile = screenWidth < 700;
            final bool isTablet = screenWidth >= 700 && screenWidth < 1100;
            return SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 10,horizontal: 16),
                child: Column(
                  children: [
                    SizedBox(
                      child:  isMobile
                          ? Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Main image
                          SizedBox(
                            width: screenWidth,
                            child: MainProductImage(
                              imageUrl: variantCon.selectedImage ?? "",
                              itemId: Utils.formatString(product.id),
                            ),
                          ),
                          const SizedBox(height: 10),
                          // Image selection (small width on mobile)
                          SizedBox(
                            width: screenWidth,
                            child: _buildVariantSelection(variantCon.imageLists,Axis.horizontal),
                          ),
                          const SizedBox(height: 10),
                          // Product info below on mobile
                          ProductInfoCard(
                            product: product,
                            emailVerified: _emailVerified,
                            emailSettingsOn: _emailSettingsOn,
                          ),
                        ],
                      )
                          : Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Variant thumbnails
                          SizedBox(
                            width: screenWidth * (isTablet ? 0.12 : 0.15),
                            child: _buildVariantSelection(variantCon.imageLists,Axis.vertical),
                          ),
                          // Main image
                          SizedBox(
                            width: screenWidth * (isTablet ? 0.35 : 0.4),
                            child: MainProductImage(
                              imageUrl: variantCon.selectedImage ?? "",
                              itemId: Utils.formatString(product.id),
                            ),
                          ),
                          // Product info (on right for large screens)
                          SizedBox(
                            width: screenWidth * (isTablet ? 0.45 : 0.4),
                            child: ProductInfoCard(
                              product: product,
                              emailVerified: _emailVerified,
                              emailSettingsOn: _emailSettingsOn,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      height: 10,
                      color: Colors.white,
                    ),
                    DesktopDetailsTab(product: product),
                    CommonCard(
                      mHorizontal: 0,
                      mVertical: 10,
                      widget: Row(
                        children: [
                         AvatarWidget(
                             imageUrl: Utils.formatString(product.store!.logo),
                           radius: 30,
                         ),
                          const SizedBox(width: 8),

                          // Seller Info
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(product.store!.name ?? "",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium!
                                        .copyWith(
                                          fontSize: 16,
                                          color: CustomColors.baseColor,
                                          fontWeight: FontWeight.w600,
                                        )),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Row(
                                      children: [
                                        StarRating(
                                            rating:Utils.formatString(product.store!.rating)),
                                        const SizedBox(width: 2),
                                        Text(
                                          "(${product.store!.rating})",
                                          style: Theme.of(context)
                                              .textTheme
                                              .headlineSmall!
                                              .copyWith(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w400,
                                              ),
                                        ),
                                      ],
                                    ),
                                    const Spacer(),
                                    // Visit Store Button
                                    InkWell(
                                      onTap: () {
                                        context.pushNamed(
                                            RouteNames.storeDetailWeb,
                                            extra: {'slug': product.store!.slug});
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 12, vertical: 8),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFE8F1FD),
                                          borderRadius: BorderRadius.circular(8.r),
                                        ),
                                        child: Text(
                                          AppLocalizations.of(context)!.visitStore,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: CustomColors.baseColor,
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
                    const ProductDetailsSettings(),
                    const SizedBox(height: 12),
                    ItemTitle(
                        title: AppLocalizations.of(context)!.related,
                        subTitle: AppLocalizations.of(context)!.products,
                        onTap: () {
                          homeCon.setTabType("Products");
                          context.pop();
                        }),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 330,
                      child: LayoutBuilder(builder: (context, constraints) {
                        const double itemWidth = 200.0;
                        int crossAxisCount =
                            ((constraints.maxWidth) / (itemWidth)).floor();
                        if (crossAxisCount < 2) crossAxisCount = 2;
                        return GridView.builder(
                          padding: EdgeInsets.zero,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: crossAxisCount,
                              crossAxisSpacing: 0,
                              mainAxisSpacing: 0.0,
                              childAspectRatio: 0.5,
                              mainAxisExtent: 316),
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
                            return DesktopItemCart(
                              details: () {
                                context.pushNamed(
                                  RouteNames.desktopProductDisplay,
                                  extra: {"slug": item.slug},
                                );
                              },
                              addToCart: () {
                                if (item.singleVariant!.isNotEmpty) {
                                  var variantId = item.singleVariant!.first.id;
                                  var stockQty =
                                      item.singleVariant!.first.stockQuantity;
                                  if (item.id != null && variantId != null) {
                                    final Map<String, dynamic> attributesMap =
                                        jsonDecode(
                                            item.singleVariant!.first.attributes);

                                    String finalPrice = isFlashSale
                                        ? flashSalePrice.toString()
                                        : spPrice > 0
                                            ? item.specialPrice!
                                            : item.price;
                                    cartCon.addToCart(
                                        CartItem(
                                            storeId:
                                                Utils.formatInt(item.storeId),
                                            areaId: Utils.formatInt(item.areaId),
                                            flashSaleId: Utils.formatInt(
                                                item.flashSale?.flashSaleId),
                                            storeName: Utils.formatString(
                                                product.store?.name),
                                            storeTaxP: Utils.formatString(
                                                product.store!.tax),
                                            chargeAmount: Utils.formatString(
                                                product.store!
                                                    .additionalChargeAmount),
                                            chargeType: Utils.formatString(product
                                                .store!.additionalChargeType),
                                            productId: Utils.formatInt(item.id),
                                            stock: stockQty,
                                            variantId: variantId,
                                            productName:
                                                Utils.formatString(item.name),
                                            variant: attributesMap.entries
                                                .map(
                                                    (e) => '${e.key}: ${e.value}')
                                                .join(','),
                                            price: finalPrice,
                                            quantity: 1,
                                            cartMaxQuantity: product.maxCartQty,
                                            image: Utils.formatString(item.imageUrl)),
                                        context);
                                  }
                                  cartCon.loadCartItems();
                                }
                                else {
                                  context.pushNamed(
                                    RouteNames.desktopProductDisplay,
                                    extra: {"slug": item.slug},
                                  );
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
                        );
                      }),
                    )
                  ],
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
    );
  }

  Widget _buildVariantSelection(List<VariantImage> imageList,Axis scrollDirection) {
    return Consumer<ItemDetailsProvider>(
      builder: (context, variantProvider, child) {
        return SingleChildScrollView(
          scrollDirection: scrollDirection,
          child: Flex(
            direction: scrollDirection,
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: imageList.map((imageUrl) {
              final isSelected =
                  variantProvider.selectedImage == imageUrl.imageUrl;
              return GestureDetector(
                  onTap: () =>
                      variantProvider.setSelectImage(imageUrl.imageUrl),
                  child: Container(
                      margin: const EdgeInsets.symmetric(
                          horizontal: 4.0, vertical: 6),
                      padding: const EdgeInsets.all(4.0),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: isSelected
                              ? CustomColors.baseColor
                              : Colors.grey.shade200,
                          width: 2,
                        ),
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                      child: CommonImage(
                        imageUrl: imageUrl.imageUrl,
                        width: 80,
                        height: 80,
                        fit: BoxFit.cover,
                      )));
            }).toList(),
          ),
        );
      },
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
    return CommonCard(
        mVertical: 2,
        mHorizontal: 2,
        pRight: 0,
        pLeft: 0,
        pBottom: 0,
        pTop: 0,
        widget: Stack(
          children: [
            Center(
              child: (variantCon.selectedImage != null &&
                  Uri.tryParse(variantCon.selectedImage!)
                      ?.hasAbsolutePath ==
                      true)
                  ? Image.network(
                widget.imageUrl,
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) {
                    return child; // Image loaded
                  }
                  return SizedBox(
                    height: 500,
                    child: Center(
                      child: CircularProgressIndicator(
                        value: loadingProgress.expectedTotalBytes !=
                            null
                            ? loadingProgress.cumulativeBytesLoaded /
                            (loadingProgress.expectedTotalBytes ??
                                1)
                            : null,
                      ),
                    ),
                  );
                },
                height: 500,
                // width: 400,
                fit: BoxFit.fill,
                errorBuilder: (context, error, stackTrace) {
                  return Image.asset(
                    Images.noImage,
                    fit: BoxFit.cover,
                    height: 500,
                    // width: 400,
                  ); // Fallback image
                },
              )
                  : Image.asset(
                Images.noImage,
                fit: BoxFit.cover,
                height: 500,
                // width: 400,
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
                        return const CircleAvatar(
                          radius: 20,
                          backgroundColor: Colors.white,
                          child: ImageIcon(
                            AssetImage(
                              AssetsIcons.favoriteOutline,
                            ),
                            color: Colors.grey,
                            size: 20,
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
                          radius: 20,
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
                            size: 20,
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
        ));
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
                  height: 25,
                  width: 25,
                  fit: BoxFit.contain,
                ),
                title: Text(
                  'WhatsApp',
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                      ),
                ),
                onTap: () {},
              ),
              ListTile(
                leading: Image.asset(
                  AssetsIcons.facebook,
                  height: 25,
                  width: 25,
                  fit: BoxFit.contain,
                ),
                title: Text(
                  'Facebook',
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                      ),
                ),
                onTap: () {},
              ),
              ListTile(
                leading: Image.asset(
                  AssetsIcons.gmail,
                  height: 25,
                  width: 25,
                  fit: BoxFit.contain,
                ),
                title: Text(
                  'Email',
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                        fontSize: 14,
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
      padding: const EdgeInsets.symmetric(vertical: 4),
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
        Icon(icon, size: 30, color: Colors.blue),
        const SizedBox(height: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(height: 4.h),
        Text(
          subtitle,
          maxLines: 3,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w400,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }
}

class ProductInfoCard extends StatelessWidget {
  final Product product;
  final bool emailVerified;
  final String emailSettingsOn;
  const ProductInfoCard({
    super.key,
    required this.product,
    required this.emailVerified,
    required this.emailSettingsOn,
  });
  @override
  Widget build(BuildContext context) {
    var variantCon = Provider.of<ItemDetailsProvider>(context);
    final currencyCon = Provider.of<CurrencyController>(context);
    final homeCon = Provider.of<HomeScreenProvider>(context);
    var checkoutCon = Provider.of<CheckoutController>(context);
    var cartCon = Provider.of<CartProvider>(context);
    var commonCon = Provider.of<CommonProvider>(context);
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

    return CommonCard(
      mVertical: 2,
      mHorizontal: 2,
      pRight: 6,
      pLeft: 6,
      pBottom: 6,
      widget: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 6),
          Text(
            Utils.formatString(product.name),
            maxLines: 1,
            textAlign: TextAlign.start,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 8),

          Row(
            children: [
             StarRating(rating: Utils.formatString(product.rating)),
              const SizedBox(width: 4),
              Text(
                Utils.formatString(product.rating),
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(width: 4),
              Text(
                "(${Utils.formatString(product.reviewCount)} review)",
                style: Theme.of(context).textTheme.displayLarge!.copyWith(
                      fontSize: 15,
                      fontWeight: FontWeight.w400,
                    ),
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFF4F8F5),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    width: .3,
                    color: const Color(0xFFC5E7C4),
                  ),
                ),
                child: Text(
                  variantCon.stock,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        fontSize: 10,
                        color: variantCon.stock == 'In Stock'
                            ? const Color(0xFF00A537)
                            : const Color(0xFFFF2929),
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                Text(
                  currencyCon.formatCurrency(variantCon.spPrice > 0
                      ? variantCon.spPrice.toString()
                      : variantCon.price.toString()),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontSize: 20,
                      ),
                ),
                const SizedBox(width: 4),
                if (variantCon.spPrice > 0)
                  Text(
                    currencyCon.formatCurrency(variantCon.price.toString()),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontSize: 14,
                          color: const Color(0xFF627D98),
                          decorationColor: const Color(0xFF627D98),
                          decorationThickness: 2.0,
                          decoration: TextDecoration.lineThrough,
                        ),
                  ),
                const SizedBox(width: 12),
              ],
            ),
          ),

          const Divider(thickness: .2, color: Colors.grey),

          LabelWithValue(
            label: AppLocalizations.of(context)!.sKU,
            value: variantCon.sku,
          ),
          LabelWithValue(
            label: AppLocalizations.of(context)!.category,
            value: Utils.formatString(product.category?.categoryName),
          ),
          product.warranty != null
              ? LabelWithValue(
                  label: AppLocalizations.of(context)!.warranty,
                  value: warranty,
                )
              : const SizedBox(),
          product.brand != null
              ? LabelWithValue(
                  label: AppLocalizations.of(context)!.brand,
                  value: Utils.formatString(product.brand?.label),
                )
              : const SizedBox(),
          LabelWithValue(
            label: AppLocalizations.of(context)!.returnInDays,
            value: Utils.formatString(product.returnInDays),
          ),
          LabelWithValue(
            label: AppLocalizations.of(context)!.returnPolicy,
            value: Utils.formatString(product.returnText),
          ),
          LabelWithValue(
            label: AppLocalizations.of(context)!.changeOfMindAllowed,
            value: product.allowChangeInMind == "0" ? "No" : "Yes",
          ),
          LabelWithValue(
            label: AppLocalizations.of(context)!.cashOnDelivery,
            value: product.cashOnDelivery == "0" ? "No" : "Yes",
          ),
          LabelWithValue(
            label: AppLocalizations.of(context)!.deliveryNote,
            value: Utils.formatString(product.deliveryTimeText),
          ),
          LabelWithValue(
            label: AppLocalizations.of(context)!.deliveryTime,
            value:
                "${Utils.formatString(product.deliveryTimeMin)}-${Utils.formatString(product.deliveryTimeMax)}",
          ),
          LabelWithValue(
            label: AppLocalizations.of(context)!.availableStartTime,
            value:
                "${Utils.formatDate(product.availableTimeStarts)} ${Utils.formatTime(product.availableTimeStarts)}",
          ),
          LabelWithValue(
            label: AppLocalizations.of(context)!.availableEndTime,
            value:
                "${Utils.formatDate(product.availableTimeEnds)} ${Utils.formatTime(product.availableTimeEnds)}",
          ),

          const Divider(thickness: .2, color: Colors.grey),
          const SizedBox(height: 4),

          // Your attribute options widget
          const AttributeOptions(),

          const SizedBox(height: 12),
          _buildActionButtons(context,
              // add to card
              () async {
            int storeId = Utils.formatInt(product.store!.id);
            int areaId = Utils.formatInt(product.store!.areaId);
            int productId = Utils.formatInt(product.id);
            int variantId = Utils.formatInt(variantCon.variantId);
            int flashSaleId = Utils.formatInt(product.flashSale?.flashSaleId);
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
                        cartMaxQuantity: Utils.formatInt(product.maxCartQty),
                        image: Utils.formatString(variantCon.selectedImage)),
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
                if (emailSettingsOn == "on") {
                  if (emailVerified) {
                    List<CartItem> cart = [];
                    checkoutCon.clearByNowItem();
                    int areaId = Utils.formatInt(product.store!.areaId);
                    cart.add(CartItem(
                        storeId: product.store!.id,
                        areaId: areaId,
                        flashSaleId: Utils.formatInt(product.flashSale?.flashSaleId),
                        storeName: Utils.formatString(product.store!.name),
                        storeTaxP:Utils.formatString( product.store!.tax),
                        chargeAmount: Utils.formatString(
                            product.store!.additionalChargeAmount),
                        chargeType: Utils.formatString(product.store!.additionalChargeType),
                        productId: product.id,
                        stock: variantCon.stockQty,
                        variantId: variantCon.variantId,
                        productName: product.name,
                        variant: variantCon.variant,
                        price: variantCon.spPrice > 0
                            ? Utils.formatString(variantCon.spPrice)
                            : Utils.formatString(variantCon.price),
                        quantity: 1,
                        cartMaxQuantity: Utils.formatInt(product.maxCartQty),
                        image: product.imageUrl));
                    checkoutCon.addByNowItem(cart);
                    checkoutCon.setIsByNow(true);
                    List<int> productIds = [];
                    List<int> ariaIds = [];
                    ariaIds.add(areaId);
                    checkoutCon.setAriaIds(ariaIds);
                    productIds.add(product.id);
                    Navigator.pop(context);
                    checkoutCon.setProductIds(productIds);
                    homeCon.setTabType("Checkout");

                    return;
                  }
                  else {
                    showDialog(
                      context: context,
                      builder: (context) => CommonConfirmationDialog(
                        title: AppLocalizations.of(context)!
                            .emailVerificationRequired,
                        message:
                            '${AppLocalizations.of(context)!.toAccessYour} ${AppLocalizations.of(context)!.buyNow},${AppLocalizations.of(context)!.pleaseVerifyYourEmail}',
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
                 Navigator.pop(context);
                  checkoutCon.setProductIds(productIds);
                  homeCon.setTabType("Checkout");
                }
              } else {
                CommonFunctions.showCustomSnackBar(context, "Out of Stock");
              }
            }
            else {
              showDialog(
                context: context,
                builder: (BuildContext context) {
                  return const ConfirmationDialog();
                },
              );
            }
          }, Utils.formatInt(product.id)),
          const SizedBox(height: 12),
        ],
      ),
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
                      height: 38,
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
                            16,
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
              height: 38,
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB),
                borderRadius: BorderRadius.circular(4.r),
              ),
              child: Center(
                child: Text(
                  AppLocalizations.of(context)!.buyNow,
                  style: CustomTextStyles.boldText(16, color: Colors.white),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
