"use client";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Button, Card, Switch } from "@/components/ui";
import {
  useOtpLoginStatusList,
  useOtpLoginStatusUpdate,
  useSmsProviderSettingsList,
  useSmsProviderStatusUpdate,
} from "@/modules/admin-section/sms-provider-settings/sms-provider-settings.action";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import StatusUpdateModal from "./modal/StatusUpdateModal";
import Link from "next/link";

const SMSProviderSettingsForm = () => {
  const t = useTranslations();
  const locale = useLocale();
  const { SmsProviderSettingsList, refetch: smsProviderRefetch } =
    useSmsProviderSettingsList({
      language: locale,
    });
  const SmsProviderSettingsListData = useMemo(() => {
    const data = (SmsProviderSettingsList as any)?.data || [];
    return data;
  }, [SmsProviderSettingsList]);

  const { OtpLoginStatusList, refetch, isPending, error } =
    useOtpLoginStatusList({
      language: locale,
    });
  const OtpLoginStatusListData = useMemo(() => {
    const data = (OtpLoginStatusList as any) || {};
    return data;
  }, [OtpLoginStatusList]);

  const [loading, setLoading] = useState(false);
  const { mutate: brandStatus } = useOtpLoginStatusUpdate();
  const handleToggleStatus = () => {
    setLoading(true);
    let updateStatus =
      OtpLoginStatusListData?.otp_login_enabled_disable == "on" ? "off" : "on";
    brandStatus(
      { otp_login_enabled_disable: updateStatus },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };
  const { mutate: SmsProviderStatus } = useSmsProviderStatusUpdate();
  const handleToggleStatus2 = (name: any, status: any) => {
    setLoading(true);
    let updateStatus = status ? 0 : 1;
    SmsProviderStatus(
      { name, status: updateStatus },
      {
        onSuccess: () => {
          smsProviderRefetch();
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };
  return (
    <Card className="p-2 md:p-6 mt-6">
      <div className="border-b pb-8 border-slate-300 ">
        <p className="text-lg font-semibold text-gray-700 dark:text-white">
          {t("label.manage_sms_gateway")}
        </p>
        <div className="mt-4">
          <ConfirmationModal
            trigger={
              <div
                dir="ltr"
                className="flex items-center gap-2 cursor-pointer "
              >
                <Switch
                  checked={
                    OtpLoginStatusListData?.otp_login_enabled_disable == "on"
                  }
                />
                <p className="text-sm font-semibold text-gray-500 dark:text-white">
                  {`${
                    OtpLoginStatusListData?.otp_login_enabled_disable == "on"
                      ? t("label.disable")
                      : t("label.enable")
                  } OTP`}
                </p>
              </div>
            }
            loading={loading}
            onSave={() => handleToggleStatus()}
            title={t("title.are_you_sure")}
            subTitle={t("sub_title.you_will_able_revert_your_decision_anytime")}
          />
        </div>
      </div>
      <div>
        <div className="mt-6 flex items-center gap-6 justify-start w-full">
          {Array.isArray(SmsProviderSettingsListData) &&
          SmsProviderSettingsListData.length > 0
            ? SmsProviderSettingsListData?.map((singleGateWay, index) => {
                return (
                  <Card className="p-2 md:p-6 mt-6 dark:bg-gray-700" key={index}>
                    <div className="w-full text-center mb-4">
                      <h1 className="text-2xl font-bold uppercase">
                        {singleGateWay?.name}
                      </h1>
                    </div>
                    <div className="flex items-center justify-center gap-1 w-full">
                      <p>{t("label.you_can_learn_more_about_it_from_here")}</p>
                      <Link
                        href={`${
                          singleGateWay?.slug === "twilio"
                            ? "https://www.twilio.com/en-us"
                            : "https://ui.idp.vonage.com/ui/auth/login"
                        }`}
                        target="_blank"
                      >
                        <p className="hover:text-blue-500">Link</p>
                      </Link>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4 w-full">
                      <ConfirmationModal
                        trigger={
                          <Button
                            className={`${
                              singleGateWay?.status
                                ? "rounded-full bg-blue-500 text-white hover:bg-blue-400 "
                                : "rounded-full bg-gray-500 text-white hover:bg-gray-400 "
                            }`}
                          >
                            {singleGateWay?.status
                              ? t("label.activated")
                              : t("label.deactivated")}
                          </Button>
                        }
                        loading={loading}
                        onSave={() =>
                          handleToggleStatus2(
                            singleGateWay?.slug,
                            singleGateWay?.status
                          )
                        }
                        title={t("title.update_status")}
                        subTitle={t("sub_title.update_status")}
                      />
                      <div className="flex items-center gap-2">
                        <StatusUpdateModal
                          trigger={
                            <Button className="rounded-full bg-red-500 text-white hover:bg-red-400 ">
                              {t("button.settings")}
                            </Button>
                          }
                          refetch={smsProviderRefetch}
                          row={singleGateWay}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })
            : ""}
        </div>
      </div>
    </Card>
  );
};

export default SMSProviderSettingsForm;
