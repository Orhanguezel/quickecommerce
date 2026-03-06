"use client";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useExportStoreMutation } from "@/modules/seller-section/export/export.action";
import { useFileUploadService } from "@/modules/seller-section/product/product.action";
import { useAppDispatch } from "@/redux/hooks/index";
import { CloudUploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { toast } from "react-toastify";

const ImportData = () => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [template, setTemplate] = useState(false);
  const handleFileChange = (file: any) => {
    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const validExtensions = [".csv", ".xlsx", ".xls"];
    if (!validTypes.includes(file.type)) {
      const fileExtension = file.name
        .slice(file.name.lastIndexOf("."))
        .toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        toast.error(t("common.please_upload_valid_csv"));
        return;
      }
    }
    setUploadedFile(file);
  };

  const { mutate: ExportStore, isPending: isExporting } =
    useExportStoreMutation();
  const downloadTemplate = (hasData: boolean) => {
    setTemplate(hasData);
    try {

      const formattedData = {
        shop_ids: [1],
        format: "csv",
      };
      const EmptyFormattedData = {
        min_id: "",
        max_id: "",
        start_date: "",
        end_date: "",
        format: "csv",
        export_without_data: true,
      };

      const submissionData = hasData
        ? { ...formattedData }
        : { ...EmptyFormattedData };

      ExportStore(
        { ...(submissionData as any) },
        {
          onSuccess: (response: any) => {

            const fileData = response.data;
            const blob = new Blob([fileData], {
              type: "text/csv;charset=utf-8;",
            });
            downloadFile(blob, "exported_data.csv");
          },
          onError: (error) => {
            toast.error(
                  error instanceof Error
                    ? `${error.message}`
                    : t("common.unexpected_error")
                );
          },
        }
      );
    } catch (error) {
      toast.error(t("common.unexpected_error"));
    }
  };
  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const [isImporting, setIsImporting] = useState(false);
  const { uploadFile } = useFileUploadService();
  const handleSubmit = async () => {
    const file = uploadedFile;
    if (!file) {
      toast.error(t("common.no_file_uploaded"));
      return;
    }
    setIsImporting(true);
    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const validExtensions = [".csv", ".xlsx", ".xls"];
    if (!validTypes.includes(file.type)) {
      const fileExtension = file.name
        .slice(file.name.lastIndexOf("."))
        .toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        toast.error(t("common.please_upload_valid_csv"));
        setIsImporting(false);
        return;
      }
    }
    try {
      const response = await uploadFile(file, SELLER_API_ENDPOINTS.IMPORT);
      toast.success(response?.message);
      setIsImporting(false);
    } catch (error) {
      toast.error(t("toast.file_upload_failed"));
      setIsImporting(false);
    }
  };

  return (
    <div>
      <Card className="mt-4">
        <CardContent className="p-2 md:p-6 ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="mb-2">{t("common.import_step_one_title")}</CardTitle>
                <CardDescription>{t("common.import_step_one_description")}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        {t("common.import_step_one_note_one")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        {t("common.import_step_one_note_two")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        {t("common.import_step_one_note_three")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="mb-2">{t("common.import_step_two_title")}</CardTitle>
                <CardDescription>
                  {t("common.import_step_two_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        {t("common.import_step_two_note_one")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        {t("common.import_step_two_note_two")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        {t("common.import_step_two_note_three")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="mb-2">{t("common.import_step_three_title")}</CardTitle>
                <CardDescription>
                  {t("common.import_step_three_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        {t("common.import_step_three_note_one")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        {t("common.import_step_three_note_two")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 text-center">
            <p className="font-medium my-4">{t("common.download_spreadsheet_template")}</p>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center text-center ">
              <Button
                variant="outline"
                disabled={isExporting && template}
                className="app-button"
                onClick={() => downloadTemplate(true)}
              >
                {isExporting && template
                  ? t("common.downloading_sample")
                  : t("common.download_sample_data")}
              </Button>
              <Button
                variant="outline"
                disabled={isExporting && !template}
                className="app-button"
                onClick={() => downloadTemplate(false)}
              >
                {isExporting && !template
                  ? t("common.downloading_empty")
                  : t("common.download_empty_template")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardContent className="px-2 md:px-6 py-2 md:py-4">
          <div className="">
            <p className="font-medium my-2">{t("common.import_products_file")}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 ">
              <div className="border-2 border-dashed border-blue-500 text-center rounded cursor-pointer hover:bg-blue-50 transition-colors h-[100px]">
                <FileUploader
                  handleChange={handleFileChange}
                  name="file"
                  types={["CSV", "XLSX", ".xls"]}
                >
                  <div className="flex flex-col items-center justify-center h-full cursor-pointer">
                    <CloudUploadIcon className="h-6 w-6 text-blue-500" />
                    <p className="text-blue-500 font-medium">
                      {t("common.drag_and_drop_files_or_click_to_upload")}
                    </p>
                    <p className="text-xs text-blue-500">CSV</p>
                  </div>
                </FileUploader>
              </div>
            </div>
            {uploadedFile && (
              <p className="text-xl my-2">
                {t("common.uploaded_products_file")}{" "}
                <span className="text-blue-500">{uploadedFile?.name}</span>{" "}
              </p>
            )}
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              className="app-button"
              disabled={isImporting}
              onClick={handleSubmit}
            >
              {isImporting ? t("common.importing") : t("common.import_file")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportData;
