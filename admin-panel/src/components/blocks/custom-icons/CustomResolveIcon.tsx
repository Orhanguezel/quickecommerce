import Loader from "@/components/molecules/Loader";
import { MessageSquareDot } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";


const CustomResolveIcon = ({ onClick, isLoading, disabled }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={` ${
        isLoading
        ? "bg-yellow-50 border border-yellow-400 cursor-not-allowed p-[2px]"
        : disabled
        ? "bg-yellow-50 border border-yellow-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-yellow-500 text-opacity-50"
        : "bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 hover:border-yellow-400 text-yellow-500 cursor-pointer p-1.5"
      } rounded `}
    >
      {isLoading ? (
        <Loader size="sm" color="text-yellow-500" />
      ) : (
        <MessageSquareDot width={16} height={16} />
      )}
    </button>
    </TooltipTrigger>
      <TooltipContent className="bg-yellow-500 text-white">
        Resolve
      </TooltipContent>
    </Tooltip>
  );
};

export default CustomResolveIcon;
