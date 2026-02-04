"use client";
import CloudIcon from "@/assets/icons/CloudIcon";
import Loader from "@/components/molecules/Loader";
import multiLang from "@/components/molecules/multiLang.json";
import { SubmitButton } from "@/components/blocks/shared";
import {
  Card,
  CardContent,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useFooterCustomizationQuery,
  useFooterCustomizationStoreMutation,
} from "@/modules/admin-section/footer-customization/footer-customization.action";
import {
  FooterCustomizationFormData,
  footerCustomizationSchema,
} from "@/modules/admin-section/footer-customization/footer-customization.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import PhotoUploadModal, { type UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";
import Facebook from "@/assets/icons/Facebook";
import Twitter from "@/assets/icons/Twitter";
import Instagram from "@/assets/icons/Instagram";
import Linkedin from "@/assets/icons/Linkedin";
import Playstore from "@/assets/icons/Playstore";
import Appstore from "@/assets/icons/AppStore";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

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


const I18N_FIELDS = [
  "com_quick_access_title",];

type ToggleState = {
  com_payment_methods_enable_disable: string;
  com_quick_access_enable_disable: string;
  com_our_info_enable_disable: string;
  com_social_links_enable_disable: string;
  com_social_links_title: string;
};


const FooterCustomizationForm = () => {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const multiLangData = useMemo(() => multiLang, []);
  const { register, setValue, handleSubmit } =
    useForm<FooterCustomizationFormData>({
      resolver: zodResolver(footerCustomizationSchema),
    });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<UploadedImage[]>([]);

  const [toggles, setToggles] = useState<ToggleState>({
    com_payment_methods_enable_disable: "",
    com_quick_access_enable_disable: "",
    com_our_info_enable_disable: "",
    com_social_links_enable_disable: "",
    com_social_links_title: "",
  });

  const {
    footerCustomizationData,
    refetch,
    isFetching,
    isPending: isQuerying,
  } = useFooterCustomizationQuery({});

  const QueryFooterCustomizationData = useMemo(() => {
    const data = (footerCustomizationData as any)?.data;
    return data || {};
  }, [footerCustomizationData]);

  useEffect(() => {
    if (
      !QueryFooterCustomizationData ||
      Object.keys(QueryFooterCustomizationData).length === 0
    ) {
      return;
    }
    const FooterCustomizationMessage = QueryFooterCustomizationData?.content;

    if (QueryFooterCustomizationData) {
      setValue(
        "com_social_links_facebook_url",
        FooterCustomizationMessage?.com_social_links_facebook_url ?? ""
      );
      setValue(
        "com_social_links_twitter_url",
        FooterCustomizationMessage?.com_social_links_twitter_url ?? ""
      );
      setValue(
        "com_social_links_instagram_url",
        FooterCustomizationMessage?.com_social_links_instagram_url ?? ""
      );
      setValue(
        "com_social_links_linkedin_url",
        FooterCustomizationMessage?.com_social_links_linkedin_url ?? ""
      );
      setValue(
        "com_download_app_link_one",
        FooterCustomizationMessage?.com_download_app_link_one ?? ""
      );
      setValue(
        "com_download_app_link_two",
        FooterCustomizationMessage?.com_download_app_link_two ?? ""
      );

      const imageIds =
        FooterCustomizationMessage?.com_payment_methods_image.split(",");
      const imageUrls =
        FooterCustomizationMessage?.com_payment_methods_image_urls
          ? FooterCustomizationMessage?.com_payment_methods_image_urls.split(
              ","
            )
          : [];

      const result =
        imageIds.length > 0 &&
        imageIds?.map((id: string, index: string | number) => ({
          image_id: parseInt(id),
          img_url: imageUrls[index],
        }));
      if (FooterCustomizationMessage?.com_payment_methods_image) {
        setSelectedImages(result);
      }

      setToggles({
        com_payment_methods_enable_disable:
          FooterCustomizationMessage?.com_payment_methods_enable_disable ?? "",
        com_quick_access_enable_disable:
          FooterCustomizationMessage?.com_quick_access_enable_disable ?? "",
        com_our_info_enable_disable:
          FooterCustomizationMessage?.com_our_info_enable_disable ?? "",
        com_social_links_enable_disable:
          FooterCustomizationMessage?.com_social_links_enable_disable ?? "",
        com_social_links_title:
          FooterCustomizationMessage?.com_social_links_title ?? "",
      });
      setErrorMessage("");

      if (QueryFooterCustomizationData?.translations) {
        const helpSteps: Array<{
          titles: Record<string, string>;
          urls: Record<string, string>;
        }> = [];
        const ourInfoSteps: Array<{
          titles: Record<string, string>;
          urls: Record<string, string>;
        }> = [];
        const aggregatedSteps: Array<{
          titles: Record<string, string>;
          urls: Record<string, string>;
          image: Record<string, string>;
        }> = [];

        Object.keys(QueryFooterCustomizationData?.translations).forEach(
          (language) => {
            const translation =
              QueryFooterCustomizationData?.translations[language];

            const StorySectionDataT = translation?.content?.com_quick_access;
            const OurInfoDataT = translation?.content?.com_our_info;
            const HelpDataT = translation?.content?.com_help_center;

            if (StorySectionDataT) {
              StorySectionDataT?.forEach((step: any, index: any) => {
                if (!aggregatedSteps[index]) {
                  aggregatedSteps[index] = {
                    titles: {},
                    urls: {},
                    image: {},
                  };
                }
                aggregatedSteps[index].titles[language] =
                  step.com_quick_access_title || "";
                aggregatedSteps[index].urls[language] =
                  step.com_quick_access_url || "";
                aggregatedSteps[index].image = {
                  id: step?.image || "",
                  url: step?.image_url || "",
                };
              });
            }
            if (OurInfoDataT) {
              OurInfoDataT?.forEach((step: any, index: any) => {
                if (!ourInfoSteps[index]) {
                  ourInfoSteps[index] = {
                    titles: {},
                    urls: {},
                  };
                }
                ourInfoSteps[index].titles[language] = step.title || "";
                ourInfoSteps[index].urls[language] = step.url || "";
              });
            }
            if (HelpDataT) {
              HelpDataT?.forEach((step: any, index: any) => {
                if (!helpSteps[index]) {
                  helpSteps[index] = {
                    titles: {},
                    urls: {},
                  };
                }
                helpSteps[index].titles[language] = step.title || "";
                helpSteps[index].urls[language] = step.url || "";
              });
            }
          }
        );

        setOnBoardSteps(aggregatedSteps as any);
        setOurInfoSteps(ourInfoSteps as any);
        setHelpCenterSteps(helpSteps as any);
      }
    }
  }, [
    QueryFooterCustomizationData,
    QueryFooterCustomizationData?.content,
    QueryFooterCustomizationData?.translations,
    setValue,
  ]);

  const handleToggle = (property: keyof ToggleState) => {
    setToggles((prev) => ({
      ...prev,
      [property]: prev[property] === "on" ? "" : "on",
    }));
  };

  const { mutate: FooterCustomizationStore, isPending } =
    useFooterCustomizationStoreMutation();
  const onSubmit = async (values: FooterCustomizationFormData) => {
    const formattedImageIds = selectedImages
      .map((image) => image.image_id)
      .join(",");
    const defaultData = {
      ...values,
      com_payment_methods_enable_disable:
        toggles.com_payment_methods_enable_disable,
      com_quick_access_enable_disable: toggles.com_quick_access_enable_disable,
      com_our_info_enable_disable: toggles.com_our_info_enable_disable,
      com_social_links_enable_disable: toggles.com_social_links_enable_disable,
      com_social_links_title: toggles.com_social_links_title,
      com_payment_methods_image: formattedImageIds,
    };

    const com_quick_access = onBoardSteps.map(({ titles, urls }) => ({
      com_quick_access_title: titles.df,
      com_quick_access_url: urls.df,
    }));
    const com_our_info = ourInfoSteps.map(({ titles, urls }) => ({
      title: titles.df,
      url: urls.df,
    }));
    const com_help_center = helpCenterSteps.map(({ titles, urls }) => ({
      title: titles.df,
      url: urls.df,
    }));

    const translations = multiLangData.map((lang) => ({
      language_code: lang.id,
      content: {
        ...defaultData,
        com_quick_access: onBoardSteps.map(({ titles, urls }) => ({
          com_quick_access_title: titles[lang.id] || titles.df,
          com_quick_access_url: urls.df,
        })),
        com_our_info: ourInfoSteps.map(({ titles, urls }) => ({
          title: titles[lang.id] || titles.df,
          url: urls.df,
        })),
        com_help_center: helpCenterSteps.map(({ titles, urls }) => ({
          title: titles[lang.id] || titles.df,
          url: urls.df,
        })),
      },
    }));

    const content = {
      ...defaultData,
      com_quick_access,
      com_our_info,
    };

    const submissionData = {
      content,
      translations,
    };
    return FooterCustomizationStore(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const handleSaveImages = (images: UploadedImage[]) => {
    setSelectedImages(images);

    images.forEach((image, index) => {
      const dimensions = image.dimensions ?? "";
      const [width, height] = dimensions
        .split(" x ")
        .map((dim) => parseInt(dim.trim(), 10));
      const aspectRatio = width / height;

      if (Math.abs(aspectRatio - 1 / 1) < 0.01) {
        setErrorMessage("");
        return true;
      } else {
        setErrorMessage(
          ` ${index + 1} no. Image  must have a 1:1 aspect ratio.`
        );
        return false;
      }
    });
  };

  const handleDeleteImage = (id: string) => {
    setSelectedImages((prevImages) =>
      prevImages.filter((image) => image.image_id !== id)
    );
  };

  const trigger = (
    <div className=" w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <CloudIcon />
        <p className="mt-2 text-blue-500 text-xs font-medium">
          {t("common.drag_and_drop")}
        </p>
      </div>
    </div>
  );
  const AddMoreImages = (
    <div>
      <p className="px-2 py-1 border border-blue-500 rounded  text-blue-500 font-medium text-sm cursor-pointer hover:bg-blue-500 hover:text-white">
        {t("common.update")}
      </p>
    </div>
  );

  const [onBoardSteps, setOnBoardSteps] = useState<
    {
      [x: string]: any;
      titles: { [langId: string]: string };
      urls: { [langId: string]: string };
      charge_amount: string;
      image: string;
    }[]
  >([]);

  const handleAddOnBoardStep = () => {
    setOnBoardSteps([
      ...onBoardSteps,
      {
        titles: {},
        urls: {},
        charge_amount: "",
        image: "",
      },
    ]);
  };

  const handleDeleteOnBoardStep = (index: number) => {
    setOnBoardSteps(onBoardSteps.filter((_, i) => i !== index));
  };

  const handleChangeOnBoardStep = (
    index: number,
    field: "titles" | "urls" | "charge_amount" | "image",
    langId: string,
    value: any
  ) => {
    const updatedValues = [...onBoardSteps];

    if (field === "image" && Array.isArray(value) && value.length > 0) {
      //@ts-ignore
      updatedValues[index][field] = {
        id: value[0].image_id,
        url: value[0].img_url,
      };
    } else if (field === "titles" || field === "urls") {
      updatedValues[index][field] = {
        ...updatedValues[index][field],
        [langId]: value,
      };
    } else {
      updatedValues[index][field] = value;
    }

    setOnBoardSteps(updatedValues);
  };

  const [ourInfoSteps, setOurInfoSteps] = useState<
    {
      [x: string]: any;
      titles: { [langId: string]: string };
      urls: { [langId: string]: string };
      charge_amount: string;
      image: string;
    }[]
  >([]);

  const handleAddOurInfoStep = () => {
    setOurInfoSteps([
      ...ourInfoSteps,
      {
        titles: {},
        urls: {},
        charge_amount: "",
        image: "",
      },
    ]);
  };

  const handleDeleteOurInfoStep = (index: number) => {
    setOurInfoSteps(ourInfoSteps.filter((_, i) => i !== index));
  };

  const handleChangeOurInfoStep = (
    index: number,
    field: "titles" | "urls" | "charge_amount" | "image",
    langId: string,
    value: any
  ) => {
    const updatedValues = [...ourInfoSteps];

    if (field === "image" && Array.isArray(value) && value.length > 0) {
      //@ts-ignore
      updatedValues[index][field] = {
        id: value[0].image_id,
        url: value[0].img_url,
      };
    } else if (field === "titles" || field === "urls") {
      updatedValues[index][field] = {
        ...updatedValues[index][field],
        [langId]: value,
      };
    } else {
      updatedValues[index][field] = value;
    }

    setOurInfoSteps(updatedValues);
  };
  const [helpCenterSteps, setHelpCenterSteps] = useState<
    {
      [x: string]: any;
      titles: { [langId: string]: string };
      urls: { [langId: string]: string };
      charge_amount: string;
      image: string;
    }[]
  >([]);

  const handleAddHelpCenterStep = () => {
    setHelpCenterSteps([
      ...helpCenterSteps,
      {
        titles: {},
        urls: {},
        charge_amount: "",
        image: "",
      },
    ]);
  };

  const handleDeleteHelpCenterStep = (index: number) => {
    setHelpCenterSteps(helpCenterSteps.filter((_, i) => i !== index));
  };

  const handleChangeHelpCenterStep = (
    index: number,
    field: "titles" | "urls" | "charge_amount" | "image",
    langId: string,
    value: any
  ) => {
    const updatedValues = [...helpCenterSteps];

    if (field === "image" && Array.isArray(value) && value.length > 0) {
      //@ts-ignore
      updatedValues[index][field] = {
        id: value[0].image_id,
        url: value[0].img_url,
      };
    } else if (field === "titles" || field === "urls") {
      updatedValues[index][field] = {
        ...updatedValues[index][field],
        [langId]: value,
      };
    } else {
      updatedValues[index][field] = value;
    }

    setHelpCenterSteps(updatedValues);
  };

  return (
    <div>
      {isQuerying ? (
        <CardSkletonLoader />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div dir={dir}>
              <div>
                <Tabs defaultValue="df" className="">
                  <Card className="mt-4 sticky top-14 z-20">
                    <CardContent className=" p-2">
                      <TabsList
                        dir={dir}
                        className="flex justify-start bg-white dark:bg-[#1f2937]"
                      >
                        {multiLangData.map((lang) => (
                          <TabsTrigger key={lang.id} value={lang.id}>
                            {lang.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </CardContent>
                  </Card>

                  <Card className="mt-4">
                    <CardContent className="p-2 md:p-4">
                      <div dir={dir} className="">
                        <div>
                          {multiLangData.map((lang) => {
                            return (
                              <TabsContent key={lang.id} value={lang.id}>
                                <div className="">
                                  <div className="w-full text-sm font-semibold flex items-center justify-between ">
                                    <h1 className="text-lg md:text-2xl font-medium mb-4">
                                      {t("common.quick_access")}
                                    </h1>
                                    <span
                                      onClick={handleAddOnBoardStep}
                                      className="flex items-center cursor-pointer bg-blue-50 border border-blue-500 text-blue-500 text-sm font-bold shadow-2xl px-2 py-2 rounded hover:bg-blue-500 hover:text-white"
                                    >
                                      {t("common.add_more")}
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
                                            <div className="w-full">
                                              <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                                {t("common.title")}
                                              </p>
                                              <Input
                                                type="text"
                                                value={
                                                  value?.titles[lang.id] || ""
                                                }
                                                onChange={(e) =>
                                                  handleChangeOnBoardStep(
                                                    index,
                                                    "titles",
                                                    lang.id,
                                                    e.target.value
                                                  )
                                                }
                                                className="app-input flex-grow py-2"
                                                placeholder="Enter value"
                                              />
                                            </div>
                                          </div>
                                          <div className="col-span-2">
                                            <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                              {t("common.url")}
                                            </p>
                                            <Input
                                              type="text"
                                              value={value?.urls["df"] || ""}
                                              onChange={(e) =>
                                                handleChangeOnBoardStep(
                                                  index,
                                                  "urls",
                                                  "df",
                                                  e.target.value
                                                )
                                              }
                                              className="app-input flex-grow py-2"
                                              placeholder="Enter value"
                                            />
                                          </div>
                                        </div>
                                        {index === 0 ? (
                                          <span className="flex items-center cursor-not-allowed bg-slate-500 text-slate-300 text-sm font-bold shadow-2xl px-2 py-2.5 rounded">
                                            {t("common.default")}
                                          </span>
                                        ) : (
                                          <span
                                            onClick={() =>
                                              handleDeleteOnBoardStep(index)
                                            }
                                            className="cursor-pointer bg-red-500 text-white shadow-2xl px-3 py-2 rounded"
                                          >
                                            {t("common.close")}
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
                    <CardContent className="p-2 md:p-4">
                      <div dir={dir} className="">
                        <div>
                          {multiLangData.map((lang) => {
                            return (
                              <TabsContent key={lang.id} value={lang.id}>
                                <div className="">
                                  <div className="w-full text-sm font-semibold flex items-center justify-between ">
                                    <h1 className="text-lg md:text-2xl font-medium mb-4">
                                      {t("common.our_info")}
                                    </h1>
                                    <span
                                      onClick={handleAddOurInfoStep}
                                      className="flex items-center cursor-pointer bg-blue-50 border border-blue-500 text-blue-500 text-sm font-bold shadow-2xl px-2 py-2 rounded hover:bg-blue-500 hover:text-white"
                                    >
                                      {t("common.add_more")}
                                    </span>
                                  </div>
                                  <div className="max-h-[300px] overflow-x-auto custom-scrollbar">
                                    {ourInfoSteps.map((value, index) => (
                                      <div
                                        key={index}
                                        className="my-4 flex items-end w-full gap-4 border-t md:border-0"
                                      >
                                        <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 mr-6 ">
                                          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8 ">
                                            <div className="w-full">
                                              <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                                {t("common.title")}
                                              </p>
                                              <Input
                                                type="text"
                                                value={
                                                  value?.titles[lang.id] || ""
                                                }
                                                onChange={(e) =>
                                                  handleChangeOurInfoStep(
                                                    index,
                                                    "titles",
                                                    lang.id,
                                                    e.target.value
                                                  )
                                                }
                                                className="app-input flex-grow py-2"
                                                placeholder="Enter value"
                                              />
                                            </div>
                                          </div>
                                          <div className="col-span-2">
                                            <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                              {t("common.url")}
                                            </p>
                                            <Input
                                              type="text"
                                              value={value?.urls["df"] || ""}
                                              onChange={(e) =>
                                                handleChangeOurInfoStep(
                                                  index,
                                                  "urls",
                                                  "df",
                                                  e.target.value
                                                )
                                              }
                                              className="app-input flex-grow py-2"
                                              placeholder="Enter value"
                                            />
                                          </div>
                                        </div>
                                        {index === 0 ? (
                                          <span className="flex items-center cursor-not-allowed bg-slate-500 text-slate-300 text-sm font-bold shadow-2xl px-2 py-2.5 rounded">
                                            {t("common.default")}
                                          </span>
                                        ) : (
                                          <span
                                            onClick={() =>
                                              handleDeleteOurInfoStep(index)
                                            }
                                            className="cursor-pointer bg-red-500 text-white shadow-2xl px-3 py-2 rounded"
                                          >
                                            {t("common.close")}
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
                    <CardContent className="p-2 md:p-4">
                      <div dir={dir} className="">
                        <div>
                          {multiLangData.map((lang) => {
                            return (
                              <TabsContent key={lang.id} value={lang.id}>
                                <div className="">
                                  <div className="w-full text-sm font-semibold flex items-center justify-between ">
                                    <h1 className="text-lg md:text-2xl font-medium mb-4">
                                      {t("common.help_center")}
                                    </h1>
                                    <span
                                      onClick={handleAddHelpCenterStep}
                                      className="flex items-center cursor-pointer bg-blue-50 border border-blue-500 text-blue-500 text-sm font-bold shadow-2xl px-2 py-2 rounded hover:bg-blue-500 hover:text-white"
                                    >
                                      {t("common.add_more")}
                                    </span>
                                  </div>
                                  <div className="max-h-[300px] overflow-x-auto custom-scrollbar">
                                    {helpCenterSteps.map((value, index) => (
                                      <div
                                        key={index}
                                        className="my-4 flex items-end w-full gap-4 border-t md:border-0"
                                      >
                                        <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 mr-6 ">
                                          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8 ">
                                            <div className="w-full">
                                              <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                                {t("common.title")}
                                              </p>
                                              <Input
                                                type="text"
                                                value={
                                                  value?.titles[lang.id] || ""
                                                }
                                                onChange={(e) =>
                                                  handleChangeHelpCenterStep(
                                                    index,
                                                    "titles",
                                                    lang.id,
                                                    e.target.value
                                                  )
                                                }
                                                className="app-input flex-grow py-2"
                                                placeholder="Enter value"
                                              />
                                            </div>
                                          </div>
                                          <div className="col-span-2">
                                            <p className="text-sm font-medium mb-1 text-gray-500 dark:text-white">
                                              {t("common.url")}
                                            </p>
                                            <Input
                                              type="text"
                                              value={value?.urls["df"] || ""}
                                              onChange={(e) =>
                                                handleChangeHelpCenterStep(
                                                  index,
                                                  "urls",
                                                  "df",
                                                  e.target.value
                                                )
                                              }
                                              className="app-input flex-grow py-2"
                                              placeholder="Enter value"
                                            />
                                          </div>
                                        </div>
                                        {index === 0 ? (
                                          <span className="flex items-center cursor-not-allowed bg-slate-500 text-slate-300 text-sm font-bold shadow-2xl px-2 py-2.5 rounded">
                                            {t("common.default")}
                                          </span>
                                        ) : (
                                          <span
                                            onClick={() =>
                                              handleDeleteHelpCenterStep(index)
                                            }
                                            className="cursor-pointer bg-red-500 text-white shadow-2xl px-3 py-2 rounded"
                                          >
                                            {t("common.close")}
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
                    <CardContent className="p-2 md:p-4">
                      <p className="text-lg md:text-2xl font-medium mb-4">
                        {t("common.social_links")}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-4 my-4">
                        <div className="col-span-1 mb-4 md:mb-0">
                          <div className="flex items-center border px-4 py-[7px] rounded">
                            <Facebook width={24} height={24}  />
                            <span className="ml-2">{t("common.facebook")}</span>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <Input
                            id="com_social_links_facebook_url"
                            {...register(
                              "com_social_links_facebook_url" as keyof FooterCustomizationFormData
                            )}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-4 my-4">
                        <div className="col-span-1 mb-4 md:mb-0">
                          <div className="flex items-center border px-4 py-[7px] rounded">
                            <Twitter width={24} height={24} />
                            <span className="ml-2">{t("common.twitter")}</span>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <Input
                            id="com_social_links_twitter_url"
                            {...register(
                              "com_social_links_twitter_url" as keyof FooterCustomizationFormData
                            )}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-4 my-4">
                        <div className="col-span-1 mb-4 md:mb-0">
                          <div className="flex items-center border px-4 py-[7px] rounded">
                            <Instagram width={24} height={24} />
                            <span className="ml-2">
                              {t("common.instagram")}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <Input
                            id="com_social_links_instagram_url"
                            {...register(
                              "com_social_links_instagram_url" as keyof FooterCustomizationFormData
                            )}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-4 my-4">
                        <div className="col-span-1 mb-4 md:mb-0">
                          <div className="flex items-center border px-4 py-[7px] rounded">
                            <Linkedin width={24} height={24} />
                            <span className="ml-2">{t("common.linkedIn")}</span>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <Input
                            id="com_social_links_linkedin_url"
                            {...register(
                              "com_social_links_linkedin_url" as keyof FooterCustomizationFormData
                            )}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="mt-4">
                    <CardContent className="p-2 md:p-4">
                      <p className="text-lg md:text-2xl font-medium mb-4">
                        {t("common.download_app_link")}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-4 my-4">
                        <div className="col-span-1 mb-4 md:mb-0">
                          <div className="flex items-center border px-4 py-[7px] rounded">
                            <Playstore width={24} height={24} />
                            <span className="ml-2">
                              {" "}
                              {t("common.playstore")}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <Input
                            id="com_download_app_link_one"
                            {...register(
                              "com_download_app_link_one" as keyof FooterCustomizationFormData
                            )}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-4 my-4">
                        <div className="col-span-1 mb-4 md:mb-0">
                          <div className="flex items-center border px-4 py-[7px]  rounded">
                            <Appstore width={24} height={24} />
                            <span className="ml-2">Appstore</span>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <Input
                            id="com_download_app_link_two"
                            {...register(
                              "com_download_app_link_two" as keyof FooterCustomizationFormData
                            )}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="mt-4">
                      <CardContent className="p-2 md:p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <p className="text-lg md:text-2xl font-medium mb-4">
                            {t("common.basic_information")}
                          </p>
                        </div>
                        <div className="">
                          <div>
                            <div className="grid grid-cols-1 md:grid-cols-3">
                              <p className="text-sm font-medium">
                                {t("common.payment_methods")}
                              </p>
                              <Switch
                                dir="ltr"
                                checked={
                                  toggles.com_payment_methods_enable_disable ===
                                  "on"
                                }
                                onCheckedChange={() =>
                                  handleToggle(
                                    "com_payment_methods_enable_disable"
                                  )
                                }
                              />
                            </div>
                            <div className="my-4 grid grid-cols-1 md:grid-cols-3">
                              <p className="text-sm font-medium">
                                {t("common.quick_access")}
                              </p>
                              <Switch
                                dir="ltr"
                                checked={
                                  toggles.com_quick_access_enable_disable ===
                                  "on"
                                }
                                onCheckedChange={() =>
                                  handleToggle(
                                    "com_quick_access_enable_disable"
                                  )
                                }
                              />
                            </div>
                            <div className="my-4 grid grid-cols-1 md:grid-cols-3">
                              <p className="text-sm font-medium ">
                                {t("common.our_info")}
                              </p>
                              <Switch
                                dir="ltr"
                                checked={
                                  toggles.com_our_info_enable_disable === "on"
                                }
                                onCheckedChange={() =>
                                  handleToggle("com_our_info_enable_disable")
                                }
                              />
                            </div>
                            <div className="my-4 grid grid-cols-1 md:grid-cols-3">
                              <p className="text-sm font-medium">
                                {t("common.social_links")}
                              </p>
                              <Switch
                                dir="ltr"
                                checked={
                                  toggles.com_social_links_enable_disable ===
                                  "on"
                                }
                                onCheckedChange={() =>
                                  handleToggle(
                                    "com_social_links_enable_disable"
                                  )
                                }
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3">
                              <p className="text-sm font-medium">
                                {t("common.social_links_title")}
                              </p>
                              <Switch
                                dir="ltr"
                                checked={
                                  toggles.com_social_links_title === "on"
                                }
                                onCheckedChange={() =>
                                  handleToggle("com_social_links_title")
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="mt-4">
                      <CardContent className="p-2 md:p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-lg md:text-2xl font-medium ">
                            {t("common.payment_gateway_image")}
                          </span>
                          <div className="mt-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 text-custom-dark-blue dark:text-white cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  align="center"
                                  sideOffset={4}
                                  avoidCollisions={false}
                                  className="bg-custom-dark-blue dark:bg-white max-w-sm"
                                >
                                  <p className="p-1 text-sm font-medium">
                                    {t("tooltip.payment_gateway_image")}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <div className="">
                          <div>
                            {selectedImages?.length === 0 && (
                              <div className="grid grid-cols-2 gap-4">
                                <PhotoUploadModal
                                  trigger={trigger}
                                  isMultiple={true}
                                  onSave={handleSaveImages}
                                  usageType="footer"
                                />
                              </div>
                            )}
                            {selectedImages?.length > 0 && (
                              <>
                                <div className="flex flex-wrap gap-4 max-h-[300px] overflow-x-auto custom-scrollbar">
                                  {selectedImages.map((image, index) => {
                                    const imgSrc =
                                      image.img_url || image.url || "/images/no-image.png";
                                    if (!imgSrc) return null;

                                    return (
                                      <div
                                        key={index}
                                        className="relative w-24 h-24 rounded shadow-xl border overflow-hidden"
                                      >
                                        <Image
                                          loader={GlobalImageLoader}
                                          src={imgSrc as string}
                                          alt={(image.image_id as any) || "image"}
                                          layout="fill"
                                          className="w-full h-full"
                                        />
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            handleDeleteImage(
                                              image.image_id || ""
                                            );
                                          }}
                                          className="absolute right-0 top-0 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-t-right px-2"
                                        >
                                          <span>
                                            {" "}
                                            <X width={12} height={20} />{" "}
                                          </span>
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex mt-4">
                                  <PhotoUploadModal
                                    trigger={AddMoreImages}
                                    isMultiple={true}
                                    onSave={handleSaveImages}
                                    usageType="footer"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>

          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton
              IsLoading={isPending}
              AddLabel={t("button.save_changes")}
            />
          </Card>
        </form>
      )}
    </div>
  );
};

export default FooterCustomizationForm;
