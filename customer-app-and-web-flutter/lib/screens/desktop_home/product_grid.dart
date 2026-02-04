import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/strings.dart';
import 'package:quick_ecommerce/controller/provider/cart_controler.dart';
import 'package:quick_ecommerce/data/data_model/all_product_model.dart';
import 'package:quick_ecommerce/data/data_model/cart_model.dart';
import 'package:quick_ecommerce/router/route_name.dart';

import '../../controller/provider/currencie_controler.dart';
import 'item_card.dart';




class DesktopProductLoadingGrid extends StatelessWidget {
  final int itemCount;
  const DesktopProductLoadingGrid({
    super.key,
    required this.itemCount,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const double itemWidth = 200.0;
        int crossAxisCount = ((constraints.maxWidth ) / (itemWidth)).floor();
        if (crossAxisCount < 2) crossAxisCount = 2;
        return GridView.builder(
          shrinkWrap: true,
          itemCount:itemCount,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: 2,
            mainAxisSpacing: 10.0,
            childAspectRatio: 0.5,
            mainAxisExtent: 316,
          ),
          itemBuilder: (context, index) {
            return const DesktopProductCardShimmer();
          },
        );
      },
    );


  }
}

class DesktopProductGrid extends StatelessWidget {
  final List<ProductData> productData;
  final ScrollPhysics physics;
  final int productLength;
  final ScrollController? controller;
  final void Function(bool? wishlist, String id) onFavoriteToggle;

  const DesktopProductGrid({
    super.key,
    required this.productData,
    this.productLength=0,
    required this.physics,
    this.controller,
    required this.onFavoriteToggle,
  });

  @override
  Widget build(BuildContext context) {
    var cartCon = Provider.of<CartProvider>(context);
    var currencyCon = Provider.of<CurrencyController>(context);
    return LayoutBuilder(
      builder: (context, constraints) {
       const double itemWidth = 200.0;
        int crossAxisCount = ((constraints.maxWidth ) / (itemWidth)).floor();
        if (crossAxisCount < 2) crossAxisCount = 2;
        return GridView.builder(
          physics: physics,
          shrinkWrap: true,
          controller: controller,
          padding: EdgeInsets.zero,
          itemCount:productLength>0?productLength: productData.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: 2,
            mainAxisSpacing: 10.0,
            childAspectRatio: 0.5,
            mainAxisExtent: 316,
          ),
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

            return DesktopItemCart(
              details: () {
                context.pushNamed(
                  RouteNames.desktopProductDisplay,
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
                }
                else {
                  context.pushNamed(
                    RouteNames.desktopProductDisplay,
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
      },
    );
  }
}
