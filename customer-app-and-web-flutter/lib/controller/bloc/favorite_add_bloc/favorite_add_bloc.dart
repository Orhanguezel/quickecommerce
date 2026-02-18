import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../config/strings.dart';
import '../../../data/data_model/login_model.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/save_repository.dart';
import 'favorite_add_event.dart';
import 'favorite_add_state.dart';

class FavoriteAddBloc extends Bloc<FavoriteAddEvent, FavoriteAddState> {
  ConnectivityRepository connectivityRepository;
  SaveRepository saveRepository;
  FavoriteAddBloc({required this.connectivityRepository, required this.saveRepository})
      : super(FavoriteAddInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(FavoriteAddConnectionErrorEvent());
        }
      },
    );


    //===============Add Favorites portion================
    //--------------------------------------------
    on<AddFavorites>(
      (event, emit) async {
        if (state is FavoriteAddInitial ||
            state is FavoriteAddLoading ||
            state is FavoriteAddLoaded ||
            state is FavoriteAddConnectionError ||
            state is FavoriteAddFailure) {
          emit(
            FavoriteAddLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
                await saveRepository.wishListAdd(event.productId, event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                FavoriteAddLoaded(authModel: authModel),
              );
            } else if(response.statusCode == 401) {
              emit(
                FavoriteAddTokenExp(),
              );
            }else {
              emit(
                FavoriteAddFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              FavoriteAddFailure(
                authModel: AuthModel(
                  statusCode: 000,
                  message:errorMessage,
                  status: false,
                  role: null,
                ),
              ),
            );
          }
        }
      },
    );

    //===============Delete Favorites portion================
    //--------------------------------------------
    on<DeleteFavorites>(
      (event, emit) async {
        if (state is FavoriteAddInitial ||
            state is FavoriteAddLoading ||
            state is FavoriteAddLoaded ||
            state is FavoriteAddConnectionError ||
            state is FavoriteAddFailure) {
          emit(
            FavoriteAddLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.wishListDelete(
                event.productId, event.token);
            // print("DeleteFavorites $response");
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                FavoriteAddLoaded(authModel: authModel),
              );
            } else if (response.statusCode == 401) {
              emit(
                FavoriteAddTokenExp(),
              );
            } else {
              emit(
                FavoriteAddFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              FavoriteAddFailure(
                authModel: AuthModel(
                  statusCode: 000,
                  message:errorMessage,
                  status: false,
                  role: null,
                ),
              ),
            );
          }
        }
      },
    );


    on<FavoriteAddConnectionErrorEvent>(
      (event, emit) {
        if (state is FavoriteAddLoaded) {
          final currentState = state as FavoriteAddLoaded;
          emit(FavoriteAddLoaded(
            authModel: currentState.authModel,
            hasConnectionError: true,
          ));
        } else {
          emit(FavoriteAddConnectionError());
        }
      },
    );
  }
}
