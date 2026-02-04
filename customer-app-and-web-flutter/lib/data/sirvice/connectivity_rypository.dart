import 'dart:async';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';


class ConnectivityRepository {
  final Connectivity _connectivity = Connectivity();

  late final Stream<bool> isConnectedStream;

  ConnectivityRepository() {
    isConnectedStream = _connectivity.onConnectivityChanged.map(
          (results) => results.contains(ConnectivityResult.mobile) ||
              results.contains(ConnectivityResult.wifi),
    );
  }

  connectivityRepository() {
    isConnectedStream = _connectivity.onConnectivityChanged.asyncMap(
          (results) async {
        if (results.isEmpty || results.contains(ConnectivityResult.none)) {
          return false; // No connection
        }
        return await _hasInternetConnection();
      },
    );
  }

  /// Check if the device has internet access
  Future<bool> _hasInternetConnection() async {
    try {
      final result = await InternetAddress.lookup('api.bravomart.app');
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  Future<bool> get isConnected async {
    final results = await _connectivity.checkConnectivity();
    if (results.isEmpty || results.contains(ConnectivityResult.none)) {
      return false;
    }
    return await _hasInternetConnection();
  }
}


