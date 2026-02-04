import TableEditIcon from "@/assets/icons/TableEditIcon";
import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import React from "react";

const TableEdit = React.forwardRef<HTMLButtonElement, any>(
  ({ onClick, isLoading, disabled }, ref) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={ref}
            onClick={onClick}
            disabled={isLoading || disabled}
            className={` ${
              isLoading
                ? "bg-slate-50 border border-slate-400 cursor-pointer p-[2px]"
                : disabled
                ? "bg-slate-50 border border-slate-400 border-opacity-50 bg-opacity-50 text-slate-500 text-opacity-50 cursor-not-allowed p-1.5"
                : "bg-slate-50 border border-slate-500 text-slate-500 hover:bg-slate-500 hover:text-white cursor-pointer p-1.5"
            } rounded `}
          >
            {isLoading ? (
              <Loader size="sm" color="text-slate-500" />
            ) : (
              <TableEditIcon />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-[#627D98] text-white">Edit</TooltipContent>
      </Tooltip>
    );
  }
);

TableEdit.displayName = "TableEdit";

export default TableEdit;
