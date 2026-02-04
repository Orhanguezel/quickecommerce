// src/components/blocks/shared/PhotoUploadModal.tsx


import DragDrop from "@/components/molecules/DragDrop";
import Loader from "@/components/molecules/Loader";
import {
  Button,
  Card,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useAltChange,
  useFileUploadService,
  useMediaDelete,
  useMediaLibraryQuery,
} from "@/modules/admin-section/product/product.action";
import { CheckCircleIcon, CheckIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { AppModal } from "../common/AppModal";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/redux/hooks";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";

const fileTypes = ["JPG", "JPEG", "PNG", "GIF", "webp"] as const;

export interface UploadedImage {
  id?: string;
  image_id?: string;
  file?: File;
  url: string;
  img_url?: string;
  name?: string;
  size?: string;
  upload_at?: string;
  dimensions?: string;
  alt?: string;
}
interface PhotoUploadModalProps {
  onSave: (images: UploadedImage[]) => void;
  isMultiple: boolean;
  trigger: any;
  buttonTitle?: any;
  usageType: string;
  selectedImage?: UploadedImage;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  onSave,
  isMultiple,
  trigger,
  buttonTitle = "Select Photo",
  usageType,
  selectedImage,
}) => {
  const t = useTranslations();
  const [files, setFiles] = useState<UploadedImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<UploadedImage[]>([]);
  const [lastSelectedImages, setLastSelectedImages] = useState<UploadedImage>();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<UploadedImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [activeTab, setActiveTab] = useState("Media Library");
  const [imageLength, setImageLength] = useState(0);
  const [allMedia, setAllMedia] = useState<any[]>([]);
  const [initialMedia, setInitialMedia] = useState<any[]>([]);
  const [isUpdatingAlt, setIsUpdatingAlt] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id ?? "";


  useEffect(() => {
    if (isModalOpen && selectedImage) {
      setSelectedImages([selectedImage]);
      setLastSelectedImages(selectedImage);
      setAllMedia((prev) => {
        const exists = prev.some(
          (img) => img.image_id == selectedImage.image_id
        );
        return exists ? prev : [selectedImage, ...prev];
      });
    }
  }, [isModalOpen, selectedImage]);

  const { mediaLibrary, refetch, isPending } = useMediaLibraryQuery({
    offset: imageLength,
    store_id
  });
  useEffect(() => {
    if (mediaLibrary && "images" in mediaLibrary) {
      let images = mediaLibrary.images as any[];
      if (
        selectedImage &&
        !images.find((img) => img.image_id == selectedImage.image_id)
      ) {
        images = [selectedImage, ...images];
      }

      if (initialMedia.length === 0) {
        setInitialMedia(images);
        setAllMedia(images);
      }
    }
  }, [mediaLibrary, initialMedia.length, selectedImage]);

  useEffect(() => {
    setImageLength(allMedia.length);
  }, [allMedia]);

  const handleLoadMore = async () => {
    setIsFetchingMore(true);
    try {
      const newMediaData = await refetch();
      //@ts-ignore
      const newImages = newMediaData?.data?.data?.images || [];

      if (newImages.length > 0) {
        setAllMedia((prevMedia) => {
          // Create a map of existing image_ids for quick lookup
          const existingIds = new Set(prevMedia.map((item) => item.image_id));
          // Filter out any duplicates from new images
          const uniqueNewImages = newImages.filter(
            (image: any) => !existingIds.has(image.image_id)
          );
          return [...prevMedia, ...uniqueNewImages];
        });
      } else {
        toast.info("No new data available.");
      }
    } catch (error) {
      toast.error("Failed to load more images");
    } finally {
      setIsFetchingMore(false);
    }
  };

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

        // Update the image state to show it's uploaded
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
        // Update the image state to show error
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

  const { mutate: mediaDelete } = useMediaDelete();
  const handleDelete = (image_id: string) => {
    mediaDelete(
      { image_id },
      {
        onSuccess: () => {
          // Update the allMedia state by filtering out the deleted image
          setAllMedia((prev) =>
            prev.filter((img) => img.image_id !== image_id)
          );
          // Also remove from selectedImages if it was selected
          setSelectedImages((prev) =>
            prev.filter((img) => img.image_id !== image_id)
          );
          if (lastSelectedImages?.image_id === image_id) {
            setLastSelectedImages(undefined);
          }
          refetch();
        },
        onError: () => {
          toast.error("Failed to delete image");
        },
      }
    );
  };

  const removePreview = (id: string) => {
    setPreview((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSelectImage = (image: UploadedImage) => {
    setSelectedImages((prev) => {
      const alreadySelected = prev.find(
        (img) => img.image_id === image.image_id
      );
      const updatedImages = alreadySelected
        ? prev.filter((img) => img.image_id !== image.image_id)
        : isMultiple
        ? [...prev, image]
        : [image];
      const lastSelectedImage = updatedImages[updatedImages.length - 1];
      setLastSelectedImages(lastSelectedImage as any);

      return updatedImages;
    });
  };

  const handleAltChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (lastSelectedImages) {
      setLastSelectedImages({
        ...lastSelectedImages,
        alt: event.target.value,
      });
    }
  };

  const { mutate: altChange } = useAltChange();
  const handleUpdateAlt = (image_id: string, alt: string) => {
    setIsUpdatingAlt(true);
    altChange(
      { image_id, alt },
      {
        onSuccess: () => {
          refetch();
        },
        onError: () => {
          toast.error("Failed to update ALT text");
        },
        onSettled: () => {
          setIsUpdatingAlt(false);
        },
      }
    );
  };

  const handleSave = () => {
    onSave(selectedImages);
    setIsModalOpen(false);
  };
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "Media Library") {
      refetch();
      handleLoadMore()
    }
  };

  return (
    <AppModal
      trigger={trigger}
      disable={!lastSelectedImages}
      actionButtonLabel={buttonTitle}
      customClass="inset-x-0p md:inset-x-5p xl:inset-x-17p top-[100px] bg-white"
      onSave={handleSave}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      cancelButtonLabel={t("button.close")}
      hideX
    >
      <div>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="text-left bg-white">
            <TabsTrigger value="Upload Files">
              <div className="text-start">
                <h1>{t("label.upload_image")}</h1>
              </div>
            </TabsTrigger>
            <TabsTrigger value="Media Library">
              <div className="text-start">
                <h1>{t("label.media_library")}</h1>
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="Upload Files"
            className="h-[500px] overflow-y-auto lg:overflow-hidden custom-scrollbar"
          >
            <div className="px-2">
              <div className="">
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
          </TabsContent>
          <TabsContent
            value="Media Library"
            className="h-[500px] overflow-y-auto lg:overflow-hidden custom-scrollbar"
          >
            <div className="flex flex-col md:flex-row gap-4 px-2">
              <div className="w-full md:w-[81%] flex flex-col rounded-lg  h-[500px]">
                <div className="flex-1 overflow-y-auto p-4 border border-slate-300 rounded custom-scrollbar ">
                  <div className="flex flex-wrap gap-4 ">
                    {Array.isArray(allMedia) && allMedia.length > 0
                      ? allMedia.map((image: any, index: number) => (
                          <Card
                            key={
                              image.image_id ||
                              image.id ||
                              `${image.name}-${index}`
                            }
                            onClick={() => handleSelectImage(image)}
                            className={`${
                              selectedImages.some(
                                (img) => img.image_id == image.image_id
                              )
                                ? "border border-blue-500 shadow-lg text-white"
                                : "text-gray-500 dark:text-white"
                            }rounded cursor-pointer`}
                          >
                            <div
                              className={`${
                                selectedImages.some(
                                  (img) => img.image_id == image.image_id
                                )
                                  ? "border-2 border-blue-500 text-white rounded-md"
                                  : "text-gray-500 dark:text-white"
                              } cursor-pointer relative h-32 w-32 rounded-md group`}
                            >
                              {(() => {
                                const imgSrc =
                                  image.img_url || image.url || "/images/no-image.png";
                                if (!imgSrc) return null;
                                return (
                                  <Image
                                    loader={GlobalImageLoader}
                                    src={imgSrc as string}
                                    alt={(image.name as string) || "image"}
                                    fill
                                    sizes="128px"
                                    className="h-full w-full rounded"
                                  />
                                );
                              })()}
                              <div
                                className={`${
                                  selectedImages.some(
                                    (img) => img.image_id == image.image_id
                                  )
                                    ? "absolute z-10 flex top-0 left-0 bg-blue-500 text-white"
                                    : "hidden"
                                } `}
                              >
                                <button
                                  className="rounded-full p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(image.image_id);
                                  }}
                                >
                                  <CheckIcon className="h-4 w-4 " />
                                </button>
                              </div>
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
                                <div className="absolute top-1 right-1 rounded-full  shadow bg-white hover:bg-red-500 text-red-500 hover:text-white">
                                  <button
                                    className="rounded-full  p-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(image.image_id);
                                    }}
                                  >
                                    <TrashIcon className="h-4 w-4 " />
                                  </button>
                                </div>
                                <div
                                  className="text-white text-xs truncate"
                                  title={image?.file?.name}
                                >
                                  {image?.file?.name}
                                </div>
                                <div className="text-white text-xs">
                                  {image?.file?.size
                                    ? `${(image?.file?.size / 1024).toFixed(
                                        2
                                      )} KB`
                                    : ""}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))
                      : ""}
                  </div>
                  {allMedia.length > 0 && (
                    <div className="text-center mt-4">
                      <Button
                        onClick={handleLoadMore}
                        disabled={isFetchingMore}
                        variant="outline"
                        className="app-button"
                      >
                        {isFetchingMore ? "Loading..." : "Load More"}
                      </Button>
                    </div>
                  )}
                  {isPending && (
                    <div>
                      <Loader customClass="mt-32" size="large" />
                    </div>
                  )}

                  {allMedia.length === 0 && !isPending && (
                    <div className="flex text-center items-center justify-center h-full">
                      <h2 className=" text-center text-sm font-semibold text-gray-700">
                        No Photo Uploaded Yet.
                      </h2>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full md:w-[18%] border border-slate-300 rounded h-[500px]">
                {lastSelectedImages && (
                  <div className="p-2">
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">
                      Preview Selected Images:
                    </h2>
                    <div>
                      <div
                        key={lastSelectedImages.id}
                        className="relative w-full h-32 rounded shadow-xl border"
                      >
                        {(() => {
                          const imgSrc =
                            lastSelectedImages.img_url ||
                            lastSelectedImages.url ||
                            "/images/no-image.png";
                          if (!imgSrc) return null;
                          return (
                            <Image
                              loader={GlobalImageLoader}
                              src={imgSrc as string}
                              alt={(lastSelectedImages.name as string) || "image"}
                              fill
                              className="w-full h-full"
                            />
                          );
                        })()}
                      </div>
                      <div className="mt-4 text-sm overflow-x-visible">
                        <p className="my-2 truncate overflow-hidden whitespace-nowrap max-w-[150px]">
                          {lastSelectedImages.name}
                        </p>
                        <p className="my-2">{lastSelectedImages.size}</p>
                        <p className="my-2">{lastSelectedImages.upload_at}</p>
                        <p className="my-2">{lastSelectedImages.dimensions}</p>

                        <Input
                          type="text"
                          id="alt"
                          className="app-input"
                          placeholder="Enter value"
                          value={lastSelectedImages.alt ?? ""}
                          onChange={handleAltChange}
                        />
                        <Button
                          onClick={() =>
                            handleUpdateAlt(
                              lastSelectedImages.image_id as string,
                              lastSelectedImages.alt as string
                            )
                          }
                          variant="outline"
                          className="mt-2 app-button"
                          disabled={isUpdatingAlt}
                        >
                          {isUpdatingAlt ? "Loading..." : "Update"}{" "}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {!lastSelectedImages && (
                  <div className="p-2 flex text-center items-center justify-center h-full">
                    <h2 className="text-center text-sm font-semibold text-gray-700 mb-2">
                      No Photo Selected Yet.
                    </h2>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppModal>
  );
};

export default PhotoUploadModal;
