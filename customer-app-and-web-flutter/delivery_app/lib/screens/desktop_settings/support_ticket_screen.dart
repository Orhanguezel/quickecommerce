import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/bloc/save_bloc/save_event.dart';
import 'package:quick_ecommerce/controller/bloc/support_ticket_list_bloc/support_ticket_list_event.dart';
import 'package:quick_ecommerce/router/route_name.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_button.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import '../../config/icons.dart';
import '../../config/images.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/get_messsage_bloc/get_message_bloc.dart';
import '../../controller/bloc/get_messsage_bloc/get_message_event.dart';
import '../../controller/bloc/get_messsage_bloc/get_message_state.dart';
import '../../controller/bloc/message_send_bloc/message_send_bloc.dart';
import '../../controller/bloc/message_send_bloc/message_send_event.dart';
import '../../controller/bloc/message_send_bloc/message_send_state.dart';
import '../../controller/bloc/profile_bloc/profile_bloc.dart';
import '../../controller/bloc/profile_bloc/profile_event.dart';
import '../../controller/bloc/profile_bloc/profile_state.dart';
import '../../controller/bloc/save_bloc/save_bloc.dart';
import '../../controller/bloc/save_bloc/save_state.dart';
import '../../controller/bloc/support_ticket_detail_bloc/support_ticket_detail_bloc.dart';
import '../../controller/bloc/support_ticket_detail_bloc/support_ticket_detail_event.dart';
import '../../controller/bloc/support_ticket_detail_bloc/support_ticket_detail_state.dart';
import '../../controller/bloc/support_ticket_list_bloc/support_ticket_list_bloc.dart';
import '../../controller/bloc/support_ticket_list_bloc/support_ticket_list_state.dart';

import '../../controller/provider/common_provider.dart';
import '../../controller/provider/message_input_conroller.dart';
import '../../data/data_model/department_model.dart';

import '../../data/data_model/tickate_message_model.dart';
import '../../data/data_model/ticket_detail_model.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/commn_textfield.dart';
import '../common_widgets/common_child_button.dart';
import '../common_widgets/common_dropdown.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_loading.dart';
import '../common_widgets/common_status_card.dart';
import '../common_widgets/field_title.dart';
import '../common_widgets/image_view.dart';
import '../common_widgets/no_data_widget.dart';
import '../home/item_card.dart';

class SupportTicket extends StatefulWidget {
  const SupportTicket({super.key});

  @override
  State<SupportTicket> createState() =>
      _SupportTicketState();
}

class _SupportTicketState extends State<SupportTicket> {
  late final SupportTicketListBloc _supportTicketListBloc;
  late final SaveBloc _saveBloc;


  final ScrollController _scrollController = ScrollController();
  final TextEditingController messageCon = TextEditingController();
  late final SupportTicketDetailBloc _ticketDetailBloc;
  late final GetMessageBloc _getMessageBloc;
  late final MessageSendBloc _messageSendBloc;


