import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/provider/currencie_controler.dart';
import 'package:shimmer/shimmer.dart';
import '../../config/colors.dart';
import '../../config/icons.dart';
import '../../config/images.dart';
import '../../config/text_styles.dart';
import '../../controller/provider/cart_controler.dart';
import '../../data/data_model/cart_model.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';

class ItemCart extends StatelessWidget {
  final String imageUrl;
  final String title;
  final String originalPrice;
  final String discountedPrice;
  final String rating;
  final int reviewsCount;
  final int stockCount;
  final int itemId;
  final bool isFeatured;
  final bool isFlashSale;
  final bool isWishList;
  final dynamic discountPercent;
  final String discountAmount;
  final String discountType;
  final VoidCallback addToCart;
  final VoidCallback details;
  final VoidCallback compare;
  final VoidCallback favorite;

  const ItemCart({
    super.key,
    required this.imageUrl,
    required this.title,
    required this.originalPrice,
    required this.discountedPrice,
    required this.rating,
    required this.reviewsCount,
    required this.stockCount,
    required this.itemId,
    this.isFeatured = false,
    this.isFlashSale = false,
    required this.isWishList,
    required this.discountPercent,
    this.discountAmount = '',
    this.discountType = '',
    required this.addToCart,
    required this.details,
    required this.compare,
    required this.favorite,
  });
  @override
  Widget build(BuildContext context) {
    var cartCon = Provider.of<CartProvider>(context);
    final currencyCon = Provider.of<CurrencyController>(context);
    CartItem? existingItem;
    for (var item in cartCon.cartItems) {
      if (item.productId == itemId) {
        existingItem = item;
        break;
      }
    }
    bool isInCart =
        existingItem != null && existingItem.quantity > 0 ? true : false;
    double disPrice = double.tryParse(discountedPrice) ?? 0.0;
    return InkWell(
      onTap: details,
      child: Container(
        margin: EdgeInsets.all(4.sp),
        padding: EdgeInsets.symmetric(horizontal: 7.44.w, vertical: 6.78.h),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(width: .6, color: Colors.grey.shade50),
          color: Colors.white,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  // Product Image
                  Padding(
                      padding: EdgeInsets.only(bottom: 20.h),
                      child: CommonImage(
                        imageUrl: imageUrl,
                        height: 180.h,
                        width: double.infinity,
                      )),

                  Positioned(
                    top: 4.h,
                    left: -3.w,
                    child: Row(
                      children: [
                        if (isFeatured)
                          const FeaturedRibbon(
                            title: "Featured",
                          ),
                        SizedBox(
                          width: 6.w,
                        ),
                        isFlashSale
                            ? Image.asset(
                                AssetsIcons.fsale,
                                height: 20.h,
                                width: 25.w,
                              )
                            : const SizedBox(),
                      ],
                    ),
                  ),

                  Positioned(
                    top: 4.h,
                    right: 0.w,
                    child: Row(
                      children: [
                        if (discountPercent > 0 && isFlashSale == false)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0XFFEB5A25),
                              borderRadius: BorderRadius.circular(2.79.r),
                            ),
                            child: Text(
                              "$discountPercent%",
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        if (discountAmount.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0XFFEB5A25),
                              borderRadius: BorderRadius.circular(2.79.r),
                            ),
                            child: discountType == "percentage"
                                ? Text(
                                    "$discountAmount%",
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  )
                                : Text(
                                    currencyCon.formatCurrency(discountAmount),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ),
                      ],
                    ),
                  ),
                  // Action Buttons
                  Positioned(
                    bottom: 8.h,
                    right: 0,
                    left: 0,
                    child: Row(
                      mainAxisAlignment:
                          MainAxisAlignment.center, // Center horizontally
                      children: [
                        CartIconButton(
                            icon: AssetsIcons.eyeSee, onTap: details),
                        SizedBox(width: 4.w),
                        CartIconButton(
                            color: isWishList
                                ? const Color(0xFF1A73E8)
                                : Colors.grey,
                            icon: isWishList
                                ? AssetsIcons.favorite
                                : AssetsIcons.favoriteOutline,
                            onTap: favorite),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontSize: 14.sp,
                      color: const Color(0xFF0F172A),
                      fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                // Price
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      if (disPrice > 0) ...[
                        Text(
                          currencyCon.formatCurrency(originalPrice),
                          style: const TextStyle(
                            fontSize: 12,
                            decorationColor: Color(0xFF627D98),
                            decorationThickness: 2.0,
                            decoration: TextDecoration.lineThrough,
                            color: Colors.grey,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          currencyCon.formatCurrency(discountedPrice),
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                      ] else ...[
                        Text(
                          currencyCon.formatCurrency(originalPrice),
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                // Rating and Reviews
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      Icon(Icons.star, color: Colors.orange, size: 14.sp),
                      SizedBox(
                        width: 4.w,
                      ),
                      Text(
                        "$rating ($reviewsCount)",
                        style: Theme.of(context)
                            .textTheme
                            .displayLarge
                            ?.copyWith(
                                fontSize: 9.sp,
                                color: const Color(0xFF585858),
                                fontWeight: FontWeight.w400),
                      ),
                      // const Spacer(),
                      SizedBox(
                        width: 4.w,
                      ),
                      Icon(Icons.store_outlined,
                          color: Colors.green, size: 14.sp),
                      SizedBox(
                        width: 4.w,
                      ),
                      // Stock
                      stockCount > 1
                          ? Text(
                              AppLocalizations.of(context)!.inStock,
                              overflow: TextOverflow.visible,
                              style: Theme.of(context)
                                  .textTheme
                                  .labelLarge
                                  ?.copyWith(
                                      fontSize: 12.sp,
                                      fontWeight: FontWeight.w400),
                            )
                          : Text(
                              AppLocalizations.of(context)!.outOfStock,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context)
                                  .textTheme
                                  .labelLarge
                                  ?.copyWith(
                                      fontSize: 12.sp,
                                      fontWeight: FontWeight.w400,
                                      color: Colors.red),
                            ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(
              height: 4.h,
            ),
            stockCount < 1
                ? Center(
                    child: Container(
                      width: double.infinity,
                      height: 36.h,
                      decoration: BoxDecoration(
                        color: const Color(0xFFA7BACD),
                        borderRadius: BorderRadius.circular(6.r),
                      ),
                      child: Center(
                        child: Text(
                          AppLocalizations.of(context)!.addToCart,
                          style: CustomTextStyles.regularText(
                            14.sp,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  )
                : isInCart
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          existingItem.quantity > 1
                              ? InkWell(
                                  onTap: () {
                                    if (existingItem!.productId > 0) {
                                      if (existingItem.quantity > 1) {
                                        cartCon.updateQuantity(
                                            existingItem.productId,
                                            existingItem.quantity - 1);
                                      }
                                    }
                                  },
                                  child: Container(
                                    height: 30.h,
                                    width: 35.w,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(7.5),
                                      color: const Color(0xFFFFFFFF),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.grey.shade100,
                                          offset: const Offset(0, 2),
                                          blurRadius: 4.0,
                                          spreadRadius: 1.5,
                                        )
                                      ],
                                    ),
                                    child: const Icon(Icons.remove,
                                        color: Colors.black),
                                  ),
                                )
                              : Container(
                                  height: 30.h,
                                  width: 35.w,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(7.5),
                                    color: const Color(0xFFFFFFFF),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.grey.shade100,
                                        offset: const Offset(0, 2),
                                        blurRadius: 4.0,
                                        spreadRadius: 1.5,
                                      )
                                    ],
                                  ),
                                  child: Icon(
                                    Icons.remove,
                                    color: Colors.grey.shade300,
                                  ),
                                ),
                          Text(
                            existingItem.quantity.toString(),
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                    fontSize: 16.sp,
                                    color: Colors.black,
                                    fontWeight: FontWeight.w600),
                          ),
                          InkWell(
                            onTap: () {
                              if (existingItem != null &&
                                  existingItem.productId > 0) {
                                int updatedQuantity = existingItem.quantity + 1;
                                if (existingItem.cartMaxQuantity > 0 &&
                                    updatedQuantity >
                                        existingItem.cartMaxQuantity) {
                                  // Stock limit reached
                                  CommonFunctions.showCustomSnackBar(context,
                                      "${AppLocalizations.of(context)!.maximumAllowedQuantity} ${existingItem.cartMaxQuantity}");
                                } else {
                                  // Update quantity (either unlimited or within max limit)
                                  cartCon.updateQuantity(
                                      existingItem.productId, updatedQuantity);
                                }
                              }
                            },
                            child: Container(
                              height: 30.h,
                              width: 35.w,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(7.5),
                                color: const Color(0xFFFFFFFF),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.shade100,
                                    offset: const Offset(0, 2),
                                    blurRadius: 4.0,
                                    spreadRadius: 1.5,
                                  )
                                ],
                              ),
                              child: const Icon(Icons.add),
                            ),
                          ),
                        ],
                      )
                    : GestureDetector(
                        onTap: addToCart,
                        child: Center(
                          child: Container(
                            width: double.infinity,
                            height: 30.h,
                            decoration: BoxDecoration(
                              color: CustomColors.baseColor,
                              borderRadius: BorderRadius.circular(6.r),
                            ),
                            child: Center(
                              child: Text(
                                AppLocalizations.of(context)!.addToCart,
                                style: CustomTextStyles.regularText(
                                  14.sp,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ), // Add to Cart Button
          ],
        ),
      ),
    );
  }
}

