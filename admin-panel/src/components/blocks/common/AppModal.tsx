"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "@/components/molecules/Loader";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

type ModalProps = {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  smallModal?: boolean;
  children: React.ReactNode;
  sendOTP?: string;
  verifyEmail?: string;
  actionButtonLabel?: string;
  cancelButtonLabel?: string;
  width?: string;
  customClass?: string;
  actionButtonClass?: any;
  disable?: boolean;
  IsLoading?: boolean;
  onSendOTP?: () => void;
  onVerifyEmail?: () => void;
  onSave?: () => void;
  isOpen?: boolean;
  hideX?: any;
  onOpenChange?: (open: boolean) => void;
};

export const AppModal: React.FC<ModalProps> = ({
  trigger,
  title,
  description,
  children,
  sendOTP,
  verifyEmail,
  actionButtonLabel,
  cancelButtonLabel = "Cancel",
  customClass,
  disable,
  IsLoading,
  hideX,
  onSave,
  onSendOTP,
  onVerifyEmail,
  isOpen,
  onOpenChange,
  smallModal,
  actionButtonClass
}) => {
  const t = useTranslations();
  const [shouldRender, setShouldRender] = React.useState(isOpen);
  const pathname = usePathname();
  const locale = React.useMemo(() => pathname.split("/")[1], [pathname]);
  const dir = locale === "ar" ? "rtl" : "ltr";

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setShouldRender(true);
    } else {
      document.body.style.overflow = "";
      const timer = setTimeout(() => setShouldRender(false), 100);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <DialogPrimitive.Root open={shouldRender} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <AnimatePresence>
        {shouldRender && (
          <DialogPrimitive.Portal forceMount>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="fixed inset-0 bg-black/50 z-80"
              onClick={() => onOpenChange?.(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
              dir={dir}
              className={`print-modal fixed transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-4 shadow-lg rounded-md z-90 ${customClass}`}
              onClick={(e) => e.stopPropagation()}
            >
              <DialogPrimitive.Close
                asChild
                className={`absolute  top-10 modal-header ${
                  dir == "rtl" ? "left-6" : "right-6"
                } `}
              >
                {!hideX && (
                  <span className="text-xl font-semibold text-gray-500 dark:text-white cursor-pointer">
                    <X />
                  </span>
                )}
              </DialogPrimitive.Close>
              {title && (
                <DialogPrimitive.Title className="text-xl font-semibold">
                  {title}
                </DialogPrimitive.Title>
              )}
              {description && (
                <DialogPrimitive.Description className="text-sm text-gray-500 dark:text-white">
                  {description}
                </DialogPrimitive.Description>
              )}
              <div className="mt-4">{children}</div>

              {smallModal ? (
                <div className="mt-4 flex justify-end space-x-2 modal-footer">
                  <DialogPrimitive.Close asChild>
                    <Button variant="outline" className="px-8">
                      {t("button.no")}
                    </Button>
                  </DialogPrimitive.Close>
                  {actionButtonLabel && (
                    <Button
                      className="bg-blue-500 text-white px-8 hover:bg-blue-700"
                      disabled={disable || IsLoading}
                      onClick={onSave}
                    >
                      {IsLoading ? (
                        <Loader size="small" color="text-white" />
                      ) : (
                        <span>{actionButtonLabel}</span>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mt-4 flex justify-end gap-2 space-x-2 modal-footer px-4">
                  {cancelButtonLabel && (
                    <DialogPrimitive.Close asChild>
                      <Button variant="outline" className="">
                        {cancelButtonLabel}
                      </Button>
                    </DialogPrimitive.Close>
                  )}

                  {sendOTP && (
                    <Button
                      className="bg-blue-500 text-white px-8 hover:bg-blue-700"
                      disabled={disable || IsLoading}
                      onClick={onSendOTP}
                    >
                      {IsLoading ? (
                        <Loader size="small" color="text-white" />
                      ) : (
                        <span>{sendOTP}</span>
                      )}
                    </Button>
                  )}
                  {verifyEmail && (
                    <Button
                      className="bg-blue-500 text-white px-8 hover:bg-blue-700"
                      disabled={disable || IsLoading}
                      onClick={onVerifyEmail}
                    >
                      {IsLoading ? (
                        <Loader size="small" color="text-white" />
                      ) : (
                        <span>{verifyEmail}</span>
                      )}
                    </Button>
                  )}
                  {actionButtonLabel && (
                    <Button
                      className={`bg-blue-500 text-white px-8 hover:bg-blue-700 ${actionButtonClass}`}
                      disabled={disable}
                      onClick={onSave}
                    >
                      {IsLoading ? (
                        <Loader size="small" color="text-white" />
                      ) : (
                        <span>{actionButtonLabel}</span>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
};
