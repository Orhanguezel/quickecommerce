"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { Routes } from "@/config/routes";
import { SellerRoutes } from "@/config/sellerRoutes";
import { authorizationAtom } from "@/lib/authorization-atom";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useLogoutMutation,
  useStoreOwnerLogoutMutation,
} from "@/modules/users/users.action";
import { useAtom } from "jotai";
import { LogOut, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function UserNav({ getPermissions, MeData, setIsLoading }: any) {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = pathname.split("/")[1];
  const localeRoute = useLocale();
  const pathnameWithoutLocale = pathname.replace(`/${localeRoute}`, "") || "/";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [isAuthorized, setAuthorized] = useAtom(authorizationAtom);
  const userData = getPermissions || {};
  localStorage.setItem("user_email", userData?.email);
  const { mutate: logout } = useLogoutMutation();
  const { mutate: StoreOwnerLogout } = useStoreOwnerLogoutMutation({
    onSuccess: () => {
      localStorage.clear();
    },
  });
  useEffect(() => {
    if (isAuthorized) {
    }
  }, [isAuthorized]);
  const truncateEmail = (email: string, maxLength = 16) => {
    const [username, domain] = email.split("@");
    const truncatedUsername =
      username.length > maxLength
        ? `${username.slice(0, maxLength)}...`
        : username;
    return `${truncatedUsername}@${domain}`;
  };

  return (
    <>
      <DropdownMenu dir={dir}>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`text-start border-none bg-transparent hover:bg-transparent font-semibold ${
                  dir === "rtl" ? "px-0" : ""
                }`}
              >
                {MeData?.image_url ? (
                  <div className="relative rounded-full h-10 w-10">
                    <Image
                      loader={GlobalImageLoader}
                      src={MeData?.image_url}
                      alt="profile image"
                      fill
                      sizes="40px"
                      className="w-full h-full rounded-full"
                      priority
                    />
                  </div>
                ) : (
                  <div className="relative rounded-full h-10 w-10">
                    <Image
                      src="/images/no-image.png"
                      alt="profile image"
                      fill
                      sizes="40px"
                      className="w-full h-full rounded-full"
                      priority
                    />
                  </div>
                )}

                <div className="mx-2 hidden sm:block text-gray-500 dark:text-white">
                  <span className="truncate overflow-hidden whitespace-nowrap max-w-[140px]">
                    {MeData?.full_name}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent
          className="w-56 border-none shadow-custom z-80"
          align="end"
          forceMount
        >
          <div>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate overflow-hidden whitespace-nowrap max-w-[150px]">
                  {MeData?.full_name}
                </p>
                <p className="min-h-[20px] text-xs leading-none text-muted-foreground max-w-[200px] overflow-hidden whitespace-nowrap">
                  {MeData?.email ? truncateEmail(MeData.email) : ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="hover:cursor-pointer" asChild>
                <Link
                  href={
                    userData?.activity_scope === "store_level"
                      ? SellerRoutes.profile
                      : Routes.profile
                  }
                  onClick={(e) => {
                    const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;
                    const isSellerProfile =
                      userData?.activity_scope === "store_level" &&
                      pathnameWithoutLocale === "/seller/profile";
                    const isAdminProfile =
                      userData?.activity_scope !== "store_level" &&
                      pathnameWithoutLocale === "/admin/profile";

                    if (!isNewTab && !isSellerProfile && !isAdminProfile) {
                      setIsLoading(true);
                    }
                  }}
                  className="flex items-center"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="mx-3">{t("common.profile")}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => {
                if (userData?.activity_scope === "store_level") {
                  StoreOwnerLogout();
                } else {
                  logout();
                }
              }}
            >
              <LogOut className="w-4 h-4  text-muted-foreground" />
              <span className="mx-3">{t("label.signout")}</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
