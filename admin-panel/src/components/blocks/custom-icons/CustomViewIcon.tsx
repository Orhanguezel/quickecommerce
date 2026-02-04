import Loader from "@/components/molecules/Loader";
import { Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { useTranslations } from "next-intl";

const CustomViewIcon = ({ onClick, isLoading, disabled }: any) => {
  const t = useTranslations();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading || disabled}
          className={` ${
            isLoading
              ? "bg-cyan-50 border border-cyan-400 cursor-pointer p-[2px] dark:text-white"
              : disabled
              ? "bg-cyan-50 border border-cyan-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-cyan-500 text-opacity-50 dark:text-white"
              : "bg-cyan-50 border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white cursor-pointer p-1.5 "
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-cyan-500" />
          ) : (
            <Eye width={16} height={16} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-cyan-500 text-white">{t("tooltip.view")}</TooltipContent>
    </Tooltip>
  );
};

export default CustomViewIcon;
