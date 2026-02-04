
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/data_model/brand_model.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import '../../../data/sirvice/product_repository.dart';
import 'brand_event.dart';
import 'brand_state.dart';

class BrandBloc extends Bloc<BrandEvent, BrandState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  BrandBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(BrandInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(BrandConnectionErrorEvent());
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<Brand>(
      (event, emit) async {
        if (state is BrandInitial ||
            state is BrandLoading ||
            state is BrandLoaded ||
            state is BrandConnectionError ||
            state is BrandFailure) {
          emit(
            BrandLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------
            final response = await productRepository.brandId();
            if (response.statusCode == 200) {
              //========== converting json to dart object ===========
              //-----------------------------------------------------

              List<BrandModel> brandList = (response.data as List)
                  .map((brand) => BrandModel.fromJson(brand))
                  .toList();

              emit(
                BrandLoaded(brandModel:  brandList,),
              );
            }
            else if(response.statusCode == 204){
              List<BrandModel> brandList = (response.data as List)
                  .map((brand) => BrandModel.fromJson(brand))
                  .toList();
              emit(
                BrandLoaded(brandModel: brandList,),
              );
            }
            else {
              emit(
                BrandFailure(brandModel: BrandModel()),
              );
            }
          } on DioException catch (_) {

            emit(
              BrandFailure(
                brandModel: BrandModel(),
              ),
            );
          }
        }
      },
    );



    on<BrandConnectionErrorEvent>(
      (event, emit) {
        if (state is BrandLoaded) {
          final currentState = state as BrandLoaded;
          emit(BrandLoaded(
            brandModel: currentState.brandModel,
            hasConnectionError: true,
          ));
        } else {
          emit(BrandConnectionError());
        }
      },
    );
  }
}
