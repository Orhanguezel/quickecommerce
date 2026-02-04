import 'dart:convert';


AllProductModel productResponseFromJson(String str) =>
    AllProductModel.fromJson(json.decode(str));

String productResponseToJson(AllProductModel data) => json.encode(data.toJson());

class AllProductModel {

  final String message;
  final List<ProductData>? data;
  final Meta? meta;
  AllProductModel({
    required this.message,
     this.data,
    this.meta,
  });

  factory AllProductModel.fromJson(Map<String, dynamic> json) => AllProductModel(
    message: json["messages"] ?? "",
    data: json["data"] != null
        ? List<ProductData>.from(json["data"].map((x) => ProductData.fromJson(x)))
        : [],
    meta: Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "messages": message,
    "products": List<dynamic>.from(data!.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}

class ProductData {
  final dynamic id;
  final Store? store;
  final dynamic storeId;
  final dynamic name;
  final dynamic slug;
  final dynamic description;
  final dynamic image;
  final dynamic imageUrl;
   dynamic wishlist;
  final dynamic rating;
  final dynamic reviewCount;
  final dynamic maxCartQty;
  final dynamic stock;
  final dynamic price;
  final dynamic specialPrice;
  final dynamic isFeatured;
  final List<SingleVariant>? singleVariant;
  final dynamic discountPercentage;
  final FlashSale? flashSale;
  final dynamic views;
  final dynamic category;
  ProductData({
     this.id,
     this.store,
     this.storeId,
     this.name,
     this.slug,
     this.description,
     this.image,
    this.imageUrl,
     this.wishlist,
     this.rating,
     this.reviewCount,
     this.maxCartQty,
     this.stock,
     this.price,
     this.specialPrice,
     this.singleVariant,
     this.isFeatured,
     this.discountPercentage,
    this.flashSale,
    this.views,
    this.category,
  });

  factory ProductData.fromJson(Map<String, dynamic> json) => ProductData(
    id: json["id"],
    store: json["store"]==null?null:Store.fromJson(json["store"]),
    storeId: json["store_id"],
    name: json["name"],
    slug: json["slug"],
    description: json["description"],
    image: json["image"],
    imageUrl: json["image_url"],
    wishlist: json["wishlist"],
    rating: json["rating"],
    reviewCount: json["review_count"],
    maxCartQty: json["max_cart_qty"],
    stock: json["stock"],
    price: json["price"],
    specialPrice: json["special_price"],
    isFeatured: json["is_featured"],
    singleVariant:json["singleVariant"]==null?null:List<SingleVariant>.from(json["singleVariant"].map((x) => SingleVariant.fromJson(x))),
    discountPercentage: json["discount_percentage"]?.toDouble(),
    flashSale: json["flash_sale"] == null ? null : FlashSale.fromJson(json["flash_sale"]),
    views: json["views"],
    category: json["category"],
  );



  Map<String, dynamic> toJson() => {
    "id": id,
    "store": store?.toJson(),
    "store_id": storeId,
    "name": name,
    "slug": slug,
    "description": description,
    "image": image,
    "image_url": imageUrl,
    "wishlist": wishlist,
    "rating": rating,
    "review_count": reviewCount,
    "max_cart_qty": maxCartQty,
    "stock": stock,
    "price": price,
    "special_price": specialPrice,
    "is_featured": isFeatured,
    "singleVariant": List<dynamic>.from(singleVariant!.map((x) => x.toJson())),
    "discount_percentage": discountPercentage,
    "flash_sale": flashSale?.toJson(),
    "views": views,
    "category": category,
  };
}

class FlashSale {
  final dynamic flashSaleId;
  final dynamic discountType;
  final dynamic discountAmount;
  final dynamic purchaseLimit;

  FlashSale({
    this.flashSaleId,
    this.discountType,
    this.discountAmount,
    this.purchaseLimit,
  });

  factory FlashSale.fromJson(Map<String, dynamic> json) => FlashSale(
    flashSaleId: json["flash_sale_id"],
    discountType:json["discount_type"],
    discountAmount: json["discount_amount"],
    purchaseLimit: json["purchase_limit"],
  );

  Map<String, dynamic> toJson() => {
    "flash_sale_id": flashSaleId,
    "discount_type":discountType,
    "discount_amount": discountAmount,
    "purchase_limit": purchaseLimit,
  };
}
class Store {
  final dynamic id;
  final dynamic areaId;
  final dynamic name;
  final dynamic slug;
  final dynamic phone;
  final dynamic email;
  final dynamic storeType;
  final dynamic logo;
  final dynamic tax;
  final dynamic deliveryTime;
  final dynamic rating;
  final dynamic additionalChargeName;
  final dynamic additionalChargeAmount;
  final dynamic additionalChargeType;
  final dynamic address;
  final dynamic latitude;
  final dynamic longitude;
  final dynamic type;
  final dynamic liveChat;

  Store({
    this.id,
    this.areaId,
    this.name,
    this.slug,
    this.phone,
    this.email,
    this.storeType,
    this.logo,
    this.tax,
    this.deliveryTime,
    this.rating,
    this.additionalChargeName,
    this.additionalChargeAmount,
    this.additionalChargeType,
    this.address,
    this.latitude,
    this.longitude,
    this.type,
    this.liveChat,
  });

  factory Store.fromJson(Map<String, dynamic> json) => Store(
    id: json["id"],
    areaId: json["area_id"],
    name: json["name"],
    slug: json["slug"],
    phone: json["phone"],
    email: json["email"],
    storeType: json["store_type"],
    logo: json["logo"],
    tax: json["tax"],
    deliveryTime: json["delivery_time"],
    rating: json["rating"],
    additionalChargeName: json["additional_charge_name"],
    additionalChargeAmount: json["additional_charge_amount"],
    additionalChargeType: json["additional_charge_type"],
    address: json["address"],
    latitude: json["latitude"],
    longitude: json["longitude"],
    type: json["type"],
    liveChat: json["live_chat"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "area_id": areaId,
    "name": name,
    "slug": slug,
    "phone": phone,
    "email": email,
    "store_type": storeType,
    "logo": logo,
    "tax": tax,
    "delivery_time": deliveryTime,
    "rating": rating,
    "additional_charge_name": additionalChargeName,
    "additional_charge_amount": additionalChargeAmount,
    "additional_charge_type": additionalChargeType,
    "address": address,
    "latitude": latitude,
    "longitude": longitude,
    "type": type,
    "live_chat": liveChat,
  };
}
class SingleVariant {
  final dynamic id;
  final dynamic productId;
  final dynamic variantSlug;
  final dynamic sku;
  final dynamic packQuantity;
  final dynamic weightMajor;
  final dynamic weightGross;
  final dynamic weightNet;
  final dynamic attributes;
  final dynamic price;
  final dynamic specialPrice;
  final dynamic stockQuantity;
  final dynamic unitId;
  final dynamic length;
  final dynamic width;
  final dynamic height;
  final dynamic image;
  final dynamic orderCount;
  final dynamic status;
  final dynamic deletedAt;
  final dynamic createdAt;
  final dynamic updatedAt;


  SingleVariant({
     this.id,
     this.productId,
     this.variantSlug,
     this.sku,
     this.packQuantity,
     this.weightMajor,
     this.weightGross,
     this.weightNet,
     this.attributes,
     this.price,
     this.specialPrice,
     this.stockQuantity,
     this.unitId,
     this.length,
     this.width,
     this.height,
     this.image,
     this.orderCount,
     this.status,
     this.deletedAt,
     this.createdAt,
     this.updatedAt,
  });

  factory SingleVariant.fromJson(Map<String, dynamic> json) => SingleVariant(
    id: json["id"],
    productId: json["product_id"],
    variantSlug: json["variant_slug"],
    sku: json["sku"],
    packQuantity: json["pack_quantity"],
    weightMajor: json["weight_major"],
    weightGross: json["weight_gross"],
    weightNet: json["weight_net"],
    attributes: json["attributes"],
    price: json["price"],
    specialPrice: json["special_price"],
    stockQuantity: json["stock_quantity"],
    unitId: json["unit_id"],
    length: json["length"],
    width: json["width"],
    height: json["height"],
    image: json["image"],
    orderCount: json["order_count"],
    status: json["status"],
    deletedAt: json["deleted_at"],
    createdAt: DateTime.parse(json["created_at"]),
    updatedAt: DateTime.parse(json["updated_at"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "product_id": productId,
    "variant_slug": variantSlug,
    "sku": sku,
    "pack_quantity": packQuantity,
    "weight_major": weightMajor,
    "weight_gross": weightGross,
    "weight_net": weightNet,
    "attributes": attributes,
    "price": price,
    "special_price": specialPrice,
    "stock_quantity": stockQuantity,
    "unit_id": unitId,
    "length": length,
    "width": width,
    "height": height,
    "image": image,
    "order_count": orderCount,
    "status": status,
    "deleted_at": deletedAt,
    "created_at": createdAt,
    "updated_at": updatedAt,
  };
}


class Meta {
  final dynamic currentPage;
  final dynamic lastPage;
  final dynamic perPage;
  final dynamic total;
  final dynamic from;
  final dynamic to;
  final Links? links;

  Meta({
    this.currentPage,
    this.lastPage,
    this.perPage,
    this.total,
    this.from,
    this.to,
    this.links,
  });

  factory Meta.fromJson(Map<String, dynamic> json) => Meta(
    currentPage: json["current_page"],
    lastPage: json["last_page"],
    perPage: json["per_page"],
    total: json["total"],
    from: json["from"],
    to: json["to"],
    links: Links.fromJson(json["links"]),
  );

  Map<String, dynamic> toJson() => {
    "current_page": currentPage,
    "last_page": lastPage,
    "per_page": perPage,
    "total": total,
    "from": from,
    "to": to,
    "links": links?.toJson(),
  };
}

class Links {
  final dynamic first;
  final dynamic last;
  final dynamic prev;
  final dynamic next;

  Links({
    this.first,
    this.last,
    this.prev,
    this.next,
  });

  factory Links.fromJson(Map<String, dynamic> json) => Links(
    first: json["first"],
    last: json["last"],
    prev: json["prev"],
    next: json["next"],
  );

  Map<String, dynamic> toJson() => {
    "first": first,
    "last": last,
    "prev": prev,
    "next": next,
  };
}


