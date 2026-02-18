'use client';
import CloudIcon from '@/assets/icons/CloudIcon';
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
import GlobalImageLoader from '@/lib/imageLoader';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { useAreaDropdownQuery } from '@/modules/common/area/area.action';
import { useStoreTypeQuery } from '@/modules/common/store-type/store-type.action';
import { useSellerUpdateMutation } from '@/modules/seller-section/store/store.action';
import { StoreFormData, storeSchema } from '@/modules/seller-section/store/store.schema';
import { useAppDispatch } from '@/redux/hooks';
import { setDynamicValue, setRefetch } from '@/redux/slices/refetchSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { DrawingManager, GoogleMap, Marker, Polygon } from '@react-google-maps/api';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import AppPhoneNumberInput from '../../common/AppPhoneNumberInput';
import Cancel from '../../custom-icons/Cancel';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';
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

const googleMapLibraries: ('drawing' | 'geometry' | 'places' | 'visualization')[] = ['drawing'];

export default function UpdateStoreForm({ data }: any) {
  const dispatch = useAppDispatch();
  const multiLangData: LangType[] = useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const editData = data;

  const {
    isLoaded,
    isEnabled: isMapEnabled,
    apiKey: googleMapKey,
    isPending: isMapSettingsPending,
    loadError,
  } = useGoogleMaps();

  const [polygonCoords, setPolygonCoords] = useState<any>(null);

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
  });
  const watchedValues = watch();
  const t = useTranslations();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [lastSelectedImages, setLastSelectedImages] = useState<any>(null);
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>('');
  const [errorImagesMessage, setImagesErrorMessage] = useState<string>('');
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string | null>(null);
  const { AreaDropdownList } = useAreaDropdownQuery({});
  const { storeType } = useStoreTypeQuery({});
  let AreaList = (AreaDropdownList as any) || [];
  let StoreTypeList = (storeType as any) || [];
  const formatTime = (time: string) => {
    if (!time) return '';
    return time.split(':').slice(0, 2).join(':');
  };

  useEffect(() => {
    if (editData) {
      let ariaId = String(editData?.area?.id);
      setValue('name_df', editData?.name ?? '');
      setValue('meta_title_df', editData?.meta_title ?? '');
      setValue('meta_description_df', editData?.meta_description ?? '');
      setValue('slug', editData?.slug ?? '');
      setValue('phone', editData?.phone ?? '');
      setPhoneNumber(editData?.phone ?? '');
      setValue('area_id', ariaId ?? '');
      setValue('email', editData?.email ?? '');
      setValue('opening_time', formatTime(editData?.opening_time ?? ''));
      setValue('closing_time', formatTime(editData?.closing_time ?? ''));
      setValue('address_df', editData?.address ?? '');
      setValue('store_type', editData?.store_type ?? '');
      setActiveTab(editData?.subscription_type ?? '');
      setSelectedCard(editData?.subscription_id ?? '');

      const translations = safeObject(editData?.translations);
      Object.keys(translations).forEach((language) => {
        const translation = (translations as any)[language];
        setValue(`slug_${language}` as keyof StoreFormData, translation?.slug ?? '');
        setValue(`name_${language}` as keyof StoreFormData, translation?.name ?? '');
        setValue(`address_${language}` as keyof StoreFormData, translation?.address ?? '');
        setValue(
          `meta_description_${language}` as keyof StoreFormData,
          translation?.meta_description ?? '',
        );
        setValue(
          `meta_description_${language}` as keyof StoreFormData,
          translation?.meta_description ?? '',
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
      const lat = Number(editData?.latitude);
      const lng = Number(editData?.longitude);
      const hasFiniteCoords = Number.isFinite(lat) && Number.isFinite(lng);
      const safeLat = hasFiniteCoords ? lat : defaultCenter.lat;
      const safeLng = hasFiniteCoords ? lng : defaultCenter.lng;
      setMarkerPosition({
        lat: safeLat,
        lng: safeLng,
      });
      setCenter({
        lat: safeLat,
        lng: safeLng,
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
    if (inputType === 'area_id') {
      const selectedZone = AreaList.find((z: any) => String(z.value) === String(value));
      if (selectedZone && selectedZone.coordinates) {
        const rawLat = Number(selectedZone.coordinates?.[0]?.lat);
        const rawLng = Number(selectedZone.coordinates?.[0]?.lng);
        if (!Number.isFinite(rawLat) || !Number.isFinite(rawLng)) {
          setErrorMessage('Selected area coordinates are invalid.');
          return;
        }
        setPolygonCoords(selectedZone.coordinates);
        setMarkerPosition({
          lat: rawLat,
          lng: rawLng,
        });
        const address = await fetchAddress(rawLat, rawLng);
        setValue('latitude', String(rawLat));
        setValue('longitude', String(rawLng));
        setValue('address', address);
        setZoom(12);
        const lat = rawLat;
        const lng = rawLng;

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

  const handleNextStep = async () => {
    try {
      const values = watch();
      await onSubmit(values);
    } catch (error) {}
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
  const { mutate: StoreUpdate, isPending: isUpdating } = useSellerUpdateMutation();
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
      payment_gateway: selectedPaymentOption,
      coordinates: polygonCoords,
      banner: lastSelectedImages ? lastSelectedImages?.image_id : '',
      logo: lastSelectedLogo ? lastSelectedLogo?.image_id : '',
      subscription_id: selectedCard,
    };

    return StoreUpdate(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          reset();
          dispatch(setRefetch(true));
          dispatch(setDynamicValue('store'));
        },
      },
    );
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
            className="w-60 md:w-80 h-32 md:h-48 border dark:border-gray-50 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5]  border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="border-2 w-32 h-32 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-4 text-blue-500 text-sm font-medium p-1">
              {t('common.drag_and_drop')}
            </p>
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
            className="w-full h-full border dark:border-gray-50 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5]  border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-4 text-blue-500 text-sm font-medium p-1">
              {t('common.drag_and_drop')}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="">
          <>
            <div className="grid grid-cols-1 lg:grid-col-2 2xl:grid-cols-3  gap-4">
              <Card className="col-span-1 2xl:col-span-2 ">
                <CardContent className="p-2 md:p-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <p className="text-lg md:text-2xl font-medium mb-4">
                      {t('label.basic_information')}
                    </p>
                    <p className="flex items-center text-lg md:text-xl font-medium mb-4">
                      {t('label.business_plan')}:{' '}
                      <span className="mx-2 p-2 bg-teal-50 text-teal-500 text-lg rounded capitalize font-semibold">
                        {editData?.subscription_type}
                      </span>
                    </p>
                  </div>
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
                                  </p>
                                  <Controller
                                    control={control}
                                    name="store_type"
                                    defaultValue={editData?.store_type || ''}
                                    render={({ field }) => (
                                      <>
                                        <AppSelect
                                          value={field.value || ''}
                                          onSelect={(value) => {
                                            field.onChange(value);
                                            handleSelectItem(value, 'store_type');
                                          }}
                                          groups={StoreTypeList}
                                        />
                                      </>
                                    )}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">
                                    {t('label.name')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
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
                                      {(errors as any)[`slug`]?.message}
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
                                      setValue('phone', value); // Sync with React Hook Form
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
                                    defaultValue={editData?.tax_number ? editData?.tax_number : ''}
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
                                    {...register(`meta_title_${lang.id}` as keyof StoreFormData)}
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
                              <p className="text-sm font-medium mb-1">{t('label.area')}</p>
                              <Controller
                                control={control}
                                name="area_id"
                                defaultValue={editData?.area?.id ? String(editData?.area?.id) : ''}
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
                                placeholder={t('place_holder.enter_latitude')}
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
                                placeholder={t('place_holder.enter_longitude')}
                              />
                            </div>
                            {errorMessage && (
                              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        {isMapSettingsPending || (isMapEnabled && googleMapKey && !isLoaded) ? (
                          <Loader customClass="mt-10" size="large" />
                        ) : !isMapEnabled ? (
                          <p className="text-sm text-amber-600">
                            Google Map is disabled in system settings.
                          </p>
                        ) : !googleMapKey ? (
                          <p className="text-sm text-amber-600">
                            Google Map API key is missing.
                          </p>
                        ) : loadError ? (
                          <p className="text-sm text-red-500">
                            Google Map failed to load. Check API key/domain restrictions.
                          </p>
                        ) : (
                          <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={zoom}>
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
                                  drawingModes: ['polygon' as google.maps.drawing.OverlayType],
                                },
                                polygonOptions: {
                                  fillColor: '#2196F3',
                                  strokeColor: '#2196F3',
                                  editable: true,
                                },
                              }}
                            />
                          </GoogleMap>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>

          <div className="mt-4 space-x-4 sticky bottom-0 rounded-lg shadow w-full bg-white dark:bg-[#1e293b] p-4 flex items-center">
            <Button
              onClick={handleNextStep}
              type="button"
              variant="outline"
              className="app-button"
              //@ts-ignore
              disabled={
                Object.keys(watchedValues).length === 0 ||
                watchedValues.name_df === '' ||
                watchedValues?.longitude === '' ||
                watchedValues?.latitude === '' ||
                errorMessage
              }
            >
              {isUpdating ? <Loader size="small" /> : t('button.update')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
