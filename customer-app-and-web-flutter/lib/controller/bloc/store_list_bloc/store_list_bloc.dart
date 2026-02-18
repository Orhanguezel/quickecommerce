import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/data_model/store_list_model.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/product_repository.dart';
import 'store_list_event.dart';
import 'store_list_state.dart';

class StoreListBloc extends Bloc<StoreListEvent, StoreListState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<StoreData> storeData = [];
  StoreListBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(StoreListInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(StoreListConnectionErrorEvent());
        }
      },
    );

    //===============WishList portion================
    //--------------------------------------------
    on<StoreList>(
      (event, emit) async {
        emit(StoreListLoading());
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.storeList(
                event.storeType, event.isFeatured,event.topRated,event.language);

            //========== converting json to dart object ===========
            //-----------------------------------------------------


            StoreListModel storeDetailsModel = StoreListModel.fromJson(response.data);
            storeData.addAll(storeDetailsModel.data);
            if (response.statusCode == 200) {
              emit(StoreListLoaded(storeListModel: StoreListModel(
                  status: storeDetailsModel.status,
                  statusCode: storeDetailsModel.statusCode,
                  message: storeDetailsModel.message,
                  data: storeData
              )));
              storeData=[];
            } else if (response.statusCode == 204) {
              emit(StoreListLoaded(storeListModel: StoreListModel(
                  status: storeDetailsModel.status,
                  statusCode: storeDetailsModel.statusCode,
                  message: storeDetailsModel.message,
                  data:[]
              )));
              storeData=[];
            } else {
              emit(
                StoreListFailure(
                  storeListModel: StoreListModel(
                      status:false,
                      statusCode: 000,
                      message: "",
                      data: []
                  ),
                ),
              );
            }
          } on DioException catch (_) {
            emit(
               StoreListFailure(
                storeListModel: StoreListModel(
                    status:false,
                    statusCode: 000,
                    message: "",
                    data: []
                ),
              ),
            );
          }
        },
    );

    on<StoreListConnectionErrorEvent>(
          (event, emit) {
        if (state is StoreListLoaded) {
          final currentState = state as StoreListLoaded;
          emit(StoreListLoaded(
            storeListModel: currentState.storeListModel,
            hasConnectionError: true,
          ));
        } else {
          emit(StoreListConnectionError());
        }
      },
    );
  }
}
