"use client";

import * as React from "react";
import { useMemo, useCallback, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type MultiSelectOption = {
  label: string;
  value: string;
};

export type AppStoreTypeMultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  customClass?: string;
};

export const AppStoreTypeMultiSelect: React.FC<AppStoreTypeMultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = "Select item",
  disabled = false,
  customClass = "",
}) => {
  const [open, setOpen] = useState(false);

  const labelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of options ?? []) {
      map.set(String(opt.value), opt.label);
    }
    return map;
  }, [options]);

  const toggle = useCallback(
    (optValue: string) => {
      if (value.includes(optValue)) {
        onChange(value.filter((v) => v !== optValue));
      } else {
        onChange([...value, optValue]);
      }
    },
    [value, onChange]
  );

  const removeTag = useCallback(
    (optValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(value.filter((v) => v !== optValue));
    },
    [value, onChange]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between h-auto min-h-[2.5rem] px-3 py-2 font-normal app-input ${customClass}`}
          type="button"
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              value.map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  {labelMap.get(v) ?? v}
                  <span
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer hover:text-destructive"
                    onClick={(e) => removeTag(v, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") removeTag(v, e as any);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </span>
                </Badge>
              ))
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] max-h-72 overflow-y-auto"
        align="start"
      >
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={value.includes(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
            onSelect={(e) => e.preventDefault()}
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AppStoreTypeMultiSelect;
