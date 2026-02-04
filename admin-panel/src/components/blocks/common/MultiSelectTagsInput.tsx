"use client";

import React, { useMemo } from "react";
import { ActionMeta, MultiValue } from "react-select";
import CreatableSelect from "react-select/creatable";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  selectedValues: ReadonlyArray<Option>;
  onChange: (
    selected: MultiValue<Option>,
    actionMeta: ActionMeta<Option>
  ) => void;
  onCreateOption: (inputValue: string) => void;
  placeholder?: string;
}
const MultiSelectTagsInput: React.FC<MultiSelectProps> = React.memo(
  ({
    label,
    options,
    selectedValues,
    onChange,
    onCreateOption,
    placeholder = "Select or create...",
  }) => {
    const isDarkMode =
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark");

    const customStyles = useMemo(() => {
      const dark = isDarkMode;
      return {
        control: (provided: any) => ({
          ...provided,
          backgroundColor: "transparent",
          borderColor: dark ? "#475569" : "#d1d5db",
          color: dark ? "#f1f5f9" : "#000",
          minHeight: "42px",
          boxShadow: "none",
          "&:hover": {
            borderColor: dark ? "#64748b" : "#9ca3af",
          },
        }),
        menu: (provided: any) => ({
          ...provided,
          backgroundColor: dark ? "#1e293b" : "#fff",
          zIndex: 50,
        }),
        option: (provided: any, state: any) => ({
          ...provided,
          backgroundColor: state.isFocused
            ? dark
              ? "#334155"
              : "#f3f4f6"
            : "transparent",
          color: dark ? "#f1f5f9" : "#000",
          cursor: "pointer",
        }),
        multiValue: (provided: any) => ({
          ...provided,
          backgroundColor: dark ? "#334155" : "#e5e7eb",
        }),
        multiValueLabel: (provided: any) => ({
          ...provided,
          color: dark ? "#f1f5f9" : "#000",
        }),
        multiValueRemove: (provided: any) => ({
          ...provided,
          color: dark ? "#f1f5f9" : "#000",
          ":hover": {
            backgroundColor: dark ? "#1e293b" : "#d1d5db",
            color: "#fff",
          },
        }),
        placeholder: (provided: any) => ({
          ...provided,
          color: dark ? "#94a3b8" : "#6b7280",
        }),
        input: (provided: any) => ({
          ...provided,
          color: dark ? "#f1f5f9" : "#000",
        }),
      };
    }, [isDarkMode]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") e.preventDefault();
    };

    return (
      <div className="w-full">
        <div onKeyDown={handleKeyDown}>
          <CreatableSelect
            isMulti
            options={options}
            value={selectedValues}
            onChange={onChange}
            onCreateOption={onCreateOption}
            placeholder={placeholder}
            styles={customStyles}
            classNamePrefix="tags-input"
            className="text-sm"
            menuPortalTarget={
              typeof window !== "undefined" ? document.body : null
            } // fixes z-index issues
          />
        </div>
      </div>
    );
  }
);

MultiSelectTagsInput.displayName = "MultiSelectTagsInput";

export default MultiSelectTagsInput;
