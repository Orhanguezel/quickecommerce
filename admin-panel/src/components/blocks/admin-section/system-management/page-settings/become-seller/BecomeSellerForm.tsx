// =============================================================
// FILE: src/components/blocks/admin-section/system-management/page-settings/become-seller/BecomeSellerForm.tsx
// FINAL — bugfix + cleanup (keeps current UI approach, no JSON panel)
// Fixes:
// - Tabs MUST be controlled (Radix defaultValue doesn't update reliably)
// - FAQ payload bug: faq_section.steps MUST use faqSteps (NOT onBoardSteps)
// - translations.content.login_register_section includes social_button_enable_disable
// - safe meta_keywords split (no [""])
// - remove buttons inside <form> use preventDefault to avoid accidental submit
// - state init: faqSteps/attributeValues default to one empty row (not data.charges)
// - video_url registered once (not per-language content except same value)
// =============================================================

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import CloudIcon from '@/assets/icons/CloudIcon';
import { AppSelect } from '@/components/blocks/common';
import Cancel from '@/components/blocks/custom-icons/Cancel';
import { SubmitButton } from '@/components/blocks/shared';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';

import multiLang from '@/components/molecules/multiLang.json';
import {
  Card,
  CardContent,
  Input,
  Switch,
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
import { TagsInput } from '@/components/ui/tags-input';

import GlobalImageLoader from '@/lib/imageLoader';
import { useAboutPageUpdateMutation } from '@/modules/admin-section/system-management/page-settings/become-seller/become-seller.action';
import {
  BecomeSellerFormData,
  becomeSellerSchema,
} from '@/modules/admin-section/system-management/page-settings/become-seller/become-seller.schema';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

type ToggleState = {
  social_button_enable_disable: string; // "on" | ""
};

type StepRow = {
  titles: Record<string, string>; // { df: "...", tr: "...", en: "..." }
  subtitles: Record<string, string>;
  image: any; // { id, url } | "" | null (kept loose to match your current usage)
  charge_amount: string;
};

const splitTags = (v?: string | null) =>
  (v ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const BecomeSellerForm = ({ data }: any) => {
  const t = useTranslations();
  const multiLangData = useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  // Controlled tabs (Radix)
  const [activeLang, setActiveLang] = useState<string>(multiLangData?.[0]?.id || 'df');

  const [toggles, setToggles] = useState<ToggleState>({
    social_button_enable_disable: '',
  });

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<BecomeSellerFormData>({
    resolver: zodResolver(becomeSellerSchema),
    defaultValues: {
      status: data?.data?.status ?? '',
      theme_name: data?.data?.theme_name ?? '',
    },
  });

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

  const [lastSelectedLogo2, setLastSelectedLogo2] = useState<any>(null);
  const [errorLogoMessage2, setLogoErrorMessage2] = useState<string>('');

  // Steps state (kept as your current local-state driven UI)
  const [attributeValues, setAttributeValues] = useState<StepRow[]>([
    { titles: {}, subtitles: {}, charge_amount: '', image: '' },
  ]);

  const [faqSteps, setFaqSteps] = useState<StepRow[]>([
    { titles: {}, subtitles: {}, charge_amount: '', image: '' },
  ]);

  const [onBoardSteps, setOnBoardSteps] = useState<StepRow[]>([
    { titles: {}, subtitles: {}, charge_amount: '', image: '' },
  ]);

  useEffect(() => {
    const QueryBecomeSellersData = (data as any)?.data || {};
    if (!QueryBecomeSellersData) return;

    const VideoSectionData = QueryBecomeSellersData?.content?.video_section;
    const LoginSectionData = QueryBecomeSellersData?.content?.login_register_section;
    const OnBoardSectionData = QueryBecomeSellersData?.content?.on_board_section;
    const ContactSectionData = QueryBecomeSellersData?.content?.contact_section;
    const JoinBenefitsSectionData = QueryBecomeSellersData?.content?.join_benefits_section;
    const FaqSectionData = QueryBecomeSellersData?.content?.faq_section;

    // Root/default (df)
    setValue('title_df', QueryBecomeSellersData?.title ?? '');
    setValue('meta_title_df', QueryBecomeSellersData?.meta_title ?? '');
    setValue('meta_description_df', QueryBecomeSellersData?.meta_description ?? '');
    setValue('meta_keywords_df', splitTags(QueryBecomeSellersData?.meta_keywords));
    setValue('status', QueryBecomeSellersData?.status ?? '');
    setValue('theme_name', QueryBecomeSellersData?.theme_name ?? '');

    if (LoginSectionData) {
      setValue('register_title_df', LoginSectionData?.register_title ?? '');
      setValue('register_subtitle_df', LoginSectionData?.register_subtitle ?? '');
      setValue('login_title_df', LoginSectionData?.login_title ?? '');
      setValue('login_subtitle_df', LoginSectionData?.login_subtitle ?? '');
      setValue('agree_button_title_df', LoginSectionData?.agree_button_title ?? '');

      setToggles({
        social_button_enable_disable: LoginSectionData?.social_button_enable_disable || '',
      });

      setLastSelectedLogo({
        image_id: LoginSectionData?.background_image ?? '',
        img_url: LoginSectionData?.background_image_url ?? '/images/no-image.png',
        name: 'thumbnail image',
      });
    }

    if (OnBoardSectionData) {
      setValue('onboard_title_df', OnBoardSectionData?.title ?? '');
      setValue('onboard_subtitle_df', OnBoardSectionData?.subtitle ?? '');
    }

    if (VideoSectionData) {
      setValue('section_title_df', VideoSectionData?.section_title ?? '');
      setValue('section_subtitle_df', VideoSectionData?.section_subtitle ?? '');
      setValue('video_url', VideoSectionData?.video_url ?? '');
    }

    if (ContactSectionData) {
      setValue('contact_title_df', ContactSectionData?.title ?? '');
      setValue('contact_subtitle_df', ContactSectionData?.subtitle ?? '');
      setValue('contact_agree_button_title_df', ContactSectionData?.agree_button_title ?? '');
      setLastSelectedLogo2({
        image_id: ContactSectionData?.image ?? '',
        img_url: ContactSectionData?.image_url ?? '/images/no-image.png',
        name: 'thumbnail image',
      });
    }

    if (JoinBenefitsSectionData) {
      setValue('join_benefits_title_df', JoinBenefitsSectionData?.title ?? '');
      setValue('join_benefits_subtitle_df', JoinBenefitsSectionData?.subtitle ?? '');
    }

    if (FaqSectionData) {
      setValue('faq_title_df', FaqSectionData?.title ?? '');
      setValue('faq_subtitle_df', FaqSectionData?.subtitle ?? '');
    }

    // Translations
    if (QueryBecomeSellersData?.translations) {
      const nextOnBoard: StepRow[] = [];
      const nextJoinBenefits: StepRow[] = [];
      const nextFaq: StepRow[] = [];

      Object.keys(QueryBecomeSellersData.translations).forEach((language) => {
        const translation = QueryBecomeSellersData.translations[language];

        setValue(
          `meta_keywords_${language}` as keyof BecomeSellerFormData,
          splitTags(translation?.meta_keywords),
        );
        setValue(`title_${language}` as keyof BecomeSellerFormData, translation?.title ?? '');
        setValue(
          `meta_title_${language}` as keyof BecomeSellerFormData,
          translation?.meta_title ?? '',
        );
        setValue(
          `meta_description_${language}` as keyof BecomeSellerFormData,
          translation?.meta_description ?? '',
        );

        const LoginSectionDataT = translation?.content?.login_register_section;
        const OnBoardSectionDataT = translation?.content?.on_board_section;
        const JoinBenefitsSectionDataT = translation?.content?.join_benefits_section;
        const FaqSectionDataT = translation?.content?.faq_section;
        const ContactSectionDataT = translation?.content?.contact_section;
        const VideoSectionDataT = translation?.content?.video_section;

        if (LoginSectionDataT) {
          setValue(
            `register_title_${language}` as keyof BecomeSellerFormData,
            LoginSectionDataT?.register_title ?? '',
          );
          setValue(
            `register_subtitle_${language}` as keyof BecomeSellerFormData,
            LoginSectionDataT?.register_subtitle ?? '',
          );
          setValue(
            `login_title_${language}` as keyof BecomeSellerFormData,
            LoginSectionDataT?.login_title ?? '',
          );
          setValue(
            `login_subtitle_${language}` as keyof BecomeSellerFormData,
            LoginSectionDataT?.login_subtitle ?? '',
          );
          setValue(
            `agree_button_title_${language}` as keyof BecomeSellerFormData,
            LoginSectionDataT?.agree_button_title ?? '',
          );
        }

        if (VideoSectionDataT) {
          setValue(
            `section_title_${language}` as keyof BecomeSellerFormData,
            VideoSectionDataT?.section_title ?? '',
          );
          setValue(
            `section_subtitle_${language}` as keyof BecomeSellerFormData,
            VideoSectionDataT?.section_subtitle ?? '',
          );
        }

        if (ContactSectionDataT) {
          setValue(
            `contact_title_${language}` as keyof BecomeSellerFormData,
            ContactSectionDataT?.title ?? '',
          );
          setValue(
            `contact_subtitle_${language}` as keyof BecomeSellerFormData,
            ContactSectionDataT?.subtitle ?? '',
          );
          setValue(
            `contact_agree_button_title_${language}` as keyof BecomeSellerFormData,
            ContactSectionDataT?.agree_button_title ?? '',
          );
        }

        if (OnBoardSectionDataT) {
          setValue(
            `onboard_title_${language}` as keyof BecomeSellerFormData,
            OnBoardSectionDataT?.title ?? '',
          );
          setValue(
            `onboard_subtitle_${language}` as keyof BecomeSellerFormData,
            OnBoardSectionDataT?.subtitle ?? '',
          );

          (OnBoardSectionDataT?.steps || []).forEach((step: any, idx: number) => {
            if (!nextOnBoard[idx]) {
              nextOnBoard[idx] = {
                titles: {},
                subtitles: {},
                charge_amount: '',
                image: {},
              };
            }
            nextOnBoard[idx].titles[language] = step?.title || '';
            nextOnBoard[idx].subtitles[language] = step?.subtitle || '';
            nextOnBoard[idx].image = {
              id: step?.image || '',
              url: step?.image_url || '',
            };
          });
        }

        if (JoinBenefitsSectionDataT) {
          setValue(
            `join_benefits_title_${language}` as keyof BecomeSellerFormData,
            JoinBenefitsSectionDataT?.title ?? '',
          );
          setValue(
            `join_benefits_subtitle_${language}` as keyof BecomeSellerFormData,
            JoinBenefitsSectionDataT?.subtitle ?? '',
          );

          (JoinBenefitsSectionDataT?.steps || []).forEach((step: any, idx: number) => {
            if (!nextJoinBenefits[idx]) {
              nextJoinBenefits[idx] = {
                titles: {},
                subtitles: {},
                charge_amount: '',
                image: {},
              };
            }
            nextJoinBenefits[idx].titles[language] = step?.title || '';
            nextJoinBenefits[idx].subtitles[language] = step?.subtitle || '';
            nextJoinBenefits[idx].image = {
              id: step?.image || '',
              url: step?.image_url || '',
            };
          });
        }

        if (FaqSectionDataT) {
          setValue(
            `faq_title_${language}` as keyof BecomeSellerFormData,
            FaqSectionDataT?.title ?? '',
          );
          setValue(
            `faq_subtitle_${language}` as keyof BecomeSellerFormData,
            FaqSectionDataT?.subtitle ?? '',
          );

          (FaqSectionDataT?.steps || []).forEach((step: any, idx: number) => {
            if (!nextFaq[idx]) {
              nextFaq[idx] = {
                titles: {},
                subtitles: {},
                charge_amount: '',
                image: '',
              };
            }
            // API uses question/answer for faq steps
            nextFaq[idx].titles[language] = step?.question || '';
            nextFaq[idx].subtitles[language] = step?.answer || '';
          });
        }
      });

      setOnBoardSteps(nextOnBoard.length ? nextOnBoard : onBoardSteps);
      setAttributeValues(nextJoinBenefits.length ? nextJoinBenefits : attributeValues);
      setFaqSteps(nextFaq.length ? nextFaq : faqSteps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, setValue]);

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

  const removeLogo = (e?: any) => {
    e?.preventDefault?.();
    setLastSelectedLogo(null);
    setLogoErrorMessage('');
  };

  const handleSaveLogo2 = (images: UploadedImage[]) => {
    setLastSelectedLogo2(images[0]);
    const dimensions = images[0].dimensions ?? '';
    const [width, height] = dimensions.split(' x ').map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width / height;

    if (Math.abs(aspectRatio - 1 / 1) < 0.01) {
      setLogoErrorMessage2('');
      return true;
    }
    setLogoErrorMessage2('Image must have a 1:1 aspect ratio.');
    return false;
  };

  const removeLogo2 = (e?: any) => {
    e?.preventDefault?.();
    setLastSelectedLogo2(null);
    setLogoErrorMessage2('');
  };

  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => ({
      ...prev,
      [property]: prev[property] === 'on' ? '' : 'on',
    }));
  };

  // --- Steps handlers (same behavior, just kept tidy)
  const handleAddAttributeValue = () => {
    setAttributeValues((prev) => [
      ...prev,
      { titles: {}, subtitles: {}, charge_amount: '', image: '' },
    ]);
  };

  const handleDeleteAttributeValue = (index: number) => {
    setAttributeValues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeAttributeValue = (
    index: number,
    field: 'titles' | 'subtitles' | 'charge_amount' | 'image',
    langId: string,
    value: any,
  ) => {
    setAttributeValues((prev) => {
      const next = [...prev];

      if (field === 'image' && Array.isArray(value) && value.length > 0) {
        next[index][field] = { id: value[0].image_id, url: value[0].img_url };
      } else if (field === 'titles' || field === 'subtitles') {
        next[index][field] = { ...(next[index][field] as any), [langId]: value };
      } else {
        (next[index] as any)[field] = value;
      }

      return next;
    });
  };

  const handleAddFaqSteps = () => {
    setFaqSteps((prev) => [...prev, { titles: {}, subtitles: {}, charge_amount: '', image: '' }]);
  };

  const handleDeleteFaqSteps = (index: number) => {
    setFaqSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeFaqSteps = (
    index: number,
    field: 'titles' | 'subtitles' | 'charge_amount' | 'image',
    langId: string,
    value: any,
  ) => {
    setFaqSteps((prev) => {
      const next = [...prev];

      if (field === 'image' && Array.isArray(value) && value.length > 0) {
        next[index][field] = { id: value[0].image_id, url: value[0].img_url };
      } else if (field === 'titles' || field === 'subtitles') {
        next[index][field] = { ...(next[index][field] as any), [langId]: value };
      } else {
        (next[index] as any)[field] = value;
      }

      return next;
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

  const handleChangeOnBoardStep = (
    index: number,
    field: 'titles' | 'subtitles' | 'charge_amount' | 'image',
    langId: string,
    value: any,
  ) => {
    setOnBoardSteps((prev) => {
      const next = [...prev];

      if (field === 'image' && Array.isArray(value) && value.length > 0) {
        next[index][field] = { id: value[0].image_id, url: value[0].img_url };
      } else if (field === 'titles' || field === 'subtitles') {
        next[index][field] = { ...(next[index][field] as any), [langId]: value };
      } else {
        (next[index] as any)[field] = value;
      }

      return next;
    });
  };

  const { mutate: BecomeSellerStore, isPending: isUpdating } = useAboutPageUpdateMutation();

  const onSubmit = async (values: BecomeSellerFormData) => {
    const defaultData: any = {
      title: values.title_df,
      meta_title: values.meta_title_df,
      meta_description: values.meta_description_df,
      meta_keywords: (values.meta_keywords_df || []).join(', '),
      status: values?.status !== '' ? values.status : undefined,
    };

    const login_register_section = {
      register_title: values.register_title_df,
      register_subtitle: values.register_subtitle_df,
      login_title: values.login_title_df,
      login_subtitle: values.login_subtitle_df,
      agree_button_title: values.agree_button_title_df,
      social_button_enable_disable: toggles.social_button_enable_disable,
      background_image: lastSelectedLogo ? lastSelectedLogo.image_id : undefined,
      background_image_url: '',
    };

    const on_board_section = {
      title: values.onboard_title_df,
      subtitle: values.onboard_subtitle_df,
      steps: onBoardSteps.map(({ titles, subtitles, image }) => ({
        title: titles.df || '',
        subtitle: subtitles.df || '',
        image: (image as any)?.id || null,
      })),
    };

    const video_section = {
      section_title: values.section_title_df,
      section_subtitle: values.section_subtitle_df,
      video_url: values.video_url,
    };

    const join_benefits_section = {
      title: values.join_benefits_title_df,
      subtitle: values.join_benefits_subtitle_df,
      steps: attributeValues.map(({ titles, subtitles, image }) => ({
        title: titles.df || '',
        subtitle: subtitles.df || '',
        image: (image as any)?.id || null,
      })),
    };

    // ✅ FIX: faq_section uses faqSteps
    const faq_section = {
      title: values.faq_title_df,
      subtitle: values.faq_subtitle_df,
      steps: faqSteps.map(({ titles, subtitles }) => ({
        question: titles.df || '',
        answer: subtitles.df || '',
      })),
    };

    const contact_section = {
      title: values.contact_title_df,
      subtitle: values.contact_subtitle_df,
      agree_button_title: values.contact_agree_button_title_df,
      image: lastSelectedLogo2 ? lastSelectedLogo2.image_id : undefined,
      image_url: '',
    };

    const translations = multiLangData.filter((lang) => lang.id !== 'df').map((lang) => ({
      language_code: lang.id,
      title: (values as any)[`title_${lang.id}`],
      meta_title: (values as any)[`meta_title_${lang.id}`],
      meta_description: (values as any)[`meta_description_${lang.id}`],
      meta_keywords: ((values as any)[`meta_keywords_${lang.id}`] || []).join(', '),
      content: {
        login_register_section: {
          register_title: (values as any)[`register_title_${lang.id}`],
          register_subtitle: (values as any)[`register_subtitle_${lang.id}`],
          login_title: (values as any)[`login_title_${lang.id}`],
          login_subtitle: (values as any)[`login_subtitle_${lang.id}`],
          agree_button_title: (values as any)[`agree_button_title_${lang.id}`],
          social_button_enable_disable: toggles.social_button_enable_disable, // ✅ keep in translations too
          background_image: lastSelectedLogo ? lastSelectedLogo.image_id : undefined,
          background_image_url: '',
        },
        on_board_section: {
          title: (values as any)[`onboard_title_${lang.id}`] || '',
          subtitle: (values as any)[`onboard_subtitle_${lang.id}`] || '',
          steps: onBoardSteps.map(({ titles, subtitles, image }) => ({
            title: titles[lang.id] || titles.df || '',
            subtitle: subtitles[lang.id] || subtitles.df || '',
            image: (image as any)?.id || null,
          })),
        },
        video_section: {
          section_title: (values as any)[`section_title_${lang.id}`] || '',
          section_subtitle: (values as any)[`section_subtitle_${lang.id}`] || '',
          video_url: values.video_url, // same for all langs (as you had)
        },
        join_benefits_section: {
          title: (values as any)[`join_benefits_title_${lang.id}`] || '',
          subtitle: (values as any)[`join_benefits_subtitle_${lang.id}`] || '',
          steps: attributeValues.map(({ titles, subtitles, image }) => ({
            title: titles[lang.id] || titles.df || '',
            subtitle: subtitles[lang.id] || subtitles.df || '',
            image: (image as any)?.id || null,
          })),
        },
        faq_section: {
          title: (values as any)[`faq_title_${lang.id}`] || '',
          subtitle: (values as any)[`faq_subtitle_${lang.id}`] || '',
          steps: faqSteps.map(({ titles, subtitles }) => ({
            question: titles[lang.id] || titles.df || '',
            answer: subtitles[lang.id] || subtitles.df || '',
          })),
        },
        contact_section: {
          title: (values as any)[`contact_title_${lang.id}`] || '',
          subtitle: (values as any)[`contact_subtitle_${lang.id}`] || '',
          agree_button_title: (values as any)[`contact_agree_button_title_${lang.id}`] || '',
          image: lastSelectedLogo2 ? lastSelectedLogo2.image_id : undefined,
          image_url: '',
        },
      },
    }));

    const content = {
      login_register_section,
      on_board_section,
      video_section,
      join_benefits_section,
      faq_section,
      contact_section,
    };

    const submissionData = {
      id: data?.data?.id ? data.data.id : 0,
      ...defaultData,
      theme_name: values.theme_name,
      content,
      translations,
    };

    return BecomeSellerStore(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          setLogoErrorMessage('');
          setLogoErrorMessage2('');
        },
      },
    );
  };

  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo.img_url}
            alt={String(lastSelectedLogo?.name || 'image')}
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

  const triggerLogo2 = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo2?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo2.img_url}
            alt={String(lastSelectedLogo2?.name || 'image')}
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
        <Tabs value={activeLang} onValueChange={setActiveLang} className="">
          <Card className="mt-4 sticky top-14 z-20">
            <CardContent className="px-0 md:px-4 py-2">
              <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                {multiLangData.map((lang) => (
                  <TabsTrigger key={lang.id} value={lang.id}>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardContent>
          </Card>

          {/* SEO / Common */}
          <Card dir={dir}>
            <CardContent className="mt-4 p-4">
              {multiLangData.map((lang) => (
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
                              onSelect={(value) => field.onChange(value)}
                              groups={Themelist}
                              hideNone
                            />
                          )}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t('label.title')} ({t(`lang.${lang.id}` as any)})
                          </span>
                        </p>
                        <Input
                          id={`title_${lang.id}`}
                          {...register(`title_${lang.id}` as any)}
                          className="app-input"
                          placeholder={t('place_holder.enter_title')}
                        />
                        {(errors as any)[`title_${lang.id}`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {(errors as any)[`title_${lang.id}`]?.message}
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
                              onSelect={(value) => field.onChange(value)}
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
                            {t('label.meta_title')} ({t(`lang.${lang.id}` as any)})
                          </span>
                        </p>
                        <Input
                          id={`meta_title_${lang.id}`}
                          {...register(`meta_title_${lang.id}` as any)}
                          className="app-input"
                          placeholder={t('place_holder.enter_meta_title')}
                        />
                        {(errors as any)[`meta_title_${lang.id}`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {(errors as any)[`meta_title_${lang.id}`]?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>
                            {t('label.meta_description')} ({t(`lang.${lang.id}` as any)})
                          </span>
                        </p>
                        <Input
                          id={`meta_description_${lang.id}`}
                          {...register(`meta_description_${lang.id}` as any)}
                          className="app-input"
                          placeholder={t('place_holder.enter_meta_description')}
                        />
                        {(errors as any)[`meta_description_${lang.id}`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {(errors as any)[`meta_description_${lang.id}`]?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="text-sm font-medium flex items-center gap-2">
                          <span>
                            {t('label.meta_keywords')} ({t(`lang.${lang.id}` as any)})
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
                              onChange={(newValue: string[]) => field.onChange(newValue)}
                              placeholder={`${t('place_holder.enter_meta_key')} ${t(
                                `lang.${lang.id}` as any,
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

          {/* Login Register Section */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div dir={dir}>
                <h1 className="text-lg md:text-2xl font-medium mb-4">Login Register Section</h1>

                {multiLangData.map((lang) => (
                  <TabsContent key={lang.id} value={lang.id}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
                      <div>
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>Register Title ({lang.label})</span>
                          </div>
                          <Input
                            id={`register_title_${lang.id}`}
                            {...register(`register_title_${lang.id}` as any)}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>Register Subtitle ({lang.label})</span>
                          </div>
                          <Textarea
                            id={`register_subtitle_${lang.id}`}
                            {...register(`register_subtitle_${lang.id}` as any)}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>Login Title ({lang.label})</span>
                          </div>
                          <Input
                            id={`login_title_${lang.id}`}
                            {...register(`login_title_${lang.id}` as any)}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>Login Subtitle ({lang.label})</span>
                          </div>
                          <Textarea
                            id={`login_subtitle_${lang.id}`}
                            {...register(`login_subtitle_${lang.id}` as any)}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>

                        <div className="hidden mb-4">
                          <Input
                            id={`agree_button_title_${lang.id}`}
                            {...register(`agree_button_title_${lang.id}` as any)}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="grid grid-cols-5">
                          <p className="text-sm font-medium mb-1">Social Button</p>
                          <Switch
                            dir="ltr"
                            checked={toggles.social_button_enable_disable === 'on'}
                            onCheckedChange={() => handleToggle('social_button_enable_disable')}
                          />
                        </div>

                        <div className="mt-4">
                          <p className="text-sm font-medium flex items-center gap-2 mb-1">
                            <span>Login Register Image</span>
                          </p>

                          <div className="relative flex align-start gap-4">
                            <div className="relative w-32">
                              <PhotoUploadModal
                                trigger={triggerLogo}
                                isMultiple={false}
                                onSave={handleSaveLogo}
                                usageType="become_seller"
                                selectedImage={lastSelectedLogo}
                              />

                              {lastSelectedLogo?.img_url && (
                                <Cancel
                                  customClass="absolute top-0 right-0 m-1"
                                  onClick={(event: any) => {
                                    event.stopPropagation();
                                    removeLogo(event);
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
                    </div>
                  </TabsContent>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* On Board Section */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div dir={dir}>
                <h1 className="text-lg md:text-2xl font-medium mb-4">On Board Section</h1>

                {multiLangData.map((lang) => (
                  <TabsContent key={lang.id} value={lang.id}>
                    <div>
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Title ({lang.label})</span>
                        </div>
                        <Input
                          id={`onboard_title_${lang.id}`}
                          {...register(`onboard_title_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Subtitle ({lang.label})</span>
                        </div>
                        <Textarea
                          id={`onboard_subtitle_${lang.id}`}
                          {...register(`onboard_subtitle_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="mt-8 w-full text-sm font-semibold flex items-center justify-between">
                        <span>On Board Steps</span>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 mr-6">
                              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8">
                                <div className="flex flex-col items-center">
                                  <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                    Image
                                  </p>

                                  {value?.image?.url ? (
                                    <div className="relative w-10 h-10">
                                      <Image
                                        loader={GlobalImageLoader}
                                        src={value.image.url}
                                        alt="Uploaded"
                                        fill
                                        className="object-cover border rounded"
                                      />
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleChangeOnBoardStep(index, 'image', '', null);
                                        }}
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
                                        handleChangeOnBoardStep(index, 'image', '', uploadedImage)
                                      }
                                      usageType="become_seller"
                                    />
                                  )}
                                </div>

                                <div className="w-full">
                                  <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                    Title
                                  </p>
                                  <Input
                                    type="text"
                                    value={value?.titles?.[lang.id] || ''}
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
                                  value={value?.subtitles?.[lang.id] || ''}
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
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Video Section */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div dir={dir}>
                <h1 className="text-lg md:text-2xl font-medium mb-4">Video Section</h1>

                {multiLangData.map((lang) => (
                  <TabsContent key={lang.id} value={lang.id}>
                    <div>
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Video Title ({lang.label})</span>
                        </div>
                        <Input
                          id={`section_title_${lang.id}`}
                          {...register(`section_title_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Video Subtitle ({lang.label})</span>
                        </div>
                        <Textarea
                          id={`section_subtitle_${lang.id}`}
                          {...register(`section_subtitle_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>

                      {/* URL (same for all langs) */}
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Video URL</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-custom-dark-blue">
                                <p className="p-1 text-sm font-medium">Please provide Video URL</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <Input
                          id="video_url"
                          {...register('video_url' as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Join Benefits Section */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div dir={dir}>
                <h1 className="text-lg md:text-2xl font-medium mb-4">Join Benefits Section</h1>

                {multiLangData.map((lang) => (
                  <TabsContent key={lang.id} value={lang.id}>
                    <div>
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Title ({lang.label})</span>
                        </div>
                        <Input
                          id={`join_benefits_title_${lang.id}`}
                          {...register(`join_benefits_title_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Subtitle ({lang.label})</span>
                        </div>
                        <Textarea
                          id={`join_benefits_subtitle_${lang.id}`}
                          {...register(`join_benefits_subtitle_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="mt-8 text-sm font-semibold flex items-center justify-between">
                        <span>Join Benefits Step</span>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 mr-6">
                              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8">
                                <div className="flex flex-col items-center">
                                  <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                    Image
                                  </p>

                                  {value?.image?.url ? (
                                    <div className="relative w-10 h-10">
                                      <Image
                                        loader={GlobalImageLoader}
                                        src={value.image.url}
                                        alt="Uploaded"
                                        fill
                                        className="object-cover border rounded"
                                      />
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleChangeAttributeValue(index, 'image', '', null);
                                        }}
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
                                      usageType="become_seller"
                                    />
                                  )}
                                </div>

                                <div className="w-full">
                                  <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                    Title
                                  </p>
                                  <Input
                                    type="text"
                                    value={value?.titles?.[lang.id] || ''}
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

                              <div className="col-span-2 flex items-center gap-4">
                                <div className="w-full">
                                  <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                    Sub Title
                                  </p>
                                  <Input
                                    type="text"
                                    value={value?.subtitles?.[lang.id] || ''}
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
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div dir={dir}>
                <h1 className="text-lg md:text-2xl font-medium mb-4">FAQ Section</h1>

                {multiLangData.map((lang) => (
                  <TabsContent key={lang.id} value={lang.id}>
                    <div>
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Title ({lang.label})</span>
                        </div>
                        <Input
                          id={`faq_title_${lang.id}`}
                          {...register(`faq_title_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          <span>Subtitle ({lang.label})</span>
                        </div>
                        <Textarea
                          id={`faq_subtitle_${lang.id}`}
                          {...register(`faq_subtitle_${lang.id}` as any)}
                          className="app-input"
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="mt-8 text-sm font-semibold flex items-center justify-between">
                        <span>FAQ Steps</span>
                        <span
                          onClick={handleAddFaqSteps}
                          className="flex items-center cursor-pointer bg-blue-50 border border-blue-500 text-blue-500 text-sm font-bold shadow-2xl px-2 py-2 rounded hover:bg-blue-500 hover:text-white"
                        >
                          Add more
                        </span>
                      </div>

                      <div className="max-h-[300px] overflow-x-auto custom-scrollbar">
                        {faqSteps.map((value, index) => (
                          <div
                            key={index}
                            className="my-4 flex items-end w-full gap-4 border-t md:border-0"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 mr-6">
                              <div>
                                <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                  Question
                                </p>
                                <Input
                                  type="text"
                                  value={value?.titles?.[lang.id] || ''}
                                  onChange={(e) =>
                                    handleChangeFaqSteps(index, 'titles', lang.id, e.target.value)
                                  }
                                  className="app-input flex-grow py-2"
                                  placeholder="Enter value"
                                />
                              </div>

                              <div className="col-span-2">
                                <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                  Answer
                                </p>
                                <Input
                                  type="text"
                                  value={value?.subtitles?.[lang.id] || ''}
                                  onChange={(e) =>
                                    handleChangeFaqSteps(
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
                                onClick={() => handleDeleteFaqSteps(index)}
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
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div dir={dir}>
                <h1 className="text-lg md:text-2xl font-medium mb-4">Contact Section</h1>

                {multiLangData.map((lang) => (
                  <TabsContent key={lang.id} value={lang.id}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
                      <div>
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>Title ({lang.label})</span>
                          </div>
                          <Input
                            id={`contact_title_${lang.id}`}
                            {...register(`contact_title_${lang.id}` as any)}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>Subtitle ({lang.label})</span>
                          </div>
                          <Textarea
                            id={`contact_subtitle_${lang.id}`}
                            {...register(`contact_subtitle_${lang.id}` as any)}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>Agree Button Title ({lang.label})</span>
                          </div>
                          <Input
                            id={`contact_agree_button_title_${lang.id}`}
                            {...register(`contact_agree_button_title_${lang.id}` as any)}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2 mb-1">
                            <span>Contract Image</span>
                          </p>

                          <div className="relative flex align-start gap-4">
                            <div className="relative w-32">
                              <PhotoUploadModal
                                trigger={triggerLogo2}
                                isMultiple={false}
                                onSave={handleSaveLogo2}
                                usageType="become_seller"
                                selectedImage={lastSelectedLogo2}
                              />

                              {lastSelectedLogo2?.image_id && (
                                <Cancel
                                  customClass="absolute top-0 right-0 m-1"
                                  onClick={(event: any) => {
                                    event.stopPropagation();
                                    removeLogo2(event);
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          {errorLogoMessage2 && (
                            <p className="text-red-500 text-sm mt-1">{errorLogoMessage2}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </div>
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

export default BecomeSellerForm;
