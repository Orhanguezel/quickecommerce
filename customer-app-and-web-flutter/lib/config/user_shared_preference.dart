import 'package:shared_preferences/shared_preferences.dart';

//=================this class used for save data locally=============
//-------------------------------------------------------------------

class UserSharedPreference {
  //================ to add something ===============
  //================ we have to pass the ============
  //================ key and the value just =========
  //-------------------------------------------------
  static putValue(String key, String value) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString(key, value);
  }

  static putBool(String key, bool value) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setBool(key, value);
  }



  //================ to get something ====================
  //================ we have to pass the key just ========
  //------------------------------------------------------
  static Future<String?> getValue(String key) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }


  static Future<bool?> getBool(String key) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getBool(key);
  }
  //================ to remove something ==================
  //================ we just have to pass the key =========
  //-------------------------------------------------------
  static clearValue(String key) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.remove(key);
  }
  static clearBool(String key) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.remove(key);
  }

}
