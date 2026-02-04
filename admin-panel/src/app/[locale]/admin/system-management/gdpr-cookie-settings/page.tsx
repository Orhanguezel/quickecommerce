import CustomLayout from "@/components/layout/CustomLayout";
import GDPRCookieSettings from "@/components/screen/admin-section/system-management/gdpr-cookie-settings";

const GDPRCookieSettingsRoot = () => {
  return (
    <CustomLayout>
      <GDPRCookieSettings />
    </CustomLayout>
  );
};

export default GDPRCookieSettingsRoot;