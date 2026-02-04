"use client";
import Loader from "@/components/molecules/Loader";
import { Button } from "@/components/ui";
import {
  useSiteMapSettingsQuery,
  useSiteMapSettingsStoreMutation,
} from "@/modules/admin-section/system-management/sitemap-settings/sitemap-settings.action";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

const SiteMapSettingsForm = () => {
  const t = useTranslations();

  const {
    SiteMapSettings,
    isPending: isQuerying,
    refetch,
  } = useSiteMapSettingsQuery({});
  const SiteMapSettingsData = (SiteMapSettings as any)?.data || [];

  const { mutate: ExportStore, isPending } = useSiteMapSettingsStoreMutation();

  const handleDownload = () => {
    ExportStore(undefined, {
      onSuccess: (responseData) => {
        refetch();
        let downloadData = responseData?.data;
        const blob = new Blob([downloadData], { type: "application/xml" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "sitemap.xml";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      onError: (error: any) => {
        toast.error(error);
      },
    });
  };

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="app-button flex items-center gap-2"
        onClick={handleDownload}
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            {t("common.generating")}
          </span>
        ) : (
          t("common.download_sitemap")
        )}
      </Button>
      <div className="mt-8">
        {isQuerying ? (
          <Loader customClass="mt-10" size="medium" />
        ) : (
          <div className="min-w-[120px] max-h-[400px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-7 gap-4 py-3 text-start text-sm font-bold ">
              <p className="col-span-3">{t("table_header.file_name")}</p>
              <p className="col-span-2"> {t("table_header.size")}</p>
              <p className="col-span-2">{t("table_header.generate_at")}</p>
            </div>
            <div className="grid grid-cols-7 gap-4 py-3 text-start text-sm text-[#102A43] dark:text-white">
              <p className="col-span-3">{SiteMapSettingsData?.filename}</p>
              <p className="col-span-2">{SiteMapSettingsData?.size ? `${SiteMapSettingsData.size} kb` : ''}</p>
              <p className="col-span-2">{SiteMapSettingsData?.generated_at}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteMapSettingsForm;
