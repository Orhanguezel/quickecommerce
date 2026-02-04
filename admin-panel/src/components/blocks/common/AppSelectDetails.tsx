"use client";
import Loader from "@/components/molecules/Loader";
import { Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";
import * as React from "react";

interface SelectGroupData {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  wallet_balance: number;
}
interface AppSelectProps {
  value: any;
  search: any;
  hideNone?: any;
  customClass?: string;
  placeholder?: string;
  disabled?: boolean;
  groups: SelectGroupData[];
  onSelect: (value: any) => void;
  onOpenChange?: (open: boolean) => void;
  onSearch?: (query: string) => void;
  loading?: boolean;
}

export const AppSelectDetails: React.FC<AppSelectProps> = React.memo(
  ({
    placeholder = "Select item",
    value,
    groups,
    onSelect,
    customClass,
    hideNone,
    onOpenChange,
    onSearch,
    search,
    loading,
    disabled = false,
  }) => {
    const pathname = usePathname();
    const locale = pathname.split("/")[1];
    const dir = locale === "ar" ? "rtl" : "ltr";
    const inputRef = React.useRef<HTMLInputElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const getSelectedLabel = (value: any) => {
      if (value === "none") return placeholder;
      const selectedOption = groups?.find(
        (item) => String(item.id) === String(value)
      );
      if (!selectedOption) return placeholder;

      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {selectedOption.full_name}{" "}
            <span className="text-xs text-gray-400">
              ( {selectedOption.phone} )
            </span>
          </span>
          <span className="text-xs text-gray-500">{selectedOption.email}</span>
        </div>
      );
    };

    const handleSearchChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        onSearch && onSearch(query);

        // If query matches any item in the list
        const match = groups.some(
          (customer) =>
            customer.full_name.toLowerCase().includes(query.toLowerCase()) ||
            customer.email.toLowerCase().includes(query.toLowerCase()) ||
            customer.phone.includes(query)
        );

        if (match && searchInputRef.current) {
          searchInputRef.current.blur(); // unfocus input
        }
      },
      [onSearch, groups]
    );

    return (
      <Select
        dir={dir}
        value={String(value)}
        onValueChange={onSelect}
        onOpenChange={onOpenChange}
      >
        <SelectTrigger
          className={`${
            disabled
              ? "h-[50px]"
              : "h-[50px] ring ring-transparent focus:ring-transparent ring-offset-0 app-input"
          }  ${customClass}`}
          disabled={disabled}
        >
          <SelectValue placeholder={placeholder}>
            {getSelectedLabel(value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input
              ref={inputRef}
              value={search}
              placeholder="Search customer..."
              className="w-full h-10 app-input"
              onChange={handleSearchChange}
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader size="small" />
            </div>
          ) : (
            <>
              {!hideNone && <SelectItem value="none">None</SelectItem>}

              {groups?.map((groupItem) => (
                <SelectItem
                  className=""
                  key={groupItem.id}
                  value={String(groupItem.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {groupItem.full_name}{" "}
                      <span className="text-xs text-gray-400">
                        ( {groupItem.phone} )
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">
                      {groupItem.email}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    );
  }
);


AppSelectDetails.displayName = "AppSelectDetails";