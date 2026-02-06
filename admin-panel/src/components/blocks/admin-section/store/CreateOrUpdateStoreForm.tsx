// =============================================================
// File: src/components/blocks/admin-section/store/CreateOrUpdateStoreForm.tsx
// FINAL — Store Form (Form + JSON) — SAME PATTERN as TagForm/SliderForm
// FIXES:
// - setValueAny MUST wrap real RHF setValue (no hacks)  ✅
// - AppSelect groups: AppSelectOption[] (flat)
// - Seller / StoreType / Area options normalize
// - Area select keeps side-effects (polygon+marker+address)
// - Schema aligned with storeSchema (phone required; opening/closing HH:mm)
// =============================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

import { useAreaDropdownQuery } from '@/modules/common/area/area.action';
import { useStoreTypeQuery } from '@/modules/common/store-type/store-type.action';
import { useSellerQuery } from '@/modules/admin-section/seller/seller.action';
import {
  useAdminStoreMutation,
  useAdminStoreUpdateMutation,
} from '@/modules/admin-section/store/store.action';
import { StoreFormData, storeSchema } from '@/modules/admin-section/store/store.schema';

import { useAppDispatch } from '@/redux/hooks';
import { setDynamicValue, setRefetch } from '@/redux/slices/refetchSlice';

import { DrawingManager, GoogleMap, Marker, Polygon } from '@react-google-maps/api';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';
import CloudIcon from '@/assets/icons/CloudIcon';
import GlobalImageLoader from '@/lib/imageLoader';
import Cancel from '../../custom-icons/Cancel';
import AppPhoneNumberInput from '../../common/AppPhoneNumberInput';

// JSON scaffold stack (standard)
import {
  AdminI18nJsonPanel,
  buildI18nJsonFromFlatValues,
  applyI18nJsonToFlatForm,
  makeRHFSetValueAny, safeObject,
  ensureLangKeys,
  useFormI18nScaffold,
  initI18nFlatFormFromEntity,
} from '@/lib/json';
import type {  LangKeys, ViewMode, LangType} from '@/lib/json';



const I18N_FIELDS = ['name', 'meta_title', 'meta_description'] as const;

function safeStr(x: unknown) {
  return String(x ?? '').trim();
}

function hasAnyI18nValue(values: any, langId: string) {
  const n = safeStr(values?.[`name_${langId}`]);
  const mt = safeStr(values?.[`meta_title_${langId}`]);
  const md = safeStr(values?.[`meta_description_${langId}`]);
  return !!(n || mt || md);
}

