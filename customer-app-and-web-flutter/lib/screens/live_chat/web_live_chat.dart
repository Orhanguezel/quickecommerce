import 'dart:async';
import 'dart:convert';
import 'dart:io' show File;

import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/foundation.dart' as foundation;
import 'package:path/path.dart' as path;
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:pusher_channels_flutter/pusher_channels_flutter.dart';
import 'package:quick_ecommerce/screens/live_chat/user_list.dart';
import '../../config/api_urls.dart';
import '../../config/icons.dart';
import '../../config/images.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';
import '../../controller/bloc/chat_details_bloc/chat_details_bloc.dart';
import '../../controller/bloc/chat_details_bloc/chat_details_event.dart';
import '../../controller/bloc/chat_details_bloc/chat_details_state.dart';
import '../../controller/bloc/chat_list_bloc/chat_list_bloc.dart';
import '../../controller/bloc/chat_list_bloc/chat_list_event.dart';
import '../../controller/bloc/chat_list_bloc/chat_list_state.dart';
import '../../controller/bloc/message_send_bloc/message_send_bloc.dart';
import '../../controller/bloc/message_send_bloc/message_send_event.dart';
import '../../controller/bloc/message_send_bloc/message_send_state.dart';
import '../../controller/provider/common_provider.dart';
import '../../controller/provider/message_input_conroller.dart';
import '../../data/data_model/chat_details_model.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_card.dart';
import '../common_widgets/common_funcktion.dart';
import '../common_widgets/no_data_widget.dart';
import '../home/item_card.dart';
import 'chat_page.dart';

class WebLiveChat extends StatefulWidget {
  const WebLiveChat({super.key});

  @override
  State<WebLiveChat> createState() => _WebLiveChatState();
}

class _WebLiveChatState extends State<WebLiveChat> {
  String name = '', receiverId = '', receiverType = '', userImg = '';

  bool isOnline = false;

  @override
  Widget build(BuildContext context) {
    double screenWidth = MediaQuery.of(context).size.width;
    final inputCon = Provider.of<MessageInputProvider>(context);
    return Scaffold(
      body: screenWidth > 700
          ?  Row(
              children: [
                const Expanded(
                    flex: 2,
                    child: WMessageTab()),
                const SizedBox(
                  width: 10,
                ),
                Expanded(
                    flex: 3,
                    child: inputCon.receiverId.isNotEmpty?
                    const CommonCard(
                      mHorizontal: 0,
                        mVertical: 8,
                        widget: WChatPage())
                        : Center(child: Text("Conversation select",
                    style: Theme.of(context).textTheme.displayLarge!.copyWith(
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                    ),
                    ))),
              ],
            )
          : ListView(
              children: [
                SizedBox(
                    height: MediaQuery.of(context).size.height * 0.5,
                    child: const WMessageTab()),
                SizedBox(
                    height: MediaQuery.of(context).size.height * 0.5,
                    child: const CommonCard(mHorizontal: 0,
                        mVertical: 8,
                        widget: WChatPage()))
              ],
            ),
    );
  }
}

class WMessageTab extends StatefulWidget {
  const WMessageTab({super.key});

  @override
  State<WMessageTab> createState() => _WMessageTabState();
}

class _WMessageTabState extends State<WMessageTab> {
  String _token = '';
  late final ChatListBloc _chatListBloc;
  late final ChatDetailsBloc _chatDetailsBloc;
  @override
  void initState() {
    super.initState();
    _chatListBloc = context.read<ChatListBloc>();
    _chatDetailsBloc = context.read<ChatDetailsBloc>();
    getUserToken();
  }

