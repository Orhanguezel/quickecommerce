
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl_phone_field/countries.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/colors.dart';
import 'package:quick_ecommerce/screens/common_widgets/commn_textfield.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_funcktion.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/address_bloc/address_bloc.dart';
import '../../controller/bloc/address_bloc/address_event.dart';
import '../../controller/bloc/address_bloc/address_state.dart';
import '../../controller/bloc/address_list_bloc/address_list_bloc.dart';
import '../../controller/bloc/address_list_bloc/address_list_event.dart';
import '../../controller/provider/authentication_provider.dart';
import '../../controller/provider/delivery_address_controller.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_phone_number_field.dart';
import '../common_widgets/field_title.dart';
import '../home/find_location.dart';

class AddDeliveryAddress extends StatefulWidget {
  const AddDeliveryAddress({
    super.key,
    this.id = '',
    this.title = '',
    this.type = '',
    this.email = '',
    this.contactNumber = "",
    this.countryCode = "",
    this.address = "",
    this.lat = '',
    this.long = '',
    this.area = 0,
    this.road = '',
    this.house = '',
    this.floor = '',
    this.postalCode = '',
    this.isDefault = false,
    this.status = '',
  });
  final String id;
  final String title;
  final String type;
  final String email;
  final String contactNumber;
  final String countryCode;
  final String address;
  final String lat;
  final String long;
  final int area;
  final String road;
  final String house;
  final String floor;
  final String postalCode;
  final bool isDefault;
  final String status;

  @override
  State<AddDeliveryAddress> createState() => _AddDeliveryAddressState();
}

class _AddDeliveryAddressState extends State<AddDeliveryAddress> {
  final TextEditingController titleCon = TextEditingController();
  final TextEditingController phoneCon = TextEditingController();
  final TextEditingController addressCon = TextEditingController();
  final TextEditingController emailCon = TextEditingController();
  final TextEditingController roadCon = TextEditingController();
  final TextEditingController houseCon = TextEditingController();
  final TextEditingController postCodeCon = TextEditingController();
  final TextEditingController floorCon = TextEditingController();
  final TextEditingController latController = TextEditingController();
  final TextEditingController lngController = TextEditingController();
  final FocusNode focusNode = FocusNode();

