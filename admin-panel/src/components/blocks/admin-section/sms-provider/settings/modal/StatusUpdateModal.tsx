import { AppSelect } from "@/components/blocks/common";
import { AppModal } from "@/components/blocks/common/AppModal";
import { Input } from "@/components/ui";
import { useSmsProviderSettingsUpdate } from "@/modules/admin-section/sms-provider-settings/sms-provider-settings.action";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}

const StatusList = [
  { label: "1 Minute", value: "1" },
  { label: "2 Minutes", value: "2" },
  { label: "3 Minutes", value: "3" },
  { label: "4 Minutes", value: "4" },
  { label: "5 Minutes", value: "5" },
];

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
}) => {
  const t = useTranslations();
  const parsedCredentials =
    typeof row?.credentials === "string"
      ? JSON.parse(row.credentials)
      : row?.credentials || {};
  const { mutate: updateStoreStatus } = useSmsProviderSettingsUpdate();

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectStatus, setSelectStatus] = useState<string>(
    String(row?.expire_time)
  );

  const [twilioCredentials, setTwilioCredentials] = useState({
    twilio_sid: parsedCredentials?.twilio_sid ?? "",
    twilio_auth_key: parsedCredentials?.twilio_auth_key ?? "",
    twilio_number: parsedCredentials?.twilio_number ?? "",
  });

  const [nexmoCredentials, setNexmoCredentials] = useState({
    nexmo_api_key: parsedCredentials?.nexmo_api_key ?? "",
    nexmo_api_secret: parsedCredentials?.nexmo_api_secret ?? "",
  });

  const handleStatus = (value: string) => {
    setSelectStatus(value === "none" ? "" : String(value));
  };

  const handleSave = () => {
    setLoading(true);

    const credentials =
      row.slug === "twilio"
        ? {
            twilio_sid: twilioCredentials.twilio_sid,
            twilio_auth_key: twilioCredentials.twilio_auth_key,
            twilio_number: twilioCredentials.twilio_number,
          }
        : {
            nexmo_api_key: nexmoCredentials.nexmo_api_key,
            nexmo_api_secret: nexmoCredentials.nexmo_api_secret,
          };

    const submissionData = {
      name: row.slug,
      expire_time: selectStatus,
      credentials,
    };
    updateStoreStatus(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
          setIsModalOpen(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel={t("button.update")}
      IsLoading={loading}
      onSave={handleSave}
      customClass="inset-x-30p top-[150px] md:top-[200px] lg:top-[200px]"
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      smallModal
    >
      <div className="text-start">
        <h1 className="text-2xl font-bold uppercase text-blue-500 my-4">
          {row?.name}
        </h1>
        {row?.slug === "twilio" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              {t("label.twilio_sid")}
            </label>
            <Input
              type="text"
              value={twilioCredentials.twilio_sid}
              onChange={(e) =>
                setTwilioCredentials((prev) => ({
                  ...prev,
                  twilio_sid: e.target.value,
                }))
              }
              className="app-input mb-4"
              placeholder="Enter Twilio SID"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              {t("label.twilio_auth_key")}
            </label>
            <Input
              type="text"
              value={twilioCredentials.twilio_auth_key}
              onChange={(e) =>
                setTwilioCredentials((prev) => ({
                  ...prev,
                  twilio_auth_key: e.target.value,
                }))
              }
              className="app-input mb-4"
              placeholder="Enter Twilio Auth Number"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              {t("label.twilio_auth_number")}
            </label>
            <Input
              type="text"
              value={twilioCredentials.twilio_number}
              onChange={(e) =>
                setTwilioCredentials((prev) => ({
                  ...prev,
                  twilio_number: e.target.value,
                }))
              }
              className="app-input mb-4"
              placeholder="Enter Twilio Auth token"
            />
          </div>
        )}
        {row?.slug === "nexmo" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              {t("label.api_key")}
            </label>
            <Input
              type="text"
              value={nexmoCredentials.nexmo_api_key}
              onChange={(e) =>
                setNexmoCredentials((prev) => ({
                  ...prev,
                  nexmo_api_key: e.target.value,
                }))
              }
              className="app-input mb-4"
              placeholder="Enter Nexmo Key"
            />

            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              {t("label.api_secret")}
            </label>
            <Input
              type="text"
              value={nexmoCredentials.nexmo_api_secret}
              onChange={(e) =>
                setNexmoCredentials((prev) => ({
                  ...prev,
                  nexmo_api_secret: e.target.value,
                }))
              }
              className="app-input mb-4"
              placeholder="Enter Nexmo Secret"
            />
          </div>
        )}
        <div
          className={`transition-all duration-200 ${
            isSelectOpen ? "min-h-[320px]" : "min-h-[100px]"
          }`}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-white my-1">
            {t("label.otp_expire_time")}
          </label>
          <AppSelect
            placeholder={t("label.otp_expire_time")}
            value={String(selectStatus)}
            onSelect={handleStatus}
            groups={StatusList}
            hideNone
            onOpenChange={setIsSelectOpen}
          />
        </div>
      </div>
    </AppModal>
  );
};

export default StatusUpdateModal;