class FeaturedRibbon extends StatelessWidget {
  const FeaturedRibbon({super.key, required this.title});
  final String title;
  @override
  Widget build(BuildContext context) {
    return Container(
      height: kIsWeb ? 18 : 18.h,
      decoration:  const BoxDecoration(

          image: DecorationImage(image: AssetImage(Images.featured))),
      // color: Colors.blue,
      padding: EdgeInsets.only(
          left: kIsWeb ? 8 : 8.w,
          bottom: kIsWeb ? 3 : 3.h,
          right: kIsWeb ? 12 : 12.w),
      child: Center(
        child: Text(
          title,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w500, fontSize: kIsWeb ? 9 : 9.14.sp),
        ),
      ),
    );
  }
}

class CartIconButton extends StatelessWidget {
  final String icon;
  final Color color;
  final VoidCallback onTap;

  const CartIconButton({
    super.key,
    required this.icon,
    this.color = Colors.grey,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        height: kIsWeb ? 30 : 30.h,
        width: kIsWeb ? 30 : 30.w,
        decoration: BoxDecoration(
          color: const Color(0xFFFFFFFF),
          borderRadius: BorderRadius.circular(5),
          border: Border.all(width: 0.43, color: const Color(0xFFEDEDED)),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.shade200,
              offset: const Offset(0, 2),
              blurRadius: 4.0,
              spreadRadius: 1.5,
            )
          ],
        ),
        child: Center(
          child: ImageIcon(
            AssetImage(icon),
            color: color,
            size: kIsWeb ? 14 : 14.sp,
          ),
        ),
      ),
    );
  }
}

