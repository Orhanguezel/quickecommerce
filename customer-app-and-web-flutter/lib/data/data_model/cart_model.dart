import 'package:hive/hive.dart';

class CartItem {
  final dynamic id;
  final int storeId;
  final int areaId;
  final int flashSaleId;
  final String storeName;
  final String storeTaxP;
  final String chargeAmount;
  final String chargeType;
  final int productId;
  final int stock;
  final int variantId;
  final String productName;
  final String variant;
  final String price;
  final int quantity;
  final int cartMaxQuantity;
  final String image;

  CartItem( {
    this.id,
    required this.storeId,
    required this.areaId,
    required this.flashSaleId,
    required this.storeName,
    required this.storeTaxP,
    required this.chargeAmount,
    required this.chargeType,
    required this.productId,
    required this.stock,
    required this.variantId,
    required this.productName,
    required this.variant,
    required this.price,
    required this.quantity,
    required this.cartMaxQuantity,
    required this.image,
  });



  // Add copyWith method here:
  CartItem copyWith({
    int? quantity,
    // You can add more optional fields here if needed
  }) {
    return CartItem(
      id: id,
      storeId: storeId,
      areaId: areaId,
      flashSaleId: flashSaleId,
      storeName: storeName,
      storeTaxP: storeTaxP,
      chargeAmount: chargeAmount,
      chargeType: chargeType,
      productId: productId,
      stock: stock,
      variantId: variantId,
      productName: productName,
      variant: variant,
      price: price,
      quantity: quantity ?? this.quantity,
      cartMaxQuantity: cartMaxQuantity,
      image: image,
    );
  }
  // Factory constructor to create an instance from a Map
  factory CartItem.fromMap(Map<String, dynamic> map) {
    return CartItem(
      id: map['id'] ?? 0, // Default to 0 if null
      storeId: map['store_id'] ?? 0,
      areaId: map['area_id'] ?? 0,
      flashSaleId: map['flash_sale_id'] ?? 0,
      storeName: map['store_name'],
      storeTaxP: map['store_tax']??"",
      chargeAmount: map['charge_amount']??"",
      chargeType: map['charge_type']??"",
      productId: map['product_id'] ?? 0, // Default to 0 if null
      stock: map['stock'] ?? 0, // Default to 0 if null
      variantId: map['variant_id'] ?? 0, // Default to 0 if null
      productName: map['name'] ?? '', // Default to an empty string if null
      variant: map['variant'] ?? '', // Default to an empty string if null
      price: map['price'] ?? 0.0, // Default to 0.0 if null
      quantity: map['quantity'] ?? 0, // Default to 0 if null
      cartMaxQuantity: map['cart_max_quantity'] ?? 0, // Default to 0 if null
      image: map['image'] ?? '', // Default to an empty string if null
    );
  }


  // Method to convert an instance to a Map
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'store_id': storeId,
      'area_id': areaId,
      'flash_sale_id': flashSaleId,
      'store_name': storeName,
      'product_id': productId,
      'stock': stock,
      'store_tax': storeTaxP,
      'charge_amount': chargeAmount,
      'charge_type': chargeType,
      'variant_id': variantId,
      'name': productName,
      'variant': variant,
      'price': price,
      'quantity': quantity,
      'cart_max_quantity': cartMaxQuantity,
      'image': image,
    };
  }
}


@HiveType(typeId: 0)
class CartItems {
  @HiveField(0)
  final dynamic id;

  @HiveField(1)
  final int storeId;

  @HiveField(2)
  final int areaId;

  @HiveField(3)
  final int flashSaleId;

  @HiveField(4)
  final String storeName;

  @HiveField(5)
  final String storeTaxP;

  @HiveField(6)
  final String chargeAmount;

  @HiveField(7)
  final String chargeType;

  @HiveField(8)
  final int productId;

  @HiveField(9)
  final int stock;

  @HiveField(10)
  final int variantId;

  @HiveField(11)
  final String productName;

  @HiveField(12)
  final String variant;

  @HiveField(13)
  final String price;

  @HiveField(14)
  final int quantity;

  @HiveField(15)
  final int cartMaxQuantity;

  @HiveField(16)
  final String image;

  CartItems({
    this.id,
    required this.storeId,
    required this.areaId,
    required this.flashSaleId,
    required this.storeName,
    required this.storeTaxP,
    required this.chargeAmount,
    required this.chargeType,
    required this.productId,
    required this.stock,
    required this.variantId,
    required this.productName,
    required this.variant,
    required this.price,
    required this.quantity,
    required this.cartMaxQuantity,
    required this.image,
  });

  factory CartItems.fromMap(Map<String, dynamic> map) {
    return CartItems(
      id: map['id'] ?? 0,
      storeId: map['store_id'] ?? 0,
      areaId: map['area_id'] ?? 0,
      flashSaleId: map['flash_sale_id'] ?? 0,
      storeName: map['store_name'] ?? '',
      storeTaxP: map['store_tax'] ?? "",
      chargeAmount: map['charge_amount'] ?? "",
      chargeType: map['charge_type'] ?? "",
      productId: map['product_id'] ?? 0,
      stock: map['stock'] ?? 0,
      variantId: map['variant_id'] ?? 0,
      productName: map['name'] ?? '',
      variant: map['variant'] ?? '',
      price: map['price'] ?? '0.0',
      quantity: map['quantity'] ?? 0,
      cartMaxQuantity: map['cart_max_quantity'] ?? 0,
      image: map['image'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'store_id': storeId,
      'area_id': areaId,
      'flash_sale_id': flashSaleId,
      'store_name': storeName,
      'store_tax': storeTaxP,
      'charge_amount': chargeAmount,
      'charge_type': chargeType,
      'product_id': productId,
      'stock': stock,
      'variant_id': variantId,
      'name': productName,
      'variant': variant,
      'price': price,
      'quantity': quantity,
      'cart_max_quantity': cartMaxQuantity,
      'image': image,
    };
  }
}