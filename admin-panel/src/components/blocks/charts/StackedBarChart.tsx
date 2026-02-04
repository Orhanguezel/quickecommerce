import {
  Tabs,
  TabsList,
  TabsTrigger
} from "@/components/ui";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface DataPoint {
  name: string;
  uv: number;
  pv: number;
  amt: number;
  as: number;
  df: number;
}

const data: DataPoint[] = [
  { name: "Page B", uv: -3000, pv: 1398, amt: 5210, as: 3400, df: 2400 },
  { name: "Page C", uv: -2000, pv: 9800, amt: 7290, as: 9400, df: 2400 },
  { name: "Page K", uv: -1890, pv: 4800, amt: 2181, as: -1400, df: -2400 },
  { name: "Page M", uv: -3490, pv: 4300, amt: 2100, as: 2400, df: 2400 },
  { name: "Page K", uv: -1890, pv: 4800, amt: 2181, as: 2400, df: 1400 },
  { name: "Page G", uv: -3490, pv: 4300, amt: 2100, as: 2400, df: 2400 },
  { name: "Page C", uv: -2000, pv: 9800, amt: 7290, as: 9400, df: 2400 },
  { name: "Page H", uv: -1890, pv: 4800, amt: 2181, as: 4400, df: 2400 },
  { name: "Page J", uv: -3490, pv: 4300, amt: 2100, as: 2400, df: 2400 },
  { name: "Page C", uv: -2000, pv: 9800, amt: 7290, as: 9400, df: 2400 },
  { name: "Page K", uv: -1890, pv: 4800, amt: 2181, as: -2400, df: -2400 },
  { name: "Page M", uv: -3490, pv: 4300, amt: 2100, as: 2400, df: 2400 },
  { name: "Page C", uv: -2000, pv: 9800, amt: 7290, as: -1400, df: -2400 },
];

const StackedBarChart: React.FC = () => {
  return (
    <div className="rounded-lg shadow-md">
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold ">Orders overview</h1>
        <Tabs defaultValue="account">
          <TabsList className="flex justify-start bg-white dark:bg-[#1f2937]">
            <TabsTrigger value="account">Monthly</TabsTrigger>
            <TabsTrigger value="password">Yearly</TabsTrigger>
          </TabsList>
          {/* <TabsContent value="account">adsf</TabsContent>
          <TabsContent value="password">asdf</TabsContent> */}
        </Tabs>
      </div>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            stackOffset="sign"
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* <ReferenceLine y={0} stroke="#000" /> */}
            <Bar dataKey="pv" stackId="a" fill="#4B5D8E" barSize={10} />
            <Bar
              dataKey="amt"
              stackId="a"
              fill="#629CF2"
              radius={[10, 10, 0, 0]}
            />
            <Bar dataKey="uv" stackId="a" fill="#F6992B" />
            <Bar dataKey="uv" stackId="a" fill="#15B39C" />
            <Bar
              dataKey="uv"
              stackId="a"
              fill="#E95147"
              radius={[10, 10, 0, 0]}
            />
            <Bar dataKey="df" stackId="b" fill="#B3B3B3" radius={[0, 0, 10, 10]} barSize={10} />
            <Bar dataKey="as" stackId="b" fill="#B3B3B3" radius={[10, 10, 0, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StackedBarChart;
