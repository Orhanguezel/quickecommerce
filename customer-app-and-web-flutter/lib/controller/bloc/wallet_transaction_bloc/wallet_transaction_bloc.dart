import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../data/data_model/wallet_transaction_model.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'wallet_transaction_event.dart';
import 'wallet_transaction_state.dart';

class WalletTransactionBloc
    extends Bloc<WalletTransactionEvent, WalletTransactionState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;
  List<Wallet> transactionData = [];
  WalletTransactionBloc(
      {required this.connectivityRepository, required this.commonRepository})
      : super(WalletTransactionInitial()) {
    //===============Connectivity checking portion================
    //------------------------------------------------------------
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(WalletTransactionConnectionErrorEvent());
        }
      },
    );

    //===============Verify token portion================
    //--------------------------------------------
    on<WalletTransaction>(
      (event, emit) async {
        if (state is WalletTransactionInitial ||
            state is WalletTransactionLoading ||
            state is WalletTransactionLoaded ||
            state is WalletTransactionConnectionError ||
            state is WalletTransactionFailure) {
          emit(
            WalletTransactionLoading(),
          );

          try {
            //============ calling the api ============
            //-----------------------------------------

            final response =
                await commonRepository.getWalletTransactions(event.token);

            //========== converting json to dart object ===========
            //-----------------------------------------------------
            WalletsTransactionModel transactionModel =
                WalletsTransactionModel.fromJson(response.data);
            if (response.statusCode == 200) {
              transactionData.addAll(transactionModel.wallets!);

              emit(
                WalletTransactionLoaded(
                  walletsTransactionModel: WalletsTransactionModel(
                      wallets: transactionData, pagination: Pagination()),
                ),
              );
              transactionData = [];
            } else if (response.statusCode == 204) {
              emit(
                WalletTransactionLoaded(
                  walletsTransactionModel: WalletsTransactionModel(
                      wallets: [], pagination: Pagination()),
                ),
              );
            }
            else {
              emit(
                WalletTransactionFailure(
                    walletsTransactionModel: WalletsTransactionModel(
                        wallets: [], pagination: Pagination())),
              );
            }
          } on DioException catch (e) {
            final statusCode = e.response?.statusCode ?? -1;
            if (statusCode == 401) {
              emit(
                WalletTransactionTokenExp(),
              );
            }
            emit(
              WalletTransactionFailure(
                walletsTransactionModel: WalletsTransactionModel(
                    wallets: [], pagination: Pagination()),
              ),
            );
          }
        }
      },
    );

    on<WalletTransactionConnectionErrorEvent>(
      (event, emit) {
        if (state is WalletTransactionLoaded) {
          final currentState = state as WalletTransactionLoaded;
          emit(WalletTransactionLoaded(
            walletsTransactionModel: currentState.walletsTransactionModel,
            hasConnectionError: true,
          ));
        } else {
          emit(WalletTransactionConnectionError());
        }
      },
    );
  }
}
