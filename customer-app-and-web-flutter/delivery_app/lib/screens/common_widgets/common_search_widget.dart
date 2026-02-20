import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/icons.dart';

import '../../controller/provider/common_provider.dart';
import '../../controller/provider/filter_controller.dart';

/// This search widget refers upper search portion
/// this is bill number based search
class CommonSearchWidget extends StatefulWidget {
  final ValueChanged<String> onSearch;
  final String hint;
  const CommonSearchWidget({
    super.key,
    required this.onSearch,
    required this.hint,
  });

  @override
  CommonSearchWidgetState createState() => CommonSearchWidgetState();
}

class CommonSearchWidgetState extends State<CommonSearchWidget> {
  Timer? _debounce;
  final TextEditingController searchCon=TextEditingController();
  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }
@override
  void initState() {
  var filterCon = Provider.of<FilterController>(context, listen: false);
  searchCon.text=filterCon.searchValue;
  Provider.of<CommonProvider>(context,listen: false).setIsSearch(false);
    super.initState();
  }
  @override
  Widget build(BuildContext context) {
    var commonCon = Provider.of<CommonProvider>(context);
    return   Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12.0),
        color:Colors.white,
        border: Border.all(
          color: Colors.grey.shade300,
        ),
      ),
      child: Row(
        children: [
          SizedBox(width: kIsWeb ?16 :16.0.w),
          Expanded(
            child: TextField(
              controller: searchCon,
              onChanged: (String value) {
                if (_debounce?.isActive ?? false) _debounce!.cancel();
                _debounce = Timer(const Duration(milliseconds: 500), () {
                  if (value.length >= 3){
                    widget.onSearch(value);
                    commonCon.setIsSearch(true);
                  }else if(commonCon.isSearch){
                    widget.onSearch(value);
                  }
                });
              },
              decoration: InputDecoration(
                border: InputBorder.none,
                hintText: widget.hint,
                hintStyle: Theme.of(context).textTheme.displayLarge!.copyWith(
                    fontSize:kIsWeb ?12 : 12.sp,fontWeight: FontWeight.w400,
                    color: const Color(0xFF5A637E)
                ),
              ),
              style: Theme.of(context).textTheme.displayLarge!.copyWith(
                  fontSize: kIsWeb ?12 :12.sp,fontWeight: FontWeight.w400,
                  color: const Color(0xFF5A637E)
              ),
            ),
          ),
          ImageIcon(
            const AssetImage(AssetsIcons.search),
            size: kIsWeb ?18 :18.sp,
            color: Colors.grey,
          ),
          SizedBox(width:kIsWeb ?24 : 24.0.w),
        ],
      ),
    );
  }
}