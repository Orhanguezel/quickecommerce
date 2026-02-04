

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:file_picker/file_picker.dart';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/foundation.dart' as foundation;
import 'package:path/path.dart' as path;
import 'package:provider/provider.dart';
import 'package:pusher_channels_flutter/pusher_channels_flutter.dart';
import 'package:quick_ecommerce/config/api_urls.dart';
import 'package:quick_ecommerce/controller/bloc/chat_details_bloc/chat_details_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/chat_details_bloc/chat_details_event.dart';
import 'package:quick_ecommerce/controller/bloc/chat_details_bloc/chat_details_state.dart';
import 'package:quick_ecommerce/controller/bloc/message_send_bloc/message_send_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/message_send_bloc/message_send_event.dart';
import 'package:quick_ecommerce/controller/bloc/message_send_bloc/message_send_state.dart';
import 'package:quick_ecommerce/controller/provider/message_input_conroller.dart';
import 'package:quick_ecommerce/data/data_model/chat_details_model.dart';
import 'package:quick_ecommerce/screens/common_widgets/image_view.dart';
import 'package:quick_ecommerce/screens/home/item_card.dart';
import '../../config/icons.dart';
import '../../config/images.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/provider/common_provider.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_funcktion.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({
    super.key,
    required this.name,
    required this.isOnline,
    required this.receiverId,
    required this.receiverType,
    required this.userImg,
  });
  final String name, receiverId, receiverType, userImg;
  final bool isOnline;
  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  String _token = '',_userProfile='';
  late final ChatDetailsBloc _chatDetailsBloc;
  late final MessageSendBloc _messageSendBloc;
  final TextEditingController messagesCon = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isEmojiPickerVisible = false;

  late PusherChannelsFlutter pusher;
  Timer? _debounce;
  @override
  void initState() {
    super.initState();
    _chatDetailsBloc = context.read<ChatDetailsBloc>();
    _messageSendBloc = context.read<MessageSendBloc>();
    _scrollController.addListener(_onScroll);
    getUserToken();
    initializePusher();
  }


  Future<void> initializePusher() async {
    pusher = PusherChannelsFlutter.getInstance();
    try {
      await pusher.init(
        apiKey: ApiUrls.pusherApiKey(),
        cluster: ApiUrls.pusherCluster(),
        onConnectionStateChange: (previousState, currentState) {
        },
      );
      await pusher.connect();
      await pusher.subscribe(
        channelName: 'private-chat-${widget.receiverId}',
        onEvent: (event) {
          final data = jsonDecode(event.data);
          final newMessage = MessagesData.fromJson(data);
          _chatDetailsBloc.add(NewMessageReceivedEvent(newMessage: newMessage));
        },
      );
    } catch (e) {
      if(!mounted)return;


    }
  }







  Future<void> getUserToken() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    var profileImage = await UserSharedPreference.getValue(
      SharedPreferenceHelper.profileImage,
    );
    _token = token ?? "";
    _userProfile=profileImage ?? "";
    _chatDetailsBloc.add(ChatDetailsDataEvent(
      receiverId: widget.receiverId,
      receiverType: widget.receiverType,
      search: "",
      token: _token,
    ));
  }
  void animateListToTheEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      }
    });
  }
  void _onScroll() {
    _scrollController.addListener(() {
      if (_scrollController.position.pixels ==
          _scrollController.position.minScrollExtent) {
        _loadMoreOrders();
      }
    });
  }

  void _loadMoreOrders() {
    var commonCon = Provider.of<CommonProvider>(context,listen: false);
    if (commonCon.messagesCurrentPage < commonCon.messagesTotalPages) {
      commonCon.goToMessageNextPage();
      _chatDetailsBloc.add(ChatDetailsDataEvent(
        receiverId: widget.receiverId,
        receiverType: widget.receiverType,
        search: "",
        token: _token,
      ));
    }
  }

  pickFiles() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'],
    );
    if (!mounted) return;
    if (result != null && result.files.isNotEmpty) {
      Provider.of<MessageInputProvider>(context, listen: false)
          .addFiles(result.files);
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _scrollController.removeListener(_onScroll);
    _debounce?.cancel();
    messagesCon.dispose();
    pusher.unsubscribe(channelName: "chat-channel");
    pusher.disconnect();
    super.dispose();
  }
  bool isFirstLoad = true;
  List<MessagesData> messageData = [];
  @override
  Widget build(BuildContext context) {
    final commonCon = Provider.of<CommonProvider>(context);
    final fileCon = Provider.of<MessageInputProvider>(context);
    return Scaffold(
      appBar:!kIsWeb
          ? AppBar(
        title: Text(
          widget.name,
          style: TextStyle(fontSize: 18.sp),
        ),
        centerTitle: true,
        actions: [
          Stack(
            children: [
              Container(
                height: 40.h,
                width: 40.w,
                decoration: BoxDecoration(
                    color: const Color(0xFFFFFFFF),
                    shape: BoxShape.circle,
                    image: DecorationImage(
                        image: widget.userImg.isNotEmpty
                            ? NetworkImage(widget.userImg)
                            : const AssetImage(Images.noPerson))),
              ),
              Positioned(
                  bottom: 5.h,
                  right: 0.w,
                  child: Container(
                    height: 12.h,
                    width: 12.w,
                    decoration: BoxDecoration(
                      color: widget.isOnline ? Colors.green : Colors.grey,
                      shape: BoxShape.circle,
                    ),
                  ))
            ],
          ),
          SizedBox(
            width: 12.w,
          ),
        ],
      ):null,
      body: Column(
        children: [
          Expanded(
            child: BlocConsumer<ChatDetailsBloc, ChatDetailsState>(
              builder: (context, state) {
                if (state is ChatDetailsLoading ) {
                   return isFirstLoad?
                  SizedBox(
                    height: 150,
                    child: ListView.builder(
                      itemCount: 10,
                      itemBuilder: (context, index) {
                        return const ShimmerLoadingWidget();
                      },
                    ),
                  )
                      :Padding(
                     padding: EdgeInsets.symmetric(horizontal: 16.w),
                        child: ListView.builder(
                        controller: _scrollController,
                        physics: const AlwaysScrollableScrollPhysics(),
                        scrollDirection: Axis.vertical,
                        reverse: true,
                        itemCount: messageData.length,
                        itemBuilder: (context, index) {
                          final data = messageData[index];
                          String extension = '';
                          if (data.file != null &&
                              data.file.toString().isNotEmpty) {
                            extension = path.extension(data.file);
                          }
                          return ChatBubble(
                              isSender:
                              data.senderType == "customer" ? true : false,
                              message: Utils.formatString(data.message),
                              file: Utils.formatString(data.file),
                              time: Utils.formatTime(data.createdAt ?? ""),
                              extension: extension,
                              receiverImage: widget.userImg,
                              senderImage: _userProfile);
                        }),
                      );
                }
                else if (state is ChatDetailsLoaded) {
                  if (state.hasConnectionError) {
                    CommonFunctions.showCustomSnackBar(
                        context, AppLocalizations.of(context)!.noInternet);
                  }

                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    final meta=state.messagesDetailsModel.meta;
                    if (meta!= null) {
                      commonCon.setMessageTotalPage(meta.lastPage);
                    }
                    if(isFirstLoad){
                      animateListToTheEnd();
                    }
                  });
                  final data = state.messagesDetailsModel.data;
                  if (data != null) {
                    messageData = data;
                  }
                  return Padding(
                    padding: EdgeInsets.symmetric(horizontal: kIsWeb ? 16 : 16.w),
                    child: ListView.builder(
                        controller: _scrollController,
                        physics: const AlwaysScrollableScrollPhysics(),
                        reverse: true,
                        scrollDirection: Axis.vertical,
                        itemCount: state.messagesDetailsModel.data!.length,
                        itemBuilder: (context, index) {
                          final data = state.messagesDetailsModel.data![index];
                          String extension = '';
                          if (data.file != null &&
                              data.file.toString().isNotEmpty) {
                            extension = path.extension(data.file);
                          }
                          return ChatBubble(
                            isSender:
                                data.senderType == "customer" ? true : false,
                            message: Utils.formatString(data.message),
                            file: Utils.formatString(data.file),
                            time: Utils.formatTime(data.createdAt),
                            extension: extension,
                            receiverImage: widget.userImg,
                           senderImage :_userProfile
                          );
                        }),
                  );
                }
                return const SizedBox();
              },
              listener: (context, state) {
                if (state is ChatDetailsLoaded) {
                    isFirstLoad = false;
                }
                if (state is ChatDetailsConnectionError) {
                  CommonFunctions.showUpSnack(
                    message: AppLocalizations.of(context)!.noInternet,
                    context: context,
                  );
                }
              },
            ),
          ),
          SizedBox(
            height: kIsWeb ? 8 : 8.h,
          ),
          if (fileCon.selectedFiles.isNotEmpty)
            SizedBox(
              height: kIsWeb ? 50 : 50.h,
              child: Consumer<MessageInputProvider>(
                builder: (context, provider, _) {
                  return ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: provider.selectedFiles.length,
                    itemBuilder: (context, index) {
                      final file = provider.selectedFiles[index];
                      final isImage = ['.png', '.jpg', '.jpeg'].contains(
                        path.extension(file.name).toLowerCase(),
                      );

                      return Padding(
                        padding: EdgeInsets.symmetric(horizontal:  kIsWeb ? 4 :4.w),
                        child: Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular( kIsWeb ? 4 :4.r),
                              child: isImage
                                  ? Image.file(
                                File(file.path!),
                                width: 50,
                                height: 50,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error,
                                    stackTrace) =>
                                    Icon(Icons.broken_image, size:  kIsWeb ? 40 :40.sp),
                              )
                                  : Container(
                                width: 100,
                                padding: EdgeInsets.all( kIsWeb ? 6 :6.sp),
                                color: Colors.grey.shade200,
                                child: Column(
                                  mainAxisAlignment:
                                  MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      file.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(fontSize:  kIsWeb ? 10 :10.sp),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            Positioned(
                              top: -14,
                              right: -14,
                              child: IconButton(
                                icon: Icon(Icons.cancel,
                                    size:  kIsWeb ? 16 :16.sp, color: Colors.red),
                                onPressed: () {
                                  provider.removeFileAt(index);
                                },
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          _messageInput(),
          Offstage(
            offstage: !_isEmojiPickerVisible,
            child: EmojiPicker(
              textEditingController: messagesCon,
              scrollController: _scrollController,
              config: Config(
                height: 256,
                checkPlatformCompatibility: true,
                viewOrderConfig: const ViewOrderConfig(),
                emojiViewConfig: EmojiViewConfig(
                  emojiSizeMax: 28 *
                      (foundation.defaultTargetPlatform == TargetPlatform.iOS
                          ? 1.2
                          : 1.0),
                ),
                skinToneConfig: const SkinToneConfig(),
                categoryViewConfig: const CategoryViewConfig(),
                bottomActionBarConfig: const BottomActionBarConfig(),
                // searchViewConfig: const SearchViewConfig(),
              ),
            ),
          ),
          SizedBox(
            height:  kIsWeb ? 8 :8.h,
          ),
        ],
      ),
    );
  }

  Widget _messageInput() {
    final imageCon = Provider.of<MessageInputProvider>(context, listen: false);
    return Row(
      children: [
        SizedBox(
          width:  kIsWeb ? 8 :8.w,
        ),
        InkWell(
          onTap: () {
            setState(() {
              _isEmojiPickerVisible =
              !_isEmojiPickerVisible; // Toggle emoji picker visibility.
            });
          },
          child: Image.asset(
            AssetsIcons.emoji,
            width: kIsWeb ? 25 : 25.w,
            height:  kIsWeb ? 25 :25.w,
          ),
        ),
        SizedBox(
          width: kIsWeb ? 8 : 8.w,
        ),
        Expanded(
          child: Container(
              padding: EdgeInsets.symmetric(horizontal: kIsWeb ? 6 : 6.w),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular( kIsWeb ? 8 :8.r),
                border: Border(
                  top: BorderSide(color: Colors.grey[300]!, width: kIsWeb ? 1 : 1.w),
                ),
              ),
              child: TextField(
                controller: messagesCon,
                readOnly: imageCon.selectedFiles.isNotEmpty?true:false,
                style: Theme.of(context).textTheme.displayLarge!.copyWith(
                  fontSize:  kIsWeb ? 12 :12.sp,
                  fontWeight: FontWeight.w400,
                ),
                decoration: InputDecoration(
                  hintText: AppLocalizations.of(context)!.typeMessage,
                  hintStyle: Theme.of(context).textTheme.displayLarge!.copyWith(
                    fontSize:  kIsWeb ? 12 :12.sp,
                    fontWeight: FontWeight.w400,
                  ),
                  border: InputBorder.none,
                ),
                onTap: () {
                  setState(() {
                    _isEmojiPickerVisible = false;
                  });
                },
              )),
        ),
        SizedBox(
          width:  kIsWeb ? 12 :12.w,
        ),
        InkWell(
          onTap: () {
            pickFiles();
          },
          child: Image.asset(
            AssetsIcons.attach,
            width:  kIsWeb ? 20 :20.7.w,
            height: kIsWeb ? 25 : 25.7.w,
            // color: const Color(0xFF568BFF),
          ),
        ),
        SizedBox(
          width: kIsWeb ? 8 : 8.w,
        ),
        BlocConsumer<MessageSendBloc, MessageSendState>(
          listener: (context, state) {
            if (state is MessageSendFailure) {
              CommonFunctions.showUpSnack(
                  context: context, message: state.authModel.message);
            } else if (state is MessageSendLoaded) {
              if (state.hasConnectionError) {
                CommonFunctions.showUpSnack(
                  message: AppLocalizations.of(context)!.noInternet,
                  context: context,
                );
              }
              WidgetsBinding.instance.addPostFrameCallback((_) {
                _chatDetailsBloc.add(ChatDetailsDataEvent(
                  receiverId: widget.receiverId,
                  receiverType: widget.receiverType,
                  search: "",
                  token: _token,
                ));
                messagesCon.clear();
                imageCon.clearAll();
              });
            }
          },
          builder: (context, state) {
            if (state is MessageSendLoading) {
              return SizedBox(
                width: kIsWeb ? 51 : 51.7.w,
                height:  kIsWeb ? 51 :51.7.w,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Image.asset(
                      AssetsIcons.send,
                      width: kIsWeb ? 51 : 51.7.w,
                      height:  kIsWeb ? 51 :51.7.w,
                      fit: BoxFit.cover,
                    ),
                    CircularProgressIndicator(
                      strokeWidth: kIsWeb ? 2 : 2.0.w,
                      color: Colors.white,
                    ),
                  ],
                ),
              )
              ;
            }
            return InkWell(
              onTap: () {
                if (messagesCon.text.isNotEmpty||imageCon.selectedFiles.isNotEmpty) {
                  _messageSendBloc.add(MessageSend(
                      receiverId: widget.receiverId,
                      message: messagesCon.text,
                      receiverType: widget.receiverType,
                      files:imageCon.selectedFiles.isNotEmpty?imageCon.selectedFiles:const [],
                      token: _token));
                }
              },
              child: Image.asset(
                AssetsIcons.send,
                width:  kIsWeb ? 50 :51.7.w,
                height: kIsWeb ? 50 : 51.7.w,
              ),
            );
          },
        ),
        SizedBox(
          width:  kIsWeb ? 12:12.w,
        ),
      ],
    );
  }
}

class ChatBubble extends StatelessWidget {
  final bool isSender;
  final String message;
  final String file;
  final String time;
  final String extension;
  final String receiverImage;
  final String senderImage;

  const ChatBubble({
    super.key,
    required this.isSender,
    required this.message,
    required this.file,
    required this.time,
    required this.extension,
    required this.receiverImage,
    required this.senderImage,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isSender ? Alignment.centerRight : Alignment.centerLeft,
      child: Column(
        crossAxisAlignment:
            isSender ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: isSender
                ? MainAxisAlignment.end
                : MainAxisAlignment.start,
            children: [
              if (!isSender) ...[
                CircleAvatar(
                  radius: kIsWeb ? 8 :8.r,
                  backgroundImage:
                  receiverImage.isNotEmpty
                      ? NetworkImage(receiverImage)
                      : const AssetImage(Images.noPerson)
                  as ImageProvider,
                ),
                SizedBox(width: kIsWeb ? 8 : 8.w),
              ],
              if (message.isNotEmpty)
                Container(
                  margin: EdgeInsets.only(top: kIsWeb ?8 : 8.h),
                  padding: EdgeInsets.symmetric(horizontal: kIsWeb ? 12 : 12.w, vertical: kIsWeb ? 8 : 8.h),
                  constraints: BoxConstraints(maxWidth: kIsWeb ? 240 : 240.w),
                  decoration: BoxDecoration(
                    color: isSender
                        ? const Color(0xFF006FFD)
                        : const Color(0xFFFFFFFF),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular( kIsWeb ? 12 :12.r),
                      topRight: Radius.circular( kIsWeb ? 12 :12.r),
                      bottomRight: Radius.circular(isSender == false ?kIsWeb ? 12 : 12.r : 0),
                      bottomLeft: Radius.circular(isSender ? kIsWeb ? 12 :12.r : 0),
                    ),
                    border: Border.all(
                      width:  kIsWeb ?1:1.w,
                      color: const Color(0xFFE7E7E7),
                    ),
                  ),
                  child: Text(
                    message,
                    style: TextStyle(
                      fontSize:  kIsWeb ? 14 :14.sp,
                      fontWeight: FontWeight.w400,
                      color: isSender ? Colors.white : Colors.black,
                    ),
                  ),
                )
              else if (file.isNotEmpty &&
                  (extension == ".jpg" || extension == ".jpeg" || extension == ".png"))
                GestureDetector(
                  onTap: () {
                    if(kIsWeb){
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            contentPadding: EdgeInsets.all(0.sp),
                            content:SizedBox(
                              height: 400,
                              width: 400,
                              child: FullScreenImageView(
                                imageUrl: file,
                                tag: 'imageHero_$file',
                              ),
                            ),
                          );
                        },
                      );
                    }else{
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => FullScreenImageView(
                            imageUrl: file,
                            tag: 'imageHero_$file',
                          ),
                        ),
                      );
                    }

                  },
                  child: Hero(
                    tag: 'imageHero_$file',
                    child: Container(
                      height:  kIsWeb ? 150 :150.h,
                      width:  kIsWeb ? 120 :120.w,
                      margin: EdgeInsets.only(top: kIsWeb ? 8 : 8.h),
                      decoration: BoxDecoration(
                        color: isSender ? Colors.blue : const Color(0xFFFFFFFF),
                        borderRadius: BorderRadius.circular( kIsWeb ? 12 :12.r),
                        border: Border.all(
                          width:  kIsWeb ? 1 :1.w,
                          color: const Color(0xFFE7E7E7),
                        ),
                        image: DecorationImage(
                          image: NetworkImage(file),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),
                )
              else
                const SizedBox(),
              if (isSender) ...[
                SizedBox(width:  kIsWeb ? 8 :8.w),
                CircleAvatar(
                  radius: kIsWeb ? 8 :8.r,
                  backgroundImage:
                      senderImage.isNotEmpty
                      ? NetworkImage(senderImage)
                      : const AssetImage(Images.noPerson)
                  as ImageProvider,
                ),
              ],
            ],
          ),

          message.isNotEmpty
              ? Padding(
                  padding: EdgeInsets.only(top:  kIsWeb ? 4 :4.h),
                  child: Row(
                    crossAxisAlignment: isSender
                        ? CrossAxisAlignment.end
                        : CrossAxisAlignment.start,
                    mainAxisAlignment: isSender
                        ? MainAxisAlignment.end
                        : MainAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: kIsWeb ? 25 : 25.w,
                      ),
                      Text(
                        time,
                        style: TextStyle(
                          fontSize: kIsWeb ? 10 : 10.sp,
                          fontWeight: FontWeight.w400,
                          color: Colors.grey,
                        ),
                      ),
                      SizedBox(
                        width:  kIsWeb ? 25 :25.w,
                      ),
                    ],
                  ),
                )
              : const SizedBox(),
        ],
      ),
    );
  }
}