import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:quick_ecommerce/screens/store_info/sore_details_screen.dart';

import '../../data/data_model/product_details_model.dart';

class StoreInfoCard extends StatelessWidget {
  const StoreInfoCard({super.key, required this.store});
  final Store store;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Store Icon
              CircleAvatar(
                radius: 30.r,
                backgroundImage: NetworkImage(store.logo ??
                    "https://img.drz.lazcdn.com/g/kf/Sfa4e0702bd5848099c91cfb843c171507.jpg_400x400q80.jpg_.webp"), // Replace with your asset image path
              ),
              const SizedBox(width: 16),
              // Store Name and Ratings
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    store.name ?? "",
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Row(
                        children: List.generate(
                          5,
                          (starIndex) => Icon(
                            starIndex < 4 ? Icons.star : Icons.star_border,
                            color: Colors.orange,
                            size: 16,
                          ),
                        ),
                      ),
                      const Text(
                        '(1)',
                        style: TextStyle(fontSize: 14, color: Colors.black54),
                      ),
                      Text(
                        'Products(${store.totalProduct})',
                        style: TextStyle(fontSize: 14.sp, color: Colors.black54),
                      ),
                    ],
                  ),
                ],
              ),
              const Spacer(),
              // Message Icon
              IconButton(
                onPressed: () {
                  // Add your functionality here
                },
                icon: const Icon(Icons.message, color: Colors.blue),
              ),
            ],
          ),
          // Visit Store Button
          Center(
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => StoreDetailScreen(
                              slug: store.slug,
                            )));
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue.shade100,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              icon: const Icon(Icons.store, color: Colors.blue),
              label: const Text(
                'Visit Store',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.blue,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
