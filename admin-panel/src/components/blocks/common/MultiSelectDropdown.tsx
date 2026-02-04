"use client";

import React, { useCallback, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Item {
  id: number;
  label: string;
  checked: boolean;
  disabled?: boolean;
}

interface MultiSelectDropdownProps {
  trigger: React.ReactNode;
  items: Item[];
  onSelectionChange: (updatedItems: Item[]) => void;
  label?: string;
  className?: string;
}
export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> =
  React.memo(
    ({
      trigger,
      items,
      onSelectionChange,
      label = "Select Options",
      className = "w-56",
    }) => {

      const handleCheckedChange = useCallback(
        (id: number, checked: boolean) => {
          onSelectionChange(
            items.map((item) => (item.id === id ? { ...item, checked } : item))
          );
        },
        [items, onSelectionChange]
      );

      const renderedItems = useMemo(
        () =>
          items.map((item) => (
            <DropdownMenuCheckboxItem
              key={item.id}
              checked={item.checked}
              onCheckedChange={(checked) =>
                handleCheckedChange(item.id, checked)
              }
              disabled={item.disabled}
            >
              {item.label}
            </DropdownMenuCheckboxItem>
          )),
        [items, handleCheckedChange]
      );

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          <DropdownMenuContent className={className}>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {renderedItems}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  );


  MultiSelectDropdown.displayName = "MultiSelectDropdown";