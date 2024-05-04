import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export type PLAreaChartProps = {
  data: Array<{name: string, taskCount: number}>,
  xKey: string,
  yKey: string,
  fill?: string,
  stroke?: string,
  opacity?: number,
  tooltip?: React.ReactNode,
  darkMode?: boolean
  [key: string]: any
};

export type PLBarChartProps = {
  data: Array<{name: string, total: number, incomplete: number, completed: number}>,
  darkMode?: boolean
};

export function PLAreaChart<T=any>(props: PLAreaChartProps) {
  // purple hex code: #8884d8
  const { data, xKey, yKey, fill='#F28C28', stroke='#F28C28', opacity=0.2, tooltip=false, darkMode=true } = props;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={darkMode ? opacity : 1}/>
        <XAxis dataKey={xKey} />
        <YAxis />
        {tooltip && <Tooltip/>}
        <Area type="monotone" dataKey={yKey} stroke={stroke} fill={fill} />
      </AreaChart>
    </ResponsiveContainer>
  );
  
}