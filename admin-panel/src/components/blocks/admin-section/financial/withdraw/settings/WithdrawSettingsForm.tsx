"use client";
import Loader from "@/components/molecules/Loader";
import { SubmitButton } from "@/components/blocks/shared";
import {
  Card,
  CardContent,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import {
  useWithdrawSettingsQuery,
  useWithdrawSettingsStoreMutation,
} from "@/modules/admin-section/financial/withdraw/settings/settings.action";
import {
  WithdrawSettingsFormData,
  withdrawSettingsSchema,
} from "@/modules/admin-section/financial/withdraw/settings/settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const WithdrawSettingsForm = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = useTranslations();
  const {
    watch,
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawSettingsFormData>({
    resolver: zodResolver(withdrawSettingsSchema),
  });
  const { WithdrawSettingsData, refetch, isFetching, isPending, error } =
    useWithdrawSettingsQuery({});
  const WalletSettings = useMemo(
    () => (WithdrawSettingsData as any)?.message || {},
    [WithdrawSettingsData]
  );
  const { mutate: WalletSettingsStore, isPending: isUpdating } =
    useWithdrawSettingsStoreMutation();
  const onSubmit = async (values: WithdrawSettingsFormData) => {
    const defaultData = {
      maximum_withdrawal_limit: values.maximum_withdrawal_limit,
      minimum_withdrawal_limit: values.minimum_withdrawal_limit,
    };
    const submissionData = {
      ...defaultData,
      id: WalletSettings?.id ? WalletSettings?.id : 0,
    };
    return WalletSettingsStore(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };
  useEffect(() => {
    if (!isPending && !error) {
      refetch();
    }
  }, [isPending, refetch, error]);

  return (
    <div>
      {isPending ? (
        <CardSkletonLoader />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mt-4">
            <CardContent className="bg-gray-100 dark:bg-[#1e293b] p-2 md:p-6 border-l-8 border-blue-600">
              <div dir={dir}>
                <strong className="text-blue-500">{t("common.note")}:</strong>{" "}
                {t("common.note_for_withdraw")}
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div dir={dir}>
                <div className="mb-4">
                  <div className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span>{t("label.withdraw_maximum_amount")}</span>
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-custom-dark-blue">
                            <p className="p-1 text-sm font-medium">
                              {t("tooltip.maximum_withdraw")}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <Input
                    type="number"
                    defaultValue={
                      String(WalletSettings?.maximum_withdrawal_limit) ?? ""
                    }
                    id="maximum_withdrawal_limit"
                    {...register(
                      "maximum_withdrawal_limit" as keyof WithdrawSettingsFormData
                    )}
                    className="app-input"
                    placeholder={t("place_holder.enter_amount")}
                  />
                </div>
                <div className="mb-4">
                  <div className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span>{t("label.withdraw_minimum_amount")}</span>
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-custom-dark-blue">
                            <p className="p-1 text-sm font-medium">
                              {t("tooltip.minimum_withdraw")}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <Input
                    type="number"
                    defaultValue={
                      String(WalletSettings?.minimum_withdrawal_limit) ?? ""
                    }
                    id="minimum_withdrawal_limit"
                    {...register(
                      "minimum_withdrawal_limit" as keyof WithdrawSettingsFormData
                    )}
                    className="app-input"
                    placeholder={t("place_holder.enter_amount")}
                  />
                </div>
              </div>

              <div className="mt-6">
                <SubmitButton
                  IsLoading={isUpdating}
                  AddLabel={t("button.save_changes")}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
};

export default WithdrawSettingsForm;
