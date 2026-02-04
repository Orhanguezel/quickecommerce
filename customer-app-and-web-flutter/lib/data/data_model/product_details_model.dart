import 'dart:convert';

import 'package:quick_ecommerce/data/data_model/all_product_model.dart';


ProductDetailsModel productResponseFromJson(String str) =>
    ProductDetailsModel.fromJson(json.decode(str));

String productResponseToJson(ProductDetailsModel data) =>
    json.encode(data.toJson());

class ProductDetailsModel {
  final String message;
  final Product data;
  final List<RelatedProduct>? relatedProducts;

  ProductDetailsModel({
    required this.message,
    required this.data,
    this.relatedProducts,
  });

  factory ProductDetailsModel.fromJson(Map<String, dynamic> json) =>
      ProductDetailsModel(
        message: json["messages"] ?? "",
        data: json["data"] != null ? Product.fromJson(json["data"]) : Product(),
        relatedProducts: json["related_products"] == null
            ? null
            : List<RelatedProduct>.from(json["related_products"]
                .map((x) => RelatedProduct.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "messages": message,
        "data": data.toJson(),
        "related_products":
            List<dynamic>.from(relatedProducts!.map((x) => x.toJson())),
      };
}

class Product {
  final dynamic id;
  final Store? store;
  final Category? category;
  final dynamic type;
  final dynamic behaviour;
  final dynamic name;
  final dynamic slug;
  final dynamic description;
  final dynamic image;
  final List<Variant>? variants;
  final dynamic status;
  final dynamic availableTimeStarts;
  final dynamic availableTimeEnds;
  final List<Translation>? translations;
  final Brand? brand;
  final Unit? unit;
  final dynamic tag;
  final dynamic imageUrl;
  final dynamic galleryImages;
  final dynamic galleryImagesUrls;
  final dynamic warranty;
  final dynamic returnInDays;
  final dynamic returnText;
  final dynamic allowChangeInMind;
  final dynamic cashOnDelivery;
  final dynamic deliveryTimeMin;
  final dynamic deliveryTimeMax;
  final dynamic deliveryTimeText;
  final dynamic maxCartQty;
  final dynamic orderCount;
  final dynamic views;
  final dynamic wishlist;
  final dynamic rating;
  final dynamic reviewCount;
  final List<Review>? reviews;
  final FlashSale? flashSale;
  final List<Specification>? specifications;
  Product({
    this.id,
    this.store,
    this.category,
    this.type,
    this.behaviour,
    this.name,
    this.slug,
    this.description,
    this.image,
    this.variants,
    this.status,
    this.availableTimeStarts,
    this.availableTimeEnds,
    this.translations,
    this.brand,
    this.unit,
    this.tag,
    this.imageUrl,
    this.galleryImages,
    this.galleryImagesUrls,
    this.warranty,
    this.returnInDays,
    this.returnText,
    this.allowChangeInMind,
    this.cashOnDelivery,
    this.deliveryTimeMin,
    this.deliveryTimeMax,
    this.deliveryTimeText,
    this.maxCartQty,
    this.orderCount,
    this.views,
    this.wishlist,
    this.rating,
    this.reviewCount,
    this.reviews,
    this.flashSale,
    this.specifications,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json["id"],
        store: json["store"] != null ? Store.fromJson(json["store"]) : Store(),
        category: json["category"] == null
            ? null
            : Category.fromJson(json["category"]),
        // brand: Brand.fromJson(json["brand"]),
        //unit: Unit.fromJson(json["unit"]),
        type: json["type"],
        behaviour: json["behaviour"],
        name: json["name"],
        slug: json["slug"],
        description: json["description"],
        image: json["image"],
        variants: List<Variant>.from(
            json["variants"].map((x) => Variant.fromJson(x))),
        status: json["status"],
        availableTimeStarts: json["available_time_starts"],
        availableTimeEnds: json["available_time_ends"],
        translations: json["translations"] == null
            ? null
            : List<Translation>.from(
                json["translations"].map((x) => Translation.fromJson(x))),
        brand:json["brand"]==null?null:Brand.fromJson(json["brand"]),
        unit:json["unit"]==null?null: Unit.fromJson(json["unit"]),
        tag: json["tag"],
        imageUrl: json["image_url"],
        galleryImages: json["gallery_images"],
        galleryImagesUrls: json["gallery_images_urls"],
        warranty: json["warranty"],
        returnInDays: json["return_in_days"],
        returnText: json["return_text"],
        allowChangeInMind: json["allow_change_in_mind"],
        cashOnDelivery: json["cash_on_delivery"],
        deliveryTimeMin: json["delivery_time_min"],
        deliveryTimeMax: json["delivery_time_max"],
        deliveryTimeText: json["delivery_time_text"],
        maxCartQty: json["max_cart_qty"],
        orderCount: json["order_count"],
        views: json["views"],
        wishlist: json["wishlist"],
        rating: json["rating"],
        reviewCount: json["review_count"],
    reviews: List<Review>.from(json["reviews"].map((x) => Review.fromJson(x))),
    flashSale: json["flash_sale"] == null ? null : FlashSale.fromJson(json["flash_sale"]),
    specifications: List<Specification>.from(json["specifications"].map((x) => Specification.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "store": store?.toJson(),
        "category": category?.toJson(),
        "type": type,
        "behaviour": behaviour,
        "name": name,
        "slug": slug,
        "description": description,
        "image": image,
        "variants": List<dynamic>.from(variants!.map((x) => x.toJson())),
        "status": status,
        "available_time_starts": availableTimeStarts,
        "available_time_ends": availableTimeEnds,
        "translations":
            List<dynamic>.from(translations!.map((x) => x.toJson())),
        "brand": brand!.toJson(),
        "unit": unit!.toJson(),
        "tag": tag,
        "image_url": imageUrl,
        "gallery_images": galleryImages,
        "gallery_images_urls": galleryImagesUrls,
        "warranty": warranty,
        "return_in_days": returnInDays,
        "return_text": returnText,
        "allow_change_in_mind": allowChangeInMind,
        "cash_on_delivery": cashOnDelivery,
        "delivery_time_min": deliveryTimeMin,
        "delivery_time_max": deliveryTimeMax,
        "delivery_time_text": deliveryTimeText,
        "max_cart_qty": maxCartQty,
        "order_count": orderCount,
        "views": views,
        "wishlist": wishlist,
        "rating": rating,
        "review_count": reviewCount,
    "reviews": List<dynamic>.from(reviews!.map((x) => x.toJson())),
    "flash_sale": flashSale?.toJson(),
    "specifications": List<dynamic>.from(specifications!.map((x) => x.toJson())),
      };
}
class Specification {
  final dynamic name;
  final dynamic value;

  Specification({
    this.name,
    this.value,
  });

  factory Specification.fromJson(Map<String, dynamic> json) => Specification(
    name: json["name"],
    value: json["value"],
  );

  Map<String, dynamic> toJson() => {
    "name": name,
    "value": value,
  };
}

class Review {
  final dynamic reviewId;
  final ReviewedBy? reviewedBy;
  final dynamic review;
  final dynamic rating;
  final dynamic likeCount;
  final dynamic dislikeCount;
  final dynamic reviewedAt;
  final dynamic liked;
  final dynamic disliked;

  Review({
     this.reviewId,
     this.reviewedBy,
     this.review,
     this.rating,
     this.likeCount,
     this.dislikeCount,
     this.reviewedAt,
     this.liked,
     this.disliked,
  });

  factory Review.fromJson(Map<String, dynamic> json) => Review(
    reviewId: json["review_id"],
    reviewedBy:ReviewedBy.fromJson(json["reviewed_by"]),
    review: json["review"],
    rating: json["rating"],
    likeCount: json["like_count"],
    dislikeCount: json["dislike_count"],
    reviewedAt: json["reviewed_at"],
    liked: json["liked"],
    disliked: json["disliked"],
  );

  Map<String, dynamic> toJson() => {
    "review_id": reviewId,
    "reviewed_by":reviewedBy?.toJson(),
    "review": review,
    "rating": rating,
    "like_count": likeCount,
    "dislike_count": dislikeCount,
    "reviewed_at": reviewedAt,
    "liked": liked,
    "disliked": disliked,
  };
}

class ReviewedBy {
  final dynamic name;
  final dynamic imageUrl;

  ReviewedBy({
     this.name,
     this.imageUrl,
  });

  factory ReviewedBy.fromJson(Map<String, dynamic> json) => ReviewedBy(
    name: json["name"],
    imageUrl: json["image_url"],
  );

  Map<String, dynamic> toJson() => {
    "name": name,
    "image_url": imageUrl,
  };
}
class RelatedProduct {
  final dynamic id;
  final dynamic store;
  final dynamic storeId;
  final dynamic areaId;
  final dynamic name;
  final dynamic slug;
  final dynamic description;
  final dynamic image;
  final dynamic imageUrl;
  final dynamic views;
  final List<SingleVariant>? singleVariant;
  final dynamic stock;
  final dynamic price;
  final dynamic specialPrice;
  final dynamic discountPercentage;
  final dynamic wishlist;
  final dynamic rating;
  final dynamic reviewCount;
  final FlashSale? flashSale;
  RelatedProduct({
    this.id,
    this.store,
    this.storeId,
    this.areaId,
    this.name,
    this.slug,
    this.description,
    this.image,
    this.imageUrl,
    this.views,
    this.singleVariant,
    this.stock,
    this.price,
    this.specialPrice,
    this.discountPercentage,
    this.wishlist,
    this.rating,
    this.reviewCount,
    this.flashSale,
  });

  factory RelatedProduct.fromJson(Map<String, dynamic> json) => RelatedProduct(
        id: json["id"],
        store: json["store"],
        storeId: json["store_id"],
    areaId: json["area_id"],
        name: json["name"],
        slug: json["slug"],
        description: json["description"],
        image: json["image"],
        imageUrl: json["image_url"],
        views: json["views"],
        singleVariant: json["singleVariant"] == null
            ? null
            : List<SingleVariant>.from(json["singleVariant"].map((x) => SingleVariant.fromJson(x))),
        stock: json["stock"],
        price: json["price"],
        specialPrice: json["special_price"],
        discountPercentage: json["discount_percentage"],
        wishlist: json["wishlist"],
        rating: json["rating"],
        reviewCount: json["review_count"],
    flashSale: json["flash_sale"] == null ? null : FlashSale.fromJson(json["flash_sale"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "store": store,
        "store_id": storeId,
        "area_id": areaId,
        "name": name,
        "slug": slug,
        "description": description,
        "image": image,
        "image_url": imageUrl,
        "views": views,
        "singleVariant": List<dynamic>.from(singleVariant!.map((x) => x)),
        "stock": stock,
        "price": price,
        "special_price": specialPrice,
        "discount_percentage": discountPercentage,
        "wishlist": wishlist,
        "rating": rating,
        "review_count": reviewCount,
    "flash_sale": flashSale?.toJson(),
      };
}

class Store {
  final dynamic id;
  final dynamic areaId;
  final dynamic storeType;
  final dynamic name;
  final dynamic slug;
  final dynamic phone;
  final dynamic email;
  final dynamic logo;
  final dynamic banner;
  final dynamic address;
  final dynamic latitude;
  final dynamic longitude;
  final dynamic tax;
  final dynamic vatTaxNumber;
  final dynamic metaTitle;
  final dynamic metaDescription;
  final dynamic metaImage;
  final dynamic totalProduct;
  final dynamic rating;
  final dynamic additionalChargeName;
  final dynamic additionalChargeAmount;
  final dynamic additionalChargeType;

  Store({
    this.id,
    this.areaId,
    this.storeType,
    this.name,
    this.slug,
    this.phone,
    this.email,
    this.logo,
    this.banner,
    this.address,
    this.latitude,
    this.longitude,
    this.tax,
    this.vatTaxNumber,
    this.metaTitle,
    this.metaDescription,
    this.metaImage,
    this.totalProduct,
    this.rating,
    this.additionalChargeName,
    this.additionalChargeAmount,
    this.additionalChargeType,
  });

  factory Store.fromJson(Map<String, dynamic> json) => Store(
        id: json["id"],
    areaId: json["area_id"],
        storeType: json["store_type"],
        name: json["name"],
        slug: json["slug"],
        phone: json["phone"],
        email: json["email"],
        logo: json["logo"],
        banner: json["banner"],
        address: json["address"],
        latitude: json["latitude"],
        longitude: json["longitude"],
        tax: json["tax"],
        vatTaxNumber: json["vat_tax_number"],
        metaTitle: json["meta_title"],
        metaDescription: json["meta_description"],
        metaImage: json["meta_image"],
        totalProduct: json["total_product"],
        rating: json["rating"], additionalChargeName: json["additional_charge_name"],
    additionalChargeAmount: json["additional_charge_amount"],
    additionalChargeType: json["additional_charge_type"],

      );

  Map<String, dynamic> toJson() => {
        "id": id,
    "area_id": areaId,
        "store_type": storeType,
        "name": name,
        "slug": slug,
        "phone": phone,
        "email": email,
        "logo": logo,
        "banner": banner,
        "address": address,
        "latitude": latitude,
        "longitude": longitude,
        "tax": tax,
        "vat_tax_number": vatTaxNumber,
        "meta_title": metaTitle,
        "meta_description": metaDescription,
        "meta_image": metaImage,
        "total_product": totalProduct,
        "rating": rating,
    "additional_charge_name": additionalChargeName,
    "additional_charge_amount": additionalChargeAmount,
    "additional_charge_type": additionalChargeType,
      };
}

class Category {
  final dynamic id;
  final dynamic categoryName;
  final dynamic categorySlug;

  Category({
    this.id,
    this.categoryName,
    this.categorySlug,
  });

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json["id"],
        categoryName: json["category_name"],
        categorySlug: json["category_slug"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "category_name": categoryName,
        "category_slug": categorySlug,
      };
}

class Brand {
  final dynamic value;
  final dynamic label;

  Brand({
    this.value,
    this.label,
  });

  factory Brand.fromJson(Map<String, dynamic> json) => Brand(
        value: json["value"],
        label: json["label"],
      );

  Map<String, dynamic> toJson() => {
        "value": value,
        "label": label,
      };
}

class Unit {
  final dynamic id;
  final dynamic label;
  final dynamic value;
  final dynamic order;

  Unit({
    this.id,
    this.label,
    this.value,
    this.order,
  });

  factory Unit.fromJson(Map<String, dynamic> json) => Unit(
        id: json["id"],
        label: json["label"],
        value: json["value"],
        order: json["order"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "label": label,
        "value": value,
        "order": order,
      };
}

class Variant {
  final dynamic id;
  final dynamic variantSlug;
  final dynamic packQuantity;
  final dynamic weightMajor;
  final dynamic weightGross;
  final dynamic weightNet;
  final dynamic color;
  final dynamic size;
  final dynamic price;
  final dynamic specialPrice;
  final dynamic stockQuantity;
  final dynamic productId;
  final dynamic sku;
  final Map<String, dynamic>? attributes;
  final dynamic unitId;
  final dynamic length;
  final dynamic width;
  final dynamic height;
  final dynamic image;
  final dynamic imageUrl;
  final dynamic orderCount;
  final dynamic status;

  Variant({
    this.id,
    this.variantSlug,
    this.packQuantity,
    this.weightMajor,
    this.weightGross,
    this.weightNet,
    this.color,
    this.size,
    this.price,
    this.specialPrice,
    this.stockQuantity,
    this.productId,
    this.sku,
    this.attributes,
    this.unitId,
    this.length,
    this.width,
    this.height,
    this.image,
    this.imageUrl,
    this.orderCount,
    this.status,
  });

  factory Variant.fromJson(Map<String, dynamic> json) => Variant(
        id: json["id"],
        variantSlug: json["variant_slug"],
        packQuantity: json["pack_quantity"],
        weightMajor: json["weight_major"],
        weightGross: json["weight_gross"],
        weightNet: json["weight_net"],
        color: json["color"],
        size: json["size"],
        price: json["price"],
        specialPrice: json["special_price"],
        stockQuantity: json["stock_quantity"],
        productId: json["product_id"],
        sku: json["sku"],
        attributes: json["attributes"] as Map<String, dynamic>?,
        unitId: json["unit_id"],
        length: json["length"],
        width: json["width"],
        height: json["height"],
        image: json["image"],
        imageUrl: json["image_url"],
        orderCount: json["order_count"],
        status: json["status"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "variant_slug": variantSlug,
        "pack_quantity": packQuantity,
        "weight_major": weightMajor,
        "weight_gross": weightGross,
        "weight_net": weightNet,
        "color": color,
        "size": size,
        "price": price,
        "special_price": specialPrice,
        "stock_quantity": stockQuantity,
        "product_id": productId,
        "sku": sku,
        "attributes": attributes,
        "unit_id": unitId,
        "length": length,
        "width": width,
        "height": height,
        "image": image,
        "image_url": imageUrl,
        "order_count": orderCount,
        "status": status,
      };
}

class Translation {
  final dynamic languageCode;
  final dynamic name;
  final dynamic metaTitle;
  final dynamic metaDescription;

  Translation({
    this.languageCode,
    this.name,
    this.metaTitle,
    this.metaDescription,
  });

  factory Translation.fromJson(Map<String, dynamic> json) => Translation(
        languageCode: json["language_code"],
        name: json["name"],
        metaTitle: json["meta_title"],
        metaDescription: json["meta_description"],
      );

  Map<String, dynamic> toJson() => {
        "language_code": languageCode,
        "name": name,
        "meta_title": metaTitle,
        "meta_description": metaDescription,
      };
}
