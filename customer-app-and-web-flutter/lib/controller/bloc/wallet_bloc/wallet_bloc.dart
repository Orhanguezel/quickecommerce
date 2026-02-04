
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../data/data_model/wallet_model.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'wallet_event.dart';
import 'wallet_state.dart';

class WalletBloc extends Bloc<WalletEvent, WalletState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  WalletBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(WalletInitial()) {
    _initializeConnectivity();
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected && state is! WalletConnectionError) {
          add(WalletConnectionErrorEvent());
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<Wallet>(
      (event, emit) async {
        if (state is WalletInitial ||
            state is WalletLoading ||
            state is WalletLoaded ||
            state is WalletConnectionError ||
            state is WalletFailure) {
          emit(
            WalletLoading(),
          );
          try {
            //============ calling the api ============
            //-----------------------------------------

            final response = await commonRepository.getWallet(
                event.token
            );

            //========== converting json to dart object ===========
            //-----------------------------------------------------
            WalletsModel walletsModel = WalletsModel.fromJson(response.data);
           // final brandModel = BrandModel.fromJson(response.data);
            if (response.statusCode == 200) {
              //============ saving token and user identity ============
              //============ and user type in local machine ============
              //--------------------------------------------------------

              emit(
                WalletLoaded(walletsModel:  walletsModel,),
              );
            }
            else if(response.statusCode == 204){
              emit(
                WalletLoaded(walletsModel: WalletsModel(
                    wallets: Wallets()
                ),),
              );
            }else if(response.statusCode == 401){
              emit(
                WalletTokenExp(),
              );
            }

            else {
              emit(
                WalletFailure(walletsModel: WalletsModel(
                  wallets: Wallets()
                )),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                WalletTokenExp(),
              );
            }
            emit(
              WalletFailure(
                walletsModel: WalletsModel(
                  wallets: Wallets()
                ),
              ),
            );
          }
        }
      },
    );

    on<WalletConnectionErrorEvent>(
      (event, emit) {
        if (state is WalletLoaded) {
          final currentState = state as WalletLoaded;
          emit(WalletLoaded(
            walletsModel: currentState.walletsModel,
            hasConnectionError: true,
          ));
        } else {
          emit(WalletConnectionError());
        }

      },
    );
  }
  // Method to check initial connectivity
  Future<void> _initializeConnectivity() async {
    final isConnected = await connectivityRepository.isConnected;
    if (!isConnected) {
      add(WalletConnectionErrorEvent());
    }
  }
}

