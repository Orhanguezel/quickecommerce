import React from "react";
interface VectorIconProps {
  w?: string;
  h?: string;
}
const StepIcon: React.FC<VectorIconProps> = ({ w = "20", h = "20" }) => {
  return (
    <div>
      <svg
        width={w}
        height={h}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.75"
          y="0.75"
          width="22.5"
          height="22.5"
          rx="11.25"
          fill="currentColor"
        />
        <rect
          x="0.75"
          y="0.75"
          width="22.5"
          height="22.5"
          rx="11.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
          fill="white"
        />
      </svg>
    </div>
  );
};

export default StepIcon;
