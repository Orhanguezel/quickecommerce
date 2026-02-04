import Loader from '@/components/molecules/Loader';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import GlobalImageLoader from '@/lib/imageLoader';
import { useCurrencyQuery } from '@/modules/common/com/com.action';
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { Minus, Plus, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { formatNumberOnly } from '@/components/molecules/formatNumberOnly';
import { addToCart } from '@/redux/slices/cartSlice';
import { formatPrice } from '@/components/molecules/formatPrice';
import ReviewIcon from '@/assets/icons/ReviewIcon';
import { useProductDetailsQueryBySKU } from '@/modules/seller-section/pos/Pos.action';
import { useAppSelector } from '@/redux/hooks';
import { Button } from '@/components/ui';

interface ProductDetailsModalProps {
  data?: any;
  onClose: () => void;
  slug: any;
}

interface Option {
  value: string;
  label: string;
}

interface Variant {
  attributes: Record<string, string | string[]>;
  price: string;
  special_price: string;
  stock_quantity: number;
  sku: string;
  image_url: string;
}

export default function ProductDetailsModal({ onClose, slug }: ProductDetailsModalProps) {
  const locale = useLocale();
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id ?? '';
  const { productdetails } = useProductDetailsQueryBySKU(slug, store_id, locale);
  const product = useMemo(() => productdetails.data || {}, [productdetails.data]);
  const t = useTranslations();
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(product?.image_url || '/images/no-image.png');
  const [warranty, setWarranty] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: '50%', y: '50%' });
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product && product.variants && product.variants.length > 0 ? product.variants[0] : null,
  );
  const [attributeValues, setAttributeValues] = useState<Record<string, Option[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isVariantAvailable, setIsVariantAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [tooltipMessage, setTooltipMessage] = useState('');

  const showTooltip = (message: string) => {
    setTooltipMessage(message);
    setTimeout(() => setTooltipMessage(''), 3000);
  };

  const router = useRouter();
  const token = Cookies.get(AUTH_TOKEN_KEY);

  const cart = useSelector((state: RootState) => state.cart.cart);
  const cartItem = cart.find((item: { id: any }) => item.id === product?.id);
  const qty = cartItem?.quantity || 0;

  const { currency } = useCurrencyQuery({});
  const originalData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = originalData.currencies_info;

  function getEffectivePrice(price: number, special_price?: number, flash_sale?: any): number {
    const basePrice = special_price && special_price > 0 ? special_price : price;

    if (flash_sale && basePrice > 0) {
      const rawDiscount = Number(flash_sale.discount_amount || '0');

      if (flash_sale.discount_type === 'percentage') {
        const discountAmount = Number(
          formatNumberOnly((basePrice * rawDiscount) / 100, CurrencyData),
        );
        return basePrice - discountAmount;
      } else if (flash_sale.discount_type === 'fixed') {
        const discountAmount = Number(formatNumberOnly(rawDiscount, CurrencyData));
        return basePrice - discountAmount;
      }
    }

    return basePrice;
  }

  const finalPrice = CurrencyData
    ? formatNumberOnly(
        getEffectivePrice(
          Number(selectedVariant?.price),
          Number(selectedVariant?.special_price),
          product.flash_sale,
        ),
        CurrencyData,
      )
    : getEffectivePrice(
        Number(selectedVariant?.price),
        Number(selectedVariant?.special_price),
        product.flash_sale,
      );

  const galleryImages = [
    ...(product?.image_url ? [product.image_url] : []),
    ...(product?.gallery_images_urls ? product.gallery_images_urls.split(',') : []),
    ...(product?.variants?.length
      ? product.variants.map((variant: any) => variant.image_url).filter(Boolean)
      : []),
  ];

  const fullStars = product.rating ? Math.floor(product.rating) : 0;
  const hasHalfStar = product.rating ? product.rating % 1 !== 0 : false;

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
        return Array.isArray(variantValue) ? variantValue.includes(value) : variantValue === value;
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

  const handleImageClick = (image: string | undefined) => {
    setSelectedImage(image);

    const matchedVariant = product?.variants?.find((variant: any) => variant.image_url === image);

    if (matchedVariant) {
      setSelectedVariant(matchedVariant);
    }
  };

  const handleIncrement = (e: any) => {
    e.stopPropagation();
    if (
      quantity < Math.min(Number(product?.max_cart_qty) || 1, selectedVariant?.stock_quantity) &&
      isVariantAvailable
    ) {
      setQuantity((prev) => prev + 1);
    } else {
      if (
        (Number(product?.max_cart_qty) || 1) <= selectedVariant?.stock_quantity &&
        quantity >= product?.max_cart_qty
      ) {
        showTooltip(`Maximum allowed quantity (${Number(product?.max_cart_qty) || 1}) reached.`);
      } else if (
        selectedVariant?.stock_quantity < (Number(product?.max_cart_qty) || 1) &&
        quantity >= selectedVariant?.stock_quantity
      ) {
        showTooltip(`Only ${selectedVariant?.stock_quantity} item(s) in stock.`);
      } else {
        showTooltip('You have reached the limit.');
      }
    }
  };
  const handleDecrement = (e: any) => {
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
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
    setZoomPosition({ x: `${x}%`, y: `${y}%` });
  };

  const item = {
    id: product?.id || 0,
    store_id: product?.store?.id || 0,
    store: product?.store?.name || '',
    store_delivery_time: product?.store?.delivery_time || '',
    store_tax: product?.store?.tax || '',
    area_id: product?.store?.area_id,
    name: product?.name || 'Unknown Product',
    price: Number(finalPrice.toString().replace(/,/g, '')),
    max_cart_qty: Number(product?.max_cart_qty),
    stock: selectedVariant?.stock_quantity,
    unit: product?.unit_name,
    quantity,
    image: selectedImage || '/images/no-image.png',
    slug: selectedVariant?.sku || '',
    additional_charge_name: product?.store?.additional_charge_name,
    additional_charge_amount: product?.store?.additional_charge_amount,
    additional_charge_type: product?.store?.additional_charge_type,
    variantDetails: {
      id: selectedVariant?.id || 0,
      variant_slug: selectedVariant?.variant_slug,
      sku: selectedVariant?.sku,
      attributes: {
        ...(selectedVariant?.attributes || {}),
      },
    },
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    setIsLoading(true);

    const imageElement = document.querySelector('.main-product-image') as HTMLImageElement;
    if (!imageElement) {
      setIsLoading(false);
      return;
    }

    const rect = imageElement.getBoundingClientRect();

    const clonedImage = imageElement.cloneNode(true) as HTMLImageElement;
    clonedImage.style.position = 'fixed';
    clonedImage.style.left = `${rect.left}px`;
    clonedImage.style.top = `${rect.top}px`;
    clonedImage.style.width = `${rect.width}px`;
    clonedImage.style.height = `${rect.height}px`;
    clonedImage.style.transition = 'all 0.8s ease-in-out';
    clonedImage.style.zIndex = '1000';
    clonedImage.style.pointerEvents = 'none';
    document.body.appendChild(clonedImage);

    const cartIcon = document.querySelector('.cart-icon') as HTMLElement;
    if (!cartIcon) return;
    const cartRect = cartIcon.getBoundingClientRect();

    setTimeout(() => {
      clonedImage.style.left = `${cartRect.left + cartRect.width / 2}px`;
      clonedImage.style.top = `${cartRect.top + cartRect.height / 2}px`;
      clonedImage.style.width = '30px';
      clonedImage.style.height = '30px';
      clonedImage.style.opacity = '0.5';
    }, 50);

    setTimeout(() => {
      document.body.removeChild(clonedImage);
      dispatch(addToCart(item));
      toast.success(`${product.name} has been added to your cart!`);
      setIsLoading(false);
      onClose();
    }, 800);
  };

  useEffect(() => {
    if (product?.warranty) {
      const warrantyData = JSON.parse(product.warranty);
      if (warrantyData && warrantyData[0]) {
        setWarranty(`${warrantyData[0].warranty_period} ${warrantyData[0].warranty_text}`);
      } else {
        setWarranty('');
      }
    } else {
      setWarranty('');
    }
  }, [product]);

  return (
    <>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="fixed inset-0 bg-black/50 z-80 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="custom-scrollbar bg-white dark:bg-[#334155] p-6 rounded-lg shadow-lg w-full max-w-[95%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60rem] overflow-y-auto lg:overflow-hidden h-[600px] lg:h-auto min-h-[400px] min-w-[280px] xs:min-w-[350px] md:min-w-[700px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">{product.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <X />
            </button>
          </div>

          {product && Object.keys(product).length === 0 ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <Loader customClass="mt-10" size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-5">
                <div className="grid grid-cols-6">
                  <div className="col-span-6 mb-4 border rounded-sm">
                    <div
                      className="relative overflow-hidden group px-6"
                      onMouseMove={handleMouseMove}
                    >
                      <Image
                        src={selectedImage || '/images/no-image.png'}
                        alt="Main Image"
                        width={1000}
                        height={400}
                        style={{
                          transformOrigin: `${zoomPosition.x} ${zoomPosition.y}`,
                        }}
                        className="w-full h-96 object-contain transition-transform duration-300 ease-in-out group-hover:scale-150 cursor-zoom-in main-product-image"
                        loader={GlobalImageLoader}
                      />
                    </div>
                  </div>
                  <div className="col-span-6">
                    <Swiper
                      modules={[Navigation, Autoplay]}
                      spaceBetween={10}
                      slidesPerView={3}
                      loop={galleryImages.length > 3}
                      autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                        waitForTransition: false,
                      }}
                      speed={2500}
                      className="relative w-full"
                      onInit={(swiper) => {
                        setTimeout(() => {
                          if (swiper?.autoplay && typeof swiper.autoplay.start === 'function') {
                            swiper.autoplay.start();
                          }
                        }, 100);
                      }}
                    >
                      {galleryImages.map((img: string | undefined, index: number) => (
                        <SwiperSlide key={index}>
                          <div className="relative px-2">
                            <Image
                              src={img || '/images/no-image.png'}
                              alt={`Thumbnail ${index}`}
                              width={200}
                              height={64}
                              className={`object-fill cursor-pointer border h-[64px]  w-[200px] ${
                                img === selectedImage ? 'border-blue-400' : 'border-gray-300'
                              }`}
                              onClick={() => handleImageClick(img)}
                              onMouseEnter={() => setSelectedImage(img)}
                              loader={GlobalImageLoader}
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-7">
                <div className="h-[380px] overflow-hidden lg:overflow-auto custom-scrollbar">
                  <div className="border-b pb-2 dark:border-gray-700">
                    <p className="text-[24px] font-bold line-clamp-2">
                      {product.name || 'Unknown Product'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-100 mt-2">
                      <span className="flex items-center gap-1 text-[14px] ">
                        <div className="flex">
                          {[...Array(5)].map((_, index) => {
                            let fillPercentage = 0;
                            if (index < fullStars) {
                              fillPercentage = 100;
                            } else if (index === fullStars && hasHalfStar) {
                              fillPercentage = 50;
                            }
                            return <ReviewIcon key={index} fillPercentage={fillPercentage} />;
                          })}
                        </div>
                        <span className="text-[#282B31] dark:text-gray-100 font-semibold">
                          {product.rating}
                        </span>{' '}
                        <span className="text-[#585858] dark:text-gray-400">
                          ({product.review_count} {t('orders.reviews')})
                        </span>
                      </span>
                    </div>
                    <div className="">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6">
                        <div className="flex items-center gap-4">
                          <p className="text-[24px] sm:text-[36px] font-semibold text-[#222222] dark:text-gray-100">
                            {selectedVariant
                              ? CurrencyData
                                ? formatPrice(
                                    getEffectivePrice(
                                      Number(selectedVariant?.price),
                                      Number(selectedVariant?.special_price),
                                      product.flash_sale,
                                    ),
                                    CurrencyData,
                                  )
                                : getEffectivePrice(
                                    Number(selectedVariant?.price),
                                    Number(selectedVariant?.special_price),
                                    product.flash_sale,
                                  )
                              : 0}
                          </p>
                          {(product.flash_sale || selectedVariant?.special_price > 0) && (
                            <p className="line-through text-[#5C5C5C] dark:text-gray-400 text-[18px] sm:text-[24px]">
                              {CurrencyData
                                ? formatPrice(
                                    product.flash_sale
                                      ? selectedVariant?.special_price > 0
                                        ? Number(selectedVariant?.special_price)
                                        : Number(selectedVariant?.price)
                                      : Number(selectedVariant?.price),
                                    CurrencyData,
                                  )
                                : product.flash_sale
                                  ? selectedVariant?.special_price > 0
                                    ? Number(selectedVariant?.special_price)
                                    : Number(selectedVariant?.price)
                                  : Number(selectedVariant?.price)}
                            </p>
                          )}
                        </div>

                        {product.flash_sale && (
                          <p className="text-[12px] text-[#EB5A25] px-2 bg-[#EB5A251A] border border-[#EB5A25] rounded-sm">
                            Flash Deals
                          </p>
                        )}

                        {selectedVariant?.stock_quantity > 0 && isVariantAvailable ? (
                          <p className="text-[14px] text-[#00A537] px-2 bg-[#F4F8F5] border border-[#C5E7C9] rounded-sm">
                            In Stock
                          </p>
                        ) : (
                          <p className="text-[14px] text-[#FF0000] px-2 bg-[#F8D7DA] border border-[#F5C6CB] rounded-sm">
                            Out of Stock
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 py-3 text-[14px] sm:text-[16px] border-b">
                    {selectedVariant?.sku && (
                      <div className="flex gap-2">
                        <label className="block font-semibold"> {t('label.sku')}</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedVariant?.sku}</p>
                      </div>
                    )}

                    {product?.category?.category_name && (
                      <div className="flex gap-2">
                        <label className="block font-semibold "> {t('label.categorys')}</label>
                        <p className="text-gray-700 dark:text-gray-300">
                          {product?.category?.category_name}
                        </p>
                      </div>
                    )}

                    {product?.brand?.label && (
                      <div className="flex gap-2">
                        <label className="block font-semibold">{t('label.brand')}:</label>
                        <p className="text-gray-700 dark:text-gray-300">{product?.brand?.label}</p>
                      </div>
                    )}

                    {warranty && (
                      <div className="flex gap-2">
                        <label className="block font-semibold">{t('label.warranty')}:</label>
                        <p className="text-gray-700 dark:text-gray-300">{warranty}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <label className="block font-semibold">{t('label.stock')}:</label>
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedVariant?.stock_quantity && isVariantAvailable
                          ? selectedVariant?.stock_quantity
                          : 0}
                      </p>
                    </div>
                  </div>

                  <div className="py-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 ">
                    {Object.entries(attributeValues).map(([key, options]) => (
                      <div key={key} className="">
                        <label className="block font-semibold py-1">
                          {key
                            .split('_')
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}{' '}
                        </label>
                        <div className="flex gap-2 items-center overflow-x-auto flex-wrap">
                          {options.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`px-3 py-1 rounded transition text-[14px] ${
                                selectedOptions[key] === option.value
                                  ? 'bg-blue-angle text-white'
                                  : 'bg-[#F5FAFF] text-[#676767]'
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end rounded-md bg-white dark:bg-gray-800 mt-4">
                  <div className="w-full md:w-40">
                    <p className="text-lg font-semibold dark:text-gray-100 mb-2">Quantity</p>
                    <div className="flex items-center justify-between border p-1 rounded-md min-w-[60%] sm:min-w-[50%]">
                      <button
                        onClick={handleDecrement}
                        className={`p-2 rounded-md ${
                          quantity === 1
                            ? 'bg-[#DEE0E5] dark:bg-gray-700 text-[#AFB1B6] cursor-not-allowed'
                            : 'bg-[#DEE0E5] dark:bg-gray-700 hover:bg-[#2563EB] dark:hover:bg-blue-600 text-[#AFB1B6] dark:text-gray-300 hover:text-white'
                        }`}
                        disabled={quantity === 1}
                      >
                        <Minus width={12} height={12} />
                      </button>
                      <span className="text-[#282B31] dark:text-gray-100 font-semibold px-2 text-[14px]">
                        {quantity}
                      </span>
                      <div className="relative">
                        <button
                          onClick={handleIncrement}
                          className="p-2 rounded-md bg-[#DEE0E5] dark:bg-gray-700 hover:bg-[#2563EB] dark:hover:bg-blue-600 text-[#AFB1B6] dark:text-gray-300 hover:text-white"
                        >
                          <Plus width={12} height={12} />
                        </button>

                        {tooltipMessage && (
                          <div className="absolute bottom-full mb-1 -right-7 -translate-x-1/2 px-3 py-1 bg-black text-white text-xs rounded-md shadow-md z-10 whitespace-nowrap">
                            {tooltipMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row w-full justify-end">
                    {selectedVariant?.stock_quantity > 0 && isVariantAvailable ? (
                      <Button
                        onClick={handleAddToCart}
                        disabled={isLoading || qty > 0}
                        className="app-button w-full md:w-40"
                      >
                        <span>Add to Card</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={handleAddToCart}
                        disabled
                        className="app-button w-full md:w-40"
                      >
                        <span>Add to Card</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
