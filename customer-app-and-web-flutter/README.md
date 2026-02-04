# 🚀 QuickEcom Customer App — iOS / Android / Web

QuickEcom Customer App is a modern, high-performance eCommerce application built with **Flutter**. It’s fully responsive, cross-platform, and designed for multi-vendor or multi-store marketplaces such as grocery, fashion, electronics, furniture, and more.

This app is clean, modular, easy to customize, and integrates smoothly with any REST API backend.


## ⭐ Key Features

* Multi-store / Multi-vendor compatible
* Browse categories, products, collections
* Cart, checkout, order history & tracking
* Fully responsive: mobile, tablet & web
* Multi-language support (localization-ready)
* Works with any backend (REST / GraphQL)
* Clean Flutter code — easy theming & extension


## 📁 Project Structure

```
/
├─ lib/                # Screens, widgets, state, models
├─ assets/             # Images, icons, fonts, translations
├─ android/            # Android build files
├─ ios/                # iOS build files
├─ web/                # Web build
├─ linux/, macos/, windows/  # Optional desktop targets
├─ pubspec.yaml        # Config & dependencies
├─ .metadata + configs # Flutter project files
└─ README.md
```


## 🔧 Getting Started

1. Extract the project ZIP.

2. Install dependencies:

   ```bash
   flutter pub get
   ```

3. Configure your backend API (if required). Update the API base URL inside your configuration/service files.

4. Run the app:

   **Android / iOS**

   ```bash
   flutter run
   ```

   **Web**

   ```bash
   flutter run -d chrome
   ```


## 📦 Building for Production

```bash
flutter build apk        # Android APK  
flutter build ios        # iOS release  
flutter build web        # Web build  
```


## 🔐 Firebase Setup (IMPORTANT for Buyers)

This project **does NOT include** `google-services.json` or `GoogleService-Info.plist` because these files contain private keys.

Each buyer must add their own Firebase configuration.

### 📍 Step 1: Create a Firebase Project

Visit: [https://firebase.google.com](https://firebase.google.com)
Create a new project and add your Android, iOS, and Web apps.


### 📍 Step 2: Download the Required Files

#### **Android**

Download:

```
google-services.json
```

Place it here:

```
android/app/google-services.json
```

#### **iOS**

Download:

```
GoogleService-Info.plist
```

Place it here:

```
ios/Runner/GoogleService-Info.plist
```

#### **Web**

Copy the Firebase JS Config and place it inside:

```
web/firebase-config.js   (or your environment file)
```


### 📍 Step 3: Enable Required Firebase Services

Depending on your setup:

* Authentication
* Cloud Firestore / Realtime DB
* FCM (Push Notifications)
* Storage (Images, uploads)


## ⚙️ Customization & Integration

* Modify UI components in `lib/` for easy re-branding.
* Connect to any backend (Laravel API, Node.js, Django, etc.).
* Add language translations via Flutter localization.
* Extend functionality (wishlist, notifications, payments, profile system, etc.).

