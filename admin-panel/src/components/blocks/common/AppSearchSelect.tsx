"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredGroups = React.useMemo(() => {
    return groups.filter((item) =>
      item.label?.toString().toLowerCase().includes(search.toLowerCase())
    );
  }, [groups, search]);

  const selectedLabel = React.useMemo(() => {
    if (!value || value === "none") return null;
    const found = groups?.find(
      (item) => String(item.value) === String(value)
    );
    return found ? found.label : null;
  }, [value, groups]);

  // Reset search when popover closes, focus input when opens
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    } else {
      setSearch("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          dir={dir}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            disabled
              ? ""
              : "ring ring-transparent focus:ring-transparent ring-offset-0 app-input",
            customClass
          )}
        >
          <span className="line-clamp-1 text-start">
            {selectedLabel ?? placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
        dir={dir}
      >
        <Command shouldFilter={false}>
          <div className="p-2">
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="app-input h-8 w-full"
            />
          </div>
          <CommandList>
            <CommandGroup>
              {!hideNone && (
                <CommandItem
                  onSelect={() => {
                    onSelect("none");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !value || value === "none"
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  None
                </CommandItem>
              )}
              {filteredGroups?.map((option, i) => (
                <CommandItem
                  key={i}
                  onSelect={() => {
                    onSelect(String(option.value));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      String(value) === String(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {filteredGroups.length === 0 && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No results
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
