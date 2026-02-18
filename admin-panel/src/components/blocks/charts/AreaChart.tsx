import { addDays, format, parseISO } from "date-fns";
import React, { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import {
  Area,
  AreaChart,
  CartesianGrid,
  DotProps,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

interface SellerData {
  date: string;
  total_sales: string;
}

interface ChartData {
  name: string;
  total_sales: number;
}

interface CustomDotProps extends DotProps {
  index?: number;
}

const CustomDot: React.FC<CustomDotProps> = ({ cx, cy, index }) => {
  return index !== undefined ? (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill="#1A73E8"
      stroke="#FFFFFF"
      strokeWidth={2}
    />
  ) : null;
};

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = (props) => {
  const payload = (props as any).payload as { value: number; name: string }[];

  if (props.active && payload && payload.length > 0) {
    return (
      <div className="relative bg-blue-600 text-white px-4 py-2 rounded shadow text-sm">
        <p className="font-semibold">${payload[0].value}</p>
        <div
          className="absolute left-1/2 -bottom-2 w-0 h-0 
                     border-l-6 border-l-transparent 
                     border-r-6 border-r-transparent 
                     border-t-6 border-t-blue-600 
                     transform -translate-x-1/2"
        ></div>
      </div>
    );
  }
  return null;
};

import { Skeleton } from "@/components/ui/skeleton";
import { usePathname } from "next/navigation";

const ChartSkeleton = () => {
  return (
    <div className="w-full h-80 flex flex-col gap-4">
      <Skeleton className="w-1/4 h-6" />
      <Skeleton className="w-full h-64" />
    </div>
  );
};

const CustomAreaChart: React.FC<{ data: SellerData[] | any; isPending: boolean }> = ({
  data,
  isPending,
}) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 2, 1),
    to: addDays(new Date(2025, 2, 1), 20),
  });
  const pathname = usePathname();
  const localeDir = pathname.split("/")[1];
  const dir = localeDir === "ar" ? "rtl" : "ltr";
  const transformedData = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.map((item) => {
      const parsedDate = item?.date ? parseISO(item.date) : null;
      const name =
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? format(parsedDate, "MMM-dd")
          : "";
      const totalSales = Number.parseFloat(String(item?.total_sales ?? "0"));
      return {
        name,
        total_sales: Number.isFinite(totalSales) ? totalSales : 0,
      };
    });
  }, [data]);

  return (
    <div dir={dir} className="w-full h-80">
      {isPending ? (
        <ChartSkeleton />
      ) : (
        <ResponsiveContainer key={dir}>
          <AreaChart
            data={transformedData}
            margin={{
              top: 10,
              right: dir === "rtl" ? 0 : 10,
              left: dir === "rtl" ? 10 : -10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4379EE29" />
                <stop offset="0%" stopColor="#4379EE29" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="total_sales"
              className="text-sm text-gray-600 dark:text-white"
              reversed={dir === "rtl"}
            />
            <YAxis
              className="text-sm text-gray-600 dark:text-white"
              orientation={dir === "rtl" ? "right" : "left"}
              tick={{
                textAnchor: dir === "rtl" ? "start" : "end",
                dx: dir === "rtl" ? 40 : 0,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total_sales"
              stroke="#C2CADB"
              strokeWidth={1.5}
              fill="url(#colorUv)"
              dot={(props) => (
                <CustomDot
                  cx={props.cx}
                  cy={props.cy}
                  index={props.index} 
                  key={props.index}
                />
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CustomAreaChart;
