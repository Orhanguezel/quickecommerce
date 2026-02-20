
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/refresh_token/refresh_token_event.dart';
import 'package:quick_ecommerce/controller/bloc/refresh_token/refresh_token_state.dart';

import '../../../config/shared_preference_helper.dart';
import '../../../config/strings.dart';
import '../../../config/user_shared_preference.dart';
import '../../../data/data_model/login_model.dart';
import '../../../data/service/auth_repository.dart';
import '../../../data/service/connectivity_repository.dart';

class RefreshTokenBloc extends Bloc<RefreshTokenEvent, RefreshTokenState> {
  ConnectivityRepository connectivityRepository;
  AuthRepository authRepository;
  RefreshTokenBloc(
      {required this.connectivityRepository, required this.authRepository})
      : super(RefreshTokenInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
          (isConnected) {
        if (!isConnected) {
          add(RefreshConnectionErrorEvent());
        }
      },
    );



    //===============RefreshToken portion================
    //--------------------------------------------
    on<RefreshTokenDataEvent>(
      (event, emit) async {
        if (state is RefreshTokenInitial ||
            state is RefreshTokenLoading ||
            state is RefreshTokenLoaded ||
            state is RefreshTokenConnectionError ||
            state is RefreshTokenFailure) {
          emit(
            RefreshTokenLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await authRepository.refreshToken(event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------
            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              await UserSharedPreference.putValue(
                SharedPreferenceHelper.token,
                authModel.token,
              );
              if(authModel.expiresAt!=null){
                await UserSharedPreference.putValue(
                  SharedPreferenceHelper.tokenExp,
                  authModel.expiresAt.toString(),
                );
              }

              emit(
                RefreshTokenLoaded(authModel: authModel),
              );
            } else {
              emit(
                RefreshTokenFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              RefreshTokenFailure(
                authModel: AuthModel(
                  statusCode: 000,
                  message: errorMessage,
                ),
              ),
            );
          }
        }
      },
    );

    //===============Connection error portion================
    //-------------------------------------------------------
    on<RefreshConnectionErrorEvent>(
      (event, emit) {
        if (state is RefreshTokenInitial ||
            state is RefreshTokenLoading ||
            state is RefreshTokenLoaded ||
            state is RefreshTokenConnectionError ||
            state is RefreshTokenFailure) {
          emit(
            RefreshTokenConnectionError(),
          );
        }
      },
    );
  }
}
