import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/bloc/contact_bloc/contact_event.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/icons.dart';
import '../../config/images.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/contact_bloc/contact_bloc.dart';
import '../../controller/bloc/contact_bloc/contact_state.dart';
import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../controller/bloc/save_bloc/save_event.dart';
import '../../controller/bloc/save_bloc/save_state.dart';
import '../../controller/provider/authentication_provider.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/commn_textfield.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_phone_number_field.dart';
import '../common_widgets/field_title.dart';
import '../home/item_card.dart';

class ContactUs extends StatefulWidget {
  const ContactUs({super.key});

  @override
  State<ContactUs> createState() => _ContactUsState();
}

class _ContactUsState extends State<ContactUs> {
  final TextEditingController nameCon = TextEditingController();
  final TextEditingController emailCon = TextEditingController();
  final TextEditingController phoneCon = TextEditingController();
  final TextEditingController messageCon = TextEditingController();
  late final ContactBloc _contactBloc;
  late final SaveBloc _saveBloc;
    String _language = '';
  String completeNumber='';
  String initialCountryCode="BD";
  @override
  void initState() {
    _contactBloc = context.read<ContactBloc>();
    _saveBloc = context.read<SaveBloc>();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _language = language ?? "";
    _contactBloc.add( ContactUsEvent(language: _language));

  }