  void _onScroll() {
    if (_scrollController.position.pixels ==
        _scrollController.position.maxScrollExtent) {
      _loadMoreMessage();
    }
  }
  void _loadMoreMessage() {
    var commonCon = Provider.of<CommonProvider>(context,listen: false);
    if (commonCon.trendingCurrentPage < commonCon.trendingTotalPages) {
      commonCon.goToTrendingNextPage();
      _getMessageBloc
          .add(GetMessage(ticketId:ticketId, token: _token));
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  List<MessageData> messageData = [];
  String _token = '',ticketId='';
  bool isEdit=false;
  bool _isInitialLoad = true;
  @override
  void initState() {
    _supportTicketListBloc = context.read<SupportTicketListBloc>();
    _saveBloc = context.read<SaveBloc>();
    _ticketDetailBloc = context.read<SupportTicketDetailBloc>();
    _getMessageBloc = context.read<GetMessageBloc>();
    _messageSendBloc = context.read<MessageSendBloc>();
    _scrollController.addListener(_onScroll);
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
    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;
    final children = [
      SizedBox(
        width: screenWidth < 750? screenWidth / 2 : screenWidth /3,
        child:CommonCard(
            mHorizontal: 2,
            mVertical: 4,
            pLeft: 6,
            pRight: 6,
            widget: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    ChildButton(
                        widget:  Text(AppLocalizations.of(context)!.createTicket,
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(
                              fontWeight: FontWeight.w600,
                              fontSize: 14),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        onPressed: (){
                          showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return const TicketAdd(id: '', title: '', subject: '', edit: false,);
                            },
                          );
                        }
                    )
                  ],
                ),
                const SizedBox(
                  height: 10,
                ),
                SizedBox(
                  height:screenWidth > 950? screenHeight *0.7 :screenHeight * 0.5,
                  child: BlocConsumer<SupportTicketListBloc, SupportTicketListState>(
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
                        if(state.supportTicketModel.data!.isNotEmpty){
                          ticketId=Utils.formatString(state.supportTicketModel.data!.first.id);
                          _ticketDetailBloc.add(TicketDetails(id: ticketId, token: _token));
                          _getMessageBloc
                              .add(GetMessage(ticketId: ticketId, token: _token));
                        }

                        return state.supportTicketModel.data!.isNotEmpty
                            ? ListView.builder(
                            itemCount: state.supportTicketModel.data!.length,
                            itemBuilder: (context, index) {
                              var data = state.supportTicketModel.data![index];
                              return Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 6),
                                child: Column(
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
                                              fontSize: 14),
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
                                            width: 25,
                                            height: 25,
                                          ),
                                        ),
                                        const SizedBox(
                                          width: 16,
                                        ),
                                        InkWell(
                                          onTap: () {

                                            ticketId=Utils.formatString(data.id);
                                            _ticketDetailBloc.add(TicketDetails(id: ticketId, token: _token));
                                            _getMessageBloc
                                                .add(GetMessage(ticketId: ticketId, token: _token));
                                          },
                                          child: Container(
                                            height: 22,
                                            width: 22,
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF16B4CD),
                                              borderRadius:
                                              BorderRadius.circular(5),
                                            ),
                                            child: Center(
                                              child: Image.asset(
                                                AssetsIcons.eyeSee,
                                                fit: BoxFit.cover,
                                                width: 11,
                                                height: 11,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(
                                      height: 4,
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
                                            fontSize: 14),
                                        children: [
                                          TextSpan(
                                            text: data.title,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyMedium
                                                ?.copyWith(
                                                fontWeight: FontWeight.w400,
                                                fontSize: 12),
                                          ),
                                        ],
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                    const SizedBox(
                                      height: 6,
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
                                              fontSize: 12),
                                        ),
                                        const SizedBox(
                                          width: 8,
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
                                    const SizedBox(
                                      height: 10,
                                    ),
                                    const Divider(
                                        thickness: 1,
                                        color: Color(0xFFCECECE))
                                  ],
                                ),
                              );
                            })
                            : const Center(child: NoDataWidget());
                      }
                      return const SizedBox();
                    },
                  ),
                ),
              ],
            )),
      ),
      SizedBox(
        width: screenWidth < 750 ? screenWidth / 2 :screenWidth /3,
        height: MediaQuery.of(context).size.height,
        child:CommonCard(
            mHorizontal: 2,
            mVertical: 4,
            pLeft: 6,
            pRight: 6,
            widget:Column(
              children: [
                BlocConsumer<SupportTicketDetailBloc, SupportTicketDetailState>(
                  listener: (context, state) {
                    if (state is TicketDetailConnectionError) {
                      CommonFunctions.showCustomSnackBar(
                          context, AppLocalizations.of(context)!.noInternet
                      );
                    }
                    else if (state is TicketDetailFailure) {
                      CommonFunctions.showCustomSnackBar(
                          context, "Something went wrong");
                    }
                  },
                  builder: (context, state) {
                    if (state is TicketDetailLoading) {
                      return const CommonLoading();
                    } else if (state is TicketDetailLoaded) {
                      if (state.hasConnectionError) {
                        CommonFunctions.showCustomSnackBar(
                            context, AppLocalizations.of(context)!.noInternet);
                      }
                      return TicketInfo(data: state.ticketDetailsModel.data!);
                    }

                    return const SizedBox();
                  },
                ),
                SizedBox(
                  height:screenHeight * 0.5,
                  child: CommonCard(
                      mHorizontal: 2,
                      mVertical: 4,
                      widget: Column(
                        children: [
                          Expanded(
                            child: BlocConsumer<GetMessageBloc, GetMessageState>(
                              listener: (context, state) {
                                if (state is GetMessageConnectionError) {
                                  CommonFunctions.showCustomSnackBar(
                                      context,  AppLocalizations.of(context)!.noInternet);
                                }
                                else if (state is GetMessageFailure) {}
                              },
                              builder: (context, state) {
                                if (state is GetMessageLoading) {
                                  return _isInitialLoad&&messageData.isEmpty?
                                  const CommonLoading()
                                      : ListView.builder(
                                    controller: _scrollController,
                                    padding: EdgeInsets.symmetric(
                                        vertical: 10.0.w, horizontal: 16.0.w),
                                    itemCount: messageData.length,
                                    itemBuilder: (context, index) {
                                      final messagesData = messageData[index];
                                      final message = messagesData.message as Message;
                                      final isUser = message.role ==
                                          'customer_level';
                                      return Column(
                                        children: [
                                          message.message!=null?_buildMessageBubble(
                                              message.message, isUser):const SizedBox(),
                                          message.file!=null&&message.file.isNotEmpty?
                                          InkWell(
                                            onTap:(){
                                              showDialog(
                                                context: context,
                                                builder: (BuildContext context) {
                                                  return AlertDialog(
                                                    contentPadding: EdgeInsets.all(0.sp),
                                                    content:  SizedBox(
                                                      height: 400,
                                                      width: 400,
                                                      child: FullScreenImageView(
                                                        imageUrl: message.file,
                                                        tag: 'imageHero_${message.file}',
                                                      ),
                                                    ),
                                                  );
                                                },
                                              );
                                            },
                                            child: Align(
                                              alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                                              child: Padding(
                                                padding:  EdgeInsets.symmetric(vertical:4.h ),
                                                child: ClipRRect(
                                                    borderRadius: BorderRadius.circular(8.r),
                                                    child: Image.network(
                                                      message.file, // Replace with your image asset
                                                      width: 150,
                                                      height: 100,
                                                      fit: BoxFit.cover,
                                                      errorBuilder: (context, error, stackTrace) {
                                                        return Image.asset(
                                                          Images.noImage,
                                                          fit: BoxFit.cover,
                                                          width: 64,
                                                          height:  64,
                                                        ); // Fallback image
                                                      },
                                                    )
                                                ),
                                              ),
                                            ),
                                          )
                                              :const SizedBox(),
                                        ],
                                      );
                                    },
                                  );
                                }
                                else if (state is GetMessageLoaded) {
                                  if ( state.hasConnectionError) {
                                    CommonFunctions.showCustomSnackBar(
                                        context,  AppLocalizations.of(context)!.noInternet);
                                  }
                                  _scrollToBottom();
                                  _isInitialLoad = false;
                                  final data = state.ticketMessageModel.data;
                                  if (data.isNotEmpty) {
                                    messageData = data;
                                  }
                                  return data.isNotEmpty
                                      ? ListView.builder(
                                    controller: _scrollController,
                                    shrinkWrap: true,
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 10, horizontal: 16),
                                    itemCount: data.length,
                                    itemBuilder: (context, index) {
                                      final messageData = data[index];
                                      final message = messageData.message as Message;
                                      final isUser = message.role ==
                                          'customer_level';
                                      return Column(
                                        children: [
                                          message.message!=null?_buildMessageBubble(
                                              message.message, isUser):const SizedBox(),
                                          message.file!=null&&message.file.isNotEmpty?
                                          InkWell(
                                            onTap:(){
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (_) => FullScreenImageView(
                                                    imageUrl: message.file,
                                                    tag: 'imageHero_${message.file}',
                                                  ),
                                                ),
                                              );
                                            },
                                            child: Align(
                                              alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                                              child: Padding(
                                                padding:  EdgeInsets.symmetric(vertical:4.h ),
                                                child: ClipRRect(
                                                    borderRadius: BorderRadius.circular(8.r),
                                                    child: Image.network(
                                                      message.file, // Replace with your image asset
                                                      width: 150,
                                                      height: 100,
                                                      fit: BoxFit.cover,
                                                      errorBuilder: (context, error, stackTrace) {
                                                        return Image.asset(
                                                          Images.noImage,
                                                          fit: BoxFit.cover,
                                                          width: 64,
                                                          height:  64,
                                                        ); // Fallback image
                                                      },
                                                    )
                                                ),
                                              ),
                                            ),
                                          )
                                              :const SizedBox(),
                                        ],
                                      );
                                    },
                                  )
                                      :  Center(child: Text(
                                    AppLocalizations.of(context)!.youConversationStartsHere,
                                    style: Theme.of(context)
                                        .textTheme
                                        .displayLarge
                                        ?.copyWith(fontWeight: FontWeight.w400, fontSize: 14),
                                  ));
                                }
                                return const SizedBox();
                              },
                            ),
                          ),
                          Consumer<MessageInputProvider>(
                            builder: (context, imageCon, _) {
                              if (imageCon.selectedImage != null && imageCon.selectedImage!.path.isNotEmpty) {
                                return SizedBox(
                                  height: 50,
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 4),
                                    child:Align(
                                      alignment: Alignment.centerLeft,
                                      child:Stack(
                                        children: [
                                          ClipRRect(
                                            borderRadius: BorderRadius.circular(4),
                                            child: Image.file(
                                              File(imageCon.selectedImage!.path),
                                              width: 50,
                                              height: 50,
                                              fit: BoxFit.cover,
                                              errorBuilder: (context, error, stackTrace) =>
                                              const Icon(Icons.broken_image, size: 40),
                                            ),
                                          ),
                                          Positioned(
                                            top: -10,
                                            right: -10,
                                            child: IconButton(
                                              icon: const Icon(Icons.cancel, size: 16, color: Colors.red),
                                              onPressed: () {
                                                imageCon.removeSelectedImage();
                                              },
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              } else {
                                return const SizedBox(); // Or show a placeholder if needed
                              }
                            },
                          ),

                          // Input section
                          _buildInputSection(),
                        ],
                      )
                  ),
                ),
              ],
            )
        ),
      ),
    ];
    return Scaffold(
        body:screenWidth > 950
            ? Flex(
          crossAxisAlignment: CrossAxisAlignment.start,
          direction: Axis.horizontal,
          children: children,
        )
            : SingleChildScrollView(
          child: Flex(
            crossAxisAlignment: CrossAxisAlignment.start,
            direction: Axis.vertical,
            children: children,
          ),
        ),

    );
  }

  Widget _buildMessageBubble(String message, bool isUser) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        padding: EdgeInsets.all(kIsWeb ?10 :10.w),
        margin: EdgeInsets.symmetric(vertical:kIsWeb ?5 : 5.h, horizontal:kIsWeb ?0 : 0.w),
        decoration: BoxDecoration(
          color: isUser ? Colors.blue : Colors.grey[300],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          message,
          style: TextStyle(
            color: isUser ? Colors.white : Colors.black,
            fontSize: 16,
          ),
        ),
      ),
    );
  }

  Future<void> _pickImage() async {
    var imageCon = Provider.of<MessageInputProvider>(context,listen: false);
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 300,
      maxHeight: 300,
    );
    if (pickedFile != null) {
      imageCon.setSelectedImage(pickedFile);
    }
  }

  Widget _buildInputSection() {
    var imageCon = Provider.of<MessageInputProvider>(context,listen: false);
    return Container(
      padding: const EdgeInsets.all(8),
      child: Row(
        children: [
          InkWell(
            onTap: () {
              _pickImage();
            },
            child: Image.asset(
              AssetsIcons.attach,
              width: 20,
              height: 25,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                  border: Border(
                    top: BorderSide(color: Colors.grey[300]!, width: 1),
                  ),
                ),
                child: TextField(
                  controller: messageCon,
                  readOnly: imageCon.selectedImage != null && imageCon.selectedImage!.path.isNotEmpty,
                  style: Theme.of(context).textTheme.displayLarge!.copyWith(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                  ),
                  decoration: InputDecoration(
                    hintText: AppLocalizations.of(context)!.typeMessage,
                    hintStyle: Theme.of(context).textTheme.displayLarge!.copyWith(
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                    ),
                    border: InputBorder.none,
                  ),
                )),
          ),
          const SizedBox(width: 8),
          BlocConsumer<MessageSendBloc, MessageSendState>(
            listener: (context, state) {
              if (state is MessageSendFailure) {
                CommonFunctions.showUpSnack(
                    context: context, message: state.authModel.message);
              }

            },
            builder: (context, state) {
              if (state is MessageSendLoading) {
                return SizedBox(
                  width: 51,
                  height: 51,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Image.asset(
                        AssetsIcons.send,
                        width: 51,
                        height: 51,
                        fit: BoxFit.cover,
                      ),
                      const CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    ],
                  ),
                );
              }
              else if (state is MessageSendLoaded) {
                if (state.hasConnectionError) {
                  CommonFunctions.showUpSnack(
                    message: AppLocalizations.of(context)!.noInternet,
                    context: context,
                  );
                }
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  _getMessageBloc
                      .add(GetMessage(ticketId:ticketId, token: _token));
                  messageCon.clear();
                  imageCon.removeSelectedImage();
                });
              }
              return InkWell(
                onTap: () {

                  if (messageCon.text.isNotEmpty||imageCon.selectedImage!=null) {
                    _messageSendBloc.add(SendTicketMessage(
                        message:messageCon.text,
                        image:imageCon.selectedImage ?? XFile(''),
                        ticketId:ticketId,
                        token: _token));
                  }
                },
                child: Image.asset(
                  AssetsIcons.send,
                  width: 51,
                  height: 51,
                ),
              );
            },
          ),
        ],
      ),
    );
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
        height: 210.h,
        decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(12.r)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: 20.h,
            ),
            Image.asset(
              AssetsIcons.warningRt,
              height: 40.h,
              width: 47.w,
            ),
            Text(
              textAlign: TextAlign.center,
              AppLocalizations.of(context)!.areYouSure,
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    fontWeight: FontWeight.w500,
                    fontSize: 14.sp,
                  ),
            ),
            SizedBox(
              height: 10.h,
            ),
            Text(
              textAlign: TextAlign.center,
              AppLocalizations.of(context)!.youWantResolve,
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    fontWeight: FontWeight.w500,
                    fontSize: 14.sp,
                  ),
            ),
            SizedBox(
              height: 40.h,
            ),
            Row(
              children: [
                ChildButton(
                    widget: Text(
                      AppLocalizations.of(context)!.no,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontSize: 10.sp,
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                    color: const Color(0xFFFF5555),
                    onPressed: () {
                      Navigator.pop(context);
                    }),
                SizedBox(
                  width: 12.w,
                ),
                ChildButton(
                    widget: Text(
                      AppLocalizations.of(context)!.yes,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontSize: 10.sp,
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


class TicketAdd extends StatefulWidget {
  const TicketAdd({super.key, required this.id, required this.title, required this.subject, required this.edit});
  final String id;
  final String title;
  final String subject;
  final bool edit;
  @override
  State<TicketAdd> createState() => _TicketAddState();
}

class _TicketAddState extends State<TicketAdd> {
  final TextEditingController subjectCon = TextEditingController();
  final TextEditingController titleCon = TextEditingController();
  final List<String> priorities = ["low", "high", "medium", "urgent"];
  late List<DepartmentData> data = [];
  late final SaveBloc _saveBloc;
  late final ProfileBloc _profileBloc;
  late final SupportTicketListBloc _supportTicketListBloc;
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
    return AlertDialog(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      content: SizedBox(
        height: 400,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(
              height: 10,
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
                              fontSize: 11),
                        ),
                        onPressed: () {
                          context.pop();
                        }),
                    const SizedBox(
                      width: 8,
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
                              fontSize: 11),
                        ),
                        onPressed: () {
                          if (titleCon.text.trim().isNotEmpty) {
                            if (subjectCon.text.trim().isNotEmpty) {
                              if (commonCon.selectedDepartment.isNotEmpty) {
                                commonCon.setLoading(true);
                                if (widget.id.isNotEmpty) {
                                  _saveBloc.add(UpdateTicket(
                                      id:widget.id,
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
        ),
      ),
    );
  }
}

class TicketInfo extends StatelessWidget {
  const TicketInfo({super.key, required this.data});
  final TicketData data;
  @override
  Widget build(BuildContext context) {
    var commonCon = Provider.of<CommonProvider>(context);
    return CommonCard(
      mHorizontal: 2,
      mVertical: 4,
      widget: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppLocalizations.of(context)!.serviceRequestDetails,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(fontWeight: FontWeight.w600, fontSize: 14),
          ),
          const Divider(thickness: 1, color: Color(0xFFCECECE)),
          TicketDetailRow(
              label: "${AppLocalizations.of(context)!.ticketID}:",
              value:Utils.formatString(data.ticketId)),
          TicketDetailRow(
              label: "${AppLocalizations.of(context)!.title}:",
              value: Utils.formatString(data.title)),
          TicketDetailRow(
              label: "${AppLocalizations.of(context)!.subject}:",
              value:Utils.formatString( data.subject)),
          Row(
            children: [
              Text(
                "${AppLocalizations.of(context)!.status}:",
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w500, fontSize: 10),
              ),
              const SizedBox(width: 30,),
              SizedBox(
                  width: 80,
                  child: CommonStatusCard(
                      text: data.status == 1 ? "Active" : "Inactive")),
            ],
          ),
          const SizedBox(height: 8,),
          Row(
            children: [
              Text(
                "${AppLocalizations.of(context)!.priority}:",

                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w500, fontSize: 10),
              ),
              const SizedBox(width: 26,),
              SizedBox(
                  width: 80, child: CommonStatusCard(
                  backgroundColor:const Color(0xFFFFECE5),
                  borderColor: const Color(0xFFFF7678),
                  text:Utils.formatString( data.priority))),
              const Spacer(),
              if(data.status == 1)
                InkWell(
                  onTap: () {
                    showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return  TicketAdd(
                          id:Utils.formatString(data.ticketId),
                          title: Utils.formatString(data.title),
                          subject: Utils.formatString(data.subject),
                          edit: true,);
                      },
                    );
                    commonCon.setDepartment(data.departmentName,Utils.formatString(data.departmentId));
                    commonCon.setPriority(Utils.formatString(data.priority));
                  },
                  child: Image.asset(
                    AssetsIcons.edit,
                    height: 20,
                    width: 20,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
class TicketDetailRow extends StatelessWidget {
  final String label;
  final String value;

  const TicketDetailRow({
    super.key,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: Text(
              label,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w500, fontSize: 10),
            ),
          ),
          Expanded(
            flex: 4,
            child: Text(
              value,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w400, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}