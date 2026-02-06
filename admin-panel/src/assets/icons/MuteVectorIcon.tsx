import React from "react";

interface VectorIconProps {
  w?: string;
  h?: string;
}

const MuteVectorIcon: React.FC<VectorIconProps> = ({
  w = "20",
  h = "20",
}) => {
  return (
    <span className="inline-flex">
      <svg
        width={w}
        height={h}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle with slate color */}
        <circle cx="10" cy="10" r="10" fill="#94A3B8" />

        {/* Cross (X) icon */}
        <path
          d="M13.5303 6.46967C13.8232 6.76256 13.8232 7.23744 13.5303 7.53033L11.0607 10L13.5303 12.4697C13.8232 12.7626 13.8232 13.2374 13.5303 13.5303C13.2374 13.8232 12.7626 13.8232 12.4697 13.5303L10 11.0607L7.53033 13.5303C7.23744 13.8232 6.76256 13.8232 6.46967 13.5303C6.17678 13.2374 6.17678 12.7626 6.46967 12.4697L8.93934 10L6.46967 7.53033C6.17678 7.23744 6.17678 6.76256 6.46967 6.46967C6.76256 6.17678 7.23744 6.17678 7.53033 6.46967L10 8.93934L12.4697 6.46967C12.7626 6.17678 13.2374 6.17678 13.5303 6.46967Z"
          fill="#FFFFFF"
        />
      </svg>
    </span>
  );
};

export default MuteVectorIcon;
