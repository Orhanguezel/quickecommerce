import React from "react";

type PaymentOptionCardProps = {
  isSelected: boolean;
  title: string;
  onClick: () => void;
  imageSrc?: any;
};

const PaymentOptionCard: React.FC<PaymentOptionCardProps> = ({
  isSelected,
  onClick,
  title,
}) => {
  return (
    <div
      className={`flex items-center justify-between relative border-2 rounded-lg p-4 w-full cursor-pointer ${
        isSelected
          ? "border-blue-500"
          : "border-slate-300 hover:border-blue-500"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-center ">
        <div
          className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${
            isSelected
              ? "bg-white border-blue-500"
              : "bg-white border-slate-300"
          }`}
        >
          {isSelected && (
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          )}
        </div>
      </div>
      <div>
        <p className="font-semibold text-blue-500">{title}</p>
      </div>
    </div>
  );
};

export default PaymentOptionCard;
