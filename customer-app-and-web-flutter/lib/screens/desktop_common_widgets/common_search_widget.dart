import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/config/icons.dart';

import '../../controller/provider/common_provider.dart';
import '../../controller/provider/filter_controller.dart';
import '../../controller/provider/home_screen_provider.dart';

/// This search widget refers upper search portion
/// this is bill number based search
class DesktopSearchWidget extends StatefulWidget {
  final ValueChanged<String> onSearch;
  final String hint;
  final String type;
  const DesktopSearchWidget({
    super.key,
    required this.onSearch,
    required this.hint,
    required this.type,
  });

  @override
  DesktopSearchWidgetState createState() => DesktopSearchWidgetState();
}

class DesktopSearchWidgetState extends State<DesktopSearchWidget> {
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
    var filterCon = Provider.of<FilterController>(context);
    var homeCon = Provider.of<HomeScreenProvider>(context);
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
          const SizedBox(width: 16.0),
          Expanded(
            child: TextFormField(
              controller: searchCon,
              onChanged: (String value) {
                if (_debounce?.isActive ?? false) _debounce!.cancel();
                _debounce = Timer(const Duration(milliseconds: 500), () {
                  if (value.length >= 3){
                     if( widget.type=='Products'){
                       homeCon.setTabType("Products");
                     }
                    widget.onSearch(value);
                    commonCon.setIsSearch(true);
                  }else if(commonCon.isSearch){
                    widget.onSearch(value);
                  }
                });
              },
              onFieldSubmitted: (_) {
                if(searchCon.text.length>3){
                  filterCon.setSearchValue(
                      searchCon.text);
                  homeCon.setTabType("Products");
                }
              },
              decoration: InputDecoration(
                border: InputBorder.none,
                hintText: widget.hint,
                hintStyle: Theme.of(context).textTheme.displayLarge!.copyWith(
                    fontSize: 12,fontWeight: FontWeight.w400,
                    color: const Color(0xFF5A637E)
                ),
              ),
              style: Theme.of(context).textTheme.displayLarge!.copyWith(
                  fontSize: 12,fontWeight: FontWeight.w400,
                  color: const Color(0xFF5A637E)
              ),
            ),
          ),
          const ImageIcon(
            AssetImage(AssetsIcons.search),
            size: 18,
            color: Colors.grey,
          ),
          const SizedBox(width: 24.0),
        ],
      ),
    );
  }
}