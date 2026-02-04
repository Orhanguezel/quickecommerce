import { AppleLogo, GoogleplayLogo } from "@/assets/icons";
import Facebook from "@/assets/icons/Facebook";
import Instagram from "@/assets/icons/Instagram";
import Linkedin from "@/assets/icons/Linkedin";
import Pinterest from "@/assets/icons/Pinterest";
import Snapchat from "@/assets/icons/Snapchat";
import Twitter from "@/assets/icons/Twitter";
import Youtube from "@/assets/icons/Youtube";
import { Skeleton } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useGeneralQuery } from "@/modules/common/com/com.action";
import { useFooterQuery } from "@/modules/common/footer/footer.action";
import { Mail, MapPin, PhoneCall } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const FooterNewThemeTwo = () => {
  const localeMain = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const { footer, refetch } = useFooterQuery({
    language: localeMain,
  });
  const originalData = useMemo(() => {
    const datas = (footer as any) || [];
    const data = (datas?.data?.content as any) || {};
    return data;
  }, [footer]);
  const FooterData = originalData || {};
  const quickAccessLinks = FooterData.com_quick_access || [];
  const ourInfoLinks = FooterData.com_our_info || [];
  const helpCenterLinks = FooterData.com_help_center || [];
  const imageUrls = FooterData.com_payment_methods_image_urls
    ? FooterData.com_payment_methods_image_urls.split(",").filter(Boolean)
    : [];

  const { general, refetch: generalRefetch } = useGeneralQuery({
    language: localeMain,
  });
  const originalDataGeneral = useMemo(() => {
    const data = (general as any) || {};
    return data;
  }, [general]);

  const GeneralData = originalDataGeneral.site_settings;

  return (
    <footer className="mt-[50px]">
      <div className="bg-black border-[#F4F4F4] ">
        <div className=" w-full h-auto xl:h-[570px] flex flex-col rounded-none p-2 md:p-6">
          <div className="h-full w-full flex flex-col lg:flex-row pt-[40px]">
            <div className="h-full w-full xl:w-[30%] 2xl:w-[40%] ">
              <div className="w-full h-full py-3 md:py-10 xl:py-0 flex flex-col items-start justify-start gap-[40px]">
                <div className="w-full flex flex-col justify-start">
                  <div className="flex items-center gap-4 w-[150px] h-[65px]">
                    {GeneralData?.com_site_white_logo ? (
                      <Image
                        loader={GlobalImageLoader}
                        src={
                          GeneralData?.com_site_white_logo ??
                          "/images/no-image.png"
                        }
                        alt="logo"
                        width={100}
                        height={44}
                        className="w-full h-full"
                        loading="lazy"
                      />
                    ) : (
                      <Skeleton className="w-10 h-10 rounded-full" />
                    )}
                  </div>
                  <div className="text-white text-[18px] font-normal text-start mt-2 w-full lg:w-[55%] line-clamp-2">
                    {GeneralData?.com_site_subtitle}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {GeneralData?.com_site_full_address && (
                    <div className="flex items-center justify-start gap-3 ">
                      <div className="text-white ">
                        <MapPin width={16} height={16} />
                      </div>
                      <div className="text-[16px] text-white font-[400] ">
                        {t("common.hotline")}:{" "}
                        {GeneralData?.com_site_full_address}
                      </div>
                    </div>
                  )}

                  {GeneralData?.com_site_email && (
                    <div className="flex items-center justify-start gap-3 ">
                      <div className="text-white ">
                        <Mail width={16} height={16} />
                      </div>
                      <div className="text-[16px] text-white font-[400] ">
                        {t("common.mail")}: {GeneralData?.com_site_email}
                      </div>
                    </div>
                  )}

                  {GeneralData?.com_site_contact_number && (
                    <div className="flex items-center justify-start gap-3 ">
                      <div className="text-white ">
                        <PhoneCall width={16} height={16} />
                      </div>
                      <div className="text-[16px] text-white font-[400] ">
                        {t("common.phone")}:{" "}
                        {GeneralData?.com_site_contact_number}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-full w-full xl:w-[70%] 2xl:w-[60%] grid  grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4 pt-[10px] lg:pt-[50px]">
              <div className="h-full w-full px-2 lg:px-10 py-4">
                {FooterData.com_quick_access_enable_disable == "on" && (
                  <div>
                    <h4 className="text-white text-[14px] sm:text-[20px] font-bold text-start">
                      {FooterData.com_quick_access_title || "Quick Access"}
                    </h4>
                    <ul className="mt-2 space-y-2 text-white text-[12px] sm:text-[14px] font-medium text-start">
                      {quickAccessLinks.map((link: any) => (
                        <li
                          key={link.com_quick_access_title}
                          className="hover:underline"
                        >
                          <Link
                            target="_blank"
                            href={link.com_quick_access_url ?? ""}
                          >
                            {link.com_quick_access_title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="h-full w-full px-2 lg:px-10 py-4">
                {FooterData.com_our_info_enable_disable == "on" && (
                  <div>
                    <h4 className="text-white text-[14px] sm:text-[20px] font-bold text-start">
                      {FooterData.com_our_info_title || "Our Information"}
                    </h4>
                    <ul className="mt-2 space-y-2 text-white text-[12px] sm:text-[14px] font-medium text-start">
                      {ourInfoLinks.map((link: any) => (
                        <li key={link.title} className="hover:underline">
                          <Link target="_blank" href={link.url ?? ""}>
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="h-full w-full px-0 lg:px-4 xl:px-10 py-4 text-white">
                {helpCenterLinks && helpCenterLinks.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-bold">
                      {FooterData.com_help_center_title ||
                        "Help Center"}
                    </h4>
                    <ul className="mt-5 space-y-2 text-base font-light">
                      {helpCenterLinks.map((link: any) => (
                        <li
                          key={link.title}
                          className="hover:underline hover:text-[var(--secondary)] dark:hover:text-blue-600"
                        >
                          <Link target="_blank" href={link.url || "/"}>
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="animate-pulse">
                    <Skeleton className="h-[18px] w-[80px] sm:w-[120px] bg-gray-300 dark:bg-gray-600 rounded-md mb-3" />
                    <ul className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-[14px] w-[100px] sm:w-[150px] bg-gray-300 dark:bg-gray-600 rounded-md"
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="h-full w-full px-2 lg:px-10 py-4">
                <div className="text-[16px]  text-white font-[500] line-clamp-1 text-start">
                  {t("common.download_app")}
                </div>
                <div className="flex flex-col items-start gap-4 mt-4">
                  {FooterData?.com_download_app_link_two ? (
                    <Link href={FooterData.com_download_app_link_two ?? ""}>
                      <button className="bg-[#F2F5FB] text-black px-3 py-1 rounded-md text-[14px] flex items-center gap-1 hover:bg-gray-300  transition-colors">
                        <AppleLogo width={14} height={14} />{" "}
                        <span className="hidden md:block">App Store</span>
                      </button>
                    </Link>
                  ) : (
                    <div className=""></div>
                  )}

                  {FooterData?.com_download_app_link_one ? (
                    <Link href={FooterData.com_download_app_link_one ?? ""}>
                      <button className="bg-[#F2F5FB] text-black px-3 py-1 rounded-md text-[14px] flex items-center gap-1 hover:bg-gray-300  transition-colors">
                        <GoogleplayLogo width={14} height={14} />{" "}
                        <span className="hidden md:block">Google Play</span>
                      </button>
                    </Link>
                  ) : (
                    <div className=""></div>
                  )}
                </div>
              </div>
              <div className="h-full w-full px-2 lg:px-10 py-4">
                {FooterData.com_help_center_enable_disable == "on" && (
                  <div>
                    <h4 className="text-white text-[14px] sm:text-[20px] font-bold text-start">
                      {FooterData.com_help_center_title || "Help Center"}
                    </h4>
                    <ul className="mt-2 space-y-2 text-white text-[12px] sm:text-[14px] font-medium text-start">
                      {helpCenterLinks.map((link: any) => (
                        <li key={link.title} className="hover:underline">
                          <Link target="_blank" href={link.url ?? ""}>
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row justify-start lg:justify-between items-start lg:items-center gap-[20px] lg:gap-0 pt-[20px] lg:pt-0">
            <div>
              <div className="text-[16px] text-white font-[500] line-clamp-1 text-start">
                {t("common.social_connect")}
              </div>
              {FooterData.com_social_links_enable_disable == "on" && (
                <div className="flex items-center gap-4 mt-4">
                  {FooterData.com_social_links_facebook_url ? (
                    <Link
                      href={FooterData.com_social_links_facebook_url ?? ""}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Facebook />
                    </Link>
                  ) : (
                    <div className=""></div>
                  )}

                  {FooterData.com_social_links_twitter_url ? (
                    <Link
                      href={FooterData.com_social_links_twitter_url ?? ""}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter />
                    </Link>
                  ) : (
                    <div className=""></div>
                  )}

                  {FooterData.com_social_links_instagram_url ? (
                    <Link
                      href={FooterData.com_social_links_instagram_url ?? ""}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram />
                    </Link>
                  ) : (
                    <div className=""></div>
                  )}

                  {FooterData.com_social_links_linkedin_url ? (
                    <Link
                      href={FooterData.com_social_links_linkedin_url ?? ""}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin />
                    </Link>
                  ) : (
                    <div className=""></div>
                  )}

                  {FooterData.com_social_links_youtube_url ? (
                    <Link
                      href={FooterData.com_social_links_youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Youtube />
                    </Link>
                  ) : (
                    <div className=""></div>
                  )}

                  {FooterData.com_social_links_pinterest_url ? (
                    <Link
                      href={FooterData.com_social_links_pinterest_url ?? ""}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Pinterest />
                    </Link>
                  ) : (
                    <div className=""></div>
                  )}

                  {FooterData.com_social_links_snapchat_url ? (
                    <Link
                      href={FooterData.com_social_links_snapchat_url ?? ""}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Snapchat />
                    </Link>
                  ) : (
                    <div className=""></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-center justify-between px-4 bg-black border-t border-[#FFFFFF87]">
          <div className="text-white   text-sm text-center py-[20px]">
            {GeneralData?.com_site_footer_copyright}
          </div>
          <div>
            {FooterData.com_payment_methods_enable_disable == "on" ? (
              <div className="flex items-center gap-1">
                {imageUrls && imageUrls.length > 0 ? (
                  imageUrls.map((url: string, index: number) => (
                    <div
                      className="h-[24px] w-[50px] bg-[#ffffff] px-2 rounded-sm"
                      key={index}
                    >
                      <Image
                        loader={GlobalImageLoader}
                        src={url}
                        alt={`payment-method-${index}`}
                        width={50}
                        height={24}
                        className="h-full w-full object-fill"
                        loading="lazy"
                      />
                    </div>
                  ))
                ) : (
                  <div></div>
                )}
              </div>
            ) : (
              ""
            )}
          </div>
          <div className="text-xs md:text-sm font-normal py-3 xl:py-[20px] flex flex-wrap gap-1 text-white">
            {quickAccessLinks?.map((links: { com_quick_access_title: string; com_quick_access_url: string }, index: number) => (
              <span key={index} className="flex items-center">
                <a href={links.com_quick_access_url} className="hover:underline">
                  {links.com_quick_access_title}
                </a>
                {index < quickAccessLinks?.length - 1 && (
                  <span className="mx-1">/</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterNewThemeTwo;
