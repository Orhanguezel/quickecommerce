import React from "react";

interface ReviewIconProps {
  fillPercentage: number; // 0 (empty), 50 (half-filled), 100 (full)
}

const ReviewIcon: React.FC<ReviewIconProps> = ({ fillPercentage }) => {
  return (
    <div className="relative">
      {/* Full Star */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={fillPercentage === 0 ? "text-gray-300" : "text-[#FA8232]"}
      >
        <defs>
          <clipPath id="halfStar">
            <rect width="50%" height="100%" />
          </clipPath>
        </defs>

        {/* Empty Star (Gray) */}
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill="currentColor"
          className="text-gray-300"
        />

        {/* Half or Full Star Overlay (Amber) */}
        {fillPercentage > 0 && (
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="currentColor"
            className="text-[#FA8232]"
            clipPath={fillPercentage === 50 ? "url(#halfStar)" : ""}
          />
        )}
      </svg>
    </div>
  );
};

export default ReviewIcon;
