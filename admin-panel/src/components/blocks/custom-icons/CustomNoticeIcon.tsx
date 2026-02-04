import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { MessageSquareWarning } from "lucide-react";
import { useTranslations } from "next-intl";

const CustomNoticeIcon = ({ onClick, isLoading, disabled }: any) => {
  const t = useTranslations();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={` ${
        isLoading
          ? "bg-rose-50 border border-rose-400 cursor-pointer p-[2px]"
          : disabled
          ? "bg-rose-50 border border-rose-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-rose-500 text-opacity-50"
          : "bg-rose-50 border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white cursor-pointer p-1.5"
      } rounded `}
    >
      {isLoading ? (
        <Loader size="sm" color="text-rose-500" />
      ) : (
        <MessageSquareWarning width={16} height={16} />
      )}
    </button>
    </TooltipTrigger>
      <TooltipContent className="bg-rose-500 text-white">{t("tooltip.view")}</TooltipContent>
    </Tooltip>
  );
};

export default CustomNoticeIcon;
