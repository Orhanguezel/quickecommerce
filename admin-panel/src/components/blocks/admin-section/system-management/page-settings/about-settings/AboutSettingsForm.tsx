// =============================================================
// File: src/components/blocks/admin-section/system-management/page-settings/about-settings/AboutSettingsForm.tsx
// FINAL — AboutSettingsForm (DF + JSON) SAME STANDARD
// Fixes:
// - Tabs controlled (Radix defaultValue bug)
// - df UI’da YOK (uiLangs only)
// - Init uses reset(next) (no empty form / no timing bug)
// - JSON/Form toggle always visible
// - JSON <-> Form bridge for ROOT fields + sections (about/story/mission/testimonial)
// - meta_keywords normalize everywhere (array in RHF / array in JSON / string in submit)
// - df mirror = firstUILangId mirror
// =============================================================

'use client';

import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import multiLang from '@/components/molecules/multiLang.json';
import {
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';

import CloudIcon from '@/assets/icons/CloudIcon';
import Cancel from '@/components/blocks/custom-icons/Cancel';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';
import { TagsInput } from '@/components/ui/tags-input';
import GlobalImageLoader from '@/lib/imageLoader';
import { useAboutPageUpdateMutation } from '@/modules/admin-section/system-management/page-settings/about-settings/about-settings.action';
import {
  AboutSettingsFormData,
  aboutSettingsSchema,
} from '@/modules/admin-section/system-management/page-settings/about-settings/about-settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

// JSON scaffold stack (standard)
import {
  AdminI18nJsonPanel,
  buildI18nJsonFromFlatValues,
  applyI18nJsonToFlatForm,
  makeRHFSetValueAny,
  safeObject,
  ensureLangKeys,
  useFormI18nScaffold,
} from '@/lib/json';
import type { LangKeys, ViewMode, LangType } from '@/lib/json';

function safeStr(v: unknown) {
  return String(v ?? '').trim();
}
function metaKeywordsToArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => safeStr(x)).filter(Boolean);
  const s = safeStr(v);
  if (!s) return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}
function metaKeywordsToString(v: unknown): string {
  const arr = Array.isArray(v) ? (v as unknown[]) : [];
  return arr
    .map((x) => safeStr(x))
    .filter(Boolean)
    .join(', ');
}

// JSON’a bağlayacağımız ROOT + section alanları (steps hariç)
const I18N_FIELDS = [
  'title',
  'meta_title',
  'meta_description',
  'meta_keywords',

  'about_title',
  'about_subtitle',
  'about_description',

  'story_title',
  'story_subtitle',

  'mission_title',
  'mission_subtitle',

  'testimonial_title',
  'testimonial_subtitle',
] as const;

function getEntityFromProps(data: any) {
  // query response şekilleri
  const e = (data?.data?.data ?? data?.data ?? data) as any;
  const maybeNested = e?.data && (e.data.title || e.data.id || e.data.content) ? e.data : e;
  return maybeNested;
}

