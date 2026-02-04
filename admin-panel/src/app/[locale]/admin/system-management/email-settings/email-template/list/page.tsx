import CustomLayout from "@/components/layout/CustomLayout";
import EmailTemplateList from "@/components/screen/admin-section/email-settings/email-template";

const EmailTemplateRoot = () => {
  return (
    <CustomLayout>
      <EmailTemplateList />
    </CustomLayout>
  );
};

export default EmailTemplateRoot;