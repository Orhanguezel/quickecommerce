"use client";
import { Button, Card } from "@/components/ui";
import { X } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
interface FiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: () => void;
  onReset: () => void;
  children: React.ReactNode;
  showOverlay?: boolean;
}

const Filters: React.FC<FiltersProps> = ({
  isOpen,
  onClose,
  onSearch,
  onReset,
  children,
  showOverlay = false,
}) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <>
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onClose}
        ></div>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          duration: 0.6, // Slow open/close animation
          ease: "easeInOut",
        }}
        ref={modalRef}
        dir={dir}
        className={` ${
          locale === "ar" ? "left-0" : "right-0"
        } absolute top-[40px]  mt-2 bg-white dark:bg-[#1e293b] p-4 rounded-md 
                shadow-custom w-[500px] z-50`}
      >
        <div className="flex items-start justify-between">
          <h1 className="text-lg font-semibold text-gray-500 dark:text-white">
            {t("label.filters")}
          </h1>
          <p
            className=" text-gray-500 dark:text-white hover:text-black cursor-pointer"
            onClick={onClose}
          >
            <X width={16} height={16} />
          </p>
        </div>
        <div className="p-4">{children}</div>
        <div className="px-4 flex justify-start gap-2">
          <Button className="app-button" variant="outline" onClick={onSearch}>
          {t("button.search")}
          </Button>
          <Button variant="outline" className="" onClick={onReset}>
            Reset
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export default Filters;
