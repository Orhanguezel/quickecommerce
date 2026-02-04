"use client";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useExportStoreMutation } from "@/modules/admin-section/export/export.action";
import { useFileUploadService } from "@/modules/admin-section/product/product.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/index";
import { CloudUploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { toast } from "react-toastify";

const ImportData = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id ?? "";
  let usageType = "default";

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [template, setTemplate] = useState(false);

  const handleFileChange = (file: any) => {
    const validTypes = [
      "text/csv", // CSV files
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX files
      "application/vnd.ms-excel", // XLS files (optional)
    ];
    const validExtensions = [".csv", ".xlsx", ".xls"]; // Fallback for Safari

    // Check MIME type
    if (!validTypes.includes(file.type)) {
      const fileExtension = file.name
        .slice(file.name.lastIndexOf("."))
        .toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        alert("Please upload a valid CSV or XLSX file.");
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
      // Format date fields
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
      // Submission data
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
          onError: (error) => {},
        }
      );
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
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
      toast.error("No file uploaded. Please upload a file.");
      return;
    }
    setIsImporting(true);
    const validTypes = [
      "text/csv", // CSV files
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX files
      "application/vnd.ms-excel", // XLS files (optional)
    ];
    const validExtensions = [".csv", ".xlsx", ".xls"]; // Fallback for Safari
    // Check MIME type
    if (!validTypes.includes(file.type)) {
      const fileExtension = file.name
        .slice(file.name.lastIndexOf("."))
        .toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        toast.error("Please upload a valid CSV or XLSX file.");
        setIsImporting(false);
        return;
      }
    }
    try {
      const response = await uploadFile(
        file,
        API_ENDPOINTS.IMPORT,
        store_id,
        usageType
      );
      toast.success(response?.message);
      setIsImporting(false);
    } catch (error) {
      toast.error("File upload failed.");
      setIsImporting(false);
    }
  };
  return (
    <div data-override="true">
      <Card className="mt-4">
        <CardContent className="p-2 md:p-6 ">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="mb-2">First Step</CardTitle>
                <CardDescription>Download CSV File</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        Download the format file and fill it with proper data.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        You can download the example file to understand how the
                        data must be filled.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        Have to upload CSV or XLSX file.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="mb-2">Second Step</CardTitle>
                <CardDescription>
                  Match Spread sheet data according to instruction{" "}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        Download the format file and fill it with proper data.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        Fill up the data according to the format and
                        validations.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        You can get store id tag id and unit id from their list
                        please input the right ids.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="mb-2">Third Step</CardTitle>
                <CardDescription>
                  Validate data and complete import{" "}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        Upload your file in .csv format.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-500 dark:text-white">
                        Finally click the upload button.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 text-center">
            <p className="font-medium my-4">Download Spreadsheet Template</p>
            <div className="flex flex-col lg:flex-row items-center justify-center space-x-0 lg:space-x-4 text-center ">
              <Button
                variant="outline"
                disabled={isExporting && template}
                className="app-button mb-4 lg:mb-0"
                onClick={() => downloadTemplate(true)}
              >
                {isExporting && template
                  ? "Downloading Sample...."
                  : "Download Sample Data"}
              </Button>
              <Button
                variant="outline"
                disabled={isExporting && !template}
                className="app-button"
                onClick={() => downloadTemplate(false)}
              >
                {isExporting && !template
                  ? "Downloading Empty...."
                  : "Download Empty Template"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardContent className="px-6 py-4">
          <div className="">
            <p className="font-medium my-2">Import Products File</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 ">
              <div className="border-2 border-dashed border-blue-500 text-center rounded cursor-pointer hover:bg-blue-50 transition-colors h-[100px]">
                <FileUploader
                  handleChange={handleFileChange}
                  name="file"
                  types={["CSV", "XLSX", ".xls"]}
                >
                  <div className="flex flex-col items-center justify-center h-full cursor-pointer">
                    <CloudUploadIcon className="h-6 w-6 text-blue-500" />
                    <p className="text-blue-500 font-medium">
                      Drag and drop files or click to upload
                    </p>
                    <p className="text-xs text-blue-500">CSV</p>
                  </div>
                </FileUploader>
              </div>
            </div>
            {uploadedFile && (
              <p className="text-xl my-2">
                Uploaded Products File:{" "}
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
              {isImporting ? "Importing..." : "Import File"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportData;
