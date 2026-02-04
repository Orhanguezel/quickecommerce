import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class CommonStatusCard extends StatelessWidget {
  final String text;
  final Color backgroundColor;
  final Color borderColor;
  final Color textColor;
  final EdgeInsetsGeometry padding;

  const CommonStatusCard({
    super.key,
    required this.text,
    this.backgroundColor = const Color(0xFFE8F1FD),
    this.borderColor = const Color(0xFF006FFF),
    this.textColor = const Color(0xFF10458B),
    this.padding = const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(kIsWeb ? 5 :5.r),
        border: Border.all(
          width: kIsWeb ? 1 :1.w,
          color: borderColor,
        ),
      ),
      child: Center(
        child: Text(
          text,
          style: Theme.of(context).textTheme.headlineLarge?.copyWith(
            fontWeight: FontWeight.w400,
            color: textColor,
            fontSize: kIsWeb ? 10 :10.sp,
          ),
        ),
      ),
    );
  }
}

class OrderStatusCard extends StatelessWidget {
  final String text;
  final String status;
  final EdgeInsetsGeometry padding;

  const OrderStatusCard({
    super.key,
    required this.text,
    required this.status,
    this.padding = const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: status == "pending"
            ? const Color(0xFFFFF3CD)
            : status == "active"
            ? const Color(0xFFD4EDDA)
            : status == "processing"
            ? const Color(0xFFE2E3E5)
            : status == "pickup"
            ? const Color(0xFF0C5460)
            : status == "shipped"
            ? const Color(0xFFD1ECF1)
            : status == "delivered"
            ? const Color(0xFFD4EDDA)
            : status == "confirmed"
            ? const Color(0xFFC3E6CB)
            : status == "cancelled"
            ? const Color(0xFFF8D7DA)
            : status == "paid"
            ? const Color(0xFFDFF6DD)
            : const Color(0xFF968C7A),
        borderRadius: BorderRadius.circular(kIsWeb ? 5 :5.r),
        border: Border.all(
          width: kIsWeb ? 1:1.w,
          color:status == "pending"
              ? const Color(0xFFFFE69C)
              : status == "active"
              ? const Color(0xFF6FCF97)
              : status == "processing"
              ? const Color(0xFFCACACA)
              : status == "pickup"
              ? const Color(0xFF0C5460)
              : status == "shipped"
              ? const Color(0xFF99C9E2)
              : status == "delivered"
              ? const Color(0xFF28A745)
              : status == "confirmed"
              ? const Color(0xFFA9DFBF)
              : status == "cancelled"
              ? const Color(0xFFE57373)
              : status == "paid"
              ? const Color(0xFF28A745)
              : const Color(0xFFFFD079),
        ),
      ),
      child: Center(
        child: Text(
          text,
          style: Theme.of(context).textTheme.headlineLarge?.copyWith(
            fontWeight: FontWeight.w400,
            color:  status == "pending"
                ? const Color(0xFF856404)
                : status == "active"
                ? const Color(0xFF155724)
                : status == "processing"
                ? const Color(0xFF6C757D)
                : status == "shipped"
                ? const Color(0xFF0C5460)
                : status == "pickup"
                ? const Color(0xFFFFFFFF)
                : status == "delivered"
                ? const Color(0xFF155724)
                : status == "confirmed"
                ? const Color(0xFF1D6633)
                : status == "cancelled"
                ? const Color(0xFF721C24)
                : status == "paid"
                ? const Color(0xFF155724)
                : const Color(0xFF968C7A),
            fontSize: kIsWeb ? 10 :10.sp,
          ),
        ),
      ),
    );
  }
}