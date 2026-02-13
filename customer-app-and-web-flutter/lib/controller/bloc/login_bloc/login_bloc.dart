import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/config/strings.dart';

import '../../../config/shared_preference_helper.dart';
import '../../../config/user_shared_preference.dart';
import '../../../data/data_model/login_model.dart';
import '../../../data/sirvice/auth_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'login_event.dart';
import 'login_state.dart';

class LoginBloc extends Bloc<LoginEvent, LoginState> {
  ConnectivityRepository connectivityRepository;
  AuthRepository authRepository;
  LoginBloc(
      {required this.connectivityRepository, required this.authRepository})
      : super(LoginInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(LoginConnectionErrorEvent());
        }
      },
    );

    //===============login portion================
    //--------------------------------------------
    on<RegistrationWithUsernameAndEmail>(
      (event, emit) async {
        if (state is LoginInitial ||
            state is LoginLoading ||
            state is LoginLoaded ||
            state is LoginConnectionError ||
            state is LoginFailure) {
          emit(
            LoginLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
                await authRepository.registrationWithUsernameAndEmail(
                    event.firstName,
                    event.lastName,
                    event.email,
                    event.password,
                    event.role,
                    event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (authModel.statusCode == 200) {
              emit(
                LoginLoaded(authModel: authModel),
              );
            } else if (authModel.statusCode == 204) {
              emit(
                LoginLoaded(authModel: authModel),
              );
            } else {
              emit(
                LoginFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              LoginFailure(
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

    //===============login portion================
    //--------------------------------------------
    on<LoginWithEmailAndPassword>(
      (event, emit) async {
        if (state is LoginInitial ||
            state is LoginLoading ||
            state is LoginLoaded ||
            state is LoginConnectionError ||
            state is LoginFailure) {
          emit(
            LoginLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await authRepository.loginWithEmailAndPassword(
                event.email, event.password, event.fcToken);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);

            if (authModel.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              await UserSharedPreference.putValue(
                SharedPreferenceHelper.token,
                authModel.token,
              );
              await UserSharedPreference.putValue(
                SharedPreferenceHelper.tokenExp,
                authModel.expiresAt,
              );
              await UserSharedPreference.putValue(
                SharedPreferenceHelper.email,
                authModel.email,
              );
                await UserSharedPreference.putBool(
                  SharedPreferenceHelper.emailVerified,
                 authModel.emailVerified,
                );
                await UserSharedPreference.putValue(
                  SharedPreferenceHelper.emailVerificationSettings,
                  authModel.emailVerificationSettings,
                );

              emit(
                LoginLoaded(
                    authModel: AuthModel(
                        message: authModel.message ?? "",
                      emailVerified:authModel.emailVerified ,
                      emailVerificationSettings:authModel.emailVerificationSettings,
                    )),
              );
            } else {
              emit(
                LoginFailure(
                    authModel: AuthModel(message: authModel.message ?? "")),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              LoginFailure(
                authModel: AuthModel(
                  status: false,
                  message:errorMessage,
                  statusCode: 000,
                ),
              ),
            );
          }
        }
      },
    );

    //===============login portion================
    //--------------------------------------------
    on<LoginWithGoogle>(
      (event, emit) async {
        if (state is LoginInitial ||
            state is LoginLoading ||
            state is LoginLoaded ||
            state is LoginConnectionError ||
            state is LoginFailure) {
          emit(
            LoginLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await authRepository.loginWithGoogle(
              event.idToken,
              event.email,
              event.fcmToken
            );

            if (response?.statusCode == 200) {
              AuthModel authModel = AuthModel.fromJson(response!.data);
              await UserSharedPreference.putValue(
                SharedPreferenceHelper.token,
                authModel.token,
              );
              await UserSharedPreference.putValue(
                SharedPreferenceHelper.tokenExp,
                authModel.expiresAt,
              );
              await UserSharedPreference.putValue(
                SharedPreferenceHelper.email,
                authModel.email,
              );
              await UserSharedPreference.putBool(
                SharedPreferenceHelper.emailVerified,
                authModel.emailVerified,
              );
              await UserSharedPreference.putValue(
                SharedPreferenceHelper.emailVerificationSettings,
                authModel.emailVerificationSettings,
              );
              emit(
                LoginLoaded(authModel: authModel),
              );
            } else {
              emit(
                LoginFailure(authModel: AuthModel(statusCode: 000)),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              LoginFailure(
                authModel: AuthModel(
                  status: false,
                  role: null,
                  message: errorMessage,
                  statusCode: 000,
                ),
              ),
            );
          }
        }
      },
    );

    //===============login portion================
    //--------------------------------------------
    on<Logout>(
      (event, emit) async {
        if (state is LoginInitial ||
            state is LoginLoading ||
            state is LoginLoaded ||
            state is LoginConnectionError ||
            state is LoginFailure) {
          emit(
            LoginLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await authRepository.logout();

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (authModel.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------

              emit(
                LoginLoaded(authModel: authModel),
              );
            } else {
              emit(
                LoginFailure(authModel: authModel),
              );
            }
          } on DioException catch (_) {
            emit(
              LoginFailure(
                authModel: AuthModel(
                  status: false,
                  role: null,
                  message: "Something went wrong",
                  statusCode: 000,
                ),
              ),
            );
          }
        }
      },
    );

    on<LoginConnectionErrorEvent>(
      (event, emit) {
        if (state is LoginInitial ||
            state is LoginLoading ||
            state is LoginLoaded ||
            state is LoginConnectionError ||
            state is LoginFailure) {
          emit(
            LoginConnectionError(),
          );
        }
      },
    );
  }
}
