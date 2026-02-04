"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import RolesTable from "@/components/blocks/admin-section/roles/RolesTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { Scroll } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Roles = () => {
  const t = useTranslations();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<any[] | null>(null);
  const pathname = usePathname();

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
    const storedOptions = localStorage.getItem("selectedOptions");
    if (storedOptions) {
      setOptions(JSON.parse(storedOptions));
    }
  }, []);

  const permissionMap = (options ?? []).reduce((acc, perm) => {
    acc[perm.label] = perm.value;
    return acc;
  }, {} as Record<string, boolean>);

  const canView = permissionMap["view"];
  const canInsert = permissionMap["insert"];

  useEffect(() => {
    if (options && !canView) {
      router.replace("/404");
    }
  }, [options, canView, router]);

  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent className="flex flex-col md:flex-row items-center justify-between p-2 md:p-4">
          <div className="mb-4 md:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <Scroll /> {t("label.roles")}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row item-start md:items-center gap-2">
            <div className="flex items-center">
              <Input
                type="text"
                placeholder={t("place_holder.search_by_name")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="mx-0 md:mx-2 app-input"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button mx-2 md:mx-0"
              >
                {t("button.search")}
              </Button>
            </div>

            <Link href={Routes.addRole}>
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
                + {t("button.add_role")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <RolesTable searchValue={searchValue} />
    </>
  );
};

export default Roles;
