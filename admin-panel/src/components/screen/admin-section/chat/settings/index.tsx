"use client";
import ChatSettingsForm from "@/components/blocks/admin-section/chat/settings/ChatSettingsForm";
import { Card, CardContent } from "@/components/ui";

const ChatSettings = () => {
  return (
    <div>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-blue-500 flex items-center gap-2">
              Chat & AI Ayarları
            </h1>
          </div>
        </CardContent>
      </Card>
      <ChatSettingsForm />
    </div>
  );
};

export default ChatSettings;
