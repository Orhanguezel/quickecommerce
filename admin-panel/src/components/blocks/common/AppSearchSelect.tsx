"use client";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

interface SelectGroupData {
  label?: any;
  value?: any;
}

interface AppSelectProps {
  value: any;
  hideNone?: any;
  customClass?: string;
  placeholder?: string;
  disabled?: boolean;
  groups: SelectGroupData[];
  onSelect: (value: any) => void;
}

export const AppSearchSelect: React.FC<AppSelectProps> = ({
  placeholder = "Select item",
  value,
  groups,
  onSelect,
  customClass,
  hideNone,
  disabled = false,
}) => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [search, setSearch] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredGroups = React.useMemo(() => {
    return groups.filter((item) =>
      item.label?.toString().toLowerCase().includes(search.toLowerCase())
    );
  }, [groups, search]);

  const getSelectedLabel = (value: any) => {
    if (value == "none") return placeholder;
    const selectedOption = groups?.find(
      (item) => String(item.value) === String(value)
    );
    return selectedOption ? selectedOption.label : placeholder;
  };

  // Maintain focus on the input when the dropdown is open
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Select 
      dir={dir} 
      value={value} 
      onValueChange={onSelect}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger
        className={`${
          disabled
            ? ""
            : "ring ring-transparent focus:ring-transparent ring-offset-0 app-input"
        }  ${customClass}`}
        disabled={disabled}
      >
        <SelectValue placeholder={placeholder}>
          {getSelectedLabel(value || "")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-80 space-y-1">
        {/* Search input inside dropdown */}
        <div className="px-2 pt-2 mb-2 w-full">
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="app-input h-8 w-full"
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          />
        </div>

        {!hideNone && <SelectItem value="none">None</SelectItem>}

        {filteredGroups?.map((option, i) => (
          <SelectItem key={i} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}

        {filteredGroups.length === 0 && (
          <div className="px-2 py-1 text-sm text-muted-foreground">
            No results
          </div>
        )}
      </SelectContent>
    </Select>
  );
};