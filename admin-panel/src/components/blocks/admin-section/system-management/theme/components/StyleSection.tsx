"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HexColorPicker } from "react-colorful";
import { useTranslations } from "next-intl";

interface StyleSectionProps {
  data: any[];
  sectionIndex: number;
  handleChange: (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => void;
}

const StyleSection: React.FC<StyleSectionProps> = ({
  data,
  sectionIndex,
  handleChange,
}) => {
  const t = useTranslations();
  return (
    <Card className="space-y-6 p-6">
      {data.map((section, itemIndex) => {
        // ✅ safe access
        const colors = section.colors?.[0] || {};

        return (
          <div key={itemIndex} className="flex gap-6">
            {/* Primary Color */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("theme.style.primary_color")}</p>
              <div className="p-1 flex items-center gap-2 border border-slate-300 w-48 rounded">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-12 h-10 rounded-md border"
                      style={{ backgroundColor: colors.primary || "#ffffff" }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-4">
                    <HexColorPicker
                      color={colors.primary || "#ffffff"}
                      onChange={(color) =>
                        handleChange(sectionIndex, itemIndex, "primary", color)
                      }
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="text"
                  value={colors.primary || ""}
                  onChange={(e) =>
                    handleChange(
                      sectionIndex,
                      itemIndex,
                      "primary",
                      e.target.value
                    )
                  }
                  className="text-start border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("theme.style.secondary_color")}</p>
              <div className="p-1 flex items-center gap-2 border border-slate-300 w-48 rounded">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-12 h-10 rounded-md border"
                      style={{ backgroundColor: colors.secondary || "#ffffff" }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-4">
                    <HexColorPicker
                      color={colors.secondary || "#ffffff"}
                      onChange={(color) =>
                        handleChange(
                          sectionIndex,
                          itemIndex,
                          "secondary",
                          color
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="text"
                  value={colors.secondary || ""}
                  onChange={(e) =>
                    handleChange(
                      sectionIndex,
                      itemIndex,
                      "secondary",
                      e.target.value
                    )
                  }
                  className="text-start border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                />
              </div>
            </div>
          </div>
        );
      })}
    </Card>
  );
};

export default StyleSection;
