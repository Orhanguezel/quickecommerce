"use client";
import { Check } from "lucide-react";
import Image from "next/image";
import React from "react";

interface HeaderSectionProps {
  data: any[];
  sectionIndex: number;
  ID: any;
  handleChange: (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  data,
  sectionIndex,
  handleChange,
  ID,
}) => {
  const headers = [
    { header_number: "01", image: "/images/header_1.png", id: "theme_one" },
    { header_number: "02", image: "/images/header_2.png", id: "theme_two" },
  ];

  // Filter headers based on current id
  const filteredHeaders = headers.filter((header) => header.id === ID);

  const selected = data[0]?.header_number;

  const handleSelect = (headerNumber: string) => {
    handleChange(sectionIndex, 0, "header_number", headerNumber);
  };

  return (
    <div className="space-y-3">
      {filteredHeaders.map((header) => {
        const isSelected = selected === header.header_number;

        return (
          <div
            key={header.header_number}
            className={`grid grid-cols-12 items-center justify-between  cursor-pointer transition shadow-custom rounded bg-white border-2
              ${isSelected ? " border-blue-500 " : " border-white "}
            `}
            onClick={() => handleSelect(header.header_number)}
          >
            <div className="col-span-2 flex flex-col items-center justify-center gap-2">
              <p
                className={`font-medium text-lg ${
                  isSelected ? "text-blue-500" : "text-gray-500"
                }`}
              >
                Header 01
              </p>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-400"
                }`}
              >
                {isSelected && <Check size={14} strokeWidth={3} />}
              </div>
            </div>
            <div className="col-span-10 w-full h-32 relative">
              <Image
                src={header.image}
                alt={`Header ${header.header_number}`}
                fill
                className=""
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HeaderSection;
