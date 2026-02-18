import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import 'package:quick_ecommerce/router/app_routs.dart';

import 'config/api_urls.dart';
import 'config/app_controllers.dart';
import 'config/shared_preference_helper.dart';
import 'config/user_shared_preference.dart';
import 'controller/provider/thyme_provider.dart';
import 'data/service/local_database_repository.dart';
import 'data/service/notification_repository.dart';
import 'config/app_languages.dart';
import 'l10n/app_localizations.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Hive local database
  await Hive.initFlutter();
  await CartDatabaseHelpers.init();

  // Initialize Firebase
  await Firebase.initializeApp();

  // Disable landscape orientation
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set status bar & navigation bar colors
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarBrightness: Brightness.light,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // Get selected theme from shared preferences
  final theme = await UserSharedPreference.getValue(
    SharedPreferenceHelper.theme,
  );

  // Run the app
  runApp(
    MultiProvider(
      providers: getAppProviders(theme),
      child: const QuickEcommerce(),
    ),
  );

  // Initialize Stripe settings after first frame
  WidgetsBinding.instance.addPostFrameCallback((_) async {
    try {
      Stripe.publishableKey = ApiUrls.stripePublishableKey;
      await Stripe.instance.applySettings();
    } catch (e) {
      debugPrint("Stripe initialization failed: $e");
    }
  });
}

class QuickEcommerce extends StatelessWidget {
  const QuickEcommerce({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(360, 690),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (_, __) => const MyApp(),
    );
  }
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  String locale = '';

  Future<Locale> getLanguage() async {
    final theme = Provider.of<ThemeProvider>(context, listen: false);
    return await theme.fetchLocale();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Locale>(
      future: getLanguage(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done) {
          locale = snapshot.data?.languageCode ?? 'en';

          return Consumer<ThemeProvider>(
            builder: (context, model, _) {
              final brightness = MediaQuery.of(context).platformBrightness;
              final themeMode = brightness == Brightness.dark
                  ? ThemeMode.dark
                  : ThemeMode.light;

              return MaterialApp.router(
                debugShowCheckedModeBanner: false,
                routeInformationProvider:
                AppRoutes.router.routeInformationProvider,
                routeInformationParser:
                AppRoutes.router.routeInformationParser,
                routerDelegate: AppRoutes.router.routerDelegate,
                locale: model.appLocale,
                localizationsDelegates: const [
                  AppLocalizations.delegate,
                  GlobalMaterialLocalizations.delegate,
                  GlobalWidgetsLocalizations.delegate,
                  GlobalCupertinoLocalizations.delegate,
                ],
                supportedLocales: AppLanguages.supportedLocales,
                builder: (context, widget) {
                  ScreenUtil.init(
                    context,
                    designSize: const Size(360, 690),
                  );
                  return MediaQuery(
                    data: MediaQuery.of(context).copyWith(
                      textScaler: const TextScaler.linear(1.0),
                    ),
                    child: widget!,
                  );
                },
                themeMode: themeMode,
                theme: model.getTheme(),
                darkTheme: model.getTheme(),
              );
            },
          );
        }

        // Show a simple loading indicator while fetching language
        return const MaterialApp(
          debugShowCheckedModeBanner: false,
          home: Scaffold(
            body: Center(
              child: CircularProgressIndicator.adaptive(),
            ),
          ),
        );
      },
    );
  }
}
