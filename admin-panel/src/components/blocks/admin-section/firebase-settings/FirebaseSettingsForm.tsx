"use client";
import VectorIcon from "@/assets/icons/VectorIcon";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import Loader from "@/components/molecules/Loader";
import { SubmitButton } from "@/components/blocks/shared";
import { Card } from "@/components/ui";
import {
  useFirebaseSettingsQuery,
  useJSONFileUploadService,
} from "@/modules/admin-section/firebase-settings/firebase-settings.action";
import { CloudUploadIcon, UploadIcon } from "lucide-react";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { toast } from "react-toastify";

const FirebaseSettingsForm = () => {
  const [files, setFiles] = useState<any | null>(null);
  const [file, setFile] = useState<any | null>(null);

  const { FirebaseSettingsData, refetch, isPending } = useFirebaseSettingsQuery(
    {}
  );
  const FirebaseSettingsMessage = (FirebaseSettingsData as any)?.message;

  const handleFileChange = async (file: File | File[]) => {
    const uploadedFile = Array.isArray(file) ? file[0] : file;

    if (uploadedFile) {
      setFiles(uploadedFile.name);
      setFile(uploadedFile);
    }
  };

  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { uploadJSONFile } = useJSONFileUploadService();

  const onSubmit = async () => {
    setIsFetchingMore(true);
    if (file) {
      try {
        const response = await uploadJSONFile(
          file,
          API_ENDPOINTS.FIREBASE_SETTINGS
        );
        toast.success(response?.message);
        setIsFetchingMore(false);
        await refetch();
        setFiles("");
      } catch (error) {
        setIsFetchingMore(false);
      }
    }
  };

  return (
    <Card className="mt-4 p-2 md:p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {/* Status Section */}
        <section className="border-l-4 border-blue-500 rounded shadow bg-gray-100 dark:bg-gray-700 mb-6 p-2 md:p-6">
          {isPending ? (
            <Loader customClass="" size="sm" />
          ) : (
            <>
              {FirebaseSettingsMessage?.firebase_file ? (
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <VectorIcon /> Firebase JSON file is already uploaded.
                </h2>
              ) : (
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <UploadIcon /> Upload JSON File
                </h2>
              )}
            </>
          )}
        </section>

        {/* Upload Section */}
        <section>
          <h3 className="my-2 text-base font-semibold">
            Upload Firebase JSON File
          </h3>

          <div className="lg:w-1/4 md:w-1/2 border border-dashed border-blue-500 text-center rounded cursor-pointer hover:bg-blue-50 transition-colors p-2 h-[100px]">
            <FileUploader
              handleChange={handleFileChange}
              name="file"
              types={["PNG", "JPG", "GIF", "JSON", "application/json"]}
            >
              <div className="flex flex-col items-center justify-center h-full cursor-pointer">
                <CloudUploadIcon className="h-6 w-6 text-blue-500" />
                <p className="text-blue-500 text-sm font-medium">
                  Drag and drop files or click to upload
                </p>
                <small className="text-xs text-blue-500">Only JSON</small>
              </div>
            </FileUploader>
          </div>

          {files && (
            <p className="my-2 text-sm text-gray-600 dark:text-white font-semibold">
              File Name: {files}
            </p>
          )}
        </section>

        {/* Submit Button */}
        <div className="mt-6">
          <SubmitButton IsLoading={isFetchingMore} AddLabel="Submit" />
        </div>
      </form>
    </Card>
  );
};

export default FirebaseSettingsForm;
