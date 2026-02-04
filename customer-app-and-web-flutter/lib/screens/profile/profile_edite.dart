import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:intl_phone_field/countries.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_dropdown.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/profile_bloc/profile_bloc.dart';
import '../../controller/bloc/profile_bloc/profile_event.dart';
import '../../controller/bloc/profile_image_upload_bloc/profile_image_upload_bloc.dart';
import '../../controller/bloc/profile_image_upload_bloc/profile_image_upload_event.dart';
import '../../controller/bloc/profile_image_upload_bloc/profile_image_upload_state.dart';
import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../controller/bloc/save_bloc/save_event.dart';
import '../../controller/bloc/save_bloc/save_state.dart';
import '../../controller/provider/common_provider.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/commn_textfield.dart';
import '../common_widgets/common_card.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_phone_number_field.dart';
import '../common_widgets/field_title.dart';
import '../common_widgets/person_avater.dart';

class ProfileEdite extends StatefulWidget {
  final String firstName;
  final String lastName;
  final String phone;
  final String countryCode;
  final String birthday;
  const ProfileEdite(
      {super.key,
      required this.firstName,
      required this.lastName,
      required this.phone,
      required this.countryCode,
      required this.birthday,
      });

  @override
  State<ProfileEdite> createState() => _ProfileEditeState();
}

class _ProfileEditeState extends State<ProfileEdite> {
  final TextEditingController firstNameCon = TextEditingController();
  final TextEditingController lastNameCon = TextEditingController();
  final TextEditingController phoneCon = TextEditingController();

  String _token = '';
  String completeNumber='';
  String initialCountryCode="BD";
  late final SaveBloc _saveBloc;
  late final ProfileImageUploadBloc _imageUploadBloc;
  @override
  void initState() {
    super.initState();
    _saveBloc = context.read<SaveBloc>();
    _imageUploadBloc = context.read<ProfileImageUploadBloc>();
    getUserToken();
    firstNameCon.text = widget.firstName;
    lastNameCon.text = widget.lastName;
    if (widget.countryCode.isNotEmpty && widget.phone.isNotEmpty) {
      final matchedCountry = countries.firstWhere(
            (country) =>  country.code == widget.countryCode &&
                widget.phone.startsWith('+${country.dialCode}'),
        orElse: () => countries.firstWhere((c) => c.code == 'BD'),
      );
      initialCountryCode = matchedCountry.code;
      final dialCode = "+${matchedCountry.dialCode}";
      String cleanPhone = widget.phone.replaceAll(" ", "");
      if (cleanPhone.startsWith(dialCode)) {
        phoneCon.text = cleanPhone.replaceFirst(dialCode, '');
      } else {
        phoneCon.text = cleanPhone;
      }
    }
    final now = DateTime.now();
    _years = List.generate(120, (index) => (now.year - index).toString());
    WidgetsBinding.instance.addPostFrameCallback((_) {
      birthdayBind();
    });
  }

