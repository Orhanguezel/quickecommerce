import { AppModal } from "@/components/blocks/common/AppModal";
import { Textarea } from "@/components/ui";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

interface RejectConfirmModalProps {
  trigger: any;
  loading?: boolean;
  title?: string;
  subTitle?: string;
  name?: any; // <-- product name
  lang?: string; // <-- language id or label
  onSave?: (prompt: string) => void;
  categories?: string[];
  isModalOpen?: any;
  setIsModalOpen?: any;
}

const ProductDescriptionGenerateModal: React.FC<RejectConfirmModalProps> = ({
  onSave,
  trigger,
  loading,
  title,
  subTitle,
  name,
  lang,
  categories = [],
  setIsModalOpen,
  isModalOpen,
}) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [prompts, setPrompts] = useState("");
  const defaultSentence = name
    ? `Generate a product description for "${name}". This product belongs to the following categories: ${categories.join(
        " > "
      )}.`
    : "";

  const handleSave = () => {
    if (onSave && prompts.trim() !== "") {
      onSave(prompts);
    } else {
    }
  };

  useEffect(() => {
    setPrompts(defaultSentence ?? "");
  }, [defaultSentence]);

  const handleRejectReason = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setPrompts(value);
  };
  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    return isMobile;
  };

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel={
        useIsMobile() ? "Generate" : "Generate Product Description"
      }
      customClass="inset-x-0p md:inset-x-10p lg:inset-x-20p xl:inset-x-30p top-[100px] md:top-[150px]  lg:top-[150px] "
      onSave={() => handleSave()}
      disable={loading || prompts === ""}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <div className="p-2">
        <h1 className="text-xl font-bold mb-6">Lets get started !</h1>
        {name && (
          <p className="text-sm mb-2">
            Description for: <span className="font-semibold">{name}</span>
          </p>
        )}
        {loading ? (
          <div className="bg-black flex flex-col items-center justify-center py-10 rounded min-h-48">
            <img
              src="/images/GPT AI.gif"
              alt="Generating description..."
              className="w-16 h-16"
            />
            <p className="mt-3 text-sm text-gray-200">
              Generating description...
            </p>
          </div>
        ) : (
          <div>
            <Textarea
              id="prompt"
              defaultValue={prompts}
              className="app-input min-h-48"
              placeholder="Press / to search prompts..."
              onChange={(e) => {
                handleRejectReason(e);
              }}
            />
          </div>
        )}
      </div>
    </AppModal>
  );
};

export default ProductDescriptionGenerateModal;
