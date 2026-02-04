"use client";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ApiDataPoint {
  month: string;
  orders: number;
  growth: number;
}


interface CustomBarChartProps {
  data: ApiDataPoint[];
  isPending: boolean;
}

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

const CustomBarChart: React.FC<CustomBarChartProps> = ({ data, isPending }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const localeDir = pathname.split("/")[1];
  const dir = localeDir === "ar" ? "rtl" : "ltr";

  const chartData = data.map((item, index) => ({
    name: item.month,
    uv: item.growth,
    pv: item.orders, 
  }));

  const CustomRectangle = (props: any) => {
    const { fill, x, y, width, height, index } = props;

    return (
      <Rectangle
        x={x}
        y={y}
        radius={8}
        width={width}
        height={height}
        fill={hoveredIndex === index ? "#3b82f6" : fill} 
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        className="pointer"
      />
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, uv, pv } = payload[0].payload; 
      return (
        <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded shadow ">
          <p className="font-semibold">{name}</p>
          <p className="">Growth: {uv}</p>
          <p className="">Orders: {pv}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div dir={dir} className="w-full h-80">
      {isPending ? (
        <ChartSkeleton />
      ) : (
        <ResponsiveContainer key={dir} width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: dir === "rtl" ? -10 : 10,
              left: dir === "rtl" ? 10 : -15,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="name"
              className="text-sm text-gray-600 dark:text-white"
              reversed={dir === "rtl"}
            />
            <YAxis
              className="text-sm text-gray-600 dark:text-white"
              orientation={dir === "rtl" ? "right" : "left"}
              tick={{
                textAnchor: dir === "rtl" ? "start" : "end",
                dx: dir === "rtl" ? 25 : 0,
              }}
            />
            <Legend />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="pv"
              fill="#DDEAFC" 
              shape={<CustomRectangle />}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CustomBarChart;
