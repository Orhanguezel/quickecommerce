import ReviewIcon from "@/assets/icons/ReviewIcon";
import { formatPrice } from "@/components/molecules/formatPrice";
import { Card, CardContent } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import TabComponent from "./components/TabComponent";
import { Play } from "lucide-react";

interface Option {
  value: string;
  label: string;
}
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

interface Variant {
  attributes: Record<string, string | string[]>;
  price: string;
  special_price: string;
  stock_quantity: number;
  sku: string;
  image_url: string;
}

export default function ProductDetailsFormPage({ data, refetch }: any) {
  const t = useTranslations();
  const locale = useLocale();
  const product = data.data;
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(product?.image_url);
  const [zoomPosition, setZoomPosition] = useState({ x: "50%", y: "50%" });
  const [warranty, setWarranty] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product?.variants[0] || null
  );
  const [attributeValues, setAttributeValues] = useState<
    Record<string, Option[]>
  >({});
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [isVariantAvailable, setIsVariantAvailable] = useState(true);

  const fullStars = product.rating ? Math.floor(product.rating) : 0;
  const hasHalfStar = product.rating ? product.rating % 1 !== 0 : false;

  const galleryImages = [
    ...(product?.image_url ? [product.image_url] : []),
    ...(product?.gallery_images_urls
      ? product.gallery_images_urls.split(",")
      : []),
    ...(product?.variants?.length
      ? product.variants
          .map((variant: any) => variant.image_url)
          .filter(Boolean)
      : []),
  ];

  const uniqueGalleryImages = galleryImages.filter(
    (url, index, self) => self.indexOf(url) === index
  );

  useEffect(() => {
    if (!product || !product.variants) return;

    const attributes: Record<string, Option[]> = {};
    const defaultOptions: Record<string, string> = {};

    product.variants.forEach((variant: Variant) => {
      Object.entries(variant.attributes).forEach(([key, value]) => {
        if (!attributes[key]) attributes[key] = [];
        const values = Array.isArray(value) ? value : [value];

        values.forEach((val) => {
          if (!attributes[key].some((option) => option.value === val)) {
            attributes[key].push({ value: val, label: val });
          }
        });

        if (!defaultOptions[key]) {
          defaultOptions[key] = Array.isArray(value) ? value[0] : value;
        }
      });
    });

    setAttributeValues(attributes);
    setSelectedOptions(defaultOptions);
  }, [product]);

  useEffect(() => {
    if (!product || !product.variants) return;

    const matchingVariant = product.variants.find((variant: Variant) => {
      return Object.entries(selectedOptions).every(([key, value]) => {
        const variantValue = variant.attributes[key];
        return Array.isArray(variantValue)
          ? variantValue.includes(value)
          : variantValue === value;
      });
    });

    setSelectedImage(matchingVariant?.image_url || product?.image_url);

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      setIsVariantAvailable(true);
    } else {
      setIsVariantAvailable(false);
    }
  }, [selectedOptions, product]);

  function getEffectivePrice(
    price: number,
    special_price?: number,
    flash_sale?: any
  ): number {
    const basePrice =
      special_price && special_price > 0 ? special_price : price;

    if (flash_sale && basePrice > 0) {
      const discount = parseFloat(flash_sale.discount_amount || "0");
      if (flash_sale.discount_type === "percentage") {
        return basePrice - (basePrice * discount) / 100;
      } else if (flash_sale.discount_type === "fixed") {
        return basePrice - discount;
      }
    }

    return basePrice;
  }

  const { currency, refetch: currencyRefetch } = useCurrencyQuery({
    language: locale,
  });
  const originalData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = originalData.currencies_info;

  const handleImageClick = (image: string | undefined) => {
    setSelectedImage(image);

    const matchedVariant = product?.variants?.find(
      (variant: any) => variant.image_url === image
    );

    if (matchedVariant) {
      setSelectedVariant(matchedVariant);
    }
  };

  const handleOptionSelect = (attribute: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attribute]: value,
    }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x: `${x * 1.5}%`, y: `${y * 1.5}%` });
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  const renderVideoPlayer = () => {
    if (!product?.video_url) return null;
    const youtubeId = getYouTubeVideoId(product?.video_url);
    if (youtubeId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          className="w-full h-full rounded-b-lg"
          allowFullScreen
        ></iframe>
      );
    } else {
      return (
        <video
          controls
          className="w-full h-full object-contain rounded-b-lg"
          src={product?.video_url}
        />
      );
    }
  };

  useEffect(() => {
    if (product?.warranty) {
      const warrantyData = JSON.parse(product.warranty);
      if (warrantyData && warrantyData[0]) {
        setWarranty(
          `${warrantyData[0].warranty_period} ${warrantyData[0].warranty_text}`
        );
      } else {
        setWarranty("");
      }
    } else {
      setWarranty("");
    }
  }, [product]);

  return (
    <>
      <div className="my-4 grid grid-cols-12 gap-6">
        <Card className="col-span-12 space-y-10 ">
          <CardContent className="grid grid-cols-12 gap-6 p-2 md:p-6">
            <div className="col-span-12 lg:col-span-5">
              <div className="grid grid-cols-6 gap-4">
                <div
                  className="col-span-6 m-2 border rounded-sm relative group overflow-hidden"
                  onMouseMove={handleMouseMove}
                  onClick={() => {
                    if (selectedImage.type === "video" && product?.video_url) {
                      setIsVideoModalOpen(true);
                    }
                  }}
                >
                  <Image
                    loader={GlobalImageLoader}
                    src={
                      (selectedImage.type === "video"
                        ? selectedImage.image
                        : selectedImage) ?? "/images/no-image.png"
                    }
                    alt="Main Image"
                    width={1000}
                    height={400}
                    priority
                    style={
                      selectedImage.type === "normal"
                        ? {
                            transformOrigin: `${zoomPosition.x} ${zoomPosition.y}`,
                          }
                        : undefined
                    }
                    className={`w-full h-96 object-fill transition-transform duration-300 ease-in-out ${
                      selectedImage.type === "normal"
                        ? "group-hover:scale-150 cursor-zoom-in"
                        : "cursor-pointer"
                    }`}
                  />
                  {selectedImage.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 cursor-pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-20 w-20 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 22v-20l18 10-18 10z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="col-span-6">
                  <Swiper
                    modules={[Navigation]}
                    spaceBetween={0}
                    slidesPerView={6}
                    navigation={{
                      nextEl: ".swiper-button-next",
                      prevEl: ".swiper-button-prev",
                    }}
                    className="relative w-full"
                  >
                    <div className="swiper-button-prev absolute -left-10 top-1/2  z-10 text-blue-500" />
                    <div className="swiper-button-next absolute -right-10 top-1/2  z-10 text-blue-500" />
                    {product?.video_url && (
                      <SwiperSlide key="video">
                        <div
                          className={`relative cursor-pointer mx-2 border rounded ${
                                product?.image_url === selectedImage.image
                                  ? "border-blue-400"
                                  : "border-gray-300"
                              } h-[64px] w-auto`}
                          onClick={() => setIsVideoModalOpen(true)}
                          onMouseEnter={() =>
                            setSelectedImage({
                              type: "video",
                              image:
                                product?.image_url ||
                                product?.gallery_images_urls?.split(",")[0],
                            })
                          }
                        >
                          <Image
                            src={
                              product?.image_url ||
                              product?.gallery_images_urls?.split(",")[0]
                            }
                            alt="Video Thumbnail"
                            width={200}
                            height={64}
                            className="h-full w-full object-fill rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/no-image.png";
                            }}
                            loader={GlobalImageLoader}
                          />

                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M3 22v-20l18 10-18 10z" />
                            </svg>
                          </div>
                        </div>
                      </SwiperSlide>
                    )}

                    {uniqueGalleryImages.map(
                      (img: string | undefined, index: number) => (
                        <SwiperSlide key={index}>
                          <div className="relative px-2 rounded h-[64px] w-auto">
                            <Image
                              loader={GlobalImageLoader}
                              src={img ?? "/images/no-image.png"}
                              alt={`Thumbnail ${index}`}
                              width={200}
                              height={64}
                              className={`rounded object-fill cursor-pointer border h-full w-full ${
                                img === selectedImage
                                  ? "border-blue-400"
                                  : "border-gray-300"
                              }`}
                              onClick={() => handleImageClick(img)}
                              onMouseEnter={() => setSelectedImage(img)}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/no-image.png";
                              }}
                              loading="lazy"
                            />
                          </div>
                        </SwiperSlide>
                      )
                    )}
                  </Swiper>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-7">
              <div className="border-b pb-4">
                <p className="text-xl font-bold ">{product.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <div className="flex items-center gap-1 text-lg ">
                    <div className="flex">
                      {[...Array(5)].map((_, index) => {
                        let fillPercentage = 0;
                        if (index < fullStars) {
                          fillPercentage = 100;
                        } else if (index === fullStars && hasHalfStar) {
                          fillPercentage = 50;
                        }
                        return (
                          <ReviewIcon
                            key={index}
                            fillPercentage={fillPercentage}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[#282B31] font-semibold">
                      {product.rating}
                    </span>{" "}
                    <span className="text-[#585858] dark:text-white">
                      ({product.review_count} reviews)
                    </span>
                  </div>
                </div>

                <div className="mt-1">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-4">
                      <p className="text-[24px] sm:text-[36px] font-normal sm:font-semibold text-[#222222] dark:text-white">
                        {selectedVariant
                          ? CurrencyData
                            ? formatPrice(
                                getEffectivePrice(
                                  Number(selectedVariant?.price),
                                  Number(selectedVariant?.special_price),
                                  product.flash_sale
                                ),
                                CurrencyData
                              )
                            : 0
                          : 0}
                      </p>
                      {(product.flash_sale ||
                        selectedVariant?.special_price > 0) && (
                        <p className="line-through text-[#5C5C5C] dark:text-white text-[18px] sm:text-[24px]">
                          {CurrencyData
                            ? formatPrice(
                                product.flash_sale
                                  ? selectedVariant?.special_price > 0
                                    ? Number(selectedVariant?.special_price)
                                    : Number(selectedVariant?.price)
                                  : Number(selectedVariant?.price),
                                CurrencyData
                              )
                            : 0}
                        </p>
                      )}
                    </div>

                    {product.flash_sale && (
                      <p className="text-[12px] text-[#EB5A25] px-2 bg-[#EB5A251A] border border-[#EB5A25]">
                        Flash Deal
                      </p>
                    )}

                    {selectedVariant?.stock_quantity > 0 &&
                    isVariantAvailable ? (
                      <p className="text-[12px] text-[#00A537] px-2 bg-[#F4F8F5] border border-[#C5E7C9]">
                        In stock
                      </p>
                    ) : (
                      <p className="text-[12px] text-[#FF0000] px-2 bg-[#F8D7DA] border border-[#F5C6CB]">
                        Out of stock
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 py-3 text-[14px] sm:text-[16px] border-b">
                {selectedVariant?.sku && (
                  <div className="flex gap-2">
                    <label className="block font-semibold">SKU:</label>
                    <p className="text-gray-700 dark:text-gray-400">{selectedVariant?.sku}</p>
                  </div>
                )}

                {product?.category?.category_name && (
                  <div className="flex gap-2">
                    <label className="block font-semibold ">Category:</label>
                    <p className="text-gray-700 dark:text-gray-400">
                      {product?.category?.category_name}
                    </p>
                  </div>
                )}

                {product?.brand?.label && (
                  <div className="flex gap-2">
                    <label className="block font-semibold">Brand:</label>
                    <p className="text-gray-700 dark:text-gray-400">{product?.brand?.label}</p>
                  </div>
                )}

                {warranty && (
                  <div className="flex gap-2">
                    <label className="block font-semibold">Warranty:</label>
                    <p className="text-gray-700 dark:text-gray-400">{warranty}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <label className="block font-semibold">Stock:</label>
                  <p className="text-gray-700 dark:text-gray-400">
                    {selectedVariant?.stock_quantity && isVariantAvailable
                      ? selectedVariant?.stock_quantity
                      : 0}
                  </p>
                </div>

                {product?.return_in_days && (
                  <div className="flex gap-2">
                    <label className="block font-semibold">
                      Return in Days:
                    </label>
                    <p className="text-gray-700 dark:text-gray-400">{product?.return_in_days}</p>
                  </div>
                )}

                {product?.return_text && (
                  <div className="flex gap-2">
                    <label className="block font-semibold min-w-[100px]">
                      Return Policy:
                    </label>
                    <p className="text-gray-700 dark:text-gray-400">{product?.return_text}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <label className="block font-semibold">
                    Change of Mind Allowed:
                  </label>
                  <p className="text-gray-700 dark:text-gray-400">
                    {product?.allow_change_in_mind == "1" ? "Yes" : "No"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <label className="block font-semibold">
                    Cash on Delivery:
                  </label>
                  <p className="text-gray-700 dark:text-gray-400">
                    {product?.cash_on_delivery == "1" ? "Yes" : "No"}
                  </p>
                </div>

                {product.delivery_time_min && product?.delivery_time_max && (
                  <div className="flex gap-2">
                    <label className="block font-semibold">
                      Delivery Time:
                    </label>
                    <p className="text-gray-700 dark:text-gray-400">
                      {product?.delivery_time_min &&
                      product?.delivery_time_max ? (
                        <>
                          {product.delivery_time_min} -{" "}
                          {product.delivery_time_max}
                        </>
                      ) : (
                        "Not Available"
                      )}
                    </p>
                  </div>
                )}

                {product?.delivery_time_text && (
                  <div className="flex gap-2">
                    <label className="block font-semibold">
                      Delivery Note:
                    </label>
                    <p className="text-gray-700 dark:text-gray-400">
                      {product?.delivery_time_text
                        ? product.delivery_time_text
                        : "Not Available"}
                    </p>
                  </div>
                )}

                {product?.available_time_starts && (
                  <div className="flex gap-2">
                    <label className="block font-semibold">
                      Available Start Time:
                    </label>
                    <p className="text-gray-700 dark:text-gray-400">
                      {product?.available_time_starts
                        ? product.available_time_starts
                        : "Not Available"}
                    </p>
                  </div>
                )}

                {product?.available_time_ends && (
                  <div className="flex gap-2">
                    <label className="block font-semibold">
                      Available End Time:
                    </label>
                    <p className="text-gray-700 dark:text-gray-400">
                      {product?.available_time_ends
                        ? product.available_time_ends
                        : "Not Available"}
                    </p>
                  </div>
                )}

                {product?.manufacture_date && (
                  <div className="flex gap-2">
                    <label className="block font-semibold">
                      Manufacture Date:
                    </label>
                    <p className="text-gray-700 dark:text-gray-400">
                      {product?.manufacture_date
                        ? product.manufacture_date
                        : "Not Available"}
                    </p>
                  </div>
                )}

                {product?.expiry_date && (
                  <div className="flex gap-2">
                    <label className="block font-semibold">Expiry Date:</label>
                    <p className="text-gray-700 dark:text-gray-400">
                      {product?.expiry_date
                        ? product.expiry_date
                        : "Not Available"}
                    </p>
                  </div>
                )}
              </div>

              <div className="py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-3 gap-4">
                {Object.entries(attributeValues).map(([key, options]) => (
                  <div key={key} className="">
                    <label className="block font-semibold py-1">
                      {key
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}{" "}
                    </label>
                    <div className="flex gap-2 items-center overflow-x-auto flex-wrap">
                      {options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`px-3 py-1 rounded transition text-[14px] font-[400] ${
                            selectedOptions[key] === option.value
                              ? "bg-blue-angle text-white"
                              : "bg-[#F5FAFF] text-[#676767]"
                          }`}
                          onClick={() => handleOptionSelect(key, option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <div className="block">
            <TabComponent
              description={product?.description}
              reviewsData={product?.reviews}
              refetch={refetch}
              id={product?.id}
              store_id={product?.store?.id}
              specification={product?.specifications}
            />
          </div>
        </Card>
      </div>
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#1e293b] rounded-lg shadow-lg w-full max-w-3xl relative">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-0 right-2 text-gray-600 hover:text-red-500 text-4xl"
            >
              &times;
            </button>
            <div className="aspect-video w-full p-6 pt-10 rounded-lg">
              {renderVideoPlayer()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
