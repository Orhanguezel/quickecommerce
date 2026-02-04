
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_dropdown.dart';

import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../controller/bloc/save_bloc/save_event.dart';
import '../../controller/bloc/save_bloc/save_state.dart';
import '../../controller/provider/common_provider.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/commn_textfield.dart';
import '../common_widgets/common_card.dart';
import '../common_widgets/common_child_button.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/field_title.dart';
import '../home/item_card.dart';

class DeactivateAccount extends StatefulWidget {
  const DeactivateAccount({super.key});

  @override
  State<DeactivateAccount> createState() => _DeactivateAccountState();
}

class _DeactivateAccountState extends State<DeactivateAccount> {
  final TextEditingController describeCon = TextEditingController();
  late final SaveBloc _saveBloc;
  @override
  void initState() {
    _saveBloc = context.read<SaveBloc>();
    getUserToken();
    super.initState();
  }

  String _token = '';

  getUserToken() async {
    String? token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? '';
  }
  List<String> reasonsList=["Not satisfied with products",
   " Found a better deal elsewhere",
   " No longer shopping online",
    "Limited product selection",
   " Shipping issues",
    "Too many marketing emails"
  ];

  @override
  Widget build(BuildContext context) {
    var commonProvider = Provider.of<CommonProvider>(context);
    return Scaffold(
      appBar:! kIsWeb ? AppBar(
        title: Text(
          AppLocalizations.of(context)!.deactivateAccount,
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.w700, fontSize: 20.sp),
        ),
      ):null,
      body: Column(
        children: [
          SizedBox(
            height: 2.h,
          ),
          CommonCard(
              pTop: 26,
              widget: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                   AppLocalizations.of(context)!.deactivateAccount,

                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w700, fontSize: 12.sp),
                  ),
                  SizedBox(
                    height: 8.h,
                  ),
                  Divider(thickness: 1.h, color: const Color(0xFFCECECE)),
                  SizedBox(
                    height: 8.h,
                  ),
                  FieldTitle(
                    title: AppLocalizations.of(context)!.deactivatePurpose,
                  ),
                 CommonDropdown(
                     dList: reasonsList,
                     title: AppLocalizations.of(context)!.deactivatePurpose,
                     dropdownValue: commonProvider.selectedReason,
                     onChanged: (String? value ){
                       commonProvider.setReason(value!);
                     }
                 ),
                  SizedBox(
                    height: 8.h,
                  ),
                  FieldTitle(
                    title: AppLocalizations.of(context)!.describe,
                  ),
                  CommonTextFields(
                    controler: describeCon,
                    hint:
                        "e.g. Let us know why you’re choosing to deactivate your account.",
                    textAlign: TextAlign.start,
                    redOnly: false,
                  ),
                  SizedBox(
                    height: 8.h,
                  ),
                  commonProvider.isLoading
                      ? BlocConsumer<SaveBloc, SaveState>(
                          builder: (_, state) {
                            if (state is SaveLoading) {
                              return const ShimmerLoadingWidget();
                            }
                            return Container(); // Return your default widget here.
                          },
                          listener: (context, state) async {
                            if (state is SaveFailure) {
                              CommonFunctions.showCustomSnackBar(
                                  context, state.authModel.message,
                              );
                              commonProvider.setLoading(false);
                            } else if (state is SaveLoaded) {
                              context.pop();
                              CommonFunctions.showUpSnack(
                                message: state.authModel.message,
                                context: context,
                              );
                              commonProvider.setLoading(false);

                            } else if (state is SaveConnectionError) {
                              CommonFunctions.showCustomSnackBar(
                                context, AppLocalizations.of(context)!.noInternet,
                              );
                              commonProvider.setLoading(false);
                            }
                          },
                        )
                      : ChildButton(
                          color: const Color(0xFFF57C00),
                          widget: Text(
                            AppLocalizations.of(context)!.deactivate,
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12.sp),
                          ),
                          onPressed: () {
                            if(commonProvider.selectedAccountStatus == 'active'){
                              if (commonProvider.selectedReason.isNotEmpty) {
                                _saveBloc.add(ActivateDeactivate(
                                  reason: commonProvider.selectedReason,
                                  description: describeCon.text,
                                  type:  "deactivate",
                                  token: _token,
                                ));
                                commonProvider.setLoading(true);
                              }else{
                                CommonFunctions.showCustomSnackBar(
                                    context, "Please Select Deactivate Reason "
                                );
                              }
                            }else{
                              _saveBloc.add(ActivateDeactivate(
                                reason: "",
                                description: describeCon.text,
                                type: "activate",
                                token: _token,
                              ));
                              commonProvider.setLoading(true);
                            }

                          })
                ],
              )),
        ],
      ),
    );
  }
}
