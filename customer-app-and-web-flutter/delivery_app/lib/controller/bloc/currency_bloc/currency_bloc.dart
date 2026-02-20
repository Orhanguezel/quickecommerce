import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../data/data_model/currencies_info_model.dart';
import '../../../data/service/common_repository.dart';
import '../../../data/service/connectivity_repository.dart';
import 'currency_event.dart';
import 'currency_state.dart';

class CurrencyBloc extends Bloc<CurrencyEvent, CurrencyState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  CurrencyBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(CurrencyInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(CurrencyConnectionErrorEvent());
        }
      },
    );


    //===============WishList portion================
    //--------------------------------------------
    on<Currency>(
          (event, emit) async {
        if (state is CurrencyInitial ||
            state is CurrencyLoading ||
            state is CurrencyLoaded ||
            state is CurrencyConnectionError ||
            state is CurrencyFailure) {
          emit(
            CurrencyLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.currencyInfo(event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            CurrenciesModel favoritesModel = CurrenciesModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                CurrencyLoaded(currenciesModel:  CurrenciesModel(
                  currenciesInfo: favoritesModel.currenciesInfo,
                ),),
              );
            } else if(response.statusCode == 204){
              emit(
                CurrencyLoaded(currenciesModel:  CurrenciesModel(
                  currenciesInfo: favoritesModel.currenciesInfo,
                  // pagination:
                ),),
              );
            }
            else {
              emit(
                CurrencyFailure(currenciesModel: favoritesModel),
              );
            }
          } on DioException catch (_) {
            emit(
              CurrencyFailure(
                currenciesModel: CurrenciesModel(
                  currenciesInfo: CurrenciesInfo(),
                ),
              ),
            );
          }
        }
      },
    );


    on<CurrencyConnectionErrorEvent>(
      (event, emit) {
        if (state is CurrencyInitial ||
            state is CurrencyLoading ||
            state is CurrencyLoaded ||
            state is CurrencyConnectionError ||
            state is CurrencyFailure) {
          emit(
            CurrencyConnectionError(),
          );
        }
      },
    );
  }
}
