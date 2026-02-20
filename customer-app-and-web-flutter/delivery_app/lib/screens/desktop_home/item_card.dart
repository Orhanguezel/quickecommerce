import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/provider/currencie_controler.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_funcktion.dart';
import 'package:shimmer/shimmer.dart';
import '../../config/colors.dart';
import '../../config/icons.dart';
import '../../config/text_styles.dart';
import '../../controller/provider/cart_controler.dart';
import '../../data/data_model/cart_model.dart';
import '../../l10n/app_localizations.dart';
import '../home/item_card.dart';

class DesktopItemCart extends StatelessWidget {
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

  const DesktopItemCart({
    super.key,
    required this.imageUrl,
    required this.title,
    required this.originalPrice,
    required this.discountedPrice,
    required this.rating,
    required this.reviewsCount,
    required this.stockCount,
    required this.itemId,
     this.isFeatured=false,
     this.isFlashSale=false,
    required this.isWishList,
    required this.discountPercent,
     this.discountAmount='',
     this.discountType='',
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
    double disPrice=double.tryParse(discountedPrice)??0.0;
    return InkWell(
      onTap: details,
      child: Container(
        width: 250,
        margin: const EdgeInsets.all(4),
        padding: const EdgeInsets.symmetric(horizontal: 7.44, vertical: 6.78),
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
                      padding: const EdgeInsets.only(bottom: 20),
                      child: CommonImage(
                        imageUrl: imageUrl,
                        height: 180,
                        width: 230,
                      )),

                    Positioned(
                      top: 4,
                      left: -3,
                      child: Row(
                        children: [
                          if (isFeatured) const FeaturedRibbon(
                            title: "Featured",
                          ),
                          const SizedBox(width: 6,),
                          isFlashSale
                              ? Image.asset(
                            AssetsIcons.fsale,
                            height: 20,
                            width: 25,
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
                          if (discountPercent > 0 && isFlashSale==false)
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
                              child:discountType=="percentage"? Text(
                                "$discountAmount%",
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ):Text(
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
                          color:  isWishList ?const Color(0xFF1A73E8):Colors.grey,
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
                      fontSize: 14,
                      color: const Color(0xFF0F172A),
                      fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                // Price
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child:Row(
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
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                      ] else ...[
                        Text(
                          currencyCon.formatCurrency(originalPrice),
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                      ],
                    ],
                  )
                  ,
                ),
                const SizedBox(height: 4),
                // Rating and Reviews
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      const Icon(Icons.star, color: Colors.orange, size: 14),
                      const SizedBox(
                        width: 4,
                      ),
                      Text(
                        "$rating ($reviewsCount)",
                        style: Theme.of(context)
                            .textTheme
                            .displayLarge
                            ?.copyWith(
                                fontSize: 9,
                                color: const Color(0xFF585858),
                                fontWeight: FontWeight.w400),
                      ),
                      // const Spacer(),
                      const SizedBox(
                        width: 4,
                      ),
                      const Icon(Icons.store_outlined,
                          color: Colors.green, size: 14),
                      const SizedBox(
                        width: 4,
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
                                      fontSize: 12,
                                      fontWeight: FontWeight.w400),
                            )
                          : Text(
                              AppLocalizations.of(context)!.outOfStock,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context)
                                  .textTheme
                                  .labelLarge
                                  ?.copyWith(
                                      fontSize: 12,
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
                      height: 36,
                      decoration: BoxDecoration(
                        color: const Color(0xFFA7BACD),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Center(
                        child: Text(
                          AppLocalizations.of(context)!.addToCart,
                          style: CustomTextStyles.regularText(
                            14,
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
                            onTap:  () {
                              if (existingItem!.productId > 0) {
                                if (existingItem.quantity > 1) {
                                  cartCon.updateQuantity(
                                      existingItem.productId, existingItem.quantity - 1);
                                }
                              }
                            },
                                child: Container(
                                    height: 30,
                                    width: 35,
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
                                  height: 30,
                                  width: 35,
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
                                    fontSize: 16,
                                    color: Colors.black,
                                    fontWeight: FontWeight.w600),
                          ),
                          InkWell(
                            onTap: () {

                              if (existingItem != null && existingItem.productId > 0) {
                                int updatedQuantity = existingItem.quantity + 1;
                                if (existingItem.cartMaxQuantity > 0 && updatedQuantity > existingItem.cartMaxQuantity) {
                                  // Stock limit reached
                                  CommonFunctions.showCustomSnackBar(context,
                                      "${AppLocalizations.of(context)!.maximumAllowedQuantity} ${existingItem.cartMaxQuantity}");
                                } else {
                                  // Update quantity (either unlimited or within max limit)
                                  cartCon.updateQuantity(existingItem.productId, updatedQuantity);
                                }
                              }
                            },
                            child: Container(
                              height: 30,
                              width: 35,
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
                              child:const Icon(Icons.add),
                            ),
                          ),
                        ],
                      )
                    : GestureDetector(
                        onTap: addToCart,
                        child: Center(
                          child: Container(
                            width: double.infinity,
                            height: 30,
                            decoration: BoxDecoration(
                              color:CustomColors.baseColor,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Center(
                              child: Text(
                                AppLocalizations.of(context)!.addToCart,
                                style: CustomTextStyles.regularText(
                                  14,
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


class DesktopQuantityControl extends StatelessWidget {
  final int quantity;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;

  const DesktopQuantityControl({
    super.key,
    required this.quantity,
    required this.onIncrement,
    required this.onDecrement,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      //margin: EdgeInsets.only(top: 6.h),
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4),
        border: Border.all(width: 0.36.w, color: Colors.grey),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          InkWell(
            onTap: onDecrement,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal:4, vertical: 4),
              margin: const EdgeInsets.only(right: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFDEE0E5),
                borderRadius: BorderRadius.circular(3.r),
                border: Border.all(
                    width: 0.36,
                    color: CustomColors.grey),
              ),
              child: const Icon(Icons.remove),
            ),
          ),
          SizedBox(
            width: 10.w,
          ),
          Text(
            quantity.toString(),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(
            width: 10,
          ),
          InkWell(
            onTap: onIncrement,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal:4, vertical: 4),
              margin: const EdgeInsets.only(left: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB),
                borderRadius: BorderRadius.circular(3.r),
                border: Border.all(
                    width: 0.61,
                    color: const Color(0xFFDCDCDC)),
              ),
              child: const Icon(Icons.add,
              color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}


class DesktopShimmerLoadingWidget extends StatelessWidget {
  const DesktopShimmerLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey[200]!,
      highlightColor: Colors.grey[100]!,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
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

class DesktopProductCardShimmer extends StatelessWidget {
  const DesktopProductCardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(4),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
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
                height: 135,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey.shade300,
                ),
              ),
              const SizedBox(height: 8),
              // Title placeholder
              Container(
                height: 10,
                width: 160,
                color: Colors.grey.shade300,
              ),
              const SizedBox(height: 4),
              // Price placeholder
              Row(
                children: [
                  Container(
                      height: 8, width: 45, color: Colors.grey.shade300),
                  const SizedBox(width: 8),
                  Container(
                      height: 8, width: 40, color: Colors.grey.shade300),
                ],
              ),
              const SizedBox(height: 4),
              // Rating placeholder
              Row(
                children: [
                  Icon(Icons.star, color: Colors.grey.shade300, size: 16),
                  const SizedBox(width: 4),
                  Container(
                      height: 8, width: 40, color: Colors.grey.shade300),
                ],
              ),
              const SizedBox(height: 6),
              // Button placeholder
              Container(
                height: 12,
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




class CarouselShimmer extends StatelessWidget {
  const CarouselShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    final baseColor = Colors.grey.shade300;
    final highlightColor = Colors.grey.shade100;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
      width: MediaQuery.of(context).size.width,
      decoration: BoxDecoration(
        color: baseColor,
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Row(
        children: [
          const SizedBox(width: 4),
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
                    height: 10,
                    width: 100,
                    color: baseColor,
                  ),
                ),
                SizedBox(height: 4.h),
                // Title placeholder
                Shimmer.fromColors(
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                  child: Container(
                    height: 18,
                    width: 180,
                    color: baseColor,
                  ),
                ),
                const SizedBox(height: 8),
                // Description placeholder
                Shimmer.fromColors(
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                  child: Container(
                    height: 12,
                    width: 220,
                    color: baseColor,
                  ),
                ),
                const SizedBox(height: 12),
                // Button placeholder
                Shimmer.fromColors(
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                  child: Container(
                    height: 24,
                    width: 80,
                    decoration: BoxDecoration(
                      color: baseColor,
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          // Image placeholder
          ClipRRect(
            borderRadius: BorderRadius.circular(5.0),
            child: Shimmer.fromColors(
              baseColor: baseColor,
              highlightColor: highlightColor,
              child: Container(
                width: 150,
                height: 178,
                color: baseColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}



