"use client";

import { Input } from "@/components/ui";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { useStore } from "@/hooks/use-store";
import GlobalImageLoader from "@/lib/imageLoader";
import { cn } from "@/lib/utils";
import { useGeneralQuery } from "@/modules/common/com/com.action";
import { useStoreListQuery } from "@/modules/seller-section/product/product.action";
import {
  useSellerDashboardQuery,
  useSellerGrowthOrderQuery,
  useSellerOtherSummaryQuery,
  useSellerSalesSummaryQuery,
} from "@/modules/seller-section/seller-dashboard/seller-dashboard.action";
import { useGetPermissionsQuery } from "@/modules/users/users.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/index";
import { setDynamicValue, setRefetch } from "@/redux/slices/refetchSlice";
import { setSelectedStore } from "@/redux/slices/storeSlice";
import { Search } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { memo, useEffect, useMemo, useState } from "react";
import { Menu } from "./menu";
import { SidebarToggle } from "./sidebar-toggle";

export const Sidebar = memo(({ setIsLoading }: any) => {
  const localeMain = useLocale();

  const { isRefetch, dynamicValue } = useAppSelector(
    (state) => state.refetchValue
  );
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const storedSlug = selectedStore?.slug ?? "";
  const pathname = usePathname();
  const pathnameWithoutLocale = pathname.replace(`/${localeMain}`, "") || "/";
  const isSellerPath = pathnameWithoutLocale.startsWith("/seller");

  const { stores } = useStoreListQuery(
    {},
    { skip: !isSellerPath }
  );
  const storeList = useMemo(() => (stores as any)?.stores ?? [], [stores]);
  const fallbackStoreSlug = useMemo(() => {
    if (storedSlug) return storedSlug;
    const first = Array.isArray(storeList) ? storeList[0] : null;
    return first?.slug ?? "";
  }, [storedSlug, storeList]);

  const { getPermissions, refetch, isPending, isFetching } =
    useGetPermissionsQuery({
      store_slug: fallbackStoreSlug,
      language: localeMain,
    });

  const { general, refetch: generalRefetch } = useGeneralQuery({
    language: localeMain,
  });

  const QueryGeneralSettingsData = useMemo(
    () => (general as any)?.site_settings || {},
    [general]
  );


  const sidebar = useStore(useSidebarToggle, (state) => state);
  const localeDir = pathname.split("/")[1];
  const dir = localeDir === "ar" ? "rtl" : "ltr";
  const MenuItems = getPermissions?.permissions;
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { refetch: isDashboardRefetch } = useSellerDashboardQuery({
    language: locale,
    slug: storedSlug,
  });

  const { refetch: SalesSummaryRefetch } = useSellerSalesSummaryQuery({
    language: locale,
    slug: storedSlug,
  });

  const { refetch: SellerGrowthRefetch } = useSellerGrowthOrderQuery({
    language: locale,
    slug: storedSlug,
  });

  const { refetch: SellerOtherRefetch } = useSellerOtherSummaryQuery({
    language: locale,
    slug: storedSlug,
  });

  const dashboardLink =
    getPermissions?.activity_scope == "store_level"
      ? "/seller/dashboard"
      : "/admin/dashboard";

  const [search, setSearch] = useState("");
  const menuItems: any =
    storedSlug === "" && getPermissions?.activity_scope === "store_level"
      ? [...MenuItems]
      : MenuItems;


  useEffect(() => {
    if (
      (isRefetch && dynamicValue === "store_dashboard") ||
      dynamicValue === "admin_dashboard"
    ) {
      refetch();
      isDashboardRefetch();
      SalesSummaryRefetch();
      SellerGrowthRefetch();
      SellerOtherRefetch();
      dispatch(setDynamicValue(null));
    }
  }, [
    isRefetch,
    dynamicValue,
    dispatch,
    refetch,
    isDashboardRefetch,
    SalesSummaryRefetch,
    SellerGrowthRefetch,
    SellerOtherRefetch,
  ]);
  const handleLogo = () => {
    localStorage.setItem("selectedStore", JSON.stringify({ id: "", slug: "" }));
    isDashboardRefetch();
    SalesSummaryRefetch();
    SellerGrowthRefetch();
    SellerOtherRefetch();
    dispatch(setSelectedStore({ id: "", type: "", slug: "" }));
    router.push(`${dashboardLink}`);
    if (getPermissions?.activity_scope == "store_level") {
      dispatch(setRefetch(true));
      dispatch(setDynamicValue("store_dashboard"));
    }
  };
  if (!sidebar) return null;
  return (
    <aside
      className={cn(
        `fixed top-0 ${
          dir == "rtl" ? "" : "left-0"
        }  z-80 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300`,
        sidebar?.isOpen === false ? "w-[90px]" : "lg:w-72 w-6"
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div
        className={`relative h-full flex flex-col px-3 py-2 overflow-y-auto shadow-md dark:shadow-zinc-800 bg-[#232e51] dark:bg-custom-dark-blue  text-white ${
          dir == "rtl" ? "invisible lg:visible" : ""
        } `}
      >
        <div
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0"
          )}
        >
          <div className="cursor-pointer" onClick={handleLogo}>
            <div
              className={cn(
                `font-bold text-lg py-0.5 ${
                  dir == "rtl" ? "pr-4" : "px-2"
                }  whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300 text-white`,
                sidebar?.isOpen === true
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
              {QueryGeneralSettingsData?.com_site_favicon ? (
                <div className="relative w-8 h-8">
                  <Image
                    loader={GlobalImageLoader}
                    src={QueryGeneralSettingsData?.com_site_favicon}
                    alt="quick_ecommerce"
                    fill
                    sizes="32px"
                    className="w-full h-full "
                    priority
                  />
                </div>
              ) : (
                <div className="relative w-8 h-8">
                  <Image
                    src="/images/no-image.png"
                    alt="quick_ecommerce"
                    fill
                    sizes="32px"
                    className="w-full h-full"
                    priority
                  />
                </div>
              )}
            </div>
            <div
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300 text-white",
                sidebar?.isOpen === false
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
              {QueryGeneralSettingsData?.com_site_white_logo ? (
                <div className="relative w-full h-14">
                  <Image
                    loader={GlobalImageLoader}
                    src={QueryGeneralSettingsData?.com_site_white_logo}
                    alt="quick_ecommerce"
                    fill
                    sizes="200px"
                    className="w-full h-full object-contain object-left"
                    priority
                  />
                </div>
              ) : (
                <div className="relative w-12 h-12 rounded">
                  <Image
                    src="/images/no-image.png"
                    alt="quick_ecommerce"
                    fill
                    sizes="48px"
                    className="w-full h-full rounded"
                    priority
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center my-4 lg:my-0"></div>
          <div
            className={
              sidebar?.isOpen === false
                ? "-translate-x-96 opacity-0 hidden"
                : "translate-x-0 opacity-100 relative mt-4"
            }
          >
            <Search
              className={`absolute w-5 h-5 mt-2.5 text-white ${
                dir == "rtl" ? "left-4" : " right-4"
              }  `}
            />
            <Input
              type="text"
              placeholder="Search...."
              onChange={(e) => setSearch(e.target.value || "")}
              className="text-white focus-visible:ring-transparent ring-offset-0 sidebar-search bg-transparent dark:bg-[#072441]"
            />
          </div>
        </div>
        {isPending || isFetching ? (
          <div>
            <div className="p-4 w-full">
              <div className="space-y-4">
                <div className="h-10 bg-gray-500 rounded-md animate-pulse"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-500 rounded w-3/4 animate-pulse"></div>
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-gray-500">
                  <div className="h-4 bg-gray-500 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Menu
            isOpen={sidebar.isOpen}
            getPermissions={getPermissions}
            menuItems={menuItems}
            search={search}
            setIsLoading={setIsLoading}
          />
        )}
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
