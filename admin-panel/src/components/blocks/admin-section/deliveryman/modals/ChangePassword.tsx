import { AppModal } from "@/components/blocks/common/AppModal";
import { Input } from "@/components/ui";
import { useChangePassword } from "@/modules/admin-section/deliveryman/deliveryman.action";
import { Eye, EyeOff } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface ShowReplyModalProps {
  trigger: any;
  row: any;
  refetch: () => void;
}

const ChangePassword: React.FC<ShowReplyModalProps> = ({
  refetch,
  trigger,
  row,
}) => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState(row?.reply || "");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: updateStoreStatus } = useChangePassword();

  const handleSave = () => {
    if (!password.trim()) {
      alert("Password cannot be empty");
      return;
    }

    setLoading(true);
    const submissionData = {
      deliveryman_id: row?.user_id,
      password,
    };

    updateStoreStatus(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
          setIsModalOpen(false);
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
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[200px] md:top-[200px] top-[100px]"
      cancelButtonLabel="Close"
      disable={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading}
      onSave={handleSave}
      actionButtonLabel="Change Password"
    >
      <p className="pt-2 text-gray-500 dark:text-white">Change Password</p>
      <div className="relative flex flex-col items-start justify-start p-2 w-full mt-10">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="app-input"
        />
        {showPassword ? (
          <div className="absolute right-4 top-4 cursor-pointer">
            <Eye className="text-gray-500 dark:text-white w-5" onClick={() => setShowPassword(!showPassword)} />
          </div>
        ) : (
          <div className="absolute right-4 top-4 cursor-pointer">
            <EyeOff className="text-gray-500 dark:text-white w-5" onClick={() => setShowPassword(!showPassword)} />
          </div>
        )}
      </div>
    </AppModal>
  );
};

export default ChangePassword;
