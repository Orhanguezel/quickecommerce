// =============================================================
// FILE: lib/widgets/brand_logo.dart
// Brand logo from GeneralInfoBloc -> site_settings.com_site_logo
// Fallback to local asset if not loaded / empty / error
// =============================================================

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../controller/bloc/general_info_bloc/general_info_bloc.dart';
import '../controller/bloc/general_info_bloc/general_info_event.dart';
import '../controller/bloc/general_info_bloc/general_info_state.dart';

class BrandLogo extends StatefulWidget {
  const BrandLogo({
    super.key,
    this.height = 56,
    this.useWhite = false,
    this.fallbackAsset = 'assets/images/darkLogo.png',
    this.fit = BoxFit.contain,
  });

  final double height;
  final bool useWhite;
  final String fallbackAsset;
  final BoxFit fit;

  @override
  State<BrandLogo> createState() => _BrandLogoState();
}

class _BrandLogoState extends State<BrandLogo> {
  String? _cachedUrl;

  @override
  void initState() {
    super.initState();
    final bloc = context.read<GeneralInfoBloc>();
    if (bloc.state is! GeneralInfoLoaded) {
      bloc.add(GeneralInfoDataEvent());
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<GeneralInfoBloc, GeneralInfoState>(
      builder: (context, state) {
        String? url;

        if (state is GeneralInfoLoaded) {
          final settings = state.generalInfoModel.siteSettings;
          url = widget.useWhite ? settings.comSiteWhiteLogo : settings.comSiteLogo;
          if (url != null && url.trim().isNotEmpty) {
            _cachedUrl = url;
          }
        }

        final displayUrl = (url != null && url.trim().isNotEmpty) ? url : _cachedUrl;

        if (displayUrl != null && displayUrl.trim().isNotEmpty) {
          return Image.network(
            displayUrl,
            height: widget.height,
            fit: widget.fit,
            errorBuilder: (_, __, ___) => Image.asset(
              widget.fallbackAsset,
              height: widget.height,
              fit: widget.fit,
            ),
          );
        }

        return Image.asset(
          widget.fallbackAsset,
          height: widget.height,
          fit: widget.fit,
        );
      },
    );
  }
}
