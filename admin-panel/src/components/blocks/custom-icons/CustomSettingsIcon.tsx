import SettingsIcon from "@/assets/icons/SettingsIcon";
import Loader from "@/components/molecules/Loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
const CustomSettingsIcon = ({ onClick, isLoading, disabled }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={` ${
        isLoading
              ? "bg-violet-50 border border-violet-400 cursor-pointer p-[2px]"
              : disabled
              ? "bg-violet-50 border border-violet-400 bg-opacity-50 border-opacity-50 cursor-not-allowed p-1.5 text-violet-500 text-opacity-50"
              : "bg-violet-50 border border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white cursor-pointer p-1.5"
      } rounded `}
    >
      {isLoading ? <Loader size="sm" color="text-violet-500" /> : <SettingsIcon />}
    </button>
    </TooltipTrigger>
    <TooltipContent className="bg-violet-500 text-white">Settings</TooltipContent>
  </Tooltip>
  );
};

export default CustomSettingsIcon;
