"use client";
import React from "react";
import "rc-pagination/assets/index.css";
import RcPagination, {
  PaginationProps as RcPaginationProps,
} from "rc-pagination";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePathname } from "next/navigation";

const paginationStyles = {
  base: {
    item: "[&>.rc-pagination-item>a]:!no-underline [&>.rc-pagination-item>a]:font-medium [&>li.rc-pagination-item]:border-muted [&>.rc-pagination-item:not(.rc-pagination-item-active)]:bg-transparent",
    icon: "[&>.rc-pagination-prev]:align-baseline [&>.rc-pagination-next]:align-baseline",
    outline:
      "[&>.rc-pagination-item]:leading-7 [&>.rc-pagination-item]:border-0",
    jumperDiv:
      "[&>.rc-pagination-options>.rc-pagination-options-quick-jumper]:text-sm [&>.rc-pagination-options>.rc-pagination-options-quick-jumper]:text-gray-500 dark:text-white",
    jumperInput:
      "[&>.rc-pagination-options>.rc-pagination-options-quick-jumper>input]:!py-[3px] [&>.rc-pagination-options>.rc-pagination-options-quick-jumper>input]:text-sm [&>.rc-pagination-options>.rc-pagination-options-quick-jumper>input]:border-muted [&>.rc-pagination-options>.rc-pagination-options-quick-jumper>input]:ring-0",
  },
  rounded: {
    none: "[&>.rc-pagination-item]:rounded-none [&>.rc-pagination-options>.rc-pagination-options-quick-jumper>input]:rounded-none",
    sm: "[&>.rc-pagination-item]:rounded-sm [&>.rc-pagination-options>.rc-pagination-options-quick-jumper>input]:rounded-sm",
    md: "[&>.rc-pagination-item]:rounded-md [&>.rc-pagination-options>.rc-pagination-options-quick-jumper>input]:rounded-md",
    lg: "[&>.rc-pagination-item]:rounded-lg [&>.rc-pagination-options>.rc-pagination-options-quick-jumper>input]:rounded-lg",
    full: "[&>.rc-pagination-item]:rounded-full [&>.rc-pagination-options>.rc-pagination-options-quick-jumper>input]:rounded-full",
  },
  variant: {
    solid: {
      base: "",
      color: {
        primary:
          "[&>.rc-pagination-item-active]:bg-primary [&>.rc-pagination-item-active>a]:!text-primary-foreground [&>li.rc-pagination-item-active]:border-primary [&>.rc-pagination-item-active]:hover:border-primary [&>.rc-pagination-item-active]:focus:border-primary",
        secondary:
          "[&>.rc-pagination-item-active]:bg-secondary [&>.rc-pagination-item-active>a]:!text-secondary-foreground [&>li.rc-pagination-item-active]:border-secondary [&>.rc-pagination-item-active]:hover:border-secondary [&>.rc-pagination-item-active]:focus:border-secondary",
        danger:
          "[&>.rc-pagination-item-active]:bg-red [&>.rc-pagination-item-active>a]:!text-white [&>li.rc-pagination-item-active]:border-red [&>.rc-pagination-item-active]:hover:border-red [&>.rc-pagination-item-active]:focus:border-red",
      },
    },
    flat: {
      base: "",
      color: {
        primary:
          "[&>.rc-pagination-item-active]:bg-primary-lighter [&>li.rc-pagination-item-active]:border-primary-lighter [&>.rc-pagination-item-active>a]:text-primary-dark [&>.rc-pagination-item-active>a]:hover:text-primary-dark [&>.rc-pagination-item-active>a]:focus:text-primary-dark [&>.rc-pagination-item-active]:hover:border-primary-lighter [&>.rc-pagination-item-active]:focus:border-primary-lighter",
        secondary:
          "[&>.rc-pagination-item-active]:bg-secondary-lighter [&>li.rc-pagination-item-active]:border-secondary-lighter [&>.rc-pagination-item-active>a]:text-secondary-dark [&>.rc-pagination-item-active>a]:hover:text-secondary-dark [&>.rc-pagination-item-active>a]:focus:text-secondary-dark [&>.rc-pagination-item-active]:hover:border-secondary-lighter [&>.rc-pagination-item-active]:focus:border-secondary-lighter",
        danger:
          "[&>.rc-pagination-item-active]:bg-red-lighter [&>li.rc-pagination-item-active]:border-red-lighter [&>.rc-pagination-item-active>a]:text-red-dark [&>.rc-pagination-item-active>a]:hover:text-red-dark [&>.rc-pagination-item-active>a]:focus:text-red-dark [&>.rc-pagination-item-active]:hover:border-red-lighter [&>.rc-pagination-item-active]:focus:border-red-lighter",
      },
    },
  },
};

const iconStyles = {
  base: "text-foreground",
  outline: "border border-muted p-[5px]",
  center: "inline-block align-middle",
  rounded: {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  },
};

type IconProps = {
  icon: React.ReactNode;
  rounded: keyof typeof iconStyles.rounded;
  outline: boolean;
  className: string;
  lang?: string;
};

