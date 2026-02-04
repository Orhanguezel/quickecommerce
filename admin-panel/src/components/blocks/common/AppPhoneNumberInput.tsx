import { useLocale } from "next-intl";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

const AppPhoneNumberInput: React.FC<PhoneNumberInputProps> = React.memo(
  ({ value, onChange, height = "40px" }) => {
    const [phone, setPhone] = useState(value);
    const locale = useLocale();

    useEffect(() => {
      if (value !== phone) setPhone(value);
    }, [value, phone]);

    const handleOnChange = useCallback(
      (val: string) => {
        setPhone(val);
        onChange(val);
      },
      [onChange]
    );

    const inputClass = useMemo(
      () =>
        `border border-slate-300 dark:border-gray-600 rounded-md p-2 !w-full 
         ${locale === "ar" ? "!text-right !pr-14" : "!text-left !ml-3"}
         bg-white text-black dark:bg-gray-800 dark:text-white
         placeholder-gray-400 dark:placeholder-gray-500`,
      [locale]
    );

    const buttonClass = useMemo(
      () =>
        `rounded-md !bg-white dark:!bg-[#1e293b] dark:hover:bg-gray-900 dark:!border-[#475569] !w-[50px] 
         ${locale === "ar" ? "!border-l" : "!border-r"} dark:border-gray-600`,
      [locale]
    );

    const containerClass = useMemo(
      () => (locale === "ar" ? "phone-container-ar" : "phone-container-ltr"),
      [locale]
    );

    return (
      <PhoneInput
        country="us"
        value={phone}
        onChange={handleOnChange}
        enableSearch
        inputClass={inputClass}
        buttonClass={buttonClass}
        dropdownClass="bg-white dark:bg-gray-900 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-md text-black dark:text-white"
        containerClass={containerClass}
        placeholder="Enter phone number"
        inputStyle={{ height }}
      />
    );
  }
);

AppPhoneNumberInput.displayName = "AppPhoneNumberInput";

export default AppPhoneNumberInput;
