"use client";
import { useMeQuery } from "@/modules/users/users.action";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Provider } from "react-redux";
import { toast } from "react-toastify";
import Loader from "@/components/molecules/Loader";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import MaintenancePage from "@/components/molecules/MaintenancePage";
import { SellerRoutes } from "@/config/sellerRoutes";
import { setAuthCredentials } from "@/lib/auth-utils";
import { authorizationAtom } from "@/lib/authorization-atom";
import { useToken } from "@/lib/use-token";
import { store } from "@/redux/store";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";

interface SiteInfo {
  com_site_title: string;
  com_site_subtitle: string;
  com_site_favicon: string;
  com_maintenance_mode: string;
  com_site_logo: string;
}
interface MaintenanceInfo {
  com_maintenance_title: string;
  com_maintenance_description: string;
  com_maintenance_start_date: string;
  com_maintenance_end_date: string;
  com_maintenance_image: string;
}

async function fetchSiteInfo(): Promise<SiteInfo> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/v1/site-general-info`,
    {
      cache: "no-store",
    }
  );
  const data = await res.json();
  return data.site_settings as SiteInfo;
}

async function fetchMaintenanceInfo(): Promise<MaintenanceInfo> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/v1/maintenance-page-settings`,
    {
      cache: "no-store",
    }
  );
  const data = await res.json();
  return data.maintenance_settings as MaintenanceInfo;
}

const Sidebar = dynamic(
  () => import("@/components/blocks/shared/sidebar").then((m) => m.Sidebar),
  { ssr: false, loading: () => <div className="w-72 h-screen bg-white" /> }
);

const Navbar = dynamic(
  () => import("@/components/blocks/shared/navbar").then((m) => m.Navbar),
  { ssr: false, loading: () => <div className="h-[200px] bg-white" /> }
);

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { me, isPending, error, isAuthorized, refetch } = useMeQuery();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const MeData = useMemo(() => me?.data || {}, [me?.data]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [maintenanceData, setMaintenanceData] =
    useState<MaintenanceInfo | null>(null);
  const [siteLogo, setSiteLogo] = useState<string>("");

  const searchParams = useSearchParams();
  const { setToken } = useToken();
  const [_, setAuthorized] = useAtom(authorizationAtom);

  useEffect(() => {
    const token = searchParams.get("token");
    const permissions = searchParams.get("permissions");
    const message = searchParams.get("message");
    const toastKey = "toast_shown";
    if (token && !localStorage.getItem(toastKey)) {
      localStorage.setItem(toastKey, "true");
      toast.success(message || "User Login Successfully");
      setToken(token);
      setAuthorized(true);
      const parsedPermissions = permissions
        ? JSON.parse(decodeURIComponent(permissions))
        : [];
      setAuthCredentials(token, parsedPermissions);
      refetch().then(({ data }) => {
        if (data?.full_name && data?.image_url) {
          localStorage.setItem("user_name", data.full_name);
          localStorage.setItem("user_image", data.image_url);
        }
        localStorage.setItem(
          "selectedStore",
          JSON.stringify({ id: "", slug: "" })
        );
        router.replace("/seller/dashboard", { scroll: false });
      });
    }
  }, [searchParams, setToken, setAuthorized, refetch, router]);

  useEffect(() => {
    if (!isPending && !isAuthorized) {
      router.push(SellerRoutes.signin);
      return;
    }
    if (
      !isPending &&
      isAuthorized &&
      me?.data?.activity_scope !== "store_level"
    ) {
      router.push(SellerRoutes.signin);
      return;
    }

    if (MeData?.full_name && MeData?.image_url) {
      localStorage.setItem("user_name", MeData?.full_name);
      localStorage.setItem("user_image", MeData?.image_url);
    }

    if (error) {
      toast.error(error as any);
    }
  }, [
    isAuthorized,
    me?.data,
    error,
    router,
    isPending,
    MeData?.full_name,
    MeData?.image_url,
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isPending && !isAuthorized) {
        router.push(SellerRoutes.signin);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isPending, isAuthorized, router]);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const siteInfo = await fetchSiteInfo();
        setSiteLogo(siteInfo.com_site_logo);
        if (siteInfo.com_maintenance_mode === "on") {
          const maintenance = await fetchMaintenanceInfo();
          const now = new Date();
          const maintenanceEnd = new Date(maintenance.com_maintenance_end_date);
          maintenanceEnd.setHours(23, 59, 59, 999);
          if (maintenanceEnd > now) {
            setMaintenanceData(maintenance);
            setShowMaintenance(true);
          }
        }
      } catch (err) {
        return error;
      }
    };
    checkMaintenance();
  }, [error]);

  // if (isPending) {
  //   return <Loader customClass="mt-64" size="large" />;
  // }
  if (showMaintenance && maintenanceData) {
    let EndDate = new Date(maintenanceData.com_maintenance_end_date).setHours(
      23,
      59,
      59,
      999
    );
    return (
      <MaintenancePage
        logo={siteLogo}
        title={maintenanceData.com_maintenance_title}
        description={maintenanceData.com_maintenance_description}
        endDate={EndDate}
        image={maintenanceData.com_maintenance_image}
      />
    );
  }

  return (
    <div dir={dir}>
      <LoaderOverlay isLoading={isLoading} />
      <Sidebar setIsLoading={setIsLoading} />
      <Navbar setIsLoading={setIsLoading} MeData={MeData} />
      <div className="flex-1 flex flex-col justify-between w-full mx-auto">
        {children}
      </div>
    </div>
  );
}
