"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from "@/components/ui";
import { useTranslations } from "next-intl";

export interface BulkActionOption {
  value: string;
  label: string;
  onClick: () => void; // Action to perform for this option
}

interface BulkActionBarProps {
  selectedAction: string;
  setSelectedAction: (value: string) => void;
  selectedRows: Set<string>;
  originalDataLength: number;
  actions: BulkActionOption[];
  isRequesting?: boolean;
  checkboxCustomClass?: any;
  handleSelectAll: (isChecked: boolean) => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedAction,
  setSelectedAction,
  selectedRows,
  originalDataLength,
  actions,
  isRequesting = false,
  handleSelectAll,
  checkboxCustomClass="mx-3 md:mx-5"
}) => {
  const t = useTranslations();

  // Find the selected action details
  const currentAction = actions.find((a) => a.value === selectedAction);

  return (
    <div className="relative md:absolute mt-4 md:mt-0 shadow-custom md:shadow-none p-2 md:p-0 bg-white dark:bg-[#1e293b] md:bg-transparent rounded">
      {/* Dropdown */}
      <div className="mx-2 flex items-center justify-center gap-2">
        <Select
          key={selectedAction}
          onValueChange={setSelectedAction}
          value={selectedAction}
        >
          <SelectTrigger className="w-full md:w-[180px] border px-4 py-2 rounded app-input">
            <SelectValue placeholder={t("place_holder.select_action")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="none">{t("common.none")}</SelectItem>
              {actions.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Action button */}
        <Button
          variant="outline"
          className="app-button my-2"
          disabled={selectedRows.size === 0 || !currentAction}
          onClick={() => currentAction?.onClick()}
        >
          {isRequesting
            ? `${currentAction?.label}...`
            : currentAction?.label ?? t("common.apply")}
        </Button>
      </div>

      {/* Select all checkbox */}
      <div className={`absolute z-50 mt-[96px] md:mt-[16px] ${checkboxCustomClass}`}>
        <input
          type="checkbox"
          onChange={(e) => handleSelectAll(e.target.checked)}
          checked={
            selectedRows.size === originalDataLength && originalDataLength > 0
          }
        />
      </div>
    </div>
  );
};
