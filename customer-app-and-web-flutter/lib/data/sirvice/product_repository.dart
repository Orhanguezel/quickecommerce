import 'package:dio/dio.dart';

import '../../config/api_urls.dart';

class ProductRepository {
  final Dio _dio = Dio();
  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> categories(String limit, String language, String searchKey,
      String sortField, String sort, bool all) {
    final response = _dio.get(
      ApiUrls.categoryListUrl(),
      queryParameters: {
        "limit": limit,
        "language": language,
        "search": searchKey,
        "sortField": sortField,
        "sort": sort,
        "all": all,
      },
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> categoriesProduct(
    String categoryId,
    String perPage,
    String minPrice,
    String maxPrice,
    String brandId,
    String availability,
    String sort,
  ) {
    final response = _dio.get(
      ApiUrls.categoryProductUrl(),
      queryParameters: {
        "category_id": categoryId,
        "per_page": perPage,
        "min_price": minPrice,
        "max_price": maxPrice,
        "brand_id": brandId,
        "availability": availability,
        "sort": sort
      },
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> allProduct(
    List categoryId,
    String search,
    String perPage,
    int page,
    String minPrice,
    String maxPrice,
    List brandId,
    String availability,
    String sort,
    List type,
    String minRating,
    String language,
      bool isFeatured,
      bool bestSelling,
      bool popularProducts,
    bool flashSale,
    int flashSaleId,
      String userLat,
      String userLong,
    String token,
  ) {
    final queryParams = {
      "language": language.isEmpty ? "en" : language,
      "category_id": categoryId.isEmpty ? [] : categoryId,
      "search": search.isEmpty ? "" : search,
      "per_page": perPage.isEmpty ? "" : perPage,
      "page": page > 1 ? page : 1,
      "min_price": minPrice.isEmpty ? "" : minPrice,
      "max_price": maxPrice.isEmpty ? "" : maxPrice,
      "brand_id": brandId.isEmpty ? [] : brandId,
      "availability": availability.isEmpty ? "" : availability,
      "sort": sort.isEmpty ? "" : sort,
      "type": type.isEmpty ? [] : type,
      "min_rating": minRating.isEmpty ? "" : minRating,
      "is_featured": isFeatured,
      "best_selling": bestSelling,
      "popular_products": popularProducts,
      "flash_sale": flashSale,
      "flash_sale_id": flashSaleId > 0 ? flashSaleId : 0,
      "radius": 100,
    };
    final response = _dio.post(
      ApiUrls.allProductUrl(),
      data: queryParams,
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "X-User-Latitude": userLat,
          "X-User-Longitude": userLong,
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  Future<Response> productsSuggestion(
    String query,
    String language,
  ) {
    final response = _dio.get(
      ApiUrls.productSuggestionUrl(),
      data: {"query": query, "language": language},
    );
    return response;
  }

  Future<Response> keywordSuggestion(
    String query,
    String language,
  ) {
    final response = _dio.get(
      ApiUrls.keywordSuggestionUrl(),
      data: {
        "query": query,
        "language": language,
      },
    );
    return response;
  }

  Future<Response> popularProducts(
    String id,
    String categoryId,
    String brandId,
    String perPage,
    String language,
      String userLat,
      String userLong,
    String token,
  ) {
    final response = _dio.get(
      ApiUrls.popularProductsUrl(),
      queryParameters: {
        "id": id,
        "category_id": categoryId,
        "brand_id": brandId,
        "per_page": perPage,
        "language": language,
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
          "X-User-Latitude": userLat,
          "X-User-Longitude": userLong,
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  Future<Response> featuredProducts(
    String perPage,
    String language,
      String userLat,
      String userLong,
    String token,
  ) {
    final response = _dio.get(
      ApiUrls.featuredProductsUrl(),
      queryParameters: {
        "per_page": perPage,
        "language": language,
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
          "X-User-Latitude": userLat,
          "X-User-Longitude": userLong,
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> productDetails(
    String slug,
    String language,
    String token,
  ) {
    final response = _dio.get(
      ApiUrls.productDetailsUrl(slug),
      queryParameters: {
        "language": language,
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }




  Future<Response> newArrivals(
    String categoryId,
    String minPrice,
    String maxPrice,
    String availability,
    String perPage,
    String language,
      String userLat,
      String userLong,
    String token,
  ) async {
    try {
      // Make the API request and await the response
      final response = await _dio.get(
        ApiUrls.newArrivalsUrl(),
        queryParameters: {
          "category_id": categoryId,
          "min_price": minPrice,
          "max_price": maxPrice,
          "availability": availability,
          "per_page": perPage,
          "language": language
        },
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Vary': 'Accept',
            "Authorization": 'Bearer $token',
            "X-User-Latitude": userLat,
            "X-User-Longitude": userLong,
          },
          followRedirects: false,
        ),
      );
      return response;
    } on DioException catch (_) {
      rethrow;
    } catch (e) {
      rethrow;
    }
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> bestSale(
    String id,
    String categoryId,
    String brandId,
    String limit,
    String language,
      String userLat,
      String userLong,
    String token,
  ) {
    final response = _dio.get(
      ApiUrls.bestSaleUrl(),
      queryParameters: {
        "id": "",
        "category_id": "",
        "brand_id": "",
        "limit": "4",
        "language": language
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
          "X-User-Latitude": userLat,
          "X-User-Longitude": userLong,
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> topDeal(
    String id,
    String categoryId,
    String minPrice,
    String maxPrice,
    String brandId,
    String availability,
    String sort,
    String dateFilter,
    String perPage,
    String language,
      String userLat,
      String userLong,
    String token,
  ) {
    final response = _dio.post(
      ApiUrls.topDealUrl(),
      data: {
        "id": id,
        "category_id": categoryId,
        "min_price": minPrice,
        "max_price": maxPrice,
        "brand_id": brandId,
        "availability": availability, // 0 = not-available, 1 = available
        "sort": sort, // price_low_high, price_high_low, newest
        "date_filter": dateFilter, // today, last_week, last_month
        "per_page": perPage,
        "language": language
      },
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
          "X-User-Latitude": userLat,
          "X-User-Longitude": userLong,
        },
        followRedirects: false,
      ),
    );

    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> topRated(
    String id,
    String perPage,
    int page,
    String language,
      String userLat,
      String userLong,
    String token,
  ) {
    final response = _dio.get(
      ApiUrls.topRatedUrl(),
      queryParameters: {"id": id, "per_page": perPage, "page": page, "language": language},
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> topDealProductDetails(
    String id,
    String categoryId,
    String minPrice,
    String maxPrice,
    String brandId,
    String availability,
    String sort,
    String dateFilter,
    String perPage,
  ) {
    final response = _dio.post(
      ApiUrls.topDealUrl(),
      data: {
        "id": id,
        "category_id": categoryId,
        "min_price": minPrice,
        "max_price": maxPrice,
        "brand_id": brandId,
        "availability": availability, // 0 = not-available, 1 = available
        "sort": sort, // price_low_high, price_high_low, newest
        "date_filter": dateFilter, // today, last_week, last_month
        "per_page": perPage
      },
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> wishList(String token) {
    final response = _dio.get(
      ApiUrls.wishListUrl(),
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> brandId() {
    final response = _dio.get(
      ApiUrls.brandListUrl(),
    );
    return response;
  }

  Future<Response> maintenanceSettings() {
    final response = _dio.get(
      ApiUrls.pageSettingsUrl(),
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> storeType() {
    final response = _dio.get(
      ApiUrls.storeTypesUrl(),
    );
    return response;
  }

  /// this function is responsible for change email into the app
  /// it needs [userName] and [password] for calling login api
  /// both of them are required parameters.
  Future<Response> sliderList(String language) {
    final response = _dio.get(
      ApiUrls.sliderListUrl(),
      queryParameters: {
        "platform":"mobile",
        "language":language,
      }
    );
    return response;
  }

  /// this function is responsible for banner List into the app
  /// it needs [language]  for calling banner List api
  /// both of them are required parameters.
  Future<Response> bannerList(String language) {
    final response =
        _dio.get(ApiUrls.bannerListUrl(), queryParameters: {"language": language});

    return response;
  }

  /// this function is responsible for flash Deals into the app
  /// both of them are required parameters.
  Future<Response> flashDeals() {
    final response = _dio.get(
      ApiUrls.flashDealsUrl(),
    );
    return response;
  }

  /// this function is responsible for flash Deals into the app
  /// both of them are required parameters.
  Future<Response> flashProducts(
      String perPage, int page, String language, String token) {
    final response = _dio.get(
      ApiUrls.flashDealProductsUrl(),
      queryParameters: {"per_page": perPage, "page": page, "language": language},
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  /// this function is responsible for trending Product into the app
  /// it needs [id] and [perPage]  for calling banner List api
  /// both of them are required parameters.
  Future<Response> trendingProduct(
    String id,
    String perPage,
    int page,
    String language,
    String token,
  ) {
    final response = _dio.get(
      ApiUrls.trendingProductsUrl(),
      queryParameters: {"id": id, "per_page": perPage, "page": page, "language": language},
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  /// this function is responsible for trending Product into the app
  /// it needs [id] and [perPage]  for calling banner List api
  /// both of them are required parameters.
  Future<Response> weekBestProducts(
    String id,
    String perPage,
    int page,
    String language,
    String token,
  ) {
    final response = _dio.get(
      ApiUrls.weekBestProductsUrl(),
      queryParameters: {"id": id, "per_page": perPage, "page": page, "language": language},
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Vary': 'Accept',
          "Authorization": 'Bearer $token',
        },
        followRedirects: false,
      ),
    );
    return response;
  }

  Future<Response> storeList(
      String storeType, String isFeatured, bool topRated, String language) {
    final response = _dio.get(
      ApiUrls.storeListUrl(),
      queryParameters: {
        "store_type": storeType,
        "is_featured": isFeatured,
        "top_rated": topRated,
        "language": language
      },
    );
    return response;
  }
}
