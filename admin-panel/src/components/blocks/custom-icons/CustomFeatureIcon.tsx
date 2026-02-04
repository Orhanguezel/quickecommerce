import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { Star } from "lucide-react";

const CustomFeatureIcon = ({
  onClick,
  isLoading,
  disabled,
  isFeature,
}: any) => {
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
              : `border border-green-500 cursor-pointer p-1.5 ${
                  isFeature == 1
                    ? "bg-green-500 text-white"
                    : "bg-green-50 text-green-500"
                }`
          } rounded `}
        >
          {isLoading ? (
            <Loader size="sm" color="text-green-500" />
          ) : (
            <Star width={16} height={16} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-green-500 text-white">
        {isFeature == 1 ? "Featured" : "Make Feature"}
      </TooltipContent>
    </Tooltip>
  );
};

export default CustomFeatureIcon;
