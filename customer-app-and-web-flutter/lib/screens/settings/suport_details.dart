
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/controller/bloc/get_messsage_bloc/get_message_event.dart';
import 'package:quick_ecommerce/controller/bloc/message_send_bloc/message_send_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/message_send_bloc/message_send_state.dart';
import 'package:quick_ecommerce/controller/provider/message_input_conroller.dart';

import 'package:quick_ecommerce/screens/common_widgets/common_card.dart';
import 'package:quick_ecommerce/screens/common_widgets/common_loading.dart';

import '../../config/icons.dart';
import '../../config/images.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/get_messsage_bloc/get_message_bloc.dart';
import '../../controller/bloc/get_messsage_bloc/get_message_state.dart';
import '../../controller/bloc/message_send_bloc/message_send_event.dart';
import '../../controller/bloc/support_ticket_detail_bloc/support_ticket_detail_bloc.dart';
import '../../controller/bloc/support_ticket_detail_bloc/support_ticket_detail_event.dart';
import '../../controller/bloc/support_ticket_detail_bloc/support_ticket_detail_state.dart';
import '../../controller/provider/common_provider.dart';
import '../../data/data_model/tickate_message_model.dart';
import '../../data/data_model/ticket_detail_model.dart';
import '../../l10n/app_localizations.dart';
import '../../router/route_name.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/common_status_card.dart';
import '../common_widgets/image_view.dart';

class ChatBotScreen extends StatefulWidget {
  const ChatBotScreen({super.key, required this.ticketId});
  final String ticketId;
  @override
  ChatBotScreenState createState() => ChatBotScreenState();
}

class ChatBotScreenState extends State<ChatBotScreen> {

