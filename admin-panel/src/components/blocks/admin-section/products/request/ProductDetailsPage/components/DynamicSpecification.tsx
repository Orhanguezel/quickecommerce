import React from "react";

interface SpecificationProps {
  info: { name: string; value: string }[];
}

export default function DynamicSpecification({ info }: SpecificationProps) {
  return (
    <div className="overflow-x-auto">
      <div className="w-full">
        {info
          .reduce((rows: { name: string; value: string }[][], item, index) => {
            if (index % 2 === 0) {
              rows.push([item]); // start new row
            } else {
              rows[rows.length - 1].push(item); // add to last row
            }
            return rows;
          }, [])
          .map((row, rowIndex) => {
            const isEven = rowIndex % 2 === 0;

            return (
              <div key={rowIndex} className="grid grid-cols-6">
                {row.map((item, colIndex) => (
                  <React.Fragment key={colIndex}>
                    <div
                      className={`p-3 font-medium border-[0.5px] border-gray-200 dark:border-gray-700 col-span-1
                        ${
                          isEven
                            ? "bg-[#FEFEFE] dark:bg-gray-800"
                            : "bg-[#F3F3F3] dark:bg-gray-700"
                        }`}
                    >
                      {item.name}
                    </div>

                    <div
                      className={`p-3 border-[0.5px] border-gray-200 dark:border-gray-700 col-span-2
                        ${
                          isEven
                            ? "bg-[#FEFEFE] dark:bg-gray-900"
                            : "bg-[#F8F8F8] dark:bg-gray-800"
                        }`}
                    >
                      {item.value}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            );
          })}
      </div>
    </div>
  );
}
