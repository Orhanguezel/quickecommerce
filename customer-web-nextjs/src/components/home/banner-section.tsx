"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useBannerQuery } from "@/modules/banner/banner.action";
import type { Banner } from "@/modules/banner/banner.type";

export function BannerSection() {
  const { banners, isPending: isLoading } = useBannerQuery();

  // If no data and not loading, don't render
  if (!isLoading && banners.length === 0) {
    return null;
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  const displayBanners = banners.slice(0, 2); // Max 2 banners

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {displayBanners.map((banner: Banner) => (
        <div
          key={banner.id}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5"
        >
          <div className="grid md:grid-cols-2">
            {/* Text Content */}
            <div className="flex flex-col justify-center p-8 md:p-10">
              <h3 className="mb-3 text-2xl font-bold md:text-3xl">
                {banner.title}
              </h3>
              {banner.description && (
                <p className="mb-6 text-muted-foreground">
                  {banner.description}
                </p>
              )}
              {banner.link_url && (
                <div>
                  <Button asChild className="group/btn">
                    <Link href={banner.link_url}>
                      {banner.button_text || "Keşfet"}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Image */}
            <div className="relative h-64 md:h-auto">
              <Image
                src={banner.image_url}
                alt={banner.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
