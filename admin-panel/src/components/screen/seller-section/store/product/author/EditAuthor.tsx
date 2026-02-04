"use client";
import Loader from "@/components/molecules/Loader";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CreateOrUpdateAuthorForm from "@/components/blocks/seller-section/store/products/author/CreateOrUpdateAuthorForm";
import { Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useAuthorQueryById } from "@/modules/seller-section/author/author.action";
import { useAppSelector } from "@/redux/hooks";
import { BookOpenIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const EditAuthor = ({ ID }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { author, refetch, isPending } = useAuthorQueryById(ID);
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
    <div className="space-y-4">
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <BookOpenIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("common.edit_author")}
            </h1>
          </div>
          <div className="flex">
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={SellerRoutes.authorList}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                {t("link.authors")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {isPending || !author ? (
        <CardSkletonLoader />
      ) : (
        <>
          <CreateOrUpdateAuthorForm data={author} />
        </>
      )}
    </div>
  );
};

export default EditAuthor;
