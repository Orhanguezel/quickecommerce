import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { Trash2 } from "lucide-react";

const Delete = ({ onClick, isLoading, disabled }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading || disabled}
          className={` ${
            isLoading
              ? "bg-red-50 border border-red-400 cursor-pointer p-[2px]"
              : disabled
              ? "bg-red-50 border border-red-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-red-500 text-opacity-50"
              : "bg-red-50 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer p-1.5"
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-red-500" />
          ) : (
            <Trash2 width={16} height={16} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-red-500 text-white">Delete</TooltipContent>
    </Tooltip>
  );
};

export default Delete;
