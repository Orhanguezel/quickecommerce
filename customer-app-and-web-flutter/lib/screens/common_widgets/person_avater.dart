import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../config/images.dart';

class AvatarWidget extends StatelessWidget {
  final String? imageUrl;
  final double radius;
  const AvatarWidget({
    super.key,
    required this.imageUrl,
    this.radius = 40.0,
  });
  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius:kIsWeb ? radius :radius.r,
      backgroundImage:imageUrl != null && imageUrl!.isNotEmpty
          ? NetworkImage(imageUrl!)
          : const AssetImage(Images.noPerson)
      as ImageProvider,
      onBackgroundImageError: (_, __) {
      },
    );
  }
}