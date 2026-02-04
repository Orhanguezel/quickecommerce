'use client';
import CloudIcon from '@/assets/icons/CloudIcon';
import StepIcon from '@/assets/icons/StepIcon';
import VectorIcon from '@/assets/icons/VectorIcon';
import Loader from '@/components/molecules/Loader';
import multiLang from '@/components/molecules/multiLang.json';
import { AppSelect } from '@/components/blocks/common';
import {
  Button,
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/components/ui';
import { SellerRoutes } from '@/config/sellerRoutes';
import GlobalImageLoader from '@/lib/imageLoader';
import { useGoogleMapForAllQuery } from '@/modules/admin-section/google-map-settings/google-map-settings.action';
import { useAreaDropdownQuery } from '@/modules/common/area/area.action';
import { usePaymentGatewayQuery } from '@/modules/common/payment-gateway/payment-gateway.action';
import { useStoreTypeQuery } from '@/modules/common/store-type/store-type.action';
import { useStoreListQuery } from '@/modules/seller-section/product/product.action';
import {
  useSellerStoreMutation,
  useSellerUpdateMutation,
} from '@/modules/seller-section/store/store.action';
import { StoreFormData, storeSchema } from '@/modules/seller-section/store/store.schema';
import { useGetPermissionsQuery } from '@/modules/users/users.action';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDynamicValue, setRefetch } from '@/redux/slices/refetchSlice';
import { setSelectedStore } from '@/redux/slices/storeSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { DrawingManager, GoogleMap, Marker, Polygon, useLoadScript } from '@react-google-maps/api';
import { ChevronsDownIcon, ChevronsRightIcon, CircleCheckBig } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import AppPhoneNumberInput from '../../common/AppPhoneNumberInput';
import Cancel from '../../custom-icons/Cancel';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';
import { BusinessPlanSection } from './components/BusinessPlanSection';
import PaymentOptionCard from './components/PaymentOptionCard';
// JSON scaffold stack (standard)
import {
  AdminI18nJsonPanel,
  buildI18nJsonFromFlatValues,
  applyI18nJsonToFlatForm,
  makeRHFSetValueAny,
  safeObject,
  ensureLangKeys,
  useFormI18nScaffold,
  initI18nFlatFormFromEntity,
} from '@/lib/json';
import type { LangKeys, ViewMode, LangType } from '@/lib/json';

type StoreResponse = {
  data: {
    data: {
      subscription_id: string;
      subscription_history_id: string;
      store_id: string;
      store_type: string;
      slug: string;
    };
  };
};

