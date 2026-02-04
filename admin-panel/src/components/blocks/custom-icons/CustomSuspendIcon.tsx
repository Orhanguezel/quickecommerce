import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { Ban } from "lucide-react";

const CustomSuspendIcon = ({ onClick, isLoading, disabled }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading || disabled}
          className={` ${
            isLoading
              ? "bg-amber-50 border border-amber-400 cursor-pointer p-[2px]"
              : disabled
              ? "bg-amber-50 border border-amber-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-amber-500 text-opacity-50"
              : "bg-amber-50 border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white cursor-pointer p-1.5"
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-amber-500" />
          ) : (
            <Ban width={16} height={16}  />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-amber-500 text-white">
        Suspend
      </TooltipContent>
    </Tooltip>
  );
};

export default CustomSuspendIcon;