  Future<void> getUserToken() async {
    var token = await UserSharedPreference.getValue(
      SharedPreferenceHelper.token,
    );
    _token = token ?? "";
    collApi();
  }
  collApi(){
    final tabProvider = Provider.of<MessageInputProvider>(context,listen: false);
    String type='';
    if (tabProvider.selectedIndex == 0){
      type="store";
    }else  if (tabProvider.selectedIndex == 1){
      type="deliveryman";
    }

    _chatListBloc
        .add(ChatListDataEvent(search: "", type: type, token: _token));
  }
  @override
  Widget build(BuildContext context) {
    var messageCon = Provider.of<MessageInputProvider>(context);
    return ChangeNotifierProvider(
      create: (_) => MessageInputProvider(),
      child: CommonCard(
          mHorizontal:kIsWeb ?0 :12,
          widget: Column(
            children: [
              _buildTabBar(context),
              const SizedBox(height: 10), // Space between tabs and content
              Expanded(
                child: BlocConsumer<ChatListBloc, ChatListState>(
                  builder: (context, state) {
                    if (state is ChatListLoading) {
                      return SizedBox(
                        height: 150,
                        child: ListView.builder(
                          itemCount: 10, // Number of shimmer items
                          itemBuilder: (context, index) {
                            return const ShimmerLoadingWidget();
                          },
                        ),
                      );
                    }
                    else if (state is ChatListLoaded) {
                      if (state.hasConnectionError) {
                        CommonFunctions.showCustomSnackBar(
                            context, AppLocalizations.of(context)!.noInternet);
                      }
                      return state.chatListModel.data!.isEmpty
                          ? const Center(child: NoDataWidget())
                          : ListView.builder(
                          scrollDirection: Axis.vertical,
                          itemCount: state.chatListModel.data!.length,
                          itemBuilder: (context, index) {
                            final data = state.chatListModel.data![index];
                            return InkWell(
                              onTap: () {
                                _chatDetailsBloc.add(ChatDetailsDataEvent(
                                  receiverId: Utils.formatString(
                                      data.user?.id),
                                  receiverType:Utils.formatString(
                                      data.userType),
                                  search: "",
                                  token: _token,
                                ));
                                messageCon.setUserInfo(
                                  Utils.capitalizeFirstLetter(
                                      data.user!.name),
                                  Utils.formatString(
                                      data.user?.id),
                                   Utils.formatString(
                                      data.userType),
                                   Utils.formatString(
                                      data.user!.image),
                                  false
                                );
                              },
                              child: UserCart(
                                image: Utils.formatString(data.user!.image),
                                name: Utils.capitalizeFirstLetter(
                                    data.user!.name),
                                userType: data.userType,
                                isOnline: data.user!.isOnline,
                              ),
                            );
                          });
                    }
                    return const SizedBox();
                  },
                  listener: (context, state) {
                    if (state is ChatListConnectionError) {
                      CommonFunctions.showUpSnack(
                        message: AppLocalizations.of(context)!.noInternet,
                        context: context,
                      );
                    }
                  },
                ),
              ),
            ],
          )),
    );
  }

  /// Builds the custom tab bar with buttons
  Widget _buildTabBar(BuildContext context) {
    return Container(
      width:double.infinity,
      height:40 ,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Expanded(
              child: _buildTabButton(
                  context, 0, AppLocalizations.of(context)!.store)),
          const SizedBox(width: 10),
          Expanded(
              child: _buildTabButton(
                  context, 1, AppLocalizations.of(context)!.deliveryman)),
        ],
      ),
    );
  }

  /// Builds individual tab buttons
  Widget _buildTabButton(BuildContext context, int index, String title) {
    final tabProvider = Provider.of<MessageInputProvider>(context);
    bool isSelected = tabProvider.selectedIndex == index;

    return GestureDetector(
      onTap: () {
        tabProvider.updateIndex(index);
        if (tabProvider.selectedIndex == 0) {
          _chatListBloc
              .add(ChatListDataEvent(search: "", type: "store", token: _token));
        } else if (tabProvider.selectedIndex == 1) {
          _chatListBloc.add(
              ChatListDataEvent(search: "", type: "deliveryman", token: _token));
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical:8 ),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.grey[200],
          borderRadius: BorderRadius.circular( 12 ),
        ),
        child: Center(
          child: Text(title,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontSize: 10 ,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF71727A),
              )),
        ),
      ),
    );
  }
}


class WChatPage extends StatefulWidget {
  const WChatPage({
    super.key,
  });
  @override
  State<WChatPage> createState() => _WChatPageState();
}

