"use client";
import React from "react";

interface DynamicDescriptionProps {
  info: string;
}

const DynamicDescription: React.FC<DynamicDescriptionProps> = ({ info }) => {
  const isHTML = /<[^>]*>/g.test(info);

  return (
    <div className="description-container p-4">
      <div className="info-section text-gray-700 dark:text-white mb-4">
        {isHTML ? (
          <div
            className="tiptap text-[16px] sm:text-base"
            dangerouslySetInnerHTML={{ __html: info }}
          />
        ) : (
          <p className="text-[16px] sm:text-base">{info}</p>
        )}
      </div>
    </div>
  );
};

export default DynamicDescription;
