import { Input } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import GlobalImageLoader from "@/lib/imageLoader";
import { useGeneralQuery } from "@/modules/common/com/com.action";
import { useAppDispatch } from "@/redux/hooks";
import { setDynamicValue, setRefetch } from "@/redux/slices/refetchSlice";
import { setSelectedStore } from "@/redux/slices/storeSlice";
import { MenuIcon, Search } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Menu } from "./menu";

export function SheetMenu({ getPermissions }: any) {
  const pathname = usePathname();
  const localeMain = useLocale();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const dispatch = useAppDispatch();
  const router = useRouter();
  const dashboardLink =
    getPermissions?.activity_scope == "store_level"
      ? "/seller/dashboard"
      : "/admin/dashboard";

  const MenuItems = getPermissions?.permissions;
  const menuItems: any = MenuItems;

  const [search, setSearch] = useState("");
  const { general, refetch: generalRefetch } = useGeneralQuery({
    language: localeMain,
  });

  const QueryGeneralSettingsData = useMemo(
    () => (general as any)?.site_settings || {},
    [general]
  );

  const handleLogo = () => {
    localStorage.setItem("selectedStore", JSON.stringify({ id: "", slug: "" }));
    dispatch(setSelectedStore({ id: "", type: "", slug: "" }));
    router.push(`${dashboardLink}`);
    if (getPermissions?.activity_scope == "store_level") {
      dispatch(setRefetch(true));
      dispatch(setDynamicValue("store_dashboard"));
    }
  };
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="sm:w-72 px-3 h-full flex flex-col bg-custom-dark-blue text-white"
        side="left"
      >
        <SheetHeader onClick={handleLogo}>
          {QueryGeneralSettingsData?.com_site_white_logo ? (
            <div className="relative w-24 h-12">
              <Image
                loader={GlobalImageLoader}
                src={QueryGeneralSettingsData?.com_site_white_logo}
                alt="quick_ecommerce"
                layout="fill"
                className="w-full h-full "
              />
            </div>
          ) : (
            <div className="relative w-24 h-12">
              <Image
                src="/images/no-image.png"
                alt="quick_ecommerce"
                layout="fill"
                className="w-full h-full"
              />
            </div>
          )}
          <div className="translate-x-0 opacity-100 relative mt-4">
            <Search
              className={`absolute w-5 h-5 mt-2.5 text-white ${
                dir == "rtl" ? "left-4" : " right-4"
              }  `}
            />
            <Input
              type="text"
              placeholder="Search...."
              onChange={(e) => setSearch(e.target.value || "")}
              className="text-white focus-visible:ring-transparent ring-offset-0 sidebar-search bg-slate-400"
            />
          </div>
        </SheetHeader>
        <Menu
          isOpen
          getPermissions={getPermissions}
          menuItems={menuItems}
          search={search}
        />
      </SheetContent>
    </Sheet>
  );
}
