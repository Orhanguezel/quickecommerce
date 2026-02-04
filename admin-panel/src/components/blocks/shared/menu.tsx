"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useLogoutMutation,
  useStoreOwnerLogoutMutation,
} from "@/modules/users/users.action";
import { Ellipsis, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Key, useEffect, useMemo } from "react";
import { CollapseMenuButton } from "./collapse-menu-button";
import { CustomIcons } from "@/assets/icons";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setDynamicValue } from "@/redux/slices/refetchSlice";
import * as LucideIcons from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
const AllIcons = { ...LucideIcons, ...CustomIcons };

export function Menu({
  isOpen,
  search,
  getPermissions,
  menuItems,
  setIsLoading,
}: any) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
  const userData = getPermissions || {};
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const storedSlug = selectedStore?.slug;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { mutate: logout } = useLogoutMutation({
    onSuccess: () => {
      localStorage.clear();
    },
  });
  const { mutate: StoreOwnerLogout } = useStoreOwnerLogoutMutation({
    onSuccess: () => {
      localStorage.clear();
    },
  });
  const filterItems = (items: any[], searchTerm: string): any[] => {
    if (!searchTerm) return items;

    return items.filter((item) => {
      const itemMatches = item.perm_title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const childMatches = item.children?.some(
        (child: any) =>
          child.perm_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.children?.some((subChild: any) =>
            subChild.perm_title
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
      );

      return itemMatches || childMatches;
    });
  };

  const filteredMenuItems = filterItems(menuItems || [], search);

  const dashboardLink =
    getPermissions?.activity_scope == "store_level" && storedSlug == ""
      ? "/seller/dashboard"
      : getPermissions?.activity_scope == "store_level" && storedSlug !== ""
      ? "/seller/store/dashboard"
      : "/admin/dashboard";
  const PosLink =
    getPermissions?.activity_scope == "store_level"
      ? "/seller/store/pos"
      : "/admin/pos";

  const findItemByPath = (items: any[], currentPath: string): any | null => {
    for (const item of items) {
      if (item.perm_name === currentPath) return item;

      // normalize children (array or object → array)
      const children = Array.isArray(item.children)
        ? item.children
        : item.children
        ? Object.values(item.children)
        : [];

      for (const child of children) {
        if (child.perm_name === currentPath) return child;

        const subChildren = Array.isArray(child.children)
          ? child.children
          : child.children
          ? Object.values(child.children)
          : [];

        const subMatch = subChildren.find(
          (sub: any) => sub.perm_name === currentPath
        );
        if (subMatch) return subMatch;
      }
    }
    return null;
  };

  const currentItem = findItemByPath(
    filteredMenuItems || [],
    pathnameWithoutLocale
  );

  const currentOptions = useMemo(() => {
    return currentItem?.options || [];
  }, [currentItem]);

  const permissionMap = (currentOptions ?? [])?.reduce(
    (acc: { [x: string]: any }, perm: { label: string | any; value: any }) => {
      acc[perm.label] = perm.value;
      return acc;
    },
    {} as Record<string, boolean>
  );

  const canView = permissionMap["view"];

  useEffect(() => {
    if (
      pathnameWithoutLocale === "/admin/dashboard" ||
      pathnameWithoutLocale === "/seller/dashboard" ||
      pathnameWithoutLocale === "/seller/store/dashboard"
    ) {
      return;
    }
    if (currentOptions && canView == "false") {
      if (getPermissions?.activity_scope == "store_level") {
        router.replace("/seller/403");
      } else {
        router.replace("/admin/403");
      }
    }
  }, [
    currentOptions,
    canView,
    pathnameWithoutLocale,
    router,
    getPermissions?.activity_scope,
  ]);

  if (search && filteredMenuItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        {t("common.not_data_found")}
      </div>
    );
  }
  return (
    <>
      <ScrollArea className="[&>div>div[style]]:!block">
        <nav dir={dir} className="mt-2 h-full w-full">
          <ul className="relative flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-60px)] items-start space-y-1 px-2 pb-10">
            {filteredMenuItems?.map((menu: any, index: any) => {
              const iconName = (menu?.icon ||
                "LayoutGrid") as keyof typeof AllIcons;

              const IconComponent = AllIcons[iconName] as
                | React.ComponentType<{ size: number }>
                | undefined;
              const isSubmenuActive = menu?.perm_name === pathnameWithoutLocale;

              return (
                <li
                  className={cn("w-full", menu?.perm_title ? "pt-5" : "")}
                  key={index}
                >
                  {(isOpen && menu?.perm_title) || isOpen === undefined ? (
                    <>
                      {Array.isArray(menu?.children) &&
                      menu?.children.length > 0 ? (
                        <p className="font-bold text-muted-foreground px-4 pb-2 max-w-[248px] truncate uppercase">
                          {menu?.perm_title}
                        </p>
                      ) : (
                        <Button
                          variant={isSubmenuActive ? "labelActive" : "label"}
                          className={`w-full justify-start h-10 mb-1 cursor-pointer  ${
                            isSubmenuActive
                              ? "bg-[#2f3a5f] text-white"
                              : "text-white text-opacity-60 hover:text-opacity-100 hover:bg-[#2f3a5f]"
                          }`}
                          asChild
                        >
                          <Link
                            href={menu?.type ? menu?.perm_name : dashboardLink}
                            onClick={(e) => {
                              const isNewTab =
                                e.metaKey || e.ctrlKey || e.button === 1;
                              const manualPathname =
                                menu?.perm_name === "dashboard"
                                  ? "dashboard"
                                  : pathnameWithoutLocale;

                              if (
                                !isNewTab &&
                                !menu?.type &&
                                pathnameWithoutLocale !== "/admin/dashboard" &&
                                pathnameWithoutLocale !== "/seller/dashboard" &&  pathnameWithoutLocale !== "/seller/store/dashboard"
                              ) {
                                setIsLoading(true);
                              }

                              if (
                                !isNewTab &&
                                menu?.type &&
                                menu?.perm_name !== manualPathname
                              ) {
                                setIsLoading(true);
                              }

                              if (
                                getPermissions?.activity_scope ===
                                  "store_level" &&
                                storedSlug !== ""
                              ) {
                                dispatch(setDynamicValue("store_dashboard"));
                              }
                            }}
                          >
                            <div className="flex items-center ">
                              <span>
                                {IconComponent && <IconComponent size={20} />}
                              </span>
                              <span className="text-sm font-medium mx-4 max-w-[200px] truncate">
                                {menu?.perm_title}
                              </span>
                            </div>
                          </Link>
                        </Button>
                      )}
                    </>
                  ) : !isOpen && isOpen !== undefined && menu?.perm_title ? (
                    <>
                      {Array.isArray(menu?.children) &&
                      menu?.children.length > 0 ? (
                        <TooltipProvider>
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger className="w-full">
                              <div className="w-full flex justify-center items-center">
                                <Ellipsis className="h-5 w-5" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p className="uppercase">{menu?.perm_title}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Link
                          href={menu?.perm_name || "#"}
                          onClick={() => {
                            if (menu?.options) {
                              localStorage.setItem(
                                "selectedOptions",
                                JSON.stringify(menu?.options)
                              );
                            }
                          }}
                        >
                          <div className="flex items-center px-4">
                            <TooltipProvider>
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild className="w-full">
                                  <Button
                                    variant="label"
                                    className="w-full flex justify-center items-center"
                                  >
                                    <span>
                                      {IconComponent && (
                                        <IconComponent size={20} />
                                      )}
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p
                                    onClick={(e) => {
                                      const isNewTab =
                                        e.metaKey ||
                                        e.ctrlKey ||
                                        e.button === 1;

                                      if (
                                        !isNewTab &&
                                        menu?.perm_name !==
                                          pathnameWithoutLocale
                                      ) {
                                        setIsLoading(true);
                                      }
                                    }}
                                    className="uppercase"
                                  >
                                    {menu?.perm_title}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </Link>
                      )}
                    </>
                  ) : (
                    <p className="pb-2"></p>
                  )}
                  {(Array.isArray(menu?.children)
                    ? menu.children
                    : menu?.children
                    ? Object.values(menu.children)
                    : []
                  ).map(
                    (
                      { perm_title, perm_name, icon, children, options }: any,
                      index: Key
                    ) => {
                      const iconName = (icon ||
                        "LayoutGrid") as keyof typeof AllIcons;
                      const IconComponent = AllIcons[iconName] as
                        | React.ComponentType<{ size: number }>
                        | undefined;

                      const isSubmenuActive =
                        perm_name === pathnameWithoutLocale;
                      return (
                        <div className="w-full" key={index}>
                          {Array.isArray(children) && children.length > 0 ? (
                            <CollapseMenuButton
                              route={perm_name || "#"}
                              icon={icon || iconName}
                              label={perm_title}
                              submenus={children}
                              isOpen={isOpen}
                              search={search}
                              setIsLoading={setIsLoading}
                            />
                          ) : (
                            <TooltipProvider disableHoverableContent>
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={
                                      isSubmenuActive ? "labelActive" : "label"
                                    }
                                    className={`w-full justify-start h-10 mb-1 cursor-pointer  ${
                                      isSubmenuActive
                                        ? "bg-[#2f3a5f] text-white"
                                        : "text-white text-opacity-60 hover:text-opacity-100 hover:bg-[#2f3a5f]"
                                    }`}
                                    asChild
                                    onClick={(e) => {
                                      const isNewTab =
                                        e.metaKey ||
                                        e.ctrlKey ||
                                        e.button === 1;

                                      if (
                                        !isNewTab &&
                                        perm_name !== pathnameWithoutLocale
                                      ) {
                                        setIsLoading(true);
                                      }
                                    }}
                                  >
                                    <Link
                                      href={perm_name || "#"}
                                      onClick={() => {
                                        if (options) {
                                          localStorage.setItem(
                                            "selectedOptions",
                                            JSON.stringify(options)
                                          );
                                        }
                                      }}
                                    >
                                      <span>
                                        {IconComponent && (
                                          <IconComponent size={20} />
                                        )}
                                      </span>
                                      <span
                                        className={cn(
                                          "max-w-[200px] truncate",
                                          isOpen === false
                                            ? "-translate-x-96 opacity-0"
                                            : "translate-x-0 opacity-100 mx-4"
                                        )}
                                      >
                                        {perm_title}
                                      </span>
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                {isOpen === false && (
                                  <TooltipContent side="right">
                                    {perm_title}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      );
                    }
                  )}
                </li>
              );
            })}
            <li
              className={`sticky bottom-0 w-full grow flex bg-[#232e51] dark:bg-custom-dark-blue ${
                isOpen === false ? "" : ""
              }`}
            >
              <TooltipProvider disableHoverableContent>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => {
                        if (userData?.activity_scope === "store_level") {
                          StoreOwnerLogout();
                        } else {
                          logout();
                        }
                      }}
                      variant="label"
                      className="justify-start h-10 mb-2 lg:w-full lg:mr-4 text-white text-opacity-60 hover:text-opacity-100 hover:bg-[#2f3a5f]"
                    >
                      <span className={cn("pl-1", isOpen === false ? "" : "")}>
                        <LogOut size={18} />
                      </span>
                      <p
                        className={cn(
                          "whitespace-nowrap",
                          isOpen === false
                            ? "opacity-0 hidden"
                            : "opacity-100 mx-4"
                        )}
                      >
                        {t("label.signout")}
                      </p>
                    </Button>
                  </TooltipTrigger>
                  {isOpen === false && (
                    <TooltipContent side="right">
                      {t("label.signout")}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </li>
          </ul>
        </nav>
      </ScrollArea>
    </>
  );
}
