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
    geliver_webhook_header_name: string;
    geliver_webhook_header_secret: string;
  }>();

  const [testMode, setTestMode] = useState(true);
  const webhookUrl = cargoSettingsData?.geliver_webhook_url || "";

  useEffect(() => {
    if (cargoSettingsData) {
      setValue("geliver_api_token", cargoSettingsData.geliver_api_token || "");
      setValue("geliver_sender_address_id", cargoSettingsData.geliver_sender_address_id || "");
      setValue("geliver_webhook_header_name", cargoSettingsData.geliver_webhook_header_name || "");
      setValue("geliver_webhook_header_secret", cargoSettingsData.geliver_webhook_header_secret || "");
      setTestMode(cargoSettingsData.geliver_test_mode === "on");
    }
  }, [cargoSettingsData, setValue]);

  const onSubmit = (values: any) => {
    saveSettings(
      {
        geliver_api_token: values.geliver_api_token,
        geliver_sender_address_id: values.geliver_sender_address_id,
        geliver_test_mode: testMode ? "on" : "",
        geliver_webhook_header_name: values.geliver_webhook_header_name,
        geliver_webhook_header_secret: values.geliver_webhook_header_secret,
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

          {/* Webhook Settings */}
          <div className="border-t pt-5">
            <h3 className="text-sm font-semibold mb-3">Webhook Ayarları (Kargo Takip)</h3>

            {/* Webhook URL */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">
                Webhook URL
              </label>
              <div className="flex gap-2">
                <Input
                  className="app-input flex-1"
                  value={webhookUrl}
                  readOnly
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 whitespace-nowrap"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                  }}
                >
                  Kopyala
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Bu URL&apos;yi Geliver webhook ayarlarına girin. Tip: TRACK_UPDATED
              </p>
            </div>

            {/* Header Name */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">
                Webhook Header Name
              </label>
              <Input
                {...register("geliver_webhook_header_name")}
                className="app-input"
                placeholder="Ör: Sportoonline"
              />
              <p className="text-xs text-slate-500 mt-1">
                Geliver dashboard&apos;da webhook eklerken girdiğiniz Header Name
              </p>
            </div>

            {/* Header Secret */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Webhook Header Value (Secret)
              </label>
              <Input
                {...register("geliver_webhook_header_secret")}
                className="app-input"
                placeholder="Ör: gizli-anahtar-123"
                type="password"
              />
              <p className="text-xs text-slate-500 mt-1">
                Geliver dashboard&apos;da webhook eklerken girdiğiniz Header Value. Doğrulama için kullanılır.
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded p-3 text-sm text-blue-700">
            <strong>Kurye Akışı:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Sipariş geldiğinde admin veya satıcı &quot;Kargo Oluştur&quot; butonuna tıklar</li>
              <li>Geliver otomatik olarak en ucuz teklifi seçer (Aras, Yurtiçi vb.)</li>
              <li>Barkod + etiket URL oluşturulur</li>
              <li>Geliver kargo durumu değişince webhook ile otomatik güncellenir</li>
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
