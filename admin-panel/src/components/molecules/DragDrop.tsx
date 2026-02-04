import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUploadIcon } from "lucide-react"; // or wherever your icon is from

type Props = {
  handleFileChange: (file: File) => void;
  fileTypes: readonly string[];
  file?: any;
};

export default function DragDrop({ handleFileChange, fileTypes, file }: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileChange(acceptedFiles[0]); // or handle multiple files if needed
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
    multiple: false, // set to true if you want multiple file support
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
            Drag and drop files or click to upload
          </p>
          <p className=" text-gray-500 text-sm font-medium p-1">
            Support Formats ( jpg, png, jpeg, webp, gif )
          </p>
        </div>
      )}
    </div>
  );
}
