"use client";

import React from "react";
import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui";
import { useTranslations } from "next-intl";

interface FooterSectionProps {
  data: any[];
  sectionIndex: number;
  handleChange: (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => void;
}

const FooterSection: React.FC<FooterSectionProps> = ({
  data,
  sectionIndex,
  handleChange,
}) => {
  const t = useTranslations();
  return (
    <Card className="space-y-4">
      {data.map((section, itemIndex) => (
        <div key={itemIndex} className="px-4 py-8 flex items-center  gap-4 ">
          <div className="space-y-2">
            <p className="col-span-3 text-sm font-medium">{t("theme.footer.background_color")}</p>
            <div className="p-1 flex items-center gap-2 border border-slate-300 w-48 rounded">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="w-12 h-10 rounded-md border"
                    style={{
                      backgroundColor: section.background_color || "#ffffff",
                    }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <HexColorPicker
                    color={section.background_color || "#ffffff"}
                    onChange={(color) =>
                      handleChange(
                        sectionIndex,
                        itemIndex,
                        "background_color",
                        color
                      )
                    }
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="text"
                value={section.background_color || ""}
                onChange={(e) =>
                  handleChange(
                    sectionIndex,
                    itemIndex,
                    "background_color",
                    e.target.value
                  )
                }
                className="text-start border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent "
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="col-span-3 text-sm font-medium ">{t("theme.footer.text_color")}</p>
            <div className="p-1 flex items-center gap-2 border border-slate-300 w-48 rounded">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="w-12 h-10 rounded-md border"
                    style={{ backgroundColor: section.text_color || "#ffffff" }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <HexColorPicker
                    color={section.text_color || "#ffffff"}
                    onChange={(color) =>
                      handleChange(sectionIndex, itemIndex, "text_color", color)
                    }
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="text"
                value={section.text_color || ""}
                onChange={(e) =>
                  handleChange(
                    sectionIndex,
                    itemIndex,
                    "text_color",
                    e.target.value
                  )
                }
                className="text-start border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent "
              />
            </div>
          </div>

          {/* Layout Columns */}
          <div className="space-y-2">
            <p className="col-span-3 text-sm font-medium">{t("theme.footer.layout_columns")}</p>
            <Input
              type="number"
              value={section.layout_columns || 0}
              onChange={(e) =>
                handleChange(
                  sectionIndex,
                  itemIndex,
                  "layout_columns",
                  Number(e.target.value)
                )
              }
              className="app-input w-48 text-start h-12 p-6"
            />
          </div>
        </div>
      ))}
    </Card>
  );
};

export default FooterSection;
