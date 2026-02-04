"use client";
import AuthorRequestTable from "@/components/blocks/admin-section/products/author/AuthorRequestTable";
import { Card, CardContent } from "@/components/ui";
import { GitPullRequest } from "lucide-react";
import { useTranslations } from "next-intl";

const AuthorRequest = () => {
  const t = useTranslations();
  return (
    <>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <GitPullRequest /> {t("label.author_request")}{" "}
            </h1>
          </div>
        </CardContent>
      </Card>

      <AuthorRequestTable />
    </>
  );
};

export default AuthorRequest;
