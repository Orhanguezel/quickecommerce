// import 'package:flutter/material.dart';
// import 'package:flutter_bloc/flutter_bloc.dart';
// import 'package:flutter_gen/gen_l10n/app_localizations.dart';
// import 'package:flutter_screenutil/flutter_screenutil.dart';
// import 'package:provider/provider.dart';
//
// import '../../config/shared_preference_helper.dart';
// import '../../config/strings.dart';
// import '../../config/user_shared_preference.dart';
// import '../../controller/bloc/save_bloc/cancel_order_bloc.dart';
// import '../../controller/bloc/save_bloc/cancel_order_event.dart';
// import '../../controller/bloc/save_bloc/cancel_order_state.dart';
// import '../../controller/provider/common_provider.dart';
// import '../common_widgets/commn_textfield.dart';
// import '../common_widgets/common_card.dart';
// import '../common_widgets/common_child_button.dart';
// import '../common_widgets/common_funcktion.dart';
// import '../common_widgets/common_loading.dart';
// import '../common_widgets/field_title.dart';
// class DeleteAccount extends StatefulWidget {
//   const DeleteAccount({super.key});
//
//   @override
//   State<DeleteAccount> createState() => _DeleteAccountState();
// }
//
// class _DeleteAccountState extends State<DeleteAccount> {
//   final TextEditingController describeCon = TextEditingController();
//   final TextEditingController reasonCon = TextEditingController();
//   late final SaveBloc _saveBloc;
//   @override
//   void initState() {
//     _saveBloc = context.read<SaveBloc>();
//     getUserToken();
//     super.initState();
//   }
//   String _token = '';
//
//   getUserToken() async {
//     String? token = await UserSharedPreference.getValue(
//       SharedPreferenceHelper.token,
//     );
//     _token = token ?? '';
//   }
//   @override
//   Widget build(BuildContext context) {
//     var commonProvider = Provider.of<CommonProvider>(context);
//     return Scaffold(
//       appBar: AppBar(
//         title: Text(
//           AppLocalizations.of(context)!.deleteAccount,
//           style: Theme.of(context)
//               .textTheme
//               .titleLarge
//               ?.copyWith(fontWeight: FontWeight.w700, fontSize: 20.sp),
//         ),
//       ),
//       body: Column(
//         children: [
//           SizedBox(height: 2.h,),
//           CommonCard(
//               pTop: 26,
//               widget: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Text(
//                     AppLocalizations.of(context)!.deleteAccount,
//                     style: Theme.of(context)
//                         .textTheme
//                         .bodyMedium
//                         ?.copyWith(fontWeight: FontWeight.w700, fontSize: 12.sp),
//                   ),
//                   SizedBox(
//                     height: 8.h,
//                   ),
//                   Divider(thickness: 1.h, color: const Color(0xFFCECECE)),
//                   SizedBox(
//                     height: 8.h,
//                   ),
//                   FieldTitle(
//                     title: AppLocalizations.of(context)!.deactivatePurpose,
//
//                   ),
//                   CommonTextField(
//                     controler: reasonCon,
//                     hint: "e.g. Let us know why you’re choosing to deactivate your account.",
//                     textAlign: TextAlign.start,
//                     redOnly: false,
//                   ),
//                   SizedBox(
//                     height: 8.h,
//                   ),
//                   FieldTitle(
//                     title: AppLocalizations.of(context)!.describe,
//                   ),
//                   CommonTextFields(
//                     controler: describeCon,
//                     hint: "e.g. Let us know why you’re choosing to deactivate your account.",
//                     textAlign: TextAlign.start,
//                     redOnly: false,
//                   ),
//                   SizedBox(
//                     height: 8.h,
//                   ),
//                   commonProvider.isLoading
//                       ? BlocConsumer<SaveBloc, SaveState>(
//                     builder: (_, state) {
//                       if (state is SaveLoading) {
//                         return const CommonLoading();
//                       }
//                       return Container(); // Return your default widget here.
//                     },
//                     listener: (context, state) async {
//                       if (state is SaveFailure) {
//                         CommonFunctions.showUpSnack(
//                           message: state.authModel.message,
//                           context: context,
//                         );
//                         commonProvider.setLoading(false);
//                       } else if (state is SaveLoaded) {
//                         commonProvider.setLoading(false);
//                       } else if (state is SaveConnectionError) {
//                         CommonFunctions.showUpSnack(
//                           message: AllString.noInternet,
//                           context: context,
//                         );
//                         commonProvider.setLoading(false);
//                       }
//                     },
//                   )
//                  : ChildButton(
//                       color: const Color(0xFFFF5555),
//                       widget: Text(
//                         AppLocalizations.of(context)!.deleteAccount,
//                         style: Theme.of(context)
//                             .textTheme
//                             .titleLarge
//                             ?.copyWith(fontWeight: FontWeight.w400, fontSize: 12.sp),
//                       ),
//                       onPressed: (){
//                         if(reasonCon.text.isNotEmpty){
//                           _saveBloc.add(DeleteAccountEvent(
//                             reason: reasonCon.text,
//                             description:describeCon.text,
//                             token:_token ,));
//                         }
//
//                       }
//                   )
//                 ],
//               )),
//         ],
//       ),
//     );
//   }
// }
