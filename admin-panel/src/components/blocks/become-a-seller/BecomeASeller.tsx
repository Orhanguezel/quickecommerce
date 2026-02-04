"use client";
import { Email, FB, Google, Lock } from "@/assets/icons";
import Loader from "@/components/molecules/Loader";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import { PublicNavbar } from "@/components/blocks/shared/PublicNavbar";
import AppPhoneNumberInput from "@/components/blocks/common/AppPhoneNumberInput";
import TurnstileCaptcha from "@/components/blocks/common/TurnstileCaptcha";
import { Button, Card, Input } from "@/components/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SellerRoutes } from "@/config/sellerRoutes";
import GlobalImageLoader from "@/lib/imageLoader";
import { useBecomeASellerTypeQuery } from "@/modules/common/become-a-seller/become-a-seller.action";
import { useGeneralQuery } from "@/modules/common/com/com.action";
import { useRegisterMutation } from "@/modules/users/users.action";
import { RegisterSchema, SignUpInput } from "@/modules/users/users.schema";
import { AuthFormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ContactUs from "./components/ContactUs";
import FooterNew from "./components/FooterNew";
import { PublicNavbarSkeleton } from "@/components/molecules/PublicNavbarSkeleton";

const BecomeASeller = ({ isRedirect }: AuthFormProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1];
  const localeMain = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [rememberMe, setRememberMe] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [on, setOn] = useState(false);
  const [onConfirm, setOnConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const {
    control,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = form;

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  const { general, refetch: generalRefetch } = useGeneralQuery({
    language: localeMain,
  });
  const originalDataGeneral = useMemo(() => {
    const data = (general as any) || {};
    return data;
  }, [general]);

  const GeneralData = originalDataGeneral.site_settings;

  const {
    BecomeASeller,
    refetch,
    isPending: isQuerying,
  } = useBecomeASellerTypeQuery({});
  const originalData = useMemo(() => {
    const data = (BecomeASeller as any)?.content || {};
    return data;
  }, [BecomeASeller]);
  const {
    contact_section = {},
    faq_section = {},
    join_benefits_section = {},
    login_register_section = {},
    on_board_section = {},
    video_section = {},
  } = originalData;
  const embedUrl = video_section?.video_url?.replace("watch?v=", "embed/");

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const handleSelectItem = (value: string, inputType: string) => {
    setValue(inputType as any, value);
  };
  const { mutate: register, isPending } = useRegisterMutation({ isRedirect });
  const onSubmit = async (values: any) => {
    const defaultValues = {
      ...values,
    };
    if (GeneralData?.com_google_recaptcha_enable_disable == "on") {
      defaultValues.cf_token = captchaToken;
    }
    register(
      {
        ...(defaultValues as any),
      },
      {
        onSuccess: (data) => {
          if (!data.data?.token) {
            return;
          }
          setIsLoading(true);
          reset();

          const email_verified = data?.data?.email_verified;
          const email_verification_settings =
            data?.data?.email_verification_settings;
          if (email_verified == false && email_verification_settings == "on") {
            router.push(`${SellerRoutes.emailVerification}`);
          } else {
            router.push(`${SellerRoutes.dashboard}`);

            localStorage.setItem(
              "selectedStore",
              JSON.stringify({ id: "", slug: "" })
            );
          }
        },
      }
    );
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/v1/auth/google?role=seller`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/v1/auth/facebook?role=seller`;
  };

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      {isQuerying ? (
        <div>
          <PublicNavbarSkeleton />
          <div className="h-[88vh]">
            <div className="h-[88vh] p-4 lg:p-0 bg-cover bg-center bg-no-repeat flex flex-col xl:flex-row items-center justify-center md:gap-4 xl:gap-24 relative bg-gray-200 dark:bg-gray-800">
              {/* Left Side Image Skeleton */}
              <div className="hidden xl:inline-block">
                <div className="relative w-[587px] h-[566px]">
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Registration Form Card Skeleton */}
              <div className="mt-40 bg-white dark:bg-gray-900 w-full lg:w-[570px] rounded-md z-10 p-4 lg:p-8 lg:mt-6">
                {/* Header Section */}
                <div className="text-center mb-6">
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-md w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-md w-1/2 mx-auto"></div>
                </div>

                {/* Form Fields */}
                <div className="mt-6">
                  <div className="space-y-4">
                    {/* Name Fields Grid */}
                    <div className="grid lg:grid-cols-2 gap-3">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                        </div>
                      ))}
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                    </div>

                    {/* Email Field with Icon */}
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                      <div className="relative">
                        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                        <div className="absolute top-3 left-4 w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded"></div>
                      </div>
                    </div>

                    {/* Password Fields with Icons */}
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                        <div className="relative">
                          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                          <div className="absolute top-3 left-4 w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded"></div>
                          <div className="absolute top-2 right-4 w-5 h-5 bg-gray-400 dark:bg-gray-600 rounded"></div>
                        </div>
                      </div>
                    ))}

                    {/* Terms and Conditions */}
                    <div className="flex justify-between my-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        <div className="flex space-x-1">
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                        </div>
                      </div>
                    </div>

                    {/* Register Button */}
                    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-md"></div>

                    {/* Already have account */}
                    <div className="flex flex-col items-center justify-center pt-4">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-64"></div>
                    </div>

                    {/* OR Separator */}
                    <div className="mb-4 flex items-center justify-center">
                      <div className="w-[60px] md:w-full lg:w-[300px] h-px bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8 mx-2"></div>
                      <div className="w-[60px] md:w-full lg:w-[300px] h-px bg-gray-300 dark:bg-gray-700"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-2">
                      {[...Array(2)].map((_, i) => (
                        <div
                          key={i}
                          className="h-10 bg-gray-300 dark:bg-gray-700 rounded-md w-full lg:flex-1"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div dir={dir} className="w-full h-full bg-white dark:bg-gray-900">
          <PublicNavbar />

          <div className="h-[88vh]">
            <div
              style={
                {
                  "--register-bg-image": `url(/images/reg_bg.png)`,
                } as React.CSSProperties
              }
              className="h-[88vh] p-4 lg:p-0 bg-cover bg-center bg-no-repeat flex flex-col xl:flex-row items-center justify-center md:gap-4  xl:gap-24 relative"
            >
              <div className="">
                <div className="hidden xl:inline-block relative w-[587px] h-[566px]">
                  {login_register_section?.background_image ? (
                    <Image
                      loader={GlobalImageLoader}
                      src={login_register_section?.background_image_url}
                      alt="CardImage"
                      fill
                      className="w-full h-full rounded"
                      sizes="(max-width: 1280px) 0px, 587px"
                    />
                  ) : (
                    <Image
                      src="/images/no-image.png"
                      alt="no_image"
                      fill
                      className="w-full h-full rounded"
                      priority
                      sizes="(max-width: 1280px) 0px, 587px"
                    />
                  )}
                </div>
              </div>
              {/* Registration Form */}
              <Card className="mt-40 bg-white w-full lg:w-[570px] rounded-md z-10 p-4 lg:p-8 lg:mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold ">
                    {login_register_section?.register_title}
                  </p>
                  <p className="text-sm">
                    {login_register_section?.register_subtitle}
                  </p>
                </div>

                <div className="mt-6">
                  <div>
                    <Form {...form}>
                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-4 space-y-2"
                      >
                        <div className="grid lg:grid-cols-2 gap-3">
                          <FormField
                            control={control}
                            name="first_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("label.first_name")}</FormLabel>
                                <FormControl>
                                  <Input
                                    className="app-input"
                                    placeholder={t(
                                      "place_holder.enter_first_name"
                                    )}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="last_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("label.last_name")}</FormLabel>
                                <FormControl>
                                  <Input
                                    className="app-input"
                                    placeholder={t(
                                      "place_holder.enter_last_name"
                                    )}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className={` ${locale == "ar" ? "" : "pr-3"} `}>
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
                        <FormField
                          control={control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("label.email")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    className={`app-input  ${
                                      locale === "ar" ? "pr-10" : "pl-10"
                                    }`}
                                    placeholder={t("place_holder.enter_email")}
                                    {...field}
                                  />
                                  <div
                                    className={`${
                                      locale === "ar" ? "right-4" : "left-4"
                                    } absolute top-3.5`}
                                  >
                                    <Email />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("label.password")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    className={`app-input  ${
                                      locale === "ar" ? "pr-10" : "pl-10"
                                    }`}
                                    type={on ? "text" : "password"}
                                    maxLength={12}
                                    placeholder={t(
                                      "place_holder.enter_password"
                                    )}
                                    {...field}
                                  />
                                  <div
                                    className={`${
                                      locale === "ar" ? "right-4" : "left-4"
                                    } absolute top-3`}
                                  >
                                    <Lock />
                                  </div>
                                  {on ? (
                                    <div
                                      className={`${
                                        locale === "ar" ? "left-4" : "right-4"
                                      } absolute top-2 cursor-pointer`}
                                    >
                                      <Eye
                                        className="text-gray-500 dark:text-white"
                                        onClick={() => setOn(!on)}
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      className={`${
                                        locale === "ar" ? "left-4" : "right-4"
                                      } absolute top-2 cursor-pointer`}
                                    >
                                      <EyeOff
                                        className="text-gray-500 dark:text-white"
                                        onClick={() => setOn(!on)}
                                      />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="password_confirmation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("label.confirm_password")}
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    className={`app-input  ${
                                      locale === "ar" ? "pr-10" : "pl-10"
                                    }`}
                                    type={onConfirm ? "text" : "password"}
                                    placeholder={t(
                                      "place_holder.enter_confirm_password"
                                    )}
                                    {...field}
                                  />
                                  <div
                                    className={`${
                                      locale === "ar" ? "right-4" : "left-4"
                                    } absolute top-3`}
                                  >
                                    <Lock />
                                  </div>
                                  {onConfirm ? (
                                    <div
                                      className={`${
                                        locale === "ar" ? "left-4" : "right-4"
                                      } absolute top-2 cursor-pointer`}
                                    >
                                      <Eye
                                        className="text-gray-500 dark:text-white"
                                        onClick={() => setOnConfirm(!onConfirm)}
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      className={`${
                                        locale === "ar" ? "left-4" : "right-4"
                                      } absolute top-2 cursor-pointer`}
                                    >
                                      <EyeOff
                                        className="text-gray-500 dark:text-white"
                                        onClick={() => setOnConfirm(!onConfirm)}
                                      />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />{" "}
                            </FormItem>
                          )}
                        />

                        {GeneralData?.com_google_recaptcha_enable_disable ===
                          "on" && (
                          <div className="min-h-[100px]">
                            {GeneralData?.com_google_recaptcha_enable_disable ===
                              "on" && (
                              <>
                                <TurnstileCaptcha
                                  siteKey={
                                    GeneralData.com_google_recaptcha_v3_site_key
                                  }
                                  onSuccess={(token) => {
                                    setCaptchaToken(token);
                                    setIsCaptchaVerified(true);
                                  }}
                                  onExpired={() => {
                                    setCaptchaToken(null);
                                    setIsCaptchaVerified(false);
                                  }}
                                />
                                {GeneralData?.com_google_recaptcha_enable_disable ===
                                  "on" &&
                                  !isCaptchaVerified && (
                                    <p className="text-sm text-red-500 mt-1">
                                      {t(
                                        "common.complete_the_captcha_verification"
                                      )}
                                    </p>
                                  )}
                              </>
                            )}
                          </div>
                        )}
                        <div className="flex justify-between my-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="terms"
                              className="peer"
                              checked={rememberMe}
                              onChange={handleRememberMeChange}
                            />
                            <label
                              htmlFor="terms"
                              className="pr-2 text-sm font-medium "
                            >
                              <span className=" text-gray-600 dark:text-white">
                                {t("common.i_agree_to_the")}{" "}
                              </span>
                              <Link
                                className="text-blue-500 hover:text-white dark:text-[#93c5fd] dark:hover:text-white"
                                href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/terms-conditions`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {t("common.terms_and_conditions")}
                              </Link>
                            </label>
                          </div>
                        </div>
                        <Button
                          className="bg-blue-500 w-full hover:bg-blue-700"
                          type="submit"
                          disabled={
                            !rememberMe ||
                            isPending ||
                            (GeneralData?.com_google_recaptcha_enable_disable ==
                              "on" &&
                              !isCaptchaVerified)
                          }
                        >
                          {isPending ? (
                            <Loader color="text-white" size="small" />
                          ) : (
                            <span>{t("label.register")}</span>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-gray-500 dark:text-white text-md ">
                      {t("label.already_have_an_account")}{" "}
                      <Button
                        variant="link"
                        className="text-blue-500 font-bold p-0"
                      >
                        <Link href={SellerRoutes.signin}>
                          {t("button.sign_in")}
                        </Link>
                      </Button>
                    </p>
                  </div>
                  <div className=" mb-4 flex items-center justify-center">
                    <span className=" w-[60px] md:w-full lg:w-[300px]" />
                    <p className="text-[14px] md:w-[400px] lg:w-[450px] text-center font-normal leading-[20px] text-[#64748B]">
                      <span className="text-[14px] font-semibold leading-[20px] text-left">
                        {t("label.or")}
                      </span>{" "}
                    </p>
                    <span className=" w-[60px] md:w-full lg:w-[300px]" />
                  </div>
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-2">
                    <Button onClick={handleGoogleLogin} className="app-button">
                      <Google />{" "}
                      <span className="mx-2">
                        {t("button.sign_in_with_google")}
                      </span>
                    </Button>
                    <Button
                      onClick={handleFacebookLogin}
                      className="app-button"
                    >
                      <FB />{" "}
                      <span className="mx-2">
                        {t("button.sign_in_with_facebook")}
                      </span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <div className="p-4 lg:p-20 flex items-center justify-center max-w-[1442px] mx-auto">
            <div className="block">
              <div className="flex flex-col items-center justify-center w-full">
                <h1 className="text-4xl font-bold text-center">
                  {on_board_section?.title}
                </h1>
                <p className="text-md text-center my-4 max-w-[584px]">
                  {on_board_section?.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-32 my-12">
                {Array.isArray(on_board_section?.steps) &&
                on_board_section?.steps.length > 0
                  ? on_board_section?.steps?.map((step: any, index: any) => {
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center justify-center"
                        >
                          <div className="flex items-center justify-center relative w-[265px] h-[205px]">
                            {step?.image && (
                              <Image
                                loader={GlobalImageLoader}
                                src={step?.image_url}
                                alt="CardImage"
                                fill
                                className="w-full h-full rounded"
                                sizes="(max-width: 640px) 100vw, 265px"
                              />
                            )}
                          </div>
                          <div className="mt-4 flex justify-center">
                            <div className="text-center">
                              <h1 className="text-[20px] font-semibold leading-[28px] text-center">
                                {step?.title}
                              </h1>
                              <p className="text-[16px] font-normal leading-[24px] text-center mt-2 max-w-[300px]">
                                {step?.subtitle}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : ""}
              </div>
            </div>
          </div>
          <div className="bg-[#EFF3F8] dark:bg-[#1e293b] mt-10 p-4 md:p-20 grid lg:flex justify-center gap-14">
            <div>
              <div className="flex flex-col items-center justify-center w-full">
                <h1 className="text-4xl font-bold text-center">
                  {video_section?.section_title}
                </h1>
                <p className="text-md text-center my-4 max-w-[764px]">
                  {video_section?.section_subtitle}
                </p>
              </div>
              {video_section.video_url && (
                <div className="w-full mt-10">
                  <iframe
                    className="w-full lg:w-[900px] h-[200px] lg:h-[445px] rounded-lg"
                    src={embedUrl}
                    title="YouTube video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="mt-10 p-4 lg:p-20 flex flex-col items-center justify-center max-w-[1442px] mx-auto">
              <div className="block">
                <div className="flex flex-col items-center justify-center w-full">
                  <h1 className="text-4xl font-bold text-center">
                    {join_benefits_section?.title}
                  </h1>
                  <p className="text-md text-center my-4 max-w-[516px]">
                    {join_benefits_section?.subtitle}
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-32 my-12">
                  {Array.isArray(join_benefits_section?.steps) &&
                  join_benefits_section?.steps.length > 0
                    ? join_benefits_section?.steps?.map(
                        (step: any, index: any) => {
                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center justify-center"
                            >
                              <div className="flex items-center justify-center relative w-[64px] h-[60px]">
                                {step?.image && (
                                  <Image
                                    loader={GlobalImageLoader}
                                    src={step?.image_url}
                                    alt="CardImage"
                                    fill
                                    className="w-full h-full rounded object-cover"
                                    sizes="64px"
                                    quality={80}
                                    priority={false}
                                  />
                                )}
                              </div>
                              <div className="mt-4">
                                <div className="flex flex-col items-center justify-center">
                                  <h1 className="text-[20px] font-semibold leading-[28px] text-center">
                                    {step?.title}
                                  </h1>
                                  <p className="text-[16px] font-normal leading-[24px] text-center mt-2 max-w-[300px]">
                                    {step?.subtitle}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )
                    : ""}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center mb-16 p-4 lg:p-0">
            <div className="flex flex-col items-center justify-center w-full lg:w-1/2">
              <h1 className="text-4xl font-bold text-center">
                {faq_section?.title}
              </h1>
              <p className="text-md text-center my-4 max-w-[490px]">
                {faq_section?.subtitle}
              </p>
            </div>
            <div className="w-full lg:w-1/2 px-4 lg:px-8 mt-10 ">
              <Accordion type="single" collapsible>
                {faq_section?.steps?.map((step: any, index: any) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="my-2"
                  >
                    <AccordionTrigger className="text-[20px] font-semibold leading-[28px] text-left">
                      {step.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[16px] font-normal leading-[24px] text-left">
                      {step.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
          <ContactUs contact_section={contact_section} />
          <FooterNew />
        </div>
      )}
    </>
  );
};

export default BecomeASeller;
