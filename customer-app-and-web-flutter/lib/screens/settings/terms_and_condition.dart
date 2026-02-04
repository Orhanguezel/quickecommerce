import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/policy_bloc/policy_bloc.dart';
import '../../controller/bloc/policy_bloc/policy_event.dart';
import '../../controller/bloc/policy_bloc/policy_state.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_loading.dart';
import '../common_widgets/no_data_widget.dart';

class TermsAndCondition extends StatefulWidget {
  const TermsAndCondition({super.key});

  @override
  State<TermsAndCondition> createState() => _TermsAndConditionState();
}

class _TermsAndConditionState extends State<TermsAndCondition> {
  late final PolicyBloc _policyBloc;
  String _token='',_language='';
  @override
  void initState() {
    super.initState();
    _policyBloc = context.read<PolicyBloc>();
    getUserToken();
  }
  Future<void> getUserToken() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    var language = await UserSharedPreference.getValue(
      SharedPreferenceHelper.languageCode,
    );
    _token = token ?? "";
    _language = language ?? "";
    _policyBloc.add(PolicyData(base: "terms-conditions",language:_language, token: _token, ));
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: !kIsWeb
          ? AppBar(
        centerTitle: true,
        title: Text(
          AppLocalizations.of(context)!.termsAndConditions,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontSize: kIsWeb ? 18 : 18.sp, // Different font size based on platform
          ),
        ),
      )
          : null,
      body: Padding(
        padding:  EdgeInsets.symmetric(horizontal:kIsWeb ? 16 :16.w,vertical: kIsWeb ? 16 :16.h),
        child:    BlocConsumer<PolicyBloc, PolicyState>(
          builder: (_, state) {
            if ( state is PolicyLoading) {
              return const CommonLoading();
            } else if (state is PolicyLoaded) {
              if ( state.hasConnectionError) {
                CommonFunctions.showCustomSnackBar(
                    context, AppLocalizations.of(context)!.noInternet);
              }

              return state.policyModel.content!=null?  SingleChildScrollView(
                scrollDirection: Axis.vertical,
                child:Html(
                  data: state.policyModel.content,
                  style: {
                    "body": Style(
                      fontSize: FontSize( kIsWeb ? 14 :14.sp),
                      fontWeight: FontWeight.w400,
                      lineHeight: const LineHeight(1.5),
                      textAlign: TextAlign.justify,
                      margin: Margins.zero, // Remove body margin
                      padding: HtmlPaddings.zero, // Remove body padding
                    ),
                    "p": Style(
                      margin: Margins.zero,
                    ),
                    "ul": Style(
                      margin: Margins.zero,
                      padding: HtmlPaddings.zero,
                    ),
                    "li": Style(
                      margin: Margins.zero,
                    ),
                    "hr": Style(
                      margin: Margins.zero,
                      padding: HtmlPaddings.zero,
                      height: Height(1.0),
                    ),
                    "h2": Style(
                      margin: Margins.zero,
                    ),
                    "h3": Style(
                      margin: Margins.zero,
                    ),
                  },
                )
              ): const Center(child: NoDataWidget());
            }
            return Container();
          },
          listener: (context, state) {
            if (state is PolicyConnectionError) {
              CommonFunctions.showUpSnack(
                message: AppLocalizations.of(context)!.noInternet,
                context: context,
              );
            } else if (state is PolicyFailure) {
              CommonFunctions.showUpSnack(
                message: "Something went wrong",
                context: context,
              );
            }
          },
        ),
      ),
    );
  }
}
