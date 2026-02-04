"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui";
import Link from "next/link";
import { Routes } from "@/config/routes";
import CreateOrUpdateRoleForm from "@/components/blocks/admin-section/roles/CreateOrUpdateRoleForm";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const AddRole = () => {
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
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <Users />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.add_role")}
            </h1>
          </div>
          <div className="flex">
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link
                className=""
                href={Routes.roles}
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                {t("label.roles")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      <>
        <CreateOrUpdateRoleForm />
      </>
    </div>
  );
};

export default AddRole;
