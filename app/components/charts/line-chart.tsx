import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PLChartProps } from '~/types/component.types';

const mockData = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

export function PLLineChart({data, darkMode } : PLChartProps) {
  if (data.length < 2) {
    return <div className='dark:text-neutral-400 text-neutral-600 w-full h-full flex items-center justify-center'>Insufficient data. {!data.length ? 'Turn on a sprint generation to see analytics' : 'Chart will be available next sprint'}.</div>
  }
  return (
    <ResponsiveContainer height="100%">
      <LineChart
        // height={300}
        data={data}
        margin={{ top: 10, bottom: 0, right: 30}}
      >
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="name"/>
        <YAxis/>
        <Line type="monotone" dataKey="bugs" stroke="#ff0000" activeDot={{ r: 8 }} strokeWidth={3}/>
        <Line type="monotone" dataKey="features" stroke="#82ca9d" strokeWidth={3}/>
        <Line type="monotone" dataKey="chores" stroke="#ffc658" activeDot={{ r: 8 }} strokeWidth={3}/>
        <Line type="monotone" dataKey="others" stroke="#0000ff" strokeWidth={3}/>
      </LineChart>
    </ResponsiveContainer>
  );
  
}
