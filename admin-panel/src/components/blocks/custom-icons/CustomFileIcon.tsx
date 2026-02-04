import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { File } from "lucide-react";

const CustomFileIcon = ({ onClick, isLoading, disabled }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading || disabled}
          className={` ${
            isLoading
              ? "bg-green-50 border border-green-400 cursor-pointer p-[2px]"
              : disabled
              ? "bg-green-50 border border-green-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-green-500 text-opacity-50"
              : "bg-green-50 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white cursor-pointer p-1.5"
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-green-500" />
          ) : (
            <File width={16} height={16} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-green-500 text-white">File</TooltipContent>
    </Tooltip>
  );
};

export default CustomFileIcon;
