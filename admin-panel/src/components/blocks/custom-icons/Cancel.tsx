import CancelIcon from "@/assets/icons/CancelIcon";
import React from "react";

const Cancel = ({ onClick, customClass }: any) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#CFCFCF70] hover:bg-gray-400 p-2 rounded cursor-pointer ${customClass}`}
    >
      <CancelIcon />
    </div>
  );
};

export default Cancel;
