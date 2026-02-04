import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/bloc/profile_bloc/profile_event.dart';
import 'package:quick_ecommerce/controller/bloc/profile_bloc/profile_state.dart';
import 'package:quick_ecommerce/controller/bloc/save_bloc/save_event.dart';
import 'package:quick_ecommerce/screens/common_widgets/commn_textfield.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_child_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_dropdown.dart';

import '../../config/shared_preference_helper.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/profile_bloc/profile_bloc.dart';
import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../controller/bloc/save_bloc/save_state.dart';
import '../../controller/bloc/support_ticket_list_bloc/support_ticket_list_bloc.dart';
import '../../controller/bloc/support_ticket_list_bloc/support_ticket_list_event.dart';
import '../../controller/provider/common_provider.dart';
import '../../data/data_model/department_model.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/field_title.dart';

class SupportTicketAdd extends StatefulWidget {
  const SupportTicketAdd(
      {super.key,
      this.id = '',
      this.title = '',
      this.subject = '',
      this.edit = false});
  final String id;
  final String title;
  final String subject;
  final bool edit;
  @override
  State<SupportTicketAdd> createState() => _SupportTicketAddState();
}

class _SupportTicketAddState extends State<SupportTicketAdd> {
  late final SaveBloc _saveBloc;
  late final ProfileBloc _profileBloc;
  late final SupportTicketListBloc _supportTicketListBloc;
  final TextEditingController subjectCon = TextEditingController();
  final TextEditingController titleCon = TextEditingController();
  final List<String> priorities = ["low", "high", "medium", "urgent"];
  late List<DepartmentData> data = [];
  String _token = '';
  @override
  void initState() {
    _saveBloc = context.read<SaveBloc>();
    _profileBloc = context.read<ProfileBloc>();
    _supportTicketListBloc = context.read<SupportTicketListBloc>();
    getUserRout();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      valueAsign();
    });
    super.initState();
  }

  valueAsign() {
    if (widget.id.isNotEmpty) {
      titleCon.text = widget.title;
      subjectCon.text = widget.subject;
    }
  }

  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
    _profileBloc.add(DepartmentList(token: _token));
  }

  @override
  Widget build(BuildContext context) {
    var commonCon = Provider.of<CommonProvider>(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.edit==true
              ? AppLocalizations.of(context)!.updateTicket
              : AppLocalizations.of(context)!.createTicket,
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.w700, fontSize: 20.sp),
        ),
        leading: IconButton(
            onPressed: () {
              context.pop();
            },
            icon: const Icon(
              Icons.arrow_back,
              color: Colors.white,
            )),
        centerTitle: true,
      ),
      body: ListView(
        children: [
          CommonCard(
              widget: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 10.h,
              ),
              FieldTitle(
                title: AppLocalizations.of(context)!.title,
                star: '*',
              ),
              CommonTextField(
                  controler: titleCon,
                  hint: "Enter your Ticket Title",
                  textAlign: TextAlign.start,
                  redOnly: false),
              SizedBox(
                height: 10.h,
              ),
              FieldTitle(
                title: AppLocalizations.of(context)!.ticketSubject,
                star: '*',
              ),
              CommonTextField(
                  controler: subjectCon,
                  hint: "Enter your ticket subject",
                  textAlign: TextAlign.start,
                  redOnly: false),
              SizedBox(
                height: 10.h,
              ),
              BlocConsumer<ProfileBloc, ProfileState>(
                listener: (context, state) {
                  if (state is ProfileConnectionError) {
                    CommonFunctions.showUpSnack(
                        context: context, message: AppLocalizations.of(context)!.noInternet);
                  } else if (state is ProfileFailure) {}
                },
                builder: (context, state) {
                  if (state is ProfileLoading) {
                    return const SizedBox();
                  } else if (state is DepartmentLoaded) {
                    data = state.departmentModel.data;
                    List departmentList =
                        data.map((data) => data.label).toList();
                    return state.departmentModel.data.isNotEmpty
                        ? Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              FieldTitle(
                                title: AppLocalizations.of(context)!.department,
                                star: '*',
                              ),
                              CommonDropdown(
                                  title:
                                      AppLocalizations.of(context)!.department,
                                  dList: departmentList,
                                  dropdownValue: commonCon.selectedDepartment,
                                  onChanged: (String? value) {
                                    if (value != null) {
                                      var id = data
                                          .firstWhere((e) => e.label == value)
                                          .value;
                                      commonCon.setDepartment(
                                          value, id.toString());
                                    }
                                  }),
                            ],
                          )
                        : const SizedBox();
                  }

                  return const SizedBox();
                },
              ),
              SizedBox(
                height: 10.h,
              ),
              FieldTitle(
                title: AppLocalizations.of(context)!.priorityType,
                star: '*',
              ),
              CommonDropdown(
                  title: AppLocalizations.of(context)!.priorityType,
                  dList: priorities,
                  dropdownValue: commonCon.selectedPriority,
                  onChanged: (String? value) {
                    commonCon.setPriority(value!);
                  }),
              SizedBox(
                height: 10.h,
              ),
              BlocConsumer<SaveBloc, SaveState>(
                listener: (context, state) {
                  if (state is SaveConnectionError) {
                    CommonFunctions.showUpSnack(
                        context: context, message: AppLocalizations.of(context)!.noInternet);
                    commonCon.setLoading(false);
                  } else if (state is SaveFailure) {
                    CommonFunctions.showUpSnack(
                        context: context, message: state.authModel.message);
                    commonCon.setLoading(false);
                  } else if (state is SaveLoaded) {
                    CommonFunctions.showUpSnack(
                      message: state.authModel.message,
                      context: context,
                    );
                    _supportTicketListBloc.add(SupportTicketList(
                        departmentId: '', status: '', perPage: '', token: _token));
                    commonCon.setLoading(false);
                    if (context.canPop()) {
                      context.pop();
                    } else {
                      context.goNamed(RouteNames.supportTicketListScreen);
                    }
                  }
                },
                builder: (context, state) {
                  if (state is SaveLoading) {
                    return const CommonLoadingButton();
                  }
                  return Row(
                    children: [
                      ChildButton(
                          color: const Color(0xFFE44343),
                          widget: Text(
                            AppLocalizations.of(context)!.cancel,
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 11.sp),
                          ),
                          onPressed: () {
                            context.pop();
                          }),
                      SizedBox(
                        width: 8.w,
                      ),
                      ChildButton(
                          color: const Color(0xFF1A73E8),
                          widget: Text(
                            widget.edit==true
                                ? AppLocalizations.of(context)!.updateTicket
                                : AppLocalizations.of(context)!.submit,
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 11.sp),
                          ),
                          onPressed: () {
                            if (titleCon.text.trim().isNotEmpty) {
                              if (subjectCon.text.trim().isNotEmpty) {
                                if (commonCon.selectedDepartment.isNotEmpty) {
                                  commonCon.setLoading(true);
                                  if (widget.id.isNotEmpty) {
                                    _saveBloc.add(UpdateTicket(
                                        id: widget.id,
                                        departmentId:
                                            commonCon.selectedDepartmentId,
                                        title: titleCon.text,
                                        subject: subjectCon.text,
                                        priority: commonCon.selectedPriority,
                                        token: _token));
                                  } else {
                                    _saveBloc.add(AddTicket(
                                        departmentId:
                                            commonCon.selectedDepartmentId,
                                        title: titleCon.text,
                                        subject: subjectCon.text,
                                        priority: commonCon.selectedPriority,
                                        token: _token));
                                  }
                                }
                              }
                            }
                          }),
                    ],
                  );
                },
              ),
            ],
          )),
        ],
      ),
    );
  }
}
