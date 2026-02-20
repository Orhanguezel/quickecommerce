import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../../config/app_languages.dart';
import '../../config/icons.dart';
import '../../controller/provider/thyme_provider.dart';
import '../../l10n/app_localizations.dart';
import '../common_widgets/common_card.dart';

class LanguageSelectionScreen extends StatefulWidget {
  const LanguageSelectionScreen({super.key});

  @override
  LanguageSelectionScreenState createState() =>
      LanguageSelectionScreenState();
}

class LanguageSelectionScreenState extends State<LanguageSelectionScreen> {


  double height=10;

  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<ThemeProvider>(context);
    final selectedLocale = languageProvider.appLocale.languageCode;
    
    // Dynamic Language List construction
    final List<Language> languages = AppLanguages.supportedLocales.map((locale) {
      final code = locale.languageCode;
      final details = AppLanguages.languageDetails[code];
      
      // Determine name dynamically if available in AppLocalizations, else fallback
      String name = details?['name'] ?? 'Unknown';
       if (code == 'ar') name = AppLocalizations.of(context)!.arabic;
       else if (code == 'en') name = AppLocalizations.of(context)!.english;
       else if (code == 'es') name = AppLocalizations.of(context)!.spanish;
       else if (code == 'tr') name = 'Turkish'; // Fallback as key might not exist yet in arb
      
      // Determine flag
      String flag = details?['flag'] ?? '';
      // Map back to AssetsIcons constants if possible to maintain consistency
       if (code == 'ar') flag = AssetsIcons.arFlag;
       else if (code == 'en') flag = AssetsIcons.usFlag;
       else if (code == 'es') flag = AssetsIcons.spain;
       // Turkish flag needs to be added to AssetsIcons or handled here
       if (code == 'tr') flag = 'assets/icons/tr_flag.png'; // Assuming asset exists

      return Language(
        name: name,
        flag: flag,
        locale: code,
        countryCode: details?['countryCode'] ?? '',
      );
    }).toList();


    height=languages.length*50;
    return Scaffold(
      appBar: AppBar(
        title:  Text(
           AppLocalizations.of(context)!.changeLanguage,
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(
              fontWeight: FontWeight.w500,
              fontSize: 16.sp),

        ),
        centerTitle: true,
      ),
      body:Column(
        children: [
          CommonCard(
              mHorizontal: 12 ,
              widget:SizedBox(
                height: height.h,
                child: ListView.builder(
                  itemCount: languages.length,
                  itemBuilder: (context, index) {
                    final language = languages[index];
                    return GestureDetector(
                      onTap: () {
                        languageProvider.changeLanguage(
                          Locale(language.locale),
                        );
                      },
                      child: Container(
                        padding: EdgeInsets.symmetric(
                            horizontal: 16.w, vertical: 12.h),
                        margin: EdgeInsets.only(bottom: 8.h),
                        decoration: BoxDecoration(
                          color: selectedLocale == language.locale
                              ? Colors.grey.shade100
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                        child: Row(
                          children: [
                            Image.asset(
                              language.flag,
                              height: 20.h,
                              width: 20.w,
                              errorBuilder: (context, error, stackTrace) => Icon(Icons.flag, size: 20.sp),
                            ),
                            SizedBox(width: 12.w),
                            Expanded(
                              child: Text(
                                language.name,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                    fontWeight: FontWeight.w500,
                                    color: selectedLocale == language.locale
                                        ? Colors.black
                                        : Colors.grey,
                                    fontSize: 16.sp),
                              ),
                            ),
                            if (selectedLocale == language.locale)
                              Icon(Icons.check, color: Colors.blue, size: 20.sp),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              )
          ),
           SizedBox(height: 10.h,),
        ],
      ),
    );
  }
}


class Language {
  final String name;
  final String flag;
  final String locale;
  final String countryCode;

  Language({
    required this.name,
    required this.flag,
    required this.locale,
    required this.countryCode,
  });
}