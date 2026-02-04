import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../config/strings.dart';
import '../../../data/data_model/login_model.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import '../../../data/sirvice/save_repository.dart';
import 'address_event.dart';
import 'address_state.dart';

class AddressBloc extends Bloc<AddressEvent, AddressState> {
  ConnectivityRepository connectivityRepository;
  SaveRepository saveRepository;
  AddressBloc({required this.connectivityRepository, required this.saveRepository})
      : super(AddressInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(AddressConnectionErrorEvent());
        }
      },
    );


    //===============Add Delivery Address portion================
    //--------------------------------------------
    on<AddDAddress>(
      (event, emit) async {
        if (state is AddressInitial ||
            state is AddressLoading ||
            state is AddressLoaded ||
            state is AddressConnectionError ||
            state is AddressFailure) {
          emit(
            AddressLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.addressAdd(
                event.title,
                event.type,
                event.email,
                event.contactNumber,
                event.address,
                event.latitude,
                event.longitude,
                event.areaId,
                event.road,
                event.house,
                event.floor,
                event.postalCode,
                event.isDefault,
                event.status,
                event.token);
            //print("add delivery Address $response");
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 201) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------

              emit(
                AddressLoaded(authModel: authModel),
              );
            } else if (response.statusCode == 401) {
              emit(
                AddressTokenExp(),
              );
            } else {
              emit(
                AddressFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                AddressTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              AddressFailure(
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
    //===============update delivery Address portion================
    //--------------------------------------------
    on<UpdateDAddress>(
      (event, emit) async {
        if (state is AddressInitial ||
            state is AddressLoading ||
            state is AddressLoaded ||
            state is AddressConnectionError ||
            state is AddressFailure) {
          emit(
            AddressLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await saveRepository.addressUpdate(
                event.id,
                event.title,
                event.type,
                event.email,
                event.contactNumber,
                event.address,
                event.latitude,
                event.longitude,
                event.road,
                event.house,
                event.floor,
                event.postalCode,
                event.isDefault,
                event.status,
                event.token);
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------

              emit(
                AddressLoaded(authModel: authModel),
              );
            } else if (response.statusCode == 401) {
              emit(
                AddressTokenExp(),
              );
            } else {
              emit(
                AddressFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                AddressTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              AddressFailure(
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

    on<DeleteAddress>(
      (event, emit) async {
        if (state is AddressInitial ||
            state is AddressLoading ||
            state is AddressLoaded ||
            state is AddressConnectionError ||
            state is AddressFailure) {
          emit(
            AddressLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
                await saveRepository.addressDelete(event.id, event.token);

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            AuthModel authModel = AuthModel.fromJson(response.data);
            if (response.statusCode == 200) {

              emit(
                AddressLoaded(authModel: authModel),
              );
            }else {
              emit(
                AddressFailure(authModel: authModel),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                AddressTokenExp(),
              );
            }
            final errorMessage =Utils.parseDioError(e);
            emit(
              AddressFailure(
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

    on<AddressConnectionErrorEvent>(
      (event, emit) {
        if (state is AddressLoaded) {
          final currentState = state as AddressLoaded;
          emit(AddressLoaded(
            authModel: currentState.authModel,
            hasConnectionError: true,
          ));
        } else {
          emit(AddressConnectionError());
        }
      },
    );
  }
}