class _WChatPageState extends State<WChatPage> {
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
    var messageCon = Provider.of<MessageInputProvider>(context,listen: false);
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
        channelName: 'private-chat-${messageCon.receiverId}',
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
    // _chatDetailsBloc.add(ChatDetailsDataEvent(
    //   receiverId: widget.receiverId,
    //   receiverType: widget.receiverType,
    //   search: "",
    //   token: _token,
    // ));
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
    var messageCon = Provider.of<MessageInputProvider>(context,listen: false);
    if (commonCon.messagesCurrentPage < commonCon.messagesTotalPages) {
      commonCon.goToMessageNextPage();
      _chatDetailsBloc.add(ChatDetailsDataEvent(
        receiverId: messageCon.receiverId,
        receiverType: messageCon.receiverType,
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
    var messageCon = Provider.of<MessageInputProvider>(context);
    return Scaffold(
      body: Column(
        children: [
          Row(
            children: [
              Text(
                messageCon.name,
                style: const TextStyle(fontSize: 18),
              ),
              const Spacer(),
              Stack(
                children: [
                  Container(
                    height: 40,
                    width: 40,
                    decoration: BoxDecoration(
                        color: const Color(0xFFFFFFFF),
                        shape: BoxShape.circle,
                        image: DecorationImage(
                            image: messageCon.userImg.isNotEmpty
                                ? NetworkImage(messageCon.userImg)
                                : const AssetImage(Images.noPerson))),
                  ),
                  Positioned(
                      bottom: 5,
                      right: 0,
                      child: Container(
                        height: 12,
                        width: 12,
                        decoration: BoxDecoration(
                          color: messageCon.isOnline ? Colors.green : Colors.grey,
                          shape: BoxShape.circle,
                        ),
                      ))
                ],
              ),
              const SizedBox(
                width: 12,
              ),
            ],
          ),
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
                    padding: const EdgeInsets.symmetric(horizontal: 16),
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
                              receiverImage: messageCon.userImg,
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
                    padding: const EdgeInsets.symmetric(horizontal:16),
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
                              receiverImage: messageCon.userImg,
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
          const SizedBox(
            height:  8,
          ),
          const SelectedFilePreview(),
          const SizedBox(
            height:  8,
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
          const SizedBox(
            height: 8,
          ),
        ],
      ),
    );
  }

  Widget _messageInput() {
    final imageCon = Provider.of<MessageInputProvider>(context, listen: false);
    return Row(
      children: [
        const SizedBox(
          width: 8,
        ),
        InkWell(
          onTap: () {
            setState(() {
              _isEmojiPickerVisible =
              !_isEmojiPickerVisible;
            });
          },
          child: Image.asset(
            AssetsIcons.emoji,
            width:25 ,
            height: 25,
          ),
        ),
        const SizedBox(
          width:8,
        ),
        Expanded(
          child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6 ),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
                border: Border(
                  top: BorderSide(color: Colors.grey[300]!, width: 1),
                ),
              ),
              child: TextField(
                controller: messagesCon,
                readOnly: imageCon.selectedFiles.isNotEmpty?true:false,
                style: Theme.of(context).textTheme.displayLarge!.copyWith(
                  fontSize:12 ,
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
                onTap: () {
                  setState(() {
                    _isEmojiPickerVisible = false;
                  });
                },
              )),
        ),
        const SizedBox(
          width:12,
        ),
        InkWell(
          onTap: () {
            pickFiles();
          },
          child: Image.asset(
            AssetsIcons.attach,
            width: 20 ,
            height: 25 ,
          ),
        ),
        const SizedBox(
          width:  8 ,
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
                  receiverId:imageCon.receiverId,
                  receiverType:imageCon.receiverType,
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
                width:  51 ,
                height:   51 ,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Image.asset(
                      AssetsIcons.send,
                      width:  51 ,
                      height: 51 ,
                      fit: BoxFit.cover,
                    ),
                    const CircularProgressIndicator(
                      strokeWidth:2 ,
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
                      receiverId:imageCon.receiverId,
                      message: messagesCon.text,
                      receiverType:imageCon.receiverType,
                      files:imageCon.selectedFiles.isNotEmpty?imageCon.selectedFiles:const [],
                      token: _token));
                }
              },
              child: Image.asset(
                AssetsIcons.send,
                width:   50,
                height: 50 ,
              ),
            );
          },
        ),
        const SizedBox(
          width: 12,
        ),
      ],
    );
  }
}

class SelectedFilePreview extends StatelessWidget {
  const SelectedFilePreview({super.key});

  @override
  Widget build(BuildContext context) {
    final fileCon = Provider.of<MessageInputProvider>(context);
    if (fileCon.selectedFiles.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 50,
      child: Consumer<MessageInputProvider>(
        builder: (context, provider, _) {
          return ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: provider.selectedFiles.length,
            itemBuilder: (context, index) {
              final file = provider.selectedFiles[index];
              final isImage = ['.png', '.jpg', '.jpeg']
                  .contains(path.extension(file.name).toLowerCase());

              Widget preview;

              if (isImage) {
                if (kIsWeb) {
                  // ✅ Web — use bytes
                  if (file.bytes != null) {
                    preview = Image.memory(
                      file.bytes!,
                      width: 50,
                      height: 50,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                      const Icon(Icons.broken_image, size: 40),
                    );
                  } else {
                    preview = const Icon(Icons.broken_image, size: 40);
                  }
                }
                else {
                  // ✅ Mobile/Desktop — use file path
                  preview = Image.file(
                    File(file.path!),
                    width: 50,
                    height: 50,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) =>
                    const Icon(Icons.broken_image, size: 40),
                  );
                }
              } else {
                // ✅ For non-image files
                preview = Container(
                  width: 100,
                  padding: const EdgeInsets.all(6),
                  color: Colors.grey.shade200,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        file.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 10),
                      ),
                    ],
                  ),
                );
              }

              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: preview,
                    ),
                    Positioned(
                      top: -10,
                      right: -10,
                      child: IconButton(
                        icon: const Icon(Icons.cancel,
                            size: 16, color: Colors.red),
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
    );
  }
}
