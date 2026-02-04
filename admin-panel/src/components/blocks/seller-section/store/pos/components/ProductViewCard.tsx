"use client";
import ReviewIcon from "@/assets/icons/ReviewIcon";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import GlobalImageLoader from "@/lib/imageLoader";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { RootState } from "@/redux/store";
import { AnimatePresence, motion } from "framer-motion";
import {
  Minus,
  MinusCircle,
  PlaneIcon,
  Plus,
  PlusCircle,
  PlusIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ProductDetailsModal from "../modals/ProductDetailsModal";
import { formatPrice } from "@/components/molecules/formatPrice";
import FlashDeal from "@/assets/icons/FlashDeal";
import ProductstatusNew from "@/assets/icons/ProductstatusNew";
import { formatNumberOnly } from "@/components/molecules/formatNumberOnly";
import { addToCart, updateQuantity } from "@/redux/slices/cartSlice";
import CloudIcon from "@/assets/icons/CloudIcon";

interface ViewCardProps {
  id?: number;
  store_id?: number;
  store?: string;
  unit?: string;
  title: string;
  imageSrc: string;
  price: number;
  discount?: number;
  special_price?: number;
  effective_price?: number;
  reviews?: number;
  rating?: number;
  slug?: string;
  status?: string;
  max_cart_qty?: string;
  Stock?: number;
  ifWishlist?: boolean;
  isMultiVariant?: boolean;
  variantsList?: any[];
  refetchList?: () => void;
  onRemove?: (id: number) => void;
  store_tax?: string;
  store_delivery_time?: string;
  area_id?: number;
  additional_charge_name?: string;
  additional_charge_amount?: string;
  additional_charge_type?: string;
  flash_sale?: {
    flash_sale_id: number;
    discount_type: string;
    discount_amount: string;
    purchase_limit: string;
  } | null;
}

export default function ProductViewCard({
  id,
  store_id,
  store,
  store_delivery_time,
  store_tax,
  title,
  imageSrc,
  price,
  special_price,
  effective_price,
  discount,
  reviews,
  rating,
  slug = "",
  status,
  max_cart_qty,
  Stock = 0,
  refetchList,
  variantsList = [],
  ifWishlist = false,
  isMultiVariant = false,
  onRemove,
  area_id,
  additional_charge_name,
  additional_charge_amount,
  additional_charge_type,
  flash_sale,
  unit,
}: ViewCardProps) {
  const locale = useLocale();
  const t = useTranslations();
  

  const [slugData, setSlugData] = useState("");
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();

  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const cart = useSelector((state: RootState) => state.cart.cart);
  const cartItem = cart.find((item) => item.id === id);
  const quantity = cartItem?.quantity || 0;
  const stock = cartItem?.stock || 0;
  const MaxCartQty = Number(cartItem?.max_cart_qty) || 1;

  const { currency, refetch } = useCurrencyQuery({});
  const originalData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = originalData.currencies_info;

  const fullStars = rating ? Math.floor(rating) : 0;
  const hasHalfStar = rating ? rating % 1 !== 0 : false;

  function getEffectivePrice(
    price: number,
    special_price?: number,
    flash_sale?: any
  ): number {
    const basePrice =
      special_price && special_price > 0 ? special_price : price;

    if (flash_sale && basePrice > 0) {
      const rawDiscount = Number(flash_sale.discount_amount || "0");

      if (flash_sale.discount_type === "percentage") {
        const discountAmount = Number(
          formatNumberOnly((basePrice * rawDiscount) / 100, CurrencyData)
        );
        return basePrice - discountAmount;
      } else if (flash_sale.discount_type === "fixed") {
        const discountAmount = Number(
          formatNumberOnly(rawDiscount, CurrencyData)
        );
        return basePrice - discountAmount;
      }
    }

    return basePrice;
  }

  const finalPrice = CurrencyData
    ? formatNumberOnly(
        getEffectivePrice(Number(price), Number(special_price), flash_sale),
        CurrencyData
      )
    : getEffectivePrice(Number(price), Number(special_price), flash_sale);

  const item = {
    id: id || 0,
    store_id: store_id || 0,
    store: store || "",
    store_tax: store_tax || "",
    area_id: area_id || 0,
    store_delivery_time: store_delivery_time || "",
    name: title || "Unknown Product",
    price: Number(finalPrice.toString().replace(/,/g, "")) || 0,
    quantity: 1,
    image: imageSrc,
    stock: Stock,
    unit: unit,
    max_cart_qty: Number(max_cart_qty),
    slug: variantsList?.[0]?.sku || "",
    additional_charge_name: additional_charge_name,
    additional_charge_amount: additional_charge_amount,
    additional_charge_type: additional_charge_type,
    variantDetails: {
      id: variantsList?.[0]?.id || 0,
      variant_slug: variantsList?.[0]?.variant_slug,
      sku: variantsList?.[0]?.sku,
      attributes: (() => {
        try {
          return JSON.parse(variantsList?.[0]?.attributes || "{}");
        } catch (e) {
          return {};
        }
      })(),
    },
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    const cartIcon = document.querySelector(".cart-icon") as HTMLElement;
    const productImage = e.target
      .closest(".relative")
      ?.querySelector("img") as HTMLElement;

    if (cartIcon && productImage) {
      const cartRect = cartIcon.getBoundingClientRect();
      const imageRect = productImage.getBoundingClientRect();

      const clonedImage = productImage.cloneNode(true) as HTMLImageElement;

      clonedImage.style.position = "fixed";
      clonedImage.style.left = `${imageRect.left}px`;
      clonedImage.style.top = `${imageRect.top}px`;
      clonedImage.style.width = `${imageRect.width}px`;
      clonedImage.style.height = `${imageRect.height}px`;
      clonedImage.style.transition = "all 0.5s ease-out";
      clonedImage.style.zIndex = "999";
      clonedImage.style.pointerEvents = "none";

      document.body.appendChild(clonedImage);

      setTimeout(() => {
        clonedImage.style.left = `${
          cartRect.left + cartRect.width / 2 - imageRect.width / 4
        }px`;
        clonedImage.style.top = `${
          cartRect.top + cartRect.height / 2 - imageRect.height / 4
        }px`;
        clonedImage.style.width = "20px";
        clonedImage.style.height = "20px";
        clonedImage.style.opacity = "0";
      }, 0);
      dispatch(addToCart(item));
      toast.success(`${title} has been added to your cart!`);

      setTimeout(() => {
        document.body.removeChild(clonedImage);
      }, 500);
    }
  };

  const handleIncrement = (e: any) => {
    e.stopPropagation();
    if (quantity < stock) {
      dispatch(updateQuantity({ id: item.id, quantity: quantity + 1 }));
    } else {
      toast.error("You have reached the maximum available stock!");
    }
  };
  const handleDecrement = (e: any) => {
    e.stopPropagation();
    dispatch(
      updateQuantity({
        id: item.id,
        quantity: quantity - 1,
      })
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleOpenModal = (e: any) => {
    e.stopPropagation();
    setShowModal(true);
    setSlugData(slug);
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  const isStockLimit = quantity >= stock;
  const isCartLimit = quantity >= MaxCartQty;
  const isMaxReached = isCartLimit || isStockLimit;

  let maxTooltip = "";
  if (isCartLimit && MaxCartQty <= stock) {
    maxTooltip = `Maximum ${MaxCartQty} allowed`;
  } else if (isStockLimit && stock < MaxCartQty) {
    maxTooltip = `Only ${stock} in stock`;
  } else {
    maxTooltip = "You have reached the limit";
  }

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <div className="relative group bg-white dark:bg-[#0A121C]  rounded-[10px] w-full p-[14px] sm:w-full  h-[305px] border-[0.5px] border-transparent dark:border-[#374151] shadow-[-1px_1px_12px_0px_#0000000F] dark:shadow-[0px_2px_15px_0px_#0000000D]  hover:drop-shadow-md dark:hover:drop-shadow-[0_4px_12px_rgba(255,255,255,0.05)]  cursor-pointer">
        <div>
          <div className="relative flex justify-center group h-[180px] w-full  rounded-[10px]">
            <div className="absolute top-2 left-2 flex items-center gap-2">
              {status && <ProductstatusNew text={status} locale={locale} />}
              {flash_sale && (
                <div className="">
                  <FlashDeal height={24} width={36} />
                </div>
              )}
            </div>
            {flash_sale ? (
              <div className="absolute top-2 right-2 bg-red-500 text-[#FFFFFF] dark:bg-red-600 dark:text-white text-[10px] px-1 py-1 rounded">
                {flash_sale.discount_type === "percentage"
                  ? `${flash_sale.discount_amount}%`
                  : `${
                      CurrencyData
                        ? formatPrice(
                            Number(flash_sale.discount_amount),
                            CurrencyData
                          )
                        : Number(flash_sale.discount_amount)
                    }`}
              </div>
            ) : special_price && special_price > 0 ? (
              <div className="absolute top-2 right-2 bg-red-500 text-[#FFFFFF] dark:bg-red-600 dark:text-white text-[10px] px-2 py-1 rounded">
                {`${discount ?? 0}%`}
              </div>
            ) : null}

            <div className="w-[180px] h-[160px]">
              <Image
                src={
                  imageSrc && imageSrc.trim() !== ""
                    ? imageSrc
                    : "/images/no-image.png"
                }
                alt={title}
                width={500}
                height={500}
                className="w-full h-full"
                loader={GlobalImageLoader}
              />
            </div>
          </div>
        </div>

        <div className="mt-1">
          {rating !== undefined &&
          reviews !== undefined &&
          Number(rating) > 0 ? (
            <div className="flex items-center justify-between ">
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, index) => {
                    let fillPercentage = 0;
                    if (index < fullStars) {
                      fillPercentage = 100;
                    } else if (index === fullStars && hasHalfStar) {
                      fillPercentage = 50;
                    }
                    return (
                      <ReviewIcon key={index} fillPercentage={fillPercentage} />
                    );
                  })}
                </div>
                <span className="text-[#585858] dark:text-white ml-1 text-[12px]">
                  ({reviews})
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, index) => {
                    let fillPercentage = 0;
                    if (index < 0) {
                      fillPercentage = 100;
                    } else if (index === fullStars && hasHalfStar) {
                      fillPercentage = 50;
                    }
                    return (
                      <ReviewIcon key={index} fillPercentage={fillPercentage} />
                    );
                  })}
                </div>
                <span className="text-[#585858] dark:text-white ml-1 text-[12px]">
                  ({reviews})
                </span>
              </div>
            </div>
          )}
          {/* <Link href={`${Routes.productDetails}/${slug}`} passHref> */}
          <p className="text-[16px] text-[#686868] dark:text-[#D1D5DB] font-[600] line-clamp-1 hover:text-blue-400 dark:hover:text-blue-300 hover:underline">
            {title}
          </p>
          {/* </Link> */}
          <div
            className={`flex items-center pt-[2px]  ${
              Stock > 0 ? "text-[#34A853]" : "text-[#EA4335]"
            }`}
          >
            <span className="text-[14px]">
              {Stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-end gap-[2px] truncate w-2/3 ">
            <span className="text-[#2563EB] font-semibold text-[16px]">
              {CurrencyData
                ? formatPrice(
                    getEffectivePrice(
                      Number(price),
                      Number(special_price),
                      flash_sale
                    ),
                    CurrencyData
                  )
                : getEffectivePrice(
                    Number(price),
                    Number(special_price),
                    flash_sale
                  )}
            </span>

            {(flash_sale ||
              (special_price !== undefined && special_price > 0)) && (
              <p className="line-through text-[#848484] dark:text-[#9CA3AF] font-medium text-[14px]">
                {CurrencyData
                  ? formatPrice(
                      flash_sale
                        ? special_price !== undefined && special_price > 0
                          ? Number(special_price)
                          : Number(price)
                        : Number(price),
                      CurrencyData
                    )
                  : flash_sale
                  ? special_price !== undefined && special_price > 0
                    ? Number(special_price)
                    : Number(price)
                  : Number(price)}
              </p>
            )}
          </div>
        </div>

        <div
          className="rounded-[10px] py-2 absolute bottom-[-1] left-1/2 -translate-x-1/2 bg-[#0c0c0cc6] border-l border-r border-b w-full h-full opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center"
          onClick={(e) => {
            if (quantity === 0) {
              e.stopPropagation();
              if (Stock === 0) {
                e.preventDefault();
                return;
              }
              if (variantsList.length === 0) {
                handleOpenModal(e);
              } else {
                handleAddToCart(e);
              }
            }
          }}
        >
          {quantity === 0 ? (
            <PlusCircle size={32} className="text-white cursor-pointer" />
          ) : (
            <div className="flex items-center justify-between bg-transparent p-[3px] rounded-[5px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecrement(e);
                }}
                disabled={quantity === 1}
              >
                <MinusCircle size={32} className="text-white" />
              </button>

              <span className="text-white text-lg font-semibold w-[40px] text-center">
                {quantity < 10 ? `0${quantity}` : quantity}
              </span>

              <div className="relative group/inc">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncrement(e);
                  }}
                  disabled={quantity >= Math.min(MaxCartQty, stock)}
                >
                  <PlusCircle
                    size={32}
                    className={
                      quantity < Math.min(MaxCartQty, stock)
                        ? "text-white"
                        : "text-white opacity-50 cursor-not-allowed"
                    }
                  />
                </button>
                {isMaxReached && (
                  <div className="absolute bottom-[-35px] right-[-90px] -translate-x-1/2 mb-1 hidden group-hover/inc:block px-2 py-1 bg-black text-white text-xs rounded shadow-md whitespace-nowrap z-10">
                    {maxTooltip}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onClick={handleCloseModal}
            className="fixed inset-0 bg-black/20 z-80 flex items-center justify-center"
          >
            <ProductDetailsModal onClose={handleCloseModal} slug={slugData} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
