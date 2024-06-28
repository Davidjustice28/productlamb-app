import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PLChartProps } from '~/types/component.types';

export function PLLineChart({data, darkMode } : PLChartProps) {
  if (data.length < 2) {
    return <div className='dark:text-neutral-400 text-neutral-600 w-full h-full flex items-center justify-center'>Insufficient data. {!data.length ? 'Turn on a sprint generation to see analytics' : 'Chart will be available next sprint'}.</div>
  }
  return (
    <ResponsiveContainer height="100%">
      <LineChart
        data={data.slice(0,8)}
        margin={{ top: 10, bottom: 0, right: 30}}
      >
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="name"/>
        <YAxis/>
        <Tooltip labelClassName='text-white font-semibold text-md underline' contentStyle={{backgroundColor: '#f2b949'}} />
        <Line type="monotone" dataKey="bugs" stroke="#ff0000" activeDot={{ r: 8 }} strokeWidth={3}/>
        <Line type="monotone" dataKey="features" stroke="#82ca9d" strokeWidth={3}/>
        <Line type="monotone" dataKey="chores" stroke="#ffc658" activeDot={{ r: 8 }} strokeWidth={3}/>
        <Line type="monotone" dataKey="others" stroke="#6F8FAF" strokeWidth={3}/>
      </LineChart>
    </ResponsiveContainer>
  );  
}

