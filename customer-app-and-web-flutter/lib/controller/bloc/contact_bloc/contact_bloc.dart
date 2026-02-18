
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/contact_bloc/contact_event.dart';
import 'package:quick_ecommerce/controller/bloc/contact_bloc/contact_state.dart';

import '../../../data/data_model/contact_model.dart';
import '../../../data/service/common_repository.dart';
import '../../../data/service/connectivity_repository.dart';


class ContactBloc extends Bloc<ContactEvent, ContactState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  ContactBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(ContactInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(ContactConnectionErrorEvent());
        }
      },
    );
    bool isFetching = false; // Add a flag to track API calls

    //===============Verify token portion================
    //--------------------------------------------
    on<ContactUsEvent>(
      (event, emit) async {

        if (isFetching) return; // Prevent duplicate calls
        isFetching = true;

        if (state is ContactInitial ||
            state is ContactLoading ||
            state is ContactLoaded ||
            state is ContactConnectionError ||
            state is ContactFailure) {
          emit(
            ContactLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.contactUs(
              event.language
            );
            if (response.data == null || response.data.isEmpty) {
              throw Exception("Empty or null response from API");
            }

            //========== converting json to dart object ===========
            //-----------------------------------------------------

            ContactModel contactModel = ContactModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              emit(
                ContactLoaded(contactModel:  ContactModel(
                  content: contactModel.content,

                 // pagination:
                ),),
              );
            }
            else if(response.statusCode == 204){
              emit(
                ContactLoaded(contactModel:  ContactModel(
                  content: contactModel.content,

                  // pagination:
                ),),
              );
            }
            else {
              emit(
                ContactFailure(contactModel: contactModel),
              );
            }
          } on DioException catch (_) {
            emit(
              ContactFailure(
                contactModel: ContactModel(
                 content: Content(),
                ),
              ),
            );
          }finally {
            isFetching = false; // Reset the flag
          }
        }
      },
    );

    on<ContactConnectionErrorEvent>(
      (event, emit) {
        if (state is ContactLoaded) {
          final currentState = state as ContactLoaded;
          emit(ContactLoaded(
            contactModel: currentState.contactModel,
            hasConnectionError: true,
          ));
        } else {
          emit(ContactConnectionError());
        }
      },
    );
  }
}