  final ScrollController _scrollController = ScrollController();
  final TextEditingController messageCon = TextEditingController();
  late final SupportTicketDetailBloc _ticketDetailBloc;
  late final GetMessageBloc _getMessageBloc;
  late final MessageSendBloc _messageSendBloc;
  String _token = '';
  bool _isInitialLoad = true;
  @override
  void initState() {
    _ticketDetailBloc = context.read<SupportTicketDetailBloc>();
    _getMessageBloc = context.read<GetMessageBloc>();
    _messageSendBloc = context.read<MessageSendBloc>();
    _scrollController.addListener(_onScroll);
    getUserRout();
    super.initState();
  }

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
          .add(GetMessage(ticketId: widget.ticketId.toString(), token: _token));
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
  getUserRout() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
    _ticketDetailBloc.add(TicketDetails(id: widget.ticketId, token: _token));
    _getMessageBloc
        .add(GetMessage(ticketId: widget.ticketId.toString(), token: _token));
  }


  List<MessageData> messageData = [];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          AppLocalizations.of(context)!.ticketDetails,
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.w700, fontSize: 20.sp),
        ),
        centerTitle: true,
      ),
      body: Column(
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
          Expanded(
            child: CommonCard(
                mHorizontal: 8,
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
                                                width: 150.w,
                                                height: 100.w,
                                                fit: BoxFit.cover,
                                                errorBuilder: (context, error, stackTrace) {
                                                  return Image.asset(
                                                    Images.noImage,
                                                    fit: BoxFit.cover,
                                                    width: 64.w,
                                                    height:  64.h,
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
                              padding: EdgeInsets.symmetric(
                                  vertical: 10.0.w, horizontal: 16.0.w),
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
                                              width: 150.w,
                                              height: 100.w,
                                              fit: BoxFit.cover,
                                              errorBuilder: (context, error, stackTrace) {
                                                return Image.asset(
                                                  Images.noImage,
                                                  fit: BoxFit.cover,
                                                  width: 64.w,
                                                  height:  64.h,
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
                                  ?.copyWith(fontWeight: FontWeight.w400, fontSize: 14.sp),
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
                            height: 50.h,
                            child: Padding(
                              padding: EdgeInsets.symmetric(horizontal: 4.w),
                              child:Align(
                                alignment: Alignment.centerLeft,
                                child:Stack(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(4.r),
                                      child: Image.file(
                                        File(imageCon.selectedImage!.path),
                                        width: 50,
                                        height: 50,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) =>
                                            Icon(Icons.broken_image, size: 40.sp),
                                      ),
                                    ),
                                    Positioned(
                                      top: -10,
                                      right: -10,
                                      child: IconButton(
                                        icon: Icon(Icons.cancel, size: 16.sp, color: Colors.red),
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
      ),
    );
  }

  Widget _buildMessageBubble(String message, bool isUser) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        padding: EdgeInsets.all(10.w),
        margin: EdgeInsets.symmetric(vertical: 5.h, horizontal: 0.w),
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
      padding: EdgeInsets.all(8.0.w),
      child: Row(
        children: [
          InkWell(
            onTap: () {
              _pickImage();
            },
            child: Image.asset(
              AssetsIcons.attach,
              width: 20.7.w,
              height: 25.7.w,
            ),
          ),
          SizedBox(width: 8.0.h),
          Expanded(
            child: Container(
                padding: EdgeInsets.symmetric(horizontal: 6.w),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8.r),
                  border: Border(
                    top: BorderSide(color: Colors.grey[300]!, width: 1.w),
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
          SizedBox(width: 8.0.h),
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
                  width: 51.7.w,
                  height: 51.7.w,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Image.asset(
                        AssetsIcons.send,
                        width: 51.7.w,
                        height: 51.7.w,
                        fit: BoxFit.cover,
                      ),
                      CircularProgressIndicator(
                        strokeWidth: 2.0.w,
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
                      .add(GetMessage(ticketId: widget.ticketId.toString(), token: _token));
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
                        ticketId: widget.ticketId.toString(),
                        token: _token));
                  }
                },
                child: Image.asset(
                  AssetsIcons.send,
                  width: 51.7.w,
                  height: 51.7.w,
                ),
              );
            },
          ),
        ],
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
      mHorizontal: 8,
      mVertical: 4,
      widget: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppLocalizations.of(context)!.serviceRequestDetails,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(fontWeight: FontWeight.w600, fontSize: 14.sp),
          ),
          Divider(thickness: 1.h, color: const Color(0xFFCECECE)),
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
                    ?.copyWith(fontWeight: FontWeight.w500, fontSize: 10.sp),
              ),
              SizedBox(width: 30.w,),
              SizedBox(
                  width: 80.w,
                  child: CommonStatusCard(
                      text: data.status == 1 ? "Active" : "Inactive")),
            ],
          ),
          SizedBox(height: 8.h,),
          Row(
            children: [
              Text(
                  "${AppLocalizations.of(context)!.priority}:",

                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w500, fontSize: 10.sp),
              ),
              SizedBox(width: 26.w,),
              SizedBox(
                  width: 80.w, child: CommonStatusCard(
                backgroundColor:const Color(0xFFFFECE5),
                  borderColor: const Color(0xFFFF7678),
                  text:Utils.formatString( data.priority))),
              const Spacer(),
              if(data.status == 1)
              InkWell(
                onTap: () {
                  context.pushNamed(RouteNames.supportTicketAdd,
                    extra: {
                      "id": data.ticketId.toString(),
                      "title": data.title ?? "",
                      "subject": data.subject ?? "",
                      "edit": true,
                    },
                  );
                  commonCon.setDepartment(data.departmentName, data.departmentId.toString());
                  commonCon.setPriority(Utils.formatString(data.priority));
                },
                child: Image.asset(
                  AssetsIcons.edit,
                  height: 20.h,
                  width: 20.w,
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
      padding: EdgeInsets.symmetric(vertical: 4.h),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: Text(
              label,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w500, fontSize: 10.sp),
            ),
          ),
          Expanded(
            flex: 4,
            child: Text(
              value,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w400, fontSize: 12.sp),
            ),
          ),
        ],
      ),
    );
  }
}
