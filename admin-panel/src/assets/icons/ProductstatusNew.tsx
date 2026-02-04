import React from "react";

interface ProductStatusProps {
  width?: number;
  height?: number;
  text: string;
  fontSize?: number;
  locale?: string;
}

const sizeClasses = (width?: number, height?: number) => {
  const w = width || 75;
  const h = height || 24;

  const wClass = w === 75 ? "w-[75px]" : `w-[${w}px]`;
  const hClass = h === 24 ? "h-[24px]" : `h-[${h}px]`;

  return `${wClass} ${hClass}`;
};

const fontSizeClass = (fontSize?: number) => {
  const size = fontSize || 12;
  return `text-[${size}px]`;
};

const ProductstatusNew: React.FC<ProductStatusProps> = ({
  width = 75,
  height = 24,
  text,
  fontSize = 12,
  locale = "en",
}) => {
  return (
    <div
      className={`relative flex items-center justify-center text-white font-semibold leading-none ${sizeClasses(
        width,
        height
      )}`}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 67 24"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0 w-full h-full"
      >
        <path
          d="M0 22.9351V16.4191C3.66667 15.5811 11 15.659 11 19.9052C11 23.8357 4.71669 24.2396 0.874224 23.9086C0.372503 23.8654 0 23.4386 0 22.9351Z"
          fill="url(#paint0_linear_215_302)"
        />
        <path
          d="M0 18.3516V3C0 1.34315 1.34315 0 3 0H66.5603L59.9043 10.9149L66.5603 21.3515L3 21.3516C1.34315 21.3516 0 20.0084 0 18.3516Z"
          fill="url(#paint1_linear_215_302)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_215_302"
            x1="3.68374"
            y1="21.411"
            x2="9.77741"
            y2="22.7462"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#13606D" />
            <stop offset="0.917456" stopColor="#F4FDFF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_215_302"
            x1="0"
            y1="10.6758"
            x2="66.5603"
            y2="10.6758"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#13606D" />
            <stop offset="0.663462" stopColor="#2FA6BA" />
          </linearGradient>
        </defs>
      </svg>
      <span
        className={`z-10 absolute leading-none ${fontSizeClass(fontSize)} ${
          locale === "ar" ? "top-[3px] right-[26px]" : "top-[4px] right-[12px]"
        }`}
      >
        {text}
      </span>
    </div>
  );
};

export default ProductstatusNew;
