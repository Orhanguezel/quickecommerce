import React from "react";

interface GoogleplayLogoProps {
  color?: string;  // Optional prop for color
  width?: number;  // Optional prop for width
  height?: number; // Optional prop for height
}

const GoogleplayLogo: React.FC<GoogleplayLogoProps> = ({ color = "black", width = 27, height = 30 }) => {
  return (
    <div>
      <svg width={width} height={height} viewBox="0 0 27 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.19423 1.71466C1.05029 2.01747 0.970306 2.39461 0.970306 2.83732V27.1649C0.970306 27.6086 1.05039 27.9857 1.19449 28.2884L14.4803 15.0007L1.19423 1.71466ZM1.88802 29.0091C2.38466 29.2451 3.04412 29.1877 3.7654 28.7786L19.3833 19.9037L15.1874 15.7078L1.88802 29.0091ZM20.2858 19.392L25.2165 16.5906C26.7532 15.7161 26.7532 14.2872 25.2165 13.4138L20.2836 10.6108L15.8944 15.0007L20.2858 19.392ZM19.3818 10.0984L3.7654 1.22472C3.04409 0.814829 2.3846 0.757854 1.88795 0.994175L15.1873 14.2935L19.3818 10.0984Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

export default GoogleplayLogo;

