import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import DragDrop from "@/components/molecules/DragDrop";
import { AppModal } from "@/components/blocks/common/AppModal";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useFileUploadService,
  useMediaLibraryQuery,
} from "@/modules/admin-section/product/product.action";
import { useAppSelector } from "@/redux/hooks";
import { CheckCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type {  UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";

const fileTypes = ["JPG", "JPEG", "PNG", "GIF", "webp"] as const;


interface PhotoUploadModalProps {
  onSave?: (images: UploadedImage[]) => void;
  isMultiple: boolean;
  trigger: any;
  ListRefetch: any;
  usageType: string;
}

const UploadImageModal: React.FC<PhotoUploadModalProps> = ({
  trigger,
  usageType,
}) => {
  const t = useTranslations();
  const [files, setFiles] = useState<UploadedImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<UploadedImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [imageLength, setImageLength] = useState(0);
  const [allMedia, setAllMedia] = useState<any[]>([]);
  const [initialMedia, setInitialMedia] = useState<any[]>([]);
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id ?? "";

  const { mediaLibrary, refetch, isPending } = useMediaLibraryQuery({
    offset: imageLength,
  });
  useEffect(() => {
    if (mediaLibrary && "images" in mediaLibrary) {
      if (initialMedia.length === 0) {
        setInitialMedia(mediaLibrary.images as any);
        setAllMedia(mediaLibrary.images as any);
      }
    }
  }, [mediaLibrary, initialMedia.length]);

  useEffect(() => {
    setImageLength(allMedia.length);
  }, [allMedia]);

  const { uploadFile } = useFileUploadService();
  const handleFileChange = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target?.result as string;

      img.onload = () => {
        const { width, height } = img;
        setFile(file);
      };
    };

    reader.readAsDataURL(file);
    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const newImage: UploadedImage = {
      id: `${Date.now()}-${file.name}`,
      file,
      name: file.name,
      size: formatFileSize(file.size),
      url: URL.createObjectURL(file),
      //@ts-ignore
      isLoading: true,
      isUploaded: false,
    };

    setFiles((prev) => [...prev, newImage]);
    setPreview((prev) => [...prev, newImage]);

    if (file) {
      try {
        const response = await uploadFile(
          file,
          API_ENDPOINTS.PRODUCT_MEDIA_ADD,
          store_id,
          usageType
        );

        setPreview((prev) =>
          prev.map((img) =>
            img.id === newImage.id
              ? { ...img, isLoading: false, isUploaded: true }
              : img
          )
        );
        setFiles((prev) =>
          prev.map((img) =>
            img.id === newImage.id
              ? { ...img, isLoading: false, isUploaded: true }
              : img
          )
        );

        toast.success(response?.message);
        await refetch();
        setImageLength(0);
      } catch (error) {
        setPreview((prev) =>
          prev.map((img) =>
            img.id === newImage.id ? { ...img, isLoading: false } : img
          )
        );
        setFiles((prev) =>
          prev.map((img) =>
            img.id === newImage.id ? { ...img, isLoading: false } : img
          )
        );
        toast.error("File upload failed");
      }
    }
  };

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel=""
      customClass="inset-x-0p md:inset-x-15p  xl:inset-x-25p top-[60px] bg-white"
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      cancelButtonLabel={t("button.close")}
      hideX
    >
      <div>
        <div>
          <div className="text-left mx-2">
            <div className="text-2xl font-semibold px-2 text-start">
              <h1>{t("label.upload_image")}</h1>
            </div>
          </div>
          <div className="px-4 h-[500px] mt-4 overflow-y-auto lg:overflow-hidden custom-scrollbar">
            <div className="relative overflow-y-auto p-4 border-2 border-dashed border-slate-300 w-full rounded custom-scrollbar h-[480px]">
              <div className="absolute flex flex-wrap w-auto gap-4">
                {Array.isArray(preview) && preview.length > 0
                  ? preview.map((image: any) => (
                      <div key={image.id} className="">
                        <div className="relative h-32 w-32 rounded group">
                          <Image
                            loader={GlobalImageLoader}
                            src={image.url}
                            alt={image.file.name}
                            fill
                            sizes="128px"
                            className="h-full w-full rounded"
                          />
                          {image.isLoading ? (
                            <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                              <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : image.isUploaded ? (
                            <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                              <CheckCircleIcon className="h-4 w-4 text-blue-500 animate-pulse" />
                            </div>
                          ) : null}
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
                            <div
                              className="text-white text-xs truncate"
                              title={image.file.name}
                            >
                              {image.file.name}
                            </div>
                            <div className="text-white text-xs">
                              {(image.file.size / 1024).toFixed(2)} KB
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  : ""}
              </div>
              <DragDrop
                handleFileChange={handleFileChange}
                fileTypes={fileTypes}
                file={preview}
              />
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default UploadImageModal;
