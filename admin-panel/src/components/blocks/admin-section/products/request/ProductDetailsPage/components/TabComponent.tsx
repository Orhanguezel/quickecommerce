"use client";
import { JSX, useState } from "react";
import DynamicDescription from "./DynamicDescription";
import DynamicSpecification from "./DynamicSpecification";

const TabComponent = ({
  description = "Description",
  specification,
}: {
  description: string;
  specification?: any[];
  reviewsData: any[];
  refetch: () => {};
  id: string;
  store_id: string;
}) => {
  const [activeTab, setActiveTab] = useState<"Description" | "Specification">(
    "Description"
  );

  const tabContent: Record<"Description" | "Specification", JSX.Element> = {
    Description: (
      <>
        <DynamicDescription info={description} />
      </>
    ),
    Specification: (
      <>
        <DynamicSpecification info={specification ?? []} />
      </>
    ),
  };

  return (
    <div className="font-sans">
      <div className="flex flex-wrap border-b border-gray-300 mb-4 justify-center sm:justify-start">
        {(["Description", "Specification"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 text-center font-medium transition-all duration-300 ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600 dark:text-gray-400 hover:text-blue-500"
            } w-full sm:w-auto`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4 rounded-md">{tabContent[activeTab]}</div>
    </div>
  );
};

export default TabComponent;
