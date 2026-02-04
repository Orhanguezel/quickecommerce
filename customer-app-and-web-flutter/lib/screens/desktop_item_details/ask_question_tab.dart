import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/shared_preference_helper.dart';
import 'package:quick_ecommerce/config/user_shared_preference.dart';
import 'package:quick_ecommerce/controller/bloc/question_bloc/question_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/question_bloc/question_event.dart';
import 'package:quick_ecommerce/controller/bloc/question_bloc/question_state.dart';
import 'package:quick_ecommerce/controller/bloc/save_bloc/save_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/save_bloc/save_event.dart';
import 'package:quick_ecommerce/controller/bloc/save_bloc/save_state.dart';
import 'package:quick_ecommerce/controller/provider/common_provider.dart';
import 'package:quick_ecommerce/controller/provider/item_details_controler.dart';
import 'package:quick_ecommerce/screens/common_widgets/commn_textfield.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_child_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_funcktion.dart';
import 'package:quick_ecommerce/screens/common_widgets/field_title.dart';
import 'package:quick_ecommerce/screens/common_widgets/no_data_widget.dart';
import 'package:quick_ecommerce/screens/home/item_card.dart';

import '../../l10n/app_localizations.dart';
import '../auth_screens/login_confirmation_dailog.dart';

class DesktopAskQuestionPage extends StatefulWidget {
  const DesktopAskQuestionPage(
      {super.key, required this.productId, required this.storeId});
  final String productId;
  final String storeId;
  @override
  DesktopAskQuestionPageState createState() => DesktopAskQuestionPageState();
}

class DesktopAskQuestionPageState extends State<DesktopAskQuestionPage> {
  late final QuestionBloc _contactBloc;
  late final SaveBloc _saveBloc;
  final TextEditingController questionCon = TextEditingController();
  String _token = '';
  @override
  void initState() {
    _contactBloc = context.read<QuestionBloc>();
    _saveBloc = context.read<SaveBloc>();
    Provider.of<CommonProvider>(context, listen: false).setLoading(false);
    getData();
    super.initState();
  }

