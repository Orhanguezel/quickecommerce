"use client";

import {
  addMonths,
  format,
  isSameDay,
  isToday,
  subMonths,
  startOfMonth,
} from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Cancel from "../custom-icons/Cancel";

interface Props {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  maxDate?: Date;
  minDate?: Date;
}

const CustomSingleDatePicker: React.FC<Props> = ({
  selectedDate,
  onChange,
  label,
  maxDate,
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleToggleCalendar = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev && selectedDate) setCurrentMonth(selectedDate);
      return !prev;
    });
  }, [selectedDate]);

  const handleDayClick = useCallback(
    (day: Date) => {
      if ((maxDate && day > maxDate) || (minDate && day < minDate)) return;
      onChange(day);
      setIsOpen(false);
    },
    [onChange, maxDate, minDate]
  );

  const clearDate = useCallback(() => onChange(null), [onChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const firstDayOfMonth = useMemo(
    () => startOfMonth(currentMonth),
    [currentMonth]
  );

  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  const daysArray = useMemo(() => {
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        index - firstDayOfMonth.getDay() + 1
      );

      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isCurrentDay = isToday(day);
      const isDisabled =
        (maxDate && day > maxDate) || (minDate && day < minDate);

      return { day, isSelected, isCurrentDay, isDisabled };
    });
  }, [currentMonth, firstDayOfMonth, selectedDate, maxDate, minDate]);

  return (
    <div className="w-full relative" ref={calendarRef}>
      {label && <p className="text-sm font-medium mb-1">{label}</p>}

      <button
        type="button"
        className="relative w-full flex items-center justify-between p-2.5 rounded-md app-input cursor-pointer"
        onClick={handleToggleCalendar}
      >
        <div className="flex items-center text-sm">
          <CalendarIcon className="w-4 h-4 mr-2" />
          {selectedDate ? (
            format(selectedDate, "MMM dd, yyyy")
          ) : (
            <span className="text-gray-500 dark:text-white">Select a date</span>
          )}
        </div>

        {selectedDate && (
          <Cancel
            customClass="absolute right-2"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              clearDate();
            }}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 w-[300px] p-4 bg-white shadow-lg border rounded-md">
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {format(currentMonth, "MMMM")}
              </span>
              <select
                className="rounded px-2 py-1 text-sm app-input cursor-pointer"
                value={currentYear}
                onChange={(e) => {
                  const newYear = parseInt(e.target.value);
                  setCurrentMonth(new Date(newYear, currentMonthIndex, 1));
                }}
              >
                {Array.from({ length: 100 }, (_, i) => {
                  const year = new Date().getFullYear() - 50 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-sm font-medium text-center text-gray-600 dark:text-white mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="w-8 h-8">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysArray.map(
              ({ day, isSelected, isCurrentDay, isDisabled }, idx) => (
                <button
                  key={idx}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${isSelected ? "bg-blue-500 text-white" : ""}
                  ${!isSelected && !isDisabled ? "hover:bg-gray-200" : ""}
                  ${isCurrentDay ? "border border-blue-500 font-semibold" : ""}
                  ${isDisabled ? "text-gray-400 cursor-not-allowed" : ""}`}
                  onClick={() => handleDayClick(day)}
                  disabled={isDisabled}
                >
                  {format(day, "d")}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSingleDatePicker;