export default function CreateOrUpdateStoreForm({ data }: any) {
  const dispatch = useAppDispatch();
  const multiLangData: LangType[] = useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const editData = data;
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const { GoogleMapData } = useGoogleMapForAllQuery({});
  const GoogleMapSettingsMessage = (GoogleMapData as any)?.message;
  const googleMapKey = GoogleMapSettingsMessage?.com_google_map_api_key;
  const isMapEnabled = GoogleMapSettingsMessage?.com_google_map_enable_disable === 'on';

  const [polygonCoords, setPolygonCoords] = useState<any>(null);
  const selectedStoreType = editData && editData?.store_type ? editData?.store_type : '';
  const {
    watch,
    control,
    register,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      store_type: selectedStoreType,
    },
  });
  const watchedValues = watch();
  const t = useTranslations();
  const [successMessage, setSuccessMessage] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeStep, setActiveStep] = useState('general_info');
  const [activeTab, setActiveTab] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const [lastSelectedImages, setLastSelectedImages] = useState<any>(null);
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>('');
  const [errorImagesMessage, setImagesErrorMessage] = useState<string>('');
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string | null>(null);
  const { AreaDropdownList } = useAreaDropdownQuery({});
  const { PaymentGatewayList } = usePaymentGatewayQuery({});
  const { storeType } = useStoreTypeQuery({});
  let PaymentGateways = (PaymentGatewayList as any)?.paymentGateways || [];
  let AreaList = (AreaDropdownList as any) || [];
  let StoreTypeList = (storeType as any) || [];
  const formatTime = (time: string) => {
    if (!time) return '';
    return time.split(':').slice(0, 2).join(':');
  };
  const cashOnDeliveryIndex = PaymentGateways.findIndex((item: { id: number }) => item.id === 5);

  const beforeId5 =
    cashOnDeliveryIndex !== -1
      ? PaymentGateways.filter((item: { id: number }) => item.id !== 5)
      : PaymentGateways;

  const [loading, setLoading] = useState(false);
  const handleStripePayment = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              name: subscription?.name,
              price: subscription?.price,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create Stripe session');
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handlePaypalPayment = async () => {
    try {
      const response = await fetch('/api/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              name: subscription?.name,
              price: subscription?.price,
              quantity: 1,
            },
            ,
          ],
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create PayPal order');
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Error refetching data: ${error.message}`
          : 'An unknown error occurred while refetching data',
      );
    } finally {
      setLoading(false);
    }
  };
  const handlePaytmPayment = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/paytm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subscription?.name,
          price: subscription?.price,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (data.txnToken) {
        const config = {
          root: '',
          flow: 'DEFAULT',
          data: {
            orderId: data.orderId,
            token: data.txnToken,
            tokenType: 'TXN_TOKEN',
            amount: data.amount,
          },
          handler: {
            notifyMerchant: function (eventName: any, data: any) {},
          },
        };

        if ((window as any).Paytm && (window as any).Paytm.CheckoutJS) {
          (window as any).Paytm.CheckoutJS.init(config)
            .then(() => {
              (window as any).Paytm.CheckoutJS.invoke();
            })
            .catch((error: any) =>
              toast.error(
                error instanceof Error
                  ? `Error refetching data: ${error.message}`
                  : 'An unknown error occurred while refetching data',
              ),
            );
        } else {
          alert('Paytm SDK not loaded');
        }
      } else {
        alert('Failed to initiate Paytm payment');
      }
    } catch (error) {
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };
  const handleRazorpayPayment = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subscription?.name,
          price: subscription?.price,
          quantity: 1,
        }),
      });

      const data = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Public Key
        amount: data.amount,
        currency: data.currency,
        name: 'Your Company',
        description: 'Test Payment',
        order_id: data.id,
        handler: function (response: any) {
          alert('Payment successful');
        },
        prefill: {
          name: 'Your Customer',
          email: 'email@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editData) {
      let ariaId = String(editData?.area?.id);
      setValue('name_df', editData?.name);
      setValue('meta_title_df', editData?.meta_title);
      setValue('meta_description_df', editData?.meta_description);
      setValue('slug', editData?.slug);
      setValue('phone', editData?.phone);
      setPhoneNumber(editData?.phone);
      setValue('area_id', ariaId);
      setValue('email', editData?.email);
      setValue('opening_time', formatTime(editData?.opening_time || ''));
      setValue('closing_time', formatTime(editData?.closing_time || ''));
      setValue('address_df', editData?.address);
      setValue('store_type', editData?.store_type);
      setActiveTab(editData?.subscription_type);
      setSelectedCard(editData?.subscription_id);
      Object?.keys(editData?.translations).forEach((language) => {
        const translation = editData.translations[language];
        setValue(`name_${language}` as keyof StoreFormData, translation?.name);
        setValue(`address_${language}` as keyof StoreFormData, translation?.address);
        setValue(
          `meta_description_${language}` as keyof StoreFormData,
          translation?.meta_description,
        );
        setValue(
          `meta_description_${language}` as keyof StoreFormData,
          translation?.meta_description,
        );
      });
      if (editData?.banner) {
        setLastSelectedImages({
          image_id: editData?.banner ? editData?.banner : '',
          img_url: editData?.banner_url ? editData?.banner_url : '/images/no-image.png',
          name: 'banner',
        });
      }
      if (editData?.logo) {
        setLastSelectedLogo({
          image_id: editData?.logo ? editData?.logo : '',
          img_url: editData?.logo_url ? editData?.logo_url : '/images/no-image.png',
          name: 'logo',
        });
      }

      setLogoErrorMessage('');
      setImagesErrorMessage('');
      setPolygonCoords(editData?.area?.coordinates);
      setMarkerPosition({
        lat: Number(editData?.latitude),
        lng: Number(editData?.longitude),
      });
      const lat = Number(editData?.latitude);
      const lng = Number(editData?.longitude);
      setCenter({
        lat,
        lng,
      });
      setZoom(12);
    }
  }, [editData, setValue, data?.translations]);

  const generateSlug = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const mapContainerStyle = {
    width: '100%',
    height: '200px',
  };

  const defaultCenter = { lat: 23.8103, lng: 90.4125 };
  const [center, setCenter] = useState(defaultCenter);
  const [errorMessage, setErrorMessage] = useState('');
  const [markerPosition, setMarkerPosition] = useState({
    lat: 23.8103,
    lng: 90.4125,
  });
  const [zoom, setZoom] = useState(8);
  const handleSelectItem = async (value: string, inputType: string) => {
    setValue(inputType as any, value);
    if (inputType == 'store_type' && value == 'none') {
      setValue(inputType as any, '');
    }
    if (inputType === 'area_id') {
      const selectedZone = AreaList.find((z: any) => String(z.value) === String(value));
      if (selectedZone && selectedZone.coordinates) {
        setPolygonCoords(selectedZone.coordinates);

        setMarkerPosition({
          lat: Number(selectedZone.center_latitude),
          lng: Number(selectedZone.center_longitude),
        });
        const address = await fetchAddress(
          selectedZone.coordinates[0].lat,
          selectedZone.coordinates[0].lng,
        );
        setValue('latitude', selectedZone.center_latitude);
        setValue('longitude', selectedZone.center_longitude);
        setValue('address', address);
        setZoom(12);
        const lat = Number(selectedZone.center_latitude);
        const lng = Number(selectedZone.center_longitude);

        setCenter({ lat, lng });
        setErrorMessage('');
      }
    }
  };

  const handleMarkerDrag: any = async (event: { latLng: { lat: () => any; lng: () => any } }) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    const point = new window.google.maps.LatLng(newLat, newLng);
    const polygon = new window.google.maps.Polygon({ paths: polygonCoords });
    const isInsideZone = window.google.maps.geometry.poly.containsLocation(point, polygon);
    if (isInsideZone) {
      setErrorMessage('');
      const address = await fetchAddress(newLat, newLng);
      setMarkerPosition({ lat: newLat, lng: newLng });
      setValue('latitude', newLat);
      setValue('longitude', newLng);
      setValue('address', address);
    } else {
      setErrorMessage('The marker is out of the selected zone.');
    }
  };

  const fetchAddress = async (lat: any, lng: any) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapKey}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return 'Address not found';
    } catch (error) {
      return 'Error fetching address';
    }
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapKey || '',
    libraries: ['geometry', 'drawing'], // Add any additional libraries you need
  });

  const handleNextStep = async () => {
    if (activeStep === 'general_info') {
      setActiveStep('business_plan');
    } else if (activeStep === 'business_plan') {
      if (activeTab === 'commission') {
        try {
          const values = watch();
          await onSubmit(values);
        } catch (error) {}
      } else if (activeTab === 'subscription' && subscription?.price == 0) {
        try {
          const values = watch();
          await onSubmit(values);
        } catch (error) {}
      } else {
        setActiveStep('confirm');
      }
    } else if (activeStep === 'confirm') {
      try {
        const values = watch();
        await onSubmit(values);
      } catch (error) {}
    }
  };

  const handlePreviousStep = () => {
    if (activeStep === 'confirm') {
      setActiveStep('business_plan');
    } else if (activeStep === 'business_plan') {
      setActiveStep('general_info');
    }
  };
  const handleSaveImages = (images: UploadedImage[]) => {
    setLastSelectedImages(images[0]);
    const dimensions = images[0].dimensions ?? '';
    const [width, height] = dimensions.split(' x ').map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width / height;

    if (Math.abs(aspectRatio - 4 / 1) < 0.01) {
      setImagesErrorMessage('');
      return true;
    } else {
      setImagesErrorMessage('Image must have a 4:1 aspect ratio.');
      return false;
    }
  };
  const handleSaveLogo = (images: UploadedImage[]) => {
    setLastSelectedLogo(images[0]);
    const dimensions = images[0].dimensions ?? '';
    const [width, height] = dimensions.split(' x ').map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width / height;

    if (Math.abs(aspectRatio - 1 / 1) < 0.01) {
      setLogoErrorMessage('');
      return true;
    } else {
      setLogoErrorMessage('Image must have a 1:1 aspect ratio.');
      return false;
    }
  };

  const removePreview = () => {
    setLastSelectedImages(null);
    setImagesErrorMessage('');
  };
  const removeLogo = () => {
    setLastSelectedLogo(null);
    setLogoErrorMessage('');
  };
  const router = useRouter();
  const { mutate: StoreAdd, isPending } = useSellerStoreMutation();
  const { mutate: StoreUpdate, isPending: isUpdating } = useSellerUpdateMutation();
  const storedSlug = selectedStore?.slug;
  const storeId = selectedStore?.id;
  const { getPermissions, refetch: permissionRefetch } = useGetPermissionsQuery({
    store_slug: storedSlug ?? '',
  });
  const { stores, refetch: StoreRefetch } = useStoreListQuery(
    {},
    { skip: getPermissions?.activity_scope !== 'store_level' },
  );
  const storeList = useMemo(() => (stores as any)?.stores ?? [], [stores]);

  const onSubmit = async (values: StoreFormData) => {
    const defaultData = {
      ...values,
      name: values.name_df,
      slug: values.slug,
      address: values.address_df,
      meta_title: values.meta_title_df,
      meta_description: values.meta_description_df,
    };
    const translations = multiLangData
      .filter((lang) => (values as any)[`name_${lang.id}`])
      .map((lang) => ({
        language_code: lang.id,
        name: (values as any)[`name_${lang.id}`],
        slug: (values as any)[`slug_${lang.id}`],
        address: (values as any)[`address_${lang.id}`],
        meta_title: (values as any)[`meta_title_${lang.id}`],
        meta_description: (values as any)[`meta_description_${lang.id}`],
      }));

    if (values.name_df.length > 255) {
      return toast.error('Name cannot exceed 255 characters.');
    }

    const tooLongTranslation = multiLangData.slice(1).find((lang) => {
      const name = (values as any)[`name_${lang.id}`];
      return name && name.length > 255;
    });

    if (tooLongTranslation) {
      return toast.error(
        `Translated name for language ${tooLongTranslation.label} exceeds 255 characters.`,
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (values.email && !emailRegex.test(values.email)) {
      return toast.error('Invalid email format.');
    }

    if (values.email.length > 255) {
      return toast.error('Email must be at most 255 characters.');
    }

    if (values.tax && values.tax > 99.9) {
      return toast.error('Tax value is too large.');
    }

    const submissionData = {
      ...defaultData,
      id: editData ? editData.id : '',
      translations,
      subscription_type: activeTab,
      payment_gateway: selectedPaymentOption ?? '',
      coordinates: polygonCoords,
      banner: lastSelectedImages ? lastSelectedImages?.image_id : '',
      logo: lastSelectedLogo ? lastSelectedLogo?.image_id : '',
      subscription_id: selectedCard,
    };
    return editData
      ? StoreUpdate(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              dispatch(setRefetch(true));
              dispatch(setDynamicValue('store'));
              permissionRefetch();
            },
          },
        )
      : StoreAdd(
          { ...(submissionData as any) },
          {
            onSuccess: (res) => {
              const response = res as unknown as StoreResponse;
              const id = response?.data?.data?.store_id;
              const type = response?.data?.data?.store_type;
              const slug = response?.data?.data?.slug;
              const subscriptionId = response?.data?.data?.subscription_id;
              const subscriptionHistoryId = response?.data?.data?.subscription_history_id;
              if (subscriptionId) {
                localStorage.setItem('subscription_id', subscriptionId);
              }
              if (subscriptionHistoryId) {
                localStorage.setItem('subscription_history_id', subscriptionHistoryId);
              }
              dispatch(setSelectedStore({ id, type, slug }));
              localStorage.setItem('store_id', id);
              reset();
              if (selectedPaymentOption === 'stripe') {
                handleStripePayment();
              } else if (selectedPaymentOption === 'paypal') {
                handlePaypalPayment();
              } else if (selectedPaymentOption === 'paytm') {
                handlePaytmPayment();
              } else if (selectedPaymentOption === 'razorpay') {
                handleRazorpayPayment();
              } else {
                router.push(SellerRoutes.businessPlan);
              }
              dispatch(setRefetch(true));
              dispatch(setDynamicValue('store'));
              permissionRefetch();
              StoreRefetch();
            },
          },
        );
  };

  const handleStepChange = (tab: string) => {
    setActiveStep(tab);
  };

  const handleCardClick = (optionId: string) => {
    setSelectedPaymentOption(optionId === selectedPaymentOption ? null : optionId);
  };

  useEffect(() => {
    multiLangData.forEach((lang) => {
      const nameValue = watch(`name_df`);
      if (nameValue) {
        const slug = nameValue
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        setValue(`slug`, slug);
      }
    });
  }, [multiLangData, watch, setValue]);

  const trigger = (
    <div className="hover:cursor-pointer">
      {lastSelectedImages?.img_url ? (
        <div className="relative w-32 h-32  group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedImages?.img_url}
            alt={lastSelectedImages?.name as string}
            fill
            sizes="128px"
            priority
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="border-2 w-32 h-32 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="p-2 text-blue-500 text-sm font-medium">{t('common.drag_and_drop')}</p>
          </div>
        </div>
      )}
    </div>
  );

  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={lastSelectedLogo?.name as string}
            fill
            sizes="128px"
            priority
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className=" p-2 text-blue-500 text-sm font-medium">{t('common.drag_and_drop')}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="">
          <Tabs value={activeStep} onValueChange={handleStepChange}>
            <TabsList className="bg-transparent flex flex-col justify-center items-center my-4 w-full md:w-auto">
              <Card className="text-center whitespace-normal p-2 rounded w-full md:w-auto">
                <div className="flex flex-col md:flex-row items-center  gap-0 md:gap-4 text-gray-500 dark:text-white w-full md:w-auto">
                  <TabsTrigger value="general_info">
                    <div
                      className={` flex flex-col items-center justify-center ${
                        activeStep === 'general_info'
                      } ? "text-start text-blue-500" : "text-start text-gray-500 dark:text-white"`}
                    >
                      <div className="flex items-center gap-2 ">
                        {(activeStep === 'business_plan' && watchedValues.store_type !== '') ||
                        (activeStep === 'business_plan' && watchedValues.name_df !== '') ||
                        (activeStep === 'business_plan' && watchedValues.area_id !== '') ||
                        activeStep === 'confirm' ? (
                          <VectorIcon w="18" h="18" />
                        ) : (
                          <StepIcon w="18" h="18" />
                        )}

                        <span className="text-start  text-xl font-semibold">
                          {t('label.general_info')}
                        </span>
                        <span className="hidden md:flex text-start  text-xl font-semibold">
                          <ChevronsRightIcon />
                        </span>
                      </div>
                      <div className="visible md:hidden mt-2">
                        <span className=" text-start  text-xl font-semibold">
                          <ChevronsDownIcon />
                        </span>
                      </div>
                    </div>
                  </TabsTrigger>

                  <TabsTrigger
                    value="business_plan"
                    disabled={
                      (activeStep === 'general_info' &&
                        (Object.keys(watchedValues).length === 0 ||
                          watchedValues.name_df === '')) ||
                      (activeStep === 'business_plan' && activeTab === '') ||
                      (activeStep === 'business_plan' &&
                        activeTab === 'subscription' &&
                        selectedCard === '')
                    }
                  >
                    <div
                      className={` flex flex-col items-center justify-center ${
                        activeStep === 'business_plan'
                      } ? "text-start text-blue-500" : "text-start text-gray-500 dark:text-white"`}
                    >
                      <div className="flex items-center gap-2">
                        {activeStep === 'confirm' ? (
                          <VectorIcon w="18" h="18" />
                        ) : (
                          <StepIcon w="18" h="18" />
                        )}

                        <span className="mt-[-2px] text-start text-xl font-semibold">
                          {t('label.business_plan')}
                        </span>
                        <span className="hidden md:flex text-start  text-xl font-semibold">
                          <ChevronsRightIcon />
                        </span>
                      </div>
                      <div className="visible md:hidden mt-2">
                        <span className=" text-start  text-xl font-semibold">
                          <ChevronsDownIcon />
                        </span>
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="confirm"
                    disabled={
                      Object.keys(watchedValues).length === 0 ||
                      watchedValues.name_df === '' ||
                      activeTab === '' ||
                      activeTab === 'commission' ||
                      (activeTab === 'subscription' && selectedCard === '')
                    }
                  >
                    <div
                      className={`${
                        activeStep === 'confirm'
                      } ? "text-start text-blue-500" : "text-start text-gray-500 dark:text-white"`}
                    >
                      <div className="flex items-center gap-2">
                        <StepIcon w="18" h="18" />
                        <span className="mt-[-2px] text-start text-xl font-semibold">
                          {t('label.confirm_registration')}
                        </span>
                      </div>
                    </div>
                  </TabsTrigger>
                </div>
              </Card>
            </TabsList>

            <TabsContent value="general_info">
              <>
                <div className="grid grid-cols-1 lg:grid-col-2 2xl:grid-cols-3  gap-4">
                  <Card className="2xl:col-span-2 ">
                    <CardContent className="p-2 md:p-4">
                      <p className="text-lg md:text-2xl font-medium mb-4">
                        {t('label.basic_information')}
                      </p>
                      <div>
                        <Tabs defaultValue="df" className="">
                          <TabsList
                            dir={dir}
                            className="flex justify-start bg-white dark:bg-transparent"
                          >
                            {multiLangData.map((lang) => (
                              <TabsTrigger key={lang.id} value={lang.id}>
                                {lang.label}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          <div dir={dir} className="">
                            {multiLangData.map((lang) => {
                              return (
                                <TabsContent key={lang.id} value={lang.id}>
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-sm font-medium mb-1">
                                        {t('label.store_type')}
                                        <span className="text-red-500 mx-0.5">*</span>
                                      </p>
                                      <Controller
                                        control={control}
                                        name="store_type"
                                        defaultValue={editData?.store_type || ''}
                                        render={({ field, fieldState: { error } }) => (
                                          <>
                                            <AppSelect
                                              value={field.value || ''}
                                              onSelect={(value) => {
                                                field.onChange(value);
                                                handleSelectItem(value, 'store_type');
                                              }}
                                              groups={StoreTypeList}
                                            />
                                            {error && (
                                              <p className="text-sm text-red-500 mt-1">
                                                {error.message}
                                              </p>
                                            )}
                                          </>
                                        )}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium mb-1">
                                        {t('label.name')} (
                                        {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                        <span className="text-red-500 mx-0.5">*</span>
                                      </p>
                                      <Input
                                        id={`name_${lang.id}`}
                                        {...register(`name_${lang.id}` as keyof StoreFormData)}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setValue(`name_${lang.id}` as keyof StoreFormData, value);

                                          if (lang.id === 'df') {
                                            setValue(`name_df` as keyof StoreFormData, value);
                                            setValue(
                                              `slug` as keyof StoreFormData,
                                              generateSlug(value),
                                            );
                                          }
                                        }}
                                        className="app-input"
                                        placeholder={t('place_holder.enter_name')}
                                      />
                                      {errors[`name_${lang.id}` as keyof StoreFormData] && (
                                        <p className="text-red-500 text-sm mt-1">
                                          {(errors as any)[`name_${lang.id}`]?.message}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium mb-1">{t('label.slug')}</p>
                                      <Input
                                        readOnly
                                        disabled
                                        id={`slug`}
                                        {...register(`slug` as keyof StoreFormData)}
                                        className="app-input"
                                      />
                                      {errors[`slug` as keyof StoreFormData] && (
                                        <p className="text-red-500 text-sm mt-1">
                                          {errors[`slug`]?.message}
                                        </p>
                                      )}
                                    </div>
                                    <div className={`mb-4 ${locale == 'ar' ? '' : 'pr-3'} `}>
                                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                        <span>{t('label.phone')}</span>
                                      </p>
                                      <AppPhoneNumberInput
                                        value={phoneNumber}
                                        onChange={(value) => {
                                          setPhoneNumber(value);
                                          setValue('phone', value);
                                        }}
                                      />
                                      {errors.phone && (
                                        <p className="text-red-500 text-sm mt-1">
                                          {errors.phone?.message}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium mb-1">{t('label.email')}</p>
                                      <Input
                                        type="text"
                                        id="email"
                                        {...register('email' as keyof StoreFormData)}
                                        className="app-input"
                                        placeholder={t('place_holder.enter_email')}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium mb-1">
                                        {t('label.vat_tax')} (%)
                                      </p>
                                      <Input
                                        type="number"
                                        id="tax"
                                        min={0}
                                        maxLength={5}
                                        defaultValue={editData?.tax ?? 0}
                                        {...register('tax' as keyof StoreFormData, {
                                          valueAsNumber: true,
                                          validate: (value) => {
                                            if (value === undefined) return true;
                                            return (
                                              value.toString().length <= 5 ||
                                              'Tax must be up to 5 digits'
                                            );
                                          },
                                        })}
                                        onFocus={(e) => {
                                          if (e.target.value === '0') {
                                            e.target.select();
                                            e.target.value = '';
                                          } else {
                                            e.target.select();
                                          }
                                        }}
                                        className="app-input"
                                        placeholder={t('place_holder.enter_tax')}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium mb-1">
                                        {t('label.vat_tax_number')}
                                      </p>
                                      <Input
                                        type="text"
                                        id="tax_number"
                                        defaultValue={
                                          editData?.tax_number ? editData?.tax_number : ''
                                        }
                                        {...register('tax_number' as keyof StoreFormData)}
                                        className="app-input"
                                        placeholder={t('place_holder.enter_tax_number')}
                                      />
                                    </div>
                                    <div className=" grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium mb-1">
                                          {t('label.opening_time')}
                                        </p>
                                        <Input
                                          type="time"
                                          id="opening_time"
                                          {...register('opening_time')}
                                          className="app-input flex flex-col"
                                          placeholder={t('place_holder.enter_opening_time')}
                                        />
                                        {errors.opening_time && (
                                          <p className="text-red-500 text-sm">
                                            {errors.opening_time.message}
                                          </p>
                                        )}
                                      </div>

                                      <div>
                                        <p className="text-sm font-medium mb-1">
                                          {t('label.closing_time')}
                                        </p>
                                        <Input
                                          type="time"
                                          id="closing_time"
                                          {...register('closing_time')}
                                          className="app-input flex flex-col"
                                          placeholder={t('place_holder.enter_closing_time')}
                                        />
                                        {errors.closing_time && (
                                          <p className="text-red-500 text-sm">
                                            {errors.closing_time.message}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <p className="text-sm font-medium mb-1">
                                        {t('label.meta_title')} (
                                        {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                      </p>
                                      <Input
                                        id={`meta_title_${lang.id}`}
                                        {...register(
                                          `meta_title_${lang.id}` as keyof StoreFormData,
                                        )}
                                        className="app-input"
                                        placeholder={t('place_holder.enter_meta_title')}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium mb-1">
                                        {t('label.meta_description')} (
                                        {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                      </p>
                                      <Textarea
                                        id={`meta_description_${lang.id}`}
                                        {...register(
                                          `meta_description_${lang.id}` as keyof StoreFormData,
                                        )}
                                        className="app-input"
                                        placeholder={t('place_holder.enter_meta_description')}
                                      />
                                    </div>
                                  </div>
                                </TabsContent>
                              );
                            })}
                          </div>
                        </Tabs>
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <Card className="2xl:col-span-2">
                      <CardContent className="p-4">
                        <p className="text-lg md:text-2xl font-medium mb-4">{t('label.image')}</p>

                        <div className="flex flex-col md:flex-row items-start gap-4">
                          <div>
                            <p className="text-sm font-medium mb-1 ">{t('label.bg_image')}</p>
                            <div className="relative flex align-start gap-4">
                              <div className="relative w-32">
                                <PhotoUploadModal
                                  trigger={trigger}
                                  isMultiple={false}
                                  onSave={handleSaveImages}
                                  usageType="store"
                                  selectedImage={lastSelectedImages}
                                />
                                {lastSelectedImages?.image_id && (
                                  <Cancel
                                    customClass="absolute top-0 right-0 m-1"
                                    onClick={(event: { stopPropagation: () => void }) => {
                                      event.stopPropagation();
                                      removePreview();
                                    }}
                                  />
                                )}
                                {errorImagesMessage && (
                                  <p className="text-red-500 text-sm mt-1">{errorImagesMessage}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="">
                            <p className="text-sm font-medium mb-1">{t('label.logo')} </p>
                            <div className="relative flex align-start gap-4">
                              <div className="relative w-32">
                                <PhotoUploadModal
                                  trigger={triggerLogo}
                                  isMultiple={false}
                                  onSave={handleSaveLogo}
                                  usageType="store"
                                  selectedImage={lastSelectedLogo}
                                />
                                {lastSelectedLogo?.image_id && (
                                  <Cancel
                                    customClass="absolute top-0 right-0 m-1"
                                    onClick={(event: { stopPropagation: () => void }) => {
                                      event.stopPropagation();
                                      removeLogo();
                                    }}
                                  />
                                )}
                                {errorLogoMessage && (
                                  <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="mt-4 ">
                      <CardContent className="p-4">
                        <div className="">
                          <div>
                            <p className="text-lg md:text-2xl font-medium mb-4">
                              {t('label.address_details')}
                            </p>
                            <div>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium mb-1">
                                    {t('label.area')}
                                    <span className="text-red-500 mx-0.5">*</span>
                                  </p>
                                  <Controller
                                    control={control}
                                    name="area_id"
                                    defaultValue={
                                      editData?.area?.id ? String(editData?.area?.id) : ''
                                    }
                                    render={({ field }) => (
                                      <>
                                        <AppSelect
                                          value={field.value || ''}
                                          onSelect={(value) => {
                                            field.onChange(value);
                                            handleSelectItem(value, 'area_id');
                                          }}
                                          groups={AreaList}
                                        />
                                      </>
                                    )}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">{t('label.latitude')}</p>
                                  <Input
                                    disabled
                                    defaultValue={editData?.area?.center_latitude}
                                    type="text"
                                    id="latitude"
                                    {...register('latitude' as keyof StoreFormData)}
                                    className="app-input"
                                    placeholder="Enter latitude"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">{t('label.longitude')}</p>
                                  <Input
                                    disabled
                                    defaultValue={editData?.area?.center_longitude}
                                    type="text"
                                    id="longitude"
                                    {...register('longitude' as keyof StoreFormData)}
                                    className="app-input"
                                    placeholder="Enter longitude"
                                  />
                                </div>
                                {errorMessage && (
                                  <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            {isLoaded && isMapEnabled && googleMapKey ? (
                              <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={center}
                                zoom={zoom}
                              >
                                <>
                                  {polygonCoords?.length > 0 && (
                                    <Polygon
                                      path={polygonCoords}
                                      options={{
                                        fillColor: '#2196F3',
                                        strokeColor: '#2196F3',
                                        editable: false,
                                        draggable: false,
                                      }}
                                    />
                                  )}

                                  <Marker
                                    position={markerPosition}
                                    draggable={true}
                                    onDragEnd={handleMarkerDrag}
                                  />
                                  <DrawingManager
                                    options={{
                                      drawingControl: true,
                                      drawingControlOptions: {
                                        drawingModes: [
                                          'polygon' as google.maps.drawing.OverlayType,
                                        ],
                                      },
                                      polygonOptions: {
                                        fillColor: '#2196F3',
                                        strokeColor: '#2196F3',
                                        editable: true,
                                      },
                                    }}
                                  />
                                </>
                              </GoogleMap>
                            ) : (
                              <Loader customClass="mt-10" size="large" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            </TabsContent>
            <TabsContent value="business_plan">
              <>
                <div>
                  <BusinessPlanSection
                    register={register}
                    selectedCard={selectedCard}
                    setSelectedCard={setSelectedCard}
                    setSubscription={setSubscription}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>
              </>
            </TabsContent>
            <TabsContent value="confirm">
              <>
                {successMessage ? (
                  <Card className="p-4">
                    <div className="w-full flex flex-col items-center justify-center text-blue-500 font-bold ">
                      <CircleCheckBig width={50} height={50} />
                      <p className="mt-4 text-xl font-bold text-gray-500 dark:text-white">
                        Store Successfully Created{' '}
                      </p>
                      <h1 className="text-2xl mt-4 font-semibold text-black dark:text-white flex items-center gap-2">
                        <Link
                          className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white"
                          href={SellerRoutes.store}
                        >
                          Go to Store List
                        </Link>
                      </h1>
                    </div>
                  </Card>
                ) : (
                  <div className="w-full flex items-center justify-center">
                    <Card className="p-4 w-full">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-blue-500">
                          {t('label.payment_method')}
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7  gap-2 md:gap-8">
                        {beforeId5.map((option: any) => (
                          <PaymentOptionCard
                            key={option.id}
                            isSelected={selectedPaymentOption === option.slug}
                            onClick={() => handleCardClick(option.slug)}
                            imageSrc={option.image_url}
                            title={option.name}
                          />
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
              </>
            </TabsContent>
          </Tabs>

          <div className="mt-4 space-x-4 sticky bottom-0 rounded-lg shadow w-full bg-white dark:bg-[#1e293b] p-4 flex items-center">
            <Button
              onClick={handlePreviousStep}
              type="button"
              variant="outline"
              className="app-button"
              disabled={activeStep === 'general_info' || isPending || isUpdating}
            >
              {t('button.previous')}
            </Button>

            <Button
              onClick={handleNextStep}
              type="button"
              variant="outline"
              className="app-button"
              //@ts-ignore
              disabled={
                (activeStep === 'general_info' &&
                  (Object.keys(watchedValues).length === 0 || watchedValues.name_df === '')) ||
                (activeStep === 'business_plan' && activeTab === '') ||
                (activeStep === 'business_plan' &&
                  activeTab === 'subscription' &&
                  selectedCard === '') ||
                watchedValues?.longitude === '' ||
                watchedValues?.latitude === '' ||
                watchedValues?.store_type === '' ||
                errorMessage ||
                isPending ||
                isUpdating
              }
            >
              {isPending || isUpdating ? (
                <Loader size="small" />
              ) : (activeStep === 'business_plan' && activeTab === 'commission') ||
                (activeStep === 'business_plan' &&
                  activeTab === 'subscription' &&
                  subscription?.price == 0) ||
                activeStep === 'confirm' ? (
                t('button.submit')
              ) : (
                t('button.next')
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