  getData() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
    _contactBloc.add(QuestionDadaEvent(
        productId: widget.productId, search: "", perPage: "3"));
  }

  @override
  Widget build(BuildContext context) {
    var variantCon = Provider.of<ItemDetailsProvider>(context);
    var commonCon = Provider.of<CommonProvider>(context);
    return Column(
      children: [
        const SizedBox(
          height: 10,
        ),
        Row(
          children: [
            Text(AppLocalizations.of(context)!.questionAndAnswers,
                style: Theme.of(context).textTheme.displayLarge!.copyWith(
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                    )),
            const Spacer(),
            ChildButton(
                padding: EdgeInsets.symmetric(vertical: 6.h, horizontal: 12.w),
                color: const Color(0xFF1A73E8),
                widget: Text(AppLocalizations.of(context)!.askSellerQuestion,
                    style: Theme.of(context).textTheme.titleLarge!.copyWith(
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                        )),
                onPressed: () {
                  if(_token.isNotEmpty){
                    if (variantCon.isQuestionListShow) {
                      variantCon.setQuestionListShow(false);
                    }
                    else {
                      variantCon.setQuestionListShow(true);
                    }
                  }else {
                    showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return const ConfirmationDialog();
                      },
                    );
                  }
                }),
          ],
        ),
        const SizedBox(
          height: 10,
        ),
        variantCon.isQuestionListShow
            ? Expanded(
                child: BlocConsumer<QuestionBloc, QuestionState>(
                  listener: (context, state) {
                    if (state is QuestionConnectionError) {
                      CommonFunctions.showUpSnack(
                          context: context,
                          message: AppLocalizations.of(context)!.noInternet);
                    } else if (state is QuestionFailure) {}
                  },
                  builder: (context, state) {
                    if (state is QuestionLoading) {
                      return ListView.builder(
                        itemCount: 4, // Number of shimmer items
                        itemBuilder: (context, index) {
                          return const ShimmerLoadingWidget();
                        },
                      );
                    } else if (state is QuestionLoaded) {
                      return state.questionModel.data!.isNotEmpty
                          ? ListView.builder(
                              scrollDirection: Axis.vertical,
                              physics: const AlwaysScrollableScrollPhysics(),
                              itemCount: state.questionModel.data!.length,
                              itemBuilder: (context, index) {
                                final data = state.questionModel.data![index];
                                return Container(
                                  margin: const EdgeInsets.symmetric(
                                      horizontal: 0, vertical: 6),
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 15, vertical: 13),
                                  decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(3.r),
                                      color: const Color(0xFFFAFAFB)),
                                  child: Column(
                                    children: [
                                      Row(
                                        children: [
                                          CircleAvatar(
                                            radius: 20.r,
                                            backgroundColor:
                                                const Color(0xFF164C96),
                                            child: Text("A.T",
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .titleLarge!
                                                    .copyWith(
                                                      fontSize: 12,
                                                      fontWeight:
                                                          FontWeight.w400,
                                                    )),
                                          ),
                                          const SizedBox(
                                            width: 10,
                                          ),
                                          Text(
                                              "${AppLocalizations.of(context)!.question}:${data.question ?? ""}",
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium!
                                                  .copyWith(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w400,
                                                  )),
                                        ],
                                      ),
                                      data.reply != null
                                          ? CommonCard(
                                              widget: Row(
                                              children: [
                                                CircleAvatar(
                                                  radius: 20.r,
                                                  backgroundColor:
                                                      const Color(0xFF16965A),
                                                  child: Text("A.T",
                                                      style: Theme.of(context)
                                                          .textTheme
                                                          .titleLarge!
                                                          .copyWith(
                                                            fontSize: 12,
                                                            fontWeight:
                                                                FontWeight.w400,
                                                          )),
                                                ),
                                                const SizedBox(
                                                  width: 10,
                                                ),
                                                Column(
                                                  children: [
                                                    Text(
                                                        "${AppLocalizations.of(context)!.answers}:${data.reply ?? ""}",
                                                        style: Theme.of(context)
                                                            .textTheme
                                                            .titleLarge!
                                                            .copyWith(
                                                              fontSize: 12,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w400,
                                                            )),
                                                    Text(
                                                        "${AppLocalizations.of(context)!.date}:${data.repliedAt ?? ""}",
                                                        style: Theme.of(context)
                                                            .textTheme
                                                            .bodyMedium!
                                                            .copyWith(
                                                              fontSize: 12,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w400,
                                                            )),
                                                  ],
                                                ),
                                              ],
                                            ))
                                          : const SizedBox(),
                                    ],
                                  ),
                                );
                              },
                            )
                          : const Center(child: NoDataWidget());
                    }

                    return const SizedBox();
                  },
                ),
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  FieldTitle(
                    title: AppLocalizations.of(context)!
                        .reachOutToTheSellerDirectly,
                  ),
                  CommonTextFields(
                    controler: questionCon,
                    hint: AppLocalizations.of(context)!.writeYourQuestion,
                    textAlign: TextAlign.start,
                    redOnly: false,
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  commonCon.isLoading
                      ? BlocConsumer<SaveBloc, SaveState>(
                          listener: (context, state) {
                            if (state is SaveConnectionError) {
                              CommonFunctions.showUpSnack(
                                  context: context,
                                  message:
                                      AppLocalizations.of(context)!.noInternet);
                              commonCon.setLoading(false);
                            } else if (state is SaveFailure) {
                              CommonFunctions.showUpSnack(
                                  context: context,
                                  message: state.authModel.message);
                              commonCon.setLoading(false);
                            }
                          },
                          builder: (context, state) {
                            if (state is SaveLoading) {
                              return const CommonLoadingButton();
                            } else if (state is SaveLoaded) {
                              WidgetsBinding.instance.addPostFrameCallback((_) {
                                variantCon.setQuestionListShow(true);
                                commonCon.setLoading(false);
                                questionCon.clear();
                                _contactBloc.add(QuestionDadaEvent(
                                  productId: widget.productId,
                                  search: "",
                                  perPage: "3",
                                ));
                                CommonFunctions.showCustomSnackBar(
                                  color: Colors.green,
                                  context,
                                  state.authModel.message,
                                );
                              });
                            }
                            return const SizedBox();
                          },
                        )
                      : Row(
                          children: [
                            ChildButton(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 6, horizontal: 12),
                                color: const Color(0xFFEE4B2B),
                                widget: Text(
                                    AppLocalizations.of(context)!.cancel,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleLarge!
                                        .copyWith(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w400,
                                        )),
                                onPressed: () {
                                  if (variantCon.isQuestionListShow) {
                                    variantCon.setQuestionListShow(false);
                                  } else {
                                    variantCon.setQuestionListShow(true);
                                  }
                                }),
                            SizedBox(
                              width: 10.w,
                            ),
                            ChildButton(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 6, horizontal: 12),
                                color: const Color(0xFF1A73E8),
                                widget: Text(
                                    AppLocalizations.of(context)!.submit,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleLarge!
                                        .copyWith(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w400,
                                        )),
                                onPressed: () {
                                  if (questionCon.text.isNotEmpty) {
                                    commonCon.setLoading(true);
                                    _saveBloc.add(AskQuestion(
                                        productId: widget.productId,
                                        storeId: widget.storeId,
                                        question: questionCon.text,
                                        token: _token));
                                  } else {
                                    CommonFunctions.showCustomSnackBar(context,
                                        "${AppLocalizations.of(context)!.question} ${AppLocalizations.of(context)!.fieldRequired}");
                                  }
                                }),
                          ],
                        ),
                ],
              )
      ],
    );
  }
}