  late final AddressBloc _addressBloc;
  late final AddressListBloc _addressListBloc;
  String _token = '';
  String completeNumber='';
  String initialCountryCode="BD";
  @override
  void initState() {
    _addressBloc = context.read<AddressBloc>();
    _addressListBloc = context.read<AddressListBloc>();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      focusNode.requestFocus();
      var dAddressCon =
          Provider.of<DeliveryAddressController>(context, listen: false);
      dAddressCon.clearIsLocationSet();
      LatLng initialPosition = LatLng(
        double.tryParse(widget.lat) ?? 0.0,
        double.tryParse(widget.long) ?? 0.0,
      );
      dAddressCon.setLatLong(initialPosition, true);
    });
    valueAsin();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
  }

  valueAsin() {
    titleCon.text = widget.title;
    phoneCon.text = widget.contactNumber;
    emailCon.text = widget.email;
    addressCon.text = widget.address;
    roadCon.text = widget.road;
    houseCon.text = widget.house;
    postCodeCon.text = widget.postalCode;
    floorCon.text = widget.floor;
    if (widget.countryCode.isNotEmpty && widget.contactNumber.isNotEmpty) {
      final matchedCountry = countries.firstWhere(
            (country) =>  country.code == widget.countryCode &&
            widget.contactNumber.startsWith('+${country.dialCode}'),
        orElse: () => countries.firstWhere((c) => c.code == 'BD'),
      );
      initialCountryCode = matchedCountry.code;
      final dialCode = "+${matchedCountry.dialCode}";
      String cleanPhone = widget.contactNumber.replaceAll(" ", "");
      if (cleanPhone.startsWith(dialCode)) {
        phoneCon.text = cleanPhone.replaceFirst(dialCode, '');
      } else {
        phoneCon.text = cleanPhone;
      }
    }
  }




  @override
  Widget build(BuildContext context) {
    var authProvider = Provider.of<AuthenticationProvider>(context);
    var dAddressCon = Provider.of<DeliveryAddressController>(context);
    return Scaffold(
      appBar:!kIsWeb? AppBar(
        // backgroundColor: Colors.white,
        title: Text(
          AppLocalizations.of(context)!.addDeliveryAddress,
          style: Theme.of(context)
              .textTheme
              .titleLarge!
              .copyWith(fontSize: 16.sp, color: Colors.white),
        ),
        centerTitle: true,
      ):null,
      body: GestureDetector(
        onTap: () {
          FocusScope.of(context).unfocus(); 
        },
        child: SingleChildScrollView(
          child: Column(
            children: [
              CommonCard(
             mHorizontal: kIsWeb ? 2 :12,
                  widget: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    height:kIsWeb ? 4 : 4.h,
                  ),
                  Row(
                    children: [
                      Text(
                        AppLocalizations.of(context)!.type,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontSize:kIsWeb ? 14 : 14.sp, fontWeight: FontWeight.w500),
                      ),
                      SizedBox(
                        width:kIsWeb ? 4 : 4.w,
                      ),
                      _addressTypeCart(
                        "Home",
                        AssetsIcons.home,
                      ),
                      SizedBox(
                        width: kIsWeb ? 4 :4.w,
                      ),
                      _addressTypeCart(
                        "Office",
                        AssetsIcons.office,
                      ),
                      SizedBox(
                        width: kIsWeb ? 4 :4.w,
                      ),
                      _addressTypeCart(
                        "Others",
                        AssetsIcons.others,
                      ),
                    ],
                  ),
                  SizedBox(height: kIsWeb ? 8 :8.h),
                  dAddressCon.isLocationSet == false
                      ? Text(
                          "Please Select delivery address in Map",
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontSize:kIsWeb ? 14 : 14.sp,
                              fontWeight: FontWeight.w500,
                              color: Colors.red),
                        )
                      : const SizedBox(),

                   PickupLocationPage(
                     addressController: addressCon,
                     focusNode: focusNode,
                   ),
                  SizedBox(height:kIsWeb ? 16 : 16.h),
                  FieldTitle(
                      title: AppLocalizations.of(context)!.title, star: "*"),
                  SizedBox(height: kIsWeb ? 8 :8.h),
                  CommonTextField(
                      textInputAction: TextInputAction.next,
                      controler: titleCon,
                      hint: "Enter title",
                      textAlign: TextAlign.start,
                      redOnly: false),
                  SizedBox(
                    height: kIsWeb ? 8 :8.h,
                  ),
                  FieldTitle(
                      title: AppLocalizations.of(context)!.contactNumber,
                      star: "*"),
                  CommonPhoneField(
                    controller: phoneCon,
                    initialCountryCode: initialCountryCode,
                    hintText: AppLocalizations.of(context)!.enterPhone,
                    onChanged: (value) {
                      completeNumber = value.completeNumber;
                    },
                  ),
                  SizedBox(
                    height: kIsWeb ? 8 :8.h,
                  ),
                  FieldTitle(
                      title: AppLocalizations.of(context)!.email, star: "*"),
                  CommonTextField(
                      prefixIcon: const Icon(Icons.email,
                      color: Colors.grey,),
                      controler: emailCon,
                      hint: "Enter Email",
                      inputFormatters: [
                        LengthLimitingTextInputFormatter(255),
                      ],
                      textAlign: TextAlign.start,
                      redOnly: false),
                  SizedBox(
                    height: kIsWeb ? 8 :8.h,
                  ),
                  FieldTitle(
                      title: AppLocalizations.of(context)!.address, star: "*"),
                  CommonTextField(
                      controler: addressCon,
                      hint: "Enter Address",
                      textAlign: TextAlign.start,
                      redOnly: false),
                  SizedBox(
                    height: kIsWeb ? 10 :10.h,
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: FieldTitle(
                            title: AppLocalizations.of(context)!.road),
                      ),
                      SizedBox(
                        width:kIsWeb ? 4 : 4.h,
                      ),
                      Expanded(
                          child: FieldTitle(
                              title: AppLocalizations.of(context)!.house)),
                    ],
                  ),
                  SizedBox(
                    height:kIsWeb ? 4 : 4.h,
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: CommonTextField(
                            controler: roadCon,
                            hint: "Please enter Road",
                            textAlign: TextAlign.start,
                            redOnly: false),
                      ),
                      SizedBox(
                        width: kIsWeb ? 8 :8.h,
                      ),
                      Expanded(
                        child: CommonTextField(
                            controler: houseCon,
                            hint: "Please enter House",
                            textAlign: TextAlign.start,
                            redOnly: false),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: kIsWeb ? 8 :8.h,
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: FieldTitle(
                            title: AppLocalizations.of(context)!.floor),
                      ),
                      SizedBox(
                        width: kIsWeb ? 8 :4.h,
                      ),
                      Expanded(
                        child: FieldTitle(
                            title: AppLocalizations.of(context)!.postCode),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: kIsWeb ? 8 :4.h,
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: CommonTextField(
                            controler: floorCon,
                            hint:  AppLocalizations.of(context)!.floor,
                            textAlign: TextAlign.start,
                            redOnly: false),
                      ),
                      SizedBox(
                        width: kIsWeb ? 8 :8.h,
                      ),
                      Expanded(
                        child: CommonTextField(
                            controler: postCodeCon,
                            hint: AppLocalizations.of(context)!.postCode,
                            textAlign: TextAlign.start,
                            redOnly: false),
                      ),
                    ],
                  ),
                  SizedBox(
                    height:kIsWeb ? 8 : 8.h,
                  ),
                ],
              )),
             BlocConsumer<AddressBloc, AddressState>(
                      listener: (context, state) {
                        if (state is AddressConnectionError) {
                          CommonFunctions.showUpSnack(
                              context: context, message: AppLocalizations.of(context)!.noInternet);
                        }
                        else if (state is AddressFailure) {
                          CommonFunctions.showCustomSnackBar(
                              context, state.authModel.message);
                        }else if (state is AddressLoaded) {
                          _addressListBloc.add(AddressList(
                              id: "", type: "", status: "", token: _token));
                          CommonFunctions.showUpSnack(
                            message: state.authModel.message,
                            context: context,
                          );
                          context.pop();
                        }
                      },
                      builder: (context, state) {
                        if (state is AddressLoading) {
                          return const CommonLoadingButton();
                        }
                        return  CommonButton(
                            buttonText: AppLocalizations.of(context)!.saveAddress,
                            onTap: () {
                              authProvider.checkEmailValidity(emailCon.text);
                              if (phoneCon.text.trim().isNotEmpty) {
                                if (addressCon.text.trim().isNotEmpty) {
                                  if (dAddressCon.isLocationSet) {
                                    if (authProvider.isValidEmail) {
                                      if (widget.id.isNotEmpty) {
                                        _addressBloc.add(UpdateDAddress(
                                            id: widget.id,
                                            title: titleCon.text,
                                            type: dAddressCon.selectedAddressType.toLowerCase(),
                                            email: emailCon.text,
                                            contactNumber: completeNumber.trim(),
                                            address: addressCon.text.trim(),
                                            latitude: dAddressCon
                                                .initialPosition.latitude
                                                .toString(),
                                            longitude: dAddressCon
                                                .initialPosition.longitude
                                                .toString(),
                                            road: roadCon.text,
                                            house: houseCon.text,
                                            floor: floorCon.text,
                                            postalCode: postCodeCon.text.trim(),
                                            isDefault: false,
                                            status: 1,
                                            token: _token));
                                      } else {
                                        _addressBloc.add(AddDAddress(
                                            title: titleCon.text,
                                            type: dAddressCon.selectedAddressType.toLowerCase(),
                                            email: emailCon.text,
                                            contactNumber: phoneCon.text.trim(),
                                            address: addressCon.text.trim(),
                                            latitude: dAddressCon
                                                .initialPosition.latitude
                                                .toString(),
                                            longitude: dAddressCon
                                                .initialPosition.longitude
                                                .toString(),
                                            areaId: 1,
                                            road: roadCon.text,
                                            house: houseCon.text,
                                            floor: floorCon.text,
                                            postalCode: postCodeCon.text.trim(),
                                            isDefault: false,
                                            status: 1,
                                            token: _token));
                                      }
                                    } else {
                                      CommonFunctions.showCustomSnackBar(
                                          context, "Please enter a valid email");
                                    }
                                  } else {
                                    CommonFunctions.showCustomSnackBar(
                                        context, "please enter Delivery latitude longitude");
                                  }
                                } else {
                                  CommonFunctions.showCustomSnackBar(
                                      context, "please enter Delivery Address");
                                }
                              } else {
                                CommonFunctions.showCustomSnackBar(
                                    context, "please enter Contact No");

                              }
                            });
                      },
                    ),
              SizedBox(
                height: 14.h,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void navigateToHome(BuildContext context) {
    final GoRouter router = GoRouter.of(context);
    if (router.canPop()) {
      context.canPop();
    } else {
      context.replaceNamed(RouteNames.homeScreen);
    }
  }

  Widget _addressTypeCart(String label, String icon) {
    final addressCon = Provider.of<DeliveryAddressController>(context);
    final isSelected = addressCon.selectedAddressType == label;
    return InkWell(
      onTap: () {
        addressCon.setAddressType(label);
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: kIsWeb ? 6 :6.w, vertical: kIsWeb ? 4 :4.h),
        decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(kIsWeb ? 5 :5.r),
            color:
                isSelected ? CustomColors.baseColor : const Color(0xFFA7BACD)),
        child: Row(
          children: [
            ImageIcon(
              AssetImage(icon),
              color: Colors.white,
            ),
            SizedBox(
              width: kIsWeb ? 8 :8.w,
            ),
            Text(
              label,
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontSize:kIsWeb ? 12 : 12.sp, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    );
  }
}

