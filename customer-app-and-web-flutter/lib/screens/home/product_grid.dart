import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/strings.dart';


import '../../controller/provider/cart_controler.dart';
import '../../controller/provider/currencie_controler.dart';
import '../../data/data_model/all_product_model.dart';
import '../../data/data_model/cart_model.dart';
import '../../router/route_name.dart';
import 'item_card.dart';

class ProductGrid extends StatelessWidget {
  final List<ProductData> productData;
  final ScrollPhysics physics;
  final ScrollController? controller;
  final int productLength;
  final void Function(bool? wishlist, String id) onFavoriteToggle;

  const ProductGrid({
    super.key,
    required this.productData,
    required this.onFavoriteToggle,
    required this.physics,
     this.productLength=0,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    var cartCon = Provider.of<CartProvider>(context);
    var currencyCon = Provider.of<CurrencyController>(context);
    return  GridView.builder(
      physics: physics,
      controller: controller,
      padding: EdgeInsets.zero,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2, // Two columns
        crossAxisSpacing: 0,
        mainAxisSpacing: 6.0,
        childAspectRatio: 0.5,
        mainAxisExtent: 320,
      ),
      itemCount:productLength>0?productLength: productData.length,
      itemBuilder: (context, index) {
        final data = productData[index];

        // --- price handling ---
        final bool isFlashSale = data.flashSale != null;
        final double price = Utils.formatDouble(data.price);
        final double spPrice = Utils.formatDouble(data.specialPrice);

        double flashSalePrice = 0;
        if (isFlashSale) {
          final result =
          Utils.flashSalePriceCalculate(price, spPrice, data.flashSale);
          flashSalePrice = Utils.formatDouble(result.flashSalePrice);
        } else {
          flashSalePrice =currencyCon.decimalPoint == "YES"?spPrice :spPrice.roundToDouble();
        }

        // --- build cart item widget ---
        return ItemCart(
          details: () {
            context.pushNamed(
              RouteNames.productDisplay,
              extra: {"slug": data.slug},
            );
          },
          addToCart: () {
            if (data.singleVariant!.isNotEmpty) {
              var variantId = data.singleVariant!.first.id;
              var stockQty = data.singleVariant!.first.stockQuantity;

              if (data.id != null && variantId != null) {
                final Map<String, dynamic> attributesMap =
                jsonDecode(data.singleVariant!.first.attributes);
                String finalPrice = isFlashSale
                    ? flashSalePrice.toString()
                    : spPrice > 0
                    ? Utils.formatString(data.specialPrice)
                    : Utils.formatString(data.price);
                cartCon.addToCart(
                  CartItem(
                    storeId:Utils.formatInt(data.storeId),
                    areaId: Utils.formatInt(data.store!.areaId),
                    flashSaleId: Utils.formatInt(data.flashSale?.flashSaleId),
                    storeName:Utils.formatString(data.store?.name),
                    storeTaxP:Utils.formatString( data.store?.tax),
                    chargeAmount:Utils.formatString(data.store?.additionalChargeAmount),
                    chargeType:Utils.formatString(data.store?.additionalChargeType),
                    productId: Utils.formatInt(data.id),
                    stock: stockQty,
                    variantId: variantId,
                    productName:Utils.formatString(data.name),
                    variant: attributesMap.entries
                        .map((e) => '${e.key}: ${e.value}')
                        .join(','),
                    price: finalPrice,
                    quantity: 1,
                    cartMaxQuantity: Utils.formatInt(data.maxCartQty),
                    image: Utils.formatString(data.imageUrl),
                  ),
                  context,
                );
              }
              cartCon.loadCartItems();
            } else {
              context.pushNamed(
                RouteNames.productDisplay,
                extra: {"slug": data.slug},
              );
            }
          },
          favorite: () {
            onFavoriteToggle(data.wishlist, data.id.toString());
          },
          compare: () {},
          imageUrl: Utils.formatString(data.imageUrl),
          title: Utils.formatString(data.name),
          originalPrice: isFlashSale && spPrice > 0
              ? Utils.formatString(data.specialPrice)
              : Utils.formatString(data.price),
          discountedPrice: isFlashSale
              ? flashSalePrice.toString()
              : Utils.formatString(data.specialPrice),
          rating: Utils.formatString(data.rating),
          reviewsCount: Utils.formatInt(data.reviewCount),
          stockCount: Utils.formatInt(data.stock),
          itemId: Utils.formatInt(data.id),
          isWishList: data.wishlist ?? false,
          isFlashSale: isFlashSale,
          isFeatured: data.isFeatured ?? false,
          discountPercent: data.discountPercentage,
        );
      },
    );

  }
}



class ProductLoadingGrid extends StatelessWidget {
  final int itemCount;
  const ProductLoadingGrid({
    super.key,
    required this.itemCount,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 0.0,
        mainAxisSpacing: 10.0,
        childAspectRatio: 0.5,
        mainAxisExtent: 316,
      ),
      itemCount: itemCount,
      itemBuilder:(context, index) {
        return const ProductCardShimmer();
      },
    );
  }
}
