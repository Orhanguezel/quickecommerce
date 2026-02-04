"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import BlogPostTable from "@/components/blocks/admin-section/blog/post/BlogPostTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { Layers3, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const BlogPost = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setSearchValue(searchQuery);
  };
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      handleSearchButtonClick();
    }
  };
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);
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
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Layers3 /> {t("common.blog_post")}{" "}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <div
              dir={dir}
              className="relative flex items-center gap-2 w-full md:w-auto"
            >
              <div
                className={`${
                  locale === "ar" ? "right-3" : "left-3"
                } absolute  text-[#CCCFD7]`}
              >
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_title")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="px-8 app-input w-full md:w-auto"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button"
              >
                {t("button.search")}
              </Button>
            </div>
            <Link href={Routes.addBlogPost}>
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
                + {t("button.add_blog")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <BlogPostTable searchValue={searchValue} />
    </>
  );
};

export default BlogPost;
