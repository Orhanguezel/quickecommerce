"use client";

import { useLocale } from "next-intl";
import { ReactNode, useEffect, useState } from "react";
import { Provider } from "react-redux";

import MaintenancePage from "@/components/molecules/MaintenancePage";
import { store } from "@/redux/store";

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

export default function SellerLayout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [showMaintenance, setShowMaintenance] = useState(false);
  const [maintenanceData, setMaintenanceData] =
    useState<MaintenanceInfo | null>(null);
  const [siteLogo, setSiteLogo] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const siteRes = await fetch(
          `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/v1/site-general-info`,
          {
            cache: "no-store",
          }
        );
        const siteData = await siteRes.json();
        const siteSettings: SiteInfo = siteData.site_settings;
        setSiteLogo(siteSettings.com_site_logo);

        if (siteSettings.com_maintenance_mode === "on") {
          const maintenanceRes = await fetch(
            `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}v1/maintenance-page-settings`,
            { cache: "no-store" }
          );
          const maintenanceData = await maintenanceRes.json();
          const maintenanceSettings: MaintenanceInfo =
            maintenanceData.maintenance_settings;
          const now = new Date();
          const maintenanceEnd = new Date(
            maintenanceSettings.com_maintenance_end_date
          );
          maintenanceEnd.setHours(23, 59, 59, 999);
          if (maintenanceEnd > now) {
            setMaintenanceData(maintenanceSettings);
            setShowMaintenance(true);
          }
        }
      } catch (error) {
        throw error;
      }
    };

    fetchData();
  }, []);

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
      <Provider store={store}>
        <main className="flex-1 flex flex-col justify-between w-full min-h-screen mx-auto">
          {children}
        </main>
      </Provider>
    </div>
  );
}
