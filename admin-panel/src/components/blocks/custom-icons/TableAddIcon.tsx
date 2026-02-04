import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { Plus } from "lucide-react";

const TableAddIcon = ({ onClick, isLoading, disabled, addText }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading || disabled}
          className={` ${
            isLoading
            ? "bg-blue-50 border border-blue-400 cursor-pointer p-[2px]"
            : disabled
            ? "bg-blue-50 border border-blue-400 border-opacity-50 bg-opacity-50 text-blue-500 text-opacity-50 cursor-not-allowed p-1.5"
            : "bg-blue-50 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white cursor-pointer p-1.5"
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-blue-500" />
          ) : (
            <Plus width={16} height={16}  />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-blue-500 text-white">{addText}</TooltipContent>
    </Tooltip>
  );
};

export default TableAddIcon;