class QuantityControl extends StatelessWidget {
  final int quantity;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;

  const QuantityControl({
    super.key,
    required this.quantity,
    required this.onIncrement,
    required this.onDecrement,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
          horizontal: kIsWeb ? 4 : 4.w, vertical: kIsWeb ? 4 : 4.h),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(kIsWeb ? 4 : 4.r),
        border: Border.all(width: kIsWeb ? 0.36 : 0.36.w, color: Colors.grey),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          InkWell(
            onTap: onDecrement,
            child: Container(
              padding: EdgeInsets.symmetric(
                  horizontal: kIsWeb ? 4 : 4.w, vertical: kIsWeb ? 4 : 4.h),
              margin: EdgeInsets.only(right: kIsWeb ? 4 : 4.w),
              decoration: BoxDecoration(
                color: const Color(0xFFDEE0E5),
                borderRadius: BorderRadius.circular(kIsWeb ? 3 : 3.r),
                border: Border.all(
                    width: kIsWeb ? 0.36 : 0.36.w, color: CustomColors.grey),
              ),
              child: const Icon(Icons.remove),
            ),
          ),
          SizedBox(
            width: kIsWeb ? 6 : 6.w,
          ),
          Text(
            quantity.toString(),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontSize: kIsWeb ? 14 : 14.sp,
                  fontWeight: FontWeight.w600,
                ),
          ),
          SizedBox(
            width: kIsWeb ? 6 : 6.w,
          ),
          InkWell(
            onTap: onIncrement,
            child: Container(
              padding: EdgeInsets.symmetric(
                  horizontal: kIsWeb ? 4 : 4.w, vertical: kIsWeb ? 4 : 4.h),
              margin: EdgeInsets.only(left: kIsWeb ? 4 : 4.w),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB),
                borderRadius: BorderRadius.circular(kIsWeb ? 3 : 3.r),
                border: Border.all(
                    width: kIsWeb ? 0.61 : 0.61.w,
                    color: const Color(0xFFDCDCDC)),
              ),
              child: const Icon(
                Icons.add,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ShimmerLoadingWidget extends StatelessWidget {
  const ShimmerLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey[200]!,
      highlightColor: Colors.grey[100]!,
      child: Padding(
        padding: EdgeInsets.symmetric(
            vertical: kIsWeb ? 8 : 8.0.h, horizontal: kIsWeb ? 16 : 16.0.w),
        child: Row(
          children: [
            Container(
              width: 80.0,
              height: 80.0,
              color: Colors.white,
            ),
            const SizedBox(width: 16.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    height: 16.0,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 8.0),
                  Container(
                    width: 150.0,
                    height: 16.0,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 8.0),
                  Container(
                    width: 100.0,
                    height: 16.0,
                    color: Colors.white,
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

class ProductCardShimmer extends StatelessWidget {
  const ProductCardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.all(4.sp),
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(width: 0.6, color: Colors.grey.shade300),
        color: Colors.white,
      ),
      child: Shimmer.fromColors(
          baseColor: Colors.grey.shade300,
          highlightColor: Colors.grey.shade100,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image placeholder
              Container(
                height: 135.h,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.r),
                  color: Colors.grey.shade300,
                ),
              ),
              SizedBox(height: 8.h),
              // Title placeholder
              Container(
                height: 10.h,
                width: 160.w,
                color: Colors.grey.shade300,
              ),
              SizedBox(height: 4.h),
              // Price placeholder
              Row(
                children: [
                  Container(
                      height: 8.h, width: 50.w, color: Colors.grey.shade300),
                  SizedBox(width: 8.w),
                  Container(
                      height: 8.h, width: 40.w, color: Colors.grey.shade300),
                ],
              ),
              SizedBox(height: 4.h),
              // Rating placeholder
              Row(
                children: [
                  Icon(Icons.star, color: Colors.grey.shade300, size: 16),
                  const SizedBox(width: 4),
                  Container(
                      height: 8.h, width: 40.w, color: Colors.grey.shade300),
                ],
              ),
              SizedBox(height: 6.h),
              // Button placeholder
              Container(
                height: 12.h,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ],
          )),
    );
  }
}

class CommonImage extends StatelessWidget {
  final String imageUrl;
  final double width;
  final double height;
  final BoxFit fit;
  final BorderRadius radius;

