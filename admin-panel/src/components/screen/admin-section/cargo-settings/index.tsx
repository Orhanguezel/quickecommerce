"use client";

import CargoSettingsForm from "@/components/blocks/admin-section/system-management/cargo-settings/CargoSettingsForm";
import { Card, CardContent } from "@/components/ui";
import { Package } from "lucide-react";

const CargoSettings = () => {
  return (
    <div>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-blue-500 flex items-center gap-2">
              <Package className="w-6 h-6" />
              Kurye Ayarları (Geliver)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Geliver kargo entegrasyonu ayarları — API token ve gönderici adresi
            </p>
          </div>
        </CardContent>
      </Card>
      <CargoSettingsForm />
    </div>
  );
};

export default CargoSettings;