  final Map<String, String> iconMap = {
    "Facebook": AssetsIcons.facebook,
    "Twitter": AssetsIcons.twitter,
    "LinkedIn": AssetsIcons.linkedin,
    "Instagram": AssetsIcons.instagram,
  };
  LatLng _initialPosition = const LatLng(23.8103, 90.4125);
  late GoogleMapController mapController;
  @override
  Widget build(BuildContext context) {
    var authProvider = Provider.of<AuthenticationProvider>(context);
    return Scaffold(
      appBar: !kIsWeb
          ?AppBar(
        centerTitle: true,
        title: Text(
          AppLocalizations.of(context)!.contact,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontSize: 18.sp,
              ),
        ),
      ):null,
      body: ListView(
        children: [
          BlocConsumer<ContactBloc, ContactState>(
            builder: (context, state) {
              if (state is ContactLoading) {
                return const ShimmerLoadingWidget();
              } else if (state is ContactLoaded) {
                final data = state.contactModel.content!;
                _initialPosition = LatLng(data.mapSection?.coordinates!.lat??0.0,
                    data.mapSection?.coordinates!.lng??0.0);
                return Column(
                  children: [
                    CommonCard(
                      mVertical: 4,
                      mHorizontal: kIsWeb?0: 16.h,
                        widget: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          data.contactFormSection?.title,
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(
                                  fontWeight: FontWeight.w600, fontSize:kIsWeb?18: 18.sp),
                        ),
                        SizedBox(height:kIsWeb?10: 10.h),
                        Text(
                          data.contactFormSection?.subtitle,
                          textAlign: TextAlign.start,
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(
                                  fontWeight: FontWeight.w400, fontSize:kIsWeb?14: 14.sp),
                        ),
                        SizedBox(height:kIsWeb?20: 20.h),
                        FieldTitle(
                            title: AppLocalizations.of(context)!.enterFullName,
                            star: "*"),
                        SizedBox(height:kIsWeb?4: 4.h),
                        CommonTextField(
                            controler: nameCon,
                            hint: "Your name",
                            textAlign: TextAlign.start,
                            redOnly: false),
                        SizedBox(height: kIsWeb?4:4.h),
                        FieldTitle(
                            title: AppLocalizations.of(context)!.enterEmail,
                            star: "*"),
                        SizedBox(height:kIsWeb?4: 4.h),
                        CommonTextField(
                            controler: emailCon,
                            hint: "jhone@gmail.com",
                            textAlign: TextAlign.start,
                            inputFormatters: [
                              LengthLimitingTextInputFormatter(255),
                            ],
                            redOnly: false),
                        SizedBox(height: 4.h),
                        FieldTitle(
                            title: AppLocalizations.of(context)!.phone,
                            star: "*"),
                        SizedBox(height: 4.h),
                        CommonPhoneField(
                          controller: phoneCon,
                          initialCountryCode: initialCountryCode,
                          hintText: AppLocalizations.of(context)!.enterPhone,
                          onChanged: (value) {
                            completeNumber = value.completeNumber;
                          },
                        ),
                        SizedBox(height:kIsWeb?10: 10.h),
                        FieldTitle(
                          title: AppLocalizations.of(context)!.message,star: "*"
                        ),
                        CommonTextFields(
                          controler: messageCon,
                          hint: "Your message details",
                          textAlign: TextAlign.start,
                          redOnly: false,
                        ),
                        SizedBox(height: kIsWeb?10:10.h),
                        BlocConsumer<SaveBloc, SaveState>(
                          listener: (context,state){
                            if(state is SaveConnectionError){
                              CommonFunctions.showUpSnack(
                                  context: context,
                                  message: AppLocalizations.of(context)!.noInternet
                              );
                            }
                            else if (state is SaveFailure){
                              CommonFunctions.showUpSnack(
                                  context: context,
                                  message: state.authModel.message
                              );
                            }
                            else if(state is SaveLoaded){
                              CommonFunctions.showUpSnack(
                                message:state.authModel.message,
                                context: context,
                              );
                            }
                          },
                          builder: (context,state){
                            if(state is SaveLoading){
                              return const CommonLoadingButton();
                            }

                            return CommonButton(
                                buttonText:   AppLocalizations.of(context)!.sendMessage, onTap: () {
                              authProvider.checkEmailValidity(emailCon.text);
                              bool validUserEmail = authProvider.isValidEmail;
                              if(nameCon.text.isNotEmpty){
                                if(emailCon.text.isNotEmpty){
                                  if(validUserEmail){
                                    if(phoneCon.text.isNotEmpty){
                                      if(messageCon.text.isNotEmpty){
                                        _saveBloc.add(ContactMessage(
                                            name: nameCon.text,
                                            email: emailCon.text,
                                            phone: completeNumber,
                                            message:messageCon.text ));
                                      }else {
                                        CommonFunctions.showCustomSnackBar(
                                            context,
                                            "${AppLocalizations.of(context)!.message} ${AppLocalizations.of(context)!.fieldRequired}"
                                        );
                                      }

                                    }else {
                                      CommonFunctions.showCustomSnackBar(
                                          context,
                                          "${AppLocalizations.of(context)!.phone} ${AppLocalizations.of(context)!.fieldRequired}"
                                      );
                                    }
                                  } else {
                                    CommonFunctions.showCustomSnackBar(context,
                                        AppLocalizations.of(context)!.enterValidEmail);
                                  }
                                }
                                else {
                                  CommonFunctions.showCustomSnackBar(
                                      context,
                                      "${AppLocalizations.of(context)!.email} ${AppLocalizations.of(context)!.fieldRequired}"
                                  );
                                }
                              }  else {
                                CommonFunctions.showCustomSnackBar(
                                    context,
                                    "${AppLocalizations.of(context)!.name} ${AppLocalizations.of(context)!.fieldRequired}"
                                );
                              }
                            }
                            );
                          },
                        )
                      ],
                    )),
                    CommonCard(
                        mHorizontal: kIsWeb?0: 16.h,
                        widget: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: Image.network(
                            Utils.formatString(data.contactDetailsSection?.imageUrl),
                            fit: BoxFit.fill,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) {
                                return child; // Image loaded
                              }
                              return SizedBox(
                                width:kIsWeb?226: 226.w,
                                height:kIsWeb?200: 200.h,
                                child: Center(
                                  child: CircularProgressIndicator(
                                    value: loadingProgress.expectedTotalBytes != null
                                        ? loadingProgress.cumulativeBytesLoaded /
                                        (loadingProgress.expectedTotalBytes ?? 1)
                                        : null,
                                  ),
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) {
                              return Image.asset(
                                Images.noImage,
                                fit: BoxFit.cover,
                                width:kIsWeb?226: 226.w,
                                height: kIsWeb?200:200.h,
                              ); // Fallback image
                            },
                            width: kIsWeb?226:226.w,
                            height: kIsWeb?200:200.h,
                          ),
                        ),
                        SizedBox(height:kIsWeb?10: 10.h),
                        FieldTitle(
                          title: AppLocalizations.of(context)!.address,
                        ),
                        socialContactCrd(AssetsIcons.startLocation,
                            data.contactDetailsSection?.address),
                        SizedBox(height:kIsWeb?16: 16.h),
                        FieldTitle(
                          title: AppLocalizations.of(context)!.phone,
                        ),
                        socialContactCrd(AssetsIcons.call,
                            data.contactDetailsSection?.phone),
                        SizedBox(height:kIsWeb?16: 16.h),
                        FieldTitle(
                          title: AppLocalizations.of(context)!.email,
                        ),
                        socialContactCrd(AssetsIcons.email,
                            data.contactDetailsSection?.email),
                        SizedBox(height:kIsWeb?16: 16.h),
                        FieldTitle(
                          title: AppLocalizations.of(context)!.website,
                        ),
                        InkWell(
                            onTap: () async {
                              final url = data.contactDetailsSection?.website;
                              if (await canLaunchUrl(Uri.parse(url))) {
                                await launchUrl(Uri.parse(url),
                                    mode: LaunchMode.externalApplication);
                              } else {
                                throw 'Could not launch $url';
                              }
                            },
                            child: socialContactCrd(AssetsIcons.language,
                                data.contactDetailsSection?.website)),
                        SizedBox(height: kIsWeb?16:16.h),
                        FieldTitle(
                          title: AppLocalizations.of(context)!.socialConnect,
                        ),
                        SizedBox(height: kIsWeb?16:16.h),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.start,
                          children:
                              data.contactDetailsSection!.social!.map((item) {
                            String? iconPath =
                                iconMap[item.icon ?? '']; // Get the asset path
                            String? url = item.url; // Get the URL

                            if (iconPath == null) {
                              return const SizedBox.shrink(); // Skip if no icon
                            }
                            return GestureDetector(
                              onTap: () async {
                                if (url != null) {
                                  if (await canLaunchUrl(Uri.parse(url))) {
                                    await launchUrl(Uri.parse(url),
                                        mode: LaunchMode.externalApplication);
                                  } else {
                                    throw 'Could not launch $url';
                                  }
                                }
                              },
                              child: Padding(
                                padding: EdgeInsets.only(right:kIsWeb?20: 20.w),
                                child: CircleAvatar(
                                  backgroundColor: const Color(0xFF3578EA),
                                  radius: kIsWeb?22:22.r,
                                  child: Image.asset(
                                    iconPath,
                                    height:kIsWeb?25: 25.h,
                                    width:kIsWeb?25: 25.w,
                                    //color: Colors.white,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        SizedBox(height: kIsWeb?16:16.h),
                      ],
                    )),
                    CommonCard(
                      mVertical: 4,
                      mHorizontal: kIsWeb?0: 16.h,
                      widget: SizedBox(
                        height: kIsWeb?337:337.h,
                        child: GoogleMap(
                          initialCameraPosition: CameraPosition(
                            target: _initialPosition,
                            zoom: 12,
                          ),
                          onMapCreated: (controller) {
                            mapController = controller;
                          },
                          markers: {
                            Marker(
                              markerId: const MarkerId('selected-location'),
                              position: _initialPosition,
                            )
                          },
                        ),
                      ),
                    )
                  ],
                );
              }
              return const SizedBox();
            },
            listener: (context, state) {
              if (state is ContactConnectionError) {
                CommonFunctions.showUpSnack(
                  message: AppLocalizations.of(context)!.noInternet,
                  context: context,
                );
              }
            },
          ),

        ],
      ),
    );
  }

  Widget socialContactCrd(String icon, String title) {
    return Row(
      children: [
        CircleAvatar(
          backgroundColor: const Color(0xFF3578EA),
          radius: kIsWeb?22:22.r,
          child: Image.asset(
            icon,
            height: kIsWeb?25:25.h,
            width: kIsWeb?25:25.w,
            color:Colors.white,
          ),
        ),
        SizedBox(width:kIsWeb?10: 10.h),
        Text(
          title,
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(fontWeight: FontWeight.w500, fontSize: kIsWeb?14:14.sp),
        ),
      ],
    );
  }
}

class SocialIconsRow extends StatelessWidget {
  final List<Map<String, String>> social;

  const SocialIconsRow({required this.social, super.key});

  @override
  Widget build(BuildContext context) {
    // Mapping icon names to asset paths
    final Map<String, String> iconMap = {
      "Facebook": AssetsIcons.facebook,
      "Twitter": AssetsIcons.twitter,
      "LinkedIn": AssetsIcons.linkedin,
      "Instagram": AssetsIcons.instagram,
    };

    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: social.map((item) {
        String? iconPath = iconMap[item['icon'] ?? '']; // Get the asset path
        String? url = item['url']; // Get the URL

        if (iconPath == null) return const SizedBox.shrink(); // Skip if no icon

        return GestureDetector(
          onTap: () {
            if (url != null) {
            }
          },
          child: Padding(
            padding: EdgeInsets.only(right: kIsWeb?20:20.w),
            child: CircleAvatar(
              backgroundColor: const Color(0xFF3578EA),
              radius: kIsWeb?22:22.r,
              child: Image.asset(
                iconPath,
                height:kIsWeb?25: 25.h,
                width:kIsWeb?25: 25.w,
                color: Colors.white,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
