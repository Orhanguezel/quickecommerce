import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";

const CustomStatusUpdateIcon = ({ onClick, isLoading, disabled }: any) => {
    const t = useTranslations();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading || disabled}
          className={` ${
            isLoading
              ? "bg-blue-50 border border-blue-400 cursor-not-allowed p-[2px]"
              : disabled
              ? "bg-blue-50 border border-blue-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-blue-500 text-opacity-50"
              : "bg-blue-50 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white cursor-pointer p-1.5"
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-blue-500" />
          ) : (
            <Settings2 width={16} height={16} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-blue-500 text-white">{t("tooltip.status_update")}</TooltipContent>
    </Tooltip>
  );
};

export default CustomStatusUpdateIcon;
