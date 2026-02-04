
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/router/route_name.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../controller/bloc/save_bloc/save_event.dart';
import '../../controller/bloc/save_bloc/save_state.dart';
import '../../controller/provider/common_provider.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_card.dart';
import '../common_widgets/common_child_button.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_loading.dart';
class DeactivateOrDeleteAccount extends StatefulWidget {
  const DeactivateOrDeleteAccount({super.key});

  @override
  State<DeactivateOrDeleteAccount> createState() =>
      _DeactivateOrDeleteAccountState();
}

class _DeactivateOrDeleteAccountState extends State<DeactivateOrDeleteAccount> {

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
        title: Text(
          AppLocalizations.of(context)!.deactivateDeleteAccount,
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.w700, fontSize: 20.sp),),
      ),
      body: Column(
        children: [
          CommonCard(
            pBottom: 18,
            mVertical: 4.h,
            widget: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  AppLocalizations.of(context)!.deactivateTemporary,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(fontWeight: FontWeight.w700, fontSize: 12.sp),
                ),
                SizedBox(
                  height: 8.h,
                ),
                Text(
                  AppLocalizations.of(context)!.deactivateNote,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(fontWeight: FontWeight.w400, fontSize: 10.sp),
                ),
                SizedBox(
                  height: 11.h,
                ),
                ChildButton(
                    color: const Color(0xFFF57C00),
                    widget: Text(
                      AppLocalizations.of(context)!.deactivate,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w400, fontSize: 12.sp),
                    ),
                    onPressed: () {
                      context.pushNamed(RouteNames.deactivateAccount);
                    })
              ],
            ),
          ),
          CommonCard(
            pBottom: 18,
            mVertical: 4.h,
            widget: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  AppLocalizations.of(context)!.deletePermanent,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(fontWeight: FontWeight.w700, fontSize: 12.sp),
                ),
                SizedBox(
                  height: 8.h,
                ),
                Text(
                  AppLocalizations.of(context)!.deleteAccountNote,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(fontWeight: FontWeight.w400, fontSize: 10.sp),
                ),
                SizedBox(
                  height: 11.h,
                ),
               ChildButton(
                    color: const Color(0xFFFF5555),
                    widget: Text(
                      AppLocalizations.of(context)!.deleteAccount,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w400, fontSize: 12.sp),
                    ),
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return  const AccountDeleteDialog();
                        },
                      );
                    })
              ],
            ),
          ),
        ],
      ),
    );
  }
}



class AccountDeleteDialog extends StatefulWidget {
  const AccountDeleteDialog({super.key});


  @override
  State<AccountDeleteDialog> createState() => _AccountDeleteDialogState();
}

class _AccountDeleteDialogState extends State<AccountDeleteDialog> {
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
  @override
  Widget build(BuildContext context) {
    var commonProvider = Provider.of<CommonProvider>(context);
    return AlertDialog(
      contentPadding: EdgeInsets.all(kIsWeb ? 0:0.sp),
      content: Container(
        height: kIsWeb ? 200:200.h,
        decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(kIsWeb ? 12:12.r)
        ),
        child: Column(
          children: [
            SizedBox(height: kIsWeb ? 30:30.h,),
            Image.asset(
              AssetsIcons.warning,
              height: kIsWeb ? 40:40.h,
              width: kIsWeb ? 47:47.w,
            ),
            SizedBox(height: kIsWeb ? 10:10.h,),
            Text(
              AppLocalizations.of(context)!.areYouSure,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w700,
                fontSize: kIsWeb ? 16:16.sp,
              ),
            ),
            SizedBox(height: kIsWeb ? 8:8.h,),
            Text(
              AppLocalizations.of(context)!.youWantDeleteAccount,
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                fontWeight: FontWeight.w400,
                fontSize:kIsWeb ? 12: 12.sp,
              ),
            ),
            SizedBox(height: kIsWeb ? 8:8.h,),
          BlocConsumer<SaveBloc, SaveState>(
              builder: (_, state) {
                if (state is SaveLoading) {
                  return const CommonLoading();
                }
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ChildButton(
                        color: const Color(0xFFA7BACD),
                        widget: Text(
                          AppLocalizations.of(context)!.no,
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w500,
                            fontSize: kIsWeb ? 12:12.sp,
                          ),
                        ),
                        onPressed: () {
                          Navigator.pop(context);
                        }),
                    SizedBox(width:kIsWeb ? 8: 8.w,),
                    ChildButton(
                        widget: Text(
                          AppLocalizations.of(context)!.yes,
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w500,
                            fontSize: kIsWeb ? 12:12.sp,
                          ),
                        ),
                        onPressed:(){
                          _saveBloc.add(DeleteAccountEvent(
                            token:_token ,));
                        }),
                  ],
                );
              },
              listener: (context, state) async {
                if (state is SaveFailure) {
                  CommonFunctions.showUpSnack(
                    message: state.authModel.message,
                    context: context,
                  );
                  commonProvider.setLoading(false);
                } else if (state is SaveLoaded) {
                  Navigator.pop(context);
                  commonProvider.setLoading(false);
                } else if (state is SaveConnectionError) {
                  CommonFunctions.showUpSnack(
                    message: AppLocalizations.of(context)!.noInternet,
                    context: context,
                  );
                  commonProvider.setLoading(false);
                }
              },
            )
          ],
        ),
      ),
    );
  }
}