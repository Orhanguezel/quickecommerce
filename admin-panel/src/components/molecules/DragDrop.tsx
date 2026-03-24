import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  handleFileChange: (file: File) => void;
  fileTypes: readonly string[];
  file?: any;
};

export default function DragDrop({ handleFileChange, fileTypes, file }: Props) {
  const t = useTranslations();
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileChange(acceptedFiles[0]);
      }
    },
    [handleFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`col-span-2 text-center rounded cursor-pointer transition-colors p-4 h-[300px] md:h-[420px] ${
        isDragActive ? "bg-blue-50" : ""
      }`}
    >
      <input {...getInputProps()} />
      {file.length == 0 && (
        <div className="flex flex-col items-center justify-center h-full cursor-pointer">
          <CloudUploadIcon className="h-10 w-10 text-blue-500" />
          <p className="mt-2 text-blue-500 text-lg font-medium p-1">
            {t("label.drag_and_drop_files_or_click_to_upload")}
          </p>
          <p className=" text-gray-500 text-sm font-medium p-1">
            {t("label.support_formats")}
          </p>
        </div>
      )}
    </div>
  );
}
