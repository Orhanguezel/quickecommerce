"use client";
import React from "react";
import { Spinner } from "../ui/spinner";

const Loader = ({customClass, size, color}: any) => {
  return (
    <div className={`flex justify-center items-center text-blue-500 ${customClass}`}>
      <Spinner size={size} className={`text-blue-500 ${color}`} />
    </div>
  );
};

export default Loader;
