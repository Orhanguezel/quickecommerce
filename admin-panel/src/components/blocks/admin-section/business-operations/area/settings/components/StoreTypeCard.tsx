import { Check } from "lucide-react";
import React from "react";

type StoreTypeCardProps = {
  isSelected: boolean;
  title: string;
  onClick: () => void;
  imageSrc?: any;
};

const StoreTypeCard: React.FC<StoreTypeCardProps> = ({
  isSelected,
  onClick,
  title,
}) => {
  return (
    <div
      className={`flex items-center justify-between relative border-2 rounded w-full cursor-pointer p-2 ${
        isSelected
          ? "border-blue-500 bg-blue-50 text-blue-500"
          : "border-slate-300 hover:border-slate-400 text-slate-500 hover:text-slate-600"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div
          className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
            isSelected
              ? "bg-blue-50 border-blue-500"
              : "bg-white border-slate-300"
          }`}
        >
          {isSelected && (
            <Check className="text-blue-500 font-semibold" size={16} />
          )}
        </div>
      </div>
      <p className="font-semibold  capitalize">{title}</p>
    </div>
  );
};

export default StoreTypeCard;
