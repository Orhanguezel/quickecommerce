import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../config/strings.dart';
import '../../../data/data_model/address_model.dart';
import '../../../data/data_model/store_details_model.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'store_dtails_event.dart';
import 'store_dtails_state.dart';

class StoreDetailsBloc extends Bloc<StoreDetailsEvent, StoreDetailsState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  List<AddressListModel> addressData = [];
  StoreDetailsBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(StoreDetailsInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(StoreDetailsConnectionErrorEvent());
        }
      },
    );

    //===============WishList portion================
    //--------------------------------------------
    on<StoreDetails>(
      (event, emit) async {
        if (state is StoreDetailsInitial ||
            state is StoreDetailsLoading ||
            state is StoreDetailsLoaded ||
            state is StoreDetailsConnectionError ||
            state is StoreDetailsFailure) {
          emit(
            StoreDetailsLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.storeDetails(
                event.slug, event.token);

            //========== converting json to dart object ===========
            //-----------------------------------------------------


            StoreDetailsModel storeDetailsModel = StoreDetailsModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(StoreDetailsLoaded(storeDetailsModel: StoreDetailsModel(
                  status: storeDetailsModel.status,
                  statusCode: storeDetailsModel.statusCode,
                  message: storeDetailsModel.message,
                  data: storeDetailsModel.data
              )));
            } else if (response.statusCode == 204) {
              emit(StoreDetailsLoaded(storeDetailsModel: StoreDetailsModel(
                  status: storeDetailsModel.status,
                  statusCode: storeDetailsModel.statusCode,
                  message: storeDetailsModel.message,
                  data:Data()
              )));
            } else if (response.statusCode == 401) {
              emit(
                StoreDetailsTokenExp(),
              );
            } else {
              emit(
                 StoreDetailsFailure(
                  storeDetailsModel: StoreDetailsModel(
                      status:false,
                      statusCode: 000,
                      message: "",
                      data: Data()
                  ),
                ),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
               StoreDetailsFailure(
                storeDetailsModel: StoreDetailsModel(
                    status:false,
                    statusCode: 000,
                    message: errorMessage,
                    data: Data()
                ),
              ),
            );
          }
        }
      },
    );

    on<StoreDetailsConnectionErrorEvent>(
      (event, emit) {
        if (state is StoreDetailsLoaded) {
          final currentState = state as StoreDetailsLoaded;
          emit(StoreDetailsLoaded(
            storeDetailsModel: currentState.storeDetailsModel,
            hasConnectionError: true,
          ));
        } else {
          emit(StoreDetailsConnectionError());
        }

      },
    );
  }
}
