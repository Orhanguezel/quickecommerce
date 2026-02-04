"use client";
import Loader from "@/components/molecules/Loader";
import multiLang from "@/components/molecules/multiLang.json";
import AppPhoneNumberInput from "@/components/blocks/common/AppPhoneNumberInput";
import {
  Button,
  Card,
  Input,
  Tabs,
  TabsContent,
  Textarea,
} from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useContactUsStoreMutation } from "@/modules/common/contact-us/contact-us.action";
import {
  ContactUsFormData,
  contactUsSchema,
} from "@/modules/common/contact-us/contact-us.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

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


const ContactUsThemeTwo = ({ data, ID, contact_section }: any) => {
  const multiLangData = React.useMemo(() => multiLang, []);
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ContactUsFormData>({
    resolver: zodResolver(contactUsSchema),
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const { mutate: blogCategoryStore, isPending } = useContactUsStoreMutation();
  const onSubmit = async (values: ContactUsFormData) => {
    const submissionData = {
      ...values,
    };

    return blogCategoryStore(
      { ...(submissionData as any) },
      {
        onSuccess: () => {},
      }
    );
  };

  return (
    <div
      className=" bg-black text-white flex items-center justify-center mx-4 p-4 xl:p-24 bg-cover bg-center bg-no-repeat lg:flex-row md:flex-col md:gap-0 xl:gap-x-24 2xl:gap-x-24   relative rounded-lg"
      
    >
      <div className="hidden lg:flex flex-col items-center justify-center">
        <div className="relative w-[246px] h-[246px]">
          {contact_section?.image ? (
            <Image
              loader={GlobalImageLoader}
              src={contact_section?.image_url}
              alt="CardImage"
              fill
              className="w-full h-full rounded object-cover"
              sizes="(max-width: 768px) 50vw, 246px"
              quality={85}
              priority={true}
            />
          ) : (
            <Image
              src="/images/no-image.png"
              alt="no_image"
              fill
              className="w-full h-full rounded object-contain"
              sizes="246px"
              quality={75}
            />
          )}
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className="text-4xl font-bold text-center max-w-[405px]">
            {contact_section?.title}
          </h1>
          <p className="text-md text-center my-4 max-w-[460px]">
            {contact_section?.subtitle}
          </p>
        </div>
      </div>
      <Card className="bg-white w-[349px] md:w-[450px] lg:w-[600px]  rounded-md z-10 p-4">
        <div className="mt-6">
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Tabs defaultValue="df" className="col-span-2">
                <div dir={dir}>
                  {multiLangData.map((lang) => {
                    return (
                      <TabsContent key={lang.id} value={lang.id}>
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>{t("label.name")}</span>
                          </p>
                          <Input
                            id={`name`}
                            {...register(`name` as keyof ContactUsFormData)}
                            className="app-input"
                            placeholder="Enter name"
                          />
                          {errors[`name` as keyof ContactUsFormData] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`name`]?.message}
                            </p>
                          )}
                        </div>
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>{t("label.email")}</span>
                          </p>
                          <Input
                            id={`email`}
                            {...register(`email` as keyof ContactUsFormData)}
                            className="app-input"
                            placeholder="Enter email"
                          />
                          {errors[`email` as keyof ContactUsFormData] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`email`]?.message}
                            </p>
                          )}
                        </div>

                        <div
                          className={`mb-4 ${locale == "ar" ? "" : "pr-3"} `}
                        >
                          <p className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>{t("label.phone")}</span>
                          </p>
                          <AppPhoneNumberInput
                            value={phoneNumber}
                            onChange={(value) => {
                              setPhoneNumber(value);
                              setValue("phone", value);
                            }}
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.phone?.message}
                            </p>
                          )}
                        </div>
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-1 flex items-center gap-2">
                            <span>{t("label.description")}</span>
                          </p>
                          <Textarea
                            id={`message`}
                            {...register(`message` as keyof ContactUsFormData)}
                            className="app-input"
                            placeholder="Enter message"
                          />
                          {errors[`message` as keyof ContactUsFormData] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`message`]?.message}
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    );
                  })}
                </div>
              </Tabs>
              <div className="flex justify-between my-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="peer mt-1"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium text-gray-600 dark:text-white "
                  >
                    {contact_section?.agree_button_title}
                  </label>
                </div>
              </div>
              <div className="w-full flex items-center justify-center my-10">
                <Button
                  className="bg-[#FF6631] hover:bg-[#f1541f] mt-2 px-10 rounded-full"
                  type="submit"
                  disabled={!rememberMe}
                >
                  {isPending ? (
                    <Loader color="text-white" size="small" />
                  ) : (
                    <span>{t("button.send_message")}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};
export default ContactUsThemeTwo;
