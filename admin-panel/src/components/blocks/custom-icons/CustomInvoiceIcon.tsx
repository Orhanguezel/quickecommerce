import Loader from "@/components/molecules/Loader";
import { FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";

const CustomInvoiceIcon = ({ onClick, isLoading, disabled }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading || disabled}
          className={` ${
            isLoading
              ? "bg-gray-50 border border-gray-400 cursor-pointer p-[2px]"
              : disabled
              ? "bg-gray-50 border border-gray-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-gray-500 dark:text-white text-opacity-50"
              : "bg-gray-50 border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white cursor-pointer p-1.5"
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-gray-500 dark:text-white" />
          ) : (
            <FileText width={16} height={16} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-gray-500 text-white">
        Invoice
      </TooltipContent>
    </Tooltip>
  );
};

export default CustomInvoiceIcon;
