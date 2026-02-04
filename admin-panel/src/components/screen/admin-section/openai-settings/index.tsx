"use client";
import OpenAISettingsForm from "@/components/blocks/admin-section/openai-settings/OpenAISettingsForm";
import { Card, CardContent } from "@/components/ui";
import { useTranslations } from "next-intl";

const OpenAISettings = () => {
  const t = useTranslations()
  return (
    <div>
      <Card >
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-blue-500 flex items-center gap-2">
              Open AI Settings
            </h1>
          </div>
        </CardContent>
      </Card>
      <OpenAISettingsForm />
    </div>
  );
};

export default OpenAISettings;
