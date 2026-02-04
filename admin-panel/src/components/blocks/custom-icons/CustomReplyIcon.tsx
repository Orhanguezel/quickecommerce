import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { MessageSquareQuote } from "lucide-react";

const CustomReplyIcon = ({ onClick, isLoading, disabled }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading || disabled}
          className={` ${
            isLoading
            ? "bg-teal-50 border border-teal-400 cursor-not-allowed p-[2px]"
            : disabled
            ? "bg-teal-50 border border-teal-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-teal-500 text-opacity-50"
            : "bg-teal-50 hover:bg-teal-100 border border-teal-300 hover:border-teal-400 text-teal-500 cursor-pointer p-1.5"
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-teal-500" />
          ) : (
            <MessageSquareQuote width={16} height={16}  />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-teal-500 text-white">Reply </TooltipContent>
    </Tooltip>
  );
};

export default CustomReplyIcon;
