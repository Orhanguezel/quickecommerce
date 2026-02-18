import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/config/strings.dart';

import '../../../data/data_model/login_model.dart';
import '../../../data/service/auth_repository.dart';
import '../../../data/service/connectivity_repository.dart';
import 'email_verification_event.dart';
import 'email_verification_state.dart';

class EmailVerificationBloc extends Bloc<EmailVerificationEvent, EmailVerificationState> {
  ConnectivityRepository connectivityRepository;
  AuthRepository authRepository;
  EmailVerificationBloc(
      {required this.connectivityRepository, required this.authRepository})
      : super(EmailVerificationInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(EmailVerificationConnectionErrorEvent());
        }
      },
    );

    //===============Forget Password portion================
    //--------------------------------------------
    on<SendEmailVerification>(
      (event, emit) async {
        if (state is EmailVerificationInitial ||
            state is EmailVerificationLoading ||
            state is EmailVerificationLoaded ||
            state is EmailVerificationConnectionError ||
            state is EmailVerificationFailure) {
          emit(
            EmailVerificationLoading(),
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
              emit(
                EmailVerificationLoaded(authModel: authModel),
              );
            } else if (authModel.statusCode == 204) {
              emit(
                EmailVerificationLoaded(authModel: authModel),
              );
            } else {
              emit(
                EmailVerificationFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              EmailVerificationFailure(
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


    //===============Verify token portion================
    //--------------------------------------------
    on<ResendEmailVerification>(
          (event, emit) async {
        if (state is EmailVerificationInitial ||
            state is EmailVerificationLoading ||
            state is EmailVerificationLoaded ||
            state is EmailVerificationConnectionError ||
            state is EmailVerificationFailure) {
          emit(
            EmailVerificationLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------
            final response =
            await authRepository.resendForEmailVerification(
                event.email,
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                EmailVerificationLoaded(authModel: authModel),
              );
            } else {
              emit(
                EmailVerificationFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              EmailVerificationFailure(
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


    on<EmailVerificationConnectionErrorEvent>(
      (event, emit) {
        if (state is EmailVerificationLoaded) {
          final currentState = state as EmailVerificationLoaded;
          emit(EmailVerificationLoaded(
            authModel: currentState.authModel,
            hasConnectionError: true,
          ));
        } else {
          emit(EmailVerificationConnectionError());
        }
      },
    );
  }
}