  const CommonImage({
    super.key,
    required this.imageUrl,
    required this.width,
    required this.height,
    this.fit = BoxFit.fill,
    this.radius = const BorderRadius.all(Radius.circular(8.0)),
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: radius,
      child: (imageUrl.isNotEmpty &&
              Uri.tryParse(imageUrl)?.hasAbsolutePath == true)
          ? Image.network(imageUrl,
              width: kIsWeb ? width : width.w,
              height: kIsWeb ? height : height.h,
              fit: fit, errorBuilder: (context, error, stackTrace) {
              return Image.asset(
                Images.noImage,
                width: kIsWeb ? width : width.w,
                height: kIsWeb ? height : height.h,
                fit: fit,
              );
            }, loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) {
                return child;
              }
              return Shimmer.fromColors(
                baseColor: Colors.grey.shade300,
                highlightColor: Colors.grey.shade100,
                child: Container(
                  width: kIsWeb ? width : width.w,
                  height: kIsWeb ? height : height.h,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(kIsWeb ? 8 : 8.r),
                  ),
                ),
              );
            })
          : Image.asset(
              Images.noImage,
              width: kIsWeb ? width : width.w,
              height: kIsWeb ? height : height.h,
              fit: fit,
            ),
    );
  }
}

class ContentCardShimmer extends StatelessWidget {
  const ContentCardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    final baseColor = Colors.grey.shade300;
    final highlightColor = Colors.grey.shade100;

