
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/images.dart';
import 'package:quick_ecommerce/controller/bloc/chat_list_bloc/chat_list_bloc.dart';
import 'package:quick_ecommerce/controller/bloc/chat_list_bloc/chat_list_event.dart';
import 'package:quick_ecommerce/controller/bloc/chat_list_bloc/chat_list_state.dart';
import 'package:quick_ecommerce/screens/common_widgets/no_data_widget.dart';
import 'package:quick_ecommerce/screens/home/item_card.dart';
import 'package:quick_ecommerce/screens/live_chat/chat_page.dart';
import '../../config/shared_preference_helper.dart';
import '../../config/strings.dart';
import '../../config/user_shared_preference.dart';

import '../../controller/provider/message_input_conroller.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_card.dart';
import '../common_widgets/common_funcktion.dart';

class ChatListPage extends StatelessWidget {
  const ChatListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: Text(
          AppLocalizations.of(context)!.chat,
          style: Theme.of(context)
              .textTheme
              .titleLarge!
              .copyWith(fontSize: kIsWeb ? 20 : 20.sp, fontWeight: FontWeight.w600),
        ),
      ),
      body: const MessageTab(),
    );
  }
}

class MessageTab extends StatefulWidget {
  const MessageTab({super.key});

  @override
  State<MessageTab> createState() => _MessageTabState();
}

class _MessageTabState extends State<MessageTab> {
  String _token = '';
  late final ChatListBloc _chatListBloc;
  @override
  void initState() {
    super.initState();
    _chatListBloc = context.read<ChatListBloc>();
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
      type="customer";
    }

  _chatListBloc
      .add(ChatListDataEvent(search: "", type: type, token: _token));
}
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => MessageInputProvider(),
      child: CommonCard(
          mHorizontal:kIsWeb ?0 :12,
          widget: Column(
        children: [
          _buildTabBar(context),
          const SizedBox(height: 10),
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
                                Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                        builder: (_) => ChatPage(
                                              name: Utils.capitalizeFirstLetter(
                                                  data.user!.name),
                                              isOnline: false,
                                              receiverId: Utils.formatString(
                                                  data.user?.id),
                                              receiverType: Utils.formatString(
                                                  data.userType),
                                              userImg: Utils.formatString(
                                                  data.user!.image),
                                            )));
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
      height: kIsWeb ? 40 : 40.h,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(kIsWeb ? 16 : 16.r),
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
        padding: EdgeInsets.symmetric(horizontal:kIsWeb ? 8 :  8.w, vertical: kIsWeb ? 8 : 8.h),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.grey[200],
          borderRadius: BorderRadius.circular(kIsWeb ? 12 : 12.r),
        ),
        child: Center(
          child: Text(title,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontSize: kIsWeb ? 10 : 10.sp,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF71727A),
                  )),
        ),
      ),
    );
  }
}

class UserCart extends StatelessWidget {
  final String image;
  final String name;
  final String userType;
  final bool isOnline;

  const UserCart({
    super.key,
    required this.image,
    required this.name,
    required this.userType,
    required this.isOnline,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Stack(
          children: [
            Container(
              height: kIsWeb ? 58 : 58.h,
              width:kIsWeb ? 58 :  58.w,
              margin: EdgeInsets.only(top:kIsWeb ? 8 :  8.h),
              padding: EdgeInsets.symmetric(horizontal:kIsWeb ? 12 :  12.w, vertical:kIsWeb ? 8 :  8.h),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFFFF),
                shape: BoxShape.circle,
                image: DecorationImage(
                    image: image.isNotEmpty
                        ? NetworkImage(image)
                        : const AssetImage(Images.noPerson)),
              ),
            ),
          Positioned(
                    bottom:kIsWeb ? 6 :  6.h,
                    right:kIsWeb ? 8 :  8.w,
                    child: Container(
                      width:kIsWeb ? 10 : 10.w,
                      height: kIsWeb ? 10 : 10.h,
                      decoration:  BoxDecoration(
                        shape: BoxShape.circle,
                        color:isOnline?const Color(0xFF00AD34):const Color(0xFFD9D9D9),
                      ),
                    ),
                  )
          ],
        ),
        SizedBox(width:kIsWeb ? 12 :  12.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: kIsWeb ? 10: 10.h),
              Text(
                name,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium!
                    .copyWith(fontSize: kIsWeb ? 12 : 12.sp, fontWeight: FontWeight.w600),
              ),
              SizedBox(height:kIsWeb ? 8 :  8.h),
              Text(
                userType,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.displayLarge!.copyWith(
                    fontSize:kIsWeb ? 14 :  14.sp, fontWeight: FontWeight.w400),
              )
            ],
          ),
        ),
      ],
    );
  }
}
