import GlobalImageLoader from "@/lib/imageLoader";
import Image from "next/image";
import React from "react";

type PaymentOptionCardProps = {
  isSelected: boolean;
  title: string;
  onClick: () => void;
  imageSrc?: any; // Required image URL to show the image
};

const PaymentOptionCard: React.FC<PaymentOptionCardProps> = ({
  isSelected,
  onClick,
  imageSrc,
  title,
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 relative border-2 rounded-lg px-4 py-2 w-full cursor-pointer dark:bg-white ${
        isSelected
          ? "border-blue-500"
          : "border-slate-300 hover:border-blue-500"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-center">
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
      {imageSrc ? (
        <div className="relative w-20 h-12 flex items-center justify-center">
          <Image
            loader={GlobalImageLoader}
            src={imageSrc}
            alt={title}
            fill
            sizes="96px"
            className="w-full h-full rounded"
          />
        </div>
      ) : (
        <div>
          <p className="text-sm font-bold text-blue-500">{title}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentOptionCard;
