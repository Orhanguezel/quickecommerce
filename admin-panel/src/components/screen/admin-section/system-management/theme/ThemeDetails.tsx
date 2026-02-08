"use client";
import ThemeDetailsForm from "@/components/blocks/admin-section/system-management/theme/ThemeDetailsForm";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import { Card, CardContent } from "@/components/ui";
import { useThemeDetailsById } from "@/modules/admin-section/theme/theme.action";
import { useAppSelector } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ThemeDetails = ({ ID }: any) => {
  const t = useTranslations();
  const pathname = usePathname();

  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { ThemeDetails, refetch, isPending } = useThemeDetailsById(ID);

  useEffect(() => {
    if (isRefetch) {
      refetch();
    }
  }, [isRefetch, refetch]);

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
  if (!ID) {
    return (
      <div className="mt-10">
        <h1 className="text-xl text-red-500">{t("common.invalid_id")}</h1>
      </div>
    );
  }
  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="flex flex-col md:flex-row items-center justify-between p-2  md:p-4">
          <div className="space-y-2 mb-4 md:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {`${(ThemeDetails as any)?.theme_data?.name ?(ThemeDetails as any)?.theme_data?.name : t("theme.title")} ${t("theme.customization")}`}
            </h1>
            <p className="text-sm font-semibold text-gray-500 dark:text-white flex items-center gap-2">
              {t("theme.description")}
            </p>
          </div>
        </CardContent>
      </Card>
      {isPending || !ThemeDetails ? (
        <Card className="grid grid-cols-12 mt-4 animate-pulse">
          {/* Sidebar Skeleton */}
          <div className="col-span-2 p-4 border-r space-y-3">
            {Array(6)
              .fill(0)
              .map((_, idx) => (
                <div
                  key={idx}
                  className="h-8 w-full rounded-md bg-gray-300 dark:bg-gray-700"
                />
              ))}
          </div>

          {/* Content Skeleton */}
          <div className="col-span-10 p-4 flex flex-col min-h-[calc(100vh-18rem)] bg-gray-50 space-y-6">
            {/* Title */}
            <div className="flex items-center justify-between">
              <div className="h-6 w-1/3 rounded-md bg-gray-300 dark:bg-gray-700" />
              <div className="h-8 w-20 rounded-md bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* Section fields */}
            <div className="space-y-4">
              {Array(4)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="h-12 w-full rounded-md bg-gray-300 dark:bg-gray-700"
                  />
                ))}
            </div>

            {/* Footer Save Button Skeleton */}
            <Card className="mt-4 sticky bottom-0 w-full p-4">
              <div className="h-9 w-32 rounded-md bg-gray-300 dark:bg-gray-700" />
            </Card>
          </div>
        </Card>
      ) : (
        <ThemeDetailsForm
          ThemeDetails={(ThemeDetails as any)}
          refetch={refetch}
          ID={ID}
        />
      )}
    </>
  );
};

export default ThemeDetails;
