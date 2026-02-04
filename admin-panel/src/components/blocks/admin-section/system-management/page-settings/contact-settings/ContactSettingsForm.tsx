// =============================================================
// FILE: src/components/blocks/admin-section/system-management/page-settings/contact-settings/ContactSettingsForm.tsx
// FINAL — FIX google gate + FIX meta_keywords persist (sync firstUILangId -> df)
// - DO NOT render <GoogleMap/> unless isLoaded === true
// - If googleMapKey missing/disabled => show fallback, no GoogleMap render
// - libraries: ['places','drawing'] for Autocomplete + DrawingManager
// - Meta keywords: watch ONLY meta_keywords_{firstUILangId} and sync to meta_keywords_df
// =============================================================

'use client';

import { AppSelect } from '@/components/blocks/common';
import AppPhoneNumberInput from '@/components/blocks/common/AppPhoneNumberInput';
import { SubmitButton } from '@/components/blocks/shared';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';
import Cancel from '@/components/blocks/custom-icons/Cancel';

import multiLang from '@/components/molecules/multiLang.json';
import {
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { TagsInput } from '@/components/ui/tags-input';

import CloudIcon from '@/assets/icons/CloudIcon';
import Facebook from '@/assets/icons/Facebook';
import Instagram from '@/assets/icons/Instagram';
import Linkedin from '@/assets/icons/Linkedin';
import Twitter from '@/assets/icons/Twitter';

import GlobalImageLoader from '@/lib/imageLoader';
import { useGoogleMapForAllQuery } from '@/modules/admin-section/google-map-settings/google-map-settings.action';
import { useAboutPageUpdateMutation } from '@/modules/admin-section/system-management/page-settings/contact-settings/contact-settings.action';
import {
  ContactSettingsFormData,
  contactSettingsSchema,
} from '@/modules/admin-section/system-management/page-settings/contact-settings/contact-settings.schema';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  DrawingManager,
  GoogleMap,
  Marker,
  Polygon,
  useLoadScript,
} from '@react-google-maps/api';

