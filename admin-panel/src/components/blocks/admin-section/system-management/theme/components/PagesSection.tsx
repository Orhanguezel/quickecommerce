"use client";
import React from "react";
import ThemeHomePage from "./ThemeHomePage";
import ThemeRegisterPage from "./ThemeRegisterPage";
import ThemeLoginPage from "./ThemeLoginPage";
import ThemeBlogPage from "./ThemeBlogPage";
import ThemeProductDetailsPage from "./ThemeProductDetailsPage";
import ThemePopupSettings from "./ThemePopupSettings";
import ThemeSideBannerSettings from "./ThemeSideBannerSettings";

interface PagesSectionProps {
  allData: any[];
  data: any[];
  sectionIndex: number;
  refetch: any;
  handleChange: (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => void;
  selectedChild?: string;
}

const PagesSection: React.FC<PagesSectionProps> = ({
  allData,
  refetch,
  data,
  sectionIndex,
  handleChange,
  selectedChild,
}) => {
  if (!data || data.length === 0 || !selectedChild) return null;

  if (!Array.isArray(data)) return null;

  switch (selectedChild) {
    case "theme_home_page":
      return (
        <ThemeHomePage
          allData={allData}
          refetch={refetch}
          data={data}
          sectionIndex={sectionIndex}
          handleChange={handleChange}
        />
      );
    case "theme_login_page":
      return (
        <ThemeLoginPage
          allData={allData}
          refetch={refetch}
          data={data}
          sectionIndex={sectionIndex}
          handleChange={handleChange}
        />
      );

    case "theme_register_page":
      return (
        <ThemeRegisterPage
          allData={allData}
          refetch={refetch}
          data={data}
          sectionIndex={sectionIndex}
          handleChange={handleChange}
        />
      );
    case "theme_blog_page":
      return (
        <ThemeBlogPage
          allData={allData}
          refetch={refetch}
          data={data}
          sectionIndex={sectionIndex}
          handleChange={handleChange}
        />
      );
    case "theme_product_details_page":
      return (
        <ThemeProductDetailsPage
          allData={allData}
          refetch={refetch}
          data={data}
          sectionIndex={sectionIndex}
          handleChange={handleChange}
        />
      );
    case "theme_popup_settings":
      return (
        <ThemePopupSettings
          allData={allData}
          refetch={refetch}
          data={data}
          sectionIndex={sectionIndex}
          handleChange={handleChange}
        />
      );
    case "theme_side_banner_settings":
      return (
        <ThemeSideBannerSettings
          allData={allData}
          refetch={refetch}
        />
      );

    default:
      return (
        <p className="text-sm text-gray-500">
          No editor implemented for <strong>{selectedChild}</strong>
        </p>
      );
  }
};

export default PagesSection;
