"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Loader from "@/components/molecules/Loader";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import { Routes } from "@/config/routes";
import { extractPermNames } from "@/lib/permissions";
import {
  useGetPermissionsQuery,
  useMeQuery,
} from "@/modules/users/users.action";
import { PublicNavbarSkeleton } from "@/components/molecules/PublicNavbarSkeleton";
import { useStore } from "@/hooks/use-store";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { cn } from "@/lib/utils";

const Sidebar = dynamic(
  () => import("@/components/blocks/shared/sidebar").then((m) => m.Sidebar),
  { ssr: false, loading: () => <div className="w-72 h-screen bg-white" /> }
);

const Navbar = dynamic(
  () => import("@/components/blocks/shared/navbar").then((m) => m.Navbar),
  { ssr: false, loading: () => <div className="h-[200px] bg-white" /> }
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const sidebar = useStore(useSidebarToggle, (state) => state);

  const [isLoading, setIsLoading] = useState(false);

  const { me, isPending, error, isAuthorized } = useMeQuery({
    staleTime: 1000 * 60 * 10,
  });

  const MeData = useMemo(() => me?.data || {}, [me?.data]);

  const { getPermissions } = useGetPermissionsQuery(
    {
      store_slug: "",
      language: locale,
    },
    {
      enabled: isAuthorized,
      staleTime: 1000 * 60 * 10,
    }
  );

  const allowedPaths = useMemo(
    () =>
      getPermissions?.permissions
        ? extractPermNames(getPermissions.permissions)
        : [],
    [getPermissions?.permissions]
  );

  const isAllowed = useMemo(
    () => allowedPaths.includes(pathname),
    [pathname, allowedPaths]
  );

  useEffect(() => {
    if (!isPending) {
      if (!isAuthorized) {
        router.replace(Routes.signin);
      } else if (me?.data?.activity_scope !== "system_level") {
        router.replace(Routes.signin);
      }
    }
  }, [isAuthorized, isPending, me?.data?.activity_scope, router]);

  useEffect(() => {
    if (MeData?.full_name && MeData?.image_url) {
      try {
        localStorage.setItem("admin_user_name", MeData.full_name);
        localStorage.setItem("admin_user_image", MeData.image_url);
      } catch {}
    }
  }, [MeData?.full_name, MeData?.image_url]);

  useEffect(() => {
    if (error) toast.error(error as any);
  }, [error]);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  if (!sidebar) return null;



  return (
    <div dir={dir}>
      <LoaderOverlay isLoading={isLoading} />
      <Sidebar setIsLoading={setIsLoading} />
      <Navbar setIsLoading={setIsLoading} MeData={MeData} />
      <div className="flex-1 flex flex-col justify-between w-full mx-auto ">
        {children}
      </div>
    </div>
  );
}
