import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../config/strings.dart';
import '../../../data/data_model/all_product_model.dart';
import '../../../data/data_model/new_arrival_model.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/product_repository.dart';
import 'new_arrival_event.dart';
import 'new_arrival_state.dart';

class NewArrivalBloc extends Bloc<NewArrivalEvent, NewArrivalState> {
  ConnectivityRepository connectivityRepository;
  ProductRepository productRepository;
  List<ProductData> newArrivalData = [];
  NewArrivalBloc(
      {required this.connectivityRepository, required this.productRepository})
      : super(NewArrivalInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(NewArrivalConnectionErrorEvent());
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<NewArrival>(
      (event, emit) async {
        if (state is NewArrivalInitial ||
            state is NewArrivalLoading ||
            state is NewArrivalLoaded ||
            state is NewArrivalConnectionError ||
            state is NewArrivalFailure) {
          emit(
            NewArrivalLoading(),
          );

          try {
            final response = await productRepository.newArrivals(
              event.categoryId,
              event.minPrice,
              event.maxPrice,
              event.availability,
              event.perPage,
              event.language,
              event.userLat,
              event.userLong,
              event.token,
            );
            NewArrivalModel newArrivalModel = NewArrivalModel.fromJson(response.data);
            if (response.statusCode == 200) {
              newArrivalData.addAll(newArrivalModel.data);
              emit(
                NewArrivalLoaded(newArrivalModel: NewArrivalModel(
                  message: newArrivalModel.message,
                  data: newArrivalData,
                )),
              );
              newArrivalData = [];
            } else if (response.statusCode == 204) {
              emit(
                NewArrivalLoaded(newArrivalModel: NewArrivalModel(
                  message: newArrivalModel.message,
                  data: [],
                )),
              );
              newArrivalData = [];
            } else {
              emit(
                NewArrivalFailure(newArrivalModel: newArrivalModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              NewArrivalFailure(
                newArrivalModel: NewArrivalModel(
                  message: errorMessage,
                  data: [],
                ),
              ),
            );
          }

        }
      },
    );

    on<NewArrivalConnectionErrorEvent>(
      (event, emit) {
        if (state is NewArrivalLoaded) {
          final currentState = state as NewArrivalLoaded;
          emit(NewArrivalLoaded(
            newArrivalModel: currentState.newArrivalModel,
            hasConnectionError: true,
          ));
        } else {
          emit(NewArrivalConnectionError());
        }
      },
    );
  }
}
