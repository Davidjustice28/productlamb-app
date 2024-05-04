import React, { PureComponent } from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PLBarChartProps } from './area-chart';

export function PLBarChart({darkMode=false, data, } : PLBarChartProps) {
  const incompleteColor = darkMode ? 'black' : 'rgb(212 212 212)';
  return (
    <ResponsiveContainer height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 50, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3"opacity={darkMode ? 0.2 : 1}/>
        <XAxis dataKey="name" />
        <YAxis dataKey="total"/>
        <Bar dataKey="incomplete" fill={incompleteColor} stackId="a" />
        <Bar dataKey="completed" stroke="#F28C28" fill="#F28C28" stackId="a" opacity={0.75}/>
      </BarChart>
    </ResponsiveContainer>
  );
  
}