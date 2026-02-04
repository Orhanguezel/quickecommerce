"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

interface SelectGroupData {
  label: string;
  value?: string;
  children?: SelectGroupData[];
}

interface AppDropdownProps {
  groups: SelectGroupData[];
  level?: number;
  onItemSelected: (
    selectedItems: string[],
    selectedIDs: string[],
    hasChildData: boolean
  ) => void;
  selectedItems: string[];
  selectedIDs: string[];
  searchTerm: string;
  onSearchChange: (value: string, level: number) => void;
}
interface AppDropdown {
  groups: SelectGroupData[];
  selectedItems: string[];
  setSelectedItems: any;
  selectedIDs: string[];
  setSelectedIDs: any;
  finalSelectedID: any;
  setfinalSelectedID: any;
}

const RecursiveDropdown: React.FC<AppDropdownProps> = memo(
  ({
    groups,
    level = 0,
    searchTerm,
    selectedIDs,
    selectedItems,
    onItemSelected,
    onSearchChange,
  }) => {
    const handleItemClick = useCallback(
      (label: string, value: string | number, hasChildData: boolean) => {
        const newSelectedItems = [...selectedItems];
        const newSelectedIDs = [...selectedIDs];
        newSelectedItems[level] = label;
        newSelectedIDs[level] = String(value);

        onItemSelected(
          hasChildData
            ? newSelectedItems
            : newSelectedItems.slice(0, level + 1),
          hasChildData ? newSelectedIDs : newSelectedIDs.slice(0, level + 1),
          hasChildData
        );
      },
      [level, onItemSelected, selectedItems, selectedIDs]
    );

    return (
      <div className="column">
        <ul>
          {groups.map((item) => (
            <li
              key={item.value}
              className={selectedItems[level] == item.label ? "selected" : ""}
              onClick={() =>
                handleItemClick(
                  item.label || "",
                  item.value || "",
                  !!(item.children && item.children.length > 0)
                )
              }
            >
              {item.label}
              {item.children && item.children.length > 0 && (
                <span className="arrow">
                  {" "}
                  <ChevronRight
                    width={16}
                    className="text-gray-500 dark:text-white"
                  />{" "}
                </span>
              )}
            </li>
          ))}
        </ul>

        {groups.map(
          (item) =>
            item.label == selectedItems[level] &&
            item.children && (
              <div
                className={`absolute top-0 left-full h-full flex z-50`}
                key={item.value}
              >
                <RecursiveDropdown
                  groups={item.children}
                  level={level + 1}
                  onItemSelected={onItemSelected}
                  selectedItems={selectedItems}
                  selectedIDs={selectedIDs}
                  searchTerm={searchTerm}
                  onSearchChange={onSearchChange}
                />
              </div>
            )
        )}
      </div>
    );
  }
);
RecursiveDropdown.displayName = "RecursiveDropdown";

export const AppNestedDropdown: React.FC<AppDropdown> = ({
  selectedItems,
  selectedIDs,
  setSelectedIDs,
  finalSelectedID,
  setfinalSelectedID,
  setSelectedItems,
  groups,
}) => {
  const [searchTerms, setSearchTerms] = useState<string[]>(
    new Array(groups.length).fill("")
  );
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (groups.length > 0) {
      setDropdownOpen((prev) => !prev);
    }
  };

  const handleSearchChange = (value: string, level: number) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[level] = value;
    setSearchTerms(newSearchTerms);
  };

  const handleItemSelected = (
    newSelectedItems: string[],
    newSelectedIDs: string[],
    hasChildData: boolean
  ) => {
    setSelectedItems(newSelectedItems);
    setSelectedIDs(newSelectedIDs);
    const lastSelectedItem = newSelectedIDs[newSelectedIDs.length - 1];
    setfinalSelectedID(lastSelectedItem);
    if (hasChildData) {
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
    }
    const dropdownBody = document.querySelector(
      ".custom-scrollbar"
    ) as HTMLElement;
    if (dropdownBody) {
      const scrollInterval = setInterval(() => {
        dropdownBody.scrollLeft += 50;
        if (
          dropdownBody.scrollLeft >=
          dropdownBody.scrollWidth - dropdownBody.clientWidth
        ) {
          clearInterval(scrollInterval);
        }
      }, 100);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isDropdownOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isDropdownOpen]);

  return (
    <div ref={dropdownRef} className="dropdownContainer relative">
      {isDropdownOpen && (
        <div
          className="fixed inset-0"
          onClick={() => setDropdownOpen(false)}
        ></div>
      )}
      <div
        onClick={toggleDropdown}
        className={`w-full flex justify-between border p-2 rounded-md  
          ${
            groups.length == 0
              ? "cursor-not-allowed opacity-50 bg-gray-200"
              : "app-input cursor-pointer"
          }`}
      >
        <span>
          {selectedItems?.filter(Boolean).join(" > ")
            ? selectedItems?.filter(Boolean).join(" > ")
            : "Select..."}
        </span>
        <span className="text-gray-500 dark:text-white mr-1  flex items-center gap-1">
          {selectedItems.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItems([]);
                setSelectedIDs([]);
                setfinalSelectedID(null);
              }}
              className="text-xs text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          )}
          <ChevronDown width={16} />
        </span>
      </div>

      {isDropdownOpen && (
        <div
          className={cn(
            "custom-scrollbar mt-1 absolute flex z-50 h-56 min-w-[8rem] overflow-auto w-full rounded-md border bg-popover text-popover-foreground shadow-md"
          )}
        >
          <RecursiveDropdown
            groups={groups}
            selectedItems={selectedItems}
            selectedIDs={selectedIDs}
            onItemSelected={handleItemSelected}
            searchTerm={searchTerms[0] || ""}
            onSearchChange={handleSearchChange}
          />
        </div>
      )}
    </div>
  );
};
