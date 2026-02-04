"use client";
import { AppSearchSelect } from "@/components/blocks/common/AppSearchSelect";
import LocaleSwitcher from "@/components/blocks/shared/LocalSwitcher";
import { ThemeToggle } from "@/components/blocks/shared/theme-toggle";
import { Button, Card } from "@/components/ui";
import { Routes } from "@/config/routes";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useFirebaseNotifications } from "@/lib/hooks/useFirebaseNotifications";
import { cn } from "@/lib/utils";
import { useNotificationsQuery as useAdminNotificationsQuery } from "@/modules/admin-section/notifications/notifications.action";
import { useNotificationsQuery as useSellerNotificationsQuery } from "@/modules/seller-section/notifications/notifications.action";
import { useStoreListQuery } from "@/modules/seller-section/product/product.action";
import { useGetPermissionsQuery } from "@/modules/users/users.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/index";
import { clearCart } from "@/redux/slices/cartSlice";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { setSelectedStore } from "@/redux/slices/storeSlice";
import { Bell, ExternalLink, MessageSquareMore } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SheetMenu } from "./sheet-menu";
import { UserNav } from "./user-nav";

export function Navbar({ MeData, setIsLoading }: any) {
  const pathname = usePathname();
  const t = useTranslations();
  const LocaleDir = useLocale();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const localeRoute = useLocale();
  const pathnameWithoutLocale = pathname.replace(`/${localeRoute}`, "") || "/";
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const storedSlug = selectedStore?.slug;
  const { getPermissions } = useGetPermissionsQuery({
    store_slug: storedSlug ?? "",
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const { token: firebaseToken, notifications } = useFirebaseNotifications(
    () => {
      setUnreadCount((prev) => prev + 1);
    }
  );
  const isSeller = MeData?.activity_scope === "store_level";

  const {
    NotificationsAdminList,
    refetch: refetchAdmin,
    isPending: isPendingAdmin,
    error: errorAdmin,
  } = useAdminNotificationsQuery(
    {
      per_page: 20,
      language: LocaleDir,
    },
    { skip: getPermissions?.activity_scope !== "system_level" }
  );
  const { NotificationsList, refetch, isPending, error } =
    useSellerNotificationsQuery(
      {
        per_page: 20,
        language: LocaleDir,
      },
      { skip: getPermissions?.activity_scope !== "store_level" }
    );

  const originalData = useMemo(() => {
    const data = isSeller
      ? (NotificationsList as any)?.data
      : (NotificationsAdminList as any)?.data || [];
    return data;
  }, [NotificationsList, NotificationsAdminList]);

  useEffect(() => {
    const unreadFromDB =
      originalData?.filter((item: any) => item.status === "unread") || [];
    setUnreadCount(unreadFromDB.length);
  }, [originalData]);

  const unreadCombinedNotifications = useMemo(() => {
    const firebaseNotifs =
      (notifications || []).map((item) => ({
        title: item.title,
        message: item.body,
      })) || [];

    const unreadFromDB =
      originalData?.filter((item: any) => item.status === "unread") || [];

    return [...firebaseNotifs, ...unreadFromDB];
  }, [notifications, originalData]);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const data: any = getPermissions || {};
  const { stores } = useStoreListQuery(
    {},
    { skip: getPermissions?.activity_scope !== "store_level" }
  );
  const storeList = useMemo(() => (stores as any)?.stores ?? [], [stores]);
  const [isHovering, setIsHovering] = useState(false);
  const [isPopupHovered, setIsPopupHovered] = useState(false);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      if (!isPopupHovered) {
        setIsHovering(false);
      }
    }, 300);
  };

  const handlePopupMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsPopupHovered(true);
  };

  const handlePopupMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setIsPopupHovered(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleNotificationClick = (notification: any, e?: React.MouseEvent) => {
    if (!notification) return;
    setIsHovering(false);
    const orderID = notification.data?.order_id;
    if (!orderID) return;

    let url = `${Routes.orderDetails}/${orderID}`;

    if (data && data.activity_scope === "store_level") {
      url = `${SellerRoutes.orderDetails}/${orderID}`;
    }
    if (e && (e.ctrlKey || e.metaKey || e.button === 1)) {
      window.open(url, "_blank");
    } else {
      router.push(url);
    }
  };

  const handleNotificationList = (e?: React.MouseEvent) => {
    setIsHovering(false);
    let url = `${Routes.adminNotifications}`;

    if (data && data.activity_scope === "store_level") {
      url = `${SellerRoutes.sellerNotifications}`;
    }

    if (e && (e.ctrlKey || e.metaKey || e.button === 1)) {
      window.open(url, "_blank");
    } else {
      router.push(url);
    }
  };

  const handleSelectItem = (storeId: string) => {
    const store = storeList.find(
      (store: { value: string }) => store.value == storeId
    );
    if (!store) return;
    dispatch(
      setSelectedStore({ id: store.value, type: store.type, slug: store.slug })
    );
    dispatch(clearCart());
    if (store.slug) {
      setIsLoading(true);
      router.push(`${SellerRoutes.storeDashboard}/${store.slug}`);
      dispatch(setRefetch(true));
      localStorage.setItem("store_id", storeId);
    }
  };
  const handleClickDeliveryman = (e: React.MouseEvent) => {
    const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

    if (!isNewTab && pathnameWithoutLocale !== "/admin/chat/manage") {
      setIsLoading(true);
    }
    const url = `${Routes.adminChatManage}`;
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(url, "_blank");
    } else {
      router.push(url);
    }
  };

  return (
    <header
      className={`p-2 sticky top-0 z-70 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary dark:bg-custom-dark-blue ${
        data && data.activity_scope === "store_level"
          ? "md:h-[120px] lg:h-[80px] h-[200px]"
          : "lg:h-[80px] h-[120px]"
      }  `}
    >
      <div className="mx-2 md:mx-4 flex  flex-col md:flex-row h-14 items-start md:items-center ">
        <div className="flex gap-4 lg:gap-0 items-start">
          <SheetMenu getPermissions={getPermissions} />
        </div>
        <div
          className={` ${
            data && data.activity_scope === "store_level"
              ? " flex flex-col flex-1 md:flex-row items-start md:items-center space-x-0 md:space-x-2 justify-start md:justify-end px-0 md:px-2 gap-2"
              : "flex items-center flex-1 space-x-0 md:space-x-2 justify-start md:justify-end px-0 md:px-2  gap-4"
          } `}
        >
          <div className="flex items-center justify-center gap-2">
            <ThemeToggle />

            <Link
              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                className="flex gap-2 mx-0 md:mx-2 bg-blue-50 text-blue-500 hover:text-blue-600"
              >
                <span
                  className={`${
                    data && data.activity_scope === "store_level"
                      ? ""
                      : "hidden sm:block"
                  } `}
                >
                  {t("label.visit_site")}
                </span>{" "}
                <ExternalLink width={15} height={15} />
              </Button>
            </Link>
            <div className="mx-2 md:mx-0">
              <LocaleSwitcher />
            </div>
          </div>
          <div className={`flex items-center justify-center gap-3`}>
            {data && data.activity_scope === "store_level" && (
              <div
                className={cn(
                  `mt-[-16px] lg:w-[200px] w-[150px] whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300 text-gray-500 dark:text-white translate-x-0 opacity-100`
                )}
              >
                <AppSearchSelect
                  placeholder="Select Store"
                  customClass="mt-4 text-blue-500 sidebar-select app-input"
                  value={String(selectedStore.id) ?? "None"}
                  onSelect={handleSelectItem}
                  groups={storeList}
                  hideNone
                />
              </div>
            )}

            {data && data.activity_scope === "system_level" && (
              <div
                onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                  handleClickDeliveryman(e)
                }
                className={`mt-2 cursor-pointer `}
              >
                <MessageSquareMore
                  className="text-gray-600 dark:text-white"
                  width={24}
                  height={24}
                />
              </div>
            )}
            <div
              className={`mt-4 relative px-2`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Bell className="text-gray-600 dark:text-white cursor-pointer " />

              <div className="pt-2">
                <span className="absolute top-[-4px] right-[4px] bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>

                {isHovering && (
                  <div>
                    <Card
                      className="absolute right-0 mt-2 w-64 bg-white z-70"
                      onMouseEnter={handlePopupMouseEnter}
                      onMouseLeave={handlePopupMouseLeave}
                    >
                      <div className="max-h-80 z-70">
                        <h3 className="font-semibold text-sm p-2 border-b">
                          {t("label.notifications")}
                        </h3>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar z-70">
                          {unreadCombinedNotifications.length > 0 ? (
                            unreadCombinedNotifications.map(
                              (notification, index) => (
                                <div
                                  key={index}
                                  className="p-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                                  onClick={(e) =>
                                    handleNotificationClick(notification, e)
                                  }
                                >
                                  <p className="font-medium text-sm hover:text-blue-500">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-white">
                                    {notification.message}
                                  </p>
                                </div>
                              )
                            )
                          ) : (
                            <div className="p-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer">
                              <p className="py-4 font-medium text-sm text-gray-400 hover:text-gray-500 dark:text-white text-center">
                                {t("common.no_new_notifications_at_the_moment")}
                              </p>
                            </div>
                          )}
                        </div>

                        <div
                          className="z-70 sticky bottom-0 bg-white border-t p-2 text-center hover:bg-gray-50 cursor-pointer"
                          onClick={(e) => handleNotificationList(e)}
                        >
                          <p className="text-sm font-medium text-blue-500 hover:text-blue-600">
                            {t("common.show_all_notifications")}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
            <UserNav
              getPermissions={getPermissions}
              MeData={MeData}
              setIsLoading={setIsLoading}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
