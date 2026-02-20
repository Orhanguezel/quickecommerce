import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../config/shared_preference_helper.dart';
import '../../../config/strings.dart';
import '../../../config/user_shared_preference.dart';
import '../../../data/data_model/login_model.dart';
import '../../../data/service/connectivity_repository.dart';
import '../../../data/service/save_repository.dart';
import 'save_event.dart';
import 'save_state.dart';

class SaveBloc extends Bloc<SaveEvent, SaveState> {
  ConnectivityRepository connectivityRepository;
  SaveRepository saveRepository;
  SaveBloc({required this.connectivityRepository, required this.saveRepository})
      : super(SaveInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(SaveConnectionErrorEvent());
        }
      },
    );




    //===============Profile Edit portion================
    //--------------------------------------------
    on<ProfileEdit>(
      (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.editProfile(
                event.firstName,
                event.lastName,
                event.phone,
                event.image,
                event.birthDay,
                event.gender,
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                SaveLoaded(authModel: authModel),
              );
            } else if(response.statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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

    //===============Add ticket portion================
    //--------------------------------------------
    on<AddTicket>(
      (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.supportTicketAdd(
                event.departmentId,
                event.title,
                event.subject,
                event.priority,
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                SaveLoaded(authModel: authModel),
              );
            } else if(response.statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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

    //===============Update ticket portion================
    //--------------------------------------------
    on<UpdateTicket>(
          (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.supportTicketUpdate(
                event.id,
                event.departmentId,
                event.title,
                event.subject,
                event.priority,
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {

              emit(
                SaveLoaded(authModel: authModel),
              );
            } else if(response.statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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

    //===============Resolve ticket portion================
    //--------------------------------------------
    on<ResolveTicket>(
          (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.supportTicketResolve(
                event.id,
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {

              emit(
                SaveLoaded(authModel: authModel),
              );
            } else if(response.statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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
    //===============Add ticket portion================
    //--------------------------------------------
    on<ContactMessage>(
      (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.contactMessageAdd(
                event.name, event.email, event.phone, event.message);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                SaveLoaded(authModel: authModel),
              );
            } else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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

    on<AskQuestion>(
      (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.askQuestion(
                event.productId, event.storeId, event.question, event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                SaveLoaded(authModel: authModel),
              );
            }else if(response.statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            } else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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





    //===============Deposit portion================
    //--------------------------------------------
    on<Deposit>(
      (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.deposit(
                event.walletId,
                event.transactionId,
                event.transactionDetails,
                event.amount,
                event.currencyCode,
                event.type,
                event.purpose,
                event.paymentGateway,
                event.status,
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {

              emit(
                SaveLoaded(authModel: authModel),
              );
            }else if(response.statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            } else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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


    //===============Order Review portion================
    //--------------------------------------------
    on<ReviewAdd>(
      (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.reviewAdd(
                event.orderId,
                event.storeId,
                event.reviewableId,
                event.type,
                event.review,
                event.rating,
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {

              emit(
                SaveLoaded(authModel: authModel),
              );
            }else if(response.statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            } else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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

    //===============Order Review portion================
    //--------------------------------------------
    on<ReviewReaction>(
          (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.reviewReaction(
                event.reviewId,
                event.reactionType,
                event.token);

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                SaveLoaded(authModel: authModel),
              );
            }else if(response.statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            } else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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



    on<ActivateDeactivate>(
      (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.activateDeactivate(
                event.reason, event.description, event.type, event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                SaveLoaded(authModel: authModel),
              );
            } else if(response.statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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

    on<DeleteAccountEvent>(
      (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.deleteAccount(event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                SaveLoaded(authModel: authModel),
              );
            } else if(response.statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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

    on<RequestRefundEvent>(
      (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.requestRefund(event.orderId,
                event.reasonId, event.note, event.image, event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                SaveLoaded(authModel: authModel),
              );
            } else if(response.statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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


    on<SendOtpEvent>(
          (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.sendOTP(
                event.phone,event.region);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                SaveLoaded(authModel: authModel),
              );
            } else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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

    on<VerifyOtpEvent>(
          (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.verifyOTP(
                event.phone,event.region,event.oTP,event.rememberMe);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token  ============
              //============  user token in local machine ============
              //--------------------------------------------------------
              await UserSharedPreference.putValue(
                SharedPreferenceHelper.token,
                authModel.token,
              );
              emit(
                SaveLoaded(authModel: authModel),
              );
            } else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                SaveTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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


    on<NotificationRead>(
          (event, emit) async {
        if (state is SaveInitial ||
            state is SaveLoading ||
            state is SaveLoaded ||
            state is SaveConnectionError ||
            state is SaveFailure) {
          emit(
            SaveLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.notificationRead(
                event.id,
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              emit(
                SaveLoaded(authModel: AuthModel(message: authModel.message)),
              );
            } else {
              emit(
                SaveFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final errorMessage =Utils.parseDioError(e);
            emit(
              SaveFailure(
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



    on<SaveConnectionErrorEvent>(
      (event, emit) {
        if (state is SaveLoaded) {
          final currentState = state as SaveLoaded;
          emit(SaveLoaded(
            authModel: currentState.authModel,
            hasConnectionError: true,
          ));
        } else {
          emit(SaveConnectionError());
        }
      },
    );
  }
}
