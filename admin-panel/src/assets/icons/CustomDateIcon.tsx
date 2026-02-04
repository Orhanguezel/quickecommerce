import React from "react";

const CustomDateIcon: React.FC = () => {
  return (
    <div>
      <svg
        width="35"
        height="35"
        viewBox="0 0 35 35"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="5" y="7" width="25" height="23" rx="3" fill="#1A73E8" />
        <rect x="9" y="4" width="3" height="6" rx="1" fill="#1A73E8" />
        <rect x="23" y="4" width="3" height="6" rx="1" fill="#1A73E8" />
        <rect x="5" y="14" width="25" height="3" fill="#00B69B" />
        <circle cx="12" cy="20" r="2" fill="white" />
        <circle cx="19" cy="20" r="2" fill="white" />
        <circle cx="26" cy="20" r="2" fill="white" />
        <circle cx="12" cy="26" r="2" fill="white" />
        <circle cx="19" cy="26" r="2" fill="white" />
        <circle cx="26" cy="26" r="2" fill="white" />
      </svg>
    </div>
  );
};

export default CustomDateIcon;
