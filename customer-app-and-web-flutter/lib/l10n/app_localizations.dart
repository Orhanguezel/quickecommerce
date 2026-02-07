import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_tr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('tr'),
    Locale('en'),
  ];

  /// No description provided for @availableBalance.
  ///
  /// In en, this message translates to:
  /// **'Available Balance'**
  String get availableBalance;

  /// No description provided for @availableStartTime.
  ///
  /// In en, this message translates to:
  /// **'Available Start Time'**
  String get availableStartTime;

  /// No description provided for @availableEndTime.
  ///
  /// In en, this message translates to:
  /// **'Available End Time'**
  String get availableEndTime;

  /// No description provided for @askSellerQuestion.
  ///
  /// In en, this message translates to:
  /// **'Ask seller a question'**
  String get askSellerQuestion;

  /// No description provided for @areYouSureToRefund.
  ///
  /// In en, this message translates to:
  /// **'Are You Sure to Refund?'**
  String get areYouSureToRefund;

  /// No description provided for @areYouSure.
  ///
  /// In en, this message translates to:
  /// **'Are You Sure ?'**
  String get areYouSure;

  /// No description provided for @areYouSureExitTheApp.
  ///
  /// In en, this message translates to:
  /// **'Are You Sure You Want to Exit The App?'**
  String get areYouSureExitTheApp;

  /// No description provided for @areYouSureLogOut.
  ///
  /// In en, this message translates to:
  /// **'Are You Sure You Want to log out?'**
  String get areYouSureLogOut;

  /// No description provided for @areYouSureDeleteAllItems.
  ///
  /// In en, this message translates to:
  /// **'Are You Sure You Want to Delete All Items?'**
  String get areYouSureDeleteAllItems;

  /// No description provided for @alreadyHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have account'**
  String get alreadyHaveAccount;

  /// No description provided for @allProduct.
  ///
  /// In en, this message translates to:
  /// **'All Products'**
  String get allProduct;

  /// No description provided for @addToCart.
  ///
  /// In en, this message translates to:
  /// **'Add To Cart'**
  String get addToCart;

  /// No description provided for @addCouponCode.
  ///
  /// In en, this message translates to:
  /// **'Add Coupon Code'**
  String get addCouponCode;

  /// No description provided for @amount.
  ///
  /// In en, this message translates to:
  /// **'Amount'**
  String get amount;

  /// No description provided for @allCategories.
  ///
  /// In en, this message translates to:
  /// **'All Categories'**
  String get allCategories;

  /// No description provided for @answers.
  ///
  /// In en, this message translates to:
  /// **'Answers'**
  String get answers;

  /// No description provided for @arrivals.
  ///
  /// In en, this message translates to:
  /// **'Arrivals'**
  String get arrivals;

  /// No description provided for @apply.
  ///
  /// In en, this message translates to:
  /// **'Apply'**
  String get apply;

  /// No description provided for @all.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get all;

  /// No description provided for @allSelectedProductsWillRemoved.
  ///
  /// In en, this message translates to:
  /// **'All selected products will be removed.'**
  String get allSelectedProductsWillRemoved;

  /// No description provided for @admin.
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get admin;

  /// No description provided for @active.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get active;

  /// No description provided for @allProductSearch.
  ///
  /// In en, this message translates to:
  /// **'All product search'**
  String get allProductSearch;

  /// No description provided for @address.
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get address;

  /// No description provided for @addAddress.
  ///
  /// In en, this message translates to:
  /// **'Add Address'**
  String get addAddress;

  /// No description provided for @addressList.
  ///
  /// In en, this message translates to:
  /// **'Address List'**
  String get addressList;

  /// No description provided for @addDeliveryAddress.
  ///
  /// In en, this message translates to:
  /// **'Add Delivery Address'**
  String get addDeliveryAddress;

  /// No description provided for @available.
  ///
  /// In en, this message translates to:
  /// **'Available?'**
  String get available;

  /// No description provided for @accept.
  ///
  /// In en, this message translates to:
  /// **'Accept'**
  String get accept;

  /// No description provided for @arabic.
  ///
  /// In en, this message translates to:
  /// **'Arabic'**
  String get arabic;

  /// No description provided for @additionalCharge.
  ///
  /// In en, this message translates to:
  /// **'Additional Fee'**
  String get additionalCharge;

  /// No description provided for @accountName.
  ///
  /// In en, this message translates to:
  /// **'Account Name'**
  String get accountName;

  /// No description provided for @accountNo.
  ///
  /// In en, this message translates to:
  /// **'Account No'**
  String get accountNo;

  /// No description provided for @branchName.
  ///
  /// In en, this message translates to:
  /// **'Branch Name'**
  String get branchName;

  /// No description provided for @bangle.
  ///
  /// In en, this message translates to:
  /// **'Bangle'**
  String get bangle;

  /// No description provided for @brand.
  ///
  /// In en, this message translates to:
  /// **'Brand'**
  String get brand;

  /// No description provided for @best.
  ///
  /// In en, this message translates to:
  /// **'Best'**
  String get best;

  /// No description provided for @birthday.
  ///
  /// In en, this message translates to:
  /// **'Birthday'**
  String get birthday;

  /// No description provided for @quickEcommerce.
  ///
  /// In en, this message translates to:
  /// **'Quick Ecommerce'**
  String get quickEcommerce;

  /// No description provided for @buyNow.
  ///
  /// In en, this message translates to:
  /// **'Buy Now'**
  String get buyNow;

  /// No description provided for @backToSignIn.
  ///
  /// In en, this message translates to:
  /// **'Back To Sign In'**
  String get backToSignIn;

  /// No description provided for @backSignIn.
  ///
  /// In en, this message translates to:
  /// **'Back to sign in'**
  String get backSignIn;

  /// No description provided for @completeOrder.
  ///
  /// In en, this message translates to:
  /// **'Complete Order'**
  String get completeOrder;

  /// No description provided for @completed.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get completed;

  /// No description provided for @contributes.
  ///
  /// In en, this message translates to:
  /// **'Contributes'**
  String get contributes;

  /// No description provided for @cashInHand.
  ///
  /// In en, this message translates to:
  /// **'Cash In Hand'**
  String get cashInHand;

  /// No description provided for @createWithdrawal.
  ///
  /// In en, this message translates to:
  /// **'Create Withdrawal'**
  String get createWithdrawal;

  /// No description provided for @createAccount.
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get createAccount;

  /// No description provided for @createAccountWithExistingInfo.
  ///
  /// In en, this message translates to:
  /// **'Create account with existing info'**
  String get createAccountWithExistingInfo;

  /// No description provided for @changeEmail.
  ///
  /// In en, this message translates to:
  /// **'Change Email'**
  String get changeEmail;

  /// No description provided for @changeLanguage.
  ///
  /// In en, this message translates to:
  /// **'Change Language'**
  String get changeLanguage;

  /// No description provided for @changeOfMindAllowed.
  ///
  /// In en, this message translates to:
  /// **'Change of Mind Allowed'**
  String get changeOfMindAllowed;

  /// No description provided for @changePassword.
  ///
  /// In en, this message translates to:
  /// **'Change Password'**
  String get changePassword;

  /// No description provided for @confirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get confirmPassword;

  /// No description provided for @confirmRejection.
  ///
  /// In en, this message translates to:
  /// **'Confirm Rejection'**
  String get confirmRejection;

  /// No description provided for @confirmPickup.
  ///
  /// In en, this message translates to:
  /// **'Confirm pickup and proceed?'**
  String get confirmPickup;

  /// No description provided for @confirmation.
  ///
  /// In en, this message translates to:
  /// **'Confirmation'**
  String get confirmation;

  /// No description provided for @confirmCancellation.
  ///
  /// In en, this message translates to:
  /// **'Confirm cancellation'**
  String get confirmCancellation;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @clearAll.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get clearAll;

  /// No description provided for @confirmClearCart.
  ///
  /// In en, this message translates to:
  /// **'Confirm clear cart?'**
  String get confirmClearCart;

  /// No description provided for @continueT.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get continueT;

  /// No description provided for @cancelOrder.
  ///
  /// In en, this message translates to:
  /// **'Cancel Order'**
  String get cancelOrder;

  /// No description provided for @call.
  ///
  /// In en, this message translates to:
  /// **'Call'**
  String get call;

  /// No description provided for @chat.
  ///
  /// In en, this message translates to:
  /// **'Chat'**
  String get chat;

  /// No description provided for @checkout.
  ///
  /// In en, this message translates to:
  /// **'Checkout'**
  String get checkout;

  /// No description provided for @cartIsEmpty.
  ///
  /// In en, this message translates to:
  /// **'Cart is empty'**
  String get cartIsEmpty;

  /// No description provided for @color.
  ///
  /// In en, this message translates to:
  /// **'Color'**
  String get color;

  /// No description provided for @clear.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get clear;

  /// No description provided for @category.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get category;

  /// No description provided for @createTicket.
  ///
  /// In en, this message translates to:
  /// **'Create Ticket'**
  String get createTicket;

  /// No description provided for @contact.
  ///
  /// In en, this message translates to:
  /// **'Contact'**
  String get contact;

  /// No description provided for @couponList.
  ///
  /// In en, this message translates to:
  /// **'Coupon List'**
  String get couponList;

  /// No description provided for @coupon.
  ///
  /// In en, this message translates to:
  /// **'Coupon'**
  String get coupon;

  /// No description provided for @contactNumber.
  ///
  /// In en, this message translates to:
  /// **'Contact Number'**
  String get contactNumber;

  /// No description provided for @customer.
  ///
  /// In en, this message translates to:
  /// **'Customer'**
  String get customer;

  /// No description provided for @changeImage.
  ///
  /// In en, this message translates to:
  /// **'Change Image'**
  String get changeImage;

  /// No description provided for @customerDetails.
  ///
  /// In en, this message translates to:
  /// **'Customer Details'**
  String get customerDetails;

  /// No description provided for @couponDiscount.
  ///
  /// In en, this message translates to:
  /// **'Coupon Discount'**
  String get couponDiscount;

  /// No description provided for @cashOnDelivery.
  ///
  /// In en, this message translates to:
  /// **'Cash On Delivery'**
  String get cashOnDelivery;

  /// No description provided for @checkDetails.
  ///
  /// In en, this message translates to:
  /// **'Check Details'**
  String get checkDetails;

  /// No description provided for @choosePaymentMethod.
  ///
  /// In en, this message translates to:
  /// **'Choose Payment Method'**
  String get choosePaymentMethod;

  /// No description provided for @congratulations.
  ///
  /// In en, this message translates to:
  /// **'Congratulations!'**
  String get congratulations;

  /// No description provided for @cashCollectionFromCustomer.
  ///
  /// In en, this message translates to:
  /// **'Cash Collection from customer'**
  String get cashCollectionFromCustomer;

  /// No description provided for @discount.
  ///
  /// In en, this message translates to:
  /// **'Discount'**
  String get discount;

  /// No description provided for @deposit.
  ///
  /// In en, this message translates to:
  /// **'Deposit'**
  String get deposit;

  /// No description provided for @deals.
  ///
  /// In en, this message translates to:
  /// **'Deals'**
  String get deals;

  /// No description provided for @depositAmount.
  ///
  /// In en, this message translates to:
  /// **'Deposit Amount'**
  String get depositAmount;

  /// No description provided for @deliveryFee.
  ///
  /// In en, this message translates to:
  /// **'Delivery Fee'**
  String get deliveryFee;

  /// No description provided for @deliveryman.
  ///
  /// In en, this message translates to:
  /// **'Deliveryman'**
  String get deliveryman;

  /// No description provided for @deliveryNote.
  ///
  /// In en, this message translates to:
  /// **'Delivery Note'**
  String get deliveryNote;

  /// No description provided for @deliveryOptions.
  ///
  /// In en, this message translates to:
  /// **'Delivery Options'**
  String get deliveryOptions;

  /// No description provided for @deliveryAddresses.
  ///
  /// In en, this message translates to:
  /// **'Delivery Addresses'**
  String get deliveryAddresses;

  /// No description provided for @deliveryAddressesNotFound.
  ///
  /// In en, this message translates to:
  /// **'Delivery Address Not Found'**
  String get deliveryAddressesNotFound;

  /// No description provided for @deliveryInfo.
  ///
  /// In en, this message translates to:
  /// **'Delivery Info'**
  String get deliveryInfo;

  /// No description provided for @deliverymanInfo.
  ///
  /// In en, this message translates to:
  /// **'Deliveryman Info'**
  String get deliverymanInfo;

  /// No description provided for @deliveryType.
  ///
  /// In en, this message translates to:
  /// **'Delivery Type'**
  String get deliveryType;

  /// No description provided for @deliveryCharge.
  ///
  /// In en, this message translates to:
  /// **'Delivery Fee'**
  String get deliveryCharge;

  /// No description provided for @deliveryDate.
  ///
  /// In en, this message translates to:
  /// **'Delivery Date'**
  String get deliveryDate;

  /// No description provided for @deliveryTime.
  ///
  /// In en, this message translates to:
  /// **'Delivery Time'**
  String get deliveryTime;

  /// No description provided for @direction.
  ///
  /// In en, this message translates to:
  /// **'Direction'**
  String get direction;

  /// No description provided for @details.
  ///
  /// In en, this message translates to:
  /// **'Details'**
  String get details;

  /// No description provided for @days.
  ///
  /// In en, this message translates to:
  /// **'DAYS'**
  String get days;

  /// No description provided for @date.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get date;

  /// No description provided for @describe.
  ///
  /// In en, this message translates to:
  /// **'Describe'**
  String get describe;

  /// No description provided for @description.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get description;

  /// No description provided for @dataNotFound.
  ///
  /// In en, this message translates to:
  /// **'Data Not Found'**
  String get dataNotFound;

  /// No description provided for @dontHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Don’t have an account?'**
  String get dontHaveAccount;

  /// No description provided for @doYouHaveAndAccount.
  ///
  /// In en, this message translates to:
  /// **'Do you have and account?'**
  String get doYouHaveAndAccount;

  /// No description provided for @doYouWantToCreateAnAccount.
  ///
  /// In en, this message translates to:
  /// **'Do you want to create an account'**
  String get doYouWantToCreateAnAccount;

  /// No description provided for @deleteAll.
  ///
  /// In en, this message translates to:
  /// **'Delete All'**
  String get deleteAll;

  /// No description provided for @deleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Delete account'**
  String get deleteAccount;

  /// No description provided for @deletePermanent.
  ///
  /// In en, this message translates to:
  /// **'Delete Account (Permanent Deletion)*'**
  String get deletePermanent;

  /// No description provided for @deleteAccountNote.
  ///
  /// In en, this message translates to:
  /// **'Deleting your account will remove all your data permanently and cannot be undone. If you wish to return, you’ll need to create a new account.'**
  String get deleteAccountNote;

  /// No description provided for @deactivateAccount.
  ///
  /// In en, this message translates to:
  /// **'Deactivate account'**
  String get deactivateAccount;

  /// No description provided for @deactivate.
  ///
  /// In en, this message translates to:
  /// **'Deactivate'**
  String get deactivate;

  /// No description provided for @department.
  ///
  /// In en, this message translates to:
  /// **'Department'**
  String get department;

  /// No description provided for @deactivateNote.
  ///
  /// In en, this message translates to:
  /// **'If you need a break, you can deactivate your account temporarily. Your personal information will remain intact, and you can reactivate anytime by logging in again.'**
  String get deactivateNote;

  /// No description provided for @deactivateTemporary.
  ///
  /// In en, this message translates to:
  /// **'Deactivate Account (Temporary Suspension)'**
  String get deactivateTemporary;

  /// No description provided for @deactivatePurpose.
  ///
  /// In en, this message translates to:
  /// **'Deactivate Purpose'**
  String get deactivatePurpose;

  /// No description provided for @deactivateDeleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Deactivate/Delete Account'**
  String get deactivateDeleteAccount;

  /// No description provided for @describeDetails.
  ///
  /// In en, this message translates to:
  /// **'Describe Details'**
  String get describeDetails;

  /// No description provided for @earningsOverview.
  ///
  /// In en, this message translates to:
  /// **'Earnings Overview'**
  String get earningsOverview;

  /// No description provided for @earningsPasswordAndRemember.
  ///
  /// In en, this message translates to:
  /// **'Enter your new password and remember it.'**
  String get earningsPasswordAndRemember;

  /// No description provided for @enterAddress.
  ///
  /// In en, this message translates to:
  /// **'Enter Address'**
  String get enterAddress;

  /// No description provided for @enterVerificationCode.
  ///
  /// In en, this message translates to:
  /// **'Enter the 6-digit verification code send to your email address.'**
  String get enterVerificationCode;

  /// No description provided for @enterFirstName.
  ///
  /// In en, this message translates to:
  /// **'Enter First Name'**
  String get enterFirstName;

  /// No description provided for @enterFullName.
  ///
  /// In en, this message translates to:
  /// **'Enter Full Name'**
  String get enterFullName;

  /// No description provided for @enterPhone.
  ///
  /// In en, this message translates to:
  /// **'Enter Phone'**
  String get enterPhone;

  /// No description provided for @enterYourPhone.
  ///
  /// In en, this message translates to:
  /// **'Enter Your Phone'**
  String get enterYourPhone;

  /// No description provided for @enterLastName.
  ///
  /// In en, this message translates to:
  /// **'Enter Last Name'**
  String get enterLastName;

  /// No description provided for @enterConfirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Enter Confirm Password'**
  String get enterConfirmPassword;

  /// No description provided for @enterPassword.
  ///
  /// In en, this message translates to:
  /// **'Enter Password'**
  String get enterPassword;

  /// No description provided for @enterOldPassword.
  ///
  /// In en, this message translates to:
  /// **'Enter Old Password'**
  String get enterOldPassword;

  /// No description provided for @enterNewEmail.
  ///
  /// In en, this message translates to:
  /// **'Enter New Email'**
  String get enterNewEmail;

  /// No description provided for @emailVerification.
  ///
  /// In en, this message translates to:
  /// **'Email Verification'**
  String get emailVerification;

  /// No description provided for @emailVerificationRequired.
  ///
  /// In en, this message translates to:
  /// **'Email verification Required'**
  String get emailVerificationRequired;

  /// No description provided for @enterEmail.
  ///
  /// In en, this message translates to:
  /// **'Enter Email'**
  String get enterEmail;

  /// No description provided for @editProfile.
  ///
  /// In en, this message translates to:
  /// **'Edit Profile'**
  String get editProfile;

  /// No description provided for @enterValidEmail.
  ///
  /// In en, this message translates to:
  /// **'Enter a Valid Email'**
  String get enterValidEmail;

  /// No description provided for @email.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// No description provided for @expiresOn.
  ///
  /// In en, this message translates to:
  /// **'Expires On'**
  String get expiresOn;

  /// No description provided for @english.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// No description provided for @enterWithdrawAmount.
  ///
  /// In en, this message translates to:
  /// **'Enter Withdraw Amount'**
  String get enterWithdrawAmount;

  /// No description provided for @enterBranchName.
  ///
  /// In en, this message translates to:
  /// **'Enter Branch Name'**
  String get enterBranchName;

  /// No description provided for @enterDepositAmount.
  ///
  /// In en, this message translates to:
  /// **'Enter Deposit Amount'**
  String get enterDepositAmount;

  /// No description provided for @enterAccountName.
  ///
  /// In en, this message translates to:
  /// **'Enter Account Name'**
  String get enterAccountName;

  /// No description provided for @enterAccountNo.
  ///
  /// In en, this message translates to:
  /// **'Enter Account No'**
  String get enterAccountNo;

  /// No description provided for @enterYourPassword.
  ///
  /// In en, this message translates to:
  /// **'Enter Your Password'**
  String get enterYourPassword;

  /// No description provided for @enterNewPassword.
  ///
  /// In en, this message translates to:
  /// **'Enter your new Password'**
  String get enterNewPassword;

  /// No description provided for @enterValidPassword.
  ///
  /// In en, this message translates to:
  /// **'Enter Valid Password'**
  String get enterValidPassword;

  /// No description provided for @enterValidToken.
  ///
  /// In en, this message translates to:
  /// **'Enter Valid Token'**
  String get enterValidToken;

  /// No description provided for @enterToken.
  ///
  /// In en, this message translates to:
  /// **'Enter your token'**
  String get enterToken;

  /// No description provided for @firstName.
  ///
  /// In en, this message translates to:
  /// **'First Name'**
  String get firstName;

  /// No description provided for @fieldRequired.
  ///
  /// In en, this message translates to:
  /// **'Field Is Required'**
  String get fieldRequired;

  /// No description provided for @file.
  ///
  /// In en, this message translates to:
  /// **'File'**
  String get file;

  /// No description provided for @flash.
  ///
  /// In en, this message translates to:
  /// **'Flash'**
  String get flash;

  /// No description provided for @floor.
  ///
  /// In en, this message translates to:
  /// **'Floor'**
  String get floor;

  /// No description provided for @filter.
  ///
  /// In en, this message translates to:
  /// **'Filter'**
  String get filter;

  /// No description provided for @featured.
  ///
  /// In en, this message translates to:
  /// **'Featured'**
  String get featured;

  /// No description provided for @filterBy.
  ///
  /// In en, this message translates to:
  /// **'Filter By'**
  String get filterBy;

  /// No description provided for @forgetPassword.
  ///
  /// In en, this message translates to:
  /// **'Forget Password'**
  String get forgetPassword;

  /// No description provided for @getAccess.
  ///
  /// In en, this message translates to:
  /// **'Get access to limited-time deals and special promotions.'**
  String get getAccess;

  /// No description provided for @goToSignIn.
  ///
  /// In en, this message translates to:
  /// **'Go to Sign In'**
  String get goToSignIn;

  /// No description provided for @getLocation.
  ///
  /// In en, this message translates to:
  /// **'Get Location'**
  String get getLocation;

  /// No description provided for @gender.
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get gender;

  /// No description provided for @home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// No description provided for @house.
  ///
  /// In en, this message translates to:
  /// **'House'**
  String get house;

  /// No description provided for @hours.
  ///
  /// In en, this message translates to:
  /// **'HOURS'**
  String get hours;

  /// No description provided for @homeDelivery.
  ///
  /// In en, this message translates to:
  /// **'Home Delivery'**
  String get homeDelivery;

  /// No description provided for @history.
  ///
  /// In en, this message translates to:
  /// **'History'**
  String get history;

  /// No description provided for @item.
  ///
  /// In en, this message translates to:
  /// **'Item'**
  String get item;

  /// No description provided for @iAgreePlaces.
  ///
  /// In en, this message translates to:
  /// **'I agree that placing the order places me under'**
  String get iAgreePlaces;

  /// No description provided for @inStockOnly.
  ///
  /// In en, this message translates to:
  /// **'In-stock products only'**
  String get inStockOnly;

  /// No description provided for @inStock.
  ///
  /// In en, this message translates to:
  /// **'In Stock'**
  String get inStock;

  /// No description provided for @iD.
  ///
  /// In en, this message translates to:
  /// **'ID:'**
  String get iD;

  /// No description provided for @itemDetails.
  ///
  /// In en, this message translates to:
  /// **'Items Details'**
  String get itemDetails;

  /// No description provided for @importYourCoupon.
  ///
  /// In en, this message translates to:
  /// **'Import Your Coupon'**
  String get importYourCoupon;

  /// No description provided for @invoiceNumber.
  ///
  /// In en, this message translates to:
  /// **'Invoice Number'**
  String get invoiceNumber;

  /// No description provided for @keywordSuggestion.
  ///
  /// In en, this message translates to:
  /// **'Keyword Suggestion'**
  String get keywordSuggestion;

  /// No description provided for @kindlyRefreshTheDeliveryAddress.
  ///
  /// In en, this message translates to:
  /// **'Kindly refresh the delivery address.'**
  String get kindlyRefreshTheDeliveryAddress;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @lastName.
  ///
  /// In en, this message translates to:
  /// **'Last Name'**
  String get lastName;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// No description provided for @loginWithOTP.
  ///
  /// In en, this message translates to:
  /// **'Login With OTP'**
  String get loginWithOTP;

  /// No description provided for @likes.
  ///
  /// In en, this message translates to:
  /// **'Likes'**
  String get likes;

  /// No description provided for @location.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get location;

  /// No description provided for @message.
  ///
  /// In en, this message translates to:
  /// **'Message'**
  String get message;

  /// No description provided for @myAccount.
  ///
  /// In en, this message translates to:
  /// **'My Account'**
  String get myAccount;

  /// No description provided for @myProfile.
  ///
  /// In en, this message translates to:
  /// **'My Profile'**
  String get myProfile;

  /// No description provided for @myWallet.
  ///
  /// In en, this message translates to:
  /// **'My Wallet'**
  String get myWallet;

  /// No description provided for @myCart.
  ///
  /// In en, this message translates to:
  /// **'My Cart'**
  String get myCart;

  /// No description provided for @max.
  ///
  /// In en, this message translates to:
  /// **'Max'**
  String get max;

  /// No description provided for @myOrder.
  ///
  /// In en, this message translates to:
  /// **'My Order'**
  String get myOrder;

  /// No description provided for @myWishlist.
  ///
  /// In en, this message translates to:
  /// **'My Wishlist'**
  String get myWishlist;

  /// No description provided for @minutes.
  ///
  /// In en, this message translates to:
  /// **'MINUTES'**
  String get minutes;

  /// No description provided for @maximumAllowedQuantity.
  ///
  /// In en, this message translates to:
  /// **'Maximum allowed quantity:'**
  String get maximumAllowedQuantity;

  /// No description provided for @minimumCharacters.
  ///
  /// In en, this message translates to:
  /// **'Minimum 8 characters.'**
  String get minimumCharacters;

  /// No description provided for @notification.
  ///
  /// In en, this message translates to:
  /// **'Notification'**
  String get notification;

  /// No description provided for @name.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get name;

  /// No description provided for @newA.
  ///
  /// In en, this message translates to:
  /// **'New'**
  String get newA;

  /// No description provided for @newEmail.
  ///
  /// In en, this message translates to:
  /// **'New Email'**
  String get newEmail;

  /// No description provided for @newPassword.
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get newPassword;

  /// No description provided for @noInternet.
  ///
  /// In en, this message translates to:
  /// **'No Internet'**
  String get noInternet;

  /// No description provided for @noAddressAvailablePleaseAddAddress.
  ///
  /// In en, this message translates to:
  /// **'No address available. Please add an address.'**
  String get noAddressAvailablePleaseAddAddress;

  /// No description provided for @no.
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get no;

  /// No description provided for @noDataFound.
  ///
  /// In en, this message translates to:
  /// **'No Data Found'**
  String get noDataFound;

  /// No description provided for @notes.
  ///
  /// In en, this message translates to:
  /// **'Notes:'**
  String get notes;

  /// No description provided for @oldEmail.
  ///
  /// In en, this message translates to:
  /// **'Old Email'**
  String get oldEmail;

  /// No description provided for @orContinueWith.
  ///
  /// In en, this message translates to:
  /// **'Or continue with'**
  String get orContinueWith;

  /// No description provided for @oldPassword.
  ///
  /// In en, this message translates to:
  /// **'Old Password'**
  String get oldPassword;

  /// No description provided for @orderDetails.
  ///
  /// In en, this message translates to:
  /// **'Order Details'**
  String get orderDetails;

  /// No description provided for @orderDate.
  ///
  /// In en, this message translates to:
  /// **'Order Date'**
  String get orderDate;

  /// No description provided for @onlinePaymentOptions.
  ///
  /// In en, this message translates to:
  /// **'Online Payment Options'**
  String get onlinePaymentOptions;

  /// No description provided for @orderAmount.
  ///
  /// In en, this message translates to:
  /// **'Order Amount'**
  String get orderAmount;

  /// No description provided for @orderNote.
  ///
  /// In en, this message translates to:
  /// **'Order Note'**
  String get orderNote;

  /// No description provided for @outOfStock.
  ///
  /// In en, this message translates to:
  /// **'Out of Stock'**
  String get outOfStock;

  /// No description provided for @orderPickupTime.
  ///
  /// In en, this message translates to:
  /// **'Order Pickup Time'**
  String get orderPickupTime;

  /// No description provided for @orderSummary.
  ///
  /// In en, this message translates to:
  /// **'Order Summary'**
  String get orderSummary;

  /// No description provided for @orderStatus.
  ///
  /// In en, this message translates to:
  /// **'Order Status'**
  String get orderStatus;

  /// No description provided for @ordersPlcate.
  ///
  /// In en, this message translates to:
  /// **'Orders Plcate'**
  String get ordersPlcate;

  /// No description provided for @orderRequest.
  ///
  /// In en, this message translates to:
  /// **'Order Request'**
  String get orderRequest;

  /// No description provided for @orderLocation.
  ///
  /// In en, this message translates to:
  /// **'Order Location'**
  String get orderLocation;

  /// No description provided for @orders.
  ///
  /// In en, this message translates to:
  /// **'Orders'**
  String get orders;

  /// No description provided for @oTPValidation.
  ///
  /// In en, this message translates to:
  /// **'OTP Validation'**
  String get oTPValidation;

  /// No description provided for @orderId.
  ///
  /// In en, this message translates to:
  /// **'Order Id'**
  String get orderId;

  /// No description provided for @ongoing.
  ///
  /// In en, this message translates to:
  /// **'Ongoing'**
  String get ongoing;

  /// No description provided for @onHandMoney.
  ///
  /// In en, this message translates to:
  /// **'On-Hand Money'**
  String get onHandMoney;

  /// No description provided for @or.
  ///
  /// In en, this message translates to:
  /// **'Or'**
  String get or;

  /// No description provided for @price.
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get price;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @postCode.
  ///
  /// In en, this message translates to:
  /// **'Post Code'**
  String get postCode;

  /// No description provided for @phone.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get phone;

  /// No description provided for @phoneNumber.
  ///
  /// In en, this message translates to:
  /// **'Phone Number'**
  String get phoneNumber;

  /// No description provided for @payment.
  ///
  /// In en, this message translates to:
  /// **'Payment'**
  String get payment;

  /// No description provided for @pending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get pending;

  /// No description provided for @placeOrder.
  ///
  /// In en, this message translates to:
  /// **'Place Order'**
  String get placeOrder;

  /// No description provided for @pickUpInPerson.
  ///
  /// In en, this message translates to:
  /// **'Pick Up in Person'**
  String get pickUpInPerson;

  /// No description provided for @proceed.
  ///
  /// In en, this message translates to:
  /// **'Proceed'**
  String get proceed;

  /// No description provided for @package.
  ///
  /// In en, this message translates to:
  /// **'Package'**
  String get package;

  /// No description provided for @productRating.
  ///
  /// In en, this message translates to:
  /// **'Product Rating'**
  String get productRating;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @passwordCheckTramsAndPolicy.
  ///
  /// In en, this message translates to:
  /// **'Please Check Trams And Policy'**
  String get passwordCheckTramsAndPolicy;

  /// No description provided for @passwordCharacters.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters long.'**
  String get passwordCharacters;

  /// No description provided for @purpose.
  ///
  /// In en, this message translates to:
  /// **'Purpose'**
  String get purpose;

  /// No description provided for @popular.
  ///
  /// In en, this message translates to:
  /// **'Popular'**
  String get popular;

  /// No description provided for @priority.
  ///
  /// In en, this message translates to:
  /// **'Priority'**
  String get priority;

  /// No description provided for @products.
  ///
  /// In en, this message translates to:
  /// **'Products'**
  String get products;

  /// No description provided for @productDetails.
  ///
  /// In en, this message translates to:
  /// **'Product Details'**
  String get productDetails;

  /// No description provided for @priorityType.
  ///
  /// In en, this message translates to:
  /// **'Priority Type'**
  String get priorityType;

  /// No description provided for @privacyPolicy.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get privacyPolicy;

  /// No description provided for @pleaseSelect.
  ///
  /// In en, this message translates to:
  /// **'Please Select'**
  String get pleaseSelect;

  /// No description provided for @pleaseVerifyYourEmail.
  ///
  /// In en, this message translates to:
  /// **' please verify your email. Do you want to verify now?'**
  String get pleaseVerifyYourEmail;

  /// No description provided for @pleaseSelectSelectTheDeliveryAddressForYourOrder.
  ///
  /// In en, this message translates to:
  /// **'Select address or pickup option.'**
  String get pleaseSelectSelectTheDeliveryAddressForYourOrder;

  /// No description provided for @paymentMethod.
  ///
  /// In en, this message translates to:
  /// **'Payment Method'**
  String get paymentMethod;

  /// No description provided for @paymentGetaway.
  ///
  /// In en, this message translates to:
  /// **'Payment Getaway'**
  String get paymentGetaway;

  /// No description provided for @paymentStatus.
  ///
  /// In en, this message translates to:
  /// **'Payment Status'**
  String get paymentStatus;

  /// No description provided for @parcelDetails.
  ///
  /// In en, this message translates to:
  /// **'Parcel Details'**
  String get parcelDetails;

  /// No description provided for @qty.
  ///
  /// In en, this message translates to:
  /// **'Qty'**
  String get qty;

  /// No description provided for @question.
  ///
  /// In en, this message translates to:
  /// **'Question'**
  String get question;

  /// No description provided for @questionAndAnswers.
  ///
  /// In en, this message translates to:
  /// **'Questions and Answers'**
  String get questionAndAnswers;

  /// No description provided for @requestTime.
  ///
  /// In en, this message translates to:
  /// **'Request Time'**
  String get requestTime;

  /// No description provided for @resendCode.
  ///
  /// In en, this message translates to:
  /// **'Resend Code'**
  String get resendCode;

  /// No description provided for @resetPassword.
  ///
  /// In en, this message translates to:
  /// **'Reset Password'**
  String get resetPassword;

  /// No description provided for @received.
  ///
  /// In en, this message translates to:
  /// **'Received'**
  String get received;

  /// No description provided for @rememberMe.
  ///
  /// In en, this message translates to:
  /// **'Remember me'**
  String get rememberMe;

  /// No description provided for @refundRequested.
  ///
  /// In en, this message translates to:
  /// **'Refund Requested'**
  String get refundRequested;

  /// No description provided for @reachOutToTheSellerDirectly.
  ///
  /// In en, this message translates to:
  /// **'Reach Out to the Seller Directly'**
  String get reachOutToTheSellerDirectly;

  /// No description provided for @resend.
  ///
  /// In en, this message translates to:
  /// **'Resend'**
  String get resend;

  /// No description provided for @refundOrder.
  ///
  /// In en, this message translates to:
  /// **'Refund Order'**
  String get refundOrder;

  /// No description provided for @rating.
  ///
  /// In en, this message translates to:
  /// **'Rating'**
  String get rating;

  /// No description provided for @road.
  ///
  /// In en, this message translates to:
  /// **'Road'**
  String get road;

  /// No description provided for @review.
  ///
  /// In en, this message translates to:
  /// **'Review'**
  String get review;

  /// No description provided for @returnInDays.
  ///
  /// In en, this message translates to:
  /// **'Return in Days'**
  String get returnInDays;

  /// No description provided for @returnPolicy.
  ///
  /// In en, this message translates to:
  /// **'Return Policy'**
  String get returnPolicy;

  /// No description provided for @related.
  ///
  /// In en, this message translates to:
  /// **'Related'**
  String get related;

  /// No description provided for @reason.
  ///
  /// In en, this message translates to:
  /// **'Reason'**
  String get reason;

  /// No description provided for @refresh.
  ///
  /// In en, this message translates to:
  /// **'Refresh'**
  String get refresh;

  /// No description provided for @recoverPassword.
  ///
  /// In en, this message translates to:
  /// **'Recover Password'**
  String get recoverPassword;

  /// No description provided for @requestWithdrawal.
  ///
  /// In en, this message translates to:
  /// **'Request Withdrawal'**
  String get requestWithdrawal;

  /// No description provided for @status.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get status;

  /// No description provided for @successfullyMessage.
  ///
  /// In en, this message translates to:
  /// **'Your password has been successfully updated. You can now log in with your new password.'**
  String get successfullyMessage;

  /// No description provided for @saveChanges.
  ///
  /// In en, this message translates to:
  /// **'Save Changes'**
  String get saveChanges;

  /// No description provided for @specifications.
  ///
  /// In en, this message translates to:
  /// **'Specifications'**
  String get specifications;

  /// No description provided for @startingFrom.
  ///
  /// In en, this message translates to:
  /// **'Starting from'**
  String get startingFrom;

  /// No description provided for @selectPaymentMethod.
  ///
  /// In en, this message translates to:
  /// **'Select Payment Method'**
  String get selectPaymentMethod;

  /// No description provided for @storeDetails.
  ///
  /// In en, this message translates to:
  /// **'Store Details'**
  String get storeDetails;

  /// No description provided for @supportTicket.
  ///
  /// In en, this message translates to:
  /// **'Support Ticket'**
  String get supportTicket;

  /// No description provided for @supportTicketList.
  ///
  /// In en, this message translates to:
  /// **'Support Tickets List'**
  String get supportTicketList;

  /// No description provided for @sourceRight.
  ///
  /// In en, this message translates to:
  /// **'Source Right'**
  String get sourceRight;

  /// No description provided for @subTotal.
  ///
  /// In en, this message translates to:
  /// **'Sub Total'**
  String get subTotal;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @shippedBy.
  ///
  /// In en, this message translates to:
  /// **'Shipped by'**
  String get shippedBy;

  /// No description provided for @shipped.
  ///
  /// In en, this message translates to:
  /// **'Shipped'**
  String get shipped;

  /// No description provided for @summaryShow.
  ///
  /// In en, this message translates to:
  /// **'Summary Show'**
  String get summaryShow;

  /// No description provided for @seconds.
  ///
  /// In en, this message translates to:
  /// **'SECONDS'**
  String get seconds;

  /// No description provided for @storeLocation.
  ///
  /// In en, this message translates to:
  /// **'Store Location'**
  String get storeLocation;

  /// No description provided for @signIn.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get signIn;

  /// No description provided for @signInWithMobileNumber.
  ///
  /// In en, this message translates to:
  /// **'Sign In With Mobile Number'**
  String get signInWithMobileNumber;

  /// No description provided for @search.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get search;

  /// No description provided for @searchCountry.
  ///
  /// In en, this message translates to:
  /// **'Search Country'**
  String get searchCountry;

  /// No description provided for @searchCategoriesHere.
  ///
  /// In en, this message translates to:
  /// **'Search Categories Here'**
  String get searchCategoriesHere;

  /// No description provided for @searchProductsHere.
  ///
  /// In en, this message translates to:
  /// **'Search Products Here'**
  String get searchProductsHere;

  /// No description provided for @searchYourLocation.
  ///
  /// In en, this message translates to:
  /// **'Search Your Location'**
  String get searchYourLocation;

  /// No description provided for @seeMore.
  ///
  /// In en, this message translates to:
  /// **'See More'**
  String get seeMore;

  /// No description provided for @sKU.
  ///
  /// In en, this message translates to:
  /// **'SKU'**
  String get sKU;

  /// No description provided for @superE.
  ///
  /// In en, this message translates to:
  /// **'Super'**
  String get superE;

  /// No description provided for @short.
  ///
  /// In en, this message translates to:
  /// **'Short'**
  String get short;

  /// No description provided for @submit.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get submit;

  /// No description provided for @subject.
  ///
  /// In en, this message translates to:
  /// **'Subject'**
  String get subject;

  /// No description provided for @signAsDeliveryBoy.
  ///
  /// In en, this message translates to:
  /// **'Sign as Delivery Boy'**
  String get signAsDeliveryBoy;

  /// No description provided for @socialConnect.
  ///
  /// In en, this message translates to:
  /// **'Social Connect'**
  String get socialConnect;

  /// No description provided for @singUp.
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get singUp;

  /// No description provided for @serviceRequestDetails.
  ///
  /// In en, this message translates to:
  /// **'Service Request Details'**
  String get serviceRequestDetails;

  /// No description provided for @store.
  ///
  /// In en, this message translates to:
  /// **'Store'**
  String get store;

  /// No description provided for @storeType.
  ///
  /// In en, this message translates to:
  /// **'Store Type'**
  String get storeType;

  /// No description provided for @selectAll.
  ///
  /// In en, this message translates to:
  /// **'Select all'**
  String get selectAll;

  /// No description provided for @size.
  ///
  /// In en, this message translates to:
  /// **'Size'**
  String get size;

  /// No description provided for @selling.
  ///
  /// In en, this message translates to:
  /// **'Selling'**
  String get selling;

  /// No description provided for @saveAddress.
  ///
  /// In en, this message translates to:
  /// **'Save Address'**
  String get saveAddress;

  /// No description provided for @storeInfo.
  ///
  /// In en, this message translates to:
  /// **'Store Info'**
  String get storeInfo;

  /// No description provided for @storeName.
  ///
  /// In en, this message translates to:
  /// **'Store Name'**
  String get storeName;

  /// No description provided for @storeId.
  ///
  /// In en, this message translates to:
  /// **'Store Id'**
  String get storeId;

  /// No description provided for @send.
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get send;

  /// No description provided for @sendMessage.
  ///
  /// In en, this message translates to:
  /// **'Send Message'**
  String get sendMessage;

  /// No description provided for @spanish.
  ///
  /// In en, this message translates to:
  /// **'Spanish'**
  String get spanish;

  /// No description provided for @swiftSeamless.
  ///
  /// In en, this message translates to:
  /// **'Swift & Seamless Delivery Services'**
  String get swiftSeamless;

  /// No description provided for @totalEarnings.
  ///
  /// In en, this message translates to:
  /// **'Total Earnings'**
  String get totalEarnings;

  /// No description provided for @termsAndConditions.
  ///
  /// In en, this message translates to:
  /// **'Terms and Conditions'**
  String get termsAndConditions;

  /// No description provided for @termsAndConditionsPrivacyPolicy.
  ///
  /// In en, this message translates to:
  /// **'Terms and Conditions & Privacy Policy'**
  String get termsAndConditionsPrivacyPolicy;

  /// No description provided for @type.
  ///
  /// In en, this message translates to:
  /// **'Type'**
  String get type;

  /// No description provided for @typeMessage.
  ///
  /// In en, this message translates to:
  /// **'Type message...'**
  String get typeMessage;

  /// No description provided for @title.
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get title;

  /// No description provided for @token.
  ///
  /// In en, this message translates to:
  /// **'Token'**
  String get token;

  /// No description provided for @ticketID.
  ///
  /// In en, this message translates to:
  /// **'Ticket ID'**
  String get ticketID;

  /// No description provided for @ticketDetails.
  ///
  /// In en, this message translates to:
  /// **'Ticket Details'**
  String get ticketDetails;

  /// No description provided for @ticketSubject.
  ///
  /// In en, this message translates to:
  /// **'Ticket Subject'**
  String get ticketSubject;

  /// No description provided for @trackOrder.
  ///
  /// In en, this message translates to:
  /// **'Track Order'**
  String get trackOrder;

  /// No description provided for @total.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get total;

  /// No description provided for @tax15Included.
  ///
  /// In en, this message translates to:
  /// **'Tax (15% Included)'**
  String get tax15Included;

  /// No description provided for @taxPercent.
  ///
  /// In en, this message translates to:
  /// **'Tax Percent'**
  String get taxPercent;

  /// No description provided for @tax.
  ///
  /// In en, this message translates to:
  /// **'Tax'**
  String get tax;

  /// No description provided for @totalAmount.
  ///
  /// In en, this message translates to:
  /// **'Total Amount'**
  String get totalAmount;

  /// No description provided for @toAccessYour.
  ///
  /// In en, this message translates to:
  /// **'To Access your'**
  String get toAccessYour;

  /// No description provided for @toContinue.
  ///
  /// In en, this message translates to:
  /// **'To continue, you must be logged in. Are you sure you want to proceed?'**
  String get toContinue;

  /// No description provided for @totalPrice.
  ///
  /// In en, this message translates to:
  /// **'Total Price'**
  String get totalPrice;

  /// No description provided for @totalWithdraw.
  ///
  /// In en, this message translates to:
  /// **'Total Withdraw'**
  String get totalWithdraw;

  /// No description provided for @today.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get today;

  /// No description provided for @thisWeek.
  ///
  /// In en, this message translates to:
  /// **'This Week'**
  String get thisWeek;

  /// No description provided for @thisMonth.
  ///
  /// In en, this message translates to:
  /// **'This Month'**
  String get thisMonth;

  /// No description provided for @thisYear.
  ///
  /// In en, this message translates to:
  /// **'This year'**
  String get thisYear;

  /// No description provided for @theme.
  ///
  /// In en, this message translates to:
  /// **'Theme'**
  String get theme;

  /// No description provided for @totalBalance.
  ///
  /// In en, this message translates to:
  /// **'Total Balance'**
  String get totalBalance;

  /// No description provided for @totalOrderAmount.
  ///
  /// In en, this message translates to:
  /// **'Total Order Amount'**
  String get totalOrderAmount;

  /// No description provided for @useCombinationUppercaseLowercaseLetters.
  ///
  /// In en, this message translates to:
  /// **'Use combination of uppercase and lowercase letters.'**
  String get useCombinationUppercaseLowercaseLetters;

  /// No description provided for @useOfSpecialCharacters.
  ///
  /// In en, this message translates to:
  /// **'Use of special characters'**
  String get useOfSpecialCharacters;

  /// No description provided for @uploadProfileImage.
  ///
  /// In en, this message translates to:
  /// **'Upload Profile image'**
  String get uploadProfileImage;

  /// No description provided for @updateTicket.
  ///
  /// In en, this message translates to:
  /// **'Update Ticket'**
  String get updateTicket;

  /// No description provided for @wallet.
  ///
  /// In en, this message translates to:
  /// **'Wallet'**
  String get wallet;

  /// No description provided for @withdraw.
  ///
  /// In en, this message translates to:
  /// **'Withdraw'**
  String get withdraw;

  /// No description provided for @website.
  ///
  /// In en, this message translates to:
  /// **'Website'**
  String get website;

  /// No description provided for @warranty.
  ///
  /// In en, this message translates to:
  /// **'Warranty'**
  String get warranty;

  /// No description provided for @writeYourQuestion.
  ///
  /// In en, this message translates to:
  /// **'Write Your Question'**
  String get writeYourQuestion;

  /// No description provided for @whatAreYouLookingFor.
  ///
  /// In en, this message translates to:
  /// **'What are you looking for?'**
  String get whatAreYouLookingFor;

  /// No description provided for @welcomeBack.
  ///
  /// In en, this message translates to:
  /// **'Welcome Back'**
  String get welcomeBack;

  /// No description provided for @weSentVerification.
  ///
  /// In en, this message translates to:
  /// **'We’ve sent a verification code to'**
  String get weSentVerification;

  /// No description provided for @withdrawAmount.
  ///
  /// In en, this message translates to:
  /// **'Withdraw Amount'**
  String get withdrawAmount;

  /// No description provided for @walletEarningsHistory.
  ///
  /// In en, this message translates to:
  /// **'Wallet Earnings History'**
  String get walletEarningsHistory;

  /// No description provided for @withdrawnHistory.
  ///
  /// In en, this message translates to:
  /// **'Withdrawn History'**
  String get withdrawnHistory;

  /// No description provided for @viewAll.
  ///
  /// In en, this message translates to:
  /// **'View All'**
  String get viewAll;

  /// No description provided for @verifyCode.
  ///
  /// In en, this message translates to:
  /// **'Verify Code'**
  String get verifyCode;

  /// No description provided for @visitStore.
  ///
  /// In en, this message translates to:
  /// **'Visit Store'**
  String get visitStore;

  /// No description provided for @yourActiveOrder.
  ///
  /// In en, this message translates to:
  /// **'Your Active Order'**
  String get yourActiveOrder;

  /// No description provided for @youWantDeleteAccount.
  ///
  /// In en, this message translates to:
  /// **'You want to delete your account!'**
  String get youWantDeleteAccount;

  /// No description provided for @youConversationStartsHere.
  ///
  /// In en, this message translates to:
  /// **'Your conversation starts here.'**
  String get youConversationStartsHere;

  /// No description provided for @youWantResolve.
  ///
  /// In en, this message translates to:
  /// **'You Want To Resolve!'**
  String get youWantResolve;

  /// No description provided for @yourAverageRatingIs.
  ///
  /// In en, this message translates to:
  /// **'Your Average Rating Is'**
  String get yourAverageRatingIs;

  /// No description provided for @yes.
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get yes;

  /// No description provided for @yourOrderWillPermanentlyCanceled.
  ///
  /// In en, this message translates to:
  /// **'your order will be permanently canceled.'**
  String get yourOrderWillPermanentlyCanceled;

  /// No description provided for @youWantToRefundThisOrder.
  ///
  /// In en, this message translates to:
  /// **'You want to refund this order'**
  String get youWantToRefundThisOrder;

  /// No description provided for @passwordAndConfirmPasswordNotMatch.
  ///
  /// In en, this message translates to:
  /// **'Your Password and Confirm Password Not Match'**
  String get passwordAndConfirmPasswordNotMatch;

  /// No description provided for @validUserPass.
  ///
  /// In en, this message translates to:
  /// **'Enter valid username/password'**
  String get validUserPass;

  /// No description provided for @verification.
  ///
  /// In en, this message translates to:
  /// **'Verification'**
  String get verification;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['tr', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'tr':
      return AppLocalizationsTr();
  }

  // Fallback to Turkish for unsupported locales
  return AppLocalizationsTr();
}