import { Info, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

type LangKeys = string;

type SocialRow = {
  image: string;
  subtitles: { [langId: string]: string }; // URL stored only in df
};

const DF_LANG = 'df';
const GOOGLE_LIBRARIES = ['places', 'drawing'] as const;

const ContactSettingsForm = ({ data }: any) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const multiLangData = useMemo(() => multiLang, []);
  const uiLangs = useMemo(
    () => (multiLangData || []).filter((l: any) => l?.id && l.id !== DF_LANG),
    [multiLangData],
  );
  const firstUILangId = uiLangs?.[0]?.id || 'en';

  // ---- Tabs controlled ----
  const [tab, setTab] = useState<string>(firstUILangId);
  useEffect(() => {
    if (!uiLangs.find((l: any) => l.id === tab)) setTab(firstUILangId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstUILangId, uiLangs.length]);

  // ---- Google Map Settings ----
  const mapContainerStyle = { width: '100%', height: '350px' } as const;
  const { GoogleMapData } = useGoogleMapForAllQuery({});
  const GoogleMapSettingsMessage = (GoogleMapData as any)?.message;
  const [googleMapKey, setGoogleMapKey] = useState('');

  useEffect(() => {
    if (GoogleMapSettingsMessage?.com_google_map_enable_disable === 'on') {
      setGoogleMapKey(GoogleMapSettingsMessage?.com_google_map_api_key || '');
    } else {
      setGoogleMapKey('');
    }
  }, [
    GoogleMapSettingsMessage?.com_google_map_enable_disable,
    GoogleMapSettingsMessage?.com_google_map_api_key,
  ]);

  // ---- LOAD SCRIPT (google is not defined fix) ----
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapKey || ' ',
    libraries: [...GOOGLE_LIBRARIES] as any,
  });

  const defaultCenter = { lat: 23.8103, lng: 90.4125 };
  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [zoom, setZoom] = useState(12);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [polygonCoords, setPolygonCoords] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      if (!googleMapKey) return 'Address not found';
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapKey}`,
      );
      if (!response.ok) throw new Error('Failed to fetch address');
      const j = await response.json();
      if (j?.results?.length) return j.results[0].formatted_address;
      return 'Address not found';
    } catch {
      return 'Error fetching address';
    }
  };

  const handlePlaceSelect = async () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setCenter({ lat, lng });
    setMarkerPosition({ lat, lng });
    setZoom(12);
    setErrorMessage('');
  };

  const handlePolygonComplete = async (polygon: any) => {
    const path = polygon.getPath();
    const coords: { lat: number; lng: number }[] = [];
    for (let i = 0; i < path.getLength(); i++) coords.push(path.getAt(i).toJSON());
    setPolygonCoords(coords);

    if (coords.length > 0) {
      const first = coords[0];
      setMarkerPosition(first);
      setCenter(first);
      setZoom(12);
      const address = await fetchAddress(first.lat, first.lng);
      setValue('address', address);
    }
  };

  const handlePolygonEdit = (poly: any) => {
    const newCoords = poly
      .getPath()
      .getArray()
      .map((c: any) => c.toJSON());
    setPolygonCoords(newCoords);
  };

  const handleMarkerDrag: any = async (event: {
    latLng: { lat: () => number; lng: () => number };
  }) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    setErrorMessage('');
    const address = await fetchAddress(newLat, newLng);
    setMarkerPosition({ lat: newLat, lng: newLng });
    setCenter({ lat: newLat, lng: newLng });
    setValue('latitude' as any, newLat);
    setValue('longitude' as any, newLng);
    setValue('address', address);
  };

  // ---- Form ----
  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactSettingsFormData>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: {
      status: data?.data?.status ?? '',
      theme_name: data?.data?.theme_name ?? '',
    },
  });

  // ✅ Meta keywords sync (ONLY first UI lang -> df)
  const firstLangMetaKeywords = useWatch({
    control,
    name: `meta_keywords_${firstUILangId}` as any,
  });

  useEffect(() => {
    if (Array.isArray(firstLangMetaKeywords)) {
      setValue('meta_keywords_df' as any, firstLangMetaKeywords, {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [firstLangMetaKeywords, setValue]);

  const statuslist = [
    { label: t('label.draft'), value: 'draft' },
    { label: t('label.publish'), value: 'publish' },
  ];
  const Themelist = [
    { label: 'Default', value: 'default' },
    { label: 'Theme One', value: 'theme_one' },
    { label: 'Theme Two', value: 'theme_two' },
  ];

  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const QueryData = useMemo(() => (data as any)?.data || null, [data]);

  const contactFormSection = QueryData?.content?.contact_form_section;
  const contactDetailsSection = QueryData?.content?.contact_details_section;
  const mapSection = QueryData?.content?.map_section;

  const [onBoardSteps, setOnBoardSteps] = useState<SocialRow[]>([
    { image: '', subtitles: { [DF_LANG]: '' } },
  ]);

  // ---- Prefill ----
  useEffect(() => {
    if (!QueryData) return;

    setValue('page_title_df', QueryData?.title ?? '');
    setValue('meta_title_df', QueryData?.meta_title ?? '');
    setValue('meta_description_df', QueryData?.meta_description ?? '');

    const dfTags = QueryData?.meta_keywords
      ? String(QueryData.meta_keywords)
          .split(',')
          .map((x: string) => x.trim())
          .filter(Boolean)
      : [];
    setValue('meta_keywords_df' as any, dfTags as any);

    setValue('status', QueryData?.status ?? '');
    setValue('theme_name', QueryData?.theme_name ?? '');

    if (contactFormSection) {
      setValue('title_df', contactFormSection?.title ?? '');
      setValue('subtitle_df', contactFormSection?.subtitle ?? '');
    }

    if (contactDetailsSection) {
      setValue('address', contactDetailsSection?.address ?? '');
      setValue('email', contactDetailsSection?.email ?? '');
      setPhoneNumber(contactDetailsSection?.phone ?? '');
      setValue('phone', contactDetailsSection?.phone ?? '');
      setValue('website', contactDetailsSection?.website ?? '');

      if (contactDetailsSection?.image) {
        setLastSelectedLogo({
          image_id: contactDetailsSection?.image ?? '',
          img_url: contactDetailsSection?.image_url ?? '/images/no-image.png',
          name: 'image',
        });
      } else setLastSelectedLogo(null);
    }

    if (mapSection?.coordinates?.lat && mapSection?.coordinates?.lng) {
      setMarkerPosition(mapSection.coordinates);
      setCenter(mapSection.coordinates);
      setZoom(12);
    }

    if (QueryData?.translations && typeof QueryData.translations === 'object') {
      const socialRows: SocialRow[] = [];

      Object.keys(QueryData.translations).forEach((language) => {
        const tr = QueryData.translations?.[language];
        if (!tr) return;

        const tagsArray = tr?.meta_keywords
          ? String(tr.meta_keywords)
              .split(',')
              .map((x: string) => x.trim())
              .filter(Boolean)
          : [];

        setValue(`meta_keywords_${language}` as any, tagsArray as any);
        setValue(`page_title_${language}` as any, tr?.title ?? '');
        setValue(`meta_title_${language}` as any, tr?.meta_title ?? '');
        setValue(`meta_description_${language}` as any, tr?.meta_description ?? '');

        const cfs = tr?.content?.contact_form_section;
        if (cfs) {
          setValue(`title_${language}` as any, cfs?.title ?? '');
          setValue(`subtitle_${language}` as any, cfs?.subtitle ?? '');
        }

        const cds = tr?.content?.contact_details_section || contactDetailsSection;
        if (cds?.social?.length) {
          cds.social.forEach((row: any, index: number) => {
            if (!socialRows[index]) socialRows[index] = { image: '', subtitles: { [DF_LANG]: '' } };
            socialRows[index].image = row?.icon || socialRows[index].image || '';
            socialRows[index].subtitles[DF_LANG] =
              row?.url || socialRows[index].subtitles[DF_LANG] || '';
          });
        }
      });

      setOnBoardSteps(
        socialRows.length ? socialRows : [{ image: '', subtitles: { [DF_LANG]: '' } }],
      );
    } else {
      setOnBoardSteps([{ image: '', subtitles: { [DF_LANG]: '' } }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [QueryData]);

  const handleSaveLogo = (images: UploadedImage[]) => {
    setLastSelectedLogo(images?.[0] ?? null);

    const dimensions = images?.[0]?.dimensions ?? '';
    const [w, h] = dimensions.split(' x ').map((d) => parseInt(d.trim(), 10));
    const aspectRatio = w && h ? w / h : 0;

    if (Math.abs(aspectRatio - 1) < 0.01) {
      setLogoErrorMessage('');
      return true;
    }
    setLogoErrorMessage('Image must have a 1:1 aspect ratio.');
    return false;
  };

  const removeLogo = () => {
    setLastSelectedLogo(null);
    setLogoErrorMessage('');
  };

  const availableIcons = [
    {
      value: 'Facebook',
      label: (
        <div className="flex items-center gap-2">
          <Facebook />
          <span>Facebook</span>
        </div>
      ),
    },
    {
      value: 'Instagram',
      label: (
        <div className="flex items-center gap-2">
          <Instagram />
          <span>Instagram</span>
        </div>
      ),
    },
    {
      value: 'Twitter',
      label: (
        <div className="flex items-center gap-2">
          <Twitter />
          <span>Twitter</span>
        </div>
      ),
    },
    {
      value: 'Linkedin',
      label: (
        <div className="flex items-center gap-2">
          <Linkedin />
          <span>LinkedIn</span>
        </div>
      ),
    },
  ];

  const handleAddOnBoardStep = () => {
    setOnBoardSteps((prev) => [...prev, { image: '', subtitles: { [DF_LANG]: '' } }]);
  };

  const handleDeleteOnBoardStep = (index: number) => {
    setOnBoardSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeOnBoardStep = (
    index: number,
    field: 'subtitles' | 'image',
    langId: string,
    value: any,
  ) => {
    setOnBoardSteps((prev) => {
      const next = [...prev];
      const row = next[index] || { image: '', subtitles: { [DF_LANG]: '' } };

      if (field === 'image') row.image = String(value || '');
      else row.subtitles = { ...(row.subtitles || {}), [langId]: String(value || '') };

      next[index] = row;
      return next;
    });
  };

  const { mutate: save, isPending: isUpdating } = useAboutPageUpdateMutation();

  const onSubmit = async (values: ContactSettingsFormData) => {
    // ✅ root keywords: df is synced; still fallback to first lang if needed
    const rootKeywordsArr =
      (Array.isArray(values.meta_keywords_df) && values.meta_keywords_df.length
        ? values.meta_keywords_df
        : ((values as any)[`meta_keywords_${firstUILangId}`] as any)) || [];

    const defaultData: any = {
      title: values.page_title_df,
      meta_title: values.meta_title_df,
      meta_description: values.meta_description_df,
      meta_keywords: (Array.isArray(rootKeywordsArr) ? rootKeywordsArr : []).join(','),
    };
    if (values?.status) defaultData.status = values.status;

    const contact_form_section = {
      title: values.title_df,
      subtitle: values.subtitle_df,
    };

    const contact_details_section = {
      address: values.address,
      phone: values.phone,
      email: values.email,
      website: values.website,
      image: lastSelectedLogo?.image_id || '',
      image_url: '',
      social: onBoardSteps.map((row) => ({
        url: row?.subtitles?.[DF_LANG] || '',
        icon: row?.image || '',
      })),
    };

    const map_section = { coordinates: markerPosition };

    const translations = uiLangs.map((lang: any) => ({
      language_code: lang.id,
      title: (values as any)[`page_title_${lang.id}`] || '',
      meta_title: (values as any)[`meta_title_${lang.id}`] || '',
      meta_description: (values as any)[`meta_description_${lang.id}`] || '',
      meta_keywords: (((values as any)[`meta_keywords_${lang.id}`] || []) as any[]).join(','),
      content: {
        contact_form_section: {
          title: (values as any)[`title_${lang.id}`] || '',
          subtitle: (values as any)[`subtitle_${lang.id}`] || '',
        },
        contact_details_section,
        map_section,
      },
    }));

    const submissionData = {
      id: QueryData?.id ? QueryData.id : 0,
      ...defaultData,
      theme_name: values.theme_name,
      content: { contact_form_section, contact_details_section, map_section },
      translations,
    };

    return save({ ...(submissionData as any) }, { onSuccess: () => setLogoErrorMessage('') });
  };

  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={(lastSelectedLogo?.name as string) || 'image'}
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

  const canRenderGoogleMap =
    Boolean(googleMapKey) && isLoaded && typeof window !== 'undefined' && (window as any).google;

  return (
    <div dir={dir}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={tab} onValueChange={setTab}>
          <Card dir={dir} className="mt-4">
            <CardContent className="p-4">
              <TabsList dir={dir} className="flex justify-start bg-transparent">
                {uiLangs.map((lang: any) => (
                  <TabsTrigger key={lang.id} value={lang.id}>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardContent>
          </Card>

          {/* ---------- SEO / Page Meta ---------- */}
          <Card dir={dir} className="mt-4">
            <CardContent className="p-4">
              {uiLangs.map((lang: any) => (
                <TabsContent key={lang.id} value={lang.id}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Theme Name</span>
                        </p>
                        <Controller
                          control={control}
                          name="theme_name"
                          render={({ field }) => (
                            <AppSelect
                              value={String(field.value ?? '')}
                              onSelect={(v) => field.onChange(v)}
                              groups={Themelist}
                              hideNone
                            />
                          )}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t('label.title')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                          </span>
                        </p>
                        <Input
                          id={`page_title_${lang.id}`}
                          {...register(`page_title_${lang.id}` as any)}
                          className="app-input"
                          placeholder={t('place_holder.enter_title')}
                        />
                        {(errors as any)[`page_title_${lang.id}`]?.message && (
                          <p className="text-red-500 text-sm mt-1">
                            {(errors as any)[`page_title_${lang.id}`]?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>{t('label.status')}</span>
                        </p>
                        <Controller
                          control={control}
                          name="status"
                          render={({ field }) => (
                            <AppSelect
                              value={String(field.value ?? '')}
                              onSelect={(v) => field.onChange(v)}
                              groups={statuslist}
                              hideNone
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t('label.meta_title')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                          </span>
                        </p>
                        <Input
                          id={`meta_title_${lang.id}`}
                          {...register(`meta_title_${lang.id}` as any)}
                          className="app-input"
                          placeholder={t('place_holder.enter_meta_title')}
                        />
                        {(errors as any)[`meta_title_${lang.id}`]?.message && (
                          <p className="text-red-500 text-sm mt-1">
                            {(errors as any)[`meta_title_${lang.id}`]?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t('label.meta_description')} (
                            {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                          </span>
                        </p>
                        <Input
                          id={`meta_description_${lang.id}`}
                          {...register(`meta_description_${lang.id}` as any)}
                          className="app-input"
                          placeholder={t('place_holder.enter_meta_description')}
                        />
                        {(errors as any)[`meta_description_${lang.id}`]?.message && (
                          <p className="text-red-500 text-sm mt-1">
                            {(errors as any)[`meta_description_${lang.id}`]?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="text-sm font-medium flex items-center gap-2">
                          <span>
                            {t('label.meta_keywords')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)}
                            )
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue w-68">
                                <p className="p-1 text-sm font-medium">
                                  {t('tooltip.enter_meta_key')}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <Controller
                          name={`meta_keywords_${lang.id}` as any}
                          control={control}
                          render={({ field }) => (
                            <TagsInput
                              {...field}
                              value={Array.isArray(field.value) ? field.value : []}
                              onChange={(v: string[]) => field.onChange(v)}
                              placeholder={`${t('place_holder.enter_meta_key')} ${t(
                                `lang.${lang.id}` as `lang.${LangKeys}`,
                              )}`}
                              className="app-input"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </CardContent>
          </Card>

          {/* ---------- Contact Form Section (i18n) ---------- */}
          <Card dir={dir} className="mt-4">
            <CardContent className="p-4">
              <h1 className="text-lg md:text-2xl font-medium mb-4">Contact Form Section</h1>

              {uiLangs.map((lang: any) => (
                <TabsContent key={lang.id} value={lang.id}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-1">Title ({lang.label})</div>
                      <Input
                        id={`title_${lang.id}`}
                        {...register(`title_${lang.id}` as any)}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Subtitle ({lang.label})</div>
                      <Input
                        id={`subtitle_${lang.id}`}
                        {...register(`subtitle_${lang.id}` as any)}
                        className="app-input"
                        placeholder="Enter value"
                      />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </CardContent>
          </Card>

          {/* ---------- Contact Details (global) + Social ---------- */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <h1 className="text-lg md:text-2xl font-medium mb-4">Contact Details Section</h1>

              {uiLangs.map((lang: any) => (
                <TabsContent key={lang.id} value={lang.id}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
                    <div>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Address</p>
                        <Input
                          id="address"
                          {...register('address' as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Email</p>
                        <Input
                          id="email"
                          {...register('email' as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Phone</p>
                        <AppPhoneNumberInput
                          value={phoneNumber}
                          onChange={(v) => {
                            setPhoneNumber(v);
                            setValue('phone', v as any);
                          }}
                        />
                        {errors.phone?.message && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Website</p>
                        <Input
                          id="website"
                          {...register('website' as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Contact Details Image</p>
                      <div className="relative flex align-start gap-4">
                        <div className="relative w-32">
                          <PhotoUploadModal
                            trigger={triggerLogo}
                            isMultiple={false}
                            onSave={handleSaveLogo}
                            usageType="contact_settings"
                            selectedImage={lastSelectedLogo}
                          />
                          {lastSelectedLogo?.image_id && (
                            <Cancel
                              customClass="absolute top-0 right-0 m-1"
                              onClick={(e: { stopPropagation: () => void }) => {
                                e.stopPropagation();
                                removeLogo();
                              }}
                            />
                          )}
                        </div>
                      </div>
                      {errorLogoMessage && (
                        <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 w-full text-sm font-semibold flex items-center justify-between">
                    <p className="text-lx font-semibold">Social</p>
                    <span
                      onClick={handleAddOnBoardStep}
                      className="flex items-center cursor-pointer bg-blue-50 border border-blue-500 text-blue-500 text-sm font-bold shadow-2xl px-2 py-2 rounded hover:bg-blue-500 hover:text-white"
                    >
                      Add more
                    </span>
                  </div>

                  <div className="max-h-[300px] overflow-x-auto custom-scrollbar">
                    {onBoardSteps.map((row, index) => (
                      <div key={index} className="my-4 flex items-end w-full gap-2 md:gap-4">
                        <div className="flex flex-col md:flex-row items-center w-full gap-4 mr-0 md:mr-6">
                          <div className="flex flex-col items-start">
                            <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                              Select Icon
                            </p>
                            <AppSelect
                              value={row?.image || ''}
                              onSelect={(icon) => handleChangeOnBoardStep(index, 'image', '', icon)}
                              groups={availableIcons as any}
                              customClass="w-[200px]"
                              placeholder="Select an Icon"
                            />
                          </div>

                          <div className="w-full mb-2">
                            <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                              URL
                            </p>
                            <Input
                              type="text"
                              value={row?.subtitles?.[DF_LANG] || ''}
                              onChange={(e) =>
                                handleChangeOnBoardStep(index, 'subtitles', DF_LANG, e.target.value)
                              }
                              className="app-input flex-grow py-2"
                              placeholder="Enter value"
                            />
                          </div>
                        </div>

                        {index === 0 ? (
                          <span className="mb-2 flex items-center cursor-not-allowed bg-slate-500 text-slate-300 text-xs md:text-sm font-semibold shadow-2xl px-1 md:px-2 py-2.5 rounded">
                            Default
                          </span>
                        ) : (
                          <span
                            onClick={() => handleDeleteOnBoardStep(index)}
                            className="mb-2 cursor-pointer bg-red-500 text-white shadow-2xl px-2 md:px-3 py-2 rounded"
                          >
                            <X />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </CardContent>
          </Card>

          {/* ---------- Map (global) ---------- */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <h1 className="text-lg md:text-2xl font-medium mb-4">Map</h1>

              {errorMessage && <p className="text-red-500 text-sm my-2">{errorMessage}</p>}

              {!googleMapKey ? (
                <div className="border rounded p-4 text-sm text-gray-600">
                  Google Map disabled (no API key / setting off).
                </div>
              ) : loadError ? (
                <div className="border rounded p-4 text-sm text-red-600">
                  Google Maps failed to load. Check API key & allowed domains.
                </div>
              ) : !canRenderGoogleMap ? (
                <div className="border rounded p-4 text-sm text-gray-600">
                  Loading Google Maps...
                </div>
              ) : (
                <div className="relative">
                  <Autocomplete
                    onLoad={(ac) => (autocompleteRef.current = ac)}
                    onPlaceChanged={handlePlaceSelect}
                    className="absolute z-10 right-[30%] w-[40%]"
                  >
                    <Input
                      type="text"
                      placeholder="Search for a location"
                      className="w-full app-input mb-2"
                    />
                  </Autocomplete>

                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={zoom}
                    // @ts-ignore
                    onLoad={(map) => (mapRef.current = map)}
                  >
                    <Polygon
                      path={polygonCoords}
                      options={{
                        fillColor: '#2196F3',
                        strokeColor: '#2196F3',
                        editable: true,
                        draggable: false,
                      }}
                      onEdit={handlePolygonEdit as any}
                    />
                    <Marker position={markerPosition} draggable onDragEnd={handleMarkerDrag} />
                    <DrawingManager
                      onPolygonComplete={handlePolygonComplete}
                      options={{
                        drawingControl: true,
                        drawingControlOptions: { drawingModes: ['polygon' as any] },
                        polygonOptions: {
                          fillColor: '#2196F3',
                          strokeColor: '#2196F3',
                          editable: true,
                        },
                      }}
                    />
                  </GoogleMap>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton IsLoading={isUpdating} AddLabel="Save Changes" />
        </Card>
      </form>
    </div>
  );
};

export default ContactSettingsForm;
