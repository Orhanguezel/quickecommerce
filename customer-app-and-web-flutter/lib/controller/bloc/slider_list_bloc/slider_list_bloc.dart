
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../data/data_model/slider_model.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/product_repository.dart';
import 'slider_list_event.dart';
import 'slider_list_state.dart';

class SliderListBloc extends Bloc<SliderListEvent,SliderListState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<Slider> sliderData = [];
  SliderListBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(SliderListInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(SliderListConnectionErrorEvent());
        }
      },
    );


    bool isFetching = false; // Add a flag to track API calls

    //===============Verify token portion================
    //--------------------------------------------
    on<SliderList>(
      (event, emit) async {
        if (isFetching) return; // Prevent duplicate calls
        isFetching = true;
        if (state is SliderListInitial ||
            state is SliderListLoading ||
            state is SliderListLoaded ||
            state is SliderListConnectionError ||
            state is SliderListFailure) {
          emit(
            SliderListLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await productRepository.sliderList(event.language);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            SliderModel sliderModel = SliderModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              sliderData.addAll(sliderModel.sliders!);
              emit(
                SliderListLoaded(sliderModel:  SliderModel(
                  message: sliderModel.message,
                   sliders: sliderData,
                 // pagination:
                ),),
              );
              sliderData=[];
            }
            else if(response.statusCode == 204){
              emit(
                SliderListLoaded(sliderModel:  SliderModel(
                  message: sliderModel.message,
                  sliders: sliderData,
                ),),
              );
              sliderData=[];
            }
            else {
              emit(
                SliderListFailure(sliderModel: sliderModel),
              );
            }
          }on DioException catch (_) {
            emit(
              SliderListFailure(
                sliderModel: SliderModel(
                  message:"Something went wrong",
                  sliders: [],
                ),
              ),
            );
          }finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );

    on<SliderListConnectionErrorEvent>(
      (event, emit) {
        if (state is SliderListLoaded) {
          final currentState = state as SliderListLoaded;
          emit(SliderListLoaded(
            sliderModel: currentState.sliderModel,
            hasConnectionError: true,
          ));
        } else {
          emit(SliderListConnectionError());
        }
      },
    );
  }
}


