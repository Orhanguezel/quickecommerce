import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { SquareCheck } from "lucide-react";

const CustomApproveIcon = ({ onClick, isLoading, disabled }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading || disabled}
          className={` ${
            isLoading
              ? "bg-teal-50 border border-teal-400 cursor-pointer p-[2px]"
              : disabled
              ? "bg-teal-50 border border-teal-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-teal-500 text-opacity-50"
              : "bg-teal-50 border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white cursor-pointer p-1.5"
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-teal-500" />
          ) : (
            <SquareCheck width={16} height={16} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-teal-500 text-white">
        Approve
      </TooltipContent>
    </Tooltip>
  );
};

export default CustomApproveIcon;