const PrevIcon = ({ lang, icon, rounded, outline, className }: IconProps) => (
  <div
    className={cn(
      iconStyles.base,
      outline ? iconStyles.outline : iconStyles.center,
      iconStyles.rounded[rounded],
      (className = "text-xs font-bold text-slate-700 dark:text-white")
    )}
  >
    {icon || (
      <div className="flex items-center">
        {lang === "ar" ? (
          <ChevronRightIcon className="h-4 w-4" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4" />
        )}

        <span className="ml-2 hidden md:inline-block dark:text-white">Previous</span>
      </div>
    )}
  </div>
);

const NextIcon = ({ lang, icon, rounded, outline, className }: IconProps) => (
  <div
    className={cn(
      iconStyles.base,
      outline ? iconStyles.outline : iconStyles.center,
      iconStyles.rounded[rounded],
      (className = "text-xs font-bold text-slate-700 dark:text-white")
    )}
  >
    {icon || (
      <div className="flex items-center">
        <span className="mr-2 hidden md:inline-block dark:text-white">Next</span>
        {lang === "ar" ? (
          <ChevronLeftIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </div>
    )}
  </div>
);

const JumpPrevIcon = ({ icon, rounded, outline, className }: IconProps) => (
  <div
    className={cn(
      iconStyles.base,
      outline ? iconStyles.outline : iconStyles.center,
      iconStyles.rounded[rounded],
      !icon && outline && "py-0 leading-[26px]",
      className
    )}
  >
    {icon || "•••"}
  </div>
);

const JumpNextIcon = ({ icon, rounded, outline, className }: IconProps) => (
  <div
    className={cn(
      iconStyles.base,
      outline ? iconStyles.outline : iconStyles.center,
      iconStyles.rounded[rounded],
      !icon && outline && "py-0 leading-[26px]",
      className
    )}
  >
    {icon || "•••"}
  </div>
);

export const localeDefault = {
  items_per_page: "/ page",
  jump_to: "Go to",
  jump_to_confirm: "confirm",
  page: "Page",
  prev_page: "Previous Page",
  next_page: "Next Page",
  prev_5: "Previous 5 Pages",
  next_5: "Next 5 Pages",
  prev_3: "Previous 3 Pages",
  next_3: "Next 3 Pages",
  page_size: "Page Size",
};

export interface PaginationProps extends RcPaginationProps {
  outline?: boolean;
  rounded?: keyof typeof paginationStyles.rounded;
  variant?: keyof typeof paginationStyles.variant;
  color?: keyof typeof paginationStyles.variant.flat.color;
  prevIconClassName?: string;
  nextIconClassName?: string;
  jumpPrevIconClassName?: string;
  jumpNextIconClassName?: string;
}

export default function Pagination({
  outline = false,
  rounded = "md",
  variant = "solid",
  color = "primary",
  locale,
  nextIcon,
  prevIcon,
  prevIconClassName,
  nextIconClassName,
  jumpPrevIcon,
  jumpNextIcon,
  jumpPrevIconClassName,
  jumpNextIconClassName,
  className,
  ...props
}: PaginationProps) {
  const pathname = usePathname();
  const lang = pathname.split("/")[1];
  return (
    <RcPagination
      locale={locale || localeDefault}
      nextIcon={
        <NextIcon
          lang={lang}
          icon={nextIcon as React.ReactNode}
          rounded={rounded}
          outline={outline}
          className={nextIconClassName as string}
        />
      }
      prevIcon={
        <PrevIcon
          lang={lang}
          icon={prevIcon as React.ReactNode}
          rounded={rounded}
          outline={outline}
          className={prevIconClassName as string}
        />
      }
      jumpPrevIcon={
        lang === "ar" ? (
          <JumpNextIcon
            icon={jumpNextIcon as React.ReactNode}
            rounded={rounded}
            outline={outline}
            className={jumpNextIconClassName as string}
          />
        ) : (
          <JumpPrevIcon
            icon={jumpPrevIcon as React.ReactNode}
            rounded={rounded}
            outline={outline}
            className={jumpPrevIconClassName as string}
          />
        )
      }
      jumpNextIcon={
        lang === "ar" ? (
          <JumpPrevIcon
            icon={jumpPrevIcon as React.ReactNode}
            rounded={rounded}
            outline={outline}
            className={jumpPrevIconClassName as string}
          />
        ) : (
          <JumpNextIcon
            icon={jumpNextIcon as React.ReactNode}
            rounded={rounded}
            outline={outline}
            className={jumpNextIconClassName as string}
          />
        )
      }
      className={cn(
        paginationStyles.base.item,
        paginationStyles.base.jumperDiv,
        paginationStyles.base.jumperInput,
        !outline && paginationStyles.base.outline,
        !outline && paginationStyles.base.icon,
        paginationStyles.rounded[rounded],
        paginationStyles.variant[variant].base,
        paginationStyles.variant[variant].color[color],
        className
      )}
      {...props}
    />
  );
}

Pagination.displayName = "Pagination";
