import { useTranslations } from "next-intl";
import React from "react";

interface BadgeProps {
  value: boolean;
}

const PackageBadge: React.FC<BadgeProps> = ({ value }) => {
  const t = useTranslations();
  return (
    <span
      className={`px-4 py-1 rounded-full text-sm font-medium ${
        value
          ? "bg-green-50 border border-green-500 text-green-500"
          : "bg-red-50 border border-red-500 text-red-500"
      }`}
    >
      {value ? t("common.yes") : t("common.no")}
    </span>
  );
};

export default PackageBadge;
