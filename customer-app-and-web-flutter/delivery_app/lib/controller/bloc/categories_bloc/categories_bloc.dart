
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../config/strings.dart';
import '../../../data/data_model/categories_model.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/product_repository.dart';
import 'categories_event.dart';
import 'categories_state.dart';

class CategoriesBloc extends Bloc<CategoriesEvent, CategoriesState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<CategoryData> categoryData = [];
  CategoriesBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(CategoriesInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(SaveConnectionErrorEvent());
        }
      },
    );
    bool isFetching = false;
    //===============Categories portion================
    //--------------------------------------------
    on<Categories>(
      (event, emit) async {
        if (isFetching) return;
        isFetching = true;

        if (state is CategoriesInitial ||
            state is CategoriesLoading ||
            state is CategoriesLoaded ||
            state is CategoriesConnectionError ||
            state is CategoriesFailure) {
          emit(
            CategoriesLoading(),
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

            if (response.data == null || response.data.isEmpty) {
              throw Exception("Empty or null response from API");
            }

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            CategoryModel categoryModel = CategoryModel.fromJson(response.data);
            if (response.statusCode == 200) {
              categoryData.addAll(categoryModel.data!);
              emit(
                CategoriesLoaded(categoryModel:  CategoryModel(
                  message: categoryModel.message,
                  data: categoryData,
                ),),
              );
              categoryData=[];
            }
            else if(response.statusCode == 204){
              emit(
                CategoriesLoaded(categoryModel:  CategoryModel(
                  message: categoryModel.message,
                  data: [],
                ),),
              );
              categoryData=[];
            }
            else {
              emit(
                CategoriesFailure(categoryModel: categoryModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              CategoriesFailure(
                categoryModel: CategoryModel(
                  message:errorMessage,
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

    on<SaveConnectionErrorEvent>(
      (event, emit) {
        if (state is CategoriesLoaded) {
          final currentState = state as CategoriesLoaded;
          emit(CategoriesLoaded(
            categoryModel: currentState.categoryModel,
            hasConnectionError: true,
          ));
        } else {
          emit(CategoriesConnectionError());
        }
      },
    );
  }
}
