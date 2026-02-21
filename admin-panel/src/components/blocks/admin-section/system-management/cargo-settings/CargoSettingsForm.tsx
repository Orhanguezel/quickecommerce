"use client";
import { SubmitButton } from "@/components/blocks/shared";
import { Card, CardContent, Input, Switch } from "@/components/ui";
import {
  useCargoSettingsMutation,
  useCargoSettingsQuery,
} from "@/modules/admin-section/cargo-settings/cargo-settings.action";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

const CargoSettingsForm = () => {
  const t = useTranslations();
  const { cargoSettingsData, refetch, isPending } = useCargoSettingsQuery();
  const { mutate: saveSettings, isPending: isSaving } = useCargoSettingsMutation();

  const { register, setValue, handleSubmit } = useForm<{
    geliver_api_token: string;
    geliver_sender_address_id: string;
  }>();

  const [testMode, setTestMode] = useState(true);

  useEffect(() => {
    if (cargoSettingsData) {
      setValue("geliver_api_token", cargoSettingsData.geliver_api_token || "");
      setValue("geliver_sender_address_id", cargoSettingsData.geliver_sender_address_id || "");
      setTestMode(cargoSettingsData.geliver_test_mode !== "on");
    }
  }, [cargoSettingsData, setValue]);

  const onSubmit = (values: any) => {
    saveSettings(
      {
        geliver_api_token: values.geliver_api_token,
        geliver_sender_address_id: values.geliver_sender_address_id,
        geliver_test_mode: testMode ? "" : "on",
      },
      { onSuccess: () => refetch() }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mt-4">
        <CardContent className="p-4 md:p-6 space-y-5">

          {/* Test Mode */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Test Modu (Gerçek kargo oluşturulmaz)
            </label>
            <Switch
              checked={testMode}
              onCheckedChange={setTestMode}
            />
            <p className="text-xs text-slate-500 mt-1">
              {testMode ? "Test modunda — gerçek kargo oluşturulmaz." : "Canlı mod — gerçek Geliver kargolar oluşturulur."}
            </p>
          </div>

          {/* API Token */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Geliver API Token
            </label>
            <Input
              {...register("geliver_api_token")}
              className="app-input"
              placeholder="Geliver API token buraya..."
              type="password"
            />
            <p className="text-xs text-slate-500 mt-1">
              Token almak için:{" "}
              <a
                href="https://app.geliver.io/apitokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                app.geliver.io/apitokens
              </a>
            </p>
          </div>

          {/* Sender Address ID */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Varsayılan Gönderici Adres ID
            </label>
            <Input
              {...register("geliver_sender_address_id")}
              className="app-input"
              placeholder="Geliver gönderici adres ID..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Admin panelden &quot;Kargo → Gönderici Adresi Ekle&quot; ile oluşturabilirsiniz.
              Geliver üzerinden de alabilirsiniz.
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded p-3 text-sm text-blue-700">
            <strong>Kurye Akışı:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Sipariş geldiğinde admin veya satıcı &quot;Kargo Oluştur&quot; butonuna tıklar</li>
              <li>Geliver otomatik olarak en ucuz teklifi seçer (Aras, Yurtiçi vb.)</li>
              <li>Barkod + etiket URL oluşturulur</li>
              <li>Müşteri sipariş sayfasında takip numarasını görebilir</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 sticky bottom-0 w-full p-4">
        <SubmitButton IsLoading={isSaving || isPending} AddLabel={t("button.save_changes")} />
      </Card>
    </form>
  );
};

export default CargoSettingsForm;
