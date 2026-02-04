"use client";

import { CustomIcons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import * as LucideIcons from "lucide-react";
import { ChevronDown, Dot } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Key, useEffect, useMemo, useState } from "react";

const AllIcons = { ...LucideIcons, ...CustomIcons };

type SetBool = React.Dispatch<React.SetStateAction<boolean>>;

interface CollapseMenuButtonProps {
  icon: string;
  route: string;
  label: string;
  submenus: any[];
  isOpen: boolean | undefined;
  setIsLoading?: SetBool; // optional kalabilir
  search?: string;
}

export function CollapseMenuButton({
  icon,
  route,
  label,
  submenus,
  isOpen,
  search = "",
  setIsLoading,
}: CollapseMenuButtonProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // ✅ safe caller (TS + runtime)
  const safeSetIsLoading = useMemo(() => {
    return (value: boolean) => {
      if (typeof setIsLoading === "function") setIsLoading(value);
    };
  }, [setIsLoading]);

  useEffect(() => {
    if (search) {
      const hasSearchMatch = submenus.some((submenu) =>
        submenu.perm_title?.toLowerCase().includes(search.toLowerCase())
      );
      if (hasSearchMatch) {
        setIsCollapsed(true);
        return;
      }
    }

    const hasActiveSubmenu = submenus.some(
      (submenu) => pathnameWithoutLocale === submenu.perm_name
    );

    if (hasActiveSubmenu) setIsCollapsed(true);
  }, [search, submenus, pathnameWithoutLocale]);

  const filteredSubmenus = search
    ? submenus.filter((submenu) =>
        submenu.perm_title?.toLowerCase().includes(search.toLowerCase())
      )
    : submenus;

  const iconName = (icon || "LayoutGrid") as keyof typeof AllIcons;
  const IconComponent = AllIcons[iconName] as
    | React.ComponentType<{ size: number }>
    | undefined;

  if (
    search &&
    filteredSubmenus.length === 0 &&
    !label.toLowerCase().includes(search.toLowerCase())
  ) {
    return null;
  }

  // ✅ tek bir handler: “gerçek navigation” olacaksa loading aç
  const handleNavIntent = (e: React.MouseEvent, href: string) => {
    const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;
    if (!isNewTab && href !== pathnameWithoutLocale) {
      safeSetIsLoading(true);
    }
  };

  return isOpen ? (
    <Collapsible
      open={isCollapsed}
      onOpenChange={setIsCollapsed}
      className="w-full"
    >
      <CollapsibleTrigger
        className="[&[data-state=open]>div>div>svg]:rotate-180 mb-1"
        asChild
      >
        <Button
          variant="label"
          className="w-full justify-start h-10 text-white text-opacity-60 hover:text-opacity-100 hover:bg-[#2f3a5f]"
          data-testid={`collapse-button-${label
            .replace(/\s+/g, "-")
            .toLowerCase()}`}
        >
          <div className="w-full items-center flex justify-between">
            <div className="flex items-center">
              <span>{IconComponent && <IconComponent size={20} />}</span>
              <p
                className={cn(
                  "max-w-[150px] truncate",
                  isOpen
                    ? "translate-x-0 opacity-100 mx-4"
                    : "-translate-x-96 opacity-0"
                )}
              >
                {highlightText(label, search)}
              </p>
            </div>

            {filteredSubmenus.length > 0 && (
              <div
                className={cn(
                  "whitespace-nowrap",
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-96 opacity-0"
                )}
              >
                <ChevronDown size={18} className="transition-transform duration-200" />
              </div>
            )}
          </div>
        </Button>
      </CollapsibleTrigger>

      {filteredSubmenus.length > 0 && (
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          {filteredSubmenus.map(
            ({ perm_name, perm_title, options }: any, index: Key) => {
              const href = perm_name || route;
              const isSubmenuActive = href === pathnameWithoutLocale;

              return (
                <Button
                  key={index}
                  variant={isSubmenuActive ? "labelActive" : "label"}
                  className={`w-full justify-start h-10 mb-1 cursor-pointer ${
                    isSubmenuActive
                      ? "bg-[#2f3a5f] text-white"
                      : "text-white text-opacity-60 hover:text-opacity-100 hover:bg-[#2f3a5f]"
                  }`}
                  asChild
                >
                  <Link
                    href={href}
                    onClick={(e) => {
                      handleNavIntent(e, href);

                      if (options) {
                        localStorage.setItem(
                          "selectedOptions",
                          JSON.stringify(options)
                        );
                      }
                    }}
                  >
                    <span className="mr-4 ml-2">
                      <Dot size={18} />
                    </span>
                    <p
                      className={cn(
                        "max-w-[170px] truncate",
                        isOpen
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-96 opacity-0"
                      )}
                    >
                      {highlightText(perm_title, search)}
                    </p>
                  </Link>
                </Button>
              );
            }
          )}
        </CollapsibleContent>
      )}
    </Collapsible>
  ) : (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="label" className="w-full justify-start h-10 mb-1">
                <div className="w-full items-center flex justify-between">
                  <div className="flex items-center">
                    <span className={cn(isOpen === false ? "" : "mr-4")}>
                      {IconComponent && <IconComponent size={20} />}
                    </span>
                    <p
                      className={cn(
                        "max-w-[200px] truncate",
                        isOpen === false ? "opacity-0" : "opacity-100"
                      )}
                    >
                      {label}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <TooltipContent side="right" align="start" alignOffset={2}>
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent side="right" sideOffset={25} align="start">
        <DropdownMenuLabel className="max-w-[190px] truncate">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {filteredSubmenus.map(({ perm_title, perm_name, options }: any, index: Key) => {
          const href = perm_name || route;

          return (
            <DropdownMenuItem key={index} asChild>
              <Link
                className="cursor-pointer"
                href={href}
                onClick={(e) => {
                  handleNavIntent(e, href);

                  if (options) {
                    localStorage.setItem(
                      "selectedOptions",
                      JSON.stringify(options)
                    );
                  }
                }}
              >
                <p className="max-w-[180px] truncate">
                  {highlightText(perm_title, search)}
                </p>
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuArrow className="fill-border" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function highlightText(text: string, search: string) {
  if (!search) return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(search)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <span
            key={i}
            className="bg-yellow-200 text-black dark:text-white px-1 rounded"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
