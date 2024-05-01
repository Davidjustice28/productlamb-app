import { useLoaderData } from '@remix-run/react';
import React, { PureComponent } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const mockSprintTaskTotalData: Array<{name: string, taskCount: number}> = [
  {
    name: 'Sprint 1',
    taskCount: 12,
  },
  {
    name: 'Sprint 2',
    taskCount: 20,
  },
  {
    name: 'Sprint 3',
    taskCount: 8,
  },
  {
    name: 'Sprint 4',
    taskCount: 15,
  },
  {
    name: 'Sprint 5',
    taskCount: 10,
  },
  {
    name: 'Sprint 6',
    taskCount: 12,
  },
];

export const mockSprintTaskCompletionPercentageData: Array<{name: string, percentage: number}> = [
  {
    name: 'Sprint 1',
    percentage: 92,
  },
  {
    name: 'Sprint 2',
    percentage: 85,
  },
  {
    name: 'Sprint 3',
    percentage: 100,
  },
  {
    name: 'Sprint 4',
    percentage: 78,
  },
  {
    name: 'Sprint 5',
    percentage: 55,
  },
  {
    name: 'Sprint 6',
    percentage: 30,
  },
];

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