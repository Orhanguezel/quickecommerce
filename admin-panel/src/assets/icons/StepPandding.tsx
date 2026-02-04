import React from "react";

interface StepPanddingProps {
  width?: number; // Optional width
  height?: number; // Optional height
  icon?: React.ReactNode; // Icon component
  iconColor?: string; // Icon color
}

const StepPandding: React.FC<StepPanddingProps> = ({
  width = 66,
  height = 66,
  icon,
}) => {
   const iconSizeClass = `text-[${width / 2.5}px]`;
  return (
    <div className={`relative ${width} ${height}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 66 66"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="33.1515" cy="33.2931" r="26.2364" fill="#E6E7E9" />
        <circle
          cx="33.1516"
          cy="33.1516"
          r="31.1516"
          stroke="#babcbf"
          strokeWidth="2.22512"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5.83 5.83"
        />
      </svg>
      {icon && (
        <div
         className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-[#999b9e] ${iconSizeClass}`}
         
        >
          {icon}
        </div>
      )}
    </div>
  );
};

export default StepPandding;
