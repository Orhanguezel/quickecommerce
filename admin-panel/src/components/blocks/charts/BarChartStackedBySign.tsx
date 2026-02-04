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
  YAxis,
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
  { name: "Page A", uv: 4000, pv: 2400, amt: 2400, as: 2400, df: 2400 },
  { name: "Page B", uv: 3000, pv: 1398, amt: 2210, as: 2400, df: 2400 },
  { name: "Page C", uv: 2000, pv: 1800, amt: 2290, as: 2400, df: 2400 },
  { name: "Page D", uv: 2780, pv: 3908, amt: 3000, as: 2400, df: 2400 },
  { name: "Page E", uv: 1890, pv: 4800, amt: 3181, as: 2400, df: 2400 },
  { name: "Page F", uv: 2390, pv: 3800, amt: 4500, as: 2400, df: 2400 },
  { name: "Page G", uv: 3490, pv: 4300, amt: 5100, as: 2400, df: 2400 },
  { name: "Page H", uv: 3490, pv: 4300, amt: 5100, as: 2400, df: 2400 },
  { name: "Page I", uv: 3490, pv: 4300, amt: 5100, as: 2400, df: 2400 },
  { name: "Page J", uv: 3490, pv: 4300, amt: 5100, as: 2400, df: 2400 },
  { name: "Page K", uv: 3490, pv: 4300, amt: 5100, as: 2400, df: 2400 },
  { name: "Page L", uv: 3490, pv: 4300, amt: 5100, as: 2400, df: 2400 },
  { name: "Page M", uv: 3490, pv: 4300, amt: 5100, as: 2400, df: 2400 },
];

const Example: React.FC = () => {
  return (
    <div className="rounded-lg shadow-md">
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold ">Orders overview</h1>
        <Tabs defaultValue="account" >
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
            margin={{
              top: 20,
              right: 30,
              left: 30,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[100, "dataMax + 100"]} />{" "}
            {/* Set Y-axis minimum to 100 */}
            <Tooltip />
            <Legend />
            <Bar
              dataKey="pv"
              stackId="a"
              fill="#8884d8"
              barSize={10}
              radius={[0, 0, 10, 10]}
            />
            <Bar dataKey="amt" stackId="a" fill="#82ca9d" />
            <Bar dataKey="uv" stackId="a" fill="#8ad" />
            <Bar dataKey="uv" stackId="a" fill="#8ad666" />
            <Bar dataKey="uv" stackId="a" fill="#8ad" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Example;
