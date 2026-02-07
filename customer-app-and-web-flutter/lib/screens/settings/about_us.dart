import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_html/flutter_html.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/policy_bloc/policy_bloc.dart';
import '../../controller/bloc/policy_bloc/policy_event.dart';
import '../../controller/bloc/policy_bloc/policy_state.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_loading.dart';
import '../common_widgets/no_data_widget.dart';

class AboutUs extends StatefulWidget {
  const AboutUs({super.key});

  @override
  State<AboutUs> createState() => _AboutUsState();
}

class _AboutUsState extends State<AboutUs> {
  late final PolicyBloc _policyBloc;
  String _token = '', _language = '';

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
    _policyBloc.add(PolicyData(
      base: "about-us",
      language: _language,
      token: _token,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: !kIsWeb
          ? AppBar(
              centerTitle: true,
              title: Text(
                "Hakkımızda",
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontSize: 18,
                    ),
              ),
            )
          : null,
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: BlocConsumer<PolicyBloc, PolicyState>(
          builder: (_, state) {
            if (state is PolicyLoading) {
              return const CommonLoading();
            } else if (state is PolicyLoaded) {
              return state.policyModel.content != null
                  ? SingleChildScrollView(
                      scrollDirection: Axis.vertical,
                      child: Html(
                        data: state.policyModel.content,
                        style: {
                          "body": Style(
                            fontSize: FontSize(kIsWeb ? 14 : 14),
                            fontWeight: FontWeight.w400,
                            lineHeight: const LineHeight(1.5),
                            textAlign: TextAlign.justify,
                          ),
                          "p": Style(margin: Margins.zero),
                          "ul": Style(
                              margin: Margins.zero,
                              padding: HtmlPaddings.zero),
                          "li": Style(margin: Margins.zero),
                          "h2": Style(margin: Margins.zero),
                          "h3": Style(margin: Margins.zero),
                        },
                      ),
                    )
                  : const Center(child: NoDataWidget());
            }
            return Container();
          },
          listener: (context, state) {
            if (state is PolicyConnectionError) {
              CommonFunctions.showUpSnack(
                message: "Bağlantı hatası",
                context: context,
              );
            }
          },
        ),
      ),
    );
  }
}
