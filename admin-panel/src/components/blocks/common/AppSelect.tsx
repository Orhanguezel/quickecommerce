"use client";

import * as React from "react";
import { useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AppSelectOption = {
  label: React.ReactNode;
  value: string | number;
};

export type AppSelectProps = {
  value: string;                 // ✅ always string
  groups: AppSelectOption[];

  onSelect: (value: string) => void; // ✅ always string

  placeholder?: string;
  customClass?: string;
  hideNone?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** None seçilince hangi value dönsün? default "" */
  noneValue?: string;
  noneLabel?: React.ReactNode;
};

export const AppSelect: React.FC<AppSelectProps> = ({
  placeholder = "Select item",
  value,
  groups,
  onSelect,
  customClass,
  hideNone = false,
  onOpenChange,
  disabled = false,
  noneValue = "",
  noneLabel = "None",
}) => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";
  const dir = locale === "ar" ? "rtl" : "ltr";

  // ShadCN Select value string olmalı
  const selectValue = value ?? "";

  const labelMap = useMemo(() => {
    const map = new Map<string, React.ReactNode>();
    for (const opt of groups ?? []) {
      map.set(String(opt.value), opt.label);
    }
    return map;
  }, [groups]);

  const getSelectedLabel = useCallback(
    (val: string) => {
      if (!val) return placeholder; // noneValue === "" ise boş geldiğinde placeholder göster
      return labelMap.get(String(val)) ?? placeholder;
    },
    [labelMap, placeholder]
  );

  const handleValueChange = useCallback(
    (next: string) => {
      // UI'da "None" seçeneği gösteriyorsak ve seçildiyse noneValue dön
      if (!hideNone && next === "__none__") {
        onSelect(noneValue);
        return;
      }
      onSelect(next);
    },
    [hideNone, noneValue, onSelect]
  );

  return (
    <Select
      dir={dir}
      value={selectValue || (hideNone ? "" : "__none__")}
      onValueChange={handleValueChange}
      onOpenChange={onOpenChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={`${
          disabled
            ? ""
            : "ring ring-transparent focus:ring-transparent ring-offset-0 app-input"
        } ${customClass ?? ""}`}
      >
        <SelectValue placeholder={placeholder}>
          {getSelectedLabel(selectValue)}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {!hideNone && <SelectItem value="__none__">{noneLabel}</SelectItem>}

        {(groups ?? []).map((option, idx) => (
          <SelectItem key={`${String(option.value)}-${idx}`} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
