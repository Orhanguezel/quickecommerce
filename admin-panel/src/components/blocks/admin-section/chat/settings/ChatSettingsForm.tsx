"use client";
import Loader from "@/components/molecules/Loader";
import multiLang from "@/components/molecules/multiLang.json";
import { SubmitButton } from "@/components/blocks/shared";
import { Card, CardContent, Input } from "@/components/ui";

import {
  useChatSettingsQuery,
  useChatSettingsStoreMutation,
} from "@/modules/admin-section/chat/chat.action";
import {
  ChatSettingsFormData,
  ChatSettingsSchema,
} from "@/modules/admin-section/chat/chat.schema";
import { useGeneralQuery } from "@/modules/common/com/com.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const ChatSettingsForm = ({ data }: any) => {
  const t = useTranslations();
  const localeMain = useLocale();
  const multiLangData = useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const { register, setValue, handleSubmit } = useForm<ChatSettingsFormData>({
    resolver: zodResolver(ChatSettingsSchema),
  });
  const { general, refetch: generalRefetch } = useGeneralQuery({
    language: localeMain,
  });
  const {
    ChatSettingsData,
    refetch,
    isFetching,
    isPending: isQuerying,
    error,
  } = useChatSettingsQuery({});

  const QueryGeneralSettingsData = useMemo(
    () => (ChatSettingsData as any) || [],
    [ChatSettingsData]
  );

  useEffect(() => {
    if (ChatSettingsData) {
      setValue(
        "com_pusher_app_id",
        QueryGeneralSettingsData?.com_pusher_app_id ?? ""
      );
      setValue(
        "com_pusher_app_key",
        QueryGeneralSettingsData?.com_pusher_app_key ?? ""
      );
      setValue(
        "com_pusher_app_secret",
        QueryGeneralSettingsData?.com_pusher_app_secret ?? ""
      );
      setValue(
        "com_pusher_app_cluster",
        QueryGeneralSettingsData?.com_pusher_app_cluster ?? ""
      );
    }
  }, [ChatSettingsData, QueryGeneralSettingsData, setValue]);

  const { mutate: GeneralSettingsStore, isPending } =
    useChatSettingsStoreMutation();
  const onSubmit = async (values: ChatSettingsFormData) => {
    const defaultData = {
      com_pusher_app_id: values.com_pusher_app_id,
      com_pusher_app_key: values.com_pusher_app_key,
      com_pusher_app_secret: values.com_pusher_app_secret,
      com_pusher_app_cluster: values.com_pusher_app_cluster,
    };

    const submissionData = {
      ...defaultData,
      id: QueryGeneralSettingsData?.id ? QueryGeneralSettingsData?.id : 0,
    };
    return GeneralSettingsStore(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
          generalRefetch();
        },
      }
    );
  };

  useEffect(() => {
    if (!isQuerying && !error) refetch();
  }, [isQuerying, refetch, error]);

  return (
    <div>
      {isQuerying ? (
        <CardSkletonLoader />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mt-4">
            <CardContent className="p-2 md:p-4 lg:p-4">
              <div dir={dir} className="grid grid-cols-1 ">
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">
                      {t("common.pusher_app_id")}
                    </p>
                    <Input
                      id="com_pusher_app_id"
                      {...register(
                        "com_pusher_app_id" as keyof ChatSettingsFormData
                      )}
                      className="app-input"
                      placeholder="Enter value"
                    />
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">
                      {t("common.pusher_app_key")}
                    </p>
                    <Input
                      id="com_pusher_app_key"
                      {...register(
                        "com_pusher_app_key" as keyof ChatSettingsFormData
                      )}
                      className="app-input"
                      placeholder="Enter value"
                    />
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">
                      {t("common.pusher_app_secret")}
                    </p>
                    <Input
                      id="com_pusher_app_secret"
                      {...register(
                        "com_pusher_app_secret" as keyof ChatSettingsFormData
                      )}
                      className="app-input"
                      placeholder="Enter value"
                    />
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">
                      {t("common.pusher_app_cluster")}
                    </p>
                    <Input
                      id="com_pusher_app_cluster"
                      {...register(
                        "com_pusher_app_cluster" as keyof ChatSettingsFormData
                      )}
                      className="app-input"
                      placeholder="Enter value"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton
              IsLoading={isPending}
              AddLabel={t("button.save_changes")}
            />
          </Card>
        </form>
      )}
    </div>
  );
};

export default ChatSettingsForm;
