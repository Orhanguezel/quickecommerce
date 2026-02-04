"use client";
import TurnstileCaptcha from "@/components/blocks/common/TurnstileCaptcha";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import { Button, Input, Skeleton } from "@/components/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useFirebaseNotifications } from "@/lib/hooks/useFirebaseNotifications";
import GlobalImageLoader from "@/lib/imageLoader";
import { useAdminSignInQuery } from "@/modules/admin-section/system-management/page-settings/page-settings.action";
import { useGeneralQuery } from "@/modules/common/com/com.action";
import { useLogin } from "@/modules/users/users.action";
import { LoginInput, LoginSchema } from "@/modules/users/users.schema";
import { AuthFormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import Loader from "../Loader";
import ChangePassword from "./modals/ChangePassword";

const FormSchema = z.object({
  email: z.string().min(2, {
    message: "Email is require.",
  }),
  password: z.string().min(2, {
    message: "Password is require.",
  }),
});

const SignInForm = ({
  className,
  view = "page",
  isRedirect,
}: AuthFormProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const localeMain = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const { mutate: login, isPending } = useLogin({ isRedirect });
  const [rememberMe, setRememberMe] = useState(false);
  const [on, setOn] = useState(false);
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

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const {
    control,
    setValue,
    handleSubmit,
    reset,
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
    AdminSignInData,
    refetch,
    isFetching,
    isPending: isQuerying,
  } = useAdminSignInQuery({});
  const QueryGeneralSettingsData = useMemo(
    () => (AdminSignInData as any)?.data || [],
    [AdminSignInData]
  );
  const { token: firebaseToken, notifications } = useFirebaseNotifications();

  async function onSubmit({ email, password }: LoginInput) {
    if (password == "") {
      return toast.error(t("toast.please_enter_Password"));
    }
    const payload: LoginInput & { remember_me?: boolean } = {
      email,
      password,
      ...(rememberMe && { remember_me: true }),
      ...(firebaseToken && { firebase_device_token: firebaseToken }),
      ...(GeneralData?.com_google_recaptcha_enable_disable === "on" && {
        cf_token: captchaToken,
      }),
    };

    login(payload, {
      onSuccess: (data) => {
        if (!data.data?.token) {
          return;
        }
        setIsLoading(true);
        reset();
        localStorage.setItem(
          "selectedStore",
          JSON.stringify({ id: "", slug: "" })
        );
      },
    });
  }
  const handleCopyClick = () => {
    setValue("email", "admin@gmail.com");
    setValue("password", "12345678");
  };
  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <div className="w-full h-full bg-white">
        <div>
          <div
            style={
              {
                "--register-bg-image": `url(/images/reg_bg.png)`,
              } as React.CSSProperties
            }
            className="h-[91.3vh] bg-cover grid 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-1 grid-cols-1 bg-gray-100"
          >
            <div className="2xl:inline-block xl:inline-block  lg:hidden hidden">
              <div className="h-full flex items-center justify-center p-4">
                {isQuerying ? (
                  <Skeleton className="w-64 h-64 rounded-xl" />
                ) : QueryGeneralSettingsData?.com_seller_login_page_image ? (
                  <div className="relative w-full max-w-[1200px] aspect-[3/2]">
                    <Image
                      loader={GlobalImageLoader}
                      src={QueryGeneralSettingsData.com_seller_login_page_image}
                      alt="Login illustration"
                      fill
                      sizes="(max-width: 768px) 100vw, 1200px"
                      className="object-contain rounded-md"
                      priority
                    />
                  </div>
                ) : (
                  <div className="relative w-full max-w-[200px]">
                    <Image
                      src="/images/no-image.png"
                      alt="Login illustration"
                      width={200}
                      height={200}
                      className="w-full h-auto object-contain rounded-md"
                      priority
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center items-center">
              <div className=" flex flex-col justify-center items-center bg-white dark:bg-[#1e293b] 2xl:h-[630px] xl:h-[630px] lg:h-full h-full lg:w-full w-full xl:w-[600px] rounded-md z-10 p-8">
                {isQuerying ? (
                  <Skeleton className="w-40 h-16 rounded-xl" />
                ) : (
                  ""
                )}

                <div className="mt-4 w-full">
                  <h2 className="text-center text-2xl font-bold">
                    {QueryGeneralSettingsData?.com_seller_login_page_title}
                  </h2>
                  <h5 className="text-center text-sm mt-2">
                    {QueryGeneralSettingsData?.com_seller_login_page_subtitle}
                  </h5>
                  <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 ">
                      <FormField
                        control={control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5 text-gray-600 dark:text-white">
                            <div className="flex items-center">
                              <p className="text-sm font-semibold">
                                {t("label.email")}
                              </p>
                              <span className="text-red-500 mx-0.5">*</span>
                            </div>
                            <FormControl>
                              <Input
                                className="border-none ring ring-white dark:ring-[#1e293b] focus-visible:ring-white dark:focus-visible:ring-[#1e293b] ring-offset-0 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 app-input"
                                placeholder="Email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5 text-gray-600 dark:text-white mt-4">
                            <div className="flex items-center">
                              <p className="text-sm font-semibold">
                                {" "}
                                {t("label.password")}{" "}
                              </p>
                              <span className="text-red-500 mx-0.5">*</span>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  className="border-none ring ring-white dark:ring-[#1e293b] focus-visible:ring-white dark:focus-visible:ring-[#1e293b] ring-offset-0 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 app-input"
                                  placeholder="Password"
                                  type={on ? "text" : "password"}
                                  maxLength={12}
                                  {...field}
                                />
                                {on ? (
                                  <div
                                    className={`${
                                      locale === "ar" ? "left-4" : "right-4"
                                    } absolute top-2 cursor-pointer`}
                                  >
                                    <Eye
                                      className="text-gray-500 dark:text-white w-5"
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
                                      className="text-gray-500 dark:text-white w-5"
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

                      {GeneralData?.com_google_recaptcha_enable_disable ===
                        "on" && (
                        <div className="mt-4 min-h-[100px]">
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
                                    Please complete the captcha verification
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
                            className="peer data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            checked={rememberMe}
                            onChange={handleRememberMeChange}
                          />
                          <label
                            htmlFor="terms"
                            className="cursor-pointer pr-2 text-sm font-medium text-gray-600 dark:text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {t("label.remember_me")}
                          </label>
                        </div>
                        <div>
                          <ChangePassword
                            trigger={
                              <span className="cursor-pointer text-sm text-blue-500 hover:text-blue-700 font-semibold">
                                {t("label.forgot_password")}
                              </span>
                            }
                          />
                        </div>
                      </div>
                      <Button
                        className="bg-blue-500 hover:bg-blue-700 w-full"
                        type="submit"
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader color="text-white" size="small" />
                        ) : (
                          <span>{t("button.login")}</span>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
