"use client";

import LocaleSwitcher from "@/components/blocks/shared/LocalSwitcher";
import { ThemeToggle } from "@/components/blocks/shared/theme-toggle";
import { Button, Skeleton } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useGeneralQuery } from "@/modules/common/com/com.action";
import { ExternalLink } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export function PublicNavbar() {
  const localeMain = useLocale();
  const router = useRouter();

  const {
    general,
    refetch: generalRefetch,
    isPending,
  } = useGeneralQuery({
    language: localeMain,
  });

  const QueryGeneralSettingsData = useMemo(
    () => (general as any)?.site_settings || {},
    [general]
  );
  const handleLogo = () => {
    const currentPath = window.location.pathname;
    if (currentPath === "/") {
      router.refresh();
      return;
    }
    if (
      currentPath === "/seller/signin" ||
      currentPath === "/admin/signin" ||
      currentPath === "/become-a-seller"
    ) {
      router.refresh();
      return;
    }
    router.push("/");
  };

  return (
    <header
      className={`p-2 sticky top-0 z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary  
          h-[80px] 
      }  `}
    >
      <div className="mx-0 lg:mx-4  flex h-14 items-center ">
        {isPending ? (
          <Skeleton className="w-32 h-12 rounded-xl" />
        ) : (
          <div className="cursor-pointer" onClick={handleLogo}>
            <div className="hidden md:flex gap-4 lg:gap-0 items-center px-4">
              {QueryGeneralSettingsData?.com_site_logo ? (
                <div className="relative w-32 h-12">
                  <Image
                    loader={GlobalImageLoader}
                    src={QueryGeneralSettingsData?.com_site_logo}
                    alt="quick_ecommerce"
                    fill
                    sizes="128px"
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="relative w-32 h-12">
                  <Image
                    src="/images/no-image.png"
                    alt="quick_ecommerce"
                    fill
                    sizes="128px"
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>
            <div className="flex md:hidden gap-4 lg:gap-0 items-center">
              {QueryGeneralSettingsData?.com_site_favicon ? (
                <div className="relative w-8 h-8">
                  <Image
                    loader={GlobalImageLoader}
                    src={QueryGeneralSettingsData?.com_site_favicon}
                    alt="quick_ecommerce"
                    fill
                    sizes="32px"
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="relative w-8 h-8">
                  <Image
                    src="/images/no-image.png"
                    alt="quick_ecommerce"
                    fill
                    sizes="32px"
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <div
          className={` 
            flex flex-1 items-center space-x-2 justify-end px-2
          } `}
        >
          <div className="flex items-center justify-center">
            <ThemeToggle />
            <Link
              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                className="mx-4 bg-blue-50 text-blue-500 hover:text-blue-600"
              >
                <span
                  className={`mx-1 hidden md:flex
                  } `}
                >
                  Visit Site
                </span>{" "}
                <ExternalLink width={15} height={15} />
              </Button>
            </Link>
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
