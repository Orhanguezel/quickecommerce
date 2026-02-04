// ===============================================
// File: src/components/screen/admin-section/email-settings/email-template/EditEmailTemplate.tsx
// ==============================================


"use client";
import Loader from "@/components/molecules/Loader";
import CreateOrUpdateEmailTemplateForm from "@/components/blocks/admin-section/email-settings/email-template/CreateOrUpdateEmailTemplateForm";
import { Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useEmailTemplateQueryById } from "@/modules/admin-section/email-settings/email-template/email-template.action";
import { useAppSelector } from "@/redux/hooks";
import { NotepadTextDashed } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const EditEmailTemplate = ({ ID }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const { EmailTemplate, refetch, isPending } = useEmailTemplateQueryById(ID);

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
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <NotepadTextDashed />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("common.edit_template")}
            </h1>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white  bg-blue-100 hover:bg-blue-500 py-2 px-4 rounded flex items-center gap-2">
              <Link className="" href={Routes.EmailTemplateList}>
                {t("common.email_templates")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {isPending || !EmailTemplate ? (
        <CardSkletonLoader />
      ) : (
        <>
          <CreateOrUpdateEmailTemplateForm data={EmailTemplate} ID={ID} />
        </>
      )}
    </div>
  );
};

export default EditEmailTemplate;
