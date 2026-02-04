import { AppModal } from "@/components/blocks/common/AppModal";
import { Input } from "@/components/ui";
import { useChangePassword } from "@/modules/users-section/profile-settings/profile-settings.action";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
interface ShowReplyModalProps {
  trigger: any;
}

const ChangePassword: React.FC<ShowReplyModalProps> = ({ trigger }) => {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password2, setPassword2] = useState("");
  const [showPassword2, setShowPassword2] = useState(false);
  const { mutate: updateStoreStatus } = useChangePassword();

  const handleSave = () => {
    if (!password.trim() || !password2.trim()) {
      return toast.error("Both password fields are required.");
    }

    setLoading(true);
    const submissionData = {
      old_password: password,
      new_password: password2,
    };

    updateStoreStatus(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          setLoading(false);
          setIsModalOpen(false);
          setPassword("");
          setPassword2("");
        },
        onError: (error: any) => {
          toast.error(
                  error instanceof Error
                    ? `Error refetching data: ${error.message}`
                    : "An unknown error occurred while refetching data"
                );
          setLoading(false);
        },
      }
    );
  };

  return (
    <AppModal
      trigger={<span onClick={() => setIsModalOpen(true)}>{trigger}</span>}
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[200px] md:top-[200px] top-[100px]"
      cancelButtonLabel="Close"
      disable={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading}
      onSave={handleSave}
      actionButtonLabel="Change Password"
    >
      <p className="pt-2 text-gray-500 dark:text-white">{t("label.change_password")}</p>

      <div className="mt-10">
        <p className="px-3 text-sm ">{t("label.old_password")}</p>
        <div className="relative flex flex-col items-start justify-start p-2 w-full">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t("place_holder.enter_old_password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="app-input"
          />
          {showPassword ? (
            <div className="absolute right-4 top-4 cursor-pointer">
              <Eye
                className="text-gray-500 dark:text-white w-5"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          ) : (
            <div className="absolute right-4 top-4 cursor-pointer">
              <EyeOff
                className="text-gray-500 dark:text-white w-5"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          )}
        </div>
        <p className="px-3 text-sm ">{t("label.new_password")}</p>
        <div className="relative flex flex-col items-start justify-start p-2 w-full">
          <Input
            type={showPassword2 ? "text" : "password"}
            placeholder={t("place_holder.enter_new_password")}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="app-input"
          />
          {showPassword2 ? (
            <div className="absolute right-4 top-4 cursor-pointer">
              <Eye
                className="text-gray-500 dark:text-white w-5"
                onClick={() => setShowPassword2(!showPassword2)}
              />
            </div>
          ) : (
            <div className="absolute right-4 top-4 cursor-pointer">
              <EyeOff
                className="text-gray-500 dark:text-white w-5"
                onClick={() => setShowPassword2(!showPassword2)}
              />
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default ChangePassword;
