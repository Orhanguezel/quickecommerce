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
import 'data/sirvice/lokal_database_repository.dart';
import 'data/sirvice/notification_reposytory.dart';
import 'l10n/app_localizations.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Hive local database
  await Hive.initFlutter();
  await CartDatabaseHelpers.init();

  // ------------------------------------------------------------
  // Firebase (LOCAL DEV SAFE)
  // - Web config placeholder varsa crash olur.
  // - Şimdilik web'de Firebase init'i SKIP ediyoruz.
  // - Mobile'da dosyalar varsa (google-services / plist) init çalışır.
  // ------------------------------------------------------------
  try {
    if (kIsWeb) {
      debugPrint('[BOOT] Firebase skipped on Web (no config in local dev).');
    } else {
      await Firebase.initializeApp();
      debugPrint('[BOOT] Firebase initialized (non-web).');
    }
  } catch (e) {
    debugPrint('[BOOT] Firebase init skipped: $e');
  }

  // Disable landscape orientation (web'de etkisi yok)
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

  // ------------------------------------------------------------
  // Stripe (LOCAL DEV SAFE)
  // - Publishable key placeholder ise init patlatabilir.
  // - Key girene kadar Stripe init'i skip ediyoruz.
  // ------------------------------------------------------------
  WidgetsBinding.instance.addPostFrameCallback((_) async {
    try {
      final pk = ApiUrls.stripePublishableKey.trim();
      final looksValid = pk.startsWith('pk_') || pk.startsWith('pk_test_') || pk.startsWith('pk_live_');

      if (!looksValid) {
        debugPrint('[BOOT] Stripe skipped (publishable key not set).');
        return;
      }

      Stripe.publishableKey = pk;
      await Stripe.instance.applySettings();
      debugPrint('[BOOT] Stripe initialized.');
    } catch (e) {
      debugPrint('[BOOT] Stripe initialization failed (skipped): $e');
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
              final themeMode =
                  brightness == Brightness.dark ? ThemeMode.dark : ThemeMode.light;

              return MaterialApp.router(
                debugShowCheckedModeBanner: false,
                routeInformationProvider: AppRoutes.router.routeInformationProvider,
                routeInformationParser: AppRoutes.router.routeInformationParser,
                routerDelegate: AppRoutes.router.routerDelegate,
                locale: model.appLocale,
                localizationsDelegates: const [
                  AppLocalizations.delegate,
                  GlobalMaterialLocalizations.delegate,
                  GlobalWidgetsLocalizations.delegate,
                  GlobalCupertinoLocalizations.delegate,
                ],
                supportedLocales: const [
                  Locale('tr'),
                  Locale('en'),
                ],
                builder: (context, widget) {
                  ScreenUtil.init(
                    context,
                    designSize: const Size(360, 690),
                  );
                  return MediaQuery(
                    data: MediaQuery.of(context).copyWith(
                      textScaler: const TextScaler.linear(1.0),
                    ),
                    child: widget ?? const SizedBox.shrink(),
                  );
                },
                themeMode: themeMode,
                theme: model.getTheme(),
                darkTheme: model.getTheme(),
              );
            },
          );
        }

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
