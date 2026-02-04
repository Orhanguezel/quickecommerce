"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CreateOrUpdateAuthorForm from "@/components/blocks/admin-section/products/author/CreateOrUpdateAuthorForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { BookOpenIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AddAuthor = () => {
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
        <CardContent className="flex justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <BookOpenIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.add_author")}
            </h1>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={Routes.authorList}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                {t("label.author")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-2 md:p-4">
          <CreateOrUpdateAuthorForm />
        </CardContent>
      </Card>
    </>
  );
};

export default AddAuthor;
