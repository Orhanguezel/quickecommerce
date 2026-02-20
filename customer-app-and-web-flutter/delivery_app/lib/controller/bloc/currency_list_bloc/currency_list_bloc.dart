import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/config/strings.dart';
import 'package:quick_ecommerce/data/data_model/currency_list_model.dart';
import '../../../data/service/common_repository.dart';
import '../../../data/service/connectivity_repository.dart';
import 'currency_list_event.dart';
import 'currency_list_state.dart';

class CurrencyListBloc extends Bloc<CurrencyListEvent, CurrencyListState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  List<CurrencyData> currencyList = [];
  CurrencyListBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(CurrencyListInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(CurrencyListConnectionErrorEvent());
        }
      },
    );


    //===============WishList portion================
    //--------------------------------------------
    on<CurrencyList>(
          (event, emit) async {
        if (state is CurrencyListInitial ||
            state is CurrencyListLoading ||
            state is CurrencyListLoaded ||
            state is CurrencyListConnectionError ||
            state is CurrencyListFailure) {
          emit(
            CurrencyListLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.currencyList(event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            CurrencyListModel currencyListModel = CurrencyListModel.fromJson(response.data);
            if (response.statusCode == 200) {
              currencyList.addAll( currencyListModel.data!);
              emit(
                CurrencyListLoaded(currencyListModel:  CurrencyListModel(
                  data:currencyList,
                ),),
              );
              currencyList=[];
            }
            else {
              emit(
                const CurrencyListFailure(message: "Something went wrong"),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              CurrencyListFailure(
                message: errorMessage,
              ),
            );
          }
        }
      },
    );


    on<CurrencyListConnectionErrorEvent>(
      (event, emit) {
        if (state is CurrencyListInitial ||
            state is CurrencyListLoading ||
            state is CurrencyListLoaded ||
            state is CurrencyListConnectionError ||
            state is CurrencyListFailure) {
          emit(
            CurrencyListConnectionError(),
          );
        }
      },
    );
  }
}
