"use client";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import ScrollImage from "@/components/blocks/shared/ScrollImage";
import { Skeleton } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Routes } from "@/config/routes";
import {
  useThemeAllQuery,
  useThemeStatus,
} from "@/modules/admin-section/theme/theme.action";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

const ThemeCardList = ({ searchValue }: any) => {
  const t = useTranslations("theme");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const { ThemeList, isPending, refetch } = useThemeAllQuery({
    limit: itemsPerPage,
    page: currentPage,
    sortField: "id",
    sort: "desc",
    search: searchValue,
  });

  const slugImages: Record<string, string> = {
    theme_one: "/images/theme_one.png",
    theme_two: "/images/Fashion website.png",
  };

  const originalData = useMemo(() => {
    const data = (ThemeList as any)?.themes || [];
    return data.map((item: any, index: number) => ({
      ...item,
      thumbnail: slugImages[item.slug] ?? "/images/no-image.png",
    }));
  }, [ThemeList, slugImages]);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const handleEdit = (e: React.MouseEvent, id: string) => {
    const url = `${Routes.ThemeDetails}/${id}`;
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(url, "_blank");
    } else {
      setEditRowId(id);
      router.push(url);
      dispatch(setRefetch(true));
    }
  };
  const [loading, setLoading] = useState(false);
  const { mutate: ThemeActivation } = useThemeStatus();
  const handleThemeActivation = (theme_slug: string) => {
    setLoading(true);
    ThemeActivation(
      { theme_slug: theme_slug },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <>
      {isPending ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="overflow-hidden">
                {/* Thumbnail */}
                <div className="h-80 w-full relative">
                  <Skeleton className="w-full h-full bg-gray-300 dark:bg-gray-700" />
                </div>

                {/* Content */}
                <div className="p-2 space-y-4">
                  <div>
                    {/* Title */}
                    <Skeleton className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 mb-2" />
                    {/* Description */}
                    <Skeleton className="h-4 w-full bg-gray-300 dark:bg-gray-700 mb-1" />
                    <Skeleton className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700" />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-full rounded-md bg-gray-300 dark:bg-gray-700" />
                    <Skeleton className="h-8 w-full rounded-md bg-gray-300 dark:bg-gray-700" />
                  </div>
                </div>
              </Card>
            ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {originalData.map((theme: any) => (
            <Card key={theme.slug} className="overflow-hidden dark:bg-gray-700">
              <ScrollImage src={theme.thumbnail ?? "/images/no-image.png"} alt={theme.name} />
              <div className="p-2 space-y-4">
                <div>
                  <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
                    {theme.name}
                  </h1>
                  <p className="text-sm font-semibold text-gray-500 dark:text-white flex items-center gap-2">
                    {theme.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {theme.status == "active" ? (
                    <>
                      <Button className="w-full !bg-green-100 !text-green-600">
                        {" "}
                        <Check width={18} height={18} />
                        {t("activated")}
                      </Button>
                      <Button
                        disabled={editRowId == theme.slug}
                        onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                          handleEdit(e, theme.slug)
                        }
                        className="w-full app-button"
                      >
                        {t("customize")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        disabled={editRowId == theme.slug}
                        onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                          handleEdit(e, theme.slug)
                        }
                        className="w-full app-button"
                      >
                        {t("customize")}
                      </Button>
                      <ConfirmationModal
                        trigger={
                          <Button className="w-full app-button">
                            {t("makeActive")}
                          </Button>
                        }
                        onSave={() => handleThemeActivation(theme.slug)}
                        loading={loading}
                        title={t("activateTitle")}
                        subTitle={t("activateConfirm")}
                      />{" "}
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default ThemeCardList;
