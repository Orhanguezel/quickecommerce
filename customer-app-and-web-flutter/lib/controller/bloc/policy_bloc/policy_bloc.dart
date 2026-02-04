import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../data/data_model/trams_condition_model.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'policy_event.dart';
import 'policy_state.dart';

class PolicyBloc extends Bloc<PolicyEvent, PolicyState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  PolicyBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(PolicyInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(PolicyConnectionErrorEvent());
        }
      },
    );


    //===============WishList portion================
    //--------------------------------------------
    on<PolicyData>(
          (event, emit) async {
        if (state is PolicyInitial ||
            state is PolicyLoading ||
            state is PolicyLoaded ||
            state is PolicyConnectionError ||
            state is PolicyFailure) {
          emit(
            PolicyLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.tramsAndConditionAndPrivacyPolicy(
              event.base,event.language,event.token
            );
            //========== converting json to dart object ===========
            //-----------------------------------------------------

            PrivacyPolicyModel policyModel = PrivacyPolicyModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------
              emit(
                PolicyLoaded(policyModel:  PrivacyPolicyModel(
                  content: policyModel.content,
                  // pagination:
                ),),
              );

            } else if(response.statusCode == 204){
              emit(
                PolicyLoaded(policyModel:  PrivacyPolicyModel(
                  content: policyModel.content,

                  // pagination:
                ),),
              );
            }
            else {
              emit(
                PolicyFailure(policyModel: PrivacyPolicyModel()),
              );
            }
          } on DioException catch (_) {
            emit(
              PolicyFailure(
                policyModel: PrivacyPolicyModel(),
              ),
            );
          }
        }
      },
    );


    on<PolicyConnectionErrorEvent>(
      (event, emit) {
        if (state is PolicyLoaded) {
          final currentState = state as PolicyLoaded;
          emit(PolicyLoaded(
            policyModel: currentState.policyModel,
            hasConnectionError: true,
          ));
        } else {
          emit(PolicyConnectionError());
        }
      },
    );
  }
}
