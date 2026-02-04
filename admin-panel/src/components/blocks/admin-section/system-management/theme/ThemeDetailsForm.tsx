"use client";
import Loader from "@/components/molecules/Loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useThemeStoreMutation } from "@/modules/admin-section/theme/theme.action";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import FooterSection from "./components/FooterSection";
import HeaderSection from "./components/HeaderSection";
import PagesSection from "./components/PagesSection";
import StyleSection from "./components/StyleSection";

type ThemeData = {
  name: string;
  slug: string;
  description: string;
  version: string;
  theme_style?: any[];
  theme_header?: any[];
  theme_footer?: any[];
  theme_homepage?: any[];
  theme_pages?: any[];
};

const ThemeDetailsForm = ({ ThemeDetails, refetch, ID }: any) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<any[]>([]);
  const [expandedParents, setExpandedParents] = useState<string[]>([]);
  const data = ThemeDetails?.theme_data;

  const sections = Object.keys(data).filter((key) => key.startsWith("theme_"));

  useEffect(() => {
    if (sections.length && !selectedKey) {
      setSelectedKey(sections[0]);
    }
  }, [sections, selectedKey]);

  useEffect(() => {
    if (!selectedKey) return;

    const [parent, child] = selectedKey.split(".");

    if (child) {
      const parentData = data[parent as keyof ThemeData];

      if (Array.isArray(parentData) && parentData.length > 0) {
        const childData = parentData[0][child];
        if (childData) {
          setFormValues(JSON.parse(JSON.stringify(childData)));
        }
      }
    } else {
      const sectionData = data[selectedKey as keyof ThemeData];
      if (sectionData) {
        setFormValues(JSON.parse(JSON.stringify(sectionData)));
      }
    }
  }, [selectedKey, data]);

  const handleChange = (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => {
    const updated = [...formValues];

    if (updated[itemIndex]?.colors?.[0]) {
      updated[itemIndex].colors[0] = {
        ...updated[itemIndex].colors[0],
        [field]: value,
      };
    } else {
      updated[itemIndex] = {
        ...updated[itemIndex],
        [field]: value,
      };
    }

    setFormValues(updated);
  };

  const toggleExpand = (key: string) => {
    setExpandedParents((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const { mutate: ThemeStore, isPending } = useThemeStoreMutation();
  const handleSubmit = () => {
    if (!selectedKey) return;

    const [parent, child] = selectedKey.split(".");

    let updatedData = { ...data };

    if (child) {
      const parentData = data[parent as keyof ThemeData];
      const newParentData = Array.isArray(parentData) ? [...parentData] : [{}];
      if (newParentData.length === 0) newParentData.push({});

      newParentData[0][child] = formValues;
      //@ts-ignore
      updatedData[parent] = newParentData;
    } else {
      //@ts-ignore
      updatedData[selectedKey] = formValues;
    }

    const payload = {
      theme_data: updatedData,
    };

    ThemeStore(payload as any, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const parentKey = selectedKey?.split(".")[0];
  const childKey = selectedKey?.split(".")[1];

  return (
    <Card className="grid grid-cols-12  mt-4 ">
      {/* Sidebar */}
      <div className="col-span-2 p-4  border-r">
        <ul className="space-y-2">
          {sections.map((key) => {
            const sectionData = data[key as keyof ThemeData];
            const childKeys =
              Array.isArray(sectionData) && sectionData.length
                ? Object.keys(sectionData[0]).filter((k) =>
                    k.startsWith("theme_")
                  )
                : [];

            const hasChildren = childKeys.length > 0;
            const isExpanded = expandedParents.includes(key);

            // If a child is selected, expand parent
            const parentSelected = childKeys.some(
              (childKey) => selectedKey === `${key}.${childKey}`
            );

            return (
              <li key={key}>
                <button
                  onClick={() => {
                    if (hasChildren) {
                      // Toggle parent
                      toggleExpand(key);
                    } else {
                      setSelectedKey(key);
                      // Close other expanded parents
                      setExpandedParents([]);
                    }
                  }}
                  className={`w-full text-left capitalize px-3 py-2 flex justify-between items-center font-semibold ${
                    selectedKey === key || parentSelected
                      ? "bg-blue-50 text-blue-500"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  {key.replace("theme_", "").replace("_", " ")}
                  {hasChildren && (
                    <span
                      className={`transition-transform duration-200 ${
                        isExpanded || parentSelected ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown />
                    </span>
                  )}
                </button>

                {hasChildren && (isExpanded || parentSelected) && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {childKeys.map((childKey) => (
                      <li key={childKey}>
                        <button
                          onClick={() => {
                            setSelectedKey(`${key}.${childKey}`);
                            // Ensure parent stays expanded
                            if (!expandedParents.includes(key))
                              toggleExpand(key);
                          }}
                          className={`w-full text-left capitalize px-3 py-2 rounded text-sm font-semibold ${
                            selectedKey === `${key}.${childKey}`
                              ? "bg-blue-50 text-blue-500"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-500"
                          }`}
                        >
                          {childKey.replace("theme_", "").replace(/_/g, " ")}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Content */}
      <div className="col-span-10 p-4 flex flex-col min-h-[calc(100vh-18rem)] bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold capitalize">
            {selectedKey
              ? `${selectedKey
                  .replace("theme_", "")
                  .replace(".", " > ")
                  .replace("theme_", "")
                  .replace("_", " ")
                  .replace("_", " ")} Settings`
              : "Details"}
          </h2>
        </div>

        {selectedKey ? (
          <div className="space-y-4">
            {selectedKey.startsWith("theme_style") && (
              <StyleSection
                data={formValues}
                sectionIndex={0}
                handleChange={handleChange}
              />
            )}
            {selectedKey.startsWith("theme_header") && (
              <HeaderSection
                data={formValues}
                sectionIndex={0}
                handleChange={handleChange}
                ID={ID}
              />
            )}
            {selectedKey.startsWith("theme_footer") && (
              <FooterSection
                data={formValues}
                sectionIndex={0}
                handleChange={handleChange}
              />
            )}
            {selectedKey.startsWith("theme_pages") && (
              <PagesSection
                allData={ThemeDetails}
                refetch={refetch}
                data={formValues}
                sectionIndex={0}
                handleChange={handleChange}
                selectedChild={childKey}
              />
            )}
          </div>
        ) : (
          <p className="text-gray-500">Select a section to edit details</p>
        )}
        {childKey !== "theme_home_page" &&
          childKey !== "theme_product_details_page" &&
          childKey !== "theme_login_page" &&
          childKey !== "theme_blog_page" &&
          childKey !== "theme_register_page" && (
            <Card className="mt-4 sticky bottom-0 w-full p-4">
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="app-button text-sm flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <Loader size="small" />
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </Card>
          )}
      </div>
    </Card>
  );
};

export default ThemeDetailsForm;
