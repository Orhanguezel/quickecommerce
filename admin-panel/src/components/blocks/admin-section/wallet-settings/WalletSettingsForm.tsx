"use client";
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
  useWalletSettingsQuery,
  useWalletSettingsStoreMutation,
} from "@/modules/admin-section/wallet-settings/wallet-settings.action";
import {
  WalletSettingsFormData,
  walletSettingsSchema,
} from "@/modules/admin-section/wallet-settings/wallet-settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const WalletSettingsForm = () => {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const { register, setValue, handleSubmit } = useForm<WalletSettingsFormData>({
    resolver: zodResolver(walletSettingsSchema),
  });
  const { WalletSettingsData, refetch, isPending } = useWalletSettingsQuery({});
  const WalletSettings = useMemo(
    () => (WalletSettingsData as any) || {},
    [WalletSettingsData]
  );

  useEffect(() => {
    setValue("max_deposit_per_transaction", WalletSettings?.wallet_settings ?? "");
    setValue("bank_transfer_bank_name",      WalletSettings?.bank_transfer_bank_name ?? "");
    setValue("bank_transfer_account_holder", WalletSettings?.bank_transfer_account_holder ?? "");
    setValue("bank_transfer_iban",           WalletSettings?.bank_transfer_iban ?? "");
    setValue("bank_transfer_description",    WalletSettings?.bank_transfer_description ?? "");
  }, [WalletSettings, setValue]);

  const { mutate: WalletSettingsStore, isPending: isUpdating } =
    useWalletSettingsStoreMutation();

  const onSubmit = async (values: WalletSettingsFormData) => {
    const submissionData = {
      ...values,
      id: WalletSettings?.id ? WalletSettings?.id : 0,
    };
    return WalletSettingsStore(
      { ...(submissionData as any) },
      { onSuccess: () => { refetch(); } }
    );
  };

  return (
    <div>
      {isPending ? (
        <CardSkletonLoader />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mt-4">
            <CardContent className="bg-gray-100 dark:bg-[#1f2937] p-2 md:p-6 border-l-8 border-blue-600">
              <div dir={dir}>
                <strong className="text-blue-500">{t("common.note")}:</strong>{" "}
                {t("common.note_for_deposit")}
              </div>
            </CardContent>
          </Card>

          {/* Deposit Limit */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div dir={dir}>
                <div className="mb-4">
                  <div className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span>{t("label.deposit_maximum_amount")}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 text-custom-dark-blue cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center" sideOffset={4} avoidCollisions={false} className="bg-custom-dark-blue max-w-sm">
                          <p className="p-1 text-sm font-medium">{t("tooltip.maximum_deposit")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    id="max_deposit_per_transaction"
                    {...register("max_deposit_per_transaction")}
                    className="app-input"
                    placeholder={t("place_holder.enter_amount")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfer Settings */}
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <div dir={dir}>
                <h3 className="text-base font-semibold mb-4 border-b pb-2">
                  Banka Havalesi / EFT Bilgileri
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Müşteriler havale/EFT ile ödeme yaparken bu bilgiler gösterilecektir. Admin onayından sonra bakiye güncellenir.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Banka Adı</label>
                    <Input
                      type="text"
                      {...register("bank_transfer_bank_name")}
                      className="app-input"
                      placeholder="Örn: Ziraat Bankası"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Hesap Sahibi</label>
                    <Input
                      type="text"
                      {...register("bank_transfer_account_holder")}
                      className="app-input"
                      placeholder="Örn: ABC Ticaret Ltd. Şti."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium mb-1 block">IBAN</label>
                    <Input
                      type="text"
                      {...register("bank_transfer_iban")}
                      className="app-input font-mono"
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium mb-1 block">Açıklama / Transfer Notu</label>
                    <Input
                      type="text"
                      {...register("bank_transfer_description")}
                      className="app-input"
                      placeholder="Örn: Lütfen isim ve sipariş numarasını belirtin"
                    />
                  </div>
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

export default WalletSettingsForm;
