import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/config/shared_preference_helper.dart';
import 'package:quick_ecommerce/config/strings.dart';
import 'package:quick_ecommerce/config/user_shared_preference.dart';

import '../../../data/data_model/login_model.dart';
import '../../../data/sirvice/auth_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'reset_password_event.dart';
import 'reset_password_state.dart';

class ResetPassBloc extends Bloc<ResetPassEvent, ResetPassState> {
  ConnectivityRepository connectivityRepository;
  AuthRepository authRepository;
  ResetPassBloc(
      {required this.connectivityRepository, required this.authRepository})
      : super(ResetPassInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(ResetPassConnectionErrorEvent());
        }
      },
    );

    //===============Forget Password portion================
    //--------------------------------------------
    on<ResetPassWithEmail>(
      (event, emit) async {
        if (state is ResetPassInitial ||
            state is ResetPassLoading ||
            state is ResetPassLoaded ||
            state is ResetPassConnectionError ||
            state is ResetPassFailure) {
          emit(
            ResetPassLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
                await authRepository.forgetWithEmail(event.email);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------

              emit(
                ResetPassLoaded(authModel: authModel),
              );
            } else if (authModel.statusCode == 204) {
              emit(
                ResetPassLoaded(authModel: authModel),
              );
            } else {
              emit(
                ResetPassFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            emit(
              ResetPassFailure(
                authModel: AuthModel(
                  statusCode: 000,
                  message: e.message!,
                  status: false,
                  role: null,
                ),
              ),
            );
          }
        }
      },
    );


    //===============Verify token portion================
    //--------------------------------------------
    on<VerifyToken>(
          (event, emit) async {
        if (state is ResetPassInitial ||
            state is ResetPassLoading ||
            state is ResetPassLoaded ||
            state is ResetPassConnectionError ||
            state is ResetPassFailure) {
          emit(
            ResetPassLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
            await authRepository.verifyWithOTP(event.email,event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              emit(
                ResetPassLoaded(authModel: authModel),
              );
            } else {
              emit(
                ResetPassFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            emit(
              ResetPassFailure(
                authModel: AuthModel(
                  statusCode: 000,
                  message: e.message!,
                  status: false,
                  role: null,
                ),
              ),
            );
          }
        }
      },
    );


    //===============Verify token portion================
    //--------------------------------------------
    on<SetPassword>(
          (event, emit) async {
        if (state is ResetPassInitial ||
            state is ResetPassLoading ||
            state is ResetPassLoaded ||
            state is ResetPassConnectionError ||
            state is ResetPassFailure) {
          emit(
            ResetPassLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
            await authRepository.resetWithPassword(
                event.email,event.token,event.password,event.conPassword
            );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------

              emit(
                ResetPassLoaded(authModel: authModel),
              );
            } else {
              emit(
                ResetPassFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            emit(
              ResetPassFailure(
                authModel: AuthModel(
                  statusCode: 000,
                  message: e.message!,
                  status: false,
                  role: null,
                ),
              ),
            );
          }
        }
      },
    );


    //===============Change Emails portion================
    //--------------------------------------------
    on<ChangeEmails>(
          (event, emit) async {
        if (state is ResetPassInitial ||
            state is ResetPassLoading ||
            state is ResetPassLoaded ||
            state is ResetPassConnectionError ||
            state is ResetPassFailure) {
          emit(
            ResetPassLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
            await authRepository.changeEmail(
                event.email,
                event.vToken,
                event.token
            );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------

              emit(
                ResetPassLoaded(authModel: authModel),
              );
            } else {
              emit(
                ResetPassFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            emit(
              ResetPassFailure(
                authModel: AuthModel(
                  statusCode: 000,
                  message: e.message!,
                  status: false,
                  role: null,
                ),
              ),
            );
          }
        }
      },
    );

    on<VerifyEmails>(
          (event, emit) async {
        if (state is ResetPassInitial ||
            state is ResetPassLoading ||
            state is ResetPassLoaded ||
            state is ResetPassConnectionError ||
            state is ResetPassFailure) {
          emit(
            ResetPassLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
            await authRepository.verifyEmail(
                event.vToken,
                event.token
            );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              if(authModel.message=="Email verified successfully"){
                await UserSharedPreference.putBool(
                  SharedPreferenceHelper.emailVerified,
                  true,
                );
              }else{
                await UserSharedPreference.putBool(
                  SharedPreferenceHelper.emailVerified,
                  false,
                );
              }
              emit(
                ResetPassLoaded(authModel: authModel),
              );
            } else {
              emit(
                ResetPassFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              ResetPassFailure(
                authModel: AuthModel(
                  statusCode: 000,
                  message: errorMessage,
                  status: false,
                  role: null,
                ),
              ),
            );
          }
        }
      },
    );


    on<SendVerificationEmails>(
          (event, emit) async {
        if (state is ResetPassInitial ||
            state is ResetPassLoading ||
            state is ResetPassLoaded ||
            state is ResetPassConnectionError ||
            state is ResetPassFailure) {
          emit(
            ResetPassLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
            await authRepository.sendForEmailVerification(
                event.email,
                event.token
            );

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------

              emit(
                ResetPassLoaded(authModel: authModel),
              );
            } else {
              emit(
                ResetPassFailure(authModel: authModel),
              );
            }
          } on DioException catch (_) {
            emit(
              ResetPassFailure(
                authModel: AuthModel(
                  statusCode: 000,
                  message: "Something went wrong",
                  status: false,
                  role: null,
                ),
              ),
            );
          }
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<ChangePassword>(
          (event, emit) async {
        if (state is ResetPassInitial ||
            state is ResetPassLoading ||
            state is ResetPassLoaded ||
            state is ResetPassConnectionError ||
            state is ResetPassFailure) {
          emit(
            ResetPassLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
            await authRepository.changePassword(
                event.oldPassword,event.newPassword,event.newConPassword,event.token
            );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------

              emit(
                ResetPassLoaded(authModel: authModel),
              );
            } else {
              emit(
                ResetPassFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            emit(
              ResetPassFailure(
                authModel: AuthModel(
                  statusCode: 000,
                  message: e.message!,
                  status: false,
                  role: null,
                ),
              ),
            );
          }
        }
      },
    );


    on<ResetPassConnectionErrorEvent>(
      (event, emit) {
        if (state is ResetPassInitial ||
            state is ResetPassLoading ||
            state is ResetPassLoaded ||
            state is ResetPassConnectionError ||
            state is ResetPassFailure) {
          emit(
            ResetPassConnectionError(),
          );
        }
      },
    );
  }
}
