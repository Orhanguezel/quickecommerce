"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface CountdownTimerProps {
  endTime: string;
  bgColor?: string;
  textColor?: string;
  labelColor?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endTime: string): TimeLeft {
  const difference = new Date(endTime).getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function CountdownTimer({
  endTime,
  bgColor = "#0a3eb5",
  textColor = "#ffffff",
  labelColor,
}: CountdownTimerProps) {
  const t = useTranslations("common");
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(endTime));

    timerRef.current = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endTime);
      setTimeLeft(newTimeLeft);

      if (Object.values(newTimeLeft).every(val => val === 0)) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [endTime]);

  const display = timeLeft ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const timeUnits = [
    { value: display.days, label: "days" },
    { value: display.hours, label: "hours" },
    { value: display.minutes, label: "minutes" },
    { value: display.seconds, label: "seconds" },
  ];

  return (
    <div className="flex gap-1.5">
      {timeUnits.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          {/* Flutter: height 28, padding h4, borderRadius 5, boxShadow */}
          <div
            className="flex h-7 min-w-[28px] items-center justify-center rounded-[5px] px-1 shadow-[0_4px_6px_rgba(0,0,0,0.1)]"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            <span className="text-sm font-bold leading-none md:text-xl">
              {String(unit.value).padStart(2, "0")}
            </span>
          </div>
          {/* Flutter: label 8px w600, letterSpacing 0.2, mt 6 */}
          <span
            className="mt-1.5 text-[7px] font-semibold uppercase tracking-wide md:text-[8px]"
            style={{ color: labelColor || textColor }}
          >
            {t(unit.label)}
          </span>
        </div>
      ))}
    </div>
  );
}