  Future<void> getUserToken() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 300,
      maxHeight: 300,
    );
    if (pickedFile != null) {
      _imageUploadBloc.add(UploadImage(
        image: pickedFile,
        token: _token,
      ));
    }
  }

  List<String> genderList = ["Male", 'Female', 'Others'];
  final List<String> _months = DateFormat.MMMM().dateSymbols.MONTHS;
  final List<String> _days = List.generate(31, (index) => (index + 1).toString());
  late List<String> _years;


  birthdayBind(){
    var commonProvider = Provider.of<CommonProvider>(context,listen: false);
    DateTime date = DateTime.parse(widget.birthday);
    String monthName = _months[date.month - 1];
    commonProvider.setYear(date.year.toString());
    commonProvider.setMonth(monthName);
    commonProvider.setDay(date.day.toString());
  }

  @override
  Widget build(BuildContext context) {
    var commonProvider = Provider.of<CommonProvider>(context);
    return Scaffold(
      appBar:!kIsWeb? AppBar(
        title: Text(
          AppLocalizations.of(context)!.editProfile,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontSize: 18.sp,
              ),
        ),
      ):null,
      body: ListView(
        children: [
          CommonCard(
              mVertical:4,
              mHorizontal:kIsWeb?2: 12,
              widget: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                   Stack(
                    children: [
                      InkWell(
                        onTap:(){
                          _pickImage();
                        },
                        child: AvatarWidget(
                          imageUrl:commonProvider.imageUrl,
                          radius: 50,
                        ),
                      ),
                       Positioned(
                        bottom: 2,
                          right: 2,
                          child: CircleAvatar(
                            backgroundColor: const Color(0xFFE8F1FD),
                            radius:kIsWeb?16: 16.r,
                            child: const Icon(Icons.camera_alt,
                            color: Colors.black,
                            ),
                          )
                      )
                    ],
                  ),

                  SizedBox(width: 19.h),
                  BlocConsumer<ProfileImageUploadBloc, ProfileImageUploadState>(
                    builder: (_, state) {
                      return const SizedBox();
                    },
                    listener: (context, state) {
                      if (state is UploadFailure) {
                        CommonFunctions.showCustomSnackBar(
                          context,
                          state.uploadModel.message,
                        );
                      }
                      if (state is UploadConnectionError) {
                        CommonFunctions.showCustomSnackBar(
                            context, AppLocalizations.of(context)!.noInternet);
                      }
                      if (state is UploadLoaded) {
                        CommonFunctions.showUpSnack(
                            context: context,
                            message: state.uploadModel.message);
                        WidgetsBinding.instance.addPostFrameCallback((_) {
                          final data = state.uploadModel;
                          if (data.imageId != null && data.imageUrl != null) {
                            commonProvider.setImageId(
                                Utils.formatInt(data.imageId), data.imageUrl);
                          }
                        });
                      }
                    },
                  ),
                ],
              ),
              SizedBox(
                height: 18.h,
              ),
              FieldTitle(
                title: AppLocalizations.of(context)!.firstName,
              ),
              CommonTextField(
                  controler: firstNameCon,
                  hint: AppLocalizations.of(context)!.enterFirstName,
                  textAlign: TextAlign.start,
                  redOnly: false),
              SizedBox(
                height: 18.h,
              ),
              FieldTitle(
                title: AppLocalizations.of(context)!.lastName,
              ),
              CommonTextField(
                  controler: lastNameCon,
                  hint: AppLocalizations.of(context)!.enterLastName,
                  textAlign: TextAlign.start,
                  redOnly: false),
              SizedBox(
                height: 14.h,
              ),
              FieldTitle(
                title: AppLocalizations.of(context)!.phone,
              ),
              CommonPhoneField(
                controller: phoneCon,
                initialCountryCode: initialCountryCode,
                hintText: AppLocalizations.of(context)!.enterPhone,
                onChanged: (value) {
                  completeNumber = value.completeNumber;
                },
              ),
              SizedBox(
                height: 14.h,
              ),
              FieldTitle(
                title: AppLocalizations.of(context)!.gender,
              ),
              CommonDropdown(
                  dList: genderList,
                  dropdownValue: commonProvider.selectedGender,
                  onChanged: (String? value) {
                    commonProvider.setGender(value!);
                  }),
              SizedBox(
                height: 14.h,
              ),
              FieldTitle(
                title: AppLocalizations.of(context)!.birthday,
              ),
              Row(
                children: [
                  Expanded(
                      child: CommonDropdown(
                        dropdownValue: commonProvider.month,
                          dList: _months,
                          onChanged: (String? value) {
                            commonProvider.setMonth(value!);
                          }
                      )
                  ),
                  SizedBox(width: 4.w,),
                  Expanded(
                      child: CommonDropdown(
                          dropdownValue: commonProvider.day,
                          dList: _days, onChanged: (String? value) {
                        commonProvider.setDay(value!);
                      })),
                  SizedBox(width: 4.w,),
                  Expanded(
                      child: CommonDropdown(
                          dropdownValue: commonProvider.year,
                          dList: _years, onChanged: (String? value) {
                        commonProvider.setYear(value!);
                      })),
                ],
              ),
              SizedBox(
                height: 18.h,
              ),
            ],
          )),
          BlocConsumer<SaveBloc, SaveState>(
            builder: (_, state) {
              if (state is SaveLoading) {
                return  const CommonLoadingButton();
              }
              return   CommonButton(
                  buttonText: AppLocalizations.of(context)!.saveChanges,
                  onTap: () {
                    String birthDay="${commonProvider.day} ${commonProvider.month} ${commonProvider.year}";
                    String completeDate;
                    try {
                      completeDate = birthDay.isEmpty
                          ? widget.birthday
                          : DateFormat('yyyy-MM-dd').format(
                        DateFormat("d MMMM yyyy").parse(birthDay),
                      );
                    } catch (e) {
                      completeDate = widget.birthday;
                    }
                    if (firstNameCon.text.isNotEmpty) {
                      _saveBloc.add(ProfileEdit(
                        firstName: firstNameCon.text,
                        lastName: lastNameCon.text,
                        phone: completeNumber.isNotEmpty?completeNumber:widget.phone,
                        image: commonProvider.imageId.toString(),
                        birthDay:completeDate,
                        gender: commonProvider.selectedGender.toLowerCase(),
                        token: _token,
                      ));
                    } else {
                      CommonFunctions.showCustomSnackBar(
                          context,
                          "${AppLocalizations.of(context)!.firstName} ${AppLocalizations.of(context)!.fieldRequired}"
                      );
                    }
                  }
              );
            },
            listener: (context, state) async {
              if (state is SaveFailure) {
                CommonFunctions.showUpSnack(
                  message: state.authModel.message,
                  context: context,
                );
              } else if (state is SaveLoaded) {
                context.read<ProfileBloc>().add(Profile(token: _token));
                context.pop();
              } else if (state is SaveConnectionError) {
                CommonFunctions.showUpSnack(
                  message: AppLocalizations.of(context)!.noInternet,
                  context: context,
                );
              }
            },
          ),
          SizedBox(
            height: 18.h,
          ),
        ],
      ),
    );
  }
}





