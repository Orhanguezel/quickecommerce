import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { Bell } from "lucide-react";

const CustomSubscribeIcon = ({ onClick, isLoading, disabled, is_subscribed }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading || disabled}
          className={` ${
            isLoading
              ? "bg-green-50 border border-green-400 cursor-not-allowed p-[2px]"
              : disabled
              ? "bg-green-50 border border-green-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-green-500 text-opacity-50"
              : "bg-green-50 hover:bg-green-100 border border-green-300 hover:border-green-400 text-green-500 cursor-pointer p-1.5"
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-green-500" />
          ) : (
            <Bell width={16} height={16} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-green-500 text-white">
      {`${is_subscribed == 1 ? "Subscribed" : "Unsubscribed"}`}
      </TooltipContent>
    </Tooltip>
  );
};

export default CustomSubscribeIcon;
