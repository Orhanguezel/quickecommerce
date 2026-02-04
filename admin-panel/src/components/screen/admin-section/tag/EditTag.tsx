// src/components/screen/admin-section/tag/EditTag.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tag } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useAppSelector } from "@/redux/hooks";
import { useTagQueryById } from "@/modules/admin-section/tag/tag.action";

import TagForm from "@/components/blocks/admin-section/tag/TagForm";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const EditTag = ({ ID }: any) => {
  const t = useTranslations();
  const pathname = usePathname();

  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { GetTagByID, refetch, isPending } = useTagQueryById(ID);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  useEffect(() => {
    if (isRefetch) {
      refetch();
    }
  }, [isRefetch, refetch]);

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
        <CardContent className="flex flex-col md:flex-row gap-4 justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <Tag />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.edit_tag")}
            </h1>
          </div>

          <div className="flex">
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                href={Routes.tags}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;
                  if (!isNewTab) setIsLoading(true);
                }}
              >
                {t("label.tags")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {isPending || !GetTagByID ? (
        <CardSkletonLoader />
      ) : (
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4">
            <TagForm data={GetTagByID} />
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default EditTag;