const AboutSettingsForm = ({ data }: any) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const entity = useMemo(() => getEntityFromProps(data), [data]);

  // ✅ df UI’da yok
  const allLangs = useMemo(() => (Array.isArray(multiLang) ? (multiLang as LangType[]) : []), []);
  const uiLangsOnly = useMemo(() => allLangs.filter((l) => l.id !== 'df'), [allLangs]);

  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [activeLangId, setActiveLangId] = useState<string>('');

  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>('');

  // steps state’leri (senin mevcut yapın)
  const [attributeValues, setAttributeValues] = useState<any[]>([]);
  const [testimonialSteps, setTestimonialSteps] = useState<any[]>([]);
  const [onBoardSteps, setOnBoardSteps] = useState<any[]>([]);

  const {
    control,
    register,
    setValue,
    getValues,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<AboutSettingsFormData>({
    resolver: zodResolver(aboutSettingsSchema),
    shouldUnregister: false,
    defaultValues: {
      status: '',
      theme_name: '',
    } as any,
  });

  const setValueAny = useMemo(
    () => makeRHFSetValueAny<AboutSettingsFormData>(setValue),
    [setValue],
  );

  const statuslist = [
    { label: t('label.draft'), value: 'draft' },
    { label: t('label.publish'), value: 'publish' },
  ];
  const Themelist = [
    { label: 'Default', value: 'default' },
    { label: 'Theme One', value: 'theme_one' },
    { label: 'Theme Two', value: 'theme_two' },
  ];

  // ✅ i18n scaffold (standard)
  const i18n = useFormI18nScaffold<AboutSettingsFormData>({
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
        { dfField: 'title_df', srcField: (l) => `title_${l}`, validate: true },

        { dfField: 'meta_title_df', srcField: (l) => `meta_title_${l}` },
        { dfField: 'meta_description_df', srcField: (l) => `meta_description_${l}` },
        { dfField: 'meta_keywords_df', srcField: (l) => `meta_keywords_${l}` },

        { dfField: 'about_title_df', srcField: (l) => `about_title_${l}` },
        { dfField: 'about_subtitle_df', srcField: (l) => `about_subtitle_${l}` },
        { dfField: 'about_description_df', srcField: (l) => `about_description_${l}` },

        { dfField: 'story_title_df', srcField: (l) => `story_title_${l}` },
        { dfField: 'story_subtitle_df', srcField: (l) => `story_subtitle_${l}` },

        { dfField: 'mission_title_df', srcField: (l) => `mission_title_${l}` },
        { dfField: 'mission_subtitle_df', srcField: (l) => `mission_subtitle_${l}` },

        { dfField: 'testimonial_title_df', srcField: (l) => `testimonial_title_${l}` },
        { dfField: 'testimonial_subtitle_df', srcField: (l) => `testimonial_subtitle_${l}` },
      ],
    },
    extraWatchNames: ['status', 'theme_name'],
  });

  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    setTranslationsJson,
    handleTranslationsJsonChange,
  } = i18n;

  // ✅ firstUILangId gelince tab set
  useEffect(() => {
    if (!firstUILangId) return;
    setActiveLangId((prev) => prev || firstUILangId);
  }, [firstUILangId]);

  // ✅ meta_keywords field’leri RHF’de kayıtlı olsun
  useEffect(() => {
    if (!uiLangs?.length) return;
    uiLangs.forEach((l) => {
      // root
      register(`title_${l.id}` as any);
      register(`meta_title_${l.id}` as any);
      register(`meta_description_${l.id}` as any);
      register(`meta_keywords_${l.id}` as any);

      // sections
      register(`about_title_${l.id}` as any);
      register(`about_subtitle_${l.id}` as any);
      register(`about_description_${l.id}` as any);

      register(`story_title_${l.id}` as any);
      register(`story_subtitle_${l.id}` as any);

      register(`mission_title_${l.id}` as any);
      register(`mission_subtitle_${l.id}` as any);

      register(`testimonial_title_${l.id}` as any);
      register(`testimonial_subtitle_${l.id}` as any);
    });
  }, [uiLangs, register]);

  const buildJsonFromValues = (values: any) => {
    const built = buildI18nJsonFromFlatValues({
      values: safeObject(values),
      languages: uiLangs,
      fields: [...I18N_FIELDS],
      keyOf: (field, langId) => `${field}_${langId}`,
      skipEmpty: false,
    });

    const normalized = ensureLangKeys(safeObject(built), uiLangs as any);

    uiLangs.forEach((l) => {
      const mk = (normalized as any)?.[l.id]?.meta_keywords;
      (normalized as any)[l.id] = {
        ...(normalized as any)[l.id],
        meta_keywords: metaKeywordsToArray(mk),
      };
    });

    return normalized;
  };

  const applyJsonToForm = (nextAny: any) => {
    const next = ensureLangKeys(safeObject(nextAny), uiLangs as any);

    uiLangs.forEach((l) => {
      const mk = (next as any)?.[l.id]?.meta_keywords;
      (next as any)[l.id] = { ...(next as any)[l.id], meta_keywords: metaKeywordsToArray(mk) };
    });

    handleTranslationsJsonChange(next);

    applyI18nJsonToFlatForm<AboutSettingsFormData>({
      json: next,
      languages: uiLangs as any,
      fields: [...I18N_FIELDS],
      setValue: setValueAny,
      keyOf: (field, langId) => `${field}_${langId}`,
    });

    // df mirror immediately (first UI lang)
    const b = (next as any)?.[firstUILangId] ?? {};
    setValueAny('title_df', safeStr(b.title), { shouldDirty: true, shouldValidate: true });
    setValueAny('meta_title_df', safeStr(b.meta_title), { shouldDirty: true });
    setValueAny('meta_description_df', safeStr(b.meta_description), { shouldDirty: true });
    setValueAny('meta_keywords_df', metaKeywordsToArray(b.meta_keywords), { shouldDirty: true });

    setValueAny('about_title_df', safeStr(b.about_title), { shouldDirty: true });
    setValueAny('about_subtitle_df', safeStr(b.about_subtitle), { shouldDirty: true });
    setValueAny('about_description_df', safeStr(b.about_description), { shouldDirty: true });

    setValueAny('story_title_df', safeStr(b.story_title), { shouldDirty: true });
    setValueAny('story_subtitle_df', safeStr(b.story_subtitle), { shouldDirty: true });

    setValueAny('mission_title_df', safeStr(b.mission_title), { shouldDirty: true });
    setValueAny('mission_subtitle_df', safeStr(b.mission_subtitle), { shouldDirty: true });

    setValueAny('testimonial_title_df', safeStr(b.testimonial_title), { shouldDirty: true });
    setValueAny('testimonial_subtitle_df', safeStr(b.testimonial_subtitle), { shouldDirty: true });

    setTranslationsJson(next);
  };

  // ✅ INIT — reset(next)
  useEffect(() => {
    if (!firstUILangId) return;
    if (!uiLangs?.length) return;

    const content = entity?.content ?? {};
    const aboutSection = content?.about_section ?? {};
    const storySection = content?.story_section ?? {};
    const missionSection = content?.mission_and_vision_section ?? {};
    const testimonialSection = content?.testimonial_and_success_section ?? {};

    const next: any = {
      // df root
      title_df: safeStr(entity?.title),
      meta_title_df: safeStr(entity?.meta_title),
      meta_description_df: safeStr(entity?.meta_description),
      meta_keywords_df: metaKeywordsToArray(entity?.meta_keywords),

      status: safeStr(entity?.status),
      theme_name: safeStr(entity?.theme_name),

      // df sections
      about_title_df: safeStr(aboutSection?.title),
      about_subtitle_df: safeStr(aboutSection?.subtitle),
      about_description_df: safeStr(aboutSection?.description),

      story_title_df: safeStr(storySection?.title),
      story_subtitle_df: safeStr(storySection?.subtitle),

      mission_title_df: safeStr(missionSection?.title),
      mission_subtitle_df: safeStr(missionSection?.subtitle),

      testimonial_title_df: safeStr(testimonialSection?.title),
      testimonial_subtitle_df: safeStr(testimonialSection?.subtitle),
    };

    // init all langs empty first
    uiLangs.forEach((l) => {
      next[`title_${l.id}`] = '';
      next[`meta_title_${l.id}`] = '';
      next[`meta_description_${l.id}`] = '';
      next[`meta_keywords_${l.id}`] = [];

      next[`about_title_${l.id}`] = '';
      next[`about_subtitle_${l.id}`] = '';
      next[`about_description_${l.id}`] = '';

      next[`story_title_${l.id}`] = '';
      next[`story_subtitle_${l.id}`] = '';

      next[`mission_title_${l.id}`] = '';
      next[`mission_subtitle_${l.id}`] = '';

      next[`testimonial_title_${l.id}`] = '';
      next[`testimonial_subtitle_${l.id}`] = '';
    });

    // first UI lang mirrors df
    next[`title_${firstUILangId}`] = next.title_df || '';
    next[`meta_title_${firstUILangId}`] = next.meta_title_df || '';
    next[`meta_description_${firstUILangId}`] = next.meta_description_df || '';
    next[`meta_keywords_${firstUILangId}`] = next.meta_keywords_df || [];

    next[`about_title_${firstUILangId}`] = next.about_title_df || '';
    next[`about_subtitle_${firstUILangId}`] = next.about_subtitle_df || '';
    next[`about_description_${firstUILangId}`] = next.about_description_df || '';

    next[`story_title_${firstUILangId}`] = next.story_title_df || '';
    next[`story_subtitle_${firstUILangId}`] = next.story_subtitle_df || '';

    next[`mission_title_${firstUILangId}`] = next.mission_title_df || '';
    next[`mission_subtitle_${firstUILangId}`] = next.mission_subtitle_df || '';

    next[`testimonial_title_${firstUILangId}`] = next.testimonial_title_df || '';
    next[`testimonial_subtitle_${firstUILangId}`] = next.testimonial_subtitle_df || '';

    // apply translations map (senin backend object-map: {tr:{...},en:{...}})
    const trMap =
      entity?.translations && typeof entity.translations === 'object' ? entity.translations : null;
    if (trMap) {
      Object.keys(trMap).forEach((langId) => {
        const tr = trMap?.[langId] ?? {};
        next[`title_${langId}`] = safeStr(tr.title);
        next[`meta_title_${langId}`] = safeStr(tr.meta_title);
        next[`meta_description_${langId}`] = safeStr(tr.meta_description);
        next[`meta_keywords_${langId}`] = metaKeywordsToArray(tr.meta_keywords);

        const c = tr?.content ?? {};

        next[`about_title_${langId}`] = safeStr(c?.about_section?.title);
        next[`about_subtitle_${langId}`] = safeStr(c?.about_section?.subtitle);
        next[`about_description_${langId}`] = safeStr(c?.about_section?.description);

        next[`story_title_${langId}`] = safeStr(c?.story_section?.title);
        next[`story_subtitle_${langId}`] = safeStr(c?.story_section?.subtitle);

        next[`mission_title_${langId}`] = safeStr(c?.mission_and_vision_section?.title);
        next[`mission_subtitle_${langId}`] = safeStr(c?.mission_and_vision_section?.subtitle);

        next[`testimonial_title_${langId}`] = safeStr(c?.testimonial_and_success_section?.title);
        next[`testimonial_subtitle_${langId}`] = safeStr(
          c?.testimonial_and_success_section?.subtitle,
        );
      });
    }

    reset(next, { keepDirty: false });

    // image init
    if (aboutSection?.image || aboutSection?.image_url) {
      setLastSelectedLogo({
        image_id: aboutSection?.image ?? '',
        img_url: aboutSection?.image_url ?? '/images/no-image.png',
        name: 'image',
      });
    } else {
      setLastSelectedLogo(null);
    }

    // steps init (mevcut state mantığını koruyorum)
    const storySteps = Array.isArray(storySection?.steps) ? storySection.steps : [];
    const missionSteps = Array.isArray(missionSection?.steps) ? missionSection.steps : [];
    const testimonialStepsArr = Array.isArray(testimonialSection?.steps)
      ? testimonialSection.steps
      : [];

    // DF fallback: df yoksa firstUILangId’yi df kabul et
    const dfKey = firstUILangId || 'tr';

    setOnBoardSteps(
      storySteps.length
        ? storySteps.map((s: any) => ({
            titles: { [dfKey]: safeStr(s?.title) },
            subtitles: { [dfKey]: safeStr(s?.subtitle) },
            image: { id: s?.image ?? '', url: s?.image_url ?? '' },
          }))
        : [],
    );

    setAttributeValues(
      missionSteps.length
        ? missionSteps.map((s: any) => ({
            titles: { [dfKey]: safeStr(s?.title) },
            subtitles: { [dfKey]: safeStr(s?.subtitle) },
            descriptions: { [dfKey]: safeStr(s?.description) },
            image: { id: s?.image ?? '', url: s?.image_url ?? '' },
          }))
        : [],
    );

    setTestimonialSteps(
      testimonialStepsArr.length
        ? testimonialStepsArr.map((s: any) => ({
            titles: { [dfKey]: safeStr(s?.title) },
            subtitles: { [dfKey]: safeStr(s?.subtitle) },
            descriptions: { [dfKey]: safeStr(s?.description) },
            image: { id: s?.image ?? '', url: s?.image_url ?? '' },
          }))
        : [],
    );

    // JSON init (DB’de translations_json varsa önce onu kullanmak isterdin; sende yok görünüyor)
    setTranslationsJson(buildJsonFromValues(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity?.id, firstUILangId, uiLangs?.length]);

  // JSON view enter -> snapshot
  useEffect(() => {
    if (viewMode !== 'json') return;
    const snap = getValues();
    setTranslationsJson(buildJsonFromValues(snap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handleSaveLogo = (images: UploadedImage[]) => {
    setLastSelectedLogo(images[0]);
    const dimensions = images[0].dimensions ?? '';
    const [width, height] = dimensions.split(' x ').map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width / height;

    if (Math.abs(aspectRatio - 1 / 1) < 0.01) {
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

  const { mutate: updateAbout, isPending: isUpdating } = useAboutPageUpdateMutation();

  // steps helpers — senin mevcutlarını aynen koru
  const handleAddAttributeValue = () => {
    setAttributeValues((prev) => [
      ...prev,
      { titles: {}, subtitles: {}, descriptions: {}, charge_amount: '', image: '' },
    ]);
  };
  const handleDeleteAttributeValue = (index: number) => {
    setAttributeValues((prev) => prev.filter((_, i) => i !== index));
  };
  const handleChangeAttributeValue = (index: number, field: any, langId: string, value: any) => {
    setAttributeValues((prev) => {
      const updated = [...prev];
      if (field === 'image' && Array.isArray(value) && value.length > 0) {
        updated[index][field] = { id: value[0].image_id, url: value[0].img_url };
      } else if (field === 'titles' || field === 'subtitles' || field === 'descriptions') {
        updated[index][field] = { ...(updated[index][field] || {}), [langId]: value };
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  const handleAddTestimonialStep = () => {
    setTestimonialSteps((prev) => [
      ...prev,
      { titles: {}, subtitles: {}, descriptions: {}, charge_amount: '', image: '' },
    ]);
  };
  const handleDeleteTestimonialStep = (index: number) => {
    setTestimonialSteps((prev) => prev.filter((_, i) => i !== index));
  };
  const handleChangeTestimonialStep = (index: number, field: any, langId: string, value: any) => {
    setTestimonialSteps((prev) => {
      const updated = [...prev];
      if (field === 'image' && Array.isArray(value) && value.length > 0) {
        updated[index][field] = { id: value[0].image_id, url: value[0].img_url };
      } else if (field === 'titles' || field === 'subtitles' || field === 'descriptions') {
        updated[index][field] = { ...(updated[index][field] || {}), [langId]: value };
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  const handleAddOnBoardStep = () => {
    setOnBoardSteps((prev) => [
      ...prev,
      { titles: {}, subtitles: {}, charge_amount: '', image: '' },
    ]);
  };
  const handleDeleteOnBoardStep = (index: number) => {
    setOnBoardSteps((prev) => prev.filter((_, i) => i !== index));
  };
  const handleChangeOnBoardStep = (index: number, field: any, langId: string, value: any) => {
    setOnBoardSteps((prev) => {
      const updated = [...prev];
      if (field === 'image' && Array.isArray(value) && value.length > 0) {
        updated[index][field] = { id: value[0].image_id, url: value[0].img_url };
      } else if (field === 'titles' || field === 'subtitles') {
        updated[index][field] = { ...(updated[index][field] || {}), [langId]: value };
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  const onSubmit = async (values: AboutSettingsFormData) => {
    // JSON snapshot (root fields)
    const translations_json = buildJsonFromValues(values);
    setTranslationsJson(translations_json);

    const defaultData: any = {
      title: safeStr(values.title_df),
      meta_title: safeStr(values.meta_title_df),
      meta_description: safeStr(values.meta_description_df),
      meta_keywords: metaKeywordsToString(values.meta_keywords_df),
    };

    if (safeStr(values.status)) defaultData.status = safeStr(values.status);

    const about_section = {
      title: safeStr(values.about_title_df),
      subtitle: safeStr(values.about_subtitle_df),
      description: safeStr(values.about_description_df),
      image: lastSelectedLogo ? lastSelectedLogo?.image_id : '',
      image_url: '',
    };

    const story_section = {
      title: safeStr(values.story_title_df),
      subtitle: safeStr(values.story_subtitle_df),
      steps: (onBoardSteps || []).map(({ titles, subtitles, image }) => ({
        // df yoksa firstUILangId’yi df kabul et
        title: titles?.df ?? titles?.[firstUILangId] ?? '',
        subtitle: subtitles?.df ?? subtitles?.[firstUILangId] ?? '',
        image: (image as any)?.id || null,
      })),
    };

    const mission_and_vision_section = {
      title: safeStr(values.mission_title_df),
      subtitle: safeStr(values.mission_subtitle_df),
      steps: (attributeValues || []).map(({ titles, subtitles, descriptions, image }) => ({
        title: titles?.df ?? titles?.[firstUILangId] ?? '',
        subtitle: subtitles?.df ?? subtitles?.[firstUILangId] ?? '',
        description: descriptions?.df ?? descriptions?.[firstUILangId] ?? '',
        image: (image as any)?.id || null,
      })),
    };

    const testimonial_and_success_section = {
      title: safeStr(values.testimonial_title_df),
      subtitle: safeStr(values.testimonial_subtitle_df),
      steps: (testimonialSteps || []).map(({ titles, subtitles, descriptions, image }) => ({
        title: titles?.df ?? titles?.[firstUILangId] ?? '',
        subtitle: subtitles?.df ?? subtitles?.[firstUILangId] ?? '',
        description: descriptions?.df ?? descriptions?.[firstUILangId] ?? '',
        image: (image as any)?.id || null,
      })),
    };

    const translations = (uiLangsOnly || []).map((lang) => ({
      language_code: lang.id,
      title: safeStr((values as any)[`title_${lang.id}`]),
      meta_title: safeStr((values as any)[`meta_title_${lang.id}`]),
      meta_description: safeStr((values as any)[`meta_description_${lang.id}`]),
      meta_keywords: metaKeywordsToString((values as any)[`meta_keywords_${lang.id}`]),
      content: {
        about_section: {
          title: safeStr((values as any)[`about_title_${lang.id}`]),
          subtitle: safeStr((values as any)[`about_subtitle_${lang.id}`]),
          description: safeStr((values as any)[`about_description_${lang.id}`]),
          image: lastSelectedLogo ? lastSelectedLogo?.image_id : '',
          image_url: '',
        },
        story_section: {
          title: safeStr((values as any)[`story_title_${lang.id}`]),
          subtitle: safeStr((values as any)[`story_subtitle_${lang.id}`]),
          steps: (onBoardSteps || []).map(({ titles, subtitles, image }) => ({
            title: titles?.[lang.id] ?? titles?.df ?? titles?.[firstUILangId] ?? '',
            subtitle: subtitles?.[lang.id] ?? subtitles?.df ?? subtitles?.[firstUILangId] ?? '',
            image: (image as any)?.id || null,
          })),
        },
        mission_and_vision_section: {
          title: safeStr((values as any)[`mission_title_${lang.id}`]),
          subtitle: safeStr((values as any)[`mission_subtitle_${lang.id}`]),
          steps: (attributeValues || []).map(({ titles, subtitles, descriptions, image }) => ({
            title: titles?.[lang.id] ?? titles?.df ?? titles?.[firstUILangId] ?? '',
            subtitle: subtitles?.[lang.id] ?? subtitles?.df ?? subtitles?.[firstUILangId] ?? '',
            description:
              descriptions?.[lang.id] ?? descriptions?.df ?? descriptions?.[firstUILangId] ?? '',
            image: (image as any)?.id || null,
          })),
        },
        testimonial_and_success_section: {
          title: safeStr((values as any)[`testimonial_title_${lang.id}`]),
          subtitle: safeStr((values as any)[`testimonial_subtitle_${lang.id}`]),
          steps: (testimonialSteps || []).map(({ titles, subtitles, descriptions, image }) => ({
            title: titles?.[lang.id] ?? titles?.df ?? titles?.[firstUILangId] ?? '',
            subtitle: subtitles?.[lang.id] ?? subtitles?.df ?? subtitles?.[firstUILangId] ?? '',
            description:
              descriptions?.[lang.id] ?? descriptions?.df ?? descriptions?.[firstUILangId] ?? '',
            image: (image as any)?.id || null,
          })),
        },
      },
    }));

    const submissionData: any = {
      id: entity?.id ? entity?.id : 0,
      ...defaultData,
      theme_name: safeStr(values.theme_name),
      content: {
        about_section,
        story_section,
        mission_and_vision_section,
        testimonial_and_success_section,
      },
      translations,
      translations_json, // backend kabul ediyorsa ekle; kabul etmiyorsa kaldır
    };

    return updateAbout(submissionData, {
      onSuccess: () => setLogoErrorMessage(''),
    });
  };

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
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] h-20 border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className=" w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
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

  const jsonValue = useMemo(
    () => ensureLangKeys(safeObject(translationsJson), uiLangs as any),
    [translationsJson, uiLangs],
  );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Toggle Form/JSON */}
        <Card className="mt-4 sticky top-14 z-20">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              About Page Settings
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
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="About Page JSON (root fields)"
                languages={uiLangs}
                value={jsonValue}
                onChange={applyJsonToForm}
                perLanguage
                showAllTab
              />
            </CardContent>
          </Card>
        ) : (
          <div>
            {/* i18n Tabs — CONTROLLED */}
            <Tabs
              value={activeLangId || firstUILangId || (uiLangsOnly?.[0]?.id ?? '')}
              onValueChange={setActiveLangId}
              className=""
            >
              <Card className="mt-4">
                <CardContent className="px-0 md:px-6 py-2">
                  <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                    {uiLangsOnly.map((lang) => (
                      <TabsTrigger key={lang.id} value={lang.id}>
                        {lang.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </CardContent>
              </Card>
              {/* HEADER/SEO */}
              <Card dir={dir}>
                <CardContent className="mt-4 p-4">
                  {uiLangsOnly.map((lang) => (
                    <TabsContent key={lang.id} value={lang.id} forceMount>
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
                                  onSelect={(value) => field.onChange(String(value ?? ''))}
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
                              id={`title_${lang.id}`}
                              {...register(`title_${lang.id}` as keyof AboutSettingsFormData)}
                              className="app-input"
                              placeholder={t('place_holder.enter_title')}
                            />
                            {(errors as any)?.[`title_${lang.id}`]?.message ? (
                              <p className="text-red-500 text-sm mt-1">
                                {String((errors as any)[`title_${lang.id}`]?.message)}
                              </p>
                            ) : null}
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
                                  onSelect={(value) => field.onChange(String(value ?? ''))}
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
                                {t('label.meta_title')} (
                                {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                              </span>
                            </p>
                            <Input
                              id={`meta_title_${lang.id}`}
                              {...register(`meta_title_${lang.id}` as keyof AboutSettingsFormData)}
                              className="app-input"
                              placeholder={t('place_holder.enter_meta_title')}
                            />
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
                              {...register(
                                `meta_description_${lang.id}` as keyof AboutSettingsFormData,
                              )}
                              className="app-input"
                              placeholder={t('place_holder.enter_meta_description')}
                            />
                          </div>

                          <div>
                            <div className="text-sm font-medium flex items-center gap-2">
                              <span>
                                {t('label.meta_keywords')} (
                                {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
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
                              name={`meta_keywords_${lang.id}` as keyof AboutSettingsFormData}
                              control={control}
                              render={({ field }) => (
                                <TagsInput
                                  value={Array.isArray(field.value) ? field.value : []}
                                  onChange={(newValue: string[]) => field.onChange(newValue)}
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
              {/* ABOUT SECTION */}
              <Card className="mt-4">
                <CardContent className="p-2 md:p-6">
                  <div dir={dir}>
                    <h1 className="text-lg md:text-2xl font-medium mb-4">About Section</h1>

                    {uiLangsOnly.map((lang) => (
                      <TabsContent key={lang.id} value={lang.id} forceMount>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                          <div>
                            <div className="mb-4">
                              <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>Title ({lang.label})</span>
                              </div>
                              <Input
                                id={`about_title_${lang.id}`}
                                {...register(
                                  `about_title_${lang.id}` as keyof AboutSettingsFormData,
                                )}
                                className="app-input"
                                placeholder="Enter value"
                              />
                            </div>

                            <div className="mb-4">
                              <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>Subtitle ({lang.label})</span>
                              </div>
                              <Input
                                id={`about_subtitle_${lang.id}`}
                                {...register(
                                  `about_subtitle_${lang.id}` as keyof AboutSettingsFormData,
                                )}
                                className="app-input"
                                placeholder="Enter value"
                              />
                            </div>

                            <div className="mb-4">
                              <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>Description ({lang.label})</span>
                              </div>
                              <Textarea
                                id={`about_description_${lang.id}`}
                                {...register(
                                  `about_description_${lang.id}` as keyof AboutSettingsFormData,
                                )}
                                className="app-input"
                                placeholder="Enter value"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="mt-0 md:mt-4">
                              <p className="text-sm font-medium flex items-center gap-2 mb-1">
                                <span>Image</span>
                              </p>
                              <div className="relative flex align-start gap-4">
                                <div className="relative w-32">
                                  <PhotoUploadModal
                                    trigger={triggerLogo}
                                    isMultiple={false}
                                    onSave={handleSaveLogo}
                                    usageType="about_settings"
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
                                </div>
                              </div>
                              {errorLogoMessage ? (
                                <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardContent className="p-2 md:p-6">
                  <div dir={dir} className="">
                    <h1 className="text-lg md:text-2xl font-medium mb-4">Story Section</h1>
                    <div>
                      {uiLangsOnly.map((lang) => {
                        return (
                          <TabsContent key={lang.id} value={lang.id}>
                            <div className="">
                              <div className="mb-4">
                                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <span> Title ({lang.label})</span>
                                  <div>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-custom-dark-blue">
                                          <p className="p-1 text-sm font-medium">
                                            Please provide title{' '}
                                            <span>
                                              {' '}
                                              {lang.label !== 'Default' && `in ${lang.label}`}
                                            </span>
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                                <Input
                                  id={`story_title_${lang.id}`}
                                  {...register(
                                    `story_title_${lang.id}` as keyof AboutSettingsFormData,
                                  )}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>
                              <div className="mb-4">
                                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <span> Subtitle ({lang.label})</span>
                                  <div>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-custom-dark-blue">
                                          <p className="p-1 text-sm font-medium">
                                            Please provide subtitle{' '}
                                            <span>
                                              {' '}
                                              {lang.label !== 'Default' && `in ${lang.label}`}
                                            </span>
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                                <Input
                                  id={`story_subtitle_${lang.id}`}
                                  {...register(
                                    `story_subtitle_${lang.id}` as keyof AboutSettingsFormData,
                                  )}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>
                              <div className="mt-8 w-full text-sm font-semibold flex items-center justify-between ">
                                <span>Story Steps</span>
                                <span
                                  onClick={handleAddOnBoardStep}
                                  className="flex items-center cursor-pointer bg-blue-50 border border-blue-500 text-blue-500 text-sm font-bold shadow-2xl px-2 py-2 rounded hover:bg-blue-500 hover:text-white"
                                >
                                  Add more
                                </span>
                              </div>
                              <div className="max-h-[300px] overflow-x-auto custom-scrollbar">
                                {onBoardSteps.map((value, index) => (
                                  <div
                                    key={index}
                                    className="my-4 flex items-end w-full gap-4 border-t md:border-0"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 mr-6 ">
                                      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8 ">
                                        <div className="flex  flex-col items-center">
                                          <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                            Image
                                          </p>

                                          {
                                            //@ts-ignore
                                            value?.image?.url ? (
                                              <div className="relative w-10 h-10">
                                                <Image
                                                  loader={GlobalImageLoader}
                                                  //@ts-ignore
                                                  src={value?.image?.url}
                                                  alt="Uploaded"
                                                  layout="fill"
                                                  className="object-cover border rounded"
                                                />
                                                <button
                                                  onClick={() =>
                                                    handleChangeOnBoardStep(
                                                      index,
                                                      'image',
                                                      '',
                                                      null,
                                                    )
                                                  }
                                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center"
                                                >
                                                  X
                                                </button>
                                              </div>
                                            ) : (
                                              <PhotoUploadModal
                                                trigger={
                                                  <div className="w-10 h-10 rounded border-2 border-dashed border-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-50">
                                                    <CloudIcon />
                                                  </div>
                                                }
                                                isMultiple={false}
                                                onSave={(uploadedImage) =>
                                                  handleChangeOnBoardStep(
                                                    index,
                                                    'image',
                                                    '',
                                                    uploadedImage,
                                                  )
                                                }
                                                usageType="about_settings"
                                              />
                                            )
                                          }
                                        </div>

                                        <div className="w-full">
                                          <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                            Title
                                          </p>
                                          <Input
                                            type="text"
                                            value={value?.titles[lang.id] || ''}
                                            onChange={(e) =>
                                              handleChangeOnBoardStep(
                                                index,
                                                'titles',
                                                lang.id,
                                                e.target.value,
                                              )
                                            }
                                            className="app-input flex-grow py-2"
                                            placeholder="Enter value"
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                          Sub Title
                                        </p>
                                        <Input
                                          type="text"
                                          value={value?.subtitles[lang.id] || ''}
                                          onChange={(e) =>
                                            handleChangeOnBoardStep(
                                              index,
                                              'subtitles',
                                              lang.id,
                                              e.target.value,
                                            )
                                          }
                                          className="app-input flex-grow py-2"
                                          placeholder="Enter value"
                                        />
                                      </div>
                                    </div>
                                    {index === 0 ? (
                                      <span className="flex items-center cursor-not-allowed bg-slate-500 text-slate-300 text-sm font-bold shadow-2xl px-2 py-2.5 rounded">
                                        Default
                                      </span>
                                    ) : (
                                      <span
                                        onClick={() => handleDeleteOnBoardStep(index)}
                                        className="cursor-pointer bg-red-500 text-white shadow-2xl px-3 py-2 rounded"
                                      >
                                        Close
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardContent className="p-2 md:p-6">
                  <div dir={dir} className="">
                    <h1 className="text-lg md:text-2xl font-medium mb-4">
                      Mission & Vision Section
                    </h1>
                    <div>
                      {uiLangsOnly.map((lang) => {
                        return (
                          <TabsContent key={lang.id} value={lang.id}>
                            <div className="">
                              <div className="mb-4">
                                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <span> Title ({lang.label})</span>
                                  <div>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-custom-dark-blue">
                                          <p className="p-1 text-sm font-medium">
                                            Please provide title{' '}
                                            <span>
                                              {' '}
                                              {lang.label !== 'Default' && `in ${lang.label}`}
                                            </span>
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                                <Input
                                  id={`mission_title_${lang.id}`}
                                  {...register(
                                    `mission_title_${lang.id}` as keyof AboutSettingsFormData,
                                  )}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>
                              <div className="mb-4">
                                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <span> Subtitle ({lang.label})</span>
                                  <div>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-custom-dark-blue">
                                          <p className="p-1 text-sm font-medium">
                                            Please provide subtitle{' '}
                                            <span>
                                              {' '}
                                              {lang.label !== 'Default' && `in ${lang.label}`}
                                            </span>
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                                <Input
                                  id={`mission_subtitle_${lang.id}`}
                                  {...register(
                                    `mission_subtitle_${lang.id}` as keyof AboutSettingsFormData,
                                  )}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>
                              <div className="mt-8 text-sm font-semibold flex items-center justify-between ">
                                <span>Mission & Vision Steps</span>
                                <span
                                  onClick={handleAddAttributeValue}
                                  className="flex items-center cursor-pointer bg-blue-50 border border-blue-500 text-blue-500 text-sm font-bold shadow-2xl px-2 py-2 rounded hover:bg-blue-500 hover:text-white"
                                >
                                  Add more
                                </span>
                              </div>
                              <div className="max-h-[300px] overflow-x-auto custom-scrollbar">
                                {attributeValues.map((value, index) => (
                                  <div
                                    key={index}
                                    className="my-4 flex items-end w-full gap-4 border-t md:border-0"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 mr-6 ">
                                      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8 ">
                                        <div className="flex flex-col items-center ">
                                          <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                            Image
                                          </p>

                                          {
                                            //@ts-ignore
                                            value?.image?.url ? (
                                              <div className="relative w-10 h-10">
                                                <Image
                                                  loader={GlobalImageLoader}
                                                  //@ts-ignore
                                                  src={value?.image.url}
                                                  alt="Uploaded"
                                                  layout="fill"
                                                  className="object-cover border rounded"
                                                />
                                                <button
                                                  onClick={() =>
                                                    handleChangeAttributeValue(
                                                      index,
                                                      'image',
                                                      '',
                                                      null,
                                                    )
                                                  }
                                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center"
                                                >
                                                  X
                                                </button>
                                              </div>
                                            ) : (
                                              <PhotoUploadModal
                                                trigger={
                                                  <div className="w-10 h-10 rounded border-2 border-dashed border-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-50">
                                                    <CloudIcon />
                                                  </div>
                                                }
                                                isMultiple={false}
                                                onSave={(uploadedImage) =>
                                                  handleChangeAttributeValue(
                                                    index,
                                                    'image',
                                                    '',
                                                    uploadedImage,
                                                  )
                                                }
                                                usageType="about_settings"
                                              />
                                            )
                                          }
                                        </div>
                                        <div className=" w-full">
                                          <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                            Title
                                          </p>
                                          <Input
                                            type="text"
                                            value={value?.titles[lang.id] || ''}
                                            onChange={(e) =>
                                              handleChangeAttributeValue(
                                                index,
                                                'titles',
                                                lang.id,
                                                e.target.value,
                                              )
                                            }
                                            className="app-input flex-grow py-2"
                                            placeholder="Enter value"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className=" w-full">
                                          <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                            Sub Title
                                          </p>
                                          <Input
                                            type="text"
                                            value={value?.subtitles[lang.id] || ''}
                                            onChange={(e) =>
                                              handleChangeAttributeValue(
                                                index,
                                                'subtitles',
                                                lang.id,
                                                e.target.value,
                                              )
                                            }
                                            className="app-input flex-grow py-2"
                                            placeholder="Enter value"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className=" w-full">
                                          <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                            Descriptions
                                          </p>
                                          <Input
                                            type="text"
                                            value={value?.descriptions[lang.id] || ''}
                                            onChange={(e) =>
                                              handleChangeAttributeValue(
                                                index,
                                                'descriptions',
                                                lang.id,
                                                e.target.value,
                                              )
                                            }
                                            className="app-input flex-grow py-2"
                                            placeholder="Enter value"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    {index === 0 ? (
                                      <span className="flex items-center cursor-not-allowed bg-slate-500 text-slate-300 text-sm font-bold shadow-2xl px-2 py-2.5 rounded">
                                        Default
                                      </span>
                                    ) : (
                                      <span
                                        onClick={() => handleDeleteAttributeValue(index)}
                                        className="cursor-pointer bg-red-500 text-white shadow-2xl px-3 py-2 rounded"
                                      >
                                        Close
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardContent className="p-2 md:p-6">
                  <div dir={dir} className="">
                    <h1 className="text-lg md:text-2xl font-medium mb-4">
                      Testimonial & Success Section
                    </h1>
                    <div>
                      {uiLangsOnly.map((lang) => {
                        return (
                          <TabsContent key={lang.id} value={lang.id}>
                            <div className="">
                              <div className="mb-4">
                                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <span> Title ({lang.label})</span>
                                  <div>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-custom-dark-blue">
                                          <p className="p-1 text-sm font-medium">
                                            Please provide title{' '}
                                            <span>
                                              {' '}
                                              {lang.label !== 'Default' && `in ${lang.label}`}
                                            </span>
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                                <Input
                                  id={`testimonial_title_${lang.id}`}
                                  {...register(
                                    `testimonial_title_${lang.id}` as keyof AboutSettingsFormData,
                                  )}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>
                              <div className="mb-4">
                                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <span> Subtitle ({lang.label})</span>
                                  <div>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-custom-dark-blue">
                                          <p className="p-1 text-sm font-medium">
                                            Please provide subtitle{' '}
                                            <span>
                                              {' '}
                                              {lang.label !== 'Default' && `in ${lang.label}`}
                                            </span>
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                                <Input
                                  id={`testimonial_subtitle_${lang.id}`}
                                  {...register(
                                    `testimonial_subtitle_${lang.id}` as keyof AboutSettingsFormData,
                                  )}
                                  className="app-input"
                                  placeholder="Enter value"
                                />
                              </div>
                              <div className="mt-8 text-sm font-semibold flex items-center justify-between ">
                                <span>Testimonial & Success Steps</span>
                                <span
                                  onClick={handleAddTestimonialStep}
                                  className="flex items-center cursor-pointer bg-blue-50 border border-blue-500 text-blue-500 text-sm font-bold shadow-2xl px-2 py-2 rounded hover:bg-blue-500 hover:text-white"
                                >
                                  Add more
                                </span>
                              </div>
                              <div className="max-h-[300px] overflow-x-auto custom-scrollbar">
                                {testimonialSteps.map((value, index) => (
                                  <div
                                    key={index}
                                    className="my-4 flex items-end w-full gap-4 border-t md:border-0"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 mr-6 ">
                                      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8 ">
                                        <div className="flex flex-col items-center ">
                                          <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                            Image
                                          </p>

                                          {
                                            //@ts-ignore
                                            value?.image?.url ? (
                                              <div className="relative w-10 h-10">
                                                <Image
                                                  loader={GlobalImageLoader}
                                                  //@ts-ignore
                                                  src={value?.image.url}
                                                  alt="Uploaded"
                                                  layout="fill"
                                                  className="object-cover border rounded"
                                                />
                                                <button
                                                  onClick={() =>
                                                    handleChangeTestimonialStep(
                                                      index,
                                                      'image',
                                                      '',
                                                      null,
                                                    )
                                                  }
                                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center"
                                                >
                                                  X
                                                </button>
                                              </div>
                                            ) : (
                                              <PhotoUploadModal
                                                trigger={
                                                  <div className="w-10 h-10 rounded border-2 border-dashed border-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-50">
                                                    <CloudIcon />
                                                  </div>
                                                }
                                                isMultiple={false}
                                                onSave={(uploadedImage) =>
                                                  handleChangeTestimonialStep(
                                                    index,
                                                    'image',
                                                    '',
                                                    uploadedImage,
                                                  )
                                                }
                                                usageType="about_settings"
                                              />
                                            )
                                          }
                                        </div>
                                        <div className=" w-full">
                                          <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                            Title
                                          </p>
                                          <Input
                                            type="text"
                                            value={value?.titles[lang.id] || ''}
                                            onChange={(e) =>
                                              handleChangeTestimonialStep(
                                                index,
                                                'titles',
                                                lang.id,
                                                e.target.value,
                                              )
                                            }
                                            className="app-input flex-grow py-2"
                                            placeholder="Enter value"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className=" w-full">
                                          <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                            Sub Title
                                          </p>
                                          <Input
                                            type="text"
                                            value={value?.subtitles[lang.id] || ''}
                                            onChange={(e) =>
                                              handleChangeTestimonialStep(
                                                index,
                                                'subtitles',
                                                lang.id,
                                                e.target.value,
                                              )
                                            }
                                            className="app-input flex-grow py-2"
                                            placeholder="Enter value"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className=" w-full">
                                          <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                            Description
                                          </p>
                                          <Input
                                            type="text"
                                            value={value?.descriptions[lang.id] || ''}
                                            onChange={(e) =>
                                              handleChangeTestimonialStep(
                                                index,
                                                'descriptions',
                                                lang.id,
                                                e.target.value,
                                              )
                                            }
                                            className="app-input flex-grow py-2"
                                            placeholder="Enter value"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    {index === 0 ? (
                                      <span className="flex items-center cursor-not-allowed bg-slate-500 text-slate-300 text-sm font-bold shadow-2xl px-2 py-2.5 rounded">
                                        Default
                                      </span>
                                    ) : (
                                      <span
                                        onClick={() => handleDeleteTestimonialStep(index)}
                                        className="cursor-pointer bg-red-500 text-white shadow-2xl px-3 py-2 rounded"
                                      >
                                        Close
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>{' '}
            </Tabs>
          </div>
        )}

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton IsLoading={isUpdating} AddLabel="Save Changes" />
        </Card>
      </form>
    </div>
  );
};

export default AboutSettingsForm;
