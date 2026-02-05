// To parse this JSON data, do
//
//     final menuListModel = menuListModelFromJson(jsonString);

import 'dart:convert';

MenuListModel menuListModelFromJson(String str) =>
    MenuListModel.fromJson(json.decode(str));

String menuListModelToJson(MenuListModel data) => json.encode(data.toJson());

class MenuListModel {
  final List<MenuItem> menus;

  MenuListModel({
    required this.menus,
  });

  factory MenuListModel.fromJson(Map<String, dynamic> json) => MenuListModel(
        menus: json["menus"] == null
            ? []
            : List<MenuItem>.from(
                json["menus"].map((x) => MenuItem.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "menus": List<dynamic>.from(menus.map((x) => x.toJson())),
      };
}

class MenuItem {
  final dynamic id;
  final dynamic pageId;
  final dynamic name;
  final dynamic label;
  final dynamic url;
  final dynamic icon;
  final dynamic position;
  final dynamic isVisible;
  final dynamic parentId;
  final dynamic parentPath;
  final dynamic menuLevel;
  final dynamic menuPath;
  final dynamic menuContent;
  final List<MenuItem> childrenRecursive;

  MenuItem({
    this.id,
    this.pageId,
    this.name,
    this.label,
    this.url,
    this.icon,
    this.position,
    this.isVisible,
    this.parentId,
    this.parentPath,
    this.menuLevel,
    this.menuPath,
    this.menuContent,
    this.childrenRecursive = const [],
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) => MenuItem(
        id: json["id"],
        pageId: json["page_id"],
        name: json["name"],
        label: json["label"],
        url: json["url"],
        icon: json["icon"],
        position: json["position"],
        isVisible: json["is_visible"],
        parentId: json["parent_id"],
        parentPath: json["parent_path"],
        menuLevel: json["menu_level"],
        menuPath: json["menu_path"],
        menuContent: json["menu_content"],
        childrenRecursive: json["childrenRecursive"] == null
            ? []
            : List<MenuItem>.from(
                json["childrenRecursive"].map((x) => MenuItem.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "page_id": pageId,
        "name": name,
        "label": label,
        "url": url,
        "icon": icon,
        "position": position,
        "is_visible": isVisible,
        "parent_id": parentId,
        "parent_path": parentPath,
        "menu_level": menuLevel,
        "menu_path": menuPath,
        "menu_content": menuContent,
        "childrenRecursive":
            List<dynamic>.from(childrenRecursive.map((x) => x.toJson())),
      };
}