    return Container(
      padding: EdgeInsets.symmetric(vertical: 8.h, horizontal: 8.w),
      width: MediaQuery.of(context).size.width,
      decoration: BoxDecoration(
        color: baseColor,
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Row(
        children: [
          SizedBox(width: 4.w),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Subtitle placeholder
                Shimmer.fromColors(
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                  child: Container(
                    height: 10.h,
                    width: 100.w,
                    color: baseColor,
                  ),
                ),
                SizedBox(height: 4.h),
                // Title placeholder
                Shimmer.fromColors(
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                  child: Container(
                    height: 18.h,
                    width: 180.w,
                    color: baseColor,
                  ),
                ),
                SizedBox(height: 8.h),
                // Description placeholder
                Shimmer.fromColors(
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                  child: Container(
                    height: 12.h,
                    width: 220.w,
                    color: baseColor,
                  ),
                ),
                SizedBox(height: 12.h),
                // Button placeholder
                Shimmer.fromColors(
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                  child: Container(
                    height: 24.h,
                    width: 80.w,
                    decoration: BoxDecoration(
                      color: baseColor,
                      borderRadius: BorderRadius.circular(18.r),
                    ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(width: 8.w),
          // Image placeholder
          ClipRRect(
            borderRadius: BorderRadius.circular(5.0),
            child: Shimmer.fromColors(
              baseColor: baseColor,
              highlightColor: highlightColor,
              child: Container(
                width: 150.w,
                height: 178.h,
                color: baseColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class StarRating extends StatelessWidget {
  final String rating;
  final double iconSize;
  final Color color;

  const StarRating({
    super.key,
    required this.rating,
    this.iconSize = 18.0,
    this.color = const Color(0xFFFB9927),
  });

  @override
  Widget build(BuildContext context) {
    // Convert rating to double
    double parsedRating = double.tryParse(rating) ?? 0.0;

    return Row(
      children: List.generate(5, (index) {
        if (index < parsedRating.floor()) {
          // Full stars
          return Icon(
            Icons.star,
            color: color,
            size: kIsWeb ? iconSize : iconSize.sp,
          );
        } else if (index < parsedRating) {
          // Half star
          return Icon(
            Icons.star_half,
            color: color,
            size: kIsWeb ? iconSize : iconSize.sp,
          );
        } else {
          // Empty stars
          return Icon(
            Icons.star_border,
            color: color,
            size: kIsWeb ? iconSize : iconSize.sp,
          );
        }
      }),
    );
  }
}
