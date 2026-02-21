"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { addMonths, subMonths, format, isAfter, isToday } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import Cancel from "../custom-icons/Cancel";
import { useTranslations } from "next-intl";

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface CustomDateRangePickerProps {
  dateRange: DateRange;
  onDateChange: (range: DateRange) => void;
  customSide?: string;
  customWidth?: string;
}

const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  dateRange,
  onDateChange,
  customSide = "left-0",
  customWidth,
}) => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 61 }, (_, i) => currentYear - 50 + i);
  }, []);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const startDay = firstDay.getDay();
    return Array.from(
      { length: 42 },
      (_, i) =>
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          i - startDay + 1
        )
    );
  }, [currentMonth]);

  const dateRangeInfo = useMemo(() => {
    const fromTime = dateRange.from?.getTime() ?? null;
    const toTime = dateRange.to?.getTime() ?? null;

    return {
      hasRange: fromTime !== null && toTime !== null,
      fromTime,
      toTime,
      sortedFrom: fromTime && toTime && fromTime > toTime ? toTime : fromTime,
      sortedTo: fromTime && toTime && fromTime > toTime ? fromTime : toTime,
    };
  }, [dateRange]);

  const isInRange = useCallback(
    (dayTime: number) =>
      dateRangeInfo.sortedFrom !== null &&
      dateRangeInfo.sortedTo !== null &&
      dayTime > dateRangeInfo.sortedFrom &&
      dayTime < dateRangeInfo.sortedTo,
    [dateRangeInfo]
  );

  const handleDayClick = useCallback(
    (day: Date) => {
      if (!dateRange.from || (dateRange.from && dateRange.to)) {
        onDateChange({ from: day, to: null });
      } else {
        const isAfterFrom = isAfter(day, dateRange.from);
        onDateChange({
          from: isAfterFrom ? dateRange.from : day,
          to: isAfterFrom ? day : dateRange.from,
        });
      }
    },
    [dateRange, onDateChange]
  );

  const clearRange = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDateChange({ from: null, to: null });
    },
    [onDateChange]
  );

  const handlePrevMonth = useCallback(
    () => setCurrentMonth((prev) => subMonths(prev, 1)),
    []
  );
  const handleNextMonth = useCallback(
    () => setCurrentMonth((prev) => addMonths(prev, 1)),
    []
  );
  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const year = parseInt(e.target.value, 10);
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth(), 1, 0, 0, 0, 0)
      );
      setCurrentMonth((prev) => new Date(prev.setFullYear(year)));
    },
    []
  );

  const displayText = useMemo(
    () =>
      dateRange.from && dateRange.to
        ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
            dateRange.to,
            "MMM dd, yyyy"
          )}`
        : null,
    [dateRange]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={calendarRef}>
      <button
        type="button"
        className={`relative w-full flex items-center justify-between p-2.5 rounded-md cursor-pointer app-input ${
          dateRangeInfo.hasRange
            ? `min-w-[200px] ${customWidth ?? ""}`
            : "min-w-[200px]"
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open date range picker"
        aria-expanded={isOpen}
      >
        <div className="flex items-center text-sm">
          <CalendarIcon className="w-4 h-4 mr-2" />
          {displayText || (
            <span className="text-black dark:text-white">
              {t("place_holder.select_date_range")}
            </span>
          )}
        </div>
        {dateRangeInfo.hasRange && (
          <Cancel
            customClass="absolute right-2"
            onClick={clearRange}
            aria-label="Clear date range"
          />
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute z-10 mt-2 w-[200px] md:w-[320px] p-4 bg-white dark:bg-gray-900 shadow-lg border rounded-md ${customSide}`}
          role="dialog"
          aria-label="Date range picker"
        >
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {format(currentMonth, "MMMM")}
              </span>
              <select
                className="rounded px-2 py-1 text-sm app-input cursor-pointer"
                value={currentMonth.getFullYear()}
                onChange={handleYearChange}
                aria-label="Select year"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-sm font-medium text-center text-gray-600 dark:text-white mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="w-8 h-8 flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayTime = day.getTime();
              const fromTime = dateRange.from?.getTime();
              const toTime = dateRange.to?.getTime();
              const isSelected = dayTime === fromTime || dayTime === toTime;
              const inRange = isInRange(dayTime);
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={index}
                  type="button"
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors
                    ${isSelected ? "bg-blue-500 text-white" : ""}
                    ${
                      inRange
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                        : ""
                    }
                    ${
                      !isSelected && !inRange
                        ? "hover:bg-gray-200 dark:hover:bg-gray-700"
                        : ""
                    }
                    ${
                      isCurrentDay
                        ? "border-2 border-blue-500 font-semibold"
                        : ""
                    }`}
                  onClick={() => handleDayClick(day)}
                  aria-label={format(day, "MMMM d, yyyy")}
                  aria-pressed={isSelected}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDateRangePicker;
