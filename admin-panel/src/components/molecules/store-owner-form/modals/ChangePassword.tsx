import { AppModal } from "@/components/blocks/common/AppModal";
import { Button, Input } from "@/components/ui";
import {
  useForgotPassword,
  useOTP,
  useResetPassword,
} from "@/modules/users/users.action";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Loader from "../../Loader";

interface ShowReplyModalProps {
  trigger: any;
}

const ChangePassword: React.FC<ShowReplyModalProps> = ({ trigger }) => {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendOTP, setSendOTP] = useState(true);
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password2, setPassword2] = useState("");
  const [showPassword2, setShowPassword2] = useState(false);
  const { mutate: forgotPassword } = useForgotPassword();
  const { mutate: VerifyEmail } = useOTP();
  const { mutate: ResetPassword } = useResetPassword();

  const OnSendOTP = () => {
    setLoading(true);
    const submissionData = {
      email: email,
    };

    forgotPassword(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          setLoading(false);
          setSendOTP(false);
          setVerifyEmail(true);
        },
        onError: (error: any) => {
          setLoading(false);
        },
      }
    );
  };
  const OnVerifyEmail = () => {
    setLoading(true);
    const submissionData = {
      email: email,
      token: otp,
    };

    VerifyEmail(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          setLoading(false);
          setSendOTP(false);
          setVerifyEmail(false);
          setChangePassword(true);
        },
        onError: (error: any) => {
          setLoading(false);
        },
      }
    );
  };
  const handleResetPassword = () => {
    if (!password.trim() || !password2.trim()) {
      return toast.error(t("toast.both_password_fields_are_required"));
    }
    if (password !== password2) {
      return toast.error(t("toast.passwords_do_not_match"));
    }

    setLoading(true);
    const submissionData = {
      email: email,
      token: otp,
      password: password,
      password_confirmation: password2,
    };

    ResetPassword(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          setLoading(false);
          setIsModalOpen(false);
          setEmail("");
          setOtp("");
          setPassword("");
          setPassword2("");
          setSendOTP(true);
          setVerifyEmail(false);
          setChangePassword(false);
        },
        onError: (error: any) => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <AppModal
      trigger={<span onClick={() => setIsModalOpen(true)}>{trigger}</span>}
      customClass="lg:inset-x-30p md:inset-x-30p lg:top-[100px] md:top-[100px] top-[50px]"
      cancelButtonLabel=""
      disable={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading}
    >
      <p className="pt-2 text-gray-500 dark:text-white">
        {t("label.change_password")}
      </p>
      <div className="mt-10">
        <p className="px-3 text-sm ">{t("label.email")}</p>
        <div className="mb-2 relative flex flex-col items-start justify-start p-2 w-full">
          <Input
            type="text"
            placeholder={t("place_holder.enter_email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="app-input"
          />
        </div>
        {verifyEmail && (
          <div>
            <p className="px-3 text-sm ">{t("label.otp")}</p>
            <div className="mb-2 relative flex flex-col items-start justify-start p-2 w-full">
              <Input
                type="text"
                placeholder={t("place_holder.enter_otp")}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="app-input"
              />
            </div>
          </div>
        )}
        {changePassword && (
          <div>
            <p className="px-3 text-sm ">{t("label.password")}</p>
            <div className="mb-2 relative flex flex-col items-start justify-start p-2 w-full">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("place_holder.enter_password")}
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
            <p className="px-3 text-sm ">{t("label.confirm_password")}</p>
            <div className="mb-2 relative flex flex-col items-start justify-start p-2 w-full">
              <Input
                type={showPassword2 ? "text" : "password"}
                placeholder={t("place_holder.enter_confirm_password")}
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
        )}
      </div>
      <div className="mt-10 flex items-center gap-2 justify-end">
        {sendOTP && (
          <Button
            disabled={email == ""}
            className="app-button"
            onClick={OnSendOTP}
          >
            {loading ? (
              <Loader size="small" color="text-white" />
            ) : (
              <span>{t("button.send_otp")}</span>
            )}
          </Button>
        )}
        {verifyEmail && (
          <Button
            disabled={email == "" || otp == ""}
            className="app-button"
            onClick={OnVerifyEmail}
          >
            {loading ? (
              <Loader size="small" color="text-white" />
            ) : (
              <span>{t("button.verify_email")}</span>
            )}
          </Button>
        )}
        {changePassword && (
          <Button
            className="bg-blue-500 text-white px-8 hover:bg-blue-700"
            onClick={handleResetPassword}
          >
            {loading ? (
              <Loader size="small" color="text-white" />
            ) : (
              <span>{t("button.change_password")}</span>
            )}
          </Button>
        )}
      </div>
    </AppModal>
  );
};

export default ChangePassword;
