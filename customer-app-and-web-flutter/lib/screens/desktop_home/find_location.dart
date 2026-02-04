import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:geocoding/geocoding.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:google_places_flutter/google_places_flutter.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/api_urls.dart';
import 'package:quick_ecommerce/config/strings.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/provider/delivery_address_controller.dart';
import '../../l10n/app_localizations.dart';

class PickupLocationPage extends StatefulWidget {
  const PickupLocationPage({
    super.key,
    required this.addressController,
    required this.focusNode,
  });
  final TextEditingController addressController;
  final FocusNode focusNode;
  @override
  State<PickupLocationPage> createState() => _PickupLocationPageState();
}

class _PickupLocationPageState extends State<PickupLocationPage> {
  final TextEditingController _controller = TextEditingController();
  GoogleMapController? mapController;
  BitmapDescriptor customerIcon = BitmapDescriptor.defaultMarker;
  Future<String> getAddressFromLatLng(double lat, double long) async {
    try {
      // Use Geocoding to get address
      List<Placemark> placemark = await placemarkFromCoordinates(
        lat,
        long,
      );
      Placemark place = placemark[0];
      String address =
          "${place.street} ${place.locality}, ${place.administrativeArea}, ${place.postalCode}, ${place.country}";
      await UserSharedPreference.putValue(
          SharedPreferenceHelper.customerAddress, address.toString());
      return address;
    } catch (e) {
      return "Failed to get address: $e";
    }
  }
  Future<void> setCustomMarkerIcon() async {
    customerIcon = await BitmapDescriptor.asset(
      ImageConfiguration.empty,
      AssetsIcons.hLocation,
      width: 30.w,
      height: 30.h,
    );
  }
  @override
  Widget build(BuildContext context) {
    var dAddressCon = Provider.of<DeliveryAddressController>(context);
    return Container(
      height: 200.h,
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(8.r),
        border: Border.all(width: 1.w, color: Theme.of(context).dividerColor),
      ),
      child: Stack(
        children: [
          GoogleMap(
            initialCameraPosition:
                CameraPosition(target: dAddressCon.initialPosition, zoom: 12),
            onMapCreated: (controller) => mapController = controller,
            markers: {
              Marker(
                markerId: const MarkerId("selected"),
                position: dAddressCon.initialPosition,
                  icon: customerIcon
              )
            },
            onTap: (LatLng position) {
              dAddressCon.setLatLong(position, true);
              getAddressFromLatLng(position.latitude, position.longitude);
            },
            gestureRecognizers: {
              Factory<PanGestureRecognizer>(() => PanGestureRecognizer()),
              Factory<VerticalDragGestureRecognizer>(
                  () => VerticalDragGestureRecognizer()),
              Factory<HorizontalDragGestureRecognizer>(
                  () => HorizontalDragGestureRecognizer()),
            },
          ),
          // Autocomplete input field
          Positioned(
            top: 10,
            left: 15,
            right: 15,
            child: Column(
              children: [
                Material(
                  elevation: 4,
                  borderRadius: BorderRadius.circular(8),
                  child: GooglePlaceAutoCompleteTextField(
                      textEditingController: _controller,
                      focusNode: widget.focusNode,
                      googleAPIKey: ApiUrls.googleAPIKey,
                      textStyle: Theme.of(context)
                          .textTheme
                          .displaySmall!
                          .copyWith(
                              fontSize: 14, color: const Color(0xFF5A637E)),
                      inputDecoration: InputDecoration(
                        hintText:
                            AppLocalizations.of(context)!.searchYourLocation,
                        hintStyle: Theme.of(context)
                            .textTheme
                            .displayLarge!
                            .copyWith(
                                fontSize: 12.sp,
                                fontWeight: FontWeight.w400,
                                color: const Color(0x497E7B7B)),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(
                            horizontal: 10.w, vertical: 2.h),
                      ),
                      debounceTime: 800,
                      countries: const ["bd"],
                      isLatLngRequired: true,
                      getPlaceDetailWithLatLng: (prediction) async {
                        if (prediction.lat != null && prediction.lng != null) {
                          double lat = double.tryParse(prediction.lat!) ?? 0.0;
                          double lng = double.tryParse(prediction.lng!) ?? 0.0;
                          LatLng initialPosition = LatLng(lat, lng);
                          dAddressCon.setLatLong(initialPosition, true);
                          mapController?.animateCamera(
                            CameraUpdate.newLatLngZoom(
                                dAddressCon.initialPosition, 16),
                          );
                        }
                      },
                      itemClick: (prediction) async {
                        _controller.text = prediction.description!;
                        _controller.selection = TextSelection.fromPosition(
                          TextPosition(offset: prediction.description!.length),
                        );
                        widget.addressController.text = _controller.text;
                      }),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class LocationSelectSheet extends StatefulWidget {
  const LocationSelectSheet({super.key});

  @override
  State<LocationSelectSheet> createState() => _LocationSelectSheetState();
}

class _LocationSelectSheetState extends State<LocationSelectSheet> {
  final _controller = TextEditingController();
  GoogleMapController? _mapController;
  BitmapDescriptor customerIcon = BitmapDescriptor.defaultMarker;
  @override
  void initState() {
    setCustomMarkerIcon();
    super.initState();
  }

  Future<void> setCustomMarkerIcon() async {
    customerIcon = await BitmapDescriptor.asset(
      ImageConfiguration.empty,
      AssetsIcons.hLocation,
      width: 30.w,
      height: 30.h,
    );
  }

  Future<String> _getAddressFromLatLng(double lat, double long) async {
    try {
      final placemark = await placemarkFromCoordinates(lat, long);
      final place = placemark.first;
      return "${place.street} ${place.locality}, ${place.administrativeArea}, ${place.postalCode}, ${place.country}";
    } catch (e) {
      return "Failed to get address: $e";
    }
  }

  Future<void> _saveLocation(
      LatLng position, DeliveryAddressController con) async {
    await UserSharedPreference.putValue(SharedPreferenceHelper.customerLat,
        Utils.formatString(position.latitude));
    await UserSharedPreference.putValue(SharedPreferenceHelper.customerLong,
        Utils.formatString(position.longitude));
    con.setLatLong(position, true);
    final address =
        await _getAddressFromLatLng(position.latitude, position.longitude);
    con.setAddress(address);
    await UserSharedPreference.putValue(
        SharedPreferenceHelper.customerAddress, address.toString());
  }

  @override
  Widget build(BuildContext context) {
    final dAddressCon = Provider.of<DeliveryAddressController>(context);

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(8.r),
        border: Border.all(width: 1.w, color: Theme.of(context).dividerColor),
      ),
      child: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: dAddressCon.initialPosition,
              zoom: 12,
            ),
            onMapCreated: (controller) => _mapController = controller,
            markers: {
              Marker(
                  markerId: const MarkerId("selected"),
                  position: dAddressCon.initialPosition,
                  icon: customerIcon)
            },
            onTap: (pos) => _saveLocation(pos, dAddressCon),
            gestureRecognizers: {
              Factory<PanGestureRecognizer>(() => PanGestureRecognizer()),
              Factory<VerticalDragGestureRecognizer>(
                  () => VerticalDragGestureRecognizer()),
              Factory<HorizontalDragGestureRecognizer>(
                  () => HorizontalDragGestureRecognizer()),
            },
          ),
          Positioned(
            top: 30,
            left: 15,
            right: 15,
            child: Material(
              elevation: 4,
              borderRadius: BorderRadius.circular(8),
              child: GooglePlaceAutoCompleteTextField(
                textEditingController: _controller,
                googleAPIKey: ApiUrls.googleAPIKey,
                debounceTime: 800,
                countries: const ["bd"],
                isLatLngRequired: true,
                textStyle: Theme.of(context).textTheme.displaySmall!.copyWith(
                      fontSize: 14,
                      color: const Color(0xFF5A637E),
                    ),
                inputDecoration: InputDecoration(
                  hintText: AppLocalizations.of(context)!.searchYourLocation,
                  hintStyle: Theme.of(context).textTheme.displayLarge?.copyWith(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w400,
                        color: const Color(0x497E7B7B),
                      ),
                  border: InputBorder.none,
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 10.w, vertical: 2.h),
                ),
                getPlaceDetailWithLatLng: (prediction) async {
                  if (prediction.lat != null && prediction.lng != null) {
                    final lat = double.tryParse(prediction.lat!) ?? 0.0;
                    final lng = double.tryParse(prediction.lng!) ?? 0.0;
                    LatLng initialPosition=  LatLng(lat,lng);
                    dAddressCon.setLatLong(initialPosition, true);
                    await UserSharedPreference.putValue(
                        SharedPreferenceHelper.customerLat,
                        Utils.formatString(lat));
                    await UserSharedPreference.putValue(
                        SharedPreferenceHelper.customerLong,
                        Utils.formatString(lng));

                    _mapController?.animateCamera(
                      CameraUpdate.newLatLngZoom(LatLng(lat, lng), 16),
                    );
                  }
                },
                itemClick: (prediction) async {
                  _controller
                    ..text = prediction.description!
                    ..selection = TextSelection.fromPosition(
                      TextPosition(offset: prediction.description!.length),
                    );
                  dAddressCon.setAddress(_controller.text);
                  await UserSharedPreference.putValue(
                    SharedPreferenceHelper.customerAddress,
                    _controller.text,
                  );
                },
              ),
            ),
          ),
          Positioned(
            bottom: 30,
            left: 15,
            child: GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Card(
                color: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
                elevation: 2,
                child: Padding(
                  padding: EdgeInsets.all(10.w),
                  child: Icon(
                    Icons.close,
                    color: Colors.red.shade400,
                    size: 28.sp,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
