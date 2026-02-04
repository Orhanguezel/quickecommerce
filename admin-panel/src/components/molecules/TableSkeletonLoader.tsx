import React from "react";

const TableSkeletonLoader = () => {
  return (
    <div className=" pt-6 relative animate-pulse">
      <div className=" rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 bg-[#f7faf8] dark:bg-gray-800 h-[72px] items-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-6 w-24 mx-4 bg-[#d7dade] dark:bg-gray-700 rounded"
            />
          ))}
        </div>

        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid grid-cols-6 items-center h-12 ${
              rowIndex % 2 === 1
                ? "bg-[#fafcfc]"
                : "bg-white dark:bg-transparent"
            }`}
          >
            {Array.from({ length: 6 }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 w-20 mx-4 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="h-10 w-[120px] bg-gray-200 dark:bg-gray-700 rounded" />

          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSkeletonLoader;
