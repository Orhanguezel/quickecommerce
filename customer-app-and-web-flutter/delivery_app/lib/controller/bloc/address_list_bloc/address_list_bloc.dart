import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/data_model/address_model.dart';
import '../../../data/service/common_repository.dart';
import '../../../data/service/connectivity_repository.dart';
import 'address_list_event.dart';
import 'address_list_state.dart';

class AddressListBloc extends Bloc<AddressListEvent, AddressListState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  List<AddressListModel> addressData = [];
  AddressListBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(AddressListInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(AddressListConnectionErrorEvent());
        }
      },
    );

    //===============WishList portion================
    //--------------------------------------------
    on<AddressList>(
      (event, emit) async {
        emit(AddressListLoading());
        try {
          //============ calling the api ============
          //-----------------------------------------
          final response = await commonRepository.addressList(
              event.id, event.type, event.status, event.token);
          if (response.statusCode == 200) {
            //========== converting json to dart object ===========
            //-----------------------------------------------------
           if (response.data is List) {
             List<AddressListModel>   addressList = (response.data as List)
                  .map((e) =>
                  AddressListModel.fromJson(e as Map<String, dynamic>))
                  .toList();
              emit(AddressListLoaded(addressList: addressList));
            }
            else  if (response.data is Map<String, dynamic>) {
             emit(
               const AddressListFailure(
                 addressList: [],
               ),
             );
            }

          }
          else if (response.statusCode == 204) {
            emit(
              const AddressListLoaded(
                addressList: [],
              ),
            );
          }
          else {
            emit(
              const AddressListFailure(
                addressList: [],
              ),
            );
          }
        } on DioException catch (e) {
          final statusCode = e.response?.statusCode ?? -1;
          if (statusCode == 401) {
            emit(
              AddressListTokenExp(),
            );
          }
          emit(
            const AddressListFailure(
              addressList: [],
            ),
          );
        }
      },
    );

    on<AddressListConnectionErrorEvent>(
      (event, emit) {
        if (state is AddressListLoaded) {
          final currentState = state as AddressListLoaded;
          emit(AddressListLoaded(
            addressList: currentState.addressList,
            hasConnectionError: true,
          ));
        } else {
          emit(AddressListConnectionError());
        }
      },
    );
  }
}
