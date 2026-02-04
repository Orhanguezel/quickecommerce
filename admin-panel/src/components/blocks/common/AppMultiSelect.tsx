"use client";

import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui";

// Zod schema for validation
const selectionSchema = z.object({
  selectedItems: z
    .array(z.string())
    .min(1, { message: "You must select at least one item." }),
});

// Dummy data for the dropdown options
const groups = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
  { label: "Elderberry", value: "elderberry" },
  { label: "Fig", value: "fig" },
  { label: "Grape", value: "grape" },
];

type Checked = DropdownMenuCheckboxItemProps["checked"];

export function DropdownMenuCheckboxes() {
  const [selectedOptions, setSelectedOptions] = React.useState<Checked[]>(
    new Array(groups.length).fill(false)
  );

  const selectedItems = groups
    .filter((_, index) => selectedOptions[index])
    .map((option) => option.label)
    .join(", ");

  const validateSelection = () => {
    const selectedArray = groups
      .filter((_, index) => selectedOptions[index])
      .map((option) => option.label);

    const result = selectionSchema.safeParse({ selectedItems: selectedArray });

    if (!result.success) {
      alert(result.error.issues[0].message);
    } else {
      
      alert("Selection is valid!");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Input
            type="text"
            value={selectedItems}
            placeholder="Select items"
            readOnly
            className="border border-gray-300 p-2 w-full rounded-md"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Fruits</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {groups.map((option, index) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedOptions[index]}
              onCheckedChange={(checked) => {
                const updatedSelectedOptions = [...selectedOptions];
                updatedSelectedOptions[index] = checked;
                setSelectedOptions(updatedSelectedOptions);
              }}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <button
        onClick={validateSelection}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Validate Selection
      </button>
    </>
  );
}
