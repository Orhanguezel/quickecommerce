import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:quick_ecommerce/controller/bloc/save_bloc/save_event.dart';
import 'package:quick_ecommerce/controller/bloc/support_ticket_list_bloc/support_ticket_list_event.dart';
import 'package:quick_ecommerce/router/route_name.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/settings/suport_details.dart';
import '../../config/icons.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../controller/bloc/support_ticket_list_bloc/support_ticket_list_bloc.dart';
import '../../controller/bloc/support_ticket_list_bloc/support_ticket_list_state.dart';

import '../../l10n/app_localizations.dart';
import '../common_widgets/common_child_button.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_status_card.dart';
import '../common_widgets/no_data_widget.dart';
import '../home/item_card.dart';

class SupportTicketListScreen extends StatefulWidget {
  const SupportTicketListScreen({super.key});

  @override
  State<SupportTicketListScreen> createState() =>
      _SupportTicketListScreenState();
}

class _SupportTicketListScreenState extends State<SupportTicketListScreen> {
  late final SupportTicketListBloc _supportTicketListBloc;
  late final SaveBloc _saveBloc;
  String _token = '';
  @override
  void initState() {
    _supportTicketListBloc = context.read<SupportTicketListBloc>();
    _saveBloc = context.read<SaveBloc>();
    getUserRout();
    super.initState();
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
    _supportTicketListBloc.add(SupportTicketList(
        departmentId: '', status: '', perPage: '', token: _token));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: ! kIsWeb ?  AppBar(
          title: Text(
            AppLocalizations.of(context)!.supportTicketList,
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(fontWeight: FontWeight.w700, fontSize:kIsWeb ?20 : 20.sp),
          ),
          centerTitle: true,
        ):null,
        body: CommonCard(
            widget: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Expanded(
              child:
                  BlocConsumer<SupportTicketListBloc, SupportTicketListState>(
                listener: (context, state) {
                  if (state is SupportTicketListConnectionError) {
                    CommonFunctions.showUpSnack(
                        context: context, message:  AppLocalizations.of(context)!.noInternet);
                  }
                  else if (state is SupportTicketListEmailValidity) {
                    context.pushNamed(RouteNames.emailVerification);
                  }
                },
                builder: (context, state) {
                  if (state is SupportTicketListLoading) {
                    return ListView.builder(
                      itemCount: 10, // Number of shimmer items
                      itemBuilder: (context, index) {
                        return const ShimmerLoadingWidget();
                      },
                    );
                  }
                  else if (state is SupportTicketListLoaded) {
                    if (state.hasConnectionError) {
                      CommonFunctions.showCustomSnackBar(
                          context, AppLocalizations.of(context)!.noInternet);
                    }
                    return state.supportTicketModel.data!.isNotEmpty
                        ? ListView.builder(
                            itemCount: state.supportTicketModel.data!.length,
                            itemBuilder: (context, index) {
                              var data = state.supportTicketModel.data![index];
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        "${AppLocalizations.of(context)!.iD}#${data.id}",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium
                                            ?.copyWith(
                                                fontWeight: FontWeight.w600,
                                                fontSize:kIsWeb ?14 : 14.sp),
                                      ),
                                      const Spacer(),
                                      InkWell(
                                        onTap: () {
                                          showDialog(
                                            context: context,
                                            builder: (BuildContext context) {
                                              return ResolveDialog(
                                                onTap: () {
                                                  _saveBloc.add(ResolveTicket(
                                                      id: Utils.formatString(
                                                          data.id),
                                                      token: _token));
                                                  Navigator.pop(context);
                                                },
                                              );
                                            },
                                          );
                                        },
                                        child: Image.asset(
                                          AssetsIcons.resolve,
                                          fit: BoxFit.cover,
                                          width:kIsWeb ?25 : 25.w,
                                          height:kIsWeb ?25 : 25.h,
                                        ),
                                      ),
                                      SizedBox(
                                        width: kIsWeb ?16 :16.w,
                                      ),
                                      InkWell(
                                        onTap: () {
                                          Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                  builder: (_) => ChatBotScreen(
                                                        ticketId:
                                                            data.id.toString(),
                                                      )));
                                        },
                                        child: Container(
                                          height:kIsWeb ?22 : 22.h,
                                          width:kIsWeb ?22 : 22.w,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF16B4CD),
                                            borderRadius:
                                                BorderRadius.circular(5),
                                          ),
                                          child: Center(
                                            child: Image.asset(
                                              AssetsIcons.eyeSee,
                                              fit: BoxFit.cover,
                                              width: kIsWeb ?11 :11.w,
                                              height: kIsWeb ?11 :11.h,
                                              color: Colors.white,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  SizedBox(
                                    height: kIsWeb ?4 :4.h,
                                  ),
                                  RichText(
                                    text: TextSpan(
                                      text:
                                          '${AppLocalizations.of(context)!.title}: ',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                              fontWeight: FontWeight.w600,
                                              fontSize: kIsWeb ?14 :14.sp),
                                      children: [
                                        TextSpan(
                                          text: data.title,
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyMedium
                                              ?.copyWith(
                                                  fontWeight: FontWeight.w400,
                                                  fontSize: kIsWeb ?12 :12.sp),
                                        ),
                                      ],
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  SizedBox(
                                    height: kIsWeb ?6 :6.h,
                                  ),
                                  Row(
                                    children: [
                                      Text(
                                        "${AppLocalizations.of(context)!.priority}:",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium
                                            ?.copyWith(
                                                fontWeight: FontWeight.w600,
                                                fontSize:kIsWeb ?12 : 12.sp),
                                      ),
                                      SizedBox(
                                        width: kIsWeb ?8 :8.w,
                                      ),
                                      CommonStatusCard(
                                          text: Utils.capitalizeFirstLetter(
                                              data.priority)),
                                      const Spacer(),
                                      CommonStatusCard(
                                          borderColor: const Color(0xFF52B987),
                                          backgroundColor:
                                              const Color(0xFFDEE8E3),
                                          text: data.status == 1
                                              ? "Active"
                                              : "Inactive"),
                                    ],
                                  ),
                                  SizedBox(
                                    height:kIsWeb ?10 : 10.h,
                                  ),
                                  Divider(
                                      thickness: kIsWeb ?1 :1.h,
                                      color: const Color(0xFFCECECE))
                                ],
                              );
                            })
                        : const Center(child: NoDataWidget());
                  }


                  return const SizedBox();
                },
              ),
            ),
            SizedBox(
              height:kIsWeb ?20 : 20.h,
            ),
            CommonButton(
                buttonText: AppLocalizations.of(context)!.createTicket,
                onTap: () {
                  context.pushNamed(RouteNames.supportTicketAdd);
                }),
          ],
        )));
  }
}

