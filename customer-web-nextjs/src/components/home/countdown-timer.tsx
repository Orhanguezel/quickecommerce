"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface CountdownTimerProps {
  endTime: string;
  bgColor?: string;
  textColor?: string;
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

export function CountdownTimer({ endTime, bgColor = "#0a3eb5", textColor = "#ffffff" }: CountdownTimerProps) {
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
    <div className="flex gap-2">
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-2">
          <div
            className="flex flex-col items-center justify-center min-w-[50px] h-[50px] rounded-md"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            <span className="text-lg font-bold">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase">
              {t(unit.label)}
            </span>
          </div>
          {index < timeUnits.length - 1 && (
            <span className="text-xl font-bold" style={{ color: textColor }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}
