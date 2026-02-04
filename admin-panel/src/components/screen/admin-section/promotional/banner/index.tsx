"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import BannerTable from "@/components/blocks/admin-section/promotional/banner/BannerTable";
import { Button, Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { Images } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Banner = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);
  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="grid grid-cols-5 p-6">
          <div className="col-span-1">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Images /> {t("common.all_banner")}{" "}
            </h1>
          </div>
          <div className="flex items-center gap-2 col-span-4 justify-end">
            <Link href={Routes.addBanner}>
              <Button
                variant="outline"
                className="app-button"
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                + {t("button.add_banner")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <BannerTable />
    </>
  );
};

export default Banner;