class ResolveDialog extends StatelessWidget {
  const ResolveDialog({super.key, required this.onTap});
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      contentPadding: EdgeInsets.all(0.sp),
      content: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 6.h),
        height: kIsWeb ?210 :210.h,
        decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(kIsWeb ?12 :12.r)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: kIsWeb ?20 :20.h,
            ),
            Image.asset(
              AssetsIcons.warningRt,
              height:kIsWeb ?40 : 40.h,
              width:kIsWeb ?47 : 47.w,
            ),
            Text(
              textAlign: TextAlign.center,
              AppLocalizations.of(context)!.areYouSure,
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    fontWeight: FontWeight.w500,
                    fontSize: kIsWeb ?14 :14.sp,
                  ),
            ),
            SizedBox(
              height: kIsWeb ?10 :10.h,
            ),
            Text(
              textAlign: TextAlign.center,
              AppLocalizations.of(context)!.youWantResolve,
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    fontWeight: FontWeight.w500,
                    fontSize: kIsWeb ?14 :14.sp,
                  ),
            ),
            SizedBox(
              height: kIsWeb ?40 :40.h,
            ),
            Row(
              children: [
                ChildButton(
                    widget: Text(
                      AppLocalizations.of(context)!.no,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontSize: kIsWeb ?10 :10.sp,
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                    color: const Color(0xFFFF5555),
                    onPressed: () {
                      Navigator.pop(context);
                    }),
                SizedBox(
                  width: kIsWeb ?12 :12.w,
                ),
                ChildButton(
                    widget: Text(
                      AppLocalizations.of(context)!.yes,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontSize: kIsWeb ?10 :10.sp,
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                    onPressed: onTap),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
