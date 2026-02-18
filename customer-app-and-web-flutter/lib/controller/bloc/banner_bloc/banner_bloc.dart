import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../data/data_model/banner_list_model.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/product_repository.dart';
import 'banner_event.dart';
import 'banner_state.dart';

class BannerBloc extends Bloc<BannerEvent,BannerState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<BannerData> bannerData = [];
  BannerBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(BannerInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(MoveToLoveConnectionErrorEvent());
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<BannerList>(
      (event, emit) async {
        if (state is BannerInitial ||
            state is BannerLoading ||
            state is BannerLoaded ||
            state is BannerConnectionError ||
            state is BannerFailure) {
          emit(
            BannerLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.bannerList(
                event.language,
                );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            BannerListModel newArrivalModel = BannerListModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              bannerData.addAll(newArrivalModel.data);
              emit(
                BannerLoaded(bannerListModel:  BannerListModel(
                  data: bannerData,
                 // pagination:
                ),),
              );
              bannerData=[];
            }
            else if(response.statusCode == 204){
              emit(
                BannerLoaded(bannerListModel:  BannerListModel(
                  data: [],
                  // pagination:
                ),),
              );
              bannerData=[];
            }
            else {
              emit(
                BannerFailure(bannerListModel: newArrivalModel),
              );
            }
          } on DioException catch (_) {
            emit(
              BannerFailure(
                bannerListModel: BannerListModel(
                 data: [],
                ),
              ),
            );
          }
        }
      },
    );

    on<MoveToLoveConnectionErrorEvent>(
      (event, emit) {
        if (state is BannerLoaded) {
          final currentState = state as BannerLoaded;
          emit(BannerLoaded(
            bannerListModel: currentState.bannerListModel,
            hasConnectionError: true,
          ));
        }
        else {
          emit(BannerConnectionError ());
        }
      },
    );
  }
}