function generateSlug(str: string) {
  return String(str ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** AppSelect expects flat options array */
type AppSelectOption = { value: string; label: string; [k: string]: any };

function pickValue(x: any): string {
  return String(
    x?.value ??
      x?.id ??
      x?._id ??
      x?.uuid ??
      x?.key ??
      x?.seller_id ??
      x?.store_seller_id ??
      x?.store_type_id ??
      x?.area_id ??
      '',
  );
}

function pickLabel(x: any): string {
  return String(
    x?.label ??
      x?.name ??
      x?.title ??
      x?.text ??
      x?.seller_name ??
      x?.store_type ??
      x?.area_name ??
      '',
  );
}

/** Handles:
 * - flat list [{id,name}] / [{value,label}]
 * - grouped list [{label, options:[...]}]
 * - weird API shapes (message/data)
 */
function normalizeOptions(input: any): AppSelectOption[] {
  const list = Array.isArray(input)
    ? input
    : Array.isArray(input?.data)
      ? input.data
      : Array.isArray(input?.message)
        ? input.message
        : [];

  // grouped -> flatten
  const flat = list.some((x: any) => Array.isArray(x?.options))
    ? list.flatMap((g: any) => (Array.isArray(g?.options) ? g.options : []))
    : list;

  return (Array.isArray(flat) ? flat : [])
    .map((x: any) => {
      const value = pickValue(x);
      const label = pickLabel(x);
      if (!value || !label) return null;
      return { ...x, value, label } as AppSelectOption;
    })
    .filter(Boolean) as AppSelectOption[];
}

function toSelectValue(v: any) {
  // AppSelect bazı yerlerde string döndürüyor, bazı yerde option döndürebiliyor
  return String(v?.value ?? v ?? '');
}

export default function CreateOrUpdateStoreForm({ data }: { data?: any }) {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const allLangs = useMemo(
    () => (Array.isArray(multiLang) ? (multiLang as LangType[]) : []),
    [],
  );

  const editData = (data?.data ?? data?.store ?? data) as any;

  const [viewMode, setViewMode] = useState<ViewMode>('form');

  // Google map settings - use global context
  const { isLoaded, isEnabled: isMapEnabled, apiKey: googleMapKey } = useGoogleMaps();

  // RHF
  const {
    control,
    register,
    setValue, // ✅ REAL setValue (required)
    reset,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      // DF contract
      name_df: '',
      meta_title_df: '',
      meta_description_df: '',
      address_df: '',

      // globals
      slug: '',
      phone: '', // schema: required (nonempty)
      email: '',
      longitude: '',
      latitude: '',
      address: '',
      tax: undefined,
      tax_number: '',
      opening_time: '',
      closing_time: '',
      area_id: '',
      store_seller_id: '',
      store_type: '',
      time_type: '',
      amount: '',
    } as any,
  });

  // ✅ one true wrapper (NO hacks)
  const setValueAny = useMemo(() => makeRHFSetValueAny<StoreFormData>(setValue), [setValue]);

  // ✅ i18n scaffold (df excluded)
  const i18n = useFormI18nScaffold<StoreFormData>({
    languages: allLangs,
    excludeLangIds: ['df'],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: 'name_df', srcField: (l) => `name_${l}`, validate: true },
        { dfField: 'meta_title_df', srcField: (l) => `meta_title_${l}` },
        { dfField: 'meta_description_df', srcField: (l) => `meta_description_${l}` },
        { dfField: 'address_df', srcField: () => 'address' },
      ],
    },
    extraWatchNames: [
      'slug',
      'phone',
      'email',
      'longitude',
      'latitude',
      'tax',
      'tax_number',
      'opening_time',
      'closing_time',
      'area_id',
      'store_seller_id',
      'store_type',
      'time_type',
      'amount',
      'address',
    ],
  });

  const { uiLangs, firstUILangId, translationsJson, handleTranslationsJsonChange, rebuildJsonNow } =
    i18n;

  // ✅ controlled language tabs
  const [activeLangId, setActiveLangId] = useState<string>(
    uiLangs.find((l) => l.id === locale)?.id ?? firstUILangId,
  );

  useEffect(() => {
    const exists = uiLangs.some((l) => l.id === activeLangId);
    if (!exists) setActiveLangId(firstUILangId);
  }, [uiLangs, activeLangId, firstUILangId]);

  // Minimal watches
  const watchedNameDf = useWatch({ control, name: 'name_df' as any }) as string;
  const watchedSellerId = useWatch({ control, name: 'store_seller_id' as any }) as string;
  const watchedLongitude = useWatch({ control, name: 'longitude' as any });
  const watchedLatitude = useWatch({ control, name: 'latitude' as any });

  // Dropdown queries
  const { AreaDropdownList } = useAreaDropdownQuery({});
  const { storeType } = useStoreTypeQuery({});
  const { sellerList } = useSellerQuery({});

  // ✅ AppSelect flat arrays
  const AreaOptions = useMemo(() => normalizeOptions(AreaDropdownList), [AreaDropdownList]);
  const StoreTypeOptions = useMemo(() => normalizeOptions(storeType), [storeType]);
  const SellerOptions = useMemo(() => normalizeOptions(sellerList), [sellerList]);

  // Map UI state
  const [polygonCoords, setPolygonCoords] = useState<any>(null);
  const [center, setCenter] = useState({ lat: 23.8103, lng: 90.4125 });
  const [markerPosition, setMarkerPosition] = useState({ lat: 23.8103, lng: 90.4125 });
  const [zoom, setZoom] = useState(8);
  const [errorMessage, setErrorMessage] = useState('');

  // Images
  const [lastSelectedImages, setLastSelectedImages] = useState<any>(null);
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>('');
  const [errorImagesMessage, setImagesErrorMessage] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const formatTime = (time: string) => (!time ? '' : String(time).split(':').slice(0, 2).join(':'));
  const mapContainerStyle = { width: '100%', height: '280px' as const };

  const fetchAddress = async (lat: any, lng: any) => {
    if (!googleMapKey) return 'Address not found';
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapKey}`,
      );
      if (!response.ok) throw new Error('Failed to fetch address');
      const json = await response.json();
      const formatted = json?.results?.[0]?.formatted_address;
      return formatted ? String(formatted) : 'Address not found';
    } catch {
      return 'Error fetching address';
    }
  };

  // ✅ INIT (DB -> FORM)
  useEffect(() => {
    if (!editData || !editData?.id) {
      setActiveLangId(uiLangs.find((l) => l.id === locale)?.id ?? firstUILangId);
      rebuildJsonNow();
      return;
    }

    setValueAny('slug', editData?.slug ?? '', { shouldDirty: false, shouldTouch: false });
    setValueAny('phone', editData?.phone ?? '', { shouldDirty: false, shouldTouch: false });
    setPhoneNumber(editData?.phone ?? '');
    setValueAny('email', editData?.email ?? '', { shouldDirty: false, shouldTouch: false });

    setValueAny('longitude', String(editData?.longitude ?? ''), { shouldDirty: false, shouldTouch: false });
    setValueAny('latitude', String(editData?.latitude ?? ''), { shouldDirty: false, shouldTouch: false });

    const taxNum =
      editData?.tax === null || editData?.tax === undefined ? undefined : Number(editData.tax);
    setValueAny('tax', Number.isFinite(taxNum as any) ? taxNum : undefined, {
      shouldDirty: false,
      shouldTouch: false,
    });

    setValueAny('tax_number', editData?.tax_number ?? '', { shouldDirty: false, shouldTouch: false });

    setValueAny('opening_time', editData?.opening_time ? formatTime(editData.opening_time) : '', {
      shouldDirty: false,
      shouldTouch: false,
    });
    setValueAny('closing_time', editData?.closing_time ? formatTime(editData.closing_time) : '', {
      shouldDirty: false,
      shouldTouch: false,
    });

    // seller/store_type/area
    const sellerId =
      editData?.seller_id ??
      editData?.store_seller_id ??
      editData?.seller?.id ??
      editData?.seller?.seller_id ??
      '';
    setValueAny('store_seller_id', sellerId ? String(sellerId) : '', { shouldDirty: false, shouldTouch: false });

    const storeTypeId =
      editData?.store_type ??
      editData?.store_type_id ??
      editData?.type?.id ??
      editData?.type_id ??
      '';
    setValueAny('store_type', storeTypeId ? String(storeTypeId) : '', { shouldDirty: false, shouldTouch: false });

    const areaId = editData?.area?.id ?? editData?.area_id ?? '';
    setValueAny('area_id', areaId ? String(areaId) : '', { shouldDirty: false, shouldTouch: false });

    const addr = String(editData?.address ?? '');
    setValueAny('address', addr, { shouldDirty: false, shouldTouch: false });
    setValueAny('address_df', addr, { shouldDirty: false, shouldTouch: false });

    // images
    if (editData?.banner) {
      setLastSelectedImages({
        image_id: editData?.banner,
        img_url: editData?.banner_url ? editData.banner_url : '/images/no-image.png',
        name: 'banner',
      });
    } else setLastSelectedImages(null);

    if (editData?.logo) {
      setLastSelectedLogo({
        image_id: editData?.logo,
        img_url: editData?.logo_url ? editData.logo_url : '/images/no-image.png',
        name: 'logo',
      });
    } else setLastSelectedLogo(null);

    setPolygonCoords(editData?.area?.coordinates ?? null);

    const lat = Number(editData?.latitude);
    const lng = Number(editData?.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setMarkerPosition({ lat, lng });
      setCenter({ lat, lng });
      setZoom(12);
    }

    setLogoErrorMessage('');
    setImagesErrorMessage('');
    setErrorMessage('');

    initI18nFlatFormFromEntity({
      editData,
      firstUILangId,
      uiLangs,
      i18nFields: I18N_FIELDS,
      setValueAny,
      after: rebuildJsonNow,
    });

    setActiveLangId(uiLangs.find((l) => l.id === locale)?.id ?? firstUILangId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, firstUILangId]);

  // JSON mode -> rebuild
  useEffect(() => {
    if (viewMode !== 'json') return;
    rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // slug auto
  useEffect(() => {
    if (!watchedNameDf) return;
    setValueAny('slug', generateSlug(watchedNameDf), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  }, [watchedNameDf, setValueAny]);

  const onJsonChange = (next: any) => {
    handleTranslationsJsonChange(next);
  };

  const ensureDfFromFirstLang = () => {
    const v: any = getValues();

    const name = safeStr(v?.[`name_${firstUILangId}`]);
    const mt = safeStr(v?.[`meta_title_${firstUILangId}`]);
    const md = safeStr(v?.[`meta_description_${firstUILangId}`]);

    if (name && !safeStr(v.name_df)) {
      setValueAny('name_df', name, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }
    if (mt && !safeStr(v.meta_title_df)) {
      setValueAny('meta_title_df', mt, { shouldDirty: true, shouldTouch: true });
    }
    if (md && !safeStr(v.meta_description_df)) {
      setValueAny('meta_description_df', md, { shouldDirty: true, shouldTouch: true });
    }

    const finalName = safeStr(getValues('name_df' as any));
    if (finalName && !safeStr(getValues('slug' as any))) {
      setValueAny('slug', generateSlug(finalName), { shouldDirty: true, shouldTouch: true });
    }
  };

  // ✅ AREA select with side-effects
  const handleAreaSelect = async (value: string) => {
    setValueAny('area_id' as any, value as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    const selected = AreaOptions.find((o) => String(o.value) === String(value));
    const coords = (selected as any)?.coordinates ?? (selected as any)?.data?.coordinates ?? null;

    if (Array.isArray(coords) && coords.length > 0) {
      setPolygonCoords(coords);

      const lat = coords?.[0]?.lat;
      const lng = coords?.[0]?.lng;

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setMarkerPosition({ lat, lng });
        setCenter({ lat, lng });
        setZoom(12);

        const address = await fetchAddress(lat, lng);

        setValueAny('latitude', String(lat), { shouldDirty: true, shouldTouch: true });
        setValueAny('longitude', String(lng), { shouldDirty: true, shouldTouch: true });
        setValueAny('address', String(address), { shouldDirty: true, shouldTouch: true });
        setValueAny('address_df', String(address), { shouldDirty: true, shouldTouch: true });
      }
    }
  };

  const handleMarkerDrag = async (event: { latLng: { lat: () => any; lng: () => any } }) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();

    if (!polygonCoords?.length) return;

    const point = new window.google.maps.LatLng(newLat, newLng);
    const polygon = new window.google.maps.Polygon({ paths: polygonCoords });

    const isInsideZone = window.google.maps.geometry.poly.containsLocation(point, polygon);
    if (!isInsideZone) {
      setErrorMessage('The marker is out of the selected zone.');
      return;
    }

    setErrorMessage('');
    const address = await fetchAddress(newLat, newLng);

    setMarkerPosition({ lat: newLat, lng: newLng });
    setValueAny('latitude', String(newLat), { shouldDirty: true, shouldTouch: true });
    setValueAny('longitude', String(newLng), { shouldDirty: true, shouldTouch: true });
    setValueAny('address', String(address), { shouldDirty: true, shouldTouch: true });
    setValueAny('address_df', String(address), { shouldDirty: true, shouldTouch: true });
  };

  const handleSaveImages = (images: UploadedImage[]) => {
    setLastSelectedImages(images?.[0] ?? null);
    const dimensions = images?.[0]?.dimensions ?? '';
    const [w, h] = String(dimensions)
      .split(' x ')
      .map((dim) => parseInt(dim.trim(), 10));
    const ratio = w && h ? w / h : 0;
    if (Math.abs(ratio - 4 / 1) < 0.01) {
      setImagesErrorMessage('');
      return true;
    }
    setImagesErrorMessage('Image must have a 4:1 aspect ratio.');
    return false;
  };

  const handleSaveLogo = (images: UploadedImage[]) => {
    setLastSelectedLogo(images?.[0] ?? null);
    const dimensions = images?.[0]?.dimensions ?? '';
    const [w, h] = String(dimensions)
      .split(' x ')
      .map((dim) => parseInt(dim.trim(), 10));
    const ratio = w && h ? w / h : 0;
    if (Math.abs(ratio - 1 / 1) < 0.01) {
      setLogoErrorMessage('');
      return true;
    }
    setLogoErrorMessage('Image must have a 1:1 aspect ratio.');
    return false;
  };

  const removePreview = () => {
    setLastSelectedImages(null);
    setImagesErrorMessage('');
  };
  const removeLogo = () => {
    setLastSelectedLogo(null);
    setLogoErrorMessage('');
  };

  // mutations
  const storeHook = useAdminStoreMutation() as any;
  const updateHook = useAdminStoreUpdateMutation() as any;
  const isSaving = !!storeHook?.isPending || !!updateHook?.isPending;

  const onSubmit = async () => {
    if (viewMode === 'json') ensureDfFromFirstLang();

    const v: any = getValues();

    if (!safeStr(v.name_df)) return toast.error('Please Select Store name ');
    if (!safeStr(v.store_seller_id)) return toast.error('Please Select Seller ');
    if (!safeStr(v.phone)) return toast.error('Contact number is required');
    if (!safeStr(v.longitude) || !safeStr(v.latitude)) return toast.error('Please select location on map');

    const rootName = safeStr(v.name_df) || safeStr(v?.[`name_${firstUILangId}`]);
    const rootMetaTitle = safeStr(v.meta_title_df) || safeStr(v?.[`meta_title_${firstUILangId}`]);
    const rootMetaDesc =
      safeStr(v.meta_description_df) || safeStr(v?.[`meta_description_${firstUILangId}`]);

    const defaultData: any = {
      ...v,
      id: editData?.id ?? '',

      name: rootName,
      meta_title: rootMetaTitle,
      meta_description: rootMetaDesc,

      address: safeStr(v.address_df ?? v.address),

      longitude: safeStr(v.longitude),
      latitude: safeStr(v.latitude),

      banner: lastSelectedImages?.image_id ?? '',
      logo: lastSelectedLogo?.image_id ?? '',

      subscription_type: 'commission',
      coordinates: polygonCoords,
      multipart: true,
    };

    const translations = (uiLangs ?? [])
      .filter((lang) => lang.id !== firstUILangId)
      .filter((lang) => hasAnyI18nValue(v, lang.id))
      .map((lang) => ({
        language_code: lang.id,
        name: safeStr(v?.[`name_${lang.id}`]),
        meta_title: safeStr(v?.[`meta_title_${lang.id}`]),
        meta_description: safeStr(v?.[`meta_description_${lang.id}`]),
      }));

    const translations_json = ensureLangKeys(translationsJson, uiLangs);

    const payload: any = {
      ...defaultData,
      translations,
      translations_json,
    };

    try {
      if (editData?.id) {
        await (updateHook?.mutateAsync
          ? updateHook.mutateAsync(payload)
          : new Promise((resolve, reject) =>
              updateHook.mutate(payload, { onSuccess: resolve, onError: reject }),
            ));
      } else {
        await (storeHook?.mutateAsync
          ? storeHook.mutateAsync(payload)
          : new Promise((resolve, reject) =>
              storeHook.mutate(payload, { onSuccess: resolve, onError: reject }),
            ));
        reset();
      }

      dispatch(setRefetch(true));
      dispatch(setDynamicValue('store'));
    } catch (e) {
      console.error('Store submit failed:', e);
    }
  };

  const trigger = (
    <div className="hover:cursor-pointer">
      {lastSelectedImages?.img_url ? (
        <div className="relative w-48 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedImages?.img_url}
            alt={String(lastSelectedImages?.name ?? 'banner')}
            fill
            sizes="192px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="border-2 w-48 h-32 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <CloudIcon />
          <p className="mt-4 text-blue-500 text-sm font-medium p-1">{t('common.drag_and_drop')}</p>
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
            alt={String(lastSelectedLogo?.name ?? 'logo')}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <CloudIcon />
          <p className="mt-4 text-blue-500 text-sm font-medium p-1">{t('common.drag_and_drop')}</p>
        </div>
      )}
    </div>
  );

  const isSubmitDisabled =
    isSaving ||
    (viewMode === 'form' &&
      (!safeStr(watchedSellerId) ||
        !safeStr(watchedNameDf) ||
        !safeStr(String(watchedLongitude ?? '')) ||
        !safeStr(String(watchedLatitude ?? '')) ||
        !!errorMessage));

  return (
    <div className="pb-24">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* DF hidden required by schema */}
        <input type="hidden" {...register('name_df' as any)} />
        <input type="hidden" {...register('meta_title_df' as any)} />
        <input type="hidden" {...register('meta_description_df' as any)} />
        <input type="hidden" {...register('address_df' as any)} />

        {/* Toggle header */}
        <Card className="mt-4">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {editData?.id ? t('button.update') : t('button.submit')}
            </div>

            <div className="inline-flex rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className={[
                  'px-4 py-2 text-sm font-medium transition',
                  viewMode === 'form'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                Form
              </button>
              <button
                type="button"
                onClick={() => setViewMode('json')}
                className={[
                  'px-4 py-2 text-sm font-medium transition',
                  viewMode === 'json'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                JSON
              </button>
            </div>
          </CardContent>
        </Card>

        {viewMode === 'json' ? (
          <Card className="rounded-lg border-none mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Store JSON"
                languages={uiLangs}
                value={ensureLangKeys(translationsJson, uiLangs)}
                onChange={onJsonChange}
                perLanguage={true}
                showAllTab={true}
                helperText={
                  <span>
                    Alanlar: <code>name</code>, <code>meta_title</code>, <code>meta_description</code>
                  </span>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
            {/* LEFT */}
            <Card className="col-span-1 xl:col-span-2">
              <CardContent className="p-2 md:p-6">
                <p className="text-lg md:text-2xl font-medium mb-4">{t('label.basic_information')}</p>

                {/* GLOBAL SELECTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.seller')}</p>
                    <Controller
                      control={control}
                      name="store_seller_id"
                      render={({ field }) => (
                        <AppSelect
                          value={String(field.value ?? '')}
                          onSelect={(value) => field.onChange(toSelectValue(value))}
                          groups={SellerOptions}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">{t('label.store_type')}</p>
                    <Controller
                      control={control}
                      name="store_type"
                      render={({ field }) => (
                        <AppSelect
                          value={String(field.value ?? '')}
                          onSelect={(value) => field.onChange(toSelectValue(value))}
                          groups={StoreTypeOptions}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* LANG TABS only for i18n fields */}
                <Tabs value={activeLangId} onValueChange={(v) => setActiveLangId(String(v))}>
                  <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                    {uiLangs.map((lang) => (
                      <TabsTrigger key={lang.id} value={lang.id}>
                        {lang.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div dir={dir}>
                    {uiLangs.map((lang) => (
                      <TabsContent key={lang.id} value={lang.id}>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t('label.name')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </p>
                            <Input
                              id={`name_${lang.id}`}
                              {...register(`name_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t('place_holder.enter_name')}
                            />
                          </div>

                          {/* phone required by schema */}
                          <div className={`mb-4 ${locale === 'ar' ? '' : 'pr-3'}`}>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <span>{t('label.phone')}</span>
                            </p>
                            <AppPhoneNumberInput
                              value={phoneNumber}
                              onChange={(value) => {
                                setPhoneNumber(value);
                                setValueAny('phone', value, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                });
                              }}
                            />
                            {(errors as any)?.phone?.message ? (
                              <p className="text-red-500 text-sm mt-1">
                                {String((errors as any)?.phone?.message)}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">{t('label.email')}</p>
                            <Input
                              type="text"
                              id="email"
                              {...register('email' as any)}
                              className="app-input"
                              placeholder={t('place_holder.enter_email')}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">{t('label.vat_tax')} (%)</p>
                            <Input
                              type="number"
                              id="tax"
                              {...register('tax' as any, { valueAsNumber: true })}
                              className="app-input"
                              placeholder={t('place_holder.enter_vat_tax')}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">{t('label.vat_tax_number')}</p>
                            <Input
                              type="text"
                              id="tax_number"
                              {...register('tax_number' as any)}
                              className="app-input"
                              placeholder={t('place_holder.enter_vat_tax_number')}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1">{t('label.opening_time')}</p>
                              <Input
                                type="time"
                                id="opening_time"
                                {...register('opening_time' as any)}
                                className="app-input"
                              />
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1">{t('label.closing_time')}</p>
                              <Input
                                type="time"
                                id="closing_time"
                                {...register('closing_time' as any)}
                                className="app-input"
                              />
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t('label.meta_title')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </p>
                            <Input
                              id={`meta_title_${lang.id}`}
                              {...register(`meta_title_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t('place_holder.enter_meta_title')}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t('label.meta_description')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </p>
                            <Textarea
                              id={`meta_description_${lang.id}`}
                              {...register(`meta_description_${lang.id}` as any)}
                              className="app-input"
                              placeholder={t('place_holder.enter_meta_description')}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            {/* RIGHT */}
            <div className="col-span-1 space-y-4 w-full">
              <Card>
                <CardContent className="p-2 md:p-6">
                  <p className="text md:text-2xl font-medium mb-4">{t('label.image')}</p>

                  <div dir={dir} className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">{t('label.bg_image')}</p>
                      <div className="relative flex align-start gap-4">
                        <div className="relative w-48">
                          <PhotoUploadModal
                            trigger={trigger}
                            isMultiple={false}
                            onSave={handleSaveImages}
                            usageType="store"
                            selectedImage={lastSelectedImages}
                          />
                          {lastSelectedImages?.image_id ? (
                            <Cancel
                              customClass="absolute top-0 right-0 m-1"
                              onClick={(event: { stopPropagation: () => void }) => {
                                event.stopPropagation();
                                removePreview();
                              }}
                            />
                          ) : null}
                          {errorImagesMessage ? (
                            <p className="text-red-500 text-sm mt-1">{errorImagesMessage}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">{t('label.logo')}</p>
                      <div className="relative flex align-start gap-4">
                        <div className="relative w-32">
                          <PhotoUploadModal
                            trigger={triggerLogo}
                            isMultiple={false}
                            onSave={handleSaveLogo}
                            usageType="store"
                            selectedImage={lastSelectedLogo}
                          />
                          {lastSelectedLogo?.image_id ? (
                            <Cancel
                              customClass="absolute top-0 right-0 m-1"
                              onClick={(event: { stopPropagation: () => void }) => {
                                event.stopPropagation();
                                removeLogo();
                              }}
                            />
                          ) : null}
                          {errorLogoMessage ? (
                            <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2 md:p-6">
                  <p className="text-lg md:text-2xl font-medium mb-4">{t('label.address_details')}</p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">{t('label.area')}</p>
                      <Controller
                        control={control}
                        name="area_id"
                        render={({ field }) => (
                          <AppSelect
                            value={String(field.value ?? '')}
                            onSelect={(value) => {
                              const v = toSelectValue(value);
                              field.onChange(v);
                              handleAreaSelect(v);
                            }}
                            groups={AreaOptions}
                          />
                        )}
                      />
                      {errorMessage ? <p className="text-red-500 text-sm mt-2">{errorMessage}</p> : null}
                    </div>

                    <div className="mt-4">
                      {isLoaded && isMapEnabled && googleMapKey ? (
                        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={zoom}>
                          {polygonCoords?.length > 0 ? (
                            <Polygon
                              path={polygonCoords}
                              options={{
                                fillColor: '#2196F3',
                                strokeColor: '#2196F3',
                                editable: false,
                                draggable: false,
                              }}
                            />
                          ) : null}

                          <Marker position={markerPosition} draggable={true} onDragEnd={handleMarkerDrag as any} />

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
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* FOOTER SAVE */}
        <div className="fixed left-0 right-0 bottom-0 z-50 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-end">
            <Button type="submit" variant="outline" className="app-button" disabled={isSubmitDisabled}>
              {isSaving ? <Loader size="small" /> : editData?.id ? t('button.update') : t('button.submit')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
