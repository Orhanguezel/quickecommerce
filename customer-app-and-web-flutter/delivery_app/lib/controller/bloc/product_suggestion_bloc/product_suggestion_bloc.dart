
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/data_model/categories_model.dart';
import '../../../data/data_model/product_suggestion.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/product_repository.dart';
import 'product_suggestion_event.dart';
import 'product_suggestion_state.dart';

class ProductSuggestionBloc extends Bloc<ProductSuggestionEvent,ProductSuggestionState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<CategoryData> categoryData = [];
  ProductSuggestionBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(ProductSuggestionInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(ProductSuggestionConnectionErrorEvent());
        }
      },
    );


    bool isFetching = false; // Add a flag to track API calls

    on<CategoriesList>(
          (event, emit) async {
        if (isFetching) return; // Prevent duplicate calls
        isFetching = true;
        if (state is ProductSuggestionInitial ||
            state is ProductSuggestionLoading ||
            state is CategoriesListLoaded ||
            state is ProductSuggestionConnectionError ||
            state is ProductSuggestionFailure) {
          emit(
            ProductSuggestionLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.categories(
                event.limit,
                event.language,
                event.searchKey,
                event.sortField,
                event.sort,
                event.all
            );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            CategoryModel categoryModel = CategoryModel.fromJson(response.data);
            if (response.statusCode == 200) {
              categoryData.addAll(categoryModel.data!);
              emit(
                CategoriesListLoaded(categoryModel:  CategoryModel(
                  data: categoryData,
                  message:categoryModel.message,
                  // pagination:
                ),),
              );
              categoryData=[];
            }
            else {
              emit(
                ProductSuggestionFailure(productSuggestionModel:  ProductSuggestionModel(
                  data: [],
                ),
                ),
              );
            }
          }on DioException  catch (_) {
            emit(
              ProductSuggestionFailure(
                productSuggestionModel: ProductSuggestionModel(
                  data: [],
                ),
              ),
            );
          }finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );




    on<ProductSuggestionConnectionErrorEvent>(
      (event, emit) {
        if (state is ProductSuggestionInitial ||
            state is ProductSuggestionLoading ||
            state is ProductSuggestionLoaded ||
            state is ProductSuggestionConnectionError ||
            state is ProductSuggestionFailure) {
          emit(
            ProductSuggestionConnectionError(),
          );
        }
      },
    );
  }
}


