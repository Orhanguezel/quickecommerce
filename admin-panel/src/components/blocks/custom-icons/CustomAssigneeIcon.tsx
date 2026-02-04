import AssigneeIcon from "@/assets/icons/AssigneeIcon";
import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";

const CustomAssigneeIcon = ({ onClick, isLoading, disabled }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading || disabled}
          className={` ${
            isLoading
              ? "bg-fuchsia-50 border border-fuchsia-400 cursor-pointer p-[2px]"
              : disabled
              ? "bg-fuchsia-50 border border-fuchsia-400 border-opacity-50 bg-opacity-20 text-fuchsia-500 text-opacity-50 cursor-not-allowed p-1.5"
              : "bg-fuchsia-50 border border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-white cursor-pointer p-1.5"
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-fuchsia-500" />
          ) : (
            <AssigneeIcon />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-fuchsia-500 text-white">
        Assign
      </TooltipContent>
    </Tooltip>
  );
};

export default CustomAssigneeIcon;
