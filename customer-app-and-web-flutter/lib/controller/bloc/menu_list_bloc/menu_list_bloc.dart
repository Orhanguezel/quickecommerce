
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../data/data_model/menu_model.dart';
import '../../../data/sirvice/common_repository.dart';
import '../../../data/sirvice/connectivity_rypository.dart';
import 'menu_list_event.dart';
import 'menu_list_state.dart';

class MenuListBloc extends Bloc<MenuListEvent, MenuListState> {
  ConnectivityRepository connectivityRepository;
  CommonRepository commonRepository;

  MenuListBloc({
    required this.connectivityRepository,
    required this.commonRepository,
  }) : super(MenuListInitial()) {
    connectivityRepository.isConnectedStream.listen(
      (isConnected) {
        if (!isConnected) {
          add(MenuListConnectionErrorEvent());
        }
      },
    );

    bool isFetching = false;

    on<MenuList>(
      (event, emit) async {
        if (isFetching) return;
        isFetching = true;

        if (state is MenuListInitial ||
            state is MenuListLoading ||
            state is MenuListLoaded ||
            state is MenuListConnectionError ||
            state is MenuListFailure) {
          emit(MenuListLoading());

          try {
            final response = await commonRepository.menuList(event.language);
            MenuListModel menuListModel = MenuListModel.fromJson(response.data);

            if (response.statusCode == 200) {
              emit(MenuListLoaded(menuListModel: menuListModel));
            } else if (response.statusCode == 204) {
              emit(MenuListLoaded(
                  menuListModel: MenuListModel(menus: const [])));
            } else {
              emit(MenuListFailure(menuListModel: menuListModel));
            }
          } on DioException catch (_) {
            emit(MenuListFailure(
                menuListModel: MenuListModel(menus: const [])));
          } finally {
            isFetching = false;
          }
        }
      },
    );

    on<MenuListConnectionErrorEvent>(
      (event, emit) {
        if (state is MenuListLoaded) {
          final currentState = state as MenuListLoaded;
          emit(MenuListLoaded(
            menuListModel: currentState.menuListModel,
            hasConnectionError: true,
          ));
        } else {
          emit(MenuListConnectionError());
        }
      },
    );
  }
}
