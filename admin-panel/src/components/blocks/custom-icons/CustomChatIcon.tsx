import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { MessageCircle } from "lucide-react";

const CustomChatIcon = ({ onClick, isLoading, disabled }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading || disabled}
          className={` ${
            isLoading
              ? "bg-cyan-50 border border-cyan-400 cursor-pointer p-[2px]"
              : disabled
              ? "bg-cyan-50 border border-cyan-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-cyan-500 text-opacity-50"
              : "bg-cyan-50 border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white cursor-pointer p-1.5"
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-cyan-500" />
          ) : (
            <MessageCircle width={16} height={16} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-cyan-500 text-white">View </TooltipContent>
    </Tooltip>
  );
};

export default CustomChatIcon;
